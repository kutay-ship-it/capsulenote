"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { ErrorCodes, type ActionResult } from "@dearme/types"

const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  timezone: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Update user profile
 *
 * Allows users to update their display name and timezone
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    const validated = updateProfileSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid input",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    await prisma.profile.update({
      where: { userId: user.id },
      data: validated.data,
    })

    revalidatePath("/settings")

    return { success: true, data: undefined }
  } catch (error) {
    console.error("[Profile] Failed to update profile:", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.UPDATE_FAILED,
        message: "Failed to update profile",
      },
    }
  }
}
