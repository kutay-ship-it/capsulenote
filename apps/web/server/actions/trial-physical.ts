"use server"

import { requireUser } from "@/server/lib/auth"
import {
  canPurchasePhysicalTrial,
  invalidateEntitlementsCache,
} from "@/server/lib/entitlements"
import { stripe } from "@/server/providers/stripe/client"
import { env } from "@/env.mjs"
import { prisma } from "@/server/lib/db"
import { logger } from "@/server/lib/logger"
import { type ActionResult, ErrorCodes } from "@dearme/types"

/**
 * Create a Stripe Checkout session for the one-time physical mail trial credit
 * Only available for Digital Capsule users who haven't purchased trial before
 */
export async function createTrialPhysicalCheckoutSession(input?: {
  successUrl?: string
  cancelUrl?: string
}): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireUser()

    // Check eligibility
    const canPurchase = await canPurchasePhysicalTrial(user.id)
    if (!canPurchase) {
      await logger.warn("User ineligible for physical mail trial", {
        userId: user.id,
        reason: "already_purchased_or_wrong_plan",
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: "Trial credit not available for your account",
          details: {
            reason: "You may have already purchased the trial credit or are not on the Digital Capsule plan",
          },
        },
      }
    }

    // Check if trial price is configured
    const priceId = env.STRIPE_PRICE_TRIAL_PHYSICAL
    if (!priceId) {
      await logger.error("STRIPE_PRICE_TRIAL_PHYSICAL not configured", {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: "Trial credit not currently available",
        },
      }
    }

    // Get user's Stripe customer ID
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    })

    if (!profile?.stripeCustomerId) {
      await logger.warn("No Stripe customer ID found for user", {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: "No billing account found. Please contact support.",
        },
      }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: profile.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:
        input?.successUrl ||
        `${env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&trial=success`,
      cancel_url:
        input?.cancelUrl || `${env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
      metadata: {
        userId: user.id,
        type: "physical_mail_trial",
      },
    })

    if (!session.url) {
      await logger.error("Stripe checkout session created without URL", {
        userId: user.id,
        sessionId: session.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.CREATION_FAILED,
          message: "Failed to create checkout session. Please try again.",
        },
      }
    }

    await logger.info("Trial physical mail checkout session created", {
      userId: user.id,
      sessionId: session.id,
    })

    return {
      success: true,
      data: { url: session.url },
    }
  } catch (error) {
    await logger.error("Error creating trial checkout session", error, {
      context: "createTrialPhysicalCheckoutSession",
    })

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
 * Fulfill the physical mail trial credit after successful payment
 * Called by the Stripe webhook handler
 */
export async function fulfillTrialPhysicalCredit(
  userId: string,
  stripeSessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Idempotency check - don't grant twice
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        physicalMailTrialPurchasedAt: true,
        physicalCredits: true,
      },
    })

    if (!user) {
      await logger.error("User not found for trial fulfillment", {
        userId,
        stripeSessionId,
      })
      return { success: false, error: "User not found" }
    }

    // Already fulfilled - idempotent success
    if (user.physicalMailTrialPurchasedAt) {
      await logger.info("Trial credit already fulfilled (idempotent)", {
        userId,
        stripeSessionId,
        purchasedAt: user.physicalMailTrialPurchasedAt,
      })
      return { success: true }
    }

    // Grant credit and mark purchased in transaction
    await prisma.$transaction(async (tx) => {
      // Record credit transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          creditType: "physical",
          transactionType: "grant_trial",
          amount: 1,
          balanceBefore: user.physicalCredits,
          balanceAfter: user.physicalCredits + 1,
          source: stripeSessionId,
          metadata: { type: "physical_mail_trial" },
        },
      })

      // Grant credit and mark purchased
      await tx.user.update({
        where: { id: userId },
        data: {
          physicalCredits: { increment: 1 },
          physicalMailTrialPurchasedAt: new Date(),
        },
      })
    })

    // Invalidate entitlements cache
    await invalidateEntitlementsCache(userId)

    await logger.info("Trial physical mail credit fulfilled successfully", {
      userId,
      stripeSessionId,
      newCredits: user.physicalCredits + 1,
    })

    return { success: true }
  } catch (error) {
    await logger.error("Error fulfilling trial credit", error, {
      userId,
      stripeSessionId,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
