/**
 * Entitlements Service (Capsule Note)
 *
 * Credit-based access control aligned to the yearly plans:
 * - Digital Capsule: 6 email credits/year
 * - Paper & Pixels: 24 email + 3 physical credits/year
 *
 * Notes:
 * - No free tier. Users without an active subscription have plan = 'none' and cannot schedule.
 * - Credits are stored on the User record and decremented on scheduling.
 * - Cache in Redis for 5 minutes to keep API fast.
 */

import type { PlanType, SubscriptionStatus } from "@prisma/client"
import { prisma } from "./db"
import { redis } from "./redis"

// ============================================================================
// TYPES
// ============================================================================

export interface Entitlements {
  userId: string
  plan: PlanType | "none"
  status: SubscriptionStatus | "none"
  features: {
    canCreateLetters: boolean
    canScheduleDeliveries: boolean
    canSchedulePhysicalMail: boolean
    maxLettersPerMonth: number | "unlimited"
    emailDeliveriesIncluded: number
    mailCreditsPerMonth: number
  }
  usage: {
    lettersThisMonth: number
    emailsThisMonth: number
    mailCreditsRemaining: number
  }
  trialInfo?: {
    isInTrial: boolean
    trialEndsAt: Date
    daysRemaining: number
  }
  limits: {
    lettersReached: boolean
    emailsReached: boolean
    mailCreditsExhausted: boolean
  }
}

/**
 * Custom error for quota exceeded scenarios
 */
export class QuotaExceededError extends Error {
  constructor(
    public readonly quotaType: "email_credits" | "physical_credits",
    public readonly limit: number,
    public readonly current: number
  ) {
    super(`Quota exceeded for ${quotaType}: ${current}/${limit}`)
    this.name = "QuotaExceededError"
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_TTL_SECONDS = 300 // 5 minutes
const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 6, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
}
const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "trialing"]

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get user entitlements with Redis caching
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const cacheKey = `entitlements:${userId}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === "string") {
      const parsed = JSON.parse(cached)
      if (parsed.trialInfo?.trialEndsAt) {
        parsed.trialInfo.trialEndsAt = new Date(parsed.trialInfo.trialEndsAt)
      }
      return parsed
    }
  } catch (error) {
    console.error("Redis cache read failed:", error)
  }

  const entitlements = await buildEntitlements(userId)

  try {
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(entitlements))
  } catch (error) {
    console.error("Redis cache write failed:", error)
  }

  return entitlements
}

/**
 * Invalidate entitlements cache
 */
export async function invalidateEntitlementsCache(userId: string): Promise<void> {
  try {
    await redis.del(`entitlements:${userId}`)
  } catch (error) {
    console.error("Failed to invalidate entitlements cache:", error)
  }
}

/**
 * Check if user has specific feature access
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof Entitlements["features"]
): Promise<boolean> {
  const entitlements = await getEntitlements(userId)
  const value = entitlements.features[feature]

  if (value === "unlimited") return true
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0

  return false
}

/**
 * Track letter creation (no-op for now, kept for API compatibility)
 */
export async function trackLetterCreation(userId: string): Promise<void> {
  // No letter quotas with paid-only plans; placeholder for analytics.
  await invalidateEntitlementsCache(userId)
}

/**
 * Deduct one email credit (throws if none remain)
 */
export async function trackEmailDelivery(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailCredits: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.emailCredits <= 0) {
    throw new QuotaExceededError("email_credits", 0, 0)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailCredits: { decrement: 1 } },
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Deduct one physical mail credit (throws if none remain)
 */
export async function deductMailCredit(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { physicalCredits: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.physicalCredits <= 0) {
    throw new QuotaExceededError("physical_credits", 0, 0)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { physicalCredits: { decrement: 1 } },
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Add physical mail credits (used by add-ons)
 */
export async function addMailCredits(userId: string, credits: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { physicalCredits: { increment: credits } },
  })

  await invalidateEntitlementsCache(userId)
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

async function buildEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: { in: ACTIVE_SUBSCRIPTION_STATUSES } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const subscription = user.subscriptions[0]
  const plan = subscription?.plan ?? user.planType ?? null
  const status = subscription?.status ?? ("none" as const)
  const planCredits = plan ? PLAN_CREDITS[plan] : { email: 0, physical: 0 }
  const lettersThisMonth = await prisma.letter.count({
    where: {
      userId,
      createdAt: { gte: getStartOfMonth(new Date()) },
      deletedAt: null,
    },
  })

  const trialInfo =
    subscription?.status === "trialing"
      ? {
          isInTrial: true,
          trialEndsAt: subscription.currentPeriodEnd,
          daysRemaining: Math.ceil(
            (subscription.currentPeriodEnd.getTime() - Date.now()) / 86400000
          ),
        }
      : undefined

  return {
    userId,
    plan: plan ?? "none",
    status,
    features: {
      canCreateLetters: true,
      canScheduleDeliveries: ACTIVE_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus),
      canSchedulePhysicalMail:
        ACTIVE_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus) &&
        plan === "PAPER_PIXELS",
      maxLettersPerMonth: "unlimited",
      emailDeliveriesIncluded: user.emailCredits,
      mailCreditsPerMonth: user.physicalCredits,
    },
    usage: {
      lettersThisMonth,
      emailsThisMonth: 0, // Simplified: tracked via credits
      mailCreditsRemaining: user.physicalCredits,
    },
    trialInfo,
    limits: {
      lettersReached: false,
      emailsReached: user.emailCredits <= 0,
      mailCreditsExhausted: user.physicalCredits <= 0,
    },
  }
}

function getStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}
