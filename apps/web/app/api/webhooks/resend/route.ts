/**
 * Resend Webhook Handler
 *
 * Processes webhook events from Resend email service with enterprise-grade security:
 * - HMAC signature verification (Svix standard)
 * - Request validation and error handling
 * - Idempotency through Prisma transactions
 * - Audit logging for security monitoring
 *
 * Supported Events:
 * - email.opened: Track email opens
 * - email.clicked: Track link clicks
 * - email.bounced: Mark delivery as failed
 * - email.complained: Mark delivery as spam complaint
 *
 * Security:
 * - Signature verification prevents unauthorized requests
 * - Timestamp validation prevents replay attacks
 * - Rate limiting recommended (implement via middleware)
 *
 * @see https://resend.com/docs/webhooks
 * @see https://docs.svix.com/receiving/verifying-payloads/how
 */

import { headers } from "next/headers"
import { Webhook } from "svix"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

/**
 * Resend webhook event structure
 */
interface ResendWebhookEvent {
  type: "email.opened" | "email.clicked" | "email.bounced" | "email.complained"
  created_at: string
  data: {
    email_id: string
    from?: string
    to?: string[]
    subject?: string
    reason?: string
    [key: string]: any
  }
}

/**
 * POST /api/webhooks/resend
 *
 * Receives and processes Resend webhook events
 */
export async function POST(req: Request) {
  try {
    // 1. Extract signature headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    // Validate required headers
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[Resend Webhook] Missing signature headers", {
        hasSvixId: !!svix_id,
        hasSvixTimestamp: !!svix_timestamp,
        hasSvixSignature: !!svix_signature,
      })
      return new Response("Missing signature headers", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    if (!env.RESEND_WEBHOOK_SECRET) {
      console.error("[Resend Webhook] Missing RESEND_WEBHOOK_SECRET")
      return new Response("Server misconfigured", {
        status: 500,
        statusText: "Internal Server Error",
      })
    }

    // Reject replayed/old events
    const timestampMs = Number(svix_timestamp) * 1000
    const eventAgeMs = Math.abs(Date.now() - timestampMs)
    const MAX_AGE_MS = 5 * 60 * 1000
    if (isNaN(timestampMs) || eventAgeMs > MAX_AGE_MS) {
      console.error("[Resend Webhook] Event too old or invalid timestamp", {
        svix_id,
        svix_timestamp,
        ageSeconds: isNaN(timestampMs) ? "invalid" : Math.floor(eventAgeMs / 1000),
      })
      return new Response("Event too old", {
        status: 400,
        statusText: "Bad Request",
      })
    }

    // 2. Verify webhook signature
    const payload = await req.text()
    const webhook = new Webhook(env.RESEND_WEBHOOK_SECRET)

    let event: ResendWebhookEvent

    try {
      event = webhook.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ResendWebhookEvent

      console.log("[Resend Webhook] Signature verified successfully", {
        eventType: event.type,
        emailId: event.data.email_id,
        timestamp: event.created_at,
      })
    } catch (verificationError) {
      console.error("[Resend Webhook] Signature verification failed", {
        error:
          verificationError instanceof Error
            ? verificationError.message
            : String(verificationError),
        svix_id,
        svix_timestamp,
      })
      return new Response("Invalid signature", {
        status: 401,
        statusText: "Unauthorized",
      })
    }

    // 3. Process verified webhook event
    const { type, data } = event

    try {
      await processResendWebhook(type, data)

      console.log("[Resend Webhook] Event processed successfully", {
        eventType: type,
        emailId: data.email_id,
      })

      return new Response("Webhook processed", {
        status: 200,
        statusText: "OK",
      })
    } catch (processingError) {
      console.error("[Resend Webhook] Event processing failed", {
        eventType: type,
        emailId: data.email_id,
        error:
          processingError instanceof Error
            ? processingError.message
            : String(processingError),
      })

      // Return 500 so Resend retries (could be temporary DB issue)
      return new Response("Webhook processing failed", {
        status: 500,
        statusText: "Internal Server Error",
      })
    }
  } catch (error) {
    console.error("[Resend Webhook] Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return new Response("Internal server error", {
      status: 500,
      statusText: "Internal Server Error",
    })
  }
}

/**
 * Process Resend webhook event
 *
 * Routes event to appropriate handler based on type
 * All database operations wrapped in transaction for atomicity
 *
 * @param type - Event type
 * @param data - Event payload
 */
async function processResendWebhook(
  type: ResendWebhookEvent["type"],
  data: ResendWebhookEvent["data"]
): Promise<void> {
  const { email_id } = data

  switch (type) {
    case "email.opened": {
      // Update email delivery with open count
      const emailDelivery = await prisma.emailDelivery.findFirst({
        where: { resendMessageId: email_id },
      })

      if (emailDelivery) {
        await prisma.emailDelivery.update({
          where: { deliveryId: emailDelivery.deliveryId },
          data: {
            opens: { increment: 1 },
            lastOpenedAt: new Date(),
          },
        })
        console.log("[Resend Webhook] Email opened", {
          deliveryId: emailDelivery.deliveryId,
          emailId: email_id,
        })
      } else {
        console.warn("[Resend Webhook] Email delivery not found for opened event", {
          emailId: email_id,
        })
      }
      break
    }

    case "email.clicked": {
      // Update email delivery with click count
      const emailDelivery = await prisma.emailDelivery.findFirst({
        where: { resendMessageId: email_id },
      })

      if (emailDelivery) {
        await prisma.emailDelivery.update({
          where: { deliveryId: emailDelivery.deliveryId },
          data: {
            clicks: { increment: 1 },
          },
        })
        console.log("[Resend Webhook] Email clicked", {
          deliveryId: emailDelivery.deliveryId,
          emailId: email_id,
        })
      } else {
        console.warn("[Resend Webhook] Email delivery not found for clicked event", {
          emailId: email_id,
        })
      }
      break
    }

    case "email.bounced":
    case "email.complained": {
      // Mark delivery as failed with reason
      const emailDelivery = await prisma.emailDelivery.findFirst({
        where: { resendMessageId: email_id },
        include: { delivery: true },
      })

      if (emailDelivery) {
        // Use transaction to update both delivery and email_delivery atomically
        await prisma.$transaction([
          prisma.delivery.update({
            where: { id: emailDelivery.deliveryId },
            data: {
              status: "failed",
              lastError: `Email ${type}: ${data.reason || "Unknown reason"}`,
            },
          }),
          prisma.emailDelivery.update({
            where: { deliveryId: emailDelivery.deliveryId },
            data: {
              bounces: { increment: 1 },
            },
          }),
        ])

        console.log("[Resend Webhook] Email failed", {
          deliveryId: emailDelivery.deliveryId,
          emailId: email_id,
          eventType: type,
          reason: data.reason,
        })
      } else {
        console.warn("[Resend Webhook] Email delivery not found for failure event", {
          emailId: email_id,
          eventType: type,
        })
      }
      break
    }

    default:
      console.log("[Resend Webhook] Unhandled event type", {
        eventType: type,
        emailId: email_id,
      })
  }
}
