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
import { prisma, type PlanType, type SubscriptionStatus } from "@dearme/prisma"
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
  getPlanFromPriceId,
  comparePlans,
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
    items: subscription.items?.data?.map((item) => ({
      priceId: item.price?.id,
      productId: item.price?.product,
      metadata: item.price?.metadata,
    })),
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
    // For anonymous checkout flow: customer.subscription.created fires BEFORE checkout.session.completed
    // At this point, the user may not exist yet or stripeCustomerId isn't linked.
    // Defer processing to checkout.session.completed which handles subscription sync.
    console.log("[Subscription Handler] User not found, deferring to checkout handler", {
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    })
    return
  }

  // Plan detection priority:
  // 1. Price ID mapping (most reliable - works for Billing Portal upgrades)
  // 2. Subscription metadata (set during original checkout)
  // 3. Price metadata (fallback)
  // 4. Default to DIGITAL_CAPSULE
  const priceId = subscription.items?.data?.[0]?.price?.id
  const planFromPriceId = getPlanFromPriceId(priceId)
  const planFromSubMetadata = subscription.metadata?.plan as PlanType | undefined
  const planFromPriceMetadata = subscription.items?.data?.[0]?.price?.metadata?.plan as PlanType | undefined

  const plan = planFromPriceId || planFromSubMetadata || planFromPriceMetadata || "DIGITAL_CAPSULE"

  console.log("[Subscription Handler] Plan detection", {
    subscriptionId: subscription.id,
    priceId,
    planFromPriceId,
    planFromSubMetadata,
    planFromPriceMetadata,
    finalPlan: plan,
  })

  // Extract period dates from subscription (handles both legacy and new API versions)
  const { periodStart: safePeriodStart, periodEnd: safePeriodEnd } = getSubscriptionPeriodDates(subscription)
  const normalizedStatus = mapStripeStatus(subscription.status)

  console.log("[Subscription Handler] Normalized status", {
    subscriptionId: subscription.id,
    stripeStatus: subscription.status,
    normalizedStatus,
  })

  // IMPORTANT: Check existing subscription BEFORE upsert to detect plan upgrades
  // If we query after upsert, we always get the new plan, so isUpgrade would be false
  const existingSubscriptionBeforeUpsert = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { plan: true },
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

  // Create usage record and grant credits for new/renewed active subscription
  if (subscription.status === "active" || subscription.status === "trialing") {
    await createUsageRecord(user.id, safePeriodStart, PLAN_CREDITS[plan]?.physical ?? 0)

    // Detect plan change type using proper comparison
    // Uses existingSubscriptionBeforeUpsert from BEFORE the upsert (queried on line 169)
    const previousPlan = existingSubscriptionBeforeUpsert?.plan ?? null
    const planChangeType = comparePlans(previousPlan, plan)
    const isUpgrade = planChangeType === "upgrade"
    const isDowngrade = planChangeType === "downgrade"

    const planEmailCredits = PLAN_CREDITS[plan]?.email ?? 0
    const planPhysicalCredits = PLAN_CREDITS[plan]?.physical ?? 0

    // Generate unique source base for idempotency:
    // - Upgrades: "{subscriptionId}:upgrade:{fromPlan}:{toPlan}" (one transaction per upgrade transition)
    // - Downgrades: "{subscriptionId}:downgrade:{fromPlan}:{toPlan}" (one transaction per downgrade transition)
    // - Renewals: "{subscriptionId}:{periodStart}" (one transaction per billing period)
    // The credit type is appended to make email and physical transactions unique
    const transactionSourceBase = isUpgrade
      ? `${subscription.id}:upgrade:${previousPlan}:${plan}`
      : isDowngrade
        ? `${subscription.id}:downgrade:${previousPlan}:${plan}`
        : `${subscription.id}:${safePeriodStart.toISOString()}`

    // ATOMIC TRANSACTION: All credit operations must succeed or fail together
    // This prevents inconsistent state where credit transaction is recorded but user balance not updated
    await prisma.$transaction(async (tx) => {
      // Get current credits within transaction for consistency
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { emailAddonCredits: true, physicalAddonCredits: true, emailCredits: true, physicalCredits: true },
      })

      if (!currentUser) {
        throw new Error(`User not found during credit grant: ${user.id}`)
      }

      const addonEmail = currentUser.emailAddonCredits ?? 0
      const addonPhysical = currentUser.physicalAddonCredits ?? 0
      const currentEmailCredits = currentUser.emailCredits ?? 0
      const currentPhysicalCredits = currentUser.physicalCredits ?? 0

      let newEmailTotal: number
      let newPhysicalTotal: number

      if (isUpgrade) {
        // Upgrade: Add new plan credits to existing credits (reward loyalty)
        // Example: User has 6 email + 1 physical, upgrades to Paper & Pixels (24 email, 3 physical)
        // Result: 6 + 24 = 30 email, 1 + 3 = 4 physical
        newEmailTotal = currentEmailCredits + planEmailCredits
        newPhysicalTotal = currentPhysicalCredits + planPhysicalCredits
        console.log("[Subscription Handler] Plan UPGRADE detected - stacking credits", {
          subscriptionId: subscription.id,
          previousPlan,
          newPlan: plan,
          currentEmailCredits,
          currentPhysicalCredits,
          planEmailCredits,
          planPhysicalCredits,
          newEmailTotal,
          newPhysicalTotal,
        })
      } else if (isDowngrade) {
        // Downgrade: Reset to new plan credits + addon credits (prevent credit hoarding)
        // Example: User has 20 email + 3 physical, downgrades to Digital Capsule (9 email, 0 physical)
        // Result: 9 + addonEmail, 0 + addonPhysical (NOT 20 + 9!)
        newEmailTotal = planEmailCredits + addonEmail
        newPhysicalTotal = planPhysicalCredits + addonPhysical
        console.log("[Subscription Handler] Plan DOWNGRADE detected - resetting credits", {
          subscriptionId: subscription.id,
          previousPlan,
          newPlan: plan,
          currentEmailCredits,
          currentPhysicalCredits,
          planEmailCredits,
          planPhysicalCredits,
          addonEmail,
          addonPhysical,
          newEmailTotal,
          newPhysicalTotal,
        })
      } else {
        // New subscription or renewal: Set to plan credits + addon credits
        newEmailTotal = planEmailCredits + addonEmail
        newPhysicalTotal = planPhysicalCredits + addonPhysical
        console.log("[Subscription Handler] New subscription or renewal - setting plan credits", {
          subscriptionId: subscription.id,
          plan,
          planChangeType,
          planEmailCredits,
          planPhysicalCredits,
          addonEmail,
          addonPhysical,
          newEmailTotal,
          newPhysicalTotal,
        })
      }

      // Record audit trail for plan credit grant
      if (planEmailCredits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            creditType: "email",
            transactionType: "grant_subscription",
            amount: planEmailCredits,
            balanceBefore: currentEmailCredits,
            balanceAfter: newEmailTotal,
            source: `${transactionSourceBase}:email`,
            metadata: {
              plan,
              subscriptionId: subscription.id,
              periodStart: safePeriodStart.toISOString(),
              periodEnd: safePeriodEnd.toISOString(),
              planChangeType,
              previousPlan,
            },
          },
        })
      }

      if (planPhysicalCredits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            creditType: "physical",
            transactionType: "grant_subscription",
            amount: planPhysicalCredits,
            balanceBefore: currentPhysicalCredits,
            balanceAfter: newPhysicalTotal,
            source: `${transactionSourceBase}:physical`,
            metadata: {
              plan,
              subscriptionId: subscription.id,
              periodStart: safePeriodStart.toISOString(),
              periodEnd: safePeriodEnd.toISOString(),
              planChangeType,
              previousPlan,
            },
          },
        })
      }

      // Update user with new credit totals
      await tx.user.update({
        where: { id: user.id },
        data: {
          planType: plan,
          emailCredits: newEmailTotal,
          physicalCredits: newPhysicalTotal,
          creditExpiresAt: safePeriodEnd,
        },
      })

      console.log("[Subscription Handler] Credits granted (within transaction)", {
        subscriptionId: subscription.id,
        userId: user.id,
        planChangeType,
        planEmailCredits,
        planPhysicalCredits,
        addonEmailPreserved: addonEmail,
        addonPhysicalPreserved: addonPhysical,
        newEmailTotal,
        newPhysicalTotal,
      })
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

  // Get subscription and user info BEFORE transaction for post-transaction operations
  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true },
  })

  if (!existingSub) {
    console.warn("[Subscription Handler] Subscription not found for deletion", {
      subscriptionId: subscription.id,
    })
    return
  }

  const userId = existingSub.userId

  // ATOMIC TRANSACTION: Subscription status + credit clearing must succeed or fail together
  // This prevents inconsistent state where subscription is canceled but credits remain
  await prisma.$transaction(async (tx) => {
    // Update subscription status INSIDE transaction
    await tx.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: "canceled" },
    })

    // Get current balances for audit trail
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { emailCredits: true, physicalCredits: true },
    })

    if (currentUser) {
      // Record email credit removal if any credits existed
      if (currentUser.emailCredits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId,
            creditType: "email",
            transactionType: "deduct_cancel",
            amount: -currentUser.emailCredits,
            balanceBefore: currentUser.emailCredits,
            balanceAfter: 0,
            source: `${subscription.id}:cancel`,
            metadata: {
              reason: "subscription_canceled",
              subscriptionId: subscription.id,
            },
          },
        })
      }

      // Record physical credit removal if any credits existed
      if (currentUser.physicalCredits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId,
            creditType: "physical",
            transactionType: "deduct_cancel",
            amount: -currentUser.physicalCredits,
            balanceBefore: currentUser.physicalCredits,
            balanceAfter: 0,
            source: `${subscription.id}:cancel`,
            metadata: {
              reason: "subscription_canceled",
              subscriptionId: subscription.id,
            },
          },
        })
      }
    }

    // Clear all credits and plan
    await tx.user.update({
      where: { id: userId },
      data: {
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
      },
    })

    console.log("[Subscription Handler] Subscription and credits cleared (within transaction)", {
      subscriptionId: subscription.id,
      userId,
    })
  })

  // NON-CRITICAL operations AFTER transaction completes
  // These can fail without affecting data consistency

  // Invalidate entitlements cache
  await invalidateEntitlementsCache(userId)

  // Send cancellation email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  if (user) {
    await sendBillingEmail("subscription-canceled", userId, user.email, {
      subscriptionId: subscription.id,
      canceledAt: new Date().toISOString(),
    })
  }

  // Record audit event
  await recordBillingAudit(userId, AuditEventType.SUBSCRIPTION_CANCELED, {
    subscriptionId: subscription.id,
  })

  console.log("[Subscription Handler] Subscription cancellation processed", {
    subscriptionId: subscription.id,
    userId,
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
