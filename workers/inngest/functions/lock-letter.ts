import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { NonRetriableError } from "inngest"

const LOCK_WINDOW_MS = 72 * 60 * 60 * 1000

export const lockLetterBeforeSend = inngest.createFunction(
  { id: "lock-letter-before-send", name: "Lock Letter 72h Before Delivery" },
  { event: "delivery.scheduled" },
  async ({ event, step }) => {
    const { deliveryId } = event.data

    // Fetch delivery and letter
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { letter: true },
    })

    if (!delivery || !delivery.letter) {
      throw new NonRetriableError("Delivery or letter not found")
    }

    const now = Date.now()
    const lockAt = delivery.deliverAt.getTime() - LOCK_WINDOW_MS

    // If already within window, lock immediately
    if (lockAt <= now) {
      await prisma.letter.update({
        where: { id: delivery.letterId },
        data: {
          status: "LOCKED",
          lockedAt: new Date(),
        },
      })
      return
    }

    // Sleep until lock time then lock
    await step.sleepUntil("wait-until-lock", new Date(lockAt))

    await prisma.letter.update({
      where: { id: delivery.letterId },
      data: {
        status: "LOCKED",
        lockedAt: new Date(),
      },
    })
  }
)
