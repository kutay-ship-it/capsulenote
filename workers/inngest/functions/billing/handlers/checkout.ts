/**
 * Checkout Event Handlers
 *
 * Handles checkout.session.* webhook events from Stripe:
 * - checkout.session.completed
 * - checkout.session.expired
 */

import Stripe from "stripe"
import {
  getUserByStripeCustomer,
  recordBillingAudit,
} from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"

/**
 * Handle checkout.session.completed event
 *
 * Logs successful checkout completion.
 * Subscription creation is handled by subscription.created event.
 *
 * @param session - Stripe Checkout Session object
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Checkout Handler] Checkout completed", {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
  })

  // Find user
  const customerId = session.customer as string
  if (!customerId) {
    console.warn("[Checkout Handler] No customer ID in checkout session", {
      sessionId: session.id,
    })
    return
  }

  const user = await getUserByStripeCustomer(customerId)
  if (!user) {
    console.warn("[Checkout Handler] User not found for checkout completion", {
      customerId,
      sessionId: session.id,
    })
    return
  }

  // Record audit event
  await recordBillingAudit(user.id, AuditEventType.CHECKOUT_COMPLETED, {
    sessionId: session.id,
    subscriptionId: session.subscription,
    amountTotal: session.amount_total,
    currency: session.currency,
  })

  console.log("[Checkout Handler] Checkout completion logged", {
    sessionId: session.id,
    userId: user.id,
  })
}

/**
 * Handle checkout.session.expired event
 *
 * Tracks checkout abandonment for analytics.
 *
 * @param session - Stripe Checkout Session object
 */
export async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Checkout Handler] Checkout expired", {
    sessionId: session.id,
    customerId: session.customer,
  })

  // Find user if customer exists
  const customerId = session.customer as string
  if (customerId) {
    const user = await getUserByStripeCustomer(customerId)
    if (user) {
      await recordBillingAudit(user.id, AuditEventType.CHECKOUT_CANCELED, {
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      })

      console.log("[Checkout Handler] Checkout expiration logged", {
        sessionId: session.id,
        userId: user.id,
      })
    }
  }
}
