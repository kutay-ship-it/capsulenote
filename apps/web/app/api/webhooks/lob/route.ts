/**
 * Lob Webhook Handler
 *
 * Processes webhook events from Lob Print & Mail API for tracking updates:
 * - letter.in_transit: Mail has entered USPS mail stream
 * - letter.in_local_area: Mail is in recipient's local area
 * - letter.processed_for_delivery: Out for delivery
 * - letter.delivered: Successfully delivered
 * - letter.returned_to_sender: Undeliverable, returned
 *
 * Security:
 * - HMAC-SHA256 signature verification (when LOB_WEBHOOK_SECRET is set)
 * - Rate limiting to prevent abuse
 * - Timestamp validation prevents replay attacks
 *
 * @see https://docs.lob.com/#tag/Webhooks
 */

import { headers } from "next/headers"
import { createHmac } from "crypto"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"
import { ratelimit } from "@/server/lib/redis"

/**
 * Lob webhook event structure
 */
interface LobWebhookEvent {
  id: string
  event_type: {
    id: string
    enabled_for_test: boolean
    resource: string
    object: string
  }
  date_created: string
  reference_id: string // The letter ID (ltr_xxx)
  body: {
    id: string
    description?: string
    expected_delivery_date?: string
    date_created: string
    date_modified: string
    send_date?: string
    carrier?: string
    tracking_number?: string
    tracking_events?: Array<{
      id: string
      type: string
      name: string
      time: string
      date_created: string
      date_modified: string
      location?: string
    }>
    [key: string]: unknown
  }
}

/**
 * Map Lob event types to tracking status
 */
const EVENT_TO_STATUS: Record<string, string> = {
  "letter.created": "created",
  "letter.rendered_pdf": "rendered",
  "letter.rendered_thumbnails": "rendered",
  "letter.mailed": "mailed",
  "letter.in_transit": "in_transit",
  "letter.in_local_area": "in_local_area",
  "letter.processed_for_delivery": "out_for_delivery",
  "letter.delivered": "delivered",
  "letter.returned_to_sender": "returned",
  "letter.failed": "failed",
}

/**
 * Verify Lob webhook signature
 *
 * Lob uses HMAC-SHA256 with format: t={timestamp},v1={signature}
 * Signature is computed over: {timestamp}.{payload}
 */
function verifyLobSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): { valid: boolean; timestamp?: number; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: "Missing signature header" }
  }

  try {
    // Parse header: t=1234567890,v1=abc123...
    const parts = signatureHeader
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
    const timestampPart = parts.find((p) => p.startsWith("t="))
    const signaturePart = parts.find((p) => p.startsWith("v1="))

    if (!timestampPart || !signaturePart) {
      return { valid: false, error: "Invalid signature format" }
    }

    const timestamp = parseInt(timestampPart.substring(2), 10)
    const providedSignature = signaturePart.substring(3)

    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: "Timestamp too old", timestamp }
    }

    // Compute expected signature: HMAC-SHA256({timestamp}.{payload}, secret)
    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex")

    // Constant-time comparison
    if (expectedSignature.length !== providedSignature.length) {
      return { valid: false, error: "Signature length mismatch", timestamp }
    }

    let result = 0
    for (let i = 0; i < expectedSignature.length; i++) {
      result |= expectedSignature.charCodeAt(i) ^ providedSignature.charCodeAt(i)
    }

    return { valid: result === 0, timestamp }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Signature parsing error",
    }
  }
}

/**
 * POST /api/webhooks/lob
 *
 * Receives and processes Lob webhook events for mail tracking
 */
export async function POST(req: Request) {
  try {
    // 1. Rate limit by IP
    const headerPayload = await headers()
    const ip = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { success: rateLimitOk } = await ratelimit.webhook.lob.limit(ip)

    if (!rateLimitOk) {
      console.warn("[Lob Webhook] Rate limit exceeded", { ip })
      return new Response("Rate limit exceeded", { status: 429 })
    }

    // 2. Get raw payload for signature verification
    const payload = await req.text()
    const signatureHeader = headerPayload.get("lob-signature")

    // 3. Verify signature if secret is configured
    if (env.LOB_WEBHOOK_SECRET) {
      const verification = verifyLobSignature(payload, signatureHeader, env.LOB_WEBHOOK_SECRET)

      if (!verification.valid) {
        console.error("[Lob Webhook] Signature verification failed", {
          error: verification.error,
          hasSignature: !!signatureHeader,
        })
        return new Response("Invalid signature", { status: 401 })
      }

      console.log("[Lob Webhook] Signature verified", { timestamp: verification.timestamp })
    } else {
      console.warn("[Lob Webhook] No webhook secret configured, skipping signature verification")
    }

    // 4. Parse event
    let event: LobWebhookEvent
    try {
      event = JSON.parse(payload)
    } catch (parseError) {
      console.error("[Lob Webhook] Failed to parse payload", {
        error: parseError instanceof Error ? parseError.message : String(parseError),
      })
      return new Response("Invalid JSON", { status: 400 })
    }

    const eventType = event.event_type?.id || "unknown"
    const letterId = event.reference_id || event.body?.id

    console.log("[Lob Webhook] Received event", {
      eventId: event.id,
      eventType,
      letterId,
      dateCreated: event.date_created,
    })

    // 5. Process the event
    try {
      await processLobWebhook(eventType, letterId, event)

      console.log("[Lob Webhook] Event processed successfully", {
        eventType,
        letterId,
      })

      return new Response("OK", { status: 200 })
    } catch (processingError) {
      console.error("[Lob Webhook] Event processing failed", {
        eventType,
        letterId,
        error: processingError instanceof Error ? processingError.message : String(processingError),
      })

      // Return 500 so Lob retries
      return new Response("Processing failed", { status: 500 })
    }
  } catch (error) {
    console.error("[Lob Webhook] Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return new Response("Internal server error", { status: 500 })
  }
}

/**
 * Process Lob webhook event
 *
 * Updates MailDelivery tracking status and Delivery status based on event type
 */
async function processLobWebhook(
  eventType: string,
  letterId: string,
  event: LobWebhookEvent
): Promise<void> {
  // Find the mail delivery by Lob job ID
  const mailDelivery = await prisma.mailDelivery.findFirst({
    where: { lobJobId: letterId },
    include: { delivery: true },
  })

  if (!mailDelivery) {
    console.warn("[Lob Webhook] Mail delivery not found", { letterId })
    // Not an error - might be for a letter we didn't create
    return
  }

  const trackingStatus = EVENT_TO_STATUS[eventType] || eventType
  const deliveryId = mailDelivery.deliveryId

  console.log("[Lob Webhook] Updating delivery", {
    deliveryId,
    letterId,
    eventType,
    trackingStatus,
    previousStatus: mailDelivery.trackingStatus,
  })

  // Determine if we should update the main Delivery status
  let deliveryStatus: "sent" | "failed" | undefined
  let lastError: string | undefined

  switch (eventType) {
    case "letter.delivered":
      // Mark as definitively sent/delivered
      deliveryStatus = "sent"
      break
    case "letter.returned_to_sender":
      deliveryStatus = "failed"
      lastError = "Mail returned to sender - address may be undeliverable"
      break
    case "letter.failed":
      deliveryStatus = "failed"
      lastError = "Mail delivery failed"
      break
  }

  // Update in transaction
  await prisma.$transaction(async (tx) => {
    // Update mail delivery tracking status
    await tx.mailDelivery.update({
      where: { deliveryId },
      data: {
        trackingStatus,
        previewUrl: event.body?.url as string | undefined,
      },
    })

    // Update main delivery status if terminal event
    if (deliveryStatus) {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: deliveryStatus,
          lastError,
          updatedAt: new Date(),
        },
      })
    }

    // Log audit event
    console.log("[Lob Webhook] Database updated", {
      deliveryId,
      trackingStatus,
      deliveryStatus,
      lastError,
    })
  })
}
