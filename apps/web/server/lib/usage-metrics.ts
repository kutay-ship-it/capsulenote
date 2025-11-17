/**
 * Usage Metrics Service
 *
 * Helper functions for querying and analyzing user usage data.
 * Used by admin dashboard, analytics, and user-facing usage displays.
 *
 * @module usage-metrics
 */

import type { SubscriptionPlan } from "@prisma/client"
import { prisma } from "./db"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Monthly usage summary for a user
 */
export interface UsageSummary {
  userId: string
  period: Date
  plan: SubscriptionPlan | 'none'
  usage: {
    lettersCreated: number
    emailsSent: number
    mailsSent: number
    mailCreditsRemaining: number
  }
  limits: {
    maxLetters: number | 'unlimited'
    maxEmails: number | 'unlimited'
    mailCreditsPerMonth: number
  }
  utilization: {
    lettersPercent: number | null // null if unlimited
    emailsPercent: number | null
    mailCreditsPercent: number
  }
}

/**
 * Remaining quota information
 */
export interface RemainingQuota {
  userId: string
  letters: number | 'unlimited'
  emails: number | 'unlimited'
  mailCredits: number
  periodEndsAt: Date
}

/**
 * Historical usage data point
 */
export interface HistoricalUsageData {
  period: Date
  lettersCreated: number
  emailsSent: number
  mailsSent: number
  mailCreditsUsed: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FREE_TIER_LETTER_LIMIT = 5
const PRO_MAIL_CREDITS_PER_MONTH = 2

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get comprehensive monthly usage summary for a user
 *
 * Returns current period usage with limits and utilization percentages.
 * Used by admin dashboard and user settings pages.
 *
 * @param userId - User ID
 * @returns Usage summary with limits and utilization
 *
 * @example
 * const summary = await getUserMonthlyUsageSummary(user.id)
 * console.log(`Letters: ${summary.usage.lettersCreated}/${summary.limits.maxLetters}`)
 * console.log(`Utilization: ${summary.utilization.lettersPercent}%`)
 */
export async function getUserMonthlyUsageSummary(userId: string): Promise<UsageSummary> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  const currentPeriod = getStartOfMonth(new Date())

  // Get usage for current period
  if (subscription) {
    // Pro user - fetch from SubscriptionUsage
    const usage = await prisma.subscriptionUsage.findUnique({
      where: {
        userId_period: { userId, period: currentPeriod }
      }
    })

    const limits = getSubscriptionLimits(subscription.plan)

    return {
      userId,
      period: currentPeriod,
      plan: subscription.plan,
      usage: {
        lettersCreated: usage?.lettersCreated || 0,
        emailsSent: usage?.emailsSent || 0,
        mailsSent: usage?.mailsSent || 0,
        mailCreditsRemaining: usage?.mailCredits || 0
      },
      limits,
      utilization: calculateUtilization(
        {
          lettersCreated: usage?.lettersCreated || 0,
          emailsSent: usage?.emailsSent || 0,
          mailCredits: usage?.mailCredits || 0
        },
        limits
      )
    }
  } else {
    // Free tier user - count actual letters
    const lettersThisMonth = await prisma.letter.count({
      where: {
        userId,
        createdAt: { gte: currentPeriod },
        deletedAt: null
      }
    })

    const limits = {
      maxLetters: FREE_TIER_LETTER_LIMIT,
      maxEmails: 0,
      mailCreditsPerMonth: 0
    }

    return {
      userId,
      period: currentPeriod,
      plan: 'none',
      usage: {
        lettersCreated: lettersThisMonth,
        emailsSent: 0,
        mailsSent: 0,
        mailCreditsRemaining: 0
      },
      limits,
      utilization: calculateUtilization(
        {
          lettersCreated: lettersThisMonth,
          emailsSent: 0,
          mailCredits: 0
        },
        limits
      )
    }
  }
}

/**
 * Get remaining quota for current period
 *
 * Quick check for how much quota remains.
 * Used by UI components to show progress bars.
 *
 * @param userId - User ID
 * @returns Remaining quota with period end date
 *
 * @example
 * const quota = await getRemainingQuota(user.id)
 * if (quota.letters === 0) {
 *   alert('Letter quota exhausted')
 * }
 */
export async function getRemainingQuota(userId: string): Promise<RemainingQuota> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  const currentPeriod = getStartOfMonth(new Date())
  const periodEndsAt = getEndOfMonth(new Date())

  if (subscription) {
    // Pro user - unlimited letters/emails, limited mail credits
    const usage = await prisma.subscriptionUsage.findUnique({
      where: {
        userId_period: { userId, period: currentPeriod }
      }
    })

    return {
      userId,
      letters: 'unlimited',
      emails: 'unlimited',
      mailCredits: usage?.mailCredits || 0,
      periodEndsAt
    }
  } else {
    // Free tier user
    const lettersThisMonth = await prisma.letter.count({
      where: {
        userId,
        createdAt: { gte: currentPeriod },
        deletedAt: null
      }
    })

    return {
      userId,
      letters: Math.max(0, FREE_TIER_LETTER_LIMIT - lettersThisMonth),
      emails: 0, // Free tier cannot send emails
      mailCredits: 0,
      periodEndsAt
    }
  }
}

/**
 * Get historical usage data for a user
 *
 * Returns usage data for past N periods.
 * Used for analytics and usage trend visualization.
 *
 * @param userId - User ID
 * @param periods - Number of past periods to fetch (default: 6 months)
 * @returns Array of historical usage data points
 *
 * @example
 * const history = await getUsageByPeriod(user.id, 12)
 * const chart = history.map(h => ({
 *   month: h.period.toLocaleString('default', { month: 'short' }),
 *   letters: h.lettersCreated
 * }))
 */
export async function getUsageByPeriod(
  userId: string,
  periods: number = 6
): Promise<HistoricalUsageData[]> {
  const currentPeriod = getStartOfMonth(new Date())
  const oldestPeriod = getStartOfMonth(new Date(currentPeriod.getTime() - (periods - 1) * 30 * 24 * 60 * 60 * 1000))

  const usageRecords = await prisma.subscriptionUsage.findMany({
    where: {
      userId,
      period: {
        gte: oldestPeriod,
        lte: currentPeriod
      }
    },
    orderBy: { period: 'asc' }
  })

  // Calculate mail credits used (initial allocation - remaining)
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    }
  })

  const initialMailCredits = subscription ? PRO_MAIL_CREDITS_PER_MONTH : 0

  return usageRecords.map(record => ({
    period: record.period,
    lettersCreated: record.lettersCreated,
    emailsSent: record.emailsSent,
    mailsSent: record.mailsSent,
    mailCreditsUsed: Math.max(0, initialMailCredits - record.mailCredits)
  }))
}

/**
 * Check if user is nearing quota
 *
 * Returns true if user has used >= threshold % of any quota.
 * Used to trigger "approaching limit" warnings.
 *
 * @param userId - User ID
 * @param threshold - Percentage threshold (0-1, default: 0.8 = 80%)
 * @returns true if any quota is at or above threshold
 *
 * @example
 * const nearingLimit = await isNearingQuota(user.id, 0.8)
 * if (nearingLimit) {
 *   showWarning('You are approaching your monthly limit')
 * }
 */
export async function isNearingQuota(userId: string, threshold: number = 0.8): Promise<boolean> {
  const summary = await getUserMonthlyUsageSummary(userId)

  // Check each utilization percentage
  const { lettersPercent, emailsPercent, mailCreditsPercent } = summary.utilization

  // Unlimited quotas don't count
  if (lettersPercent !== null && lettersPercent >= threshold * 100) {
    return true
  }

  if (emailsPercent !== null && emailsPercent >= threshold * 100) {
    return true
  }

  if (mailCreditsPercent >= threshold * 100) {
    return true
  }

  return false
}

/**
 * Get aggregate usage statistics for admin dashboard
 *
 * Returns platform-wide usage metrics.
 * Requires admin permissions to call.
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Aggregate usage statistics
 *
 * @example
 * const stats = await getAggregateUsageStats(
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31')
 * )
 * console.log(`Total letters: ${stats.totalLetters}`)
 */
export async function getAggregateUsageStats(
  startDate: Date,
  endDate: Date
): Promise<{
  totalLetters: number
  totalEmails: number
  totalMails: number
  totalMailCreditsUsed: number
  uniqueUsers: number
}> {
  const usageRecords = await prisma.subscriptionUsage.findMany({
    where: {
      period: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      userId: true,
      lettersCreated: true,
      emailsSent: true,
      mailsSent: true,
      mailCredits: true
    }
  })

  const uniqueUsers = new Set(usageRecords.map(r => r.userId)).size

  const totals = usageRecords.reduce(
    (acc, record) => ({
      totalLetters: acc.totalLetters + record.lettersCreated,
      totalEmails: acc.totalEmails + record.emailsSent,
      totalMails: acc.totalMails + record.mailsSent,
      totalMailCreditsUsed: acc.totalMailCreditsUsed + (PRO_MAIL_CREDITS_PER_MONTH - record.mailCredits)
    }),
    {
      totalLetters: 0,
      totalEmails: 0,
      totalMails: 0,
      totalMailCreditsUsed: 0
    }
  )

  return {
    ...totals,
    uniqueUsers
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Get subscription limits by plan
 */
function getSubscriptionLimits(plan: SubscriptionPlan): {
  maxLetters: number | 'unlimited'
  maxEmails: number | 'unlimited'
  mailCreditsPerMonth: number
} {
  switch (plan) {
    case 'pro':
      return {
        maxLetters: 'unlimited',
        maxEmails: 'unlimited',
        mailCreditsPerMonth: PRO_MAIL_CREDITS_PER_MONTH
      }
    case 'enterprise':
      return {
        maxLetters: 'unlimited',
        maxEmails: 'unlimited',
        mailCreditsPerMonth: 10 // Future: adjust as needed
      }
    default:
      return {
        maxLetters: 0,
        maxEmails: 0,
        mailCreditsPerMonth: 0
      }
  }
}

/**
 * Calculate utilization percentages
 */
function calculateUtilization(
  usage: {
    lettersCreated: number
    emailsSent: number
    mailCredits: number
  },
  limits: {
    maxLetters: number | 'unlimited'
    maxEmails: number | 'unlimited'
    mailCreditsPerMonth: number
  }
): {
  lettersPercent: number | null
  emailsPercent: number | null
  mailCreditsPercent: number
} {
  return {
    lettersPercent:
      limits.maxLetters === 'unlimited'
        ? null
        : (usage.lettersCreated / limits.maxLetters) * 100,
    emailsPercent:
      limits.maxEmails === 'unlimited'
        ? null
        : (usage.emailsSent / limits.maxEmails) * 100,
    mailCreditsPercent:
      limits.mailCreditsPerMonth === 0
        ? 0
        : ((limits.mailCreditsPerMonth - usage.mailCredits) / limits.mailCreditsPerMonth) * 100
  }
}

/**
 * Get start of current month in UTC
 */
function getStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

/**
 * Get end of current month in UTC
 */
function getEndOfMonth(date: Date): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()

  // Last day of month is the 0th day of next month
  return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
}
