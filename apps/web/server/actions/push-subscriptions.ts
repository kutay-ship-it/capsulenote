"use server"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"
import { getFeatureFlag } from "@/server/lib/feature-flags"

/**
 * Check if push notifications feature is enabled
 */
export async function isPushNotificationsEnabled(): Promise<boolean> {
  return getFeatureFlag("enable-push-notifications")
}

// VAPID public key for push notifications
export async function getVapidPublicKey(): Promise<string | null> {
  // Check feature flag first
  const enabled = await isPushNotificationsEnabled()
  if (!enabled) {
    return null
  }
  // Return the VAPID public key for client-side subscription
  return env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

// Subscribe to push notifications
export async function subscribeToPush(
  subscription: PushSubscriptionJSON
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check feature flag first
    const enabled = await isPushNotificationsEnabled()
    if (!enabled) {
      return { success: false, error: "Push notifications are not available" }
    }

    const user = await requireUser()

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return { success: false, error: "Invalid subscription data" }
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    })

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          lastUsedAt: new Date(),
        },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: null, // Can be captured from request headers
          isActive: true,
        },
      })
    }

    // Update user profile to enable push notifications
    await prisma.profile.update({
      where: { userId: user.id },
      data: { pushEnabled: true },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to subscribe to push:", error)
    return { success: false, error: "Failed to save subscription" }
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()

    // Deactivate the subscription
    await prisma.pushSubscription.updateMany({
      where: {
        userId: user.id,
        endpoint: endpoint,
      },
      data: {
        isActive: false,
      },
    })

    // Check if user has any active subscriptions left
    const activeCount = await prisma.pushSubscription.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    })

    // If no active subscriptions, disable push in profile
    if (activeCount === 0) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { pushEnabled: false },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to unsubscribe from push:", error)
    return { success: false, error: "Failed to remove subscription" }
  }
}

// Get current push subscription status
export async function getPushStatus(): Promise<{
  enabled: boolean
  subscriptionCount: number
}> {
  try {
    const user = await requireUser()

    const [profile, subscriptionCount] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
        select: { pushEnabled: true },
      }),
      prisma.pushSubscription.count({
        where: {
          userId: user.id,
          isActive: true,
        },
      }),
    ])

    return {
      enabled: profile?.pushEnabled ?? false,
      subscriptionCount,
    }
  } catch (error) {
    console.error("Failed to get push status:", error)
    return { enabled: false, subscriptionCount: 0 }
  }
}

// Cleanup expired/invalid subscriptions
export async function cleanupInvalidSubscriptions(): Promise<number> {
  // This would be called by a cron job to remove subscriptions
  // that have had too many failed delivery attempts
  const result = await prisma.pushSubscription.deleteMany({
    where: {
      isActive: false,
      lastUsedAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    },
  })

  return result.count
}
