"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createLetterSchema, updateLetterSchema, type ActionResult, ErrorCodes } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { encryptLetter, decryptLetter } from "@/server/lib/encryption"
import { logger } from "@/server/lib/logger"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { getEntitlements, trackLetterCreation } from "@/server/lib/entitlements"

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
          details: error,
        },
      }
    }

    // Check and enforce quotas atomically in transaction
    let letter
    try {
      letter = await prisma.$transaction(async (tx) => {
        // For Pro users, we don't need to check quotas
        const entitlements = await getEntitlements(user.id)

        if (entitlements.plan === 'none' || entitlements.plan === 'free') {
          // For free tier, atomically count and check quota within transaction
          const period = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0, 0))

          // Count current letters this month (within transaction)
          const lettersThisMonth = await tx.letter.count({
            where: {
              userId: user.id,
              createdAt: { gte: period },
              deletedAt: null
            }
          })

          const FREE_TIER_LIMIT = 5
          if (lettersThisMonth >= FREE_TIER_LIMIT) {
            throw new Error('QUOTA_EXCEEDED')
          }
        }

        // Create letter (within same transaction)
        const newLetter = await tx.letter.create({
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

        return newLetter
      })
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
        const entitlements = await getEntitlements(user.id)
        await logger.warn('User attempted to create letter beyond quota', {
          userId: user.id,
          plan: entitlements.plan,
          lettersThisMonth: entitlements.usage.lettersThisMonth,
          limit: entitlements.features.maxLettersPerMonth,
        })

        return {
          success: false,
          error: {
            code: ErrorCodes.QUOTA_EXCEEDED,
            message: `Free plan limit reached (${entitlements.features.maxLettersPerMonth} letters/month)`,
            details: {
              currentUsage: entitlements.usage.lettersThisMonth,
              limit: entitlements.features.maxLettersPerMonth,
              upgradeUrl: '/pricing'
            }
          }
        }
      }

      // Handle other database errors
      await logger.error('Letter creation database error', error, {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.CREATION_FAILED,
          message: 'Failed to save letter. Please try again.',
          details: error,
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
      await triggerInngestEvent("notification.letter.created", {
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
        details: error,
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

    // Verify ownership
    const existing = await prisma.letter.findFirst({
      where: { id, userId: user.id, deletedAt: null },
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
            details: error,
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
          details: error,
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
        details: error,
      },
    }
  }
}

/**
 * Soft delete a letter
 * Returns error instead of throwing for predictable error handling
 */
export async function deleteLetter(
  letterId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

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
          details: error,
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
        details: error,
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
