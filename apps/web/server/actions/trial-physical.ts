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
        `${env.NEXT_PUBLIC_APP_URL}/credits/success`,
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
    // Grant credit and mark purchased in transaction with atomic check
    // This prevents race conditions where concurrent webhook calls could grant duplicate credits
    const result = await prisma.$transaction(async (tx) => {
      // Atomic check-and-update to prevent race conditions
      // Only update if physicalMailTrialPurchasedAt is null (not already fulfilled)
      const updateResult = await tx.user.updateMany({
        where: {
          id: userId,
          physicalMailTrialPurchasedAt: null, // Only if not already purchased
        },
        data: {
          physicalCredits: { increment: 1 },
          physicalMailTrialPurchasedAt: new Date(),
        },
      })

      if (updateResult.count === 0) {
        // Either user not found or already fulfilled - check which
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { physicalMailTrialPurchasedAt: true },
        })

        if (!user) {
          return { status: "user_not_found" as const }
        }

        // Already fulfilled - idempotent success
        return {
          status: "already_fulfilled" as const,
          purchasedAt: user.physicalMailTrialPurchasedAt,
        }
      }

      // Get updated balance for audit trail
      const updated = await tx.user.findUnique({
        where: { id: userId },
        select: { physicalCredits: true },
      })
      const balanceAfter = updated!.physicalCredits
      const balanceBefore = balanceAfter - 1

      // Record credit transaction with accurate balances
      await tx.creditTransaction.create({
        data: {
          userId,
          creditType: "physical",
          transactionType: "grant_trial",
          amount: 1,
          balanceBefore,
          balanceAfter,
          source: stripeSessionId,
          metadata: { type: "physical_mail_trial" },
        },
      })

      return { status: "granted" as const, newCredits: balanceAfter }
    })

    // Handle transaction results
    if (result.status === "user_not_found") {
      await logger.error("User not found for trial fulfillment", {
        userId,
        stripeSessionId,
      })
      return { success: false, error: "User not found" }
    }

    if (result.status === "already_fulfilled") {
      await logger.info("Trial credit already fulfilled (idempotent)", {
        userId,
        stripeSessionId,
        purchasedAt: result.purchasedAt,
      })
      return { success: true }
    }

    // Invalidate entitlements cache
    await invalidateEntitlementsCache(userId)

    await logger.info("Trial physical mail credit fulfilled successfully", {
      userId,
      stripeSessionId,
      newCredits: result.newCredits,
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
