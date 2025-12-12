import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"
import { generateDeliveryScheduledEmail, generateDeliveryScheduledEmailText } from "../templates/delivery-scheduled-email"
import type { Locale } from "../lib/i18n/load-messages"
import { loadMessages } from "../lib/i18n/load-messages"
import { getEmailSender } from "../lib/email-config"
import { createLogger } from "../lib/logger"

// Create logger with service context
const logger = createLogger({ service: "send-delivery-scheduled-email" })

/**
 * Get email provider abstraction
 */
async function getEmailProvider() {
  const { getEmailProvider } = await import("../../../apps/web/server/providers/email")
  return getEmailProvider()
}

/**
 * Validate environment configuration
 */
function validateConfig(): void {
  getEmailSender('notification')

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL not configured")
  }
}

/**
 * Format delivery date with timezone
 */
function formatDeliveryDate(date: Date, locale: Locale): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)

  const timezoneParts = new Intl.DateTimeFormat(locale, {
    timeZoneName: "short",
  }).formatToParts(date)
  const timezoneName = timezoneParts.find(part => part.type === "timeZoneName")?.value || ""

  return `${formatted} ${timezoneName}`
}

/**
 * Send delivery scheduled confirmation email
 *
 * Triggered immediately after a delivery is scheduled to confirm receipt
 * and provide quick access to manage the delivery.
 */
export const sendDeliveryScheduledEmail = inngest.createFunction(
  {
    id: "send-delivery-scheduled-email",
    name: "Send Delivery Scheduled Confirmation Email",
    retries: 3,
    onFailure: async ({ error, event }) => {
      // Extract from original event - Inngest failure event structure
      const originalEvent = event.data?.event
      const deliveryId = originalEvent?.data?.deliveryId
      const userId = originalEvent?.data?.userId

      if (!deliveryId || !userId) {
        logger.error("Delivery scheduled failure handler: missing context", {
          error: error.message,
          eventData: JSON.stringify(event.data),
        })
        return
      }

      logger.error("Delivery confirmation email failed after all retries", {
        deliveryId,
        userId,
        error: error.message,
        stack: error.stack,
      })

      // Audit trail for failed notifications
      try {
        await prisma.auditEvent.create({
          data: {
            userId,
            type: "notification.delivery_scheduled.failed",
            data: {
              deliveryId,
              error: error.message,
            },
          },
        })
      } catch (auditError) {
        logger.error("Failed to create audit event for notification failure", {
          deliveryId,
          userId,
          auditError: auditError instanceof Error ? auditError.message : String(auditError),
        })
      }
    },
  },
  { event: "notification.delivery.scheduled" },
  async ({ event, step }) => {
    const { deliveryId, userId, letterTitle } = event.data

    logger.info("Starting delivery confirmation email", {
      deliveryId,
      userId,
      letterTitle,
    })

    // Validate configuration
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

    // Fetch delivery details with user and letter info
    const delivery = await step.run("fetch-delivery", async () => {
      try {
        const result = await prisma.delivery.findUnique({
          where: { id: deliveryId },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    displayName: true,
                    locale: true,
                  },
                },
              },
            },
            letter: {
              select: {
                title: true,
              },
            },
            emailDelivery: {
              select: {
                toEmail: true,
              },
            },
            mailDelivery: true,
          },
        })

        if (!result) {
          logger.error("Delivery not found", { deliveryId, userId })
          throw new NonRetriableError("Delivery not found")
        }

        if (!result.user.email) {
          logger.error("User email not found", { deliveryId, userId })
          throw new NonRetriableError("User email not found")
        }

        logger.info("Delivery fetched successfully", {
          deliveryId,
          userId,
          channel: result.channel,
        })

        return result
      } catch (error) {
        if (error instanceof NonRetriableError) {
          throw error
        }

        logger.error("Database error fetching delivery", {
          deliveryId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        })

        throw error
      }
    })

    // Check if email is suppressed (bounced/complained)
    const suppression = await step.run("check-suppression", async () => {
      const { checkEmailSuppression } = await import(
        "../../../apps/web/server/lib/email-suppression"
      )
      return checkEmailSuppression(delivery.user.email!)
    })

    if (suppression.isSuppressed) {
      logger.info("Skipping delivery-scheduled email - address suppressed", {
        deliveryId,
        userId,
        email: delivery.user.email,
        reason: suppression.reason,
      })
      return { skipped: true, reason: `suppressed:${suppression.reason}` }
    }

    // Determine recipient email
    const recipientEmail = delivery.channel === "email"
      ? (delivery.emailDelivery?.toEmail ?? delivery.user.email!)
      : delivery.user.email!

    // Generate email URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
    const deliveryUrl = `${baseUrl}/deliveries?utm_source=email&utm_medium=notification&utm_campaign=delivery_scheduled`
    const dashboardUrl = `${baseUrl}/dashboard?utm_source=email&utm_medium=notification&utm_campaign=delivery_scheduled`

    const userLocale: Locale =
      (delivery.user.profile?.locale as Locale | undefined) || "en"

    const deliveryDate = formatDeliveryDate(new Date(delivery.deliverAt), userLocale)

    // Generate email HTML and text
    const emailHtml = await generateDeliveryScheduledEmail({
      letterTitle: delivery.letter.title,
      deliveryId: delivery.id,
      deliveryDate,
      deliveryMethod: delivery.channel,
      recipientEmail,
      userFirstName: delivery.user.profile?.displayName ?? undefined,
      deliveryUrl,
      dashboardUrl,
      locale: userLocale,
    })

    const emailText = await generateDeliveryScheduledEmailText({
      letterTitle: delivery.letter.title,
      deliveryId: delivery.id,
      deliveryDate,
      deliveryMethod: delivery.channel,
      recipientEmail,
      userFirstName: delivery.user.profile?.displayName ?? undefined,
      deliveryUrl,
      dashboardUrl,
      locale: userLocale,
    })

    // Send email with idempotency
    const sendResult = await step.run("send-email", async () => {
      const idempotencyKey = `delivery-scheduled-${deliveryId}`
      const sender = getEmailSender('notification')

      // Load messages for subject line
      const messages = await loadMessages(userLocale)

      logger.info("Sending delivery confirmation email", {
        deliveryId,
        userId,
        to: delivery.user.email,
        from: sender.from,
        idempotencyKey,
      })

      try {
        const provider = await getEmailProvider()

        logger.info(`Using email provider: ${provider.getName()}`, {
          deliveryId,
          userId,
          provider: provider.getName(),
        })

        const result = await provider.send({
          from: sender.from,
          to: delivery.user.email!,
          subject: messages.emails.deliveryScheduled.subject.replace("{title}", delivery.letter.title),
          html: emailHtml,
          text: emailText,
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
          unsubscribeUrl: `${baseUrl}/settings/notifications`,
        })

        if (!result.success) {
          logger.error("Email provider returned error", {
            deliveryId,
            userId,
            provider: provider.getName(),
            error: result.error,
          })

          throw new NonRetriableError(result.error || "Unknown provider error")
        }

        if (!result.id) {
          logger.error("Email provider did not return message ID", {
            deliveryId,
            userId,
            provider: provider.getName(),
            result,
          })

          throw new NonRetriableError("No message ID returned from email provider")
        }

        logger.info("Delivery confirmation email sent successfully", {
          deliveryId,
          userId,
          provider: provider.getName(),
          messageId: result.id,
        })

        return result
      } catch (error) {
        if (error instanceof NonRetriableError) {
          throw error
        }

        const errorMessage = error instanceof Error ? error.message : String(error)

        logger.error("Email send failed", {
          deliveryId,
          userId,
          error: errorMessage,
        })

        // For confirmation emails, only retry on network/transient errors
        // Provider rejections (400-level) should not retry
        const isTransient = errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('ETIMEDOUT') ||
          errorMessage.includes('network') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('503') ||
          errorMessage.includes('502')

        if (isTransient) {
          // Let Inngest retry on transient errors
          throw new Error(errorMessage)
        }

        // Non-retryable for other errors (provider rejections, validation, etc.)
        throw new NonRetriableError(errorMessage)
      }
    })

    logger.info("Delivery confirmation email completed successfully", {
      deliveryId,
      userId,
      messageId: sendResult.id,
    })

    return { success: true, messageId: sendResult.id }
  }
)
