import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"

const LOCK_WINDOW_MS = 72 * 60 * 60 * 1000

export const lockLetterBeforeSend = inngest.createFunction(
  { id: "lock-letter-before-send", name: "Lock Letter 72h Before Delivery" },
  { event: "delivery.scheduled" },
  async ({ event, step }) => {
    const { deliveryId } = event.data

    // Fetch delivery and letter (wrapped in step.run for determinism)
    const delivery = await step.run("fetch-delivery", async () => {
      return prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: { letter: true },
      })
    })

    if (!delivery || !delivery.letter) {
      throw new NonRetriableError("Delivery or letter not found")
    }

    const now = Date.now()
    // Note: Inngest step.run serializes dates to strings, so we need to convert
    const deliverAtDate = new Date(delivery.deliverAt)
    const lockAt = deliverAtDate.getTime() - LOCK_WINDOW_MS

    // If already within window, lock immediately
    if (lockAt <= now) {
      await step.run("lock-letter-immediate", async () => {
        // Atomic update: only lock if not already locked (prevents TOCTOU race)
        return prisma.letter.updateMany({
          where: {
            id: delivery.letterId,
            status: { not: "LOCKED" },
          },
          data: {
            status: "LOCKED",
            lockedAt: new Date(),
          },
        })
      })
      return
    }

    // Sleep until lock time then lock
    await step.sleepUntil("wait-until-lock", new Date(lockAt))

    await step.run("lock-letter-scheduled", async () => {
      // Atomic update: only lock if not already locked (prevents TOCTOU race)
      return prisma.letter.updateMany({
        where: {
          id: delivery.letterId,
          status: { not: "LOCKED" },
        },
        data: {
          status: "LOCKED",
          lockedAt: new Date(),
        },
      })
    })
  }
)
