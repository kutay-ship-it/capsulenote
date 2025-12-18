import { auth as clerkAuth } from "@clerk/nextjs/server"
import { prisma } from "./db"
import { getClerkClient } from "./clerk"
import { env } from "@/env.mjs"
import { getDetectedTimezoneFromMetadata, isValidTimezone } from "@dearme/types"
import { logger } from "./logger"

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
    await logger.error("[Auth] Failed to read Clerk auth state", error)
    return null
  }

  if (!clerkUserId) {
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
      await logger.warn("[Auth] Auto-provision disabled; user missing locally", { clerkUserId })
      return null
    }

    await logger.info("[Auth] User not found in DB, auto-syncing...", { clerkUserId })

    try {
      // Fetch user details from Clerk
      const clerk = getClerkClient()
      const clerkUser = await clerk.users.getUser(clerkUserId)

      const email = clerkUser.emailAddresses.find(
        e => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress

      if (!email) {
        await logger.error("[Auth] No email found for Clerk user", undefined, { clerkUserId })
        return null
      }

      // Extract detected timezone from Clerk metadata (set client-side)
      const detectedTimezone = getDetectedTimezoneFromMetadata(clerkUser.unsafeMetadata)
      const timezone =
        detectedTimezone && isValidTimezone(detectedTimezone)
          ? detectedTimezone
          : "UTC" // Fallback only if detection failed

      await logger.info("[Auth] Auto-provisioning user", {
        clerkUserId,
        timezone,
        detected: detectedTimezone || "none",
        usingFallback: !detectedTimezone,
      })

      // Use upsert to atomically handle race conditions
      // This is cleaner than retry loops and handles concurrent requests safely
      user = await prisma.user.upsert({
        where: { clerkUserId },
        create: {
          clerkUserId,
          email,
          profile: {
            create: {
              timezone,
            },
          },
        },
        update: {}, // No-op if user already exists (created by concurrent request)
        include: {
          profile: true,
        },
      })

      await logger.info("[Auth] Auto-synced user", { email, userId: user.id })
    } catch (error) {
      await logger.error("[Auth] Failed to auto-sync user", error, { clerkUserId })
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
      const currentUserId = user.id // Capture before potential reassignment
      await logger.info("[Auth] Found pending subscription, auto-linking...", {
        email: user.email,
        pendingId: pending.id,
      })

      try {
        // Import the linking function dynamically to avoid circular dependencies
        const { linkPendingSubscription } = await import("../../app/[locale]/subscribe/actions")
        const result = await linkPendingSubscription(currentUserId)

        if (result.success) {
          await logger.info("[Auth] Successfully auto-linked subscription", {
            subscriptionId: result.subscriptionId,
            userId: currentUserId,
          })

          // Refresh user data to include the new subscription
          user = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: {
              profile: true,
            },
          })
        } else {
          await logger.error("[Auth] Failed to auto-link subscription", undefined, {
            error: result.error,
            userId: currentUserId,
          })
        }
      } catch (linkError) {
        await logger.error("[Auth] Error during subscription auto-linking", linkError, {
          userId: currentUserId,
        })
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
