"use server"

import { requireUser } from "@/server/lib/auth"
import { stripe } from "@/server/providers/stripe"
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
      metadata: {
        userId: user.id,
        addon_type: input.type,
        quantity: (input.quantity ?? 1).toString(),
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
