import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "dearme",
  name: "DearMe",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
