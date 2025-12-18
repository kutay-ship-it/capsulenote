"use server"

/**
 * Migrate Anonymous Draft to Database
 *
 * Called after user signs up to move their localStorage draft
 * to the database as a real letter.
 *
 * This completes the progressive disclosure pattern.
 */

import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { encryptLetter } from "@/server/lib/encryption"
import { logger } from "@/server/lib/logger"
import type { ActionResult } from "@dearme/types"
import { ErrorCodes } from "@dearme/types"

export interface MigrateDraftInput {
  title: string
  body: string
}

/**
 * Migrate anonymous draft from localStorage to database
 *
 * Creates a new letter with the draft content.
 * The letter is saved as a draft (no delivery scheduled yet).
 */
export async function migrateAnonymousDraft(
  input: MigrateDraftInput
): Promise<ActionResult<{ letterId: string }>> {
  try {
    const user = await requireUser()

    // Validate input
    if (!input.body || input.body.trim().length === 0) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Letter body is required",
        },
      }
    }

    // Create simple HTML from plain text (preserving line breaks)
    const bodyHtml = `<p>${input.body
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .join('</p><p>')}</p>`

    // Create simple rich text structure (Tiptap JSON)
    const bodyRich = {
      type: 'doc',
      content: input.body
        .split('\n\n')
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => ({
          type: 'paragraph',
          content: [{ type: 'text', text: para }]
        }))
    }

    // Encrypt letter content
    let encrypted
    try {
      encrypted = await encryptLetter({
        bodyRich,
        bodyHtml,
      })
    } catch (error) {
      await logger.error('Draft migration encryption failed', error, {
        userId: user.id,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.ENCRYPTION_FAILED,
          message: 'Failed to encrypt letter content',
        },
      }
    }

    // Create letter in database
    const letter = await prisma.letter.create({
      data: {
        userId: user.id,
        title: input.title || 'Untitled Letter',
        bodyCiphertext: encrypted.bodyCiphertext,
        bodyNonce: encrypted.bodyNonce,
        bodyFormat: 'rich',
        keyVersion: encrypted.keyVersion,
        visibility: 'private',
        tags: [],
      },
    })

    // Create audit event
    await createAuditEvent({
      userId: user.id,
      type: 'letter.migrated_from_anonymous',
      data: {
        letterId: letter.id,
        wordCount: input.body.split(/\s+/).length,
        hadTitle: input.title.length > 0,
      },
    })

    await logger.info('Anonymous draft migrated successfully', {
      userId: user.id,
      letterId: letter.id,
    })

    // Revalidate cached pages
    revalidatePath("/letters")
    revalidatePath("/journey")

    return {
      success: true,
      data: {
        letterId: letter.id,
      },
    }
  } catch (error) {
    await logger.error('Failed to migrate anonymous draft', error, {
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to save your letter. Please try again.',
      },
    }
  }
}
