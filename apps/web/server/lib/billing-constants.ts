import type { PlanType } from "@prisma/client"
import type Stripe from "stripe"
import { env } from "@/env.mjs"

export const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 9, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
}

/**
 * Plan hierarchy for upgrade/downgrade detection.
 * Higher index = higher tier plan.
 */
const PLAN_HIERARCHY: readonly PlanType[] = ["DIGITAL_CAPSULE", "PAPER_PIXELS"] as const

/**
 * Plan change type for credit handling logic.
 * - "upgrade": User moved to a higher tier (stack credits)
 * - "downgrade": User moved to a lower tier (reset to new plan + addons)
 * - "same": No plan change
 * - "new": New subscription (no previous plan)
 */
export type PlanChangeType = "upgrade" | "downgrade" | "same" | "new"

/**
 * Compare two plans to determine the type of change.
 *
 * @param fromPlan - Previous plan (null for new subscriptions)
 * @param toPlan - New plan
 * @returns Type of plan change
 */
export function comparePlans(
  fromPlan: PlanType | null | undefined,
  toPlan: PlanType
): PlanChangeType {
  if (!fromPlan) return "new"
  if (fromPlan === toPlan) return "same"

  const fromIndex = PLAN_HIERARCHY.indexOf(fromPlan)
  const toIndex = PLAN_HIERARCHY.indexOf(toPlan)

  if (fromIndex === -1 || toIndex === -1) {
    console.warn("[Billing] Unknown plan in comparison", { fromPlan, toPlan })
    return "same"
  }

  return toIndex > fromIndex ? "upgrade" : "downgrade"
}

/**
 * Determine if credits should be stacked (upgrade only).
 *
 * Credit stacking rules:
 * - Upgrade: Stack new credits on top of existing (reward loyalty)
 * - Downgrade: Reset to new plan + addons (prevent credit hoarding)
 * - New/Renewal: Set to plan + addons
 *
 * @param fromPlan - Previous plan
 * @param toPlan - New plan
 * @returns true if credits should be stacked
 */
export function shouldStackCredits(
  fromPlan: PlanType | null | undefined,
  toPlan: PlanType
): boolean {
  return comparePlans(fromPlan, toPlan) === "upgrade"
}

/**
 * Map Stripe price ID to PlanType.
 *
 * This is essential for detecting plan changes when users upgrade/downgrade
 * via Stripe Billing Portal, where subscription metadata may not be set.
 * Price IDs are always present in subscription.items and provide reliable
 * plan detection regardless of how the subscription was created or modified.
 *
 * @param priceId - The Stripe price ID from subscription.items.data[0].price.id
 * @returns The PlanType or null if not a subscription plan price (e.g., add-ons)
 */
export function getPlanFromPriceId(priceId: string | undefined | null): PlanType | null {
  if (!priceId) return null

  // Map subscription plan price IDs to PlanType
  if (priceId === env.STRIPE_PRICE_DIGITAL_ANNUAL) {
    return "DIGITAL_CAPSULE"
  }

  if (priceId === env.STRIPE_PRICE_PAPER_ANNUAL) {
    return "PAPER_PIXELS"
  }

  // Add-on prices (STRIPE_PRICE_ADDON_EMAIL, STRIPE_PRICE_ADDON_PHYSICAL,
  // STRIPE_PRICE_TRIAL_PHYSICAL) are not subscription plans
  return null
}

// ============================================================================
// CREDIT ADDON PRICING
// Re-exported from shared pricing-constants.ts for backward compatibility
// @see apps/web/lib/pricing-constants.ts for the source of truth
// ============================================================================
export {
  type CreditAddonType,
  type PricingTier,
  CREDIT_ADDON_BASE_PRICES,
  CREDIT_ADDON_TIERS,
  getCreditAddonTier,
  calculateCreditAddonPrice,
  getCreditAddonDiscount,
} from "@/lib/pricing-constants"

export function toDateOrNow(seconds: number | null | undefined, label: string): Date {
  if (typeof seconds === "number" && Number.isFinite(seconds)) {
    return new Date(seconds * 1000)
  }

  console.warn(`[Billing] Missing or invalid timestamp for ${label}, using now()`, {
    seconds,
  })

  return new Date()
}

export function ensureValidDate(date: Date, label: string): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date
  }

  console.warn(`[Billing] Coercing invalid date to now() for ${label}`, { value: date })
  return new Date()
}

/**
 * Extract subscription period dates from Stripe subscription object.
 *
 * As of Stripe API version 2025-03-31.basil, `current_period_start` and `current_period_end`
 * have been moved from the Subscription object to the SubscriptionItem level.
 * This helper function extracts the period dates from the first subscription item
 * as a fallback when not present at the root level.
 *
 * @see https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end
 */
export function getSubscriptionPeriodDates(subscription: Stripe.Subscription): {
  periodStart: Date
  periodEnd: Date
} {
  // Try root level first (legacy API versions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootStart = (subscription as any).current_period_start
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootEnd = (subscription as any).current_period_end

  // Try subscription item level (API version 2025-03-31+)
  const firstItem = subscription.items?.data?.[0]
  const itemStart = firstItem?.current_period_start
  const itemEnd = firstItem?.current_period_end

  // Use item-level if root is undefined/null, otherwise use root
  const periodStartSeconds = rootStart ?? itemStart
  const periodEndSeconds = rootEnd ?? itemEnd

  const periodStart = ensureValidDate(
    toDateOrNow(periodStartSeconds, "current_period_start"),
    "current_period_start"
  )
  const periodEnd = ensureValidDate(
    toDateOrNow(periodEndSeconds, "current_period_end"),
    "current_period_end"
  )

  return { periodStart, periodEnd }
}
