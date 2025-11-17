import { serve } from "inngest/next"
import {
  inngest,
  deliverEmail,
  sendLetterCreatedEmail,
  processStripeWebhook,
  sendBillingNotification,
  handleDunning,
} from "@dearme/inngest"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Letter delivery
    deliverEmail,
    sendLetterCreatedEmail,

    // Billing & payments
    processStripeWebhook,
    sendBillingNotification,
    handleDunning,
  ],
})
