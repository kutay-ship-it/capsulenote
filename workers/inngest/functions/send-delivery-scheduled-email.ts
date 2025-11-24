import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"
import { generateDeliveryScheduledEmail, generateDeliveryScheduledEmailText } from "../templates/delivery-scheduled-email"
import { getEmailSender } from "../lib/email-config"

/**
 * Structured logger for workers
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
function formatDeliveryDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)

  // Get timezone abbreviation
  const timezoneParts = new Intl.DateTimeFormat("en-US", {
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
      const { deliveryId, userId } = event.data.event.data

      logger.error("Delivery confirmation email failed after all retries", {
        deliveryId,
        userId,
        error: error.message,
        stack: error.stack,
      })
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

    // Determine recipient email
    const recipientEmail = delivery.channel === "email"
      ? (delivery.emailDelivery?.toEmail ?? delivery.user.email!)
      : delivery.user.email!

    // Generate email URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
    const deliveryUrl = `${baseUrl}/deliveries?utm_source=email&utm_medium=notification&utm_campaign=delivery_scheduled`
    const dashboardUrl = `${baseUrl}/dashboard?utm_source=email&utm_medium=notification&utm_campaign=delivery_scheduled`

    // Format delivery date (convert to Date object for serialization safety)
    const deliveryDate = formatDeliveryDate(new Date(delivery.deliverAt))

    // Generate email HTML and text
    const emailHtml = generateDeliveryScheduledEmail({
      letterTitle: delivery.letter.title,
      deliveryId: delivery.id,
      deliveryDate,
      deliveryMethod: delivery.channel,
      recipientEmail,
      userFirstName: delivery.user.profile?.displayName ?? undefined,
      deliveryUrl,
      dashboardUrl,
    })

    const emailText = generateDeliveryScheduledEmailText({
      letterTitle: delivery.letter.title,
      deliveryId: delivery.id,
      deliveryDate,
      deliveryMethod: delivery.channel,
      recipientEmail,
      userFirstName: delivery.user.profile?.displayName ?? undefined,
      deliveryUrl,
      dashboardUrl,
    })

    // Send email with idempotency
    const sendResult = await step.run("send-email", async () => {
      const idempotencyKey = `delivery-scheduled-${deliveryId}`
      const sender = getEmailSender('notification')

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
          subject: `✓ Delivery Scheduled: ${delivery.letter.title}`,
          html: emailHtml,
          text: emailText,
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
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

        logger.error("Email send failed", {
          deliveryId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        })

        throw new NonRetriableError(
          error instanceof Error ? error.message : "Email send failed"
        )
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
