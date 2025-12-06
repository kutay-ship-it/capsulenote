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
  const addonType = paymentIntent.metadata.addon_type as "email" | "physical" | undefined
  const quantity = Number(paymentIntent.metadata.quantity || "1")
  const creditAmount = isNaN(quantity) ? 1 : quantity

  // ATOMIC TRANSACTION: Idempotency check + fulfillment in single transaction
  // This prevents race conditions where checkout.session.completed and payment_intent.succeeded
  // both try to create the payment record simultaneously (P2002 unique constraint violation)
  const result = await prisma.$transaction(async (tx) => {
    // IDEMPOTENCY CHECK: Inside transaction to prevent race conditions
    const existingPayment = await tx.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (existingPayment) {
      if (existingPayment.status === "succeeded") {
        console.log("[Payment Handler] Payment already processed as succeeded, skipping (idempotent)", {
          paymentIntentId: paymentIntent.id,
          existingPaymentId: existingPayment.id,
        })
        return { alreadyFulfilled: true, creditsGranted: false }
      }

      // Payment exists but was failed - this is a retry that succeeded
      console.log("[Payment Handler] Previous failed payment now succeeded, updating", {
        paymentIntentId: paymentIntent.id,
        existingPaymentId: existingPayment.id,
        previousStatus: existingPayment.status,
      })

      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "succeeded",
          metadata: {
            ...(existingPayment.metadata as object || {}),
            ...paymentIntent.metadata,
            retriedFromStatus: existingPayment.status,
            retriedAt: new Date().toISOString(),
          },
        },
      })

      // For retried payments, we still need to grant credits if applicable
      // Continue to credit granting below
    } else {
      // Create new payment record using upsert to handle race conditions gracefully
      // This prevents P2002 if checkout.session.completed already created the record
      await tx.payment.upsert({
        where: { stripePaymentIntentId: paymentIntent.id },
        create: {
          userId,
          type: (paymentIntent.metadata.type as any) || "shipping_addon",
          amountCents: paymentIntent.amount,
          currency: paymentIntent.currency,
          stripePaymentIntentId: paymentIntent.id,
          status: "succeeded",
          metadata: paymentIntent.metadata,
        },
        update: {
          // If record exists (created by checkout.session.completed), ensure it's marked succeeded
          status: "succeeded",
          metadata: {
            ...paymentIntent.metadata,
            updatedByPaymentIntent: true,
            updatedAt: new Date().toISOString(),
          },
        },
      })
    }

    // Apply add-on credits if applicable
    // Skip if existingPayment was already succeeded (credits already granted)
    if (existingPayment?.status === "succeeded") {
      return { alreadyFulfilled: true, creditsGranted: false }
    }

    if (addonType) {
      // Check if credits were already granted (by checkout.session.completed handler)
      // Look for a credit transaction with this payment intent as source
      const existingTransaction = await tx.creditTransaction.findFirst({
        where: {
          userId,
          source: paymentIntent.id,
          transactionType: "grant_addon",
        },
      })

      if (existingTransaction) {
        console.log("[Payment Handler] Credits already granted for this payment, skipping", {
          paymentIntentId: paymentIntent.id,
          existingTransactionId: existingTransaction.id,
        })
        return { alreadyFulfilled: false, creditsGranted: false }
      }

      // Verify user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })

      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      const creditField = addonType === "email" ? "emailCredits" : "physicalCredits"
      const addonField = addonType === "email" ? "emailAddonCredits" : "physicalAddonCredits"

      // Record audit trail using helper (fetches balance internally)
      await recordCreditTransaction({
        userId,
        creditType: addonType,
        transactionType: "grant_addon",
        amount: creditAmount,
        source: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          quantity: creditAmount,
        },
        tx,
      })

      // Update credits (both total and addon tracking)
      await tx.user.update({
        where: { id: userId },
        data: {
          [creditField]: { increment: creditAmount },
          [addonField]: { increment: creditAmount },
        },
      })

      return { alreadyFulfilled: false, creditsGranted: true }
    }

    return { alreadyFulfilled: false, creditsGranted: false }
  })

  // Short-circuit if already fulfilled (idempotent)
  if (result.alreadyFulfilled) {
    return
  }

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

  // ATOMIC TRANSACTION: Check + create/update in single transaction
  // This prevents race conditions with payment_intent.succeeded
  await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (existingPayment) {
      // If already succeeded, don't overwrite with failed status
      if (existingPayment.status === "succeeded") {
        console.log("[Payment Handler] Payment already succeeded, ignoring failed event (race condition)", {
          paymentIntentId: paymentIntent.id,
          existingPaymentId: existingPayment.id,
        })
        return
      }

      // Already recorded as failed, skip duplicate
      console.log("[Payment Handler] Failed payment already recorded, skipping (idempotent)", {
        paymentIntentId: paymentIntent.id,
        existingPaymentId: existingPayment.id,
      })
      return
    }

    // Create failed payment record using upsert to handle race conditions
    await tx.payment.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      create: {
        userId,
        type: (paymentIntent.metadata.type as any) || "shipping_addon",
        amountCents: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: "failed",
        metadata: paymentIntent.metadata,
      },
      update: {
        // Only update to failed if current status is not succeeded
        // This handles race conditions where succeeded event arrives first
        // Note: Prisma doesn't support conditional updates, so we check above
      },
    })
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
