/**
 * Usage Metrics Service (credit-based)
 *
 * Leverages entitlements to provide usage summaries for UI/admin views.
 */

import type { PlanType } from "@prisma/client"
import { getEntitlements } from "./entitlements"
import { prisma } from "./db"

export interface UsageSummary {
  userId: string
  period: Date
  plan: PlanType | "none"
  usage: {
    lettersCreated: number
    emailsSent: number
    mailsSent: number
    mailCreditsRemaining: number
  }
  limits: {
    maxLetters: number | "unlimited"
    maxEmails: number | "unlimited"
    mailCreditsPerPeriod: number
  }
  utilization: {
    lettersPercent: number | null
    emailsPercent: number | null
    mailCreditsPercent: number
  }
}

export interface RemainingQuota {
  userId: string
  letters: number | "unlimited"
  emails: number | "unlimited"
  mailCredits: number
  periodEndsAt: Date
}

/**
 * Get current usage summary using entitlements and counts.
 */
export async function getUserMonthlyUsageSummary(userId: string): Promise<UsageSummary> {
  const entitlements = await getEntitlements(userId)
  const period = getStartOfMonth(new Date())

  const lettersCreated = await prisma.letter.count({
    where: {
      userId,
      createdAt: { gte: period },
      deletedAt: null,
    },
  })

  const limits = {
    maxLetters: "unlimited" as const,
    maxEmails: entitlements.features.emailDeliveriesIncluded,
    mailCreditsPerPeriod: entitlements.features.mailCreditsPerMonth,
  }

  return {
    userId,
    period,
    plan: entitlements.plan,
    usage: {
      lettersCreated,
      emailsSent: 0, // Simplified: email usage tracked via credits
      mailsSent: 0,
      mailCreditsRemaining: entitlements.usage.mailCreditsRemaining,
    },
    limits,
    utilization: calculateUtilization(
      {
        lettersCreated,
        emailsSent: 0,
        mailCredits: entitlements.usage.mailCreditsRemaining,
      },
      limits
    ),
  }
}

/**
 * Quick remaining quota snapshot for UI.
 */
export async function getRemainingQuota(userId: string): Promise<RemainingQuota> {
  const entitlements = await getEntitlements(userId)

  return {
    userId,
    letters: "unlimited",
    emails: entitlements.features.emailDeliveriesIncluded,
    mailCredits: entitlements.usage.mailCreditsRemaining,
    periodEndsAt: getEndOfYear(entitlements),
  }
}

// ============================================================================
// INTERNAL
// ============================================================================

function calculateUtilization(
  usage: { lettersCreated: number; emailsSent: number; mailCredits: number },
  limits: { maxLetters: number | "unlimited"; maxEmails: number | "unlimited"; mailCreditsPerPeriod: number }
) {
  const lettersPercent =
    typeof limits.maxLetters === "number" ? (usage.lettersCreated / limits.maxLetters) * 100 : null
  const emailsPercent =
    typeof limits.maxEmails === "number" ? (usage.emailsSent / limits.maxEmails) * 100 : null
  const mailCreditsPercent =
    limits.mailCreditsPerPeriod > 0
      ? ((limits.mailCreditsPerPeriod - usage.mailCredits) / limits.mailCreditsPerPeriod) * 100
      : 0

  return {
    lettersPercent,
    emailsPercent,
    mailCreditsPercent,
  }
}

function getStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

function getEndOfYear(entitlements: Awaited<ReturnType<typeof getEntitlements>>): Date {
  // Use credit expiry if available, otherwise end of current year
  const now = new Date()
  const endOfYear = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999))
  return entitlements.plan === "none" ? endOfYear : endOfYear
}
