"use server"

import type { Prisma } from "@dearme/prisma"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { decryptLetter } from "@/server/lib/encryption"

/**
 * Types for the redesign dashboard
 */

export interface NextDeliveryHeroData {
  id: string
  deliverAt: Date
  letter: {
    id: string
    title: string
    createdAt: Date
    bodyPreview: string // First 100 chars, decrypted
  }
}

export interface DeliveryTimelineItem {
  id: string
  deliverAt: Date
  status: "sent" | "scheduled" | "failed"
  letter: {
    id: string
    title: string
  }
}

export interface LetterWithPreview {
  id: string
  title: string
  bodyPreview: string // First 100 chars
  createdAt: Date
  updatedAt: Date
  delivery?: {
    status: "scheduled" | "sent" | "failed"
    deliverAt: Date
    deliveredAt?: Date
  }
}

/**
 * Extract plain text from Tiptap JSON content
 */
function extractTextFromTiptap(content: Record<string, unknown>): string {
  const parts: string[] = []

  function traverse(node: Record<string, unknown>) {
    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text)
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child as Record<string, unknown>)
      }
    }
  }

  traverse(content)
  return parts.join(" ")
}

/**
 * Strip HTML tags and return plain text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Get preview text from encrypted letter content
 */
async function getBodyPreview(
  bodyCiphertext: Buffer,
  bodyNonce: Buffer,
  keyVersion: number,
  maxLength: number = 100
): Promise<string> {
  try {
    const { bodyRich, bodyHtml } = await decryptLetter(
      bodyCiphertext,
      bodyNonce,
      keyVersion
    )

    // Try to extract from rich content first
    let text = ""
    if (bodyRich && typeof bodyRich === "object") {
      text = extractTextFromTiptap(bodyRich)
    }

    // Fall back to HTML if rich content is empty
    if (!text && bodyHtml) {
      text = stripHtml(bodyHtml)
    }

    // Truncate and add ellipsis
    if (text.length > maxLength) {
      return text.substring(0, maxLength).trim() + "..."
    }

    return text || "No content"
  } catch (error) {
    console.error("[Dashboard] Failed to decrypt letter preview:", error)
    return "Unable to preview"
  }
}

/**
 * Get the next scheduled delivery for the hero section
 *
 * Returns the soonest scheduled delivery with letter title and preview
 * Performance target: <150ms p95 (includes decryption)
 */
export async function getNextDeliveryForHero(): Promise<NextDeliveryHeroData | null> {
  const user = await requireUser()

  try {
    const delivery = await prisma.delivery.findFirst({
      where: {
        userId: user.id,
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
            id: true,
            title: true,
            createdAt: true,
            bodyCiphertext: true,
            bodyNonce: true,
            keyVersion: true,
          },
        },
      },
    })

    if (!delivery) {
      return null
    }

    // Decrypt for preview
    const bodyPreview = await getBodyPreview(
      delivery.letter.bodyCiphertext,
      delivery.letter.bodyNonce,
      delivery.letter.keyVersion
    )

    return {
      id: delivery.id,
      deliverAt: delivery.deliverAt,
      letter: {
        id: delivery.letter.id,
        title: delivery.letter.title,
        createdAt: delivery.letter.createdAt,
        bodyPreview,
      },
    }
  } catch (error) {
    console.error("[Dashboard] Failed to fetch next delivery:", error)
    return null
  }
}

/**
 * Get all deliveries for the timeline visualization
 *
 * Returns all sent + scheduled deliveries ordered by date
 * Minimum 2 deliveries required to show timeline
 */
export async function getDeliveryTimeline(): Promise<DeliveryTimelineItem[]> {
  const user = await requireUser()

  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["sent", "scheduled", "failed"],
        },
      },
      orderBy: {
        deliverAt: "asc",
      },
      select: {
        id: true,
        deliverAt: true,
        status: true,
        letter: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return deliveries.map((d) => ({
      id: d.id,
      deliverAt: d.deliverAt,
      status: d.status as "sent" | "scheduled" | "failed",
      letter: {
        id: d.letter.id,
        title: d.letter.title,
      },
    }))
  } catch (error) {
    console.error("[Dashboard] Failed to fetch delivery timeline:", error)
    return []
  }
}

/**
 * Get letters with preview for the redesigned letter cards
 *
 * @param filter - Filter type: 'all' | 'drafts' | 'scheduled' | 'sent'
 * @param includePreview - Whether to decrypt and include body preview (slower)
 */
export async function getLettersWithPreview(
  filter: "all" | "drafts" | "scheduled" | "sent" = "all",
  includePreview: boolean = true
): Promise<LetterWithPreview[]> {
  const user = await requireUser()

  try {
    // Build filter conditions
    const whereClause: Prisma.LetterWhereInput = {
      userId: user.id,
      deletedAt: null,
    }

    switch (filter) {
      case "drafts":
        whereClause.deliveries = { none: {} }
        break
      case "scheduled":
        whereClause.deliveries = {
          some: { status: "scheduled" },
        }
        break
      case "sent":
        whereClause.deliveries = {
          some: { status: "sent" },
        }
        break
    }

    const letters = await prisma.letter.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        bodyCiphertext: includePreview,
        bodyNonce: includePreview,
        keyVersion: includePreview,
        deliveries: {
          select: {
            status: true,
            deliverAt: true,
            updatedAt: true,
          },
          orderBy: {
            deliverAt: "asc",
          },
          take: 1, // Get the most relevant delivery
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Map to response format with previews
    const lettersWithPreview: LetterWithPreview[] = await Promise.all(
      letters.map(async (letter) => {
        let bodyPreview = ""

        if (includePreview && letter.bodyCiphertext && letter.bodyNonce) {
          bodyPreview = await getBodyPreview(
            letter.bodyCiphertext,
            letter.bodyNonce,
            letter.keyVersion
          )
        }

        const delivery = letter.deliveries[0]

        return {
          id: letter.id,
          title: letter.title,
          bodyPreview,
          createdAt: letter.createdAt,
          updatedAt: letter.updatedAt,
          delivery: delivery
            ? {
                status: delivery.status as "scheduled" | "sent" | "failed",
                deliverAt: delivery.deliverAt,
                deliveredAt:
                  delivery.status === "sent" ? delivery.updatedAt : undefined,
              }
            : undefined,
        }
      })
    )

    return lettersWithPreview
  } catch (error) {
    console.error("[Dashboard] Failed to fetch letters with preview:", error)
    return []
  }
}
