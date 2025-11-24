import { serve } from "inngest/next"
import {
  inngest,
  deliverEmail,
  sendLetterCreatedEmail,
  sendDeliveryScheduledEmail,
  processStripeWebhook,
  sendBillingNotification,
  handleDunning,
  cleanupDeletedUser,
} from "@dearme/inngest"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Letter delivery
    deliverEmail,
    sendLetterCreatedEmail,
    sendDeliveryScheduledEmail,

    // Billing & payments
    processStripeWebhook,
    sendBillingNotification,
    handleDunning,
  ],
})
