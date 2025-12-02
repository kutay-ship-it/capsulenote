/**
 * Retry Stripe Webhook Handler (Inngest Function)
 *
 * Processes webhooks that were re-queued by the backstop reconciler.
 * Separate from primary handler to:
 * - Have different retry policy (fewer retries)
 * - Skip idempotency claim (already claimed)
 * - Include retry-specific logging and metrics
 *
 * @see apps/web/app/api/cron/reconcile-webhooks/route.ts
 */

import { inngest } from "../../client"
import { prisma } from "@dearme/prisma"
import Stripe from "stripe"
import { routeWebhookEvent } from "./process-stripe-webhook"

/**
 * Retry webhook processor function
 *
 * Triggered by backstop reconciler for stuck events
 */
export const retryStripeWebhook = inngest.createFunction(
  {
    id: "retry-stripe-webhook",
    name: "Retry Stripe Webhook",
    retries: 2, // Fewer retries for reconciled events (already failed once)
    onFailure: async ({ event, error }) => {
      // Cast through unknown as the event payload shape differs in onFailure context
      const webhookEventId = (event.data as unknown as { webhookEventId: string })?.webhookEventId

      console.error("[Webhook Retry] Retry failed after attempts exhausted", {
        webhookEventId,
        error: error.message,
        stack: error.stack,
      })

      // Mark as FAILED in database
      if (webhookEventId) {
        try {
          await prisma.webhookEvent.update({
            where: { id: webhookEventId },
            data: {
              status: "FAILED",
              error: `Retry failed: ${error.message}`,
            },
          })

          console.log("[Webhook Retry] Event marked as FAILED", {
            webhookEventId,
          })
        } catch (updateError) {
          console.error("[Webhook Retry] Failed to mark event as FAILED", {
            webhookEventId,
            error: updateError instanceof Error ? updateError.message : String(updateError),
          })
        }
      }
    },
  },
  { event: "stripe/webhook.retry" },
  async ({ event, step }) => {
    const stripeEvent = event.data.event as Stripe.Event
    const webhookEventId = event.data.webhookEventId as string
    const retryCount = event.data.retryCount as number

    console.log("[Webhook Retry] Processing stuck webhook", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      webhookEventId,
      retryCount,
    })

    // Step 1: Verify still needs processing (not completed by another process)
    const existing = await step.run("verify-needs-retry", async () => {
      return prisma.webhookEvent.findUnique({
        where: { id: webhookEventId },
        select: { status: true },
      })
    })

    if (!existing) {
      console.warn("[Webhook Retry] WebhookEvent record not found", {
        webhookEventId,
      })
      return { skipped: true, reason: "record_not_found" }
    }

    if (existing.status === "COMPLETED") {
      console.log("[Webhook Retry] Already completed by another process", {
        webhookEventId,
      })
      return { skipped: true, reason: "already_completed" }
    }

    if (existing.status === "FAILED") {
      console.log("[Webhook Retry] Already marked as failed", {
        webhookEventId,
      })
      return { skipped: true, reason: "already_failed" }
    }

    // Step 2: Process event (same handler as primary)
    await step.run("process-event", async () => {
      await routeWebhookEvent(stripeEvent)

      console.log("[Webhook Retry] Event processed", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
      })
    })

    // Step 3: Mark complete
    await step.run("mark-complete", async () => {
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      })

      console.log("[Webhook Retry] Event marked complete", {
        webhookEventId,
        retryCount,
      })
    })

    return {
      success: true,
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      retryCount,
    }
  }
)
