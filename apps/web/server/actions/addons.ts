"use server"

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

export async function createAddOnCheckoutSession(input: {
  type: AddOnType
  quantity?: number
  successUrl?: string
  cancelUrl?: string
}): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireUser()
    const priceId = ADDON_PRICE_IDS[input.type]

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
          quantity: input.quantity ?? 1,
        },
      ],
      success_url: input.successUrl || `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      cancel_url: input.cancelUrl || `${env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      // Session metadata - used by checkout.session.completed webhook (PRIMARY fulfillment)
      metadata: {
        userId: user.id,
        addon_type: input.type,
        quantity: (input.quantity ?? 1).toString(),
        type: "credit_addon", // Identifies this as credit addon for webhook routing
      },
      // Payment intent metadata - backup for payment_intent.succeeded webhook
      payment_intent_data: {
        metadata: {
          userId: user.id,
          addon_type: input.type,
          quantity: (input.quantity ?? 1).toString(),
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
