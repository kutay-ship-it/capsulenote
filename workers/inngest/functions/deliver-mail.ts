import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"
import {
  WorkerError,
  InvalidDeliveryError,
  DecryptionError,
  ConfigurationError,
  classifyProviderError,
  classifyDatabaseError,
} from "../lib/errors"
import { createLogger } from "../lib/logger"
import { assertRealBuffer } from "../lib/buffer-utils"
import { adjustForDST } from "../../../apps/web/server/lib/dst-safety"

// Create logger with service context
const logger = createLogger({ service: "deliver-mail" })

/**
 * Decrypt letter content
 */
async function decryptLetter(
  bodyCiphertext: Buffer,
  bodyNonce: Buffer,
  keyVersion: number
): Promise<{ bodyRich: Record<string, unknown>; bodyHtml: string }> {
  try {
    const { decrypt } = await import("../../../apps/web/server/lib/encryption")
    const plaintext = await decrypt(bodyCiphertext, bodyNonce, keyVersion)
    return JSON.parse(plaintext)
  } catch (error) {
    logger.error("Decryption failed", {
      error: error instanceof Error ? error.message : String(error),
      keyVersion,
    })
    throw new DecryptionError("Failed to decrypt letter content", {
      keyVersion,
      originalError: error,
    })
  }
}

/**
 * Get Lob mail provider (V3 branded template)
 */
async function getMailProvider() {
  const { sendTemplatedLetter, isLobConfigured } = await import(
    "../../../apps/web/server/providers/lob"
  )
  return { sendTemplatedLetter, isLobConfigured }
}

/**
 * Validate environment configuration
 */
function validateConfig(): void {
  if (!process.env.LOB_API_KEY) {
    throw new ConfigurationError("LOB_API_KEY not configured")
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new ConfigurationError("NEXT_PUBLIC_APP_URL not configured")
  }
}

/**
 * Mark delivery as permanently failed
 */
async function markDeliveryFailed(
  deliveryId: string,
  userId: string,
  letterId: string,
  error: WorkerError
): Promise<void> {
  await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "failed",
        attemptCount: { increment: 1 },
        lastError: error.message,
      },
    }),
    prisma.deliveryAttempt.create({
      data: {
        letterId,
        channel: "mail",
        status: "failed",
        errorCode: error.code,
        errorMessage: error.message,
      },
    }),
    prisma.auditEvent.create({
      data: {
        userId,
        type: "delivery.failed",
        data: {
          deliveryId,
          letterId,
          channel: "mail",
          errorCode: error.code,
          errorMessage: error.message,
        },
      },
    }),
  ])

  logger.error("Delivery marked as failed", {
    deliveryId,
    userId,
    letterId,
    errorCode: error.code,
    errorMessage: error.message,
  })
}

export const deliverMail = inngest.createFunction(
  {
    id: "deliver-mail",
    name: "Deliver Physical Mail",
    retries: 3,
    onFailure: async ({ error, event }) => {
      const originalEvent = event.data?.event
      const deliveryId = originalEvent?.data?.deliveryId

      if (!deliveryId) {
        logger.error("Mail delivery failure handler: missing deliveryId", {
          error: error.message,
          eventData: JSON.stringify(event.data),
        })
        return
      }

      logger.error("Mail delivery function failed after all retries", {
        deliveryId,
        error: error.message,
        stack: error.stack,
      })

      try {
        const delivery = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          select: { userId: true, letterId: true },
        })

        if (delivery) {
          await markDeliveryFailed(
            deliveryId,
            delivery.userId,
            delivery.letterId,
            error instanceof WorkerError ? error : classifyProviderError(error)
          )
        }
      } catch (failureHandlingError) {
        logger.error("Failed to handle mail delivery failure", {
          deliveryId,
          error:
            failureHandlingError instanceof Error
              ? failureHandlingError.message
              : String(failureHandlingError),
        })
      }
    },
  },
  { event: "mail.delivery.scheduled" },
  async ({ event, step, attempt }) => {
    const { deliveryId } = event.data

    logger.info("Starting mail delivery", {
      deliveryId,
      attempt,
    })

    // Validate configuration early
    try {
      validateConfig()
    } catch (error) {
      logger.error("Configuration validation failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new NonRetriableError(
        error instanceof Error ? error.message : "Configuration error"
      )
    }

    // Fetch delivery details
    let delivery = await step.run("fetch-delivery", async () => {
      try {
        const result = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          include: {
            letter: {
              select: {
                id: true,
                title: true,
                shareLinkToken: true,
                keyVersion: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
                visibility: true,
                tags: true,
                bodyFormat: true,
              },
            },
            mailDelivery: {
              include: {
                shippingAddress: true,
              },
            },
            user: {
              include: { profile: true },
            },
          },
        })

        if (!result) {
          logger.error("Delivery not found", { deliveryId })
          throw new InvalidDeliveryError("Delivery not found", { deliveryId })
        }

        if (result.channel !== "mail") {
          logger.error("Invalid delivery channel", {
            deliveryId,
            channel: result.channel,
          })
          throw new InvalidDeliveryError(
            `Invalid channel: ${result.channel}, expected mail`,
            { deliveryId, channel: result.channel }
          )
        }

        if (!result.mailDelivery) {
          logger.error("Mail delivery details missing", { deliveryId })
          throw new InvalidDeliveryError("Mail delivery details missing", {
            deliveryId,
          })
        }

        if (!result.mailDelivery.shippingAddress) {
          logger.error("Shipping address missing", { deliveryId })
          throw new InvalidDeliveryError("Shipping address missing", {
            deliveryId,
          })
        }

        logger.info("Delivery fetched successfully", {
          deliveryId,
          userId: result.userId,
          letterId: result.letterId,
          deliverAt: result.deliverAt,
          deliveryMode: result.mailDelivery.deliveryMode,
          targetDate: result.mailDelivery.targetDate,
          sendDate: result.mailDelivery.sendDate,
        })

        return result
      } catch (error) {
        if (error instanceof WorkerError) {
          throw error
        }

        const classified = classifyDatabaseError(error)
        logger.error("Database error fetching delivery", {
          deliveryId,
          errorCode: classified.code,
          errorMessage: classified.message,
        })

        if (!classified.retryable) {
          throw new NonRetriableError(classified.message)
        }

        throw classified
      }
    })

    // Validate delivery hasn't been canceled
    if (delivery.status === "canceled") {
      logger.warn("Delivery was canceled", { deliveryId })
      throw new NonRetriableError("Delivery was canceled")
    }

    // Wait until delivery time (sendDate for arrive-by, or deliverAt for send-on)
    // Apply DST safety adjustment to avoid scheduling during DST transitions
    const rawScheduleDate =
      delivery.mailDelivery!.deliveryMode === "arrive_by" &&
      delivery.mailDelivery!.sendDate
        ? new Date(delivery.mailDelivery!.sendDate)
        : new Date(delivery.deliverAt)

    // Adjust for DST transitions using the user's timezone
    const timezone = delivery.timezoneAtCreation || "UTC"
    const scheduleDate = adjustForDST(rawScheduleDate, timezone)

    if (scheduleDate.getTime() !== rawScheduleDate.getTime()) {
      logger.info("DST adjustment applied to mail delivery schedule", {
        deliveryId,
        originalDate: rawScheduleDate.toISOString(),
        adjustedDate: scheduleDate.toISOString(),
        timezone,
      })
    }

    await step.sleepUntil("wait-for-send-time", scheduleDate)

    // Refresh delivery after wait
    const refreshed = await step.run("refresh-delivery-after-wait", async () => {
      const current = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          letter: {
            select: {
              id: true,
              title: true,
              shareLinkToken: true,
              keyVersion: true,
              userId: true,
              createdAt: true,
              updatedAt: true,
              visibility: true,
              tags: true,
              bodyFormat: true,
            },
          },
          mailDelivery: {
            include: {
              shippingAddress: true,
            },
          },
          user: {
            include: { profile: true },
          },
        },
      })

      if (!current) {
        throw new NonRetriableError("Delivery no longer exists")
      }

      return current
    })

    if (refreshed.status === "canceled") {
      logger.warn("Delivery canceled while waiting", { deliveryId })
      throw new NonRetriableError("Delivery was canceled")
    }

    // Check if delivery was rescheduled while waiting
    const currentSendDate =
      refreshed.mailDelivery?.sendDate || refreshed.deliverAt
    const originalSendDate =
      delivery.mailDelivery?.sendDate || delivery.deliverAt

    if (
      new Date(currentSendDate).getTime() !==
      new Date(originalSendDate).getTime()
    ) {
      logger.info("Mail delivery was rescheduled while waiting", {
        deliveryId,
        originalDate: originalSendDate,
        newDate: currentSendDate,
      })

      // If new date is in future, sleep again until the new date
      if (new Date(currentSendDate) > new Date()) {
        await step.sleepUntil(
          "wait-for-rescheduled-date",
          new Date(currentSendDate)
        )

        // Refresh again after second wait
        const rescheduledRefresh = await step.run(
          "refresh-delivery-after-reschedule",
          async () => {
            const current = await prisma.delivery.findUnique({
              where: { id: deliveryId },
              include: {
                letter: {
                  select: {
                    id: true,
                    title: true,
                    shareLinkToken: true,
                    keyVersion: true,
                    userId: true,
                    createdAt: true,
                    updatedAt: true,
                    visibility: true,
                    tags: true,
                    bodyFormat: true,
                  },
                },
                mailDelivery: {
                  include: {
                    shippingAddress: true,
                  },
                },
                user: {
                  include: { profile: true },
                },
              },
            })

            if (!current) {
              throw new NonRetriableError("Delivery no longer exists after reschedule")
            }

            return current
          }
        )

        if (rescheduledRefresh.status === "canceled") {
          logger.warn("Delivery canceled after reschedule", { deliveryId })
          throw new NonRetriableError("Delivery was canceled")
        }

        delivery = rescheduledRefresh
      }
    } else {
      delivery = refreshed
    }

    // Update status to processing and store Inngest event ID for tracking/reconciliation
    await step.run("update-status-processing", async () => {
      try {
        await prisma.delivery.update({
          where: { id: deliveryId },
          data: {
            status: "processing",
            // Store Inngest event ID for job tracking and backstop reconciler detection
            inngestRunId: event.id,
          },
        })

        logger.info("Delivery status updated to processing", {
          deliveryId,
          inngestRunId: event.id,
        })
      } catch (error) {
        const classified = classifyDatabaseError(error)
        logger.error("Failed to update delivery status", {
          deliveryId,
          errorCode: classified.code,
          errorMessage: classified.message,
        })

        if (!classified.retryable) {
          throw new NonRetriableError(classified.message)
        }

        throw classified
      }
    })

    // Check for immediate mode (already sent to Lob with send_date)
    // In immediate mode, Lob already has the letter - we just need to update status
    const mailDeliveryData = delivery.mailDelivery!
    const isImmediateMode = mailDeliveryData.lobScheduleMode === "immediate" && mailDeliveryData.lobJobId

    if (isImmediateMode) {
      logger.info("Immediate mode: Letter already sent to Lob, updating status only", {
        deliveryId,
        lobJobId: mailDeliveryData.lobJobId,
        lobSendDate: mailDeliveryData.lobSendDate,
      })

      // Update delivery status to sent
      await step.run("update-status-sent-immediate", async () => {
        try {
          await prisma.$transaction([
            prisma.delivery.update({
              where: { id: deliveryId },
              data: {
                status: "sent",
                attemptCount: { increment: 1 },
              },
            }),
            prisma.mailDelivery.update({
              where: { deliveryId },
              data: {
                trackingStatus: "in_production",
              },
            }),
            prisma.deliveryAttempt.create({
              data: {
                letterId: delivery.letterId,
                channel: "mail",
                status: "sent",
                errorCode: null,
                errorMessage: null,
              },
            }),
            prisma.auditEvent.create({
              data: {
                userId: delivery.userId,
                type: "delivery.sent",
                data: {
                  deliveryId,
                  letterId: delivery.letterId,
                  channel: "mail",
                  lobJobId: mailDeliveryData.lobJobId,
                  mode: "immediate",
                },
              },
            }),
          ])

          logger.info("Immediate mode delivery marked as sent", {
            deliveryId,
            lobJobId: mailDeliveryData.lobJobId,
          })
        } catch (error) {
          const classified = classifyDatabaseError(error)
          logger.error("Failed to update delivery status for immediate mode", {
            deliveryId,
            errorCode: classified.code,
            errorMessage: classified.message,
          })

          if (!classified.retryable) {
            throw new NonRetriableError(classified.message)
          }

          throw classified
        }
      })

      return {
        success: true,
        lobJobId: mailDeliveryData.lobJobId,
        mode: "immediate",
      }
    }

    // Deferred mode: Decrypt sealed content (snapshot from schedule time)
    const decryptedContent = await step.run("decrypt-sealed-content", async () => {
      try {
        // Use sealed content if available (preferred for deferred mode)
        if (mailDeliveryData.sealedCiphertext && mailDeliveryData.sealedNonce) {
          assertRealBuffer(mailDeliveryData.sealedCiphertext, "sealedCiphertext")
          assertRealBuffer(mailDeliveryData.sealedNonce, "sealedNonce")

          logger.info("Using sealed content for deferred mode delivery", {
            deliveryId,
            letterId: delivery.letterId,
            keyVersion: mailDeliveryData.sealedKeyVersion,
            sealedAt: mailDeliveryData.sealedAt,
          })

          const { decrypt } = await import("../../../apps/web/server/lib/encryption")
          const plaintext = await decrypt(
            mailDeliveryData.sealedCiphertext,
            mailDeliveryData.sealedNonce,
            mailDeliveryData.sealedKeyVersion ?? 1
          )
          const content = JSON.parse(plaintext) as { bodyHtml: string; bodyRich: Record<string, unknown> }

          logger.info("Sealed content decrypted successfully", {
            deliveryId,
            letterId: delivery.letterId,
          })

          return content
        }

        // Fallback: fetch fresh content from letter (legacy deliveries without sealed content)
        logger.warn("No sealed content found, falling back to fresh letter content", {
          deliveryId,
          letterId: delivery.letterId,
        })

        const letterWithEncryptedData = await prisma.letter.findUnique({
          where: { id: delivery.letterId },
          select: {
            bodyCiphertext: true,
            bodyNonce: true,
            keyVersion: true,
          },
        })

        if (!letterWithEncryptedData) {
          throw new DecryptionError("Letter not found for decryption", {
            letterId: delivery.letterId,
          })
        }

        assertRealBuffer(letterWithEncryptedData.bodyCiphertext, "bodyCiphertext")
        assertRealBuffer(letterWithEncryptedData.bodyNonce, "bodyNonce")

        const content = await decryptLetter(
          letterWithEncryptedData.bodyCiphertext,
          letterWithEncryptedData.bodyNonce,
          letterWithEncryptedData.keyVersion
        )

        logger.info("Letter decrypted successfully (fallback)", {
          deliveryId,
          letterId: delivery.letterId,
        })

        return content
      } catch (error) {
        if (error instanceof DecryptionError) {
          throw new NonRetriableError(error.message)
        }
        logger.error("Decryption failed", {
          error: error instanceof Error ? error.message : String(error),
          deliveryId,
        })
        throw new DecryptionError("Failed to decrypt content", {
          deliveryId,
          originalError: error,
        })
      }
    })

    // Send physical mail via Lob (V3 branded 2-page template) - Deferred mode
    const sendResult = await step.run("send-mail-deferred", async () => {
      const mailDelivery = delivery.mailDelivery!
      const address = mailDelivery.shippingAddress!
      const printOptions =
        (mailDelivery.printOptions as { color?: boolean; doubleSided?: boolean }) ||
        {}
      // Use sealed title if available, otherwise fall back to letter title
      const letterTitle = mailDelivery.sealedTitle ?? delivery.letter.title

      logger.info("Deferred mode: Sending physical mail with V3 template", {
        deliveryId,
        recipientName: address.name,
        city: address.city,
        state: address.state,
        country: address.country,
        color: printOptions.color,
        doubleSided: printOptions.doubleSided,
        usingSealedTitle: !!mailDelivery.sealedTitle,
      })

      const { sendTemplatedLetter, isLobConfigured } = await getMailProvider()

      if (!isLobConfigured()) {
        throw new NonRetriableError("Lob is not configured")
      }

      try {
        // Generate idempotency key to prevent duplicate sends on retry
        // Format: mail-delivery-{deliveryId}-attempt-{attemptNumber}
        const idempotencyKey = `mail-delivery-${deliveryId}-attempt-${attempt}`

        logger.info("Sending with idempotency key", {
          deliveryId,
          idempotencyKey,
          attempt,
        })

        // Use V3 branded 2-page template (cover page + letter content)
        const result = await sendTemplatedLetter({
          to: {
            name: address.name,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          letterContent: decryptedContent.bodyHtml,
          writtenDate: new Date(delivery.letter.createdAt),
          deliveryDate: new Date(),
          letterTitle,
          recipientName: address.name,
          color: printOptions.color ?? false,
          doubleSided: printOptions.doubleSided ?? false,
          description: `Capsule Note: ${letterTitle}`,
          mailType: "usps_first_class",
          idempotencyKey,
        })

        logger.info("Physical mail sent successfully with V3 template", {
          deliveryId,
          lobJobId: result.id,
          expectedDeliveryDate: result.expectedDeliveryDate,
          carrier: result.carrier,
        })

        return result
      } catch (error) {
        logger.error("Lob API error", {
          deliveryId,
          error: error instanceof Error ? error.message : String(error),
        })

        const classified = classifyProviderError(error)
        if (!classified.retryable) {
          throw new NonRetriableError(classified.message)
        }

        throw classified
      }
    })

    // Update delivery status and store Lob job info
    await step.run("update-status-sent", async () => {
      try {
        await prisma.$transaction([
          prisma.delivery.update({
            where: { id: deliveryId },
            data: {
              status: "sent",
              attemptCount: { increment: 1 },
            },
          }),
          prisma.mailDelivery.update({
            where: { deliveryId },
            data: {
              lobJobId: sendResult.id,
              previewUrl: sendResult.url,
              trackingStatus: "in_production",
            },
          }),
          prisma.deliveryAttempt.create({
            data: {
              letterId: delivery.letterId,
              channel: "mail",
              status: "sent",
              errorCode: null,
              errorMessage: null,
            },
          }),
          prisma.auditEvent.create({
            data: {
              userId: delivery.userId,
              type: "delivery.sent",
              data: {
                deliveryId,
                letterId: delivery.letterId,
                channel: "mail",
                lobJobId: sendResult.id,
                expectedDeliveryDate: sendResult.expectedDeliveryDate,
                carrier: sendResult.carrier,
              },
            },
          }),
        ])

        logger.info("Delivery marked as sent", {
          deliveryId,
          lobJobId: sendResult.id,
          expectedDeliveryDate: sendResult.expectedDeliveryDate,
        })
      } catch (error) {
        const classified = classifyDatabaseError(error)
        logger.error("Failed to update delivery after send", {
          deliveryId,
          errorCode: classified.code,
          errorMessage: classified.message,
        })

        if (!classified.retryable) {
          logger.error(
            "CRITICAL: Mail sent but database update failed (non-retryable)",
            {
              deliveryId,
              lobJobId: sendResult.id,
            }
          )
          throw new NonRetriableError("Mail sent but database update failed")
        }

        throw classified
      }
    })

    // Send push notification (non-blocking, best-effort)
    await step.run("send-push-notification", async () => {
      try {
        const profile = await prisma.profile.findUnique({
          where: { userId: delivery.userId },
          select: { pushEnabled: true },
        })

        if (!profile?.pushEnabled) {
          logger.info("Push notifications disabled for user, skipping", {
            deliveryId,
            userId: delivery.userId,
          })
          return { skipped: true, reason: "disabled" }
        }

        const { sendDeliveryCompletedNotification } = await import(
          "../../../apps/web/server/providers/push"
        )

        const result = await sendDeliveryCompletedNotification(delivery.userId, {
          deliveryId,
          letterId: delivery.letterId,
          letterTitle: delivery.letter.title,
          channel: "mail",
        })

        logger.info("Push notification sent", {
          deliveryId,
          userId: delivery.userId,
          sent: result.sent,
          failed: result.failed,
        })

        return result
      } catch (error) {
        logger.warn("Failed to send push notification", {
          deliveryId,
          error: error instanceof Error ? error.message : String(error),
        })
        return { skipped: true, reason: "error" }
      }
    })

    logger.info("Mail delivery completed successfully", {
      deliveryId,
      lobJobId: sendResult.id,
      expectedDeliveryDate: sendResult.expectedDeliveryDate,
    })

    return {
      success: true,
      lobJobId: sendResult.id,
      expectedDeliveryDate: sendResult.expectedDeliveryDate,
    }
  }
)
