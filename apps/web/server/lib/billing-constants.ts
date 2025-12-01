import type { PlanType } from "@prisma/client"
import type Stripe from "stripe"

export const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 6, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
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
