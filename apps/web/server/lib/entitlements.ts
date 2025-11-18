/**
 * Entitlements Service
 *
 * Core service for subscription-based feature access control.
 * Implements Redis caching for performance (<50ms p95 latency target).
 *
 * @module entitlements
 */

import type { SubscriptionStatus, Subscription, SubscriptionPlan } from "@prisma/client"
import { prisma } from "./db"
import { redis } from "./redis"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Entitlements interface - defines what users can do
 */
export interface Entitlements {
  userId: string
  plan: SubscriptionPlan | 'none'
  status: SubscriptionStatus | 'none'
  features: {
    canCreateLetters: boolean
    canScheduleDeliveries: boolean
    canSchedulePhysicalMail: boolean
    maxLettersPerMonth: number | 'unlimited'
    emailDeliveriesIncluded: number | 'unlimited'
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

interface UsageData {
  lettersCreated: number
  emailsSent: number
  mailCredits: number
}

interface FreeTierUsage {
  lettersThisMonth: number
  emailsThisMonth: number
  mailCreditsRemaining: number
}

/**
 * Custom error for quota exceeded scenarios
 */
export class QuotaExceededError extends Error {
  constructor(
    public readonly quotaType: 'letters' | 'emails' | 'mail_credits',
    public readonly limit: number,
    public readonly current: number
  ) {
    super(`Quota exceeded for ${quotaType}: ${current}/${limit}`)
    this.name = 'QuotaExceededError'
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_TTL_SECONDS = 300 // 5 minutes
const FREE_TIER_LETTER_LIMIT = 5
const PRO_MAIL_CREDITS_PER_MONTH = 2

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get user entitlements with Redis caching
 *
 * Performance: <50ms p95 latency target
 * Cache: 5-minute TTL
 *
 * @param userId - User ID to check entitlements for
 * @returns Entitlements object with plan, features, usage, limits
 *
 * @example
 * const entitlements = await getEntitlements(user.id)
 * if (!entitlements.features.canScheduleDeliveries) {
 *   throw new Error('Pro subscription required')
 * }
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const cacheKey = `entitlements:${userId}`

  try {
    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached && typeof cached === 'string') {
      const parsed = JSON.parse(cached)
      // Convert date strings back to Date objects
      if (parsed.trialInfo?.trialEndsAt) {
        parsed.trialInfo.trialEndsAt = new Date(parsed.trialInfo.trialEndsAt)
      }
      return parsed
    }
  } catch (error) {
    // Cache read failure - log but continue to database
    console.error('Redis cache read failed:', error)
  }

  // Cache miss - fetch from database
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  const entitlements = subscription
    ? await buildProEntitlements(userId, subscription)
    : await buildFreeEntitlements(userId)

  try {
    // Cache for 5 minutes
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(entitlements))
  } catch (error) {
    // Cache write failure - log but return result
    console.error('Redis cache write failed:', error)
  }

  return entitlements
}

/**
 * Invalidate entitlements cache
 *
 * Call this when:
 * - Subscription status changes (webhook handlers)
 * - User upgrades/downgrades plan
 * - Usage quotas are updated
 * - Mail credits are added/deducted
 *
 * @param userId - User ID to invalidate cache for
 *
 * @example
 * // In webhook handler after subscription update
 * await prisma.subscription.update({ ... })
 * await invalidateEntitlementsCache(userId)
 */
export async function invalidateEntitlementsCache(userId: string): Promise<void> {
  const cacheKey = `entitlements:${userId}`
  try {
    await redis.del(cacheKey)
  } catch (error) {
    console.error('Failed to invalidate entitlements cache:', error)
    // Non-critical - cache will expire naturally after TTL
  }
}

/**
 * Check if user has specific feature access
 *
 * Convenience wrapper around getEntitlements for boolean feature checks.
 *
 * @param userId - User ID to check
 * @param feature - Feature key to check
 * @returns true if feature is enabled, false otherwise
 *
 * @example
 * const canSchedule = await checkFeatureAccess(user.id, 'canScheduleDeliveries')
 * if (!canSchedule) {
 *   return { error: 'Pro subscription required' }
 * }
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof Entitlements['features']
): Promise<boolean> {
  const entitlements = await getEntitlements(userId)
  const value = entitlements.features[feature]

  // Handle 'unlimited' values as true
  if (value === 'unlimited') return true
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0

  return false
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Build entitlements for Pro plan (paid subscription)
 *
 * Pro features:
 * - Unlimited letters
 * - Unlimited email deliveries
 * - Physical mail with 2 credits/month
 * - All scheduling features
 */
async function buildProEntitlements(
  userId: string,
  subscription: Subscription
): Promise<Entitlements> {
  const usage = await getCurrentUsage(userId)

  const trialInfo = subscription.status === 'trialing'
    ? {
        isInTrial: true,
        trialEndsAt: subscription.currentPeriodEnd,
        daysRemaining: Math.ceil(
          (subscription.currentPeriodEnd.getTime() - Date.now()) / 86400000
        )
      }
    : undefined

  return {
    userId,
    plan: subscription.plan,
    status: subscription.status,
    features: {
      canCreateLetters: true,
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: true,
      maxLettersPerMonth: 'unlimited',
      emailDeliveriesIncluded: 'unlimited',
      mailCreditsPerMonth: PRO_MAIL_CREDITS_PER_MONTH
    },
    usage: {
      lettersThisMonth: usage.lettersCreated,
      emailsThisMonth: usage.emailsSent,
      mailCreditsRemaining: usage.mailCredits
    },
    trialInfo,
    limits: {
      lettersReached: false, // Pro has unlimited
      emailsReached: false, // Pro has unlimited
      mailCreditsExhausted: usage.mailCredits === 0
    }
  }
}

/**
 * Build entitlements for Free plan (no active subscription)
 *
 * Free tier features:
 * - 5 letters per month
 * - No email deliveries
 * - No physical mail
 * - No scheduling features
 */
async function buildFreeEntitlements(userId: string): Promise<Entitlements> {
  const usage = await getCurrentUsageForFreeTier(userId)

  return {
    userId,
    plan: 'none',
    status: 'none',
    features: {
      canCreateLetters: usage.lettersThisMonth < FREE_TIER_LETTER_LIMIT,
      canScheduleDeliveries: false, // Free tier cannot schedule
      canSchedulePhysicalMail: false,
      maxLettersPerMonth: FREE_TIER_LETTER_LIMIT,
      emailDeliveriesIncluded: 0,
      mailCreditsPerMonth: 0
    },
    usage: {
      lettersThisMonth: usage.lettersThisMonth,
      emailsThisMonth: usage.emailsThisMonth,
      mailCreditsRemaining: usage.mailCreditsRemaining
    },
    limits: {
      lettersReached: usage.lettersThisMonth >= FREE_TIER_LETTER_LIMIT,
      emailsReached: false,
      mailCreditsExhausted: true // Free tier has no credits
    }
  }
}

/**
 * Get current usage data for Pro tier users
 *
 * Uses SubscriptionUsage table with automatic upsert.
 */
async function getCurrentUsage(userId: string): Promise<UsageData> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    }
  })

  if (!subscription) {
    // Fallback to free tier
    const freeUsage = await getCurrentUsageForFreeTier(userId)
    return {
      lettersCreated: freeUsage.lettersThisMonth,
      emailsSent: freeUsage.emailsThisMonth,
      mailCredits: freeUsage.mailCreditsRemaining
    }
  }

  // Get current billing period start
  const period = getStartOfMonth(new Date())

  // Get or create usage record for this period
  // Use retry loop to handle race conditions when multiple requests try to create the same record
  let usage
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      usage = await prisma.subscriptionUsage.upsert({
        where: {
          userId_period: { userId, period }
        },
        create: {
          userId,
          period,
          lettersCreated: 0,
          emailsSent: 0,
          mailsSent: 0,
          mailCredits: PRO_MAIL_CREDITS_PER_MONTH // Initialize with monthly allocation
        },
        update: {} // No-op if exists
      })
      break // Success, exit loop
    } catch (error: any) {
      // Handle race condition: another request created the record
      if (error?.code === 'P2002') {
        attempts++

        // Small delay to ensure the other transaction committed
        await new Promise(resolve => setTimeout(resolve, 20 * attempts))

        // Try to fetch the record that was created by another request
        usage = await prisma.subscriptionUsage.findUnique({
          where: {
            userId_period: { userId, period }
          }
        })

        if (usage) {
          break // Found it, exit loop
        }

        // If still not found and we have attempts left, try again
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to get or create usage record after ${maxAttempts} attempts`)
        }
      } else {
        // Different error, not a race condition
        throw error
      }
    }
  }

  if (!usage) {
    throw new Error('Failed to get usage record')
  }

  return {
    lettersCreated: usage.lettersCreated,
    emailsSent: usage.emailsSent,
    mailCredits: usage.mailCredits
  }
}

/**
 * Get current usage for free tier users
 *
 * Counts actual letters created this month (no SubscriptionUsage record).
 */
async function getCurrentUsageForFreeTier(userId: string): Promise<FreeTierUsage> {
  const thisMonth = getStartOfMonth(new Date())

  const lettersThisMonth = await prisma.letter.count({
    where: {
      userId,
      createdAt: { gte: thisMonth },
      deletedAt: null // Only count active letters
    }
  })

  return {
    lettersThisMonth,
    emailsThisMonth: 0, // Free tier can't schedule emails
    mailCreditsRemaining: 0 // Free tier has no mail credits
  }
}

/**
 * Get start of current month in UTC
 */
function getStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

// ============================================================================
// USAGE TRACKING HELPERS
// ============================================================================

/**
 * Increment letter creation count
 *
 * Call this after creating a letter successfully.
 *
 * @param userId - User ID
 * @throws QuotaExceededError if free tier limit reached
 */
export async function trackLetterCreation(userId: string): Promise<void> {
  const entitlements = await getEntitlements(userId)

  // Check if quota would be exceeded (free tier only)
  if (entitlements.plan === 'none' && entitlements.limits.lettersReached) {
    throw new QuotaExceededError('letters', FREE_TIER_LETTER_LIMIT, entitlements.usage.lettersThisMonth)
  }

  // For Pro users, increment usage tracking
  if (entitlements.plan === 'pro' || entitlements.plan === 'enterprise') {
    const period = getStartOfMonth(new Date())
    await prisma.subscriptionUsage.upsert({
      where: {
        userId_period: { userId, period }
      },
      create: {
        userId,
        period,
        lettersCreated: 1,
        emailsSent: 0,
        mailsSent: 0,
        mailCredits: PRO_MAIL_CREDITS_PER_MONTH
      },
      update: {
        lettersCreated: { increment: 1 }
      }
    })

    // Invalidate cache
    await invalidateEntitlementsCache(userId)
  }

  // Free tier: usage is tracked by counting actual Letter records
}

/**
 * Increment email delivery count
 *
 * Call this after scheduling an email delivery.
 */
export async function trackEmailDelivery(userId: string): Promise<void> {
  const period = getStartOfMonth(new Date())

  await prisma.subscriptionUsage.upsert({
    where: {
      userId_period: { userId, period }
    },
    create: {
      userId,
      period,
      lettersCreated: 0,
      emailsSent: 1,
      mailsSent: 0,
      mailCredits: PRO_MAIL_CREDITS_PER_MONTH
    },
    update: {
      emailsSent: { increment: 1 }
    }
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Deduct mail credit
 *
 * Call this after scheduling a physical mail delivery.
 *
 * @param userId - User ID
 * @throws QuotaExceededError if no credits remaining
 */
export async function deductMailCredit(userId: string): Promise<void> {
  const entitlements = await getEntitlements(userId)

  if (entitlements.limits.mailCreditsExhausted) {
    throw new QuotaExceededError('mail_credits', 0, 0)
  }

  const period = getStartOfMonth(new Date())

  await prisma.subscriptionUsage.update({
    where: {
      userId_period: { userId, period }
    },
    data: {
      mailsSent: { increment: 1 },
      mailCredits: { decrement: 1 }
    }
  })

  await invalidateEntitlementsCache(userId)
}

/**
 * Add mail credits to user account
 *
 * Call this after purchasing additional mail credits.
 */
export async function addMailCredits(userId: string, credits: number): Promise<void> {
  const period = getStartOfMonth(new Date())

  await prisma.subscriptionUsage.upsert({
    where: {
      userId_period: { userId, period }
    },
    create: {
      userId,
      period,
      lettersCreated: 0,
      emailsSent: 0,
      mailsSent: 0,
      mailCredits: credits
    },
    update: {
      mailCredits: { increment: credits }
    }
  })

  await invalidateEntitlementsCache(userId)
}
