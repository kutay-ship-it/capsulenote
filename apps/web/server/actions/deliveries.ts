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
import {
  getEntitlements,
  QuotaExceededError,
  invalidateEntitlementsCache,
} from "@/server/lib/entitlements"
import { env } from "@/env.mjs"
import { linkPendingSubscription } from "@/app/[locale]/subscribe/actions"
import {
  calculateJobScheduleDate,
  validateArrivalDate,
  type MailType,
} from "@/server/lib/mail-delivery-calculator"

const LOCK_WINDOW_MS = 72 * 60 * 60 * 1000 // 72 hours
const MIN_DELAY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_DELAY_YEARS = 100

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
    const now = Date.now()
    const minDate = new Date(now + MIN_DELAY_MS)
    const maxDate = new Date()
    maxDate.setUTCFullYear(maxDate.getUTCFullYear() + MAX_DELAY_YEARS)

    if (data.deliverAt < minDate) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Delivery must be at least 5 minutes from now",
        },
      }
    }

    if (data.deliverAt > maxDate) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Delivery cannot be more than 100 years in the future",
        },
      }
    }

    // Check subscription entitlements
    let entitlements = await getEntitlements(user.id)
    const devBypass =
      env.NODE_ENV !== "production" && env.DEV_BYPASS_SUBSCRIPTION === "true"
    let pendingSubscription: { id: string; expiresAt: Date } | null = null
    let pendingLinkError: string | null = null
    let attemptedAutoLink = false

    // Check if user can schedule deliveries
    if (!entitlements.features.canScheduleDeliveries) {
      pendingSubscription = await prisma.pendingSubscription.findFirst({
        where: {
          email: user.email,
          status: "payment_complete",
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, expiresAt: true },
      })

      // Auto-link pending subscription if it exists (anonymous checkout safety net)
      if (pendingSubscription) {
        attemptedAutoLink = true
        try {
          const linkResult = await linkPendingSubscription(user.id)

          if (!linkResult.success) {
            pendingLinkError = linkResult.error ?? "link_failed"
            await logger.warn('Auto-link pending subscription failed during scheduling', {
              userId: user.id,
              pendingSubscriptionId: pendingSubscription.id,
              error: pendingLinkError,
            })
          } else {
            await invalidateEntitlementsCache(user.id)
            entitlements = await getEntitlements(user.id)
            await logger.info('Auto-linked pending subscription during scheduling attempt', {
              userId: user.id,
              pendingSubscriptionId: pendingSubscription.id,
              subscriptionId: linkResult.subscriptionId,
            })
          }
        } catch (linkError) {
          pendingLinkError = "link_failed"
          await logger.error('Auto-link pending subscription threw during scheduling', linkError, {
            userId: user.id,
            pendingSubscriptionId: pendingSubscription.id,
          })
        }
      }

      const gatingReason = pendingLinkError
        ? "link_failed"
        : pendingSubscription
        ? "pending_subscription"
        : entitlements.plan === "none"
        ? "no_subscription"
        : "inactive_status"

      if (devBypass) {
        await logger.warn('Bypassing subscription requirement for scheduling (dev mode)', {
          userId: user.id,
          entitlements,
          pendingSubscriptionId: pendingSubscription?.id,
          attemptedAutoLink,
          linkError: pendingLinkError,
        })
      } else if (!entitlements.features.canScheduleDeliveries) {
        await logger.warn('User attempted to schedule delivery without active subscription', {
          userId: user.id,
          plan: entitlements.plan,
          gatingReason,
          pendingSubscriptionId: pendingSubscription?.id,
          attemptedAutoLink,
          linkError: pendingLinkError,
        })

        const gatingMessage =
          pendingLinkError === "Email not verified"
            ? "Please verify your email to activate your subscription."
            : pendingSubscription
            ? "We received your payment. Please verify your email to activate your subscription."
            : "Scheduling deliveries requires an active subscription"

        return {
          success: false,
          error: {
            code: ErrorCodes.SUBSCRIPTION_REQUIRED,
            message: gatingMessage,
            details: {
              requiredPlan: 'DIGITAL_CAPSULE or PAPER_PIXELS',
              currentPlan: entitlements.plan,
              upgradeUrl: '/pricing',
              reason: gatingReason,
              pendingSubscriptionId: pendingSubscription?.id,
              pendingExpiresAt: pendingSubscription?.expiresAt.toISOString(),
              linkError: pendingLinkError ?? undefined,
            }
          }
        }
      }
    }

    // For physical mail, check credits and handle arrive-by mode
    let mailDeliveryMode: "send_on" | "arrive_by" = "send_on"
    let actualDeliverAt = data.deliverAt
    let mailTransitDays: number | null = null
    let mailTargetDate: Date | null = null
    let mailSendDate: Date | null = null

    if (data.channel === 'mail') {
      if (!entitlements.features.canSchedulePhysicalMail) {
        await logger.warn('User attempted to schedule physical mail without Paper & Pixels', {
          userId: user.id,
          plan: entitlements.plan,
        })

        return {
          success: false,
          error: {
            code: ErrorCodes.SUBSCRIPTION_REQUIRED,
            message: 'Physical mail requires the Paper & Pixels plan'
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

      // Handle arrive-by mode for physical mail
      mailDeliveryMode = data.deliveryMode ?? "send_on"
      const mailType: MailType = data.mailType ?? "usps_first_class"

      if (mailDeliveryMode === "arrive_by") {
        // Validate that the arrival date is achievable
        const validation = validateArrivalDate(data.deliverAt, mailType)

        if (!validation.isAchievable) {
          await logger.warn('Arrive-by date not achievable', {
            userId: user.id,
            targetDate: data.deliverAt,
            earliestPossible: validation.calculation.earliestPossibleArrival,
            mailType,
          })

          return {
            success: false,
            error: {
              code: ErrorCodes.VALIDATION_FAILED,
              message: validation.suggestion || "The requested arrival date is not achievable. Please select a later date.",
              details: {
                earliestPossibleArrival: validation.calculation.earliestPossibleArrival?.toISOString(),
                transitDays: validation.calculation.transitDays,
                bufferDays: validation.calculation.bufferDays,
              }
            }
          }
        }

        // Calculate when to actually send the mail
        const schedule = calculateJobScheduleDate(mailDeliveryMode, data.deliverAt, mailType)
        actualDeliverAt = schedule.scheduleDate
        mailTransitDays = schedule.transitDays
        mailTargetDate = data.deliverAt
        mailSendDate = schedule.scheduleDate

        await logger.info('Calculated arrive-by schedule', {
          userId: user.id,
          targetDate: data.deliverAt,
          sendDate: actualDeliverAt,
          transitDays: mailTransitDays,
          mailType,
        })
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

    // Create delivery, deduct credits, and create channel-specific record atomically
    let delivery
    try {
      delivery = await prisma.$transaction(async (tx) => {
        // 1. Check and deduct credits atomically within transaction
        if (data.channel === "email") {
          const userCredits = await tx.user.findUnique({
            where: { id: user.id },
            select: { emailCredits: true },
          })

          if (!userCredits || userCredits.emailCredits <= 0) {
            throw new QuotaExceededError("email_credits", 0, 0)
          }

          // Deduct credit
          await tx.user.update({
            where: { id: user.id },
            data: { emailCredits: { decrement: 1 } },
          })

          // Record audit trail
          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              creditType: "email",
              transactionType: "deduct_delivery",
              amount: -1,
              balanceBefore: userCredits.emailCredits,
              balanceAfter: userCredits.emailCredits - 1,
              source: null, // Will be updated after delivery creation
              metadata: { letterId: data.letterId, channel: data.channel },
            },
          })
        } else if (data.channel === "mail") {
          const userCredits = await tx.user.findUnique({
            where: { id: user.id },
            select: { physicalCredits: true },
          })

          if (!userCredits || userCredits.physicalCredits <= 0) {
            throw new QuotaExceededError("physical_credits", 0, 0)
          }

          // Deduct credit
          await tx.user.update({
            where: { id: user.id },
            data: { physicalCredits: { decrement: 1 } },
          })

          // Record audit trail
          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              creditType: "physical",
              transactionType: "deduct_delivery",
              amount: -1,
              balanceBefore: userCredits.physicalCredits,
              balanceAfter: userCredits.physicalCredits - 1,
              source: null, // Will be updated after delivery creation
              metadata: { letterId: data.letterId, channel: data.channel },
            },
          })
        }

        const isLocked = actualDeliverAt.getTime() - Date.now() <= LOCK_WINDOW_MS

        // 2. Create delivery (use actualDeliverAt for arrive-by mode)
        const newDelivery = await tx.delivery.create({
          data: {
            userId: user.id,
            letterId: data.letterId,
            channel: data.channel,
            deliverAt: actualDeliverAt,
            timezoneAtCreation: data.timezone,
            status: "scheduled",
          },
        })

        // 3. Update credit transaction with delivery ID as source
        await tx.creditTransaction.updateMany({
          where: {
            userId: user.id,
            source: null,
            metadata: {
              path: ["letterId"],
              equals: data.letterId,
            },
          },
          data: {
            source: newDelivery.id,
          },
        })

        // 4. Create channel-specific delivery record (atomic with delivery)
        if (data.channel === "email") {
          await tx.emailDelivery.create({
            data: {
              deliveryId: newDelivery.id,
              toEmail: data.toEmail ?? user.email,
              subject: `Letter to your future self: ${letter.title}`,
            },
          })
        } else if (data.channel === "mail" && data.shippingAddressId) {
          await tx.mailDelivery.create({
            data: {
              deliveryId: newDelivery.id,
              shippingAddressId: data.shippingAddressId,
              deliveryMode: mailDeliveryMode,
              targetDate: mailTargetDate,
              sendDate: mailSendDate,
              transitDays: mailTransitDays,
              printOptions: data.printOptions ?? { color: false, doubleSided: false },
            },
          })
        }

        // 5. Update letter scheduling metadata
        await tx.letter.update({
          where: { id: data.letterId },
          data: {
            type: data.channel === "email" ? "email" : "physical",
            status: isLocked ? "LOCKED" : "SCHEDULED",
            scheduledFor: actualDeliverAt,
            timezone: data.timezone,
            lockedAt: isLocked ? new Date() : new Date(actualDeliverAt.getTime() - LOCK_WINDOW_MS),
          },
        })

        return newDelivery
      })

      // Invalidate entitlements cache after successful transaction
      await invalidateEntitlementsCache(user.id)
    } catch (error) {
      // Transaction rolled back automatically - no manual refund needed
      if (error instanceof QuotaExceededError) {
        return {
          success: false,
          error: {
            code: ErrorCodes.INSUFFICIENT_CREDITS,
            message: "Not enough credits to schedule this delivery",
          },
        }
      }

      await logger.error('Delivery creation error', error, {
        userId: user.id,
        letterId: data.letterId,
        channel: data.channel,
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

    // Trigger Inngest workflow - CRITICAL: must succeed
    // Use different events for email vs mail delivery
    const inngestEventName = data.channel === "mail"
      ? "mail.delivery.scheduled"
      : "delivery.scheduled"

    let eventId: string | null = null
    try {
      eventId = await triggerInngestEvent(inngestEventName, { deliveryId: delivery.id })

      if (!eventId) {
        throw new Error("Inngest did not return an event ID")
      }

      // Store event ID for audit/debugging
      await prisma.delivery.update({
        where: { id: delivery.id },
        data: { inngestRunId: eventId }
      })

      await logger.info('Inngest event sent successfully', {
        deliveryId: delivery.id,
        eventId,
        event: inngestEventName,
      })
    } catch (inngestError) {
      // CRITICAL: If Inngest fails, rollback delivery and refund credit atomically
      await logger.error('Failed to schedule Inngest job - rolling back delivery', {
        deliveryId: delivery.id,
        error: inngestError,
      })

      // Rollback: delete delivery and refund credit in single transaction
      try {
        await prisma.$transaction(async (tx) => {
          // Get current credit balance for audit
          const currentUser = await tx.user.findUnique({
            where: { id: user.id },
            select: { emailCredits: true, physicalCredits: true },
          })

          if (currentUser) {
            const creditType = data.channel === "email" ? "email" : "physical"
            const currentBalance = data.channel === "email"
              ? currentUser.emailCredits
              : currentUser.physicalCredits

            // Refund credit
            await tx.user.update({
              where: { id: user.id },
              data: data.channel === "email"
                ? { emailCredits: { increment: 1 } }
                : { physicalCredits: { increment: 1 } },
            })

            // Record refund in audit trail
            await tx.creditTransaction.create({
              data: {
                userId: user.id,
                creditType,
                transactionType: "grant_refund",
                amount: 1,
                balanceBefore: currentBalance,
                balanceAfter: currentBalance + 1,
                source: delivery.id,
                metadata: {
                  reason: "inngest_failure_rollback",
                  letterId: data.letterId,
                },
              },
            })
          }

          // Delete the delivery
          await tx.delivery.delete({ where: { id: delivery.id } })
        })

        await invalidateEntitlementsCache(user.id)
      } catch (rollbackError) {
        // Critical: rollback failed - log for manual intervention
        await logger.error('CRITICAL: Failed to rollback delivery after Inngest failure', rollbackError, {
          deliveryId: delivery.id,
          userId: user.id,
          channel: data.channel,
        })
      }

      // Return error to user - delivery was NOT created
      return {
        success: false,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: 'Failed to schedule delivery. Please try again.',
          details: {
            service: 'inngest',
            error: inngestError instanceof Error ? inngestError.message : String(inngestError),
          }
        }
      }
    }

    await createAuditEvent({
      userId: user.id,
      type: "delivery.scheduled",
      data: {
        deliveryId: delivery.id,
        letterId: data.letterId,
        channel: data.channel,
        deliverAt: actualDeliverAt.toISOString(),
        ...(mailDeliveryMode === "arrive_by" && {
          deliveryMode: mailDeliveryMode,
          targetArrivalDate: mailTargetDate?.toISOString(),
          sendDate: mailSendDate?.toISOString(),
          transitDays: mailTransitDays,
        }),
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
      include: {
        letter: {
          select: { id: true },
        },
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
      // Check if delivery time is being changed
      const isRescheduling = data.deliverAt && data.deliverAt.getTime() !== existing.deliverAt.getTime()

      if (isRescheduling) {
        // Update delivery time first (keep existing inngestRunId to avoid race condition)
        // The inngestRunId will be updated atomically after Inngest event succeeds
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: {
            deliverAt: data.deliverAt,
            ...(data.timezone && { timezoneAtCreation: data.timezone }),
          },
        })

        // Re-schedule with new time
        try {
          const eventId = await triggerInngestEvent("delivery.scheduled", { deliveryId })

          if (eventId) {
            await prisma.delivery.update({
              where: { id: deliveryId },
              data: { inngestRunId: eventId }
            })
          }

          await logger.info('Delivery rescheduled successfully', {
            deliveryId,
            eventId,
            newDeliverAt: data.deliverAt,
          })
        } catch (rescheduleError) {
          await logger.error('Failed to reschedule delivery', rescheduleError, {
            deliveryId,
          })

          return {
            success: false,
            error: {
              code: ErrorCodes.UPDATE_FAILED,
              message: 'Failed to reschedule delivery. Please try again.',
              details: rescheduleError,
            },
          }
        }
      } else {
        // Just update metadata (no rescheduling needed)
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: {
            ...(data.deliverAt && { deliverAt: data.deliverAt }),
            ...(data.timezone && { timezoneAtCreation: data.timezone }),
          },
        })
      }
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

    const isLocked = existing.deliverAt.getTime() - Date.now() <= LOCK_WINDOW_MS
    const shouldRefundEmail = existing.channel === "email" && !isLocked
    const shouldRefundPhysical = existing.channel === "mail" && !isLocked

    // Cancel delivery
    try {
      await prisma.$transaction(async (tx) => {
        await tx.delivery.update({
          where: { id: deliveryId },
          data: { status: "canceled" },
        })

        // Update associated letter status
        await tx.letter.update({
          where: { id: existing.letterId },
          data: { status: "CANCELLED" },
        })

        if (shouldRefundEmail) {
          await tx.user.update({
            where: { id: user.id },
            data: { emailCredits: { increment: 1 } },
          })
        }

        if (shouldRefundPhysical) {
          await tx.user.update({
            where: { id: user.id },
            data: { physicalCredits: { increment: 1 } },
          })
        }
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
      const eventId = await triggerInngestEvent("delivery.scheduled", { deliveryId })

      // Store event ID for correlation between DB records and Inngest jobs
      if (eventId) {
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: { inngestRunId: eventId },
        })
      }

      await logger.info('Inngest retry event sent successfully', {
        deliveryId,
        eventId,
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
