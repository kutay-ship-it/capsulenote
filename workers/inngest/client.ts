import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "capsulenote",
  name: "Capsule Note",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
