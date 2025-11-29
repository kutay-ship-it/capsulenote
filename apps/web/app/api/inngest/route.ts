import { serve } from "inngest/next"
import {
  inngest,
  deliverEmail,
  sendLetterCreatedEmail,
  sendDeliveryScheduledEmail,
  lockLetterBeforeSend,
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
    lockLetterBeforeSend,

    // Billing & payments
    processStripeWebhook,
    sendBillingNotification,
    handleDunning,

    // User lifecycle
    cleanupDeletedUser,
  ],
})
