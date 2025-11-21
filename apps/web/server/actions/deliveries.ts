"use server"

import { revalidatePath } from "next/cache"
import {
  scheduleDeliverySchema,
  updateDeliverySchema,
  cancelDeliverySchema,
  type ActionResult,
  ErrorCodes,
} from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { logger } from "@/server/lib/logger"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { getEntitlements, trackEmailDelivery, deductMailCredit } from "@/server/lib/entitlements"

/**
 * Schedule a new delivery for a letter
 * Returns error instead of throwing for predictable error handling
 */
export async function scheduleDelivery(
  input: unknown
): Promise<ActionResult<{ deliveryId: string }>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = scheduleDeliverySchema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Delivery scheduling validation failed', {
        userId: user.id,
        errors: validated.error.flatten().fieldErrors,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Invalid delivery data. Please check your input.',
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const data = validated.data

    // Check subscription entitlements
    const entitlements = await getEntitlements(user.id)

    // Check if user can schedule deliveries
    if (!entitlements.features.canScheduleDeliveries) {
      await logger.warn('User attempted to schedule delivery without Pro subscription', {
        userId: user.id,
        plan: entitlements.plan,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.SUBSCRIPTION_REQUIRED,
          message: 'Scheduling deliveries requires a Pro subscription',
          details: {
            requiredPlan: 'pro',
            currentPlan: entitlements.plan,
            upgradeUrl: '/pricing'
          }
        }
      }
    }

    // For physical mail, check credits
    if (data.channel === 'mail') {
      if (!entitlements.features.canSchedulePhysicalMail) {
        await logger.warn('User attempted to schedule physical mail without Pro subscription', {
          userId: user.id,
          plan: entitlements.plan,
        })

        return {
          success: false,
          error: {
            code: ErrorCodes.SUBSCRIPTION_REQUIRED,
            message: 'Physical mail requires Pro subscription'
          }
        }
      }

      if (entitlements.limits.mailCreditsExhausted) {
        await logger.warn('User attempted to schedule mail without credits', {
          userId: user.id,
          mailCreditsRemaining: entitlements.usage.mailCreditsRemaining,
        })

        return {
          success: false,
          error: {
            code: ErrorCodes.INSUFFICIENT_CREDITS,
            message: 'No mail credits remaining',
            details: {
              action: 'purchase_credits',
              url: '/settings/billing'
            }
          }
        }
      }
    }

    // Verify letter ownership
    const letter = await prisma.letter.findFirst({
      where: {
        id: data.letterId,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!letter) {
      await logger.warn('Letter not found for delivery scheduling', {
        userId: user.id,
        letterId: data.letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Letter not found or you do not have permission to schedule deliveries for it.',
        },
      }
    }

    // Create delivery
    let delivery
    try {
      delivery = await prisma.delivery.create({
        data: {
          userId: user.id,
          letterId: data.letterId,
          channel: data.channel,
          deliverAt: data.deliverAt,
          timezoneAtCreation: data.timezone,
          status: "scheduled",
        },
      })
    } catch (error) {
      await logger.error('Delivery creation database error', error, {
        userId: user.id,
        letterId: data.letterId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.CREATION_FAILED,
          message: 'Failed to schedule delivery. Please try again.',
          details: error,
        },
      }
    }

    // Create channel-specific delivery record
    try {
      if (data.channel === "email") {
        await prisma.emailDelivery.create({
          data: {
            deliveryId: delivery.id,
            toEmail: data.toEmail ?? user.email,
            subject: `Letter to your future self: ${letter.title}`,
          },
        })
      } else if (data.channel === "mail" && data.shippingAddressId) {
        await prisma.mailDelivery.create({
          data: {
            deliveryId: delivery.id,
            shippingAddressId: data.shippingAddressId,
            printOptions: data.printOptions ?? { color: false, doubleSided: false },
          },
        })
      }
    } catch (error) {
      await logger.error('Channel-specific delivery creation error', error, {
        userId: user.id,
        deliveryId: delivery.id,
        channel: data.channel,
      })

      // Rollback delivery creation
      await prisma.delivery.delete({ where: { id: delivery.id } })

      return {
        success: false,
        error: {
          code: ErrorCodes.CREATION_FAILED,
          message: 'Failed to configure delivery channel. Please try again.',
          details: error,
        },
      }
    }

    // Track usage and deduct credits
    try {
      if (data.channel === 'email') {
        await trackEmailDelivery(user.id)
      } else if (data.channel === 'mail') {
        await deductMailCredit(user.id)
      }
    } catch (error) {
      // Non-critical - log but don't fail delivery
      await logger.warn('Failed to track usage', {
        userId: user.id,
        deliveryId: delivery.id,
        channel: data.channel,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Trigger Inngest workflow to schedule delivery
    try {
      await triggerInngestEvent("delivery.scheduled", { deliveryId: delivery.id })
      await logger.info('Inngest event sent successfully', {
        deliveryId: delivery.id,
        event: 'delivery.scheduled',
      })
    } catch (inngestError) {
      await logger.error('Failed to send Inngest event', inngestError, {
        deliveryId: delivery.id,
        event: 'delivery.scheduled',
      })
      // Don't fail the entire operation - delivery is still created
      // The backstop reconciler will catch this
    }

    await createAuditEvent({
      userId: user.id,
      type: "delivery.scheduled",
      data: {
        deliveryId: delivery.id,
        letterId: data.letterId,
        channel: data.channel,
        deliverAt: data.deliverAt.toISOString(),
      },
    })

    // Trigger confirmation email (non-blocking)
    try {
      await triggerInngestEvent("notification.delivery.scheduled", {
        deliveryId: delivery.id,
        userId: user.id,
        letterTitle: letter.title,
      })
      await logger.info('Confirmation email event triggered', {
        deliveryId: delivery.id,
        event: 'notification.delivery.scheduled',
      })
    } catch (error) {
      // Log but don't fail delivery creation
      await logger.warn('Failed to trigger confirmation email event', {
        userId: user.id,
        deliveryId: delivery.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    await logger.info('Delivery scheduled successfully', {
      userId: user.id,
      deliveryId: delivery.id,
      letterId: data.letterId,
    })

    revalidatePath(`/letters/${data.letterId}`)
    revalidatePath("/deliveries")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: { deliveryId: delivery.id },
    }
  } catch (error) {
    await logger.error('Unexpected error in scheduleDelivery', error)

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
 * Update an existing delivery
 * Returns error instead of throwing for predictable error handling
 */
export async function updateDelivery(
  input: unknown
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = updateDeliverySchema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Delivery update validation failed', {
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

    const { deliveryId, ...data } = validated.data

    // Verify ownership and status
    const existing = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        userId: user.id,
        status: { in: ["scheduled", "failed"] },
      },
    })

    if (!existing) {
      await logger.warn('Delivery not found or cannot be updated', {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Delivery not found or cannot be updated (it may have already been sent).',
        },
      }
    }

    // Update delivery
    try {
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          ...(data.deliverAt && { deliverAt: data.deliverAt }),
          ...(data.timezone && { timezoneAtCreation: data.timezone }),
        },
      })
    } catch (error) {
      await logger.error('Delivery update database error', error, {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.UPDATE_FAILED,
          message: 'Failed to update delivery. Please try again.',
          details: error,
        },
      }
    }

    await createAuditEvent({
      userId: user.id,
      type: "delivery.updated",
      data: { deliveryId },
    })

    await logger.info('Delivery updated successfully', {
      userId: user.id,
      deliveryId,
    })

    revalidatePath(`/deliveries/${deliveryId}`)
    revalidatePath("/deliveries")

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    await logger.error('Unexpected error in updateDelivery', error)

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
 * Cancel a scheduled delivery
 * Returns error instead of throwing for predictable error handling
 */
export async function cancelDelivery(
  input: unknown
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = cancelDeliverySchema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Delivery cancellation validation failed', {
        userId: user.id,
        errors: validated.error.flatten().fieldErrors,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Invalid cancellation request.',
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const { deliveryId } = validated.data

    // Verify ownership and status
    const existing = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        userId: user.id,
        status: { in: ["scheduled", "failed"] },
      },
    })

    if (!existing) {
      await logger.warn('Delivery not found or cannot be canceled', {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Delivery not found or cannot be canceled (it may have already been sent).',
        },
      }
    }

    // Cancel delivery
    try {
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: "canceled" },
      })
    } catch (error) {
      await logger.error('Delivery cancellation database error', error, {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.UPDATE_FAILED,
          message: 'Failed to cancel delivery. Please try again.',
          details: error,
        },
      }
    }

    // Cancel Inngest workflow
    try {
      await triggerInngestEvent("delivery.canceled", { deliveryId })
    } catch (error) {
      // Log but don't fail the cancellation if Inngest send fails
      await logger.warn('Failed to send Inngest cancel event', {
        deliveryId,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    await createAuditEvent({
      userId: user.id,
      type: "delivery.canceled",
      data: { deliveryId },
    })

    await logger.info('Delivery canceled successfully', {
      userId: user.id,
      deliveryId,
    })

    revalidatePath(`/deliveries/${deliveryId}`)
    revalidatePath("/deliveries")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    await logger.error('Unexpected error in cancelDelivery', error)

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
 * Retry a failed delivery
 * Returns error instead of throwing for predictable error handling
 */
export async function retryDelivery(
  deliveryId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Verify ownership and status
    const existing = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        userId: user.id,
        status: "failed",
      },
    })

    if (!existing) {
      await logger.warn('Delivery not found or cannot be retried', {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Delivery not found or cannot be retried. Only failed deliveries can be retried.',
        },
      }
    }

    // Reset delivery to scheduled status
    try {
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: "scheduled",
          lastError: null,
          attemptCount: existing.attemptCount + 1,
        },
      })
    } catch (error) {
      await logger.error('Delivery retry database error', error, {
        userId: user.id,
        deliveryId,
      })

      return {
        success: false,
        error: {
          code: ErrorCodes.UPDATE_FAILED,
          message: 'Failed to retry delivery. Please try again.',
          details: error,
        },
      }
    }

    // Re-trigger Inngest workflow
    try {
      await triggerInngestEvent("delivery.scheduled", { deliveryId })
      await logger.info('Inngest retry event sent successfully', {
        deliveryId,
        event: 'delivery.scheduled',
        attemptCount: existing.attemptCount + 1,
      })
    } catch (inngestError) {
      await logger.error('Failed to send Inngest retry event', inngestError, {
        deliveryId,
        event: 'delivery.scheduled',
      })
      // Don't fail the entire operation - backstop reconciler will catch this
    }

    await createAuditEvent({
      userId: user.id,
      type: "delivery.retried",
      data: {
        deliveryId,
        attemptCount: existing.attemptCount + 1,
      },
    })

    await logger.info('Delivery retried successfully', {
      userId: user.id,
      deliveryId,
      attemptCount: existing.attemptCount + 1,
    })

    revalidatePath(`/deliveries/${deliveryId}`)
    revalidatePath("/deliveries")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    await logger.error('Unexpected error in retryDelivery', error)

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
 * Get all deliveries for current user
 * Throws on error since this is a data fetch, not a mutation
 */
export async function getDeliveries() {
  const user = await requireUser()

  const deliveries = await prisma.delivery.findMany({
    where: { userId: user.id },
    include: {
      letter: {
        select: {
          id: true,
          title: true,
        },
      },
      emailDelivery: true,
      mailDelivery: true,
    },
    orderBy: {
      deliverAt: "asc",
    },
  })

  return deliveries
}
