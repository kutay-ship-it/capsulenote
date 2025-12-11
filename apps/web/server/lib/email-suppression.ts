/**
 * Email Suppression List Utilities
 *
 * Provides functions to check and manage suppressed email addresses.
 * Prevents sending to addresses that have bounced or complained.
 */

import { prisma } from "./db"
import type { Prisma } from "@prisma/client"

export interface SuppressionCheckResult {
  isSuppressed: boolean
  reason?: "bounce" | "complaint" | "unsubscribe"
  suppressedAt?: Date
}

/**
 * Check if an email address is in the suppression list
 *
 * @param email - Email address to check
 * @returns Suppression status with reason if suppressed
 *
 * @example
 * ```typescript
 * const result = await checkEmailSuppression("user@example.com")
 * if (result.isSuppressed) {
 *   console.log(`Email suppressed due to ${result.reason}`)
 * }
 * ```
 */
export async function checkEmailSuppression(
  email: string
): Promise<SuppressionCheckResult> {
  try {
    const suppression = await prisma.emailSuppressionList.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        reason: true,
        createdAt: true,
      },
    })

    if (suppression) {
      return {
        isSuppressed: true,
        reason: suppression.reason,
        suppressedAt: suppression.createdAt,
      }
    }

    return { isSuppressed: false }
  } catch (error) {
    // Log error but don't block sending on suppression check failure
    console.error("[Email Suppression] Check failed:", error)
    return { isSuppressed: false }
  }
}

/**
 * Check multiple email addresses against suppression list
 *
 * @param emails - Array of email addresses to check
 * @returns Map of email to suppression status
 */
export async function checkEmailSuppressionBulk(
  emails: string[]
): Promise<Map<string, SuppressionCheckResult>> {
  const results = new Map<string, SuppressionCheckResult>()

  if (emails.length === 0) {
    return results
  }

  try {
    const normalizedEmails = emails.map(e => e.toLowerCase())

    const suppressions = await prisma.emailSuppressionList.findMany({
      where: { email: { in: normalizedEmails } },
      select: {
        email: true,
        reason: true,
        createdAt: true,
      },
    })

    // Build suppression map
    const suppressionMap = new Map(
      suppressions.map(s => [s.email, s])
    )

    // Check each email
    for (const email of normalizedEmails) {
      const suppression = suppressionMap.get(email)
      if (suppression) {
        results.set(email, {
          isSuppressed: true,
          reason: suppression.reason,
          suppressedAt: suppression.createdAt,
        })
      } else {
        results.set(email, { isSuppressed: false })
      }
    }

    return results
  } catch (error) {
    console.error("[Email Suppression] Bulk check failed:", error)
    // Return all as not suppressed on failure
    for (const email of emails) {
      results.set(email.toLowerCase(), { isSuppressed: false })
    }
    return results
  }
}

/**
 * Add an email to the suppression list
 *
 * @param email - Email address to suppress
 * @param reason - Reason for suppression
 * @param source - Source of suppression (webhook, user request, etc.)
 * @param sourceData - Optional additional data about the suppression
 */
export async function addEmailToSuppressionList(
  email: string,
  reason: "bounce" | "complaint" | "unsubscribe",
  source: string,
  sourceData?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.emailSuppressionList.upsert({
      where: { email: email.toLowerCase() },
      create: {
        email: email.toLowerCase(),
        reason,
        source,
        sourceData: sourceData as Prisma.InputJsonValue,
      },
      update: {
        reason,
        source,
        sourceData: sourceData as Prisma.InputJsonValue,
      },
    })

    console.log("[Email Suppression] Added to suppression list:", {
      email: email.toLowerCase(),
      reason,
      source,
    })
  } catch (error) {
    console.error("[Email Suppression] Failed to add to suppression list:", error)
    throw error
  }
}

/**
 * Remove an email from the suppression list
 * Use with caution - typically for admin override or user request validation
 *
 * @param email - Email address to remove from suppression list
 */
export async function removeEmailFromSuppressionList(
  email: string
): Promise<boolean> {
  try {
    await prisma.emailSuppressionList.delete({
      where: { email: email.toLowerCase() },
    })

    console.log("[Email Suppression] Removed from suppression list:", {
      email: email.toLowerCase(),
    })

    return true
  } catch (error) {
    // If not found, that's fine
    if ((error as any)?.code === "P2025") {
      return false
    }
    console.error("[Email Suppression] Failed to remove from suppression list:", error)
    throw error
  }
}
