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
 * - Addon credits are tracked separately and preserved on subscription renewal.
 * - All credit changes are logged to CreditTransaction for audit trail.
 * - Cache in Redis for 5 minutes to keep API fast.
 */

import type { PlanType, SubscriptionStatus, CreditType, CreditTransactionType, Prisma } from "@prisma/client"
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
// CREDIT TRANSACTION HELPER
// ============================================================================

interface RecordCreditTransactionParams {
  userId: string
  creditType: CreditType
  transactionType: CreditTransactionType
  amount: number
  source?: string
  metadata?: Record<string, unknown>
  tx?: Prisma.TransactionClient
}

/**
 * Record a credit transaction for audit trail
 * Can be called within a transaction or standalone
 */
export async function recordCreditTransaction({
  userId,
  creditType,
  transactionType,
  amount,
  source,
  metadata,
  tx,
}: RecordCreditTransactionParams): Promise<void> {
  const client = tx ?? prisma

  // Get current balance
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { emailCredits: true, physicalCredits: true },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  const balanceBefore = creditType === "email" ? user.emailCredits : user.physicalCredits
  const balanceAfter = balanceBefore + amount

  await client.creditTransaction.create({
    data: {
      userId,
      creditType,
      transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      source,
      metadata: metadata ?? {},
    },
  })
}

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
      const refreshNeeded = await shouldRefreshEntitlements(userId, parsed)
      if (!refreshNeeded) {
        return parsed
      }
      console.log("[Entitlements] Cache refresh triggered due to newer subscription state", {
        userId,
      })
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
 * Uses transaction for atomicity and records audit trail
 */
export async function trackEmailDelivery(userId: string, deliveryId?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { emailCredits: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (user.emailCredits <= 0) {
      throw new QuotaExceededError("email_credits", 0, 0)
    }

    await tx.user.update({
      where: { id: userId },
      data: { emailCredits: { decrement: 1 } },
    })

    await recordCreditTransaction({
      userId,
      creditType: "email",
      transactionType: "deduct_delivery",
      amount: -1,
      source: deliveryId,
      tx,
    })
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Deduct one physical mail credit (throws if none remain)
 * Uses transaction for atomicity and records audit trail
 */
export async function deductMailCredit(userId: string, deliveryId?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { physicalCredits: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (user.physicalCredits <= 0) {
      throw new QuotaExceededError("physical_credits", 0, 0)
    }

    await tx.user.update({
      where: { id: userId },
      data: { physicalCredits: { decrement: 1 } },
    })

    await recordCreditTransaction({
      userId,
      creditType: "physical",
      transactionType: "deduct_delivery",
      amount: -1,
      source: deliveryId,
      tx,
    })
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Add physical mail credits (used by add-ons)
 * Uses transaction for atomicity and records audit trail
 * Also tracks in physicalAddonCredits for renewal preservation
 */
export async function addMailCredits(
  userId: string,
  credits: number,
  options?: { source?: string; transactionType?: CreditTransactionType; isAddon?: boolean }
): Promise<void> {
  const { source, transactionType = "grant_addon", isAddon = true } = options ?? {}

  await prisma.$transaction(async (tx) => {
    // Record audit before update (recordCreditTransaction reads current balance)
    await recordCreditTransaction({
      userId,
      creditType: "physical",
      transactionType,
      amount: credits,
      source,
      tx,
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        physicalCredits: { increment: credits },
        // Track addon credits separately for renewal preservation
        ...(isAddon && { physicalAddonCredits: { increment: credits } }),
      },
    })
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Add email credits (used by referral rewards and add-ons)
 * Uses transaction for atomicity and records audit trail
 * Also tracks in emailAddonCredits for renewal preservation
 */
export async function addEmailCredits(
  userId: string,
  credits: number,
  options?: { source?: string; transactionType?: CreditTransactionType; isAddon?: boolean }
): Promise<void> {
  const { source, transactionType = "grant_addon", isAddon = true } = options ?? {}

  await prisma.$transaction(async (tx) => {
    // Record audit before update (recordCreditTransaction reads current balance)
    await recordCreditTransaction({
      userId,
      creditType: "email",
      transactionType,
      amount: credits,
      source,
      tx,
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        emailCredits: { increment: credits },
        // Track addon credits separately for renewal preservation
        ...(isAddon && { emailAddonCredits: { increment: credits } }),
      },
    })
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Deduct credits on refund (for add-on purchases)
 * Deducts from both total credits and addon tracking
 */
export async function deductCreditsForRefund(
  userId: string,
  creditType: CreditType,
  credits: number,
  source?: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { emailCredits: true, physicalCredits: true, emailAddonCredits: true, physicalAddonCredits: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const currentCredits = creditType === "email" ? user.emailCredits : user.physicalCredits
    const currentAddon = creditType === "email" ? user.emailAddonCredits : user.physicalAddonCredits

    // Don't deduct more than available
    const deductAmount = Math.min(credits, currentCredits)
    const deductAddon = Math.min(credits, currentAddon)

    if (deductAmount > 0) {
      await recordCreditTransaction({
        userId,
        creditType,
        transactionType: "deduct_refund",
        amount: -deductAmount,
        source,
        tx,
      })

      const creditField = creditType === "email" ? "emailCredits" : "physicalCredits"
      const addonField = creditType === "email" ? "emailAddonCredits" : "physicalAddonCredits"

      await tx.user.update({
        where: { id: userId },
        data: {
          [creditField]: { decrement: deductAmount },
          [addonField]: { decrement: deductAddon },
        },
      })
    }
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

  // Check if credits are still valid (hybrid status detection)
  const hasValidCredits = user.creditExpiresAt
    ? user.creditExpiresAt > new Date()
    : !!user.planType  // If no expiry but has planType, assume valid

  // Status determination: use subscription status if available, otherwise check planType/credits
  const status = subscription?.status
    ?? (hasValidCredits ? ("active" as const) : ("none" as const))

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

async function shouldRefreshEntitlements(
  userId: string,
  cached: Entitlements
): Promise<boolean> {
  // If cache shows active/trial and DB has no subscription, refresh
  const latest = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { status: true, plan: true, updatedAt: true },
  })

  if (!latest) {
    return cached.plan !== "none" || cached.status !== "none"
  }

  const latestStatus = latest.status
  const latestPlan = latest.plan

  if (cached.plan !== latestPlan) return true
  if (cached.status !== latestStatus) return true

  // If cache says no subscription but DB has active/trialing, refresh
  if (
    cached.plan === "none" &&
    (latestStatus === "active" || latestStatus === "trialing")
  ) {
    return true
  }

  return false
}
