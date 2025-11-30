/**
 * Billing Server Actions
 *
 * Handles subscription checkout, billing portal access, and payment operations.
 * All actions use ActionResult pattern for type-safe error handling.
 *
 * @module actions/billing
 */

"use server"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent, AuditEventType } from "@/server/lib/audit"
import {
  createCheckoutSession as createStripeCheckoutSession,
  createBillingPortalSession as createStripeBillingPortalSession,
  getOrCreateCustomer,
} from "@/server/providers/stripe/checkout"
import { isValidPriceId } from "@/server/providers/stripe/client"
import type { ActionResult } from "@dearme/types"
import { ErrorCodes } from "@dearme/types"
import type Stripe from "stripe"

/**
 * Create Stripe Checkout Session for subscription purchase
 *
 * Flow:
 * 1. Validate price ID against allowed values
 * 2. Check for existing active subscription
 * 3. Get or create Stripe customer
 * 4. Create checkout session with 14-day trial
 * 5. Log audit event
 *
 * @param input - Price ID for the subscription
 * @returns Session URL for redirect
 *
 * @throws Never - All errors returned as ActionResult
 *
 * @example
 * const result = await createCheckoutSession({ priceId: 'price_123' })
 * if (result.success) {
 *   window.location.href = result.data.url
 * }
 */
export async function createCheckoutSession(input: {
  priceId: string
}): Promise<ActionResult<{ url: string }>> {
  try {
    // 1. Authenticate user
    const user = await requireUser()

    // 2. Validate price ID
    if (!isValidPriceId(input.priceId)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INVALID_INPUT,
          message: "Invalid pricing plan selected. Please choose a valid plan.",
        },
      }
    }

    // 3. Check for existing subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["active", "trialing"] },
      },
    })

    if (existingSubscription) {
      return {
        success: false,
        error: {
          code: ErrorCodes.ALREADY_SUBSCRIBED,
          message: "You already have an active subscription",
          details: {
            subscriptionId: existingSubscription.id,
            manageUrl: "/settings/billing",
          },
        },
      }
    }

    // 4. Get or create Stripe customer
    let customerId: string
    try {
      customerId = await getOrCreateCustomer({
        email: user.email,
        userId: user.id,
        clerkUserId: user.clerkUserId ?? undefined,
        existingCustomerId: user.profile?.stripeCustomerId ?? undefined,
      })

      // Update profile with customer ID if newly created
      if (customerId !== user.profile?.stripeCustomerId) {
        await prisma.profile.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        })
      }
    } catch (error) {
      console.error("[Billing] Failed to get/create Stripe customer:", error)
      return {
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
          message: "Failed to initialize payment. Please try again.",
        },
      }
    }

    // 5. Create checkout session
    let session: Stripe.Checkout.Session
    try {
      session = await createStripeCheckoutSession({
        customerId,
        priceId: input.priceId,
        userId: user.id,
      })
    } catch (error) {
      console.error("[Billing] Failed to create checkout session:", error)
      return {
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
          message: "Failed to create checkout session. Please try again.",
        },
      }
    }

    // 6. Audit log
    try {
      await createAuditEvent({
        userId: user.id,
        type: AuditEventType.CHECKOUT_SESSION_CREATED,
        data: {
          sessionId: session.id,
          priceId: input.priceId,
          customerId,
        },
      })
    } catch (error) {
      // Non-critical - log but don't fail
      console.error("[Billing] Failed to create audit event:", error)
    }

    // 7. Return session URL
    if (!session.url) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
          message: "Failed to generate checkout URL. Please try again.",
        },
      }
    }

    return {
      success: true,
      data: { url: session.url },
    }
  } catch (error) {
    console.error("[Billing] Checkout session creation error:", error)

    // Handle authentication errors
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Please sign in to continue",
        },
      }
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "An unexpected error occurred. Please try again.",
      },
    }
  }
}

/**
 * Create Stripe Billing Portal Session for subscription management
 *
 * Allows users to:
 * - Update payment method
 * - Cancel subscription
 * - View invoices
 * - Update billing information
 *
 * @returns Portal URL for redirect
 *
 * @throws Never - All errors returned as ActionResult
 *
 * @example
 * const result = await createBillingPortalSession()
 * if (result.success) {
 *   window.location.href = result.data.url
 * }
 */
export async function createBillingPortalSession(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    // 1. Authenticate user
    const user = await requireUser()

    // 2. Require existing Stripe customer
    const customerId = user.profile?.stripeCustomerId

    if (!customerId) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NO_CUSTOMER,
          message: "No billing account found. Please subscribe first.",
          details: {
            action: "subscribe",
            url: "/pricing",
          },
        },
      }
    }

    // 3. Create portal session
    let session: Stripe.BillingPortal.Session
    try {
      session = await createStripeBillingPortalSession(customerId)
    } catch (error) {
      console.error("[Billing] Failed to create portal session:", error)
      return {
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
          message: "Failed to access billing portal. Please try again.",
        },
      }
    }

    // 4. Audit log
    try {
      await createAuditEvent({
        userId: user.id,
        type: AuditEventType.BILLING_PORTAL_SESSION_CREATED,
        data: { sessionId: session.id },
      })
    } catch (error) {
      // Non-critical - log but don't fail
      console.error("[Billing] Failed to create audit event:", error)
    }

    return {
      success: true,
      data: { url: session.url },
    }
  } catch (error) {
    console.error("[Billing] Portal session creation error:", error)

    // Handle authentication errors
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Please sign in to continue",
        },
      }
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "An unexpected error occurred. Please try again.",
      },
    }
  }
}

/**
 * Check subscription status (for client-side polling)
 *
 * Used by checkout success page to poll for subscription after webhook processing.
 *
 * @returns Subscription status or null if not found
 */
export async function checkSubscriptionStatus(): Promise<
  ActionResult<{ hasSubscription: boolean }>
> {
  try {
    const user = await requireUser()

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["active", "trialing"] },
      },
    })

    return {
      success: true,
      data: { hasSubscription: !!subscription },
    }
  } catch (error) {
    console.error("[Billing] Subscription status check error:", error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to check subscription status",
      },
    }
  }
}
