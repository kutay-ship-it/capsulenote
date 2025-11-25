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
 * Next scheduled delivery info
 */
export interface NextDelivery {
  id: string
  letterId: string
  deliverAt: Date
  letterTitle: string
  channel: "email" | "mail"
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

/**
 * Get the next scheduled delivery for a user
 *
 * Used for the "Next letter arrives in X days" widget
 */
export async function getNextDelivery(userId: string): Promise<NextDelivery | null> {
  try {
    const delivery = await prisma.delivery.findFirst({
      where: {
        userId,
        status: "scheduled",
        deliverAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        deliverAt: "asc",
      },
      include: {
        letter: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!delivery) {
      return null
    }

    return {
      id: delivery.id,
      letterId: delivery.letterId,
      deliverAt: delivery.deliverAt,
      letterTitle: delivery.letter.title,
      channel: delivery.channel,
    }
  } catch (error) {
    console.error("[Stats] Failed to fetch next delivery:", error)
    return null
  }
}

/**
 * Next delivery with timeline info for minimap widget
 */
export interface NextDeliveryWithTimeline {
  id: string
  letterId: string
  deliverAt: Date
  letterTitle: string
  channel: "email" | "mail"
  status: string
  createdAt: Date
}

/**
 * Get the next scheduled delivery with status for timeline minimap
 *
 * Shows the delivery journey progress in a compact format
 */
export async function getNextDeliveryWithTimeline(
  userId: string
): Promise<NextDeliveryWithTimeline | null> {
  try {
    // First try to find an active delivery (scheduled or processing)
    let delivery = await prisma.delivery.findFirst({
      where: {
        userId,
        status: {
          in: ["scheduled", "processing"],
        },
      },
      orderBy: {
        deliverAt: "asc",
      },
      include: {
        letter: {
          select: {
            title: true,
            createdAt: true,
          },
        },
      },
    })

    // If no active delivery, get the most recent one (sent or failed)
    if (!delivery) {
      delivery = await prisma.delivery.findFirst({
        where: {
          userId,
        },
        orderBy: {
          deliverAt: "desc",
        },
        include: {
          letter: {
            select: {
              title: true,
              createdAt: true,
            },
          },
        },
      })
    }

    if (!delivery) {
      return null
    }

    return {
      id: delivery.id,
      letterId: delivery.letterId,
      deliverAt: delivery.deliverAt,
      letterTitle: delivery.letter.title,
      channel: delivery.channel,
      status: delivery.status,
      createdAt: delivery.letter.createdAt,
    }
  } catch (error) {
    console.error("[Stats] Failed to fetch next delivery with timeline:", error)
    return null
  }
}
