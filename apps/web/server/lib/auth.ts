import { auth as clerkAuth } from "@clerk/nextjs/server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { prisma } from "./db"
import { getClerkClient } from "./clerk"
import { env } from "@/env.mjs"
import { getDetectedTimezoneFromMetadata, isValidTimezone } from "@dearme/types"

/**
 * Get current user with auto-sync fallback
 *
 * This implements a hybrid approach:
 * 1. Webhooks handle user creation in real-time (primary)
 * 2. This function auto-creates missing users (fallback)
 *
 * This makes the system resilient to:
 * - Webhook endpoint being down during signup
 * - Webhooks not configured in development
 * - Users created before webhook setup
 */
export async function getCurrentUser() {
  let clerkUserId: string | null = null

  try {
    const authResult = await clerkAuth()
    clerkUserId = authResult.userId
  } catch (error) {
    console.error("[Auth] Failed to read Clerk auth state", error)
    return null
  }

  if (!clerkUserId) {
    console.debug("[Auth] No active Clerk session found")
    return null
  }

  let user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      profile: true,
    },
  })

  // Self-healing: If user doesn't exist in DB, create them
  const autoProvisionEnabled = env.CLERK_AUTO_PROVISION_ENABLED !== "false"

  if (!user) {
    if (!autoProvisionEnabled) {
      console.warn(`[Auth] Auto-provision disabled; user ${clerkUserId} missing locally`)
      return null
    }

    console.log(`[Auth] User ${clerkUserId} not found in DB, auto-syncing...`)

    try {
      // Fetch user details from Clerk
      const clerk = getClerkClient()
      const clerkUser = await clerk.users.getUser(clerkUserId)

      const email = clerkUser.emailAddresses.find(
        e => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress

      if (!email) {
        console.error(`[Auth] No email found for Clerk user ${clerkUserId}`)
        return null
      }

      // Extract detected timezone from Clerk metadata (set by TimezoneDetector component)
      const detectedTimezone = getDetectedTimezoneFromMetadata(clerkUser.unsafeMetadata)
      const timezone =
        detectedTimezone && isValidTimezone(detectedTimezone)
          ? detectedTimezone
          : "UTC" // Fallback only if detection failed

      console.log(`[Auth] Auto-provisioning user with timezone: ${timezone}`, {
        detected: detectedTimezone,
        usingFallback: !detectedTimezone,
      })

      // Use findFirst + create pattern with retry to handle race conditions
      // This is more reliable than instanceof checks across module boundaries
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          // Try to create user
          user = await prisma.user.create({
            data: {
              clerkUserId,
              email,
              profile: {
                create: {
                  // Use detected timezone or UTC fallback
                  timezone,
                },
              },
            },
            include: {
              profile: true,
            },
          })

          console.log(`[Auth] ✅ Auto-synced user: ${email}`)
          break
        } catch (createError: any) {
          // Check if it's a unique constraint violation
          if (createError?.code === 'P2002') {
            attempts++
            console.log(`[Auth] 🔄 Race condition detected (attempt ${attempts}/${maxAttempts}), retrying...`)

            // Small delay to ensure the other transaction committed
            await new Promise(resolve => setTimeout(resolve, 50 * attempts))

            // Try to fetch the user that was created by another request
            user = await prisma.user.findUnique({
              where: { clerkUserId },
              include: {
                profile: true,
              },
            })

            if (user) {
              console.log(`[Auth] ✅ Found user created by concurrent request: ${user.email}`)
              break
            }

            // If still not found and we have attempts left, try again
            if (attempts < maxAttempts) {
              continue
            } else {
              console.error(`[Auth] ❌ Failed to create or find user after ${maxAttempts} attempts`)
              return null
            }
          } else {
            // Different error, not a race condition
            throw createError
          }
        }
      }
    } catch (error) {
      console.error(`[Auth] ❌ Failed to auto-sync user ${clerkUserId}:`, error)
      return null
    }
  }

  // Auto-link pending subscription if user was just created
  if (user && !user.profile?.stripeCustomerId) {
    // Check for pending subscription
    const pending = await prisma.pendingSubscription.findFirst({
      where: {
        email: user.email,
        status: "payment_complete",
        linkedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (pending) {
      console.log(`[Auth] 🔗 Found pending subscription for ${user.email}, auto-linking...`)

      try {
        // Import the linking function dynamically to avoid circular dependencies
        const { linkPendingSubscription } = await import("../../app/[locale]/subscribe/actions")
        const result = await linkPendingSubscription(user.id)

        if (result.success) {
          console.log(`[Auth] ✅ Successfully auto-linked subscription: ${result.subscriptionId}`)

          // Refresh user data to include the new subscription
          user = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              profile: true,
            },
          })
        } else {
          console.error(`[Auth] ❌ Failed to auto-link subscription:`, result.error)
        }
      } catch (linkError) {
        console.error(`[Auth] ❌ Error during subscription auto-linking:`, linkError)
      }
    }
  }

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}
