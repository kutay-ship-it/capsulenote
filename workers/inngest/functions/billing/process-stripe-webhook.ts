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
 * @param event - Stripe Event object
 */
async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
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
      const stripeEvent = event.data.event as Stripe.Event

      console.error("[Webhook Processor] Processing failed after 3 retries", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
        error: error.message,
        stack: error.stack,
      })

      // Move to dead letter queue
      try {
        await prisma.failedWebhook.create({
          data: {
            eventId: stripeEvent.id,
            eventType: stripeEvent.type,
            payload: stripeEvent as any,
            error: `${error.message}\n\nStack:\n${error.stack}`,
          },
        })

        console.log("[Webhook Processor] Event moved to DLQ", {
          eventId: stripeEvent.id,
          eventType: stripeEvent.type,
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
          eventId: stripeEvent.id,
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
    })

    // Step 1: Idempotency check
    const exists = await step.run("check-idempotency", async () => {
      const existing = await prisma.webhookEvent.findUnique({
        where: { id: stripeEvent.id },
      })

      if (existing) {
        console.log("[Webhook Processor] Event already processed (idempotency)", {
          eventId: stripeEvent.id,
          processedAt: existing.processedAt,
        })
      }

      return existing
    })

    if (exists) {
      return {
        message: "Event already processed",
        eventId: stripeEvent.id,
        processedAt: exists.processedAt,
      }
    }

    // Step 2: Process event
    await step.run("process-event", async () => {
      await routeWebhookEvent(stripeEvent)

      console.log("[Webhook Processor] Event processed successfully", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
      })
    })

    // Step 3: Mark as processed
    await step.run("mark-processed", async () => {
      await prisma.webhookEvent.create({
        data: {
          id: stripeEvent.id,
          type: stripeEvent.type,
          data: stripeEvent as any,
        },
      })

      console.log("[Webhook Processor] Event marked as processed", {
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
