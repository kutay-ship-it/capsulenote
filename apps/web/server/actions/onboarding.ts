"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { logger } from "@/server/lib/logger"
import type { ActionResult } from "@dearme/types"

/**
 * Mark onboarding as completed for the current user
 *
 * This is called when a user completes the welcome modal
 * or explicitly skips it. Once marked complete, the modal
 * will never show again for this user.
 */
export async function completeOnboarding(): Promise<ActionResult<{ success: true }>> {
  try {
    const user = await requireUser()

    // Update profile to mark onboarding complete
    await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        onboardingCompleted: true,
      },
    })

    // Create audit event
    await createAuditEvent({
      userId: user.id,
      type: "user.onboarding_completed",
      data: { completedAt: new Date().toISOString() },
    })

    await logger.info('User completed onboarding', {
      userId: user.id,
    })

    // Revalidate dashboard to reflect changes
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    await logger.error('Failed to complete onboarding', error)

    return {
      success: false,
      error: {
        code: 'ONBOARDING_COMPLETION_FAILED' as const,
        message: 'Failed to complete onboarding. Please try again.',
        // details removed - logged server-side
      },
    }
  }
}
