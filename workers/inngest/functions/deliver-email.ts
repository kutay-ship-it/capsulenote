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

/**
 * Structured logger for workers
 * In production, this should use the shared logger from apps/web/server/lib/logger.ts
 */
const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }))
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString() }))
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }))
  },
}

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
    onFailure: async ({ error, event, step }) => {
      const { deliveryId } = event.data.event.data

      logger.error("Delivery function failed after all retries", {
        deliveryId,
        error: error.message,
        stack: error.stack,
      })

      // Fetch delivery to mark as failed
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

    // Fetch delivery details
    let delivery = await step.run("fetch-delivery", async () => {
      try {
        const result = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          include: {
            letter: true,
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
    const refreshed = await step.run("refresh-delivery-after-wait", async () => {
      const current = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          letter: true,
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
    if (refreshed.deliverAt.getTime() !== delivery.deliverAt.getTime()) {
      logger.info("Delivery was rescheduled while waiting, adjusting", {
        deliveryId,
        previousDeliverAt: delivery.deliverAt,
        newDeliverAt: refreshed.deliverAt,
      })

      if (refreshed.deliverAt > new Date()) {
        await step.sleepUntil("wait-for-updated-time", refreshed.deliverAt)
      }
    }

    // Use the freshest copy for the remainder of the flow
    delivery = refreshed

    // Update status to processing
    await step.run("update-status-processing", async () => {
      try {
        const updated = await prisma.delivery.update({
          where: { id: deliveryId },
          data: { status: "processing" },
        })

        logger.info("Delivery status updated to processing", { deliveryId })

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
    const decryptedContent = await step.run("decrypt-letter", async () => {
      try {
        const content = await decryptLetter(
          Buffer.from(delivery.letter.bodyCiphertext),
          Buffer.from(delivery.letter.bodyNonce),
          delivery.letter.keyVersion
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
      const idempotencyKey = `delivery-${deliveryId}-attempt-${delivery.attemptCount}`
      const sender = getEmailSender('delivery')

      logger.info("Sending email", {
        deliveryId,
        to: delivery.emailDelivery!.toEmail,
        from: sender.from,
        senderEmail: sender.email,
        senderDisplayName: sender.displayName,
        idempotencyKey,
        attempt: delivery.attemptCount,
      })

      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${delivery.letter.shareLinkToken}`
      const emailHtml = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">A Letter from Your Past Self</h1>
          <p style="color: #666;">You scheduled this letter to be delivered on ${new Date(delivery.deliverAt).toLocaleDateString()}.</p>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h2 style="margin-top: 0;">${delivery.letter.title}</h2>
            ${decryptedContent.bodyHtml}
          </div>
          <p style="color: #999; font-size: 14px;">
            This letter was sent via Capsule Note.<br/>
            <a href="${viewUrl}">Open this letter on Capsule Note</a>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your dashboard</a>
          </p>
        </div>
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

        const fallbackProvider = primaryName === 'Resend'
          ? new PostmarkEmailProvider()
          : new ResendEmailProvider()

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

    logger.info("Email delivery completed successfully", {
      deliveryId,
      messageId: sendResult.id,
    })

    return { success: true, messageId: sendResult.id }
  }
)
