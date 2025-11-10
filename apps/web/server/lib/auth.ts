import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "./db"

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
  const { userId: clerkUserId } = await clerkAuth()

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
  if (!user) {
    console.log(`[Auth] User ${clerkUserId} not found in DB, auto-syncing...`)

    try {
      // Fetch user details from Clerk
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(clerkUserId)

      const email = clerkUser.emailAddresses.find(
        e => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress

      if (!email) {
        console.error(`[Auth] No email found for Clerk user ${clerkUserId}`)
        return null
      }

      // Create user with profile
      user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          profile: {
            create: {
              timezone: "UTC", // User can update in settings
            },
          },
        },
        include: {
          profile: true,
        },
      })

      console.log(`[Auth] Auto-synced user: ${email}`)
    } catch (error) {
      console.error(`[Auth] Failed to auto-sync user ${clerkUserId}:`, error)
      return null
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
