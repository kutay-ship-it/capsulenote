import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"
import { generateLetterCreatedEmail, generateLetterCreatedEmailText } from "../templates/letter-created-email"
import type { Locale } from "../lib/i18n/load-messages"
import { loadMessages } from "../lib/i18n/load-messages"
import { getEmailSender } from "../lib/email-config"
import { createLogger } from "../lib/logger"

// Create logger with service context
const logger = createLogger({ service: "send-letter-created-email" })

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
  // Validate notification sender is configured
  getEmailSender('notification')

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL not configured")
  }
}

/**
 * Send letter creation confirmation email
 *
 * Triggered immediately after a letter is created to provide instant confirmation
 * and quick access link to the user.
 */
export const sendLetterCreatedEmail = inngest.createFunction(
  {
    id: "send-letter-created-email",
    name: "Send Letter Created Confirmation Email",
    retries: 3, // Fewer retries than delivery emails (less critical)
    onFailure: async ({ error, event }) => {
      // Extract from original event - Inngest failure event structure
      const originalEvent = event.data?.event
      const letterId = originalEvent?.data?.letterId
      const userId = originalEvent?.data?.userId

      if (!letterId || !userId) {
        logger.error("Letter confirmation failure handler: missing context", {
          error: error.message,
          eventData: JSON.stringify(event.data),
        })
        return
      }

      logger.error("Letter confirmation email failed after all retries", {
        letterId,
        userId,
        error: error.message,
        stack: error.stack,
      })

      // Audit trail for failed notifications
      try {
        await prisma.auditEvent.create({
          data: {
            userId,
            type: "notification.letter_created.failed",
            data: {
              letterId,
              error: error.message,
            },
          },
        })
      } catch (auditError) {
        logger.error("Failed to create audit event for notification failure", {
          letterId,
          userId,
          auditError: auditError instanceof Error ? auditError.message : String(auditError),
        })
      }
    },
  },
  { event: "notification.letter.created" },
  async ({ event, step }) => {
    const { letterId, userId, letterTitle } = event.data

    logger.info("Starting letter confirmation email", {
      letterId,
      userId,
      letterTitle,
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

    // Fetch user details
    const user = await step.run("fetch-user", async () => {
      try {
        const result = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: {
              select: {
                displayName: true,
                locale: true,
              },
            },
          },
        })

        if (!result) {
          logger.error("User not found", { userId, letterId })
          throw new NonRetriableError("User not found")
        }

        if (!result.email) {
          logger.error("User email not found", { userId, letterId })
          throw new NonRetriableError("User email not found")
        }

        logger.info("User fetched successfully", {
          userId,
          email: result.email,
        })

        return result
      } catch (error) {
        if (error instanceof NonRetriableError) {
          throw error
        }

        logger.error("Database error fetching user", {
          userId,
          letterId,
          error: error instanceof Error ? error.message : String(error),
        })

        throw error
      }
    })

    // Verify letter still exists (could have been deleted immediately)
    const letterExists = await step.run("verify-letter", async () => {
      const letter = await prisma.letter.findFirst({
        where: {
          id: letterId,
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      })

      if (!letter) {
        logger.warn("Letter was deleted before confirmation email could be sent", {
          letterId,
          userId,
        })
        throw new NonRetriableError("Letter no longer exists")
      }

      return true
    })

    // Check if email is suppressed (bounced/complained)
    const suppression = await step.run("check-suppression", async () => {
      const { checkEmailSuppression } = await import(
        "../../../apps/web/server/lib/email-suppression"
      )
      return checkEmailSuppression(user.email!)
    })

    if (suppression.isSuppressed) {
      logger.info("Skipping letter-created email - address suppressed", {
        letterId,
        userId,
        email: user.email,
        reason: suppression.reason,
      })
      return { skipped: true, reason: `suppressed:${suppression.reason}` }
    }

    // Generate email URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
    const letterUrl = `${baseUrl}/letters/${letterId}?utm_source=email&utm_medium=notification&utm_campaign=letter_created`
    const dashboardUrl = `${baseUrl}/dashboard?utm_source=email&utm_medium=notification&utm_campaign=letter_created`

    // Generate email HTML and text
    const userLocale: Locale =
      (user.profile?.locale as Locale | undefined) || "en"

    const messages = await loadMessages(userLocale)

    const emailHtml = await generateLetterCreatedEmail({
      letterTitle,
      letterId,
      userFirstName: user.profile?.displayName ?? undefined,
      letterUrl,
      dashboardUrl,
      locale: userLocale,
    })

    const emailText = await generateLetterCreatedEmailText({
      letterTitle,
      letterId,
      userFirstName: user.profile?.displayName ?? undefined,
      letterUrl,
      dashboardUrl,
      locale: userLocale,
    })

    // Send email with idempotency key (one email per letter creation)
    const sendResult = await step.run("send-email", async () => {
      const idempotencyKey = `letter-created-${letterId}`
      const sender = getEmailSender('notification')

      logger.info("Sending confirmation email", {
        letterId,
        userId,
        to: user.email,
        from: sender.from,
        senderEmail: sender.email,
        senderDisplayName: sender.displayName,
        idempotencyKey,
      })

      try {
        const provider = await getEmailProvider()

        logger.info(`Using email provider: ${provider.getName()}`, {
          letterId,
          userId,
          provider: provider.getName(),
        })

        const result = await provider.send({
          from: sender.from,
          to: user.email!,
          subject: messages.emails.letterCreated.subject.replace("{title}", letterTitle),
          html: emailHtml,
          text: emailText,
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
          unsubscribeUrl: `${baseUrl}/settings/notifications`,
        })

        // Check if send was successful
        if (!result.success) {
          logger.error("Email provider returned error", {
            letterId,
            userId,
            provider: provider.getName(),
            error: result.error,
          })

          // Don't retry on provider errors (confirmation emails are nice-to-have)
          throw new NonRetriableError(result.error || "Unknown provider error")
        }

        if (!result.id) {
          logger.error("Email provider did not return message ID", {
            letterId,
            userId,
            provider: provider.getName(),
            result,
          })

          throw new NonRetriableError("No message ID returned from email provider")
        }

        logger.info("Confirmation email sent successfully", {
          letterId,
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
          letterId,
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

    logger.info("Letter confirmation email completed successfully", {
      letterId,
      userId,
      messageId: sendResult.id,
    })

    return { success: true, messageId: sendResult.id }
  }
)
