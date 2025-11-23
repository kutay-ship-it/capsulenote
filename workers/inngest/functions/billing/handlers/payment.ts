/**
 * Payment Event Handlers
 *
 * Handles payment_intent.* and charge.* webhook events from Stripe:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 * - payment_method.attached
 * - payment_method.detached
 */

import Stripe from "stripe"
import { prisma } from "@dearme/prisma"
import { recordBillingAudit, invalidateEntitlementsCache } from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"

/**
 * Handle payment_intent.succeeded event
 *
 * Records successful one-time payments (e.g., physical mail add-ons).
 * Subscription payments are handled by invoice.payment_succeeded.
 *
 * @param paymentIntent - Stripe PaymentIntent object
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log("[Payment Handler] Payment intent succeeded", {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
  })

  // Only process if we have userId in metadata (one-time payments)
  if (!paymentIntent.metadata.userId) {
    console.log("[Payment Handler] No userId in metadata, skipping (likely subscription payment)", {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  const userId = paymentIntent.metadata.userId

  // Record payment
  await prisma.payment.create({
    data: {
      userId,
      type: (paymentIntent.metadata.type as any) || "shipping_addon",
      amountCents: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: "succeeded",
      metadata: paymentIntent.metadata,
    },
  })

  // Apply add-on credits if applicable
  const addonType = paymentIntent.metadata.addon_type as "email" | "physical" | undefined
  const quantity = Number(paymentIntent.metadata.quantity || "1")
  if (addonType) {
    const increment = isNaN(quantity) ? 1 : quantity
    if (addonType === "email") {
      await prisma.user.update({
        where: { id: userId },
        data: { emailCredits: { increment } },
      })
    } else if (addonType === "physical") {
      await prisma.user.update({
        where: { id: userId },
        data: { physicalCredits: { increment } },
      })
    }

    await invalidateEntitlementsCache(userId)
    await recordBillingAudit(userId, AuditEventType.ENTITLEMENTS_UPDATED, {
      addonType,
      quantity: increment,
      paymentIntentId: paymentIntent.id,
    })
  }

  // Record audit event
  await recordBillingAudit(userId, AuditEventType.PAYMENT_SUCCEEDED, {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    type: paymentIntent.metadata.type,
  })

  console.log("[Payment Handler] One-time payment recorded", {
    paymentIntentId: paymentIntent.id,
    userId,
  })
}

/**
 * Handle payment_intent.payment_failed event
 *
 * Logs failed payment attempts.
 *
 * @param paymentIntent - Stripe PaymentIntent object
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("[Payment Handler] Payment intent failed", {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
  })

  // Only process if we have userId in metadata
  if (!paymentIntent.metadata.userId) {
    console.log("[Payment Handler] No userId in metadata, skipping", {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  const userId = paymentIntent.metadata.userId

  // Record failed payment
  await prisma.payment.create({
    data: {
      userId,
      type: (paymentIntent.metadata.type as any) || "shipping_addon",
      amountCents: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: "failed",
      metadata: paymentIntent.metadata,
    },
  })

  // Record audit event
  await recordBillingAudit(userId, AuditEventType.PAYMENT_FAILED, {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    lastPaymentError: paymentIntent.last_payment_error?.message,
  })

  console.log("[Payment Handler] Failed payment recorded", {
    paymentIntentId: paymentIntent.id,
    userId,
  })
}

/**
 * Handle charge.refunded event
 *
 * Records refunds for both subscriptions and one-time payments.
 *
 * @param charge - Stripe Charge object
 */
export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log("[Payment Handler] Charge refunded", {
    chargeId: charge.id,
    amountRefunded: charge.amount_refunded,
  })

  // Find payment by payment intent ID
  const paymentIntentId = charge.payment_intent as string
  if (!paymentIntentId) {
    console.warn("[Payment Handler] No payment intent ID in charge", {
      chargeId: charge.id,
    })
    return
  }

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!payment) {
    console.warn("[Payment Handler] Payment not found for refund", {
      chargeId: charge.id,
      paymentIntentId,
    })
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "refunded",
      metadata: {
        ...payment.metadata,
        refundId: charge.refunds?.data[0]?.id,
        refundReason: charge.refunds?.data[0]?.reason,
        refundedAt: new Date().toISOString(),
      },
    },
  })

  // Record audit event
  await recordBillingAudit(payment.userId, AuditEventType.REFUND_CREATED, {
    chargeId: charge.id,
    paymentIntentId,
    amountRefunded: charge.amount_refunded,
    currency: charge.currency,
  })

  console.log("[Payment Handler] Refund recorded", {
    chargeId: charge.id,
    paymentId: payment.id,
    userId: payment.userId,
  })
}

/**
 * Handle payment_method.attached event
 *
 * Logs when customer adds a payment method.
 *
 * @param paymentMethod - Stripe PaymentMethod object
 */
export async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod
): Promise<void> {
  console.log("[Payment Handler] Payment method attached", {
    paymentMethodId: paymentMethod.id,
    customerId: paymentMethod.customer,
    type: paymentMethod.type,
  })

  // Audit logging only - no action needed
}

/**
 * Handle payment_method.detached event
 *
 * Logs when customer removes a payment method.
 *
 * @param paymentMethod - Stripe PaymentMethod object
 */
export async function handlePaymentMethodDetached(
  paymentMethod: Stripe.PaymentMethod
): Promise<void> {
  console.log("[Payment Handler] Payment method detached", {
    paymentMethodId: paymentMethod.id,
    type: paymentMethod.type,
  })

  // Audit logging only - no action needed
}
