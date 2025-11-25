import webpush from "web-push"
import { env } from "@/env.mjs"
import { prisma } from "@/server/lib/db"
import { getFeatureFlag } from "@/server/lib/feature-flags"

// Initialize web-push with VAPID details
if (env.VAPID_PRIVATE_KEY && env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    `mailto:${env.VAPID_MAILTO || "support@capsulenote.com"}`,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  )
}

/**
 * Check if push notifications are enabled via feature flag
 */
export async function isPushEnabled(): Promise<boolean> {
  return getFeatureFlag("enable-push-notifications")
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  deliveryId?: string
  letterId?: string
  tag?: string
  requireInteraction?: boolean
  renotify?: boolean
  actions?: Array<{ action: string; title: string }>
}

export interface SendPushResult {
  success: boolean
  sent: number
  failed: number
  errors?: string[]
}

// Send push notification to a specific user
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<SendPushResult> {
  // Check feature flag first
  const enabled = await isPushEnabled()
  if (!enabled) {
    return { success: false, sent: 0, failed: 0, errors: ["Push notifications disabled via feature flag"] }
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId,
      isActive: true,
    },
  })

  if (subscriptions.length === 0) {
    return { success: false, sent: 0, failed: 0, errors: ["No active subscriptions"] }
  }

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const sub of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      await webpush.sendNotification(pushSubscription, JSON.stringify(payload))

      // Update last used timestamp
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastUsedAt: new Date() },
      })

      sent++
    } catch (error: unknown) {
      failed++
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`Subscription ${sub.id}: ${errorMessage}`)

      // If subscription is expired/invalid, mark it as inactive
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("410") ||
        errorMessage.includes("404")
      ) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { isActive: false },
        })
      }
    }
  }

  return {
    success: sent > 0,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

// Send delivery completion notification
export async function sendDeliveryCompletedNotification(
  userId: string,
  options: {
    deliveryId: string
    letterId: string
    letterTitle: string
    channel: "email" | "mail"
    recipientEmail?: string
  }
): Promise<SendPushResult> {
  const channelLabel = options.channel === "email" ? "email" : "letter"

  const payload: PushPayload = {
    title: "Letter Delivered!",
    body: `Your ${channelLabel} "${options.letterTitle}" has been delivered.`,
    url: `/letters/${options.letterId}`,
    deliveryId: options.deliveryId,
    letterId: options.letterId,
    tag: `delivery-${options.deliveryId}`,
    requireInteraction: false,
    actions: [
      { action: "view", title: "View Letter" },
      { action: "dismiss", title: "Dismiss" },
    ],
  }

  return sendPushToUser(userId, payload)
}

// Send delivery failed notification
export async function sendDeliveryFailedNotification(
  userId: string,
  options: {
    deliveryId: string
    letterId: string
    letterTitle: string
    reason?: string
  }
): Promise<SendPushResult> {
  const payload: PushPayload = {
    title: "Delivery Failed",
    body: `Your letter "${options.letterTitle}" could not be delivered. ${options.reason || "Please check your settings."}`,
    url: `/letters/${options.letterId}`,
    deliveryId: options.deliveryId,
    letterId: options.letterId,
    tag: `delivery-failed-${options.deliveryId}`,
    requireInteraction: true,
    actions: [
      { action: "view", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
  }

  return sendPushToUser(userId, payload)
}
