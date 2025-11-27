/**
 * Payment Event Handlers
 *
 * Handles payment_intent.* and charge.* webhook events from Stripe:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 * - payment_method.attached
 * - payment_method.detached
 *
 * Key safety features:
 * - Idempotency: Check if payment already processed before incrementing credits
 * - Atomicity: Use transactions to ensure all-or-nothing credit grants
 * - Audit trail: All credit changes logged to CreditTransaction table
 */

import Stripe from "stripe"
import { prisma } from "@dearme/prisma"
import { recordBillingAudit, invalidateEntitlementsCache } from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"
import { recordCreditTransaction, deductCreditsForRefund } from "../../../../../apps/web/server/lib/entitlements"

/**
 * Handle payment_intent.succeeded event
 *
 * Records successful one-time payments (e.g., physical mail add-ons).
 * Subscription payments are handled by invoice.payment_succeeded.
 *
 * Safety features:
 * - Idempotency: Checks if payment already processed before any changes
 * - Atomicity: All operations wrapped in transaction
 * - Audit: Credit changes logged to CreditTransaction table
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

  // IDEMPOTENCY CHECK: Skip if already processed
  // The unique constraint on stripePaymentIntentId also prevents duplicates at DB level
  const existingPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (existingPayment) {
    console.log("[Payment Handler] Payment already processed, skipping (idempotent)", {
      paymentIntentId: paymentIntent.id,
      existingPaymentId: existingPayment.id,
    })
    return
  }

  // ATOMIC TRANSACTION: All operations succeed or none do
  const addonType = paymentIntent.metadata.addon_type as "email" | "physical" | undefined
  const quantity = Number(paymentIntent.metadata.quantity || "1")
  const creditAmount = isNaN(quantity) ? 1 : quantity

  await prisma.$transaction(async (tx) => {
    // 1. Record payment
    await tx.payment.create({
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

    // 2. Apply add-on credits if applicable
    if (addonType) {
      // Get current balance for audit
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { emailCredits: true, physicalCredits: true },
      })

      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      const creditField = addonType === "email" ? "emailCredits" : "physicalCredits"
      const addonField = addonType === "email" ? "emailAddonCredits" : "physicalAddonCredits"
      const currentBalance = addonType === "email" ? user.emailCredits : user.physicalCredits

      // Record audit trail
      await tx.creditTransaction.create({
        data: {
          userId,
          creditType: addonType,
          transactionType: "grant_addon",
          amount: creditAmount,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance + creditAmount,
          source: paymentIntent.id,
          metadata: {
            paymentIntentId: paymentIntent.id,
            quantity: creditAmount,
          },
        },
      })

      // Update credits (both total and addon tracking)
      await tx.user.update({
        where: { id: userId },
        data: {
          [creditField]: { increment: creditAmount },
          [addonField]: { increment: creditAmount },
        },
      })
    }
  })

  // Invalidate cache after successful transaction
  if (addonType) {
    await invalidateEntitlementsCache(userId)
    await recordBillingAudit(userId, AuditEventType.ENTITLEMENTS_UPDATED, {
      addonType,
      quantity: creditAmount,
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
    creditsAdded: addonType ? creditAmount : 0,
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
 * For add-on purchases, deducts the credited amount from user's balance.
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

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!payment) {
    console.warn("[Payment Handler] Payment not found for refund", {
      chargeId: charge.id,
      paymentIntentId,
    })
    return
  }

  // Check if already refunded (idempotency)
  if (payment.status === "refunded") {
    console.log("[Payment Handler] Payment already refunded, skipping (idempotent)", {
      chargeId: charge.id,
      paymentId: payment.id,
    })
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "refunded",
      metadata: {
        ...(payment.metadata as object),
        refundId: charge.refunds?.data[0]?.id,
        refundReason: charge.refunds?.data[0]?.reason,
        refundedAt: new Date().toISOString(),
      },
    },
  })

  // Deduct credits if this was an add-on purchase
  const metadata = payment.metadata as { addon_type?: string; quantity?: string }
  const addonType = metadata?.addon_type as "email" | "physical" | undefined
  const quantity = Number(metadata?.quantity || "1")

  if (addonType && !isNaN(quantity) && quantity > 0) {
    console.log("[Payment Handler] Deducting credits for refund", {
      chargeId: charge.id,
      paymentId: payment.id,
      userId: payment.userId,
      addonType,
      quantity,
    })

    // Use the deductCreditsForRefund helper which handles transaction + audit
    await deductCreditsForRefund(
      payment.userId,
      addonType,
      quantity,
      charge.id
    )

    await invalidateEntitlementsCache(payment.userId)
  }

  // Record audit event
  await recordBillingAudit(payment.userId, AuditEventType.REFUND_CREATED, {
    chargeId: charge.id,
    paymentIntentId,
    amountRefunded: charge.amount_refunded,
    currency: charge.currency,
    creditsDeducted: addonType ? quantity : 0,
    addonType,
  })

  console.log("[Payment Handler] Refund recorded", {
    chargeId: charge.id,
    paymentId: payment.id,
    userId: payment.userId,
    creditsDeducted: addonType ? quantity : 0,
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
