"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createLetterSchema, updateLetterSchema, type ActionResult, ErrorCodes } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { encryptLetter, decryptLetter } from "@/server/lib/encryption"
import { logger } from "@/server/lib/logger"
import { triggerInngestEvent, cancelInngestRun } from "@/server/lib/trigger-inngest"
import { trackLetterCreation } from "@/server/lib/entitlements"
import { ratelimit } from "@/server/lib/redis"

/**
 * Create a new letter with encrypted content
 * Returns error instead of throwing for predictable error handling
 */
export async function createLetter(
  input: unknown
): Promise<ActionResult<{ letterId: string }>> {
  try {
    // Get authenticated user
    const user = await requireUser()

    // Rate limiting: 10 letters per hour
    const { success: rateLimitOk } = await ratelimit.createLetter.limit(user.id)
    if (!rateLimitOk) {
      await logger.warn('Letter creation rate limit exceeded', {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.RATE_LIMIT_EXCEEDED,
          message: 'You have created too many letters. Please try again later.',
        },
      }
    }

    // Validate input
    const validated = createLetterSchema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Letter creation validation failed', {
        userId: user.id,
        errors: validated.error.flatten().fieldErrors,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Invalid letter data. Please check your input.',
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const data = validated.data

    // Encrypt letter content before transaction
    let encrypted: Awaited<ReturnType<typeof encryptLetter>>
    try {
      encrypted = await encryptLetter({
        bodyRich: data.bodyRich,
        bodyHtml: data.bodyHtml,
      })
    } catch (error) {
      await logger.error('Letter encryption failed', error, {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.ENCRYPTION_FAILED,
          message: 'Failed to encrypt letter content. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    // Create letter (no free-tier limits)
    let letter
    try {
      letter = await prisma.letter.create({
        data: {
          userId: user.id,
          title: data.title,
          bodyCiphertext: encrypted.bodyCiphertext,
          bodyNonce: encrypted.bodyNonce,
          bodyFormat: "rich",
          keyVersion: encrypted.keyVersion,
          tags: data.tags,
          visibility: data.visibility,
        },
      })
    } catch (error) {
      await logger.error('Letter creation database error', error, {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.CREATION_FAILED,
          message: 'Failed to save letter. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    // Track usage
    try {
      await trackLetterCreation(user.id)
    } catch (error) {
      // Non-critical - log but don't fail letter creation
      await logger.warn('Failed to track letter creation', {
        userId: user.id,
        letterId: letter.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Create audit event
    await createAuditEvent({
      userId: user.id,
      type: "letter.created",
      data: { letterId: letter.id, title: letter.title },
    })

    await logger.info('Letter created successfully', {
      userId: user.id,
      letterId: letter.id,
    })

    // Trigger confirmation email (non-blocking)
    try {
      await triggerInngestEvent("letter/created", {
        letterId: letter.id,
        userId: user.id,
        letterTitle: letter.title,
      })
      await logger.info('Letter confirmation email triggered', {
        userId: user.id,
        letterId: letter.id,
      })
    } catch (error) {
      // Don't fail letter creation if email trigger fails
      await logger.error('Failed to trigger confirmation email', error, {
        userId: user.id,
        letterId: letter.id,
      })
    }

    // Revalidate cached pages
    revalidatePath("/letters")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: { letterId: letter.id },
    }
  } catch (error) {
    // Catch-all for unexpected errors
    await logger.error('Unexpected error in createLetter', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}

/**
 * Update an existing letter
 * Returns error instead of throwing for predictable error handling
 */
export async function updateLetter(
  input: unknown
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = updateLetterSchema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Letter update validation failed', {
        userId: user.id,
        errors: validated.error.flatten().fieldErrors,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Invalid update data. Please check your input.',
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const { id, ...data } = validated.data

    // Verify ownership and check for scheduled physical mail deliveries
    const existing = await prisma.letter.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: {
        deliveries: {
          where: {
            channel: 'mail',
            status: 'scheduled',
          },
          include: {
            mailDelivery: {
              select: { sealedAt: true },
            },
          },
        },
      },
    })

    if (!existing) {
      await logger.warn('Letter not found for update', {
        userId: user.id,
        letterId: id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Letter not found or you do not have permission to edit it.',
        },
      }
    }

    // Block content edits if letter has sealed physical mail delivery
    const hasSealedDelivery = existing.deliveries.some(
      (d) => d.mailDelivery?.sealedAt != null
    )
    const isContentEdit = data.bodyRich !== undefined || data.bodyHtml !== undefined

    if (hasSealedDelivery && isContentEdit) {
      await logger.warn('Attempted to edit sealed letter content', {
        userId: user.id,
        letterId: id,
        sealedDeliveryCount: existing.deliveries.filter((d) => d.mailDelivery?.sealedAt).length,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'This letter cannot be edited because it has a scheduled physical mail delivery. Cancel the delivery first to make changes.',
        },
      }
    }

    // Prepare update data
    const updateData: {
      title?: string
      bodyCiphertext?: Buffer
      bodyNonce?: Buffer
      keyVersion?: number
      tags?: string[]
      visibility?: "private" | "link"
    } = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.visibility !== undefined) updateData.visibility = data.visibility

    // If body content is being updated, re-encrypt
    if (data.bodyRich || data.bodyHtml) {
      try {
        // Decrypt once to avoid race conditions
        const decrypted = await decryptLetter(
          existing.bodyCiphertext,
          existing.bodyNonce,
          existing.keyVersion
        )

        const bodyRich = data.bodyRich || decrypted.bodyRich
        const bodyHtml = data.bodyHtml || decrypted.bodyHtml

        const encrypted = await encryptLetter({ bodyRich, bodyHtml })
        updateData.bodyCiphertext = encrypted.bodyCiphertext
        updateData.bodyNonce = encrypted.bodyNonce
        updateData.keyVersion = encrypted.keyVersion
      } catch (error) {
        await logger.error('Letter encryption failed during update', error, {
          userId: user.id,
          letterId: id,
        })

        return {
          success: false,
          error: {
            code: ErrorCodes.ENCRYPTION_FAILED,
            message: 'Failed to encrypt updated content. Please try again.',
            // details removed - logged server-side, not exposed to client
          },
        }
      }
    }

    // Update letter
    try {
      await prisma.letter.update({
        where: { id },
        data: updateData,
      })
    } catch (error) {
      await logger.error('Letter update database error', error, {
        userId: user.id,
        letterId: id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.UPDATE_FAILED,
          message: 'Failed to update letter. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    await createAuditEvent({
      userId: user.id,
      type: "letter.updated",
      data: { letterId: id },
    })

    await logger.info('Letter updated successfully', {
      userId: user.id,
      letterId: id,
    })

    revalidatePath(`/letters/${id}`)
    revalidatePath("/letters")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    await logger.error('Unexpected error in updateLetter', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}

/**
 * Schema for delete letter validation
 */
const deleteLetterSchema = z.object({
  letterId: z.string().uuid("Invalid letter ID format"),
})

/**
 * Soft delete a letter
 * Returns error instead of throwing for predictable error handling
 */
export async function deleteLetter(
  input: unknown
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = deleteLetterSchema.safeParse(
      typeof input === "string" ? { letterId: input } : input
    )
    if (!validated.success) {
      await logger.warn("Letter deletion validation failed", {
        userId: user.id,
        errors: validated.error.flatten().fieldErrors,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid letter ID format.",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const { letterId } = validated.data

    // Verify ownership
    const existing = await prisma.letter.findFirst({
      where: { id: letterId, userId: user.id, deletedAt: null },
    })

    if (!existing) {
      await logger.warn('Letter not found for deletion', {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Letter not found or you do not have permission to delete it.',
        },
      }
    }

    // Soft delete letter and cancel associated deliveries
    try {
      await prisma.$transaction(async (tx) => {
        // Soft delete letter
        await tx.letter.update({
          where: { id: letterId },
          data: { deletedAt: new Date() },
        })

        // Find deliveries with Inngest jobs to cancel
        const deliveriesWithJobs = await tx.delivery.findMany({
          where: {
            letterId,
            status: { in: ["scheduled", "failed"] },
            inngestRunId: { not: null },
          },
          select: { id: true, inngestRunId: true },
        })

        // Cancel Inngest jobs before updating delivery status
        for (const delivery of deliveriesWithJobs) {
          if (delivery.inngestRunId) {
            try {
              await cancelInngestRun(delivery.inngestRunId)
            } catch (cancelError) {
              // Log but don't fail the deletion - delivery will be marked canceled anyway
              await logger.warn("Failed to cancel Inngest job for delivery", {
                deliveryId: delivery.id,
                inngestRunId: delivery.inngestRunId,
                error: cancelError,
              })
            }
          }
        }

        // Cancel all scheduled/failed deliveries for this letter
        await tx.delivery.updateMany({
          where: {
            letterId,
            status: { in: ["scheduled", "failed"] }
          },
          data: { status: "canceled" }
        })
      })

      await logger.info('Letter deleted and deliveries canceled', {
        userId: user.id,
        letterId,
      })
    } catch (error) {
      await logger.error('Letter deletion database error', error, {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.DELETE_FAILED,
          message: 'Failed to delete letter. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    await createAuditEvent({
      userId: user.id,
      type: "letter.deleted",
      data: { letterId },
    })

    await logger.info('Letter deleted successfully', {
      userId: user.id,
      letterId,
    })

    revalidatePath("/letters")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    await logger.error('Unexpected error in deleteLetter', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}

/**
 * Get all letters for current user (list view - no decryption)
 * Throws on error since this is a data fetch, not a mutation
 */
export async function getLetters() {
  const user = await requireUser()

  const letters = await prisma.letter.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
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
      // Don't select encrypted content in list view for performance
    },
  })

  return letters
}

/**
 * Get single letter with decrypted content
 * Throws on error since this is a data fetch, not a mutation
 */
export async function getLetter(letterId: string) {
  const user = await requireUser()

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      userId: user.id,
      deletedAt: null,
    },
    include: {
      deliveries: {
        include: {
          emailDelivery: true,
          mailDelivery: true,
        },
        orderBy: {
          deliverAt: "asc",
        },
      },
      deliveryAttempts: true,
    },
  })

  if (!letter) {
    throw new Error("Letter not found")
  }

  // Decrypt content
  const decrypted = await decryptLetter(
    letter.bodyCiphertext,
    letter.bodyNonce,
    letter.keyVersion
  )

  return {
    ...letter,
    bodyRich: decrypted.bodyRich,
    bodyHtml: decrypted.bodyHtml,
  }
}

/**
 * Get a letter by ID for the current user (nullable)
 * Gracefully returns null if letter is missing or belongs to another user.
 */
export async function getLetterById(letterId: string) {
  const user = await requireUser()

  const letter = await prisma.letter.findUnique({
    where: { id: letterId },
  })

  if (!letter || letter.userId !== user.id || letter.deletedAt) {
    return null
  }

  const decrypted = await decryptLetter(
    letter.bodyCiphertext,
    letter.bodyNonce,
    letter.keyVersion
  )

  return {
    ...letter,
    bodyRich: decrypted.bodyRich,
    bodyHtml: decrypted.bodyHtml,
  }
}

// ============================================================================
// UNLOCK CEREMONY ACTIONS (V3)
// ============================================================================

/**
 * Mark a letter as opened for the first time (idempotent)
 * Used for the unlock ceremony to track when user first opens their time capsule
 */
export async function markLetterAsOpened(
  letterId: string
): Promise<ActionResult<{ firstOpenedAt: Date }>> {
  try {
    const user = await requireUser()

    // Find letter with ownership check
    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        firstOpenedAt: true,
      },
    })

    if (!letter) {
      await logger.warn('Letter not found for marking as opened', {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Letter not found or you do not have permission to access it.',
        },
      }
    }

    // If already opened, return existing timestamp (idempotent)
    if (letter.firstOpenedAt) {
      await logger.info('Letter already opened, returning existing timestamp', {
        userId: user.id,
        letterId,
        firstOpenedAt: letter.firstOpenedAt,
      })

      return {
        success: true,
        data: { firstOpenedAt: letter.firstOpenedAt },
      }
    }

    // Set firstOpenedAt
    const now = new Date()
    try {
      await prisma.letter.update({
        where: { id: letterId },
        data: { firstOpenedAt: now },
      })
    } catch (error) {
      await logger.error('Failed to mark letter as opened', error, {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.UPDATE_FAILED,
          message: 'Failed to record letter opening. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    // Create audit event
    await createAuditEvent({
      userId: user.id,
      type: 'letter.first_opened',
      data: { letterId, openedAt: now.toISOString() },
    })

    await logger.info('Letter marked as first opened', {
      userId: user.id,
      letterId,
      firstOpenedAt: now,
    })

    // Revalidate pages
    revalidatePath(`/letters-v3/${letterId}`)
    revalidatePath(`/unlock-v3/${letterId}`)

    return {
      success: true,
      data: { firstOpenedAt: now },
    }
  } catch (error) {
    await logger.error('Unexpected error in markLetterAsOpened', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}

/**
 * Get letter for unlock page
 * Validates: ownership, has sent delivery, delivery time has passed
 * Returns decrypted content for the unlock ceremony
 */
export async function getLetterForUnlock(letterId: string): Promise<
  ActionResult<{
    id: string
    title: string
    bodyHtml: string
    bodyRich: unknown
    createdAt: Date
    firstOpenedAt: Date | null
    delivery: {
      id: string
      deliverAt: Date
      channel: string
    }
  }>
> {
  try {
    const user = await requireUser()

    // Find letter with sent delivery
    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        deliveries: {
          where: {
            status: 'sent',
          },
          orderBy: {
            deliverAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!letter) {
      await logger.warn('Letter not found for unlock', {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Letter not found or you do not have permission to access it.',
        },
      }
    }

    // Check if letter has a sent delivery
    const sentDelivery = letter.deliveries[0]
    if (!sentDelivery) {
      await logger.warn('Letter has no sent delivery for unlock', {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'This letter has not been delivered yet.',
        },
      }
    }

    // Check if delivery time has passed
    const now = new Date()
    if (sentDelivery.deliverAt > now) {
      await logger.warn('Attempted to unlock letter before delivery time', {
        userId: user.id,
        letterId,
        deliverAt: sentDelivery.deliverAt,
        now,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'This letter cannot be opened yet. Please wait until the delivery time.',
        },
      }
    }

    // Decrypt content
    let decrypted
    try {
      decrypted = await decryptLetter(
        letter.bodyCiphertext,
        letter.bodyNonce,
        letter.keyVersion
      )
    } catch (error) {
      await logger.error('Failed to decrypt letter for unlock', error, {
        userId: user.id,
        letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.ENCRYPTION_FAILED,
          message: 'Failed to decrypt letter content. Please try again.',
          // details removed - logged server-side, not exposed to client
        },
      }
    }

    await logger.info('Letter retrieved for unlock ceremony', {
      userId: user.id,
      letterId,
      hasFirstOpened: !!letter.firstOpenedAt,
    })

    return {
      success: true,
      data: {
        id: letter.id,
        title: letter.title,
        bodyHtml: decrypted.bodyHtml,
        bodyRich: decrypted.bodyRich,
        createdAt: letter.createdAt,
        firstOpenedAt: letter.firstOpenedAt,
        delivery: {
          id: sentDelivery.id,
          deliverAt: sentDelivery.deliverAt,
          channel: sentDelivery.channel,
        },
      },
    }
  } catch (error) {
    await logger.error('Unexpected error in getLetterForUnlock', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred. Please try again.',
        // details removed - logged server-side, not exposed to client
      },
    }
  }
}
