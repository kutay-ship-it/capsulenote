/**
 * Stripe Helper Utilities
 *
 * Common operations for Stripe webhook processing:
 * - User lookup by Stripe customer ID
 * - Entitlements cache invalidation
 * - Usage record creation
 * - Billing email triggers
 *
 * @module stripe-helpers
 */

import { prisma } from "./db"
import { redis } from "./redis"
import { triggerInngestEvent } from "./trigger-inngest"
import { createAuditEvent, type AuditEventTypeValue } from "./audit"

/**
 * Find user by Stripe customer ID
 *
 * @param customerId - Stripe customer ID
 * @returns User object with profile, or null if not found
 */
export async function getUserByStripeCustomer(customerId: string) {
  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customerId },
    include: {
      user: true,
    },
  })

  if (profile) {
    return {
      id: profile.userId,
      email: profile.user.email,
      clerkUserId: profile.user.clerkUserId,
    }
  }

  return null
}

/**
 * Invalidate entitlements cache for user
 *
 * Call this after subscription status changes to ensure
 * user gets updated plan features immediately.
 *
 * @param userId - User ID to invalidate cache for
 */
export async function invalidateEntitlementsCache(userId: string): Promise<void> {
  const cacheKey = `entitlements:${userId}`

  try {
    await redis.del(cacheKey)
    console.log("[Stripe Helpers] Entitlements cache invalidated", { userId })
  } catch (error) {
    // Log but don't throw - cache invalidation is not critical
    console.error("[Stripe Helpers] Failed to invalidate entitlements cache", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Create or update usage record for billing period
 *
 * Creates a usage tracking record when subscription becomes active.
 * Pro plan users get 2 mail credits per month.
 *
 * @param userId - User ID
 * @param period - Billing period start date
 * @param mailCredits - Number of mail credits to allocate
 */
export async function createUsageRecord(
  userId: string,
  period: Date,
  mailCredits: number = 2
): Promise<void> {
  try {
    await prisma.subscriptionUsage.upsert({
      where: {
        userId_period: {
          userId,
          period,
        },
      },
      create: {
        userId,
        period,
        mailCredits,
        lettersCreated: 0,
        emailsSent: 0,
        mailsSent: 0,
      },
      update: {
        // If record exists, ensure mail credits are set
        mailCredits,
      },
    })

    console.log("[Stripe Helpers] Usage record created", {
      userId,
      period: period.toISOString(),
      mailCredits,
    })
  } catch (error) {
    console.error("[Stripe Helpers] Failed to create usage record", {
      userId,
      period: period.toISOString(),
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * Send billing notification email
 *
 * Triggers Inngest email function for billing-related notifications:
 * - Trial ending
 * - Payment failed
 * - Subscription canceled
 * - Payment succeeded (receipt)
 *
 * @param template - Email template name
 * @param userId - User ID
 * @param email - User email address
 * @param data - Template-specific data
 */
export async function sendBillingEmail(
  template: "trial-ending" | "payment-failed" | "subscription-canceled" | "payment-receipt",
  userId: string,
  email: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await triggerInngestEvent("billing/send-notification", {
      template,
      userId,
      email,
      ...data,
    })

    console.log("[Stripe Helpers] Billing email queued", {
      template,
      userId,
      email,
    })
  } catch (error) {
    console.error("[Stripe Helpers] Failed to queue billing email", {
      template,
      userId,
      email,
      error: error instanceof Error ? error.message : String(error),
    })
    // Don't throw - email failures should not block webhook processing
  }
}

/**
 * Record audit event for billing action
 *
 * Logs subscription and payment events to audit trail using
 * standardized AuditEventType constants.
 *
 * @param userId - User ID
 * @param type - Event type (should use AuditEventType constants)
 * @param data - Event-specific data
 */
export async function recordBillingAudit(
  userId: string,
  type: AuditEventTypeValue,
  data: Record<string, unknown>
): Promise<void> {
  // Use centralized audit logging with error handling
  await createAuditEvent({
    userId,
    type,
    data,
  })
}

/**
 * Get current subscription usage for user
 *
 * @param userId - User ID
 * @returns Current usage record or default values
 */
export async function getCurrentUsage(userId: string) {
  // Find most recent usage record
  const usage = await prisma.subscriptionUsage.findFirst({
    where: { userId },
    orderBy: { period: "desc" },
  })

  return {
    lettersCreated: usage?.lettersCreated ?? 0,
    emailsSent: usage?.emailsSent ?? 0,
    mailsSent: usage?.mailsSent ?? 0,
    mailCredits: usage?.mailCredits ?? 0,
  }
}

/**
 * Deduct mail credit from user's quota
 *
 * @param userId - User ID
 * @returns true if credit deducted, false if no credits available
 */
export async function deductMailCredit(userId: string): Promise<boolean> {
  try {
    // Get current period usage
    const usage = await prisma.subscriptionUsage.findFirst({
      where: { userId },
      orderBy: { period: "desc" },
    })

    if (!usage || usage.mailCredits <= 0) {
      return false
    }

    // Deduct one credit
    await prisma.subscriptionUsage.update({
      where: { id: usage.id },
      data: {
        mailCredits: { decrement: 1 },
        mailsSent: { increment: 1 },
      },
    })

    console.log("[Stripe Helpers] Mail credit deducted", {
      userId,
      remainingCredits: usage.mailCredits - 1,
    })

    return true
  } catch (error) {
    console.error("[Stripe Helpers] Failed to deduct mail credit", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
