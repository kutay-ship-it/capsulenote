"use server"

/**
 * Anonymous Draft Server Actions
 *
 * Handles draft letter storage for anonymous users:
 * 1. saveAnonymousDraft - Store draft with sessionId and email
 * 2. getAnonymousDrafts - Retrieve drafts by sessionId or email
 * 3. claimAnonymousDraft - Mark draft as claimed by authenticated user
 * 4. deleteAnonymousDraft - Remove draft after claiming
 *
 * Security:
 * - Drafts expire after 7 days
 * - sessionId prevents unauthorized access
 * - Email used for multi-device recovery
 */

import { prisma } from "@/server/lib/db"
import { cookies } from "next/headers"

export interface DraftContent {
  title: string
  body: string
  recipientEmail: string
  deliveryDate: string
}

export interface SaveDraftInput {
  content: DraftContent
  email: string
}

export interface SaveDraftResponse {
  success: boolean
  draftId?: string
  error?: string
}

/**
 * Get or create sessionId from cookie
 */
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("sessionId")?.value

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return sessionId
}

/**
 * Save anonymous draft to database
 *
 * Strategy: Save to both localStorage (immediate) and database (persistent)
 * - Database enables cross-device restoration
 * - localStorage provides instant fallback
 */
export async function saveAnonymousDraft(
  input: SaveDraftInput
): Promise<SaveDraftResponse> {
  try {
    const sessionId = await getSessionId()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Handle race condition: concurrent draft saves (rapid button clicks, multiple tabs)
    let draft
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        // Check if draft already exists for this session
        const existing = await prisma.anonymousDraft.findFirst({
          where: {
            sessionId,
            email: input.email.toLowerCase(),
            claimedAt: null,
          },
        })

        if (existing) {
          // Update existing draft
          draft = await prisma.anonymousDraft.update({
            where: { id: existing.id },
            data: {
              title: input.content.title,
              body: input.content.body,
              recipientEmail: input.content.recipientEmail.toLowerCase(),
              deliveryDate: input.content.deliveryDate,
              expiresAt, // Extend expiration
            },
          })
        } else {
          // Create new draft
          draft = await prisma.anonymousDraft.create({
            data: {
              sessionId,
              email: input.email.toLowerCase(),
              title: input.content.title,
              body: input.content.body,
              recipientEmail: input.content.recipientEmail.toLowerCase(),
              deliveryDate: input.content.deliveryDate,
              expiresAt,
            },
          })
        }

        break // Success, exit loop
      } catch (error: any) {
        // Handle race condition: another request created the draft between findFirst and create
        if (error?.code === 'P2002') {
          attempts++
          console.log(`[saveAnonymousDraft] Race condition detected (attempt ${attempts}/${maxAttempts})`)

          // Add jitter to prevent thundering herd
          await new Promise(resolve => setTimeout(resolve, 20 * attempts + Math.random() * 10))

          // If still not found and we have attempts left, try again
          if (attempts >= maxAttempts) {
            throw new Error(`Failed to save draft after ${maxAttempts} attempts`)
          }
          // Loop will retry findFirst → update/create
        } else {
          // Different error, not a race condition
          throw error
        }
      }
    }

    if (!draft) {
      throw new Error('Failed to save draft')
    }

    return {
      success: true,
      draftId: draft.id,
    }
  } catch (error) {
    console.error("[saveAnonymousDraft] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save draft",
    }
  }
}

/**
 * Get anonymous drafts for current session ONLY
 *
 * Security: Session-bound retrieval prevents unauthorized access.
 * Multi-device restoration requires email verification (future feature).
 *
 * Used by:
 * - Dashboard on mount (check for drafts to restore)
 * - Landing page on return (continue editing)
 */
export async function getAnonymousDrafts(): Promise<{
  drafts: Array<{ id: string; content: DraftContent; createdAt: Date }>
}> {
  try {
    const sessionId = await getSessionId()

    // Find unclaimed drafts by sessionId only (secure, device-bound)
    const drafts = await prisma.anonymousDraft.findMany({
      where: {
        sessionId,
        claimedAt: null,
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Limit to 5 most recent
    })

    return {
      drafts: drafts.map((draft) => ({
        id: draft.id,
        content: {
          title: draft.title,
          body: draft.body,
          recipientEmail: draft.recipientEmail,
          deliveryDate: draft.deliveryDate,
        },
        createdAt: draft.createdAt,
      })),
    }
  } catch (error) {
    console.error("[getAnonymousDrafts] Error:", error)
    return { drafts: [] }
  }
}

/**
 * Claim draft for authenticated user
 *
 * Called after user signs up to link their draft to their account
 */
export async function claimAnonymousDraft(
  draftId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = await getSessionId()

    // Verify draft belongs to this session or user's email
    const draft = await prisma.anonymousDraft.findUnique({
      where: { id: draftId },
    })

    if (!draft) {
      return { success: false, error: "Draft not found" }
    }

    if (draft.claimedAt) {
      return { success: false, error: "Draft already claimed" }
    }

    // Get user email to verify ownership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Verify ownership (either by sessionId or email match)
    const isOwner =
      draft.sessionId === sessionId ||
      draft.email.toLowerCase() === user.email.toLowerCase()

    if (!isOwner) {
      return { success: false, error: "Not authorized to claim this draft" }
    }

    // Mark as claimed
    await prisma.anonymousDraft.update({
      where: { id: draftId },
      data: {
        claimedAt: new Date(),
        claimedByUserId: userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[claimAnonymousDraft] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to claim draft",
    }
  }
}

/**
 * Delete anonymous draft
 *
 * Called after successfully importing draft into user's letters
 */
export async function deleteAnonymousDraft(
  draftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.anonymousDraft.delete({
      where: { id: draftId },
    })

    return { success: true }
  } catch (error) {
    console.error("[deleteAnonymousDraft] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete draft",
    }
  }
}
