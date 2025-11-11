"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createLetterSchema, updateLetterSchema, type ActionResult, ErrorCodes } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { encryptLetter, decryptLetter } from "@/server/lib/encryption"
import { logger } from "@/server/lib/logger"

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

    // Encrypt letter content
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

    // Create letter in database
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
          details: error,
        },
      }
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
        const bodyRich = data.bodyRich || (await decryptLetter(
          existing.bodyCiphertext,
          existing.bodyNonce,
          existing.keyVersion
        )).bodyRich

        const bodyHtml = data.bodyHtml || (await decryptLetter(
          existing.bodyCiphertext,
          existing.bodyNonce,
          existing.keyVersion
        )).bodyHtml

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

    // Soft delete
    try {
      await prisma.letter.update({
        where: { id: letterId },
        data: { deletedAt: new Date() },
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
