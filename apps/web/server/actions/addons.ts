"use server"

import { z } from "zod"
import { requireUser } from "@/server/lib/auth"
import { stripe } from "@/server/providers/stripe/client"
import { env } from "@/env.mjs"
import type { ActionResult } from "@dearme/types"
import { ErrorCodes } from "@dearme/types"

type AddOnType = "email" | "physical"

const ADDON_PRICE_IDS: Record<AddOnType, string | undefined> = {
  email: env.STRIPE_PRICE_ADDON_EMAIL,
  physical: env.STRIPE_PRICE_ADDON_PHYSICAL,
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
    const priceId = ADDON_PRICE_IDS[type]

    if (!priceId) {
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

    // Create Stripe Checkout session with volume pricing
    // Stripe will calculate the correct total based on quantity tier
    // @see CREDIT_ADDON_TIERS in billing-constants.ts for tier configuration
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      success_url: successUrl || `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      cancel_url: cancelUrl || `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      // Session metadata - used by checkout.session.completed webhook (PRIMARY fulfillment)
      metadata: {
        userId: user.id,
        addon_type: type,
        quantity: quantity.toString(),
        type: "credit_addon", // Identifies this as credit addon for webhook routing
      },
      // Payment intent metadata - backup for payment_intent.succeeded webhook
      payment_intent_data: {
        metadata: {
          userId: user.id,
          addon_type: type,
          quantity: quantity.toString(),
          type: "credit_addon",
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
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to start add-on checkout",
        details: error,
      },
    }
  }
}
