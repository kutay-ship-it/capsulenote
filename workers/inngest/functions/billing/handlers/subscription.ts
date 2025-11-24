/**
 * Subscription Event Handlers
 *
 * Handles customer.subscription.* webhook events from Stripe:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - customer.subscription.trial_will_end
 * - customer.subscription.paused
 * - customer.subscription.resumed
 */

import Stripe from "stripe"
import { prisma } from "@dearme/prisma"
import type { PlanType, SubscriptionStatus } from "@prisma/client"
import {
  getUserByStripeCustomer,
  invalidateEntitlementsCache,
  createUsageRecord,
  sendBillingEmail,
  recordBillingAudit,
} from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"

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
      console.warn("[Subscription Handler] Unknown Stripe status, coercing to past_due", { status })
      return "past_due"
  }
}



/**
 * Handle subscription.created or subscription.updated event
 *
 * Upserts subscription record and syncs status.
 *
 * @param subscription - Stripe Subscription object
 */
export async function handleSubscriptionCreatedOrUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string

  console.log("[Subscription Handler] Processing subscription change", {
    subscriptionId: subscription.id,
    customerId,
    status: subscription.status,
  })

  // Find user; fallback to pending subscription/email mapping if customer lookup fails
  let user = await getUserByStripeCustomer(customerId)
  if (!user) {
    const pending = await prisma.pendingSubscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId: subscription.id },
          { stripeCustomerId: customerId },
        ],
        email: { not: null },
      },
      orderBy: { createdAt: "desc" },
    })

    if (pending?.email) {
      const fallbackUser = await prisma.user.findUnique({
        where: { email: pending.email },
        include: { profile: true },
      })

      if (fallbackUser) {
        // Ensure profile is mapped for future webhook lookups
        if (!fallbackUser.profile?.stripeCustomerId) {
          await prisma.profile.update({
            where: { userId: fallbackUser.id },
            data: { stripeCustomerId: customerId },
          }).catch((error) => {
            console.warn("[Subscription Handler] Failed to backfill stripeCustomerId on profile", {
              userId: fallbackUser.id,
              error: error instanceof Error ? error.message : String(error),
            })
          })
        }

        user = {
          id: fallbackUser.id,
          email: fallbackUser.email,
          clerkUserId: fallbackUser.clerkUserId,
        }
        console.log("[Subscription Handler] Fallback user resolution succeeded", {
          userId: fallbackUser.id,
          email: fallbackUser.email,
          subscriptionId: subscription.id,
        })
      }
    }
  }

  if (!user) {
    throw new Error(`User not found for customer: ${customerId}`)
  }

  const plan =
    (subscription.metadata?.plan as PlanType | undefined) ||
    (subscription.items?.data?.[0]?.price?.metadata?.plan as PlanType | undefined) ||
    "DIGITAL_CAPSULE"

  // Extract period dates from subscription (handles both legacy and new API versions)
  const { periodStart: safePeriodStart, periodEnd: safePeriodEnd } = getSubscriptionPeriodDates(subscription)
  const normalizedStatus = mapStripeStatus(subscription.status)

  console.log("[Subscription Handler] Normalized status", {
    subscriptionId: subscription.id,
    stripeStatus: subscription.status,
    normalizedStatus,
  })

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status: normalizedStatus,
      plan,
      currentPeriodEnd: safePeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: normalizedStatus,
      plan,
      currentPeriodEnd: safePeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  // Invalidate entitlements cache
  await invalidateEntitlementsCache(user.id)

  // Create usage record for new active subscription
  if (subscription.status === "active" || subscription.status === "trialing") {
    await createUsageRecord(user.id, safePeriodStart, PLAN_CREDITS[plan]?.physical ?? 0)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: plan,
        emailCredits: PLAN_CREDITS[plan]?.email ?? 0,
        physicalCredits: PLAN_CREDITS[plan]?.physical ?? 0,
        creditExpiresAt: safePeriodEnd,
      },
    })
  }

  // Record audit event
  await recordBillingAudit(user.id, AuditEventType.SUBSCRIPTION_UPDATED, {
    subscriptionId: subscription.id,
    status: subscription.status,
    plan,
    currentPeriodEnd: safePeriodEnd.toISOString(),
  })

  console.log("[Subscription Handler] Subscription updated successfully", {
    subscriptionId: subscription.id,
    userId: user.id,
    status: subscription.status,
  })
}

/**
 * Handle subscription.deleted event
 *
 * Marks subscription as canceled.
 *
 * @param subscription - Stripe Subscription object
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Subscription Handler] Subscription deleted", {
    subscriptionId: subscription.id,
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "canceled" },
  })

  // Get user for cache invalidation
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (sub) {
    // Invalidate entitlements cache
    await invalidateEntitlementsCache(sub.userId)
    await prisma.user.updateMany({
      where: { id: sub.userId },
      data: { planType: null, emailCredits: 0, physicalCredits: 0, creditExpiresAt: null },
    })

    // Send cancellation email
    const user = await prisma.user.findUnique({
      where: { id: sub.userId },
    })

    if (user) {
      await sendBillingEmail("subscription-canceled", sub.userId, user.email, {
        subscriptionId: subscription.id,
        canceledAt: new Date().toISOString(),
      })
    }

    // Record audit event
    await recordBillingAudit(sub.userId, AuditEventType.SUBSCRIPTION_CANCELED, {
      subscriptionId: subscription.id,
    })
  }

  console.log("[Subscription Handler] Subscription cancellation processed", {
    subscriptionId: subscription.id,
  })
}

/**
 * Handle subscription.trial_will_end event
 *
 * Sends reminder email 3 days before trial ends.
 *
 * @param subscription - Stripe Subscription object
 */
export async function handleSubscriptionTrialWillEnd(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string

  console.log("[Subscription Handler] Trial ending soon", {
    subscriptionId: subscription.id,
    trialEnd: new Date(subscription.trial_end! * 1000).toISOString(),
  })

  // Find user
  const user = await getUserByStripeCustomer(customerId)
  if (!user) {
    console.warn("[Subscription Handler] User not found for trial ending notification", {
      customerId,
    })
    return
  }

  // Calculate days remaining
  const trialEndsAt = new Date(subscription.trial_end! * 1000)
  const daysRemaining = Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)

  // Send trial ending email
  await sendBillingEmail("trial-ending", user.id, user.email, {
    subscriptionId: subscription.id,
    trialEndsAt: trialEndsAt.toISOString(),
    daysRemaining,
  })

  // Record audit event
  await recordBillingAudit(user.id, AuditEventType.SUBSCRIPTION_TRIAL_ENDING, {
    subscriptionId: subscription.id,
    trialEndsAt: trialEndsAt.toISOString(),
    daysRemaining,
  })

  console.log("[Subscription Handler] Trial ending notification sent", {
    subscriptionId: subscription.id,
    userId: user.id,
    daysRemaining,
  })
}

/**
 * Handle subscription.paused event
 *
 * Updates subscription status to paused.
 *
 * @param subscription - Stripe Subscription object
 */
export async function handleSubscriptionPaused(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Subscription Handler] Subscription paused", {
    subscriptionId: subscription.id,
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "paused" },
  })

  // Get user for cache invalidation
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (sub) {
    await invalidateEntitlementsCache(sub.userId)
    await recordBillingAudit(sub.userId, AuditEventType.SUBSCRIPTION_PAUSED, {
      subscriptionId: subscription.id,
    })
  }

  console.log("[Subscription Handler] Subscription paused successfully", {
    subscriptionId: subscription.id,
  })
}

/**
 * Handle subscription.resumed event
 *
 * Reactivates paused subscription.
 *
 * @param subscription - Stripe Subscription object
 */
export async function handleSubscriptionResumed(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Subscription Handler] Subscription resumed", {
    subscriptionId: subscription.id,
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: mapStripeStatus(subscription.status) },
  })

  // Get user for cache invalidation
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (sub) {
    await invalidateEntitlementsCache(sub.userId)
    await recordBillingAudit(sub.userId, AuditEventType.SUBSCRIPTION_RESUMED, {
      subscriptionId: subscription.id,
    })
  }

  console.log("[Subscription Handler] Subscription resumed successfully", {
    subscriptionId: subscription.id,
  })
}
