import { prisma } from "./db"
import { logger } from "./logger"
import { createAuditEvent } from "./audit"

/**
 * Draft Statistics
 *
 * A letter is considered a "draft" if it has no deliveries scheduled.
 */
export interface DraftStats {
  totalDrafts: number
  expiringDrafts: number // < 7 days until 30-day expiration
  expiredDrafts: number // > 30 days old
}

/**
 * Draft with metadata
 */
export interface DraftLetter {
  id: string
  title: string
  tags: string[]
  visibility: "private" | "link"
  createdAt: Date
  updatedAt: Date
  daysOld: number
  expiresInDays: number
}

/**
 * Get all draft letters for a user
 *
 * Draft = letter with 0 deliveries
 * Performance: Uses index on userId + deletedAt + createdAt
 */
export async function getDrafts(userId: string): Promise<DraftLetter[]> {
  try {
    const letters = await prisma.letter.findMany({
      where: {
        userId,
        deletedAt: null,
        deliveries: {
          none: {}, // No deliveries = draft
        },
      },
      select: {
        id: true,
        title: true,
        tags: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc", // Most recently edited first
      },
    })

    // Calculate age metadata
    const now = new Date()
    const EXPIRATION_DAYS = 30

    return letters.map((letter) => {
      const daysOld = Math.floor(
        (now.getTime() - letter.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      const expiresInDays = EXPIRATION_DAYS - daysOld

      return {
        ...letter,
        daysOld,
        expiresInDays,
      }
    })
  } catch (error) {
    await logger.error("Failed to fetch drafts", error, { userId })
    return []
  }
}

/**
 * Get draft statistics for a user
 *
 * Used in dashboard to show draft count and expiration warnings.
 */
export async function getDraftStats(userId: string): Promise<DraftStats> {
  try {
    const EXPIRATION_DAYS = 30
    const WARNING_DAYS = 7
    const now = new Date()
    const expirationDate = new Date(now.getTime() - EXPIRATION_DAYS * 24 * 60 * 60 * 1000)
    const warningDate = new Date(now.getTime() - (EXPIRATION_DAYS - WARNING_DAYS) * 24 * 60 * 60 * 1000)

    const [totalDrafts, expiringDrafts, expiredDrafts] = await Promise.all([
      // Total drafts
      prisma.letter.count({
        where: {
          userId,
          deletedAt: null,
          deliveries: {
            none: {},
          },
        },
      }),

      // Expiring soon (23-30 days old)
      prisma.letter.count({
        where: {
          userId,
          deletedAt: null,
          deliveries: {
            none: {},
          },
          createdAt: {
            lte: warningDate,
            gte: expirationDate,
          },
        },
      }),

      // Already expired (>30 days old)
      prisma.letter.count({
        where: {
          userId,
          deletedAt: null,
          deliveries: {
            none: {},
          },
          createdAt: {
            lt: expirationDate,
          },
        },
      }),
    ])

    return {
      totalDrafts,
      expiringDrafts,
      expiredDrafts,
    }
  } catch (error) {
    await logger.error("Failed to fetch draft stats", error, { userId })
    return {
      totalDrafts: 0,
      expiringDrafts: 0,
      expiredDrafts: 0,
    }
  }
}

/**
 * Clean up expired drafts (>30 days old with no deliveries)
 *
 * Called by cron job daily.
 * Soft deletes drafts to maintain referential integrity.
 *
 * @returns Number of drafts cleaned up
 */
export async function cleanupExpiredDrafts(): Promise<number> {
  try {
    const EXPIRATION_DAYS = 30
    const now = new Date()
    const expirationDate = new Date(now.getTime() - EXPIRATION_DAYS * 24 * 60 * 60 * 1000)

    // Find expired drafts
    const expiredDrafts = await prisma.letter.findMany({
      where: {
        deletedAt: null,
        deliveries: {
          none: {},
        },
        createdAt: {
          lt: expirationDate,
        },
      },
      select: {
        id: true,
        userId: true,
        title: true,
        createdAt: true,
      },
    })

    if (expiredDrafts.length === 0) {
      await logger.info("No expired drafts to clean up")
      return 0
    }

    // Soft delete all expired drafts in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.letter.updateMany({
        where: {
          id: {
            in: expiredDrafts.map((d) => d.id),
          },
        },
        data: {
          deletedAt: now,
        },
      })
    })

    // Create audit events for each deletion
    await Promise.all(
      expiredDrafts.map((draft) =>
        createAuditEvent({
          userId: draft.userId,
          type: "letter.auto_deleted",
          metadata: {
            letterId: draft.id,
            title: draft.title,
            reason: "draft_expired",
            daysOld: Math.floor(
              (now.getTime() - draft.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        })
      )
    )

    await logger.info("Expired drafts cleaned up", {
      count: expiredDrafts.length,
      letterIds: expiredDrafts.map((d) => d.id),
    })

    return expiredDrafts.length
  } catch (error) {
    await logger.error("Failed to clean up expired drafts", error)
    return 0
  }
}

/**
 * Check if a letter is a draft (has no deliveries)
 */
export async function isDraft(letterId: string): Promise<boolean> {
  try {
    const deliveryCount = await prisma.delivery.count({
      where: {
        letterId,
      },
    })

    return deliveryCount === 0
  } catch (error) {
    await logger.error("Failed to check draft status", error, { letterId })
    return false
  }
}
