import { serve } from "inngest/next"
import { inngest, deliverEmail, sendLetterCreatedEmail } from "@dearme/inngest"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    deliverEmail,
    sendLetterCreatedEmail,
  ],
})
