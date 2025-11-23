"use server"

/**
 * Anonymous Checkout Server Actions
 *
 * Handles subscription checkout for unauthenticated users:
 * 1. createAnonymousCheckout - Create Stripe checkout with locked email
 * 2. linkPendingSubscription - Link payment to user account after signup
 *
 * Security:
 * - Email locked in Stripe (customer created first)
 * - Email verification required before activation
 * - Idempotent operations
 * - Comprehensive audit trail
 */

import type { PlanType } from "@prisma/client"
import { stripe } from "@/server/providers/stripe"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { env } from "@/env.mjs"
import { invalidateEntitlementsCache, createUsageRecord } from "@/server/lib/stripe-helpers"
import { isValidPriceId } from "@/server/providers/stripe/client"
import { getClerkClient } from "@/server/lib/clerk"
import {
  anonymousCheckoutSchema,
  type AnonymousCheckoutInput,
  type AnonymousCheckoutResponse,
  type LinkPendingSubscriptionResult,
} from "@dearme/types"

const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 6, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
}

/**
 * Create anonymous checkout session
 *
 * Flow:
 * 1. Validate email and check for existing PendingSubscription
 * 2. Handle resume checkout if session still valid
 * 3. Create Stripe Customer (locks email)
 * 4. Create Stripe Checkout Session
 * 5. Create PendingSubscription record
 *
 * @throws Error if email already has completed payment
 * @throws Error if Stripe API fails
 */
export async function createAnonymousCheckout(
  input: AnonymousCheckoutInput
): Promise<AnonymousCheckoutResponse> {
  // 1. Validate input
  const validated = anonymousCheckoutSchema.parse(input)

  if (!isValidPriceId(validated.priceId)) {
    throw new Error("Invalid pricing plan selected")
  }

  // 2. Check for existing PendingSubscription
  const existing = await prisma.pendingSubscription.findFirst({
    where: {
      email: validated.email,
      status: { in: ["awaiting_payment", "payment_complete"] },
      expiresAt: { gt: new Date() }, // Not expired
    },
  })

  // 3. Handle existing pending subscription
  if (existing) {
    if (existing.status === "awaiting_payment") {
      // Resume existing checkout if session still valid
      try {
        const session = await stripe.checkout.sessions.retrieve(existing.stripeSessionId)

        if (session.status === "open" && session.url) {
          console.log("[createAnonymousCheckout] Resuming existing session", {
            email: validated.email,
            sessionId: existing.stripeSessionId,
          })

          return {
            sessionId: session.id,
            sessionUrl: session.url,
            customerId: existing.stripeCustomerId,
          }
        }
      } catch (error) {
        console.warn("[createAnonymousCheckout] Existing session invalid, creating new one", {
          email: validated.email,
          error: error instanceof Error ? error.message : String(error),
        })
        // Session expired or invalid, continue to create new one
      }
    }

    if (existing.status === "payment_complete") {
      // Already paid, redirect to signup
      throw new Error("ALREADY_PAID")
    }
  }

  // 4. Create Stripe Customer (THIS LOCKS THE EMAIL)
  const customer = await stripe.customers.create({
    email: validated.email,
    metadata: {
      source: "anonymous_checkout",
      letterId: validated.letterId || "",
      ...validated.metadata,
    },
  })

  console.log("[createAnonymousCheckout] Stripe customer created", {
    customerId: customer.id,
    email: validated.email,
  })

  // 5. Get pricing info
  const price = await stripe.prices.retrieve(validated.priceId)
  const product = await stripe.products.retrieve(price.product as string)

  // 6. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id, // Email locked because customer exists
    payment_method_types: ["card"],
    line_items: [
      {
        price: validated.priceId,
        quantity: 1,
      },
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe`,
    metadata: {
      email: validated.email,
      letterId: validated.letterId || "",
      ...validated.metadata,
    },
    expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  })

  console.log("[createAnonymousCheckout] Checkout session created", {
    sessionId: session.id,
    email: validated.email,
  })

  // 7. Determine plan from product name
  const planMap: Record<string, PlanType> = {
    "digital capsule": "DIGITAL_CAPSULE",
    "paper & pixels": "PAPER_PIXELS",
    "paper and pixels": "PAPER_PIXELS",
  }
  const plan = planMap[product.name.toLowerCase()] || "DIGITAL_CAPSULE"

  // 8. Create PendingSubscription record
  await prisma.pendingSubscription.create({
    data: {
      email: validated.email,
      stripeCustomerId: customer.id,
      stripeSessionId: session.id,
      priceId: validated.priceId,
      plan,
      amountCents: price.unit_amount || 0,
      currency: price.currency,
      status: "awaiting_payment",
      metadata: validated.metadata || {},
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  // 9. Create audit event
  await createAuditEvent({
    userId: null, // No user yet
    type: "subscription.checkout_created",
    data: {
      email: validated.email,
      sessionId: session.id,
      plan: product.name,
      amount: price.unit_amount,
      letterId: validated.letterId,
    },
  })

  return {
    sessionId: session.id,
    sessionUrl: session.url!,
    customerId: customer.id,
  }
}

/**
 * Link pending subscription to user account
 *
 * Called after user signup (from Clerk webhook or dashboard mount)
 *
 * Flow:
 * 1. Get user and verify email
 * 2. Find matching PendingSubscription
 * 3. Verify email verification status
 * 4. Create Subscription record (promote from pending)
 * 5. Update Profile with Stripe customer ID
 * 6. Mark PendingSubscription as linked
 *
 * @param userId User ID to link subscription to
 * @returns Success status and subscription ID
 */
export async function linkPendingSubscription(
  userId: string
): Promise<LinkPendingSubscriptionResult> {
  // Acquire advisory lock to serialize linking for same user
  // This prevents concurrent webhook + auth.ts + manual linking
  try {
    // Acquire lock (Postgres-specific)
    await prisma.$executeRaw`SELECT pg_advisory_lock(hashtext(${userId}))`

    // 1. Get user with email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      console.error("[linkPendingSubscription] User not found", { userId })
      return { success: false, error: "User not found" }
    }

    // 2. Find pending subscription with matching email
    const pending = await prisma.pendingSubscription.findFirst({
      where: {
        email: user.email,
        status: "payment_complete",
        expiresAt: { gt: new Date() },
      },
    })

    if (!pending) {
      console.log("[linkPendingSubscription] No pending subscription to link", {
        userId: user.id,
        email: user.email,
      })
      return { success: true }
    }

    console.log("[linkPendingSubscription] Found pending subscription", {
      userId: user.id,
      email: user.email,
      pendingId: pending.id,
    })

    // 3. Verify email is verified in Clerk
    const clerk = await getClerkClient()
    const clerkUser = await clerk.users.getUser(user.clerkUserId)

    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )

    if (primaryEmail?.verification?.status !== "verified") {
      console.warn("[linkPendingSubscription] Email not verified", {
        userId: user.id,
        email: user.email,
      })
      return { success: false, error: "Email not verified" }
    }

    // 4. Idempotency check: verify subscription doesn't already exist
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: pending.stripeSubscriptionId! },
    })

    if (existingSubscription) {
      // Subscription already linked - this is idempotent success
      console.log("[linkPendingSubscription] Subscription already exists (idempotent)", {
        userId: user.id,
        subscriptionId: existingSubscription.id,
        stripeSubscriptionId: pending.stripeSubscriptionId,
      })

      // Ensure pending is marked as linked
      await prisma.pendingSubscription.update({
        where: { id: pending.id },
        data: {
          status: "linked",
          linkedAt: new Date(),
          linkedUserId: user.id,
        },
      })

      return {
        success: true,
        subscriptionId: existingSubscription.id,
      }
    }

    // 5. Get subscription from Stripe to get accurate period end
    const stripeSubscription = await stripe.subscriptions.retrieve(
      pending.stripeSubscriptionId!
    )

    // 6. Create Subscription record and update Profile (transaction)
    // Wrap in try-catch to handle race conditions when multiple requests try to link same subscription
    let subscription
    try {
      subscription = await prisma.$transaction(async (tx) => {
        // Create subscription
        const sub = await tx.subscription.create({
          data: {
            userId: user.id,
            stripeSubscriptionId: pending.stripeSubscriptionId!,
            status: stripeSubscription.status as any, // Will be updated by webhook if different
            plan: pending.plan,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        })

        // Update user plan and credit buckets
        const credits = PLAN_CREDITS[pending.plan] || { email: 0, physical: 0 }
        await tx.user.update({
          where: { id: user.id },
          data: {
            planType: pending.plan,
            emailCredits: credits.email,
            physicalCredits: credits.physical,
            creditExpiresAt: new Date(stripeSubscription.current_period_end * 1000),
          },
        })

        // Update profile with Stripe customer ID
        await tx.profile.update({
          where: { userId: user.id },
          data: { stripeCustomerId: pending.stripeCustomerId },
        })

        // Update pending subscription status
        await tx.pendingSubscription.update({
          where: { id: pending.id },
          data: {
            status: "linked",
            linkedAt: new Date(),
            linkedUserId: user.id,
          },
        })

        return sub
      })
    } catch (error: any) {
      // Handle race condition: another request already created this subscription
      if (error?.code === 'P2002') {
        console.log("[linkPendingSubscription] Race condition detected, checking for existing subscription")

        // Small delay to ensure the other transaction committed
        await new Promise(resolve => setTimeout(resolve, 50))

        // Check if subscription was created by concurrent request
        const existingSub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: pending.stripeSubscriptionId! },
        })

        if (existingSub) {
          console.log("[linkPendingSubscription] Found subscription created by concurrent request", {
            subscriptionId: existingSub.id,
          })

          // Ensure pending is marked as linked (might already be done by other request)
          await prisma.pendingSubscription.update({
            where: { id: pending.id },
            data: {
              status: "linked",
              linkedAt: new Date(),
              linkedUserId: user.id,
            },
          }).catch(() => {
            // Ignore if already updated by concurrent request
          })

          subscription = existingSub
        } else {
          // Subscription still doesn't exist after delay - unexpected
          throw new Error("Race condition: subscription creation failed and not found")
        }
      } else {
        // Different error, not a race condition
        throw error
      }
    }

    console.log("[linkPendingSubscription] Subscription linked successfully", {
      userId: user.id,
      subscriptionId: subscription.id,
      pendingId: pending.id,
    })

    // 6. Invalidate entitlements cache
    await invalidateEntitlementsCache(user.id)

    // 7. Create usage record (allocate physical credits for current period)
    await createUsageRecord(user.id, new Date(), PLAN_CREDITS[pending.plan]?.physical ?? 0)

    // 8. Audit event
    await createAuditEvent({
      userId: user.id,
      type: "subscription.linked",
      data: {
        subscriptionId: subscription.id,
        pendingSubscriptionId: pending.id,
        plan: pending.plan,
        email: user.email,
      },
    })

    return {
      success: true,
      subscriptionId: subscription.id,
    }
  } catch (error) {
    console.error("[linkPendingSubscription] Unexpected error", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, error: "link_failed" }
  } finally {
    // Always release lock, even if error occurred
    try {
      await prisma.$executeRaw`SELECT pg_advisory_unlock(hashtext(${userId}))`
    } catch (unlockError) {
      console.error('Failed to release advisory lock', {
        userId,
        error: unlockError instanceof Error ? unlockError.message : String(unlockError),
      })
    }
  }
}
