"use server"

import { z } from "zod"
import { requireUser } from "@/server/lib/auth"
import { stripe } from "@/server/providers/stripe/client"
import { env } from "@/env.mjs"
import type { ActionResult } from "@dearme/types"
import { ErrorCodes } from "@dearme/types"
import {
  getCreditAddonTier,
  CREDIT_ADDON_BASE_PRICES,
  type CreditAddonType,
} from "@/lib/pricing-constants"

type AddOnType = "email" | "physical"

/**
 * Stripe price IDs for credit addons (used as feature flags)
 *
 * NOTE: These are NOT used for pricing - pricing is calculated at backend
 * using volume discount tiers from pricing-constants.ts.
 * These serve as feature flags: if not set, the addon type is disabled.
 */
const ADDON_PRICE_IDS: Record<AddOnType, string | undefined> = {
  email: env.STRIPE_PRICE_ADDON_EMAIL,
  physical: env.STRIPE_PRICE_ADDON_PHYSICAL,
}

/**
 * Product names for Stripe checkout display
 */
const ADDON_PRODUCT_NAMES: Record<AddOnType, string> = {
  email: "Email Credit",
  physical: "Physical Mail Credit",
}

// Validation constraints for addon quantities
const MIN_ADDON_QUANTITY = 1
const MAX_ADDON_QUANTITY = 100 // Reasonable upper limit to prevent abuse

const addonCheckoutSchema = z.object({
  type: z.enum(["email", "physical"]),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(MIN_ADDON_QUANTITY, `Minimum quantity is ${MIN_ADDON_QUANTITY}`)
    .max(MAX_ADDON_QUANTITY, `Maximum quantity is ${MAX_ADDON_QUANTITY}`)
    .optional()
    .default(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function createAddOnCheckoutSession(input: {
  type: AddOnType
  quantity?: number
  successUrl?: string
  cancelUrl?: string
}): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = addonCheckoutSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid addon request",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const { type, quantity, successUrl, cancelUrl } = validated.data

    // Check if addon type is enabled (env var set = feature enabled)
    const isAddonEnabled = ADDON_PRICE_IDS[type]
    if (!isAddonEnabled) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INVALID_INPUT,
          message: "Add-on not available",
        },
      }
    }

    // Ensure user has a Stripe customer
    const customerId = user.profile?.stripeCustomerId
    if (!customerId) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NO_CUSTOMER,
          message: "No billing account found. Subscribe first.",
        },
      }
    }

    // Calculate volume-discounted price at backend
    // Stripe products don't have volume pricing - we handle discounts here
    const tier = getCreditAddonTier(type as CreditAddonType, quantity)
    const unitAmountCents = Math.round(tier.unitPrice * 100) // Convert to cents for Stripe
    const basePrice = CREDIT_ADDON_BASE_PRICES[type as CreditAddonType]
    const discountPercent = tier.discountPercent

    // Create Stripe Checkout session with calculated price_data
    // Using price_data allows dynamic pricing based on quantity tier
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmountCents,
            product_data: {
              name: quantity > 1
                ? `${ADDON_PRODUCT_NAMES[type]} (${quantity}x)`
                : ADDON_PRODUCT_NAMES[type],
              description: discountPercent > 0
                ? `${discountPercent}% volume discount applied ($${tier.unitPrice.toFixed(2)}/ea instead of $${basePrice.toFixed(2)})`
                : `$${tier.unitPrice.toFixed(2)} per credit`,
            },
          },
          quantity,
        },
      ],
      success_url: successUrl || `${env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
      cancel_url: cancelUrl || `${env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
      // Session metadata - used by checkout.session.completed webhook (PRIMARY fulfillment)
      metadata: {
        userId: user.id,
        addon_type: type,
        quantity: quantity.toString(),
        type: "credit_addon", // Identifies this as credit addon for webhook routing
        unit_price_cents: unitAmountCents.toString(),
        discount_percent: discountPercent.toString(),
      },
      // Payment intent metadata - backup for payment_intent.succeeded webhook
      payment_intent_data: {
        metadata: {
          userId: user.id,
          addon_type: type,
          quantity: quantity.toString(),
          type: "credit_addon",
          unit_price_cents: unitAmountCents.toString(),
          discount_percent: discountPercent.toString(),
        },
      },
    })

    if (!session.url) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
          message: "Failed to create checkout session",
        },
      }
    }

    return { success: true, data: { url: session.url } }
  } catch {
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to start add-on checkout",
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}
