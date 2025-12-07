/**
 * Stripe Webhook Handler (Async via Inngest)
 *
 * Security Architecture:
 * 1. Signature verification (prevents forgery)
 * 2. Event age validation (rejects >5min old events)
 * 3. Async processing via Inngest (fast response to Stripe)
 *
 * Design Philosophy:
 * - Minimal processing in this endpoint (<100ms)
 * - Queue to Inngest immediately
 * - Return 200 to Stripe (<500ms response time SLO)
 * - Let Inngest handle retries, idempotency, and failures
 *
 * @see workers/inngest/functions/billing/process-stripe-webhook.ts
 */

import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/server/providers/stripe/client"
import { env } from "@/env.mjs"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { ratelimit } from "@/server/lib/redis"

export async function POST(req: Request) {
  // Rate limit by IP
  const headerPayload = await headers()
  const ip = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { success: rateLimitOk } = await ratelimit.webhook.stripe.limit(ip)

  if (!rateLimitOk) {
    console.warn("[Stripe Webhook] Rate limit exceeded", { ip })
    return new Response("Rate limit exceeded", { status: 429 })
  }

  const body = await req.text()
  const signature = headerPayload.get("stripe-signature")

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header")
    return new Response("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  // 1. Verify Stripe signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const error = err as Error
    console.error("[Stripe Webhook] Signature verification failed:", {
      error: error.message,
      signature: signature.substring(0, 20) + "...", // Log partial signature for debugging
    })
    return new Response("Invalid signature", { status: 400 })
  }

  // Validate event age (prevent replay attacks)
  const eventAgeMs = Math.abs(Date.now() - (event.created * 1000))
  const MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes

  if (eventAgeMs > MAX_AGE_MS) {
    console.error("[Stripe Webhook] Event too old, rejecting", {
      eventId: event.id,
      eventType: event.type,
      ageSeconds: Math.floor(eventAgeMs / 1000),
    })
    return new Response("Event too old", { status: 400 })
  }

  // 2. Queue to Inngest for async processing
  try {
    await triggerInngestEvent("stripe/webhook.received", { event })

    console.log("[Stripe Webhook] Event queued successfully", {
      eventId: event.id,
      eventType: event.type,
      age: Math.floor(eventAgeMs / 1000) + "s",
    })

    // 4. Return 200 immediately (don't block Stripe)
    return new Response("Webhook queued", { status: 200 })
  } catch (error) {
    const err = error as Error
    console.error("[Stripe Webhook] Failed to queue event to Inngest", {
      eventId: event.id,
      eventType: event.type,
      error: err.message,
      stack: err.stack,
    })

    // Return 500 so Stripe retries
    return new Response("Failed to queue webhook", { status: 500 })
  }
}
