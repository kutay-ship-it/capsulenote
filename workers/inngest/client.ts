import { Inngest } from "inngest"

// In development (signkey-test-* or INNGEST_DEV=1), the Inngest Dev Server
// handles events locally without needing an event key.
// In production, INNGEST_EVENT_KEY authenticates with Inngest Cloud.
const isDev =
  process.env.INNGEST_SIGNING_KEY?.startsWith("signkey-test-") ||
  process.env.INNGEST_DEV === "1" ||
  process.env.NODE_ENV === "development"

export const inngest = new Inngest({
  id: "capsulenote",
  name: "Capsule Note",
  // Only use eventKey in production - dev server doesn't need it
  eventKey: isDev ? undefined : process.env.INNGEST_EVENT_KEY,
})
