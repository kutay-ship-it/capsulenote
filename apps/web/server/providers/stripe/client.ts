/**
 * Stripe Client Singleton
 *
 * Provides configured Stripe instance for all billing operations.
 * Uses server-side API key with proper error handling and retry logic.
 *
 * @module stripe/client
 */

import Stripe from "stripe"
import { env } from "@/env.mjs"

/**
 * Stripe client singleton instance
 *
 * Configured with:
 * - Latest API version
 * - TypeScript support
 * - Automatic retry with exponential backoff
 * - Request timeout: 60 seconds
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 60000, // 60 seconds
  appInfo: {
    name: "DearMe",
    version: "1.0.0",
  },
})

/**
 * Helper: Get allowed price IDs from environment
 *
 * Used for validation in checkout flow to prevent unauthorized
 * price submissions.
 */
export function getAllowedPriceIds(): string[] {
  return [
    env.STRIPE_PRICE_DIGITAL_ANNUAL,
    env.STRIPE_PRICE_PAPER_ANNUAL,
    env.STRIPE_PRICE_ADDON_EMAIL,
    env.STRIPE_PRICE_ADDON_PHYSICAL,
  ].filter(Boolean) as string[]
}

/**
 * Helper: Validate price ID
 *
 * @param priceId - Price ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidPriceId(priceId: string): boolean {
  return getAllowedPriceIds().includes(priceId)
}
