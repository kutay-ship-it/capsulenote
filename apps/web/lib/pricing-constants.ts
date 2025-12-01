/**
 * Credit Addon Pricing Constants (Shared)
 *
 * This file contains pricing tiers for credit addons that are used by:
 * - Client components (credit indicator UI, sandbox page)
 * - Server actions (checkout session creation)
 * - Webhook handlers (fulfillment validation)
 *
 * IMPORTANT: These tiers MUST match Stripe Dashboard volume pricing configuration.
 * When updating, change BOTH here AND in Stripe Dashboard.
 *
 * Stripe Dashboard Setup:
 * 1. Products → Email Credit / Physical Mail Credit
 * 2. Edit Price → Pricing model: Tiered → Tiers mode: Volume
 * 3. Configure tiers to match CREDIT_ADDON_TIERS below
 */

export type CreditAddonType = "email" | "physical"

export interface PricingTier {
  /** Minimum quantity for this tier (inclusive) */
  minQuantity: number
  /** Maximum quantity for this tier (inclusive), null = unlimited */
  maxQuantity: number | null
  /** Price per unit in this tier (USD) */
  unitPrice: number
  /** Discount percentage compared to base price */
  discountPercent: number
}

/**
 * Base prices for credit addons (no discount)
 * Must match Stripe Price tier 1 (1-4 units)
 */
export const CREDIT_ADDON_BASE_PRICES: Record<CreditAddonType, number> = {
  email: 0.99,
  physical: 4.99,
}

/**
 * Volume pricing tiers for credit addons
 * MUST be kept in sync with Stripe Dashboard volume pricing
 *
 * @example Stripe Dashboard configuration for Email Credits:
 * Tier 1: 1-4 units → $0.99/unit
 * Tier 2: 5-9 units → $0.89/unit (10% off)
 * Tier 3: 10-24 units → $0.84/unit (15% off)
 * Tier 4: 25-49 units → $0.79/unit (20% off)
 * Tier 5: 50+ units → $0.74/unit (25% off)
 */
export const CREDIT_ADDON_TIERS: Record<CreditAddonType, PricingTier[]> = {
  email: [
    { minQuantity: 1, maxQuantity: 4, unitPrice: 0.99, discountPercent: 0 },
    { minQuantity: 5, maxQuantity: 9, unitPrice: 0.89, discountPercent: 10 },
    { minQuantity: 10, maxQuantity: 24, unitPrice: 0.84, discountPercent: 15 },
    { minQuantity: 25, maxQuantity: 49, unitPrice: 0.79, discountPercent: 20 },
    { minQuantity: 50, maxQuantity: null, unitPrice: 0.74, discountPercent: 25 },
  ],
  physical: [
    { minQuantity: 1, maxQuantity: 4, unitPrice: 4.99, discountPercent: 0 },
    { minQuantity: 5, maxQuantity: 9, unitPrice: 4.49, discountPercent: 10 },
    { minQuantity: 10, maxQuantity: 24, unitPrice: 4.24, discountPercent: 15 },
    { minQuantity: 25, maxQuantity: 49, unitPrice: 3.99, discountPercent: 20 },
    { minQuantity: 50, maxQuantity: null, unitPrice: 3.74, discountPercent: 25 },
  ],
}

/**
 * Get the applicable pricing tier for a given quantity
 */
export function getCreditAddonTier(
  type: CreditAddonType,
  quantity: number
): PricingTier {
  const tiers = CREDIT_ADDON_TIERS[type]

  for (const tier of tiers) {
    if (
      quantity >= tier.minQuantity &&
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    ) {
      return tier
    }
  }

  // Fallback to last tier (50+) - guaranteed to exist since tiers array is non-empty
  const lastTier = tiers[tiers.length - 1]
  if (!lastTier) {
    // This should never happen but TypeScript needs this check
    return { minQuantity: 1, maxQuantity: null, unitPrice: CREDIT_ADDON_BASE_PRICES[type], discountPercent: 0 }
  }
  return lastTier
}

/**
 * Calculate total price for credit addon purchase
 * Uses volume pricing (all units at same tier price)
 */
export function calculateCreditAddonPrice(
  type: CreditAddonType,
  quantity: number
): {
  total: number
  unitPrice: number
  discountPercent: number
  savings: number
} {
  const tier = getCreditAddonTier(type, quantity)
  const basePrice = CREDIT_ADDON_BASE_PRICES[type]

  const total = Number((quantity * tier.unitPrice).toFixed(2))
  const fullPrice = Number((quantity * basePrice).toFixed(2))
  const savings = Number((fullPrice - total).toFixed(2))

  return {
    total,
    unitPrice: tier.unitPrice,
    discountPercent: tier.discountPercent,
    savings,
  }
}

/**
 * Get discount percentage for a given quantity (convenience function)
 */
export function getCreditAddonDiscount(
  type: CreditAddonType,
  quantity: number
): number {
  return getCreditAddonTier(type, quantity).discountPercent
}
