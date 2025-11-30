"use server"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"

/**
 * Letter filter types
 */
export type LetterFilter = "all" | "drafts" | "scheduled" | "delivered"

/**
 * Letter with status metadata
 */
export interface LetterWithStatus {
  id: string
  title: string
  tags: string[]
  visibility: "private" | "link"
  createdAt: Date
  updatedAt: Date
  deliveryCount: number
  status: "draft" | "scheduled" | "delivered"
}

/**
 * Get filtered letters for current user
 *
 * Status logic:
 * - draft: 0 deliveries
 * - scheduled: has deliveries with status = 'scheduled'
 * - delivered: has deliveries with status = 'sent'
 */
export async function getFilteredLetters(filter: LetterFilter = "all"): Promise<LetterWithStatus[]> {
  const user = await requireUser()

  // Base query
  const baseWhere = {
    userId: user.id,
    deletedAt: null,
  }

  // Apply filter-specific conditions
  let letters
  switch (filter) {
    case "drafts":
      letters = await prisma.letter.findMany({
        where: {
          ...baseWhere,
          deliveries: {
            none: {},
          },
        },
        select: {
          id: true,
          title: true,
          tags: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { deliveries: true },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
      break

    case "scheduled":
      letters = await prisma.letter.findMany({
        where: {
          ...baseWhere,
          deliveries: {
            some: {
              status: "scheduled",
            },
          },
        },
        select: {
          id: true,
          title: true,
          tags: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { deliveries: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      break

    case "delivered":
      letters = await prisma.letter.findMany({
        where: {
          ...baseWhere,
          deliveries: {
            some: {
              status: "sent",
            },
          },
        },
        select: {
          id: true,
          title: true,
          tags: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { deliveries: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      break

    case "all":
    default:
      letters = await prisma.letter.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          tags: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { deliveries: true },
          },
          deliveries: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      break
  }

  // Map to LetterWithStatus
  return letters.map((letter) => {
    let status: "draft" | "scheduled" | "delivered"

    if (letter._count.deliveries === 0) {
      status = "draft"
    } else if ("deliveries" in letter && Array.isArray(letter.deliveries)) {
      // For "all" filter, determine status from deliveries
      const deliveries = letter.deliveries as Array<{ status: string }>
      const hasScheduled = deliveries.some((d) => d.status === "scheduled")
      const hasSent = deliveries.some((d) => d.status === "sent")
      status = hasSent ? "delivered" : hasScheduled ? "scheduled" : "draft"
    } else {
      // For filtered queries, use the filter type
      status = filter === "scheduled" ? "scheduled" : filter === "delivered" ? "delivered" : "draft"
    }

    return {
      id: letter.id,
      title: letter.title,
      tags: letter.tags,
      visibility: letter.visibility,
      createdAt: letter.createdAt,
      updatedAt: letter.updatedAt,
      deliveryCount: letter._count.deliveries,
      status,
    }
  })
}

/**
 * Get letter counts by status for filter badges
 */
export async function getLetterCounts(): Promise<{
  all: number
  drafts: number
  scheduled: number
  delivered: number
}> {
  const user = await requireUser()

  const [all, drafts, scheduled, delivered] = await Promise.all([
    prisma.letter.count({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    }),
    prisma.letter.count({
      where: {
        userId: user.id,
        deletedAt: null,
        deliveries: {
          none: {},
        },
      },
    }),
    prisma.letter.count({
      where: {
        userId: user.id,
        deletedAt: null,
        deliveries: {
          some: {
            status: "scheduled",
          },
        },
      },
    }),
    prisma.letter.count({
      where: {
        userId: user.id,
        deletedAt: null,
        deliveries: {
          some: {
            status: "sent",
          },
        },
      },
    }),
  ])

  return { all, drafts, scheduled, delivered }
}
