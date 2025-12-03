/**
 * Main Stripe Webhook Processor (Inngest Function)
 *
 * Enterprise-grade webhook processing with:
 * - Idempotency (webhook_events table)
 * - Comprehensive error handling
 * - Dead letter queue (failed_webhooks table)
 * - 18+ event handlers
 * - Retry logic (3 attempts)
 *
 * @see apps/web/app/api/webhooks/stripe/route.ts
 */

import { inngest } from "../../client"
import { NonRetriableError } from "inngest"
import { prisma } from "@dearme/prisma"
import Stripe from "stripe"
import {
  handleCustomerCreated,
  handleCustomerUpdated,
  handleCustomerDeleted,
  handleSubscriptionCreatedOrUpdated,
  handleSubscriptionDeleted,
  handleSubscriptionTrialWillEnd,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCheckoutCompleted,
  handleCheckoutExpired,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeRefunded,
  handlePaymentMethodAttached,
  handlePaymentMethodDetached,
} from "./handlers"

/**
 * Route webhook event to appropriate handler
 *
 * Exported for use by retry-stripe-webhook.ts
 *
 * @param event - Stripe Event object
 */
export async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log("[Webhook Processor] Routing event", {
    eventId: event.id,
    eventType: event.type,
  })

  switch (event.type) {
    // Customer events
    case "customer.created":
      await handleCustomerCreated(event.data.object as Stripe.Customer)
      break

    case "customer.updated":
      await handleCustomerUpdated(event.data.object as Stripe.Customer)
      break

    case "customer.deleted":
      await handleCustomerDeleted(event.data.object as Stripe.Customer)
      break

    // Subscription events
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription)
      break

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case "customer.subscription.trial_will_end":
      await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription)
      break

    case "customer.subscription.paused":
      await handleSubscriptionPaused(event.data.object as Stripe.Subscription)
      break

    case "customer.subscription.resumed":
      await handleSubscriptionResumed(event.data.object as Stripe.Subscription)
      break

    // Invoice events
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    // Checkout events
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
      break

    // Payment events
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
      break

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
      break

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge)
      break

    case "payment_method.attached":
      await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
      break

    case "payment_method.detached":
      await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
      break

    default:
      console.log("[Webhook Processor] Unhandled event type", {
        eventId: event.id,
        eventType: event.type,
      })
  }
}

/**
 * Main webhook processor function
 */
export const processStripeWebhook = inngest.createFunction(
  {
    id: "process-stripe-webhook",
    name: "Process Stripe Webhook",
    retries: 3, // Retry up to 3 times on failure
    onFailure: async ({ event, error }) => {
      // Check if this is an idempotency deduplication (expected behavior, not a real failure)
      // NonRetriableError for duplicates should NOT trigger DLQ or alerts
      if (
        error.message?.includes("already processed - duplicate delivery detected") ||
        error.message?.includes("backstop will retry")
      ) {
        console.log("[Webhook Processor] Expected deduplication, not a real failure", {
          eventId: event.data?.event?.id,
          message: error.message,
        })
        return // Exit early - this is expected behavior, not a failure
      }

      // Cast through unknown as the event payload shape differs from Stripe.Event
      const stripeEvent = (event.data as unknown as { event: Stripe.Event }).event

      console.error("[Webhook Processor] Processing failed after 3 retries", {
        eventId: stripeEvent?.id,
        eventType: stripeEvent?.type,
        error: error.message,
        stack: error.stack,
      })

      // Mark webhook event as FAILED in the database
      try {
        await prisma.webhookEvent.updateMany({
          where: {
            id: stripeEvent?.id,
            status: "CLAIMED",
          },
          data: {
            status: "FAILED",
            error: `${error.message}\n\nStack:\n${error.stack}`,
          },
        })
      } catch (updateError) {
        console.error("[Webhook Processor] Failed to mark webhook as FAILED", {
          eventId: stripeEvent?.id,
          error: updateError instanceof Error ? updateError.message : String(updateError),
        })
      }

      // Move to dead letter queue (only for real failures)
      try {
        await prisma.failedWebhook.create({
          data: {
            eventId: stripeEvent?.id ?? "unknown",
            eventType: stripeEvent?.type ?? "unknown",
            payload: stripeEvent as any,
            error: `${error.message}\n\nStack:\n${error.stack}`,
          },
        })

        console.log("[Webhook Processor] Event moved to DLQ", {
          eventId: stripeEvent?.id,
          eventType: stripeEvent?.type,
        })

        // TODO: Alert engineering team via Slack/email
        // await sendSlackAlert({
        //   channel: '#billing-alerts',
        //   message: `Webhook processing failed after 3 retries`,
        //   details: {
        //     eventId: stripeEvent.id,
        //     eventType: stripeEvent.type,
        //     error: error.message
        //   }
        // })
      } catch (dlqError) {
        console.error("[Webhook Processor] Failed to write to DLQ", {
          eventId: stripeEvent?.id,
          dlqError: dlqError instanceof Error ? dlqError.message : String(dlqError),
        })
      }
    },
  },
  { event: "stripe/webhook.received" },
  async ({ event, step }) => {
    const stripeEvent = event.data.event as Stripe.Event

    console.log("[Webhook Processor] Starting webhook processing", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      workerEnv: process.env.NODE_ENV,
      workerHost: process.env.HOSTNAME,
    })

    // Lightweight health marker to confirm worker is consuming events (useful in dev/CI)
    await step.run("worker-health-log", async () => {
      console.log("[Webhook Processor] Worker health OK", {
        at: new Date().toISOString(),
        eventId: stripeEvent.id,
      })
    })

    /**
     * Step 1: Claim idempotency (create record FIRST to prevent race condition)
     *
     * Enterprise idempotency pattern with completion tracking:
     * - Use webhook_events table as distributed lock
     * - Create with status=CLAIMED, processedAt=null
     * - P2002 (unique constraint) = check if already COMPLETED or just CLAIMED
     * - NonRetriableError prevents Inngest from retrying duplicate events
     * - Backstop reconciler can detect CLAIMED but not COMPLETED events
     *
     * Why this pattern?
     * - If process-event fails, event stays CLAIMED (not COMPLETED)
     * - Backstop reconciler detects stuck events and re-queues them
     * - Prevents the "stuck forever" scenario from the original bug
     */
    await step.run("claim-idempotency", async () => {
      try {
        await prisma.webhookEvent.create({
          data: {
            id: stripeEvent.id,
            type: stripeEvent.type,
            data: stripeEvent as any,
            status: "CLAIMED",
            claimedAt: new Date(),
            processedAt: null, // Will be set on completion
          },
        })

        console.log("[Webhook Processor] Idempotency claimed", {
          eventId: stripeEvent.id,
        })
      } catch (error: any) {
        // Check if it's a unique constraint violation (Prisma error code P2002)
        if (error?.code === "P2002") {
          // Check existing record status
          const existing = await prisma.webhookEvent.findUnique({
            where: { id: stripeEvent.id },
            select: { status: true, claimedAt: true },
          })

          if (existing?.status === "COMPLETED") {
            // Truly a duplicate - already fully processed
            console.log("[Webhook Processor] Event already completed (idempotency)", {
              eventId: stripeEvent.id,
              eventType: stripeEvent.type,
            })
            throw new NonRetriableError(
              `Event ${stripeEvent.id} already processed - duplicate delivery detected`
            )
          }

          if (existing?.status === "FAILED") {
            // Previously failed - check DLQ for manual resolution
            console.log("[Webhook Processor] Event previously failed", {
              eventId: stripeEvent.id,
              eventType: stripeEvent.type,
            })
            throw new NonRetriableError(
              `Event ${stripeEvent.id} previously failed - check DLQ`
            )
          }

          // Status is CLAIMED but not completed
          // Could be: (a) still processing, (b) stuck
          // Check if stuck (claimed > 10 minutes ago) - allow retry
          const STUCK_THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes
          const claimedAt = existing?.claimedAt
          const isStuck = claimedAt && Date.now() - claimedAt.getTime() > STUCK_THRESHOLD_MS

          if (isStuck) {
            // Reset to allow this attempt to proceed
            console.log("[Webhook Processor] Event stuck, resetting for retry", {
              eventId: stripeEvent.id,
              eventType: stripeEvent.type,
              claimedAt,
              stuckForMs: Date.now() - claimedAt.getTime(),
            })
            await prisma.webhookEvent.update({
              where: { id: stripeEvent.id },
              data: {
                claimedAt: new Date(),
                retryCount: { increment: 1 },
              },
            })
            // Continue processing - don't throw
            return
          }

          // Recently claimed - likely still processing
          console.log("[Webhook Processor] Event recently claimed, skipping", {
            eventId: stripeEvent.id,
            eventType: stripeEvent.type,
            claimedAt,
          })
          throw new NonRetriableError(
            `Event ${stripeEvent.id} claimed but not completed - backstop will retry if stuck`
          )
        }
        // Other errors should be retried
        throw error
      }
    })

    // Step 2: Mark as processing (distinguish from just claimed)
    await step.run("mark-processing", async () => {
      await prisma.webhookEvent.update({
        where: { id: stripeEvent.id },
        data: { status: "PROCESSING" },
      })

      console.log("[Webhook Processor] Event marked as processing", {
        eventId: stripeEvent.id,
      })
    })

    // Step 3: Process event (now safe, idempotency guaranteed)
    await step.run("process-event", async () => {
      await routeWebhookEvent(stripeEvent)

      console.log("[Webhook Processor] Event processed", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
      })
    })

    // Step 3: Mark complete (critical - separates claimed from completed)
    await step.run("mark-complete", async () => {
      await prisma.webhookEvent.update({
        where: { id: stripeEvent.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      })

      console.log("[Webhook Processor] Event marked complete", {
        eventId: stripeEvent.id,
      })
    })

    return {
      message: "Webhook processed successfully",
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    }
  }
)
