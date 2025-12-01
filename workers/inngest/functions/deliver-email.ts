import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"
import { getEmailSender } from "../lib/email-config"
import {
  WorkerError,
  InvalidDeliveryError,
  DecryptionError,
  ConfigurationError,
  classifyProviderError,
  classifyDatabaseError,
  shouldRetry,
  calculateBackoff,
} from "../lib/errors"
import { createLogger, logBufferSerializationDetected } from "../lib/logger"
import { assertRealBuffer } from "../lib/buffer-utils"

// Create logger with service context
const logger = createLogger({ service: "deliver-email" })

/**
 * Decrypt letter content
 * Note: In production monorepo, extract to shared package
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
    throw new DecryptionError(
      "Failed to decrypt letter content",
      {
        keyVersion,
        originalError: error,
      }
    )
  }
}

/**
 * Get email provider
 * Note: In production monorepo, this could be extracted to shared package
 */
async function getEmailProvider() {
  const { getEmailProvider } = await import("../../../apps/web/server/providers/email")
  return getEmailProvider()
}

/**
 * Validate environment configuration
 */
function validateConfig(): void {
  // Validate delivery sender is configured
  getEmailSender('delivery')

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
      },
    }),
    prisma.deliveryAttempt.create({
      data: {
        letterId,
        channel: "email",
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
          channel: "email",
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

export const deliverEmail = inngest.createFunction(
  {
    id: "deliver-email",
    name: "Deliver Email",
    retries: 5,
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    onFailure: async ({ error, event }) => {
      // Extract deliveryId from original event - Inngest failure event structure:
      // event.data.event contains the original triggering event
      const originalEvent = event.data?.event
      const deliveryId = originalEvent?.data?.deliveryId

      if (!deliveryId) {
        logger.error("Delivery failure handler: missing deliveryId", {
          error: error.message,
          eventData: JSON.stringify(event.data),
        })
        return
      }

      logger.error("Delivery function failed after all retries", {
        deliveryId,
        error: error.message,
        stack: error.stack,
      })

      // Fetch delivery to mark as failed + create DLQ entry
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
            error instanceof WorkerError
              ? error
              : classifyProviderError(error)
          )
        }
      } catch (failureHandlingError) {
        logger.error("Failed to handle delivery failure", {
          deliveryId,
          error: failureHandlingError instanceof Error
            ? failureHandlingError.message
            : String(failureHandlingError),
        })
      }
    },
  },
  { event: "delivery.scheduled" },
  async ({ event, step, attempt }) => {
    const { deliveryId } = event.data

    logger.info("Starting email delivery", {
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
      // Non-retryable configuration error
      throw new NonRetriableError(
        error instanceof Error ? error.message : "Configuration error"
      )
    }

    // Fetch delivery details (excluding encrypted fields to avoid step boundary serialization issues)
    // IMPORTANT: Encrypted fields (bodyCiphertext, bodyNonce) are fetched fresh in the decrypt step
    // to prevent Buffer serialization issues when data crosses Inngest step boundaries.
    // See: https://github.com/inngest/inngest/issues/XXX (Buffer serialization bug)
    let delivery = await step.run("fetch-delivery", async () => {
      try {
        const result = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          include: {
            letter: {
              // Explicitly select non-encrypted fields only
              // bodyCiphertext and bodyNonce are fetched fresh in decrypt-letter step
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
            emailDelivery: true,
            user: {
              include: { profile: true },
            },
          },
        })

        if (!result) {
          logger.error("Delivery not found", { deliveryId })
          throw new InvalidDeliveryError("Delivery not found", { deliveryId })
        }

        if (result.channel !== "email") {
          logger.error("Invalid delivery channel", {
            deliveryId,
            channel: result.channel,
          })
          throw new InvalidDeliveryError(
            `Invalid channel: ${result.channel}, expected email`,
            { deliveryId, channel: result.channel }
          )
        }

        if (!result.emailDelivery) {
          logger.error("Email delivery details missing", { deliveryId })
          throw new InvalidDeliveryError("Email delivery details missing", {
            deliveryId,
          })
        }

        logger.info("Delivery fetched successfully", {
          deliveryId,
          userId: result.userId,
          letterId: result.letterId,
          deliverAt: result.deliverAt,
        })

        return result
      } catch (error) {
        // Classify database errors
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

    // Check if delivery time has arrived
    await step.sleepUntil("wait-for-delivery-time", delivery.deliverAt)

    // Refresh delivery after any potential reschedule/cancel while waiting
    // Again, exclude encrypted fields to avoid step boundary serialization issues
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
          emailDelivery: true,
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

    // If canceled while waiting, abort
    if (refreshed.status === "canceled") {
      logger.warn("Delivery canceled while waiting", { deliveryId })
      throw new NonRetriableError("Delivery was canceled")
    }

    // If rescheduled to a future date, wait until the new deliverAt
    // Convert to Date objects for comparison (Prisma may return string from serialization)
    const refreshedDeliverAt = new Date(refreshed.deliverAt)
    const originalDeliverAt = new Date(delivery.deliverAt)

    if (refreshedDeliverAt.getTime() !== originalDeliverAt.getTime()) {
      logger.info("Delivery was rescheduled while waiting, adjusting", {
        deliveryId,
        previousDeliverAt: delivery.deliverAt,
        newDeliverAt: refreshed.deliverAt,
      })

      if (refreshedDeliverAt > new Date()) {
        await step.sleepUntil("wait-for-updated-time", refreshedDeliverAt)
      }
    }

    // Use the freshest copy for the remainder of the flow
    delivery = refreshed

    // Update status to processing and store Inngest event ID for tracking/reconciliation
    await step.run("update-status-processing", async () => {
      try {
        const updated = await prisma.delivery.update({
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

        return updated
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

    // Decrypt letter content
    // CRITICAL: Fetch encrypted data FRESH inside this step to avoid Buffer serialization issues.
    // When data crosses Inngest step boundaries, Buffer objects get JSON-serialized to
    // { type: "Buffer", data: [...] } format. Fetching fresh ensures we have real Buffer instances.
    const decryptedContent = await step.run("decrypt-letter", async () => {
      try {
        // Fetch encrypted fields fresh from database (not from previous step's return value)
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

        // Validate that Prisma returned real Buffers (not serialized objects)
        // This assertion will fail fast if something unexpected happens
        assertRealBuffer(letterWithEncryptedData.bodyCiphertext, "bodyCiphertext")
        assertRealBuffer(letterWithEncryptedData.bodyNonce, "bodyNonce")

        logger.info("Fetched fresh encrypted data for decryption", {
          deliveryId,
          letterId: delivery.letterId,
          keyVersion: letterWithEncryptedData.keyVersion,
          ciphertextLength: letterWithEncryptedData.bodyCiphertext.length,
          nonceLength: letterWithEncryptedData.bodyNonce.length,
        })

        const content = await decryptLetter(
          letterWithEncryptedData.bodyCiphertext,
          letterWithEncryptedData.bodyNonce,
          letterWithEncryptedData.keyVersion
        )

        logger.info("Letter decrypted successfully", {
          deliveryId,
          letterId: delivery.letterId,
        })

        return content
      } catch (error) {
        if (error instanceof DecryptionError) {
          // Decryption errors are non-retryable
          throw new NonRetriableError(error.message)
        }
        throw error
      }
    })

    // Send email via email provider with runtime fallback support
    const sendResult = await step.run("send-email", async () => {
      // CRITICAL: Use event.id + attempt for idempotency to prevent race conditions
      // Previously used delivery.attemptCount which is read before increment, causing duplicates
      // event.id is unique per Inngest trigger, attempt is unique per retry within that event
      const idempotencyKey = `delivery-${deliveryId}-event-${event.id}-attempt-${attempt}`
      const sender = getEmailSender('delivery')

      logger.info("Sending email", {
        deliveryId,
        to: delivery.emailDelivery!.toEmail,
        from: sender.from,
        senderEmail: sender.email,
        senderDisplayName: sender.displayName,
        idempotencyKey,
        inngestEventId: event.id,
        inngestAttempt: attempt,
      })

      const unlockUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unlock/${delivery.letter.id}`
      const lettersUrl = `${process.env.NEXT_PUBLIC_APP_URL}/letters`
      const journeyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/journey`
      const writtenDate = new Date(delivery.letter.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; background-color: #F4EFE2; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F4EFE2;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">

          <!-- Pre-header Badge -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <span style="display: inline-block; background-color: #38C1B0; color: #ffffff; padding: 6px 16px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; border: 2px solid #383838; border-radius: 2px;">
                &#9993; Letter Delivered
              </span>
            </td>
          </tr>

          <!-- Main Letter Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border: 2px solid #383838; border-radius: 2px; box-shadow: -6px 6px 0 rgba(56,56,56,0.08);">
                <!-- Top Stamp Area -->
                <tr>
                  <td style="padding: 24px 32px; border-bottom: 1px dashed rgba(56,56,56,0.2);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">From Your Past Self</div>
                          <div style="font-size: 11px; color: #383838; margin-top: 4px;">Written on ${writtenDate}</div>
                        </td>
                        <td style="text-align: right;">
                          <div style="width: 48px; height: 48px; background-color: #FFDE00; border: 2px solid #383838; border-radius: 2px; text-align: center; line-height: 44px; font-size: 20px; display: inline-block;">&#128140;</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td style="padding: 32px 32px 0; text-align: center;">
                    <h1 style="font-size: 24px; font-weight: normal; color: #383838; margin: 0; line-height: 1.3;">"${delivery.letter.title}"</h1>
                  </td>
                </tr>

                <!-- Decorative Divider -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block; width: 60px; height: 2px; background-color: #383838;"></div>
                  </td>
                </tr>

                <!-- Letter Content -->
                <tr>
                  <td style="padding: 0 40px 40px; font-size: 15px; line-height: 1.9; color: #383838;">
                    ${decryptedContent.bodyHtml}
                  </td>
                </tr>

                <!-- CTA Section -->
                <tr>
                  <td style="background-color: #F4EFE2; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(56,56,56,0.1);">
                    <a href="${unlockUrl}" style="display: inline-block; background-color: #6FC2FF; color: #383838; padding: 14px 32px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; border: 2px solid #383838; border-radius: 2px;">
                      View Full Letter &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <div style="font-size: 18px; color: #383838; margin-bottom: 8px;">Capsule Note</div>
              <div style="font-size: 11px; color: #666666;">
                Letters to your future self &middot;
                <a href="${lettersUrl}" style="color: #383838;">My Letters</a> &middot;
                <a href="${journeyUrl}" style="color: #383838;">Journey</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `

      // Try primary provider
      let primaryProvider = await getEmailProvider()
      const primaryName = primaryProvider.getName()

      try {
        logger.info("Sending email with primary provider", {
          deliveryId,
          provider: primaryName,
          idempotencyKey,
        })

        const result = await primaryProvider.send({
          from: sender.from,
          to: delivery.emailDelivery!.toEmail,
          subject: delivery.emailDelivery!.subject,
          html: emailHtml,
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
        })

        // Check if send was successful
        if (!result.success) {
          throw new Error(result.error || "Provider returned error")
        }

        if (!result.id) {
          throw new Error("No message ID returned from email provider")
        }

        logger.info("Email sent successfully with primary provider", {
          deliveryId,
          provider: primaryName,
          messageId: result.id,
        })

        return result
      } catch (primaryError) {
        logger.warn(`Primary provider ${primaryName} failed, attempting fallback`, {
          deliveryId,
          error: primaryError instanceof Error ? primaryError.message : String(primaryError),
        })

        // Try fallback provider (opposite of primary)
        const { ResendEmailProvider } = await import("../../../apps/web/server/providers/email/resend-provider")
        const { PostmarkEmailProvider } = await import("../../../apps/web/server/providers/email/postmark-provider")

        // Check if fallback provider is configured before attempting to use it
        let fallbackProvider
        try {
          fallbackProvider = primaryName === 'Resend'
            ? new PostmarkEmailProvider()
            : new ResendEmailProvider()
        } catch (configError) {
          // Fallback provider not configured, throw original primary error
          logger.error('Fallback provider not configured', {
            deliveryId,
            primaryProvider: primaryName,
            fallbackProvider: primaryName === 'Resend' ? 'Postmark' : 'Resend',
            configError: configError instanceof Error ? configError.message : String(configError),
          })

          // Classify and throw the original primary error since fallback isn't available
          if (primaryError instanceof WorkerError) {
            throw primaryError
          }

          const classified = classifyProviderError(primaryError)
          if (!classified.retryable) {
            throw new NonRetriableError(classified.message)
          }

          throw classified
        }

        try {
          logger.info("Sending email with fallback provider", {
            deliveryId,
            provider: fallbackProvider.getName(),
          })

          const result = await fallbackProvider.send({
            from: sender.from,
            to: delivery.emailDelivery!.toEmail,
            subject: delivery.emailDelivery!.subject,
            html: emailHtml,
            headers: {
              "X-Idempotency-Key": idempotencyKey,
            },
          })

          if (!result.success) {
            throw new Error(result.error || "Fallback provider also failed")
          }

          if (!result.id) {
            throw new Error("No message ID returned from fallback provider")
          }

          logger.info("Email sent successfully with fallback provider", {
            deliveryId,
            provider: fallbackProvider.getName(),
            messageId: result.id,
          })

          return result
        } catch (fallbackError) {
          logger.error('Both email providers failed', {
            deliveryId,
            primaryProvider: primaryName,
            fallbackProvider: fallbackProvider.getName(),
            primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
            fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          })

          // Classify the error for retry logic
          if (fallbackError instanceof WorkerError) {
            throw fallbackError
          }

          if (fallbackError instanceof NonRetriableError) {
            throw fallbackError
          }

          const classified = classifyProviderError(fallbackError)
          if (!classified.retryable) {
            throw new NonRetriableError(classified.message)
          }

          throw classified
        }
      }
    })

    // Update delivery status and store message ID
    await step.run("update-status-sent", async () => {
      try {
        const result = await prisma.$transaction([
          prisma.delivery.update({
            where: { id: deliveryId },
            data: {
              status: "sent",
              attemptCount: { increment: 1 },
            },
          }),
          prisma.emailDelivery.update({
            where: { deliveryId },
            data: {
              resendMessageId: sendResult.id,
            },
          }),
          prisma.deliveryAttempt.create({
            data: {
              letterId: delivery.letterId,
              channel: "email",
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
                channel: "email",
                messageId: sendResult.id,
              },
            },
          }),
        ])

        logger.info("Delivery marked as sent", {
          deliveryId,
          messageId: sendResult.id,
        })

        return result
      } catch (error) {
        const classified = classifyDatabaseError(error)
        logger.error("Failed to update delivery after send", {
          deliveryId,
          errorCode: classified.code,
          errorMessage: classified.message,
        })

        // Even if we can't update the database, the email was sent
        // Log this as critical but don't retry
        if (!classified.retryable) {
          logger.error(
            "CRITICAL: Email sent but database update failed (non-retryable)",
            {
              deliveryId,
              messageId: sendResult.id,
            }
          )
          throw new NonRetriableError(
            "Email sent but database update failed"
          )
        }

        throw classified
      }
    })

    // Send push notification (non-blocking, best-effort)
    await step.run("send-push-notification", async () => {
      try {
        // Check if user has push notifications enabled
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

        // Import push provider dynamically
        const { sendDeliveryCompletedNotification } = await import(
          "../../../apps/web/server/providers/push"
        )

        const result = await sendDeliveryCompletedNotification(
          delivery.userId,
          {
            deliveryId,
            letterId: delivery.letterId,
            letterTitle: delivery.letter.title,
            channel: "email",
            recipientEmail: delivery.emailDelivery!.toEmail,
          }
        )

        logger.info("Push notification sent", {
          deliveryId,
          userId: delivery.userId,
          sent: result.sent,
          failed: result.failed,
        })

        return result
      } catch (error) {
        // Push notification failures should not fail the delivery
        logger.warn("Failed to send push notification", {
          deliveryId,
          error: error instanceof Error ? error.message : String(error),
        })
        return { skipped: true, reason: "error" }
      }
    })

    logger.info("Email delivery completed successfully", {
      deliveryId,
      messageId: sendResult.id,
    })

    return { success: true, messageId: sendResult.id }
  }
)
