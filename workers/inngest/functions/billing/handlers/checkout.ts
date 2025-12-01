/**
 * Checkout Event Handlers
 *
 * Handles checkout.session.* webhook events from Stripe:
 * - checkout.session.completed (includes anonymous checkout support + credit addons)
 * - checkout.session.expired
 *
 * Credit Addon Flow (checkout.session.completed with mode="payment"):
 * 1. User clicks "Add Credits" in navbar → createAddOnCheckoutSession()
 * 2. Stripe Checkout with volume pricing calculates correct total
 * 3. checkout.session.completed webhook fires
 * 4. handleCreditAddonCheckout() adds credits to user account
 *
 * This is the PRIMARY fulfillment point for credit purchases (per Stripe best practices).
 * @see https://docs.stripe.com/payments/checkout/fulfill-orders
 */

import Stripe from "stripe"
import { prisma, type PlanType, type SubscriptionStatus } from "@dearme/prisma"
import {
  createUsageRecord,
  getUserByStripeCustomer,
  invalidateEntitlementsCache,
  recordBillingAudit,
} from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"
import { linkPendingSubscription } from "../../../../../apps/web/app/[locale]/subscribe/actions"
import { sendPaymentConfirmationEmail } from "../../../../../apps/web/server/lib/emails/payment-confirmation"
import { env } from "../../../../../apps/web/env.mjs"
import { stripe } from "../../../../../apps/web/server/providers/stripe/client"
import { recordCreditTransaction } from "../../../../../apps/web/server/lib/entitlements"

import {
  PLAN_CREDITS,
  getSubscriptionPeriodDates,
} from "../../../../../apps/web/server/lib/billing-constants"

/**
 * Map Stripe subscription statuses to our Prisma enum.
 * Unknown statuses are coerced to past_due to avoid granting benefits.
 */
const mapStripeStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "paused":
      return status
    case "incomplete":
    case "incomplete_expired":
      return "past_due"
    default:
      console.warn("[Checkout Handler] Unknown Stripe status, coercing to past_due", { status })
      return "past_due"
  }
}

function resolvePlanFromSubscription(
  subscription: Stripe.Subscription,
  fallbackPlan?: PlanType
): PlanType {
  return (
    (subscription.metadata?.plan as PlanType | undefined) ||
    (subscription.items?.data?.[0]?.price?.metadata?.plan as PlanType | undefined) ||
    fallbackPlan ||
    "DIGITAL_CAPSULE"
  )
}



async function upsertSubscriptionForUser({
  userId,
  subscriptionId,
  fallbackPlan,
}: {
  userId: string
  subscriptionId?: string | null
  fallbackPlan?: PlanType
}) {
  if (!subscriptionId || typeof subscriptionId !== "string") return

  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    const plan = resolvePlanFromSubscription(stripeSubscription, fallbackPlan)
    // Extract period dates from subscription (handles both legacy and new API versions)
    const { periodStart, periodEnd } = getSubscriptionPeriodDates(stripeSubscription)

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: stripeSubscription.id },
      create: {
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        status: mapStripeStatus(stripeSubscription.status),
        plan,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      update: {
        status: mapStripeStatus(stripeSubscription.status),
        plan,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    })

    const credits = PLAN_CREDITS[plan] || { email: 0, physical: 0 }
    const isActiveOrTrial = stripeSubscription.status === "active" || stripeSubscription.status === "trialing"

    if (isActiveOrTrial) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planType: plan,
          emailCredits: credits.email,
          physicalCredits: credits.physical,
          creditExpiresAt: periodEnd,
        },
      })
    }

    await invalidateEntitlementsCache(userId)
    if (isActiveOrTrial) {
      await createUsageRecord(userId, periodStart, credits.physical)
    }

    console.log("[Checkout Handler] Subscription synced on checkout completion", {
      userId,
      subscriptionId: stripeSubscription.id,
      plan,
      status: stripeSubscription.status,
    })
  } catch (error) {
    console.error("[Checkout Handler] Failed to sync subscription on checkout completion", {
      userId,
      subscriptionId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Handle credit addon checkout completion
 *
 * This is the PRIMARY fulfillment point for credit purchases.
 * Called when checkout.session.completed fires for mode="payment" with type="credit_addon".
 *
 * Flow:
 * 1. Verify this is a credit addon checkout (mode=payment, metadata.type=credit_addon)
 * 2. Check idempotency (prevent double-crediting from duplicate webhooks)
 * 3. Add credits to user account in atomic transaction
 * 4. Record audit trail
 * 5. Invalidate entitlements cache
 *
 * @param session - Stripe Checkout Session object
 * @param userId - User ID from metadata or customer lookup
 * @returns true if handled as credit addon, false if not a credit addon checkout
 */
async function handleCreditAddonCheckout(
  session: Stripe.Checkout.Session,
  userId: string
): Promise<boolean> {
  // Check if this is a credit addon checkout
  if (session.mode !== "payment") {
    return false
  }

  const metadata = session.metadata || {}
  if (metadata.type !== "credit_addon") {
    return false
  }

  const addonType = metadata.addon_type as "email" | "physical" | undefined
  const quantity = Number(metadata.quantity || "1")

  if (!addonType || isNaN(quantity) || quantity <= 0) {
    console.warn("[Checkout Handler] Invalid credit addon metadata", {
      sessionId: session.id,
      metadata,
    })
    return false
  }

  console.log("[Checkout Handler] Processing credit addon checkout", {
    sessionId: session.id,
    userId,
    addonType,
    quantity,
    amountTotal: session.amount_total,
  })

  // IDEMPOTENCY CHECK: Check if payment already recorded
  // The payment_intent from the session is our idempotency key
  const paymentIntentId = session.payment_intent as string
  if (paymentIntentId) {
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    })

    if (existingPayment?.status === "succeeded") {
      console.log("[Checkout Handler] Credit addon already fulfilled (idempotent)", {
        sessionId: session.id,
        paymentIntentId,
        existingPaymentId: existingPayment.id,
      })
      return true // Already handled, skip
    }
  }

  // ATOMIC TRANSACTION: All operations succeed or none do
  await prisma.$transaction(async (tx) => {
    // 1. Record payment (if not exists)
    if (paymentIntentId) {
      await tx.payment.upsert({
        where: { stripePaymentIntentId: paymentIntentId },
        create: {
          userId,
          type: "credit_addon",
          amountCents: session.amount_total || 0,
          currency: session.currency || "usd",
          stripePaymentIntentId: paymentIntentId,
          status: "succeeded",
          metadata: {
            checkoutSessionId: session.id,
            addon_type: addonType,
            quantity: quantity.toString(),
          },
        },
        update: {
          status: "succeeded",
          metadata: {
            checkoutSessionId: session.id,
            addon_type: addonType,
            quantity: quantity.toString(),
            fulfilledAt: new Date().toISOString(),
          },
        },
      })
    }

    // 2. Verify user exists
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    // 3. Record credit transaction (audit trail)
    await recordCreditTransaction({
      userId,
      creditType: addonType,
      transactionType: "grant_addon",
      amount: quantity,
      source: session.id,
      metadata: {
        checkoutSessionId: session.id,
        paymentIntentId,
        quantity,
        amountTotal: session.amount_total,
      },
      tx,
    })

    // 4. Update user credits
    const creditField = addonType === "email" ? "emailCredits" : "physicalCredits"
    const addonField = addonType === "email" ? "emailAddonCredits" : "physicalAddonCredits"

    await tx.user.update({
      where: { id: userId },
      data: {
        [creditField]: { increment: quantity },
        [addonField]: { increment: quantity },
      },
    })
  })

  // 5. Invalidate cache and record audit
  await invalidateEntitlementsCache(userId)
  await recordBillingAudit(userId, AuditEventType.ENTITLEMENTS_UPDATED, {
    addonType,
    quantity,
    checkoutSessionId: session.id,
    amountTotal: session.amount_total,
  })

  console.log("[Checkout Handler] Credit addon fulfilled successfully", {
    sessionId: session.id,
    userId,
    addonType,
    quantity,
  })

  return true
}

/**
 * Handle checkout.session.completed event
 *
 * Supports multiple checkout flows:
 * 1. Credit addon purchase (mode="payment", metadata.type="credit_addon")
 * 2. Authenticated subscription checkout
 * 3. Anonymous subscription checkout (PendingSubscription flow)
 *
 * @param session - Stripe Checkout Session object
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Checkout Handler] Checkout completed", {
    sessionId: session.id,
    mode: session.mode,
    customerId: session.customer,
    subscriptionId: session.subscription,
    metadata: session.metadata,
  })

  const customerId = session.customer as string
  if (!customerId) {
    console.warn("[Checkout Handler] No customer ID in checkout session", {
      sessionId: session.id,
    })
    return
  }

  // Try to find existing user
  const user = await getUserByStripeCustomer(customerId)

  // =========================================================================
  // FLOW 1: Credit Addon Purchase (mode="payment", type="credit_addon")
  // This is the PRIMARY fulfillment point for credit purchases
  // =========================================================================
  if (session.mode === "payment" && session.metadata?.type === "credit_addon") {
    // Try to get userId from metadata first (more reliable), then from customer lookup
    const userId = session.metadata?.userId || user?.id

    if (!userId) {
      console.error("[Checkout Handler] No user found for credit addon checkout", {
        sessionId: session.id,
        customerId,
        metadata: session.metadata,
      })
      return
    }

    const handled = await handleCreditAddonCheckout(session, userId)
    if (handled) {
      console.log("[Checkout Handler] Credit addon checkout handled", {
        sessionId: session.id,
        userId,
      })
      return
    }
  }

  // =========================================================================
  // FLOW 2: Authenticated Subscription Checkout
  // =========================================================================
  if (user) {
    // Authenticated checkout - log completion and sync subscription
    await recordBillingAudit(user.id, AuditEventType.CHECKOUT_COMPLETED, {
      sessionId: session.id,
      subscriptionId: session.subscription,
      amountTotal: session.amount_total,
      currency: session.currency,
    })

    await upsertSubscriptionForUser({
      userId: user.id,
      subscriptionId: session.subscription as string,
    })

    console.log("[Checkout Handler] Checkout completion logged for existing user", {
      sessionId: session.id,
      userId: user.id,
    })
    return
  }

  // Anonymous checkout flow - find PendingSubscription
  const pending = await prisma.pendingSubscription.findFirst({
    where: {
      OR: [
        { stripeCustomerId: customerId },
        { stripeSessionId: session.id },
      ],
    },
  })

  if (!pending) {
    console.warn("[Checkout Handler] No PendingSubscription found for anonymous checkout", {
      customerId,
      sessionId: session.id,
    })
    return
  }

  console.log("[Checkout Handler] Found PendingSubscription for anonymous checkout", {
    pendingId: pending.id,
    email: pending.email,
  })

  // Update PendingSubscription to payment_complete
  // Use conditional update to prevent double-processing from concurrent webhooks
  const updatedPending = await prisma.pendingSubscription.updateMany({
    where: {
      id: pending.id,
      status: { not: "payment_complete" }, // Only update if not already processed
    },
    data: {
      status: "payment_complete",
      stripeSubscriptionId: session.subscription as string,
      paymentStatus: session.payment_status,
      webhookProcessedAt: new Date(),
    },
  })

  // Check if update succeeded (count > 0)
  if (updatedPending.count === 0) {
    console.log("[Checkout Handler] PendingSubscription already processed by concurrent webhook", {
      pendingId: pending.id,
    })
    return // Idempotent - already processed
  }

  // Fetch the updated record for email sending
  const updatedPendingRecord = await prisma.pendingSubscription.findUnique({
    where: { id: pending.id },
  })

  if (!updatedPendingRecord) {
    throw new Error("PendingSubscription not found after update")
  }

  // Send payment confirmation email (non-blocking)
  sendPaymentConfirmationEmail({
    email: updatedPendingRecord.email,
    plan: updatedPendingRecord.plan,
    amountCents: updatedPendingRecord.amountCents,
    currency: updatedPendingRecord.currency,
    nextSteps: {
      signUpUrl: `${env.NEXT_PUBLIC_APP_URL}/sign-up?email=${encodeURIComponent(updatedPendingRecord.email)}`,
      supportEmail: "support@capsulenote.com",
    },
  })
    .then((result) => {
      if (result.success) {
        // Update confirmationEmailSentAt timestamp
        prisma.pendingSubscription
          .update({
            where: { id: updatedPendingRecord.id },
            data: { confirmationEmailSentAt: new Date() },
          })
          .catch((error) => {
            console.warn("[Checkout Handler] Failed to update confirmationEmailSentAt", {
              pendingId: updatedPendingRecord.id,
              error: error instanceof Error ? error.message : String(error),
            })
          })

        console.log("[Checkout Handler] Payment confirmation email sent", {
          pendingId: updatedPendingRecord.id,
          email: updatedPendingRecord.email,
          emailId: result.emailId,
        })
      } else {
        console.error("[Checkout Handler] Failed to send payment confirmation email", {
          pendingId: updatedPendingRecord.id,
          email: updatedPendingRecord.email,
          error: result.error,
        })
      }
    })
    .catch((error) => {
      console.error("[Checkout Handler] Unexpected error sending confirmation email", {
        pendingId: updatedPendingRecord.id,
        error: error instanceof Error ? error.message : String(error),
      })
    })

  // Check if user already exists with this email (race condition: user signed up before webhook)
  const existingUser = await prisma.user.findUnique({
    where: { email: updatedPendingRecord.email },
  })

  if (existingUser) {
    console.log("[Checkout Handler] User already exists, auto-linking subscription", {
      userId: existingUser.id,
      email: pending.email,
    })

    // Auto-link immediately
    const result = await linkPendingSubscription(existingUser.id)

    if (result.success) {
      console.log("[Checkout Handler] Successfully auto-linked subscription", {
        userId: existingUser.id,
        subscriptionId: result.subscriptionId,
      })

      await upsertSubscriptionForUser({
        userId: existingUser.id,
        subscriptionId: session.subscription as string,
        fallbackPlan: updatedPendingRecord.plan,
      })
    } else {
      console.error("[Checkout Handler] Failed to auto-link subscription", {
        userId: existingUser.id,
        error: result.error,
      })
    }
  } else {
    console.log("[Checkout Handler] No user exists yet, awaiting signup", {
      email: pending.email,
    })

    // TODO: Trigger signup reminder email (Phase 6)
    // await inngest.send({
    //   name: "billing.send-signup-reminder",
    //   data: {
    //     pendingSubscriptionId: pending.id,
    //     email: pending.email,
    //     immediate: true,
    //   },
    // })
  }
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
