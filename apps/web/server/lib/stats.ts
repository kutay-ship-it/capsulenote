import { prisma } from "./db"

/**
 * Dashboard statistics for a user
 */
export interface DashboardStats {
  totalLetters: number
  draftCount: number
  scheduledDeliveries: number
  deliveredCount: number
  recentLetters: RecentLetter[]
}

/**
 * Recent letter with metadata
 */
export interface RecentLetter {
  id: string
  title: string
  createdAt: Date
  deliveryCount: number
}

/**
 * Get dashboard statistics for a user
 *
 * Optimized queries with proper indexing:
 * - Total letters: indexed on userId + deletedAt
 * - Scheduled: indexed on userId + status + deliverAt
 * - Delivered: indexed on userId + status
 * - Recent: indexed on userId + createdAt
 *
 * Performance target: <100ms p95
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Run queries in parallel for performance
    const [totalLetters, draftCount, scheduledDeliveries, deliveredCount, recentLettersData] =
      await Promise.all([
        // Query 1: Total letters (exclude soft-deleted)
        prisma.letter.count({
          where: {
            userId,
            deletedAt: null,
          },
        }),

        // Query 2: Draft letters (no deliveries)
        prisma.letter.count({
          where: {
            userId,
            deletedAt: null,
            deliveries: {
              none: {},
            },
          },
        }),

        // Query 3: Scheduled deliveries (future deliveries only)
        prisma.delivery.count({
          where: {
            userId,
            status: "scheduled",
            deliverAt: {
              gt: new Date(), // Only future deliveries
            },
          },
        }),

        // Query 4: Delivered count
        prisma.delivery.count({
          where: {
            userId,
            status: "sent",
          },
        }),

        // Query 5: Recent 5 letters with delivery counts
        prisma.letter.findMany({
          where: {
            userId,
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                deliveries: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        }),
      ])

    // Transform recent letters to match interface
    const recentLetters: RecentLetter[] = recentLettersData.map(letter => ({
      id: letter.id,
      title: letter.title,
      createdAt: letter.createdAt,
      deliveryCount: letter._count.deliveries,
    }))

    return {
      totalLetters,
      draftCount,
      scheduledDeliveries,
      deliveredCount,
      recentLetters,
    }
  } catch (error) {
    console.error("[Stats] Failed to fetch dashboard stats:", error)

    // Return zero stats on error to prevent dashboard crash
    // Better UX than throwing - user still sees UI with 0s
    return {
      totalLetters: 0,
      draftCount: 0,
      scheduledDeliveries: 0,
      deliveredCount: 0,
      recentLetters: [],
    }
  }
}
