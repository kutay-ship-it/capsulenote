import { headers } from "next/headers"
import { prisma } from "@/server/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const headerPayload = await headers()
  const signature = headerPayload.get("svix-signature")

  // TODO: Verify webhook signature with Resend

  try {
    const { type, data } = body

    switch (type) {
      case "email.opened": {
        // Update email delivery with open count
        const emailDelivery = await prisma.emailDelivery.findFirst({
          where: { resendMessageId: data.email_id },
        })

        if (emailDelivery) {
          await prisma.emailDelivery.update({
            where: { deliveryId: emailDelivery.deliveryId },
            data: {
              opens: { increment: 1 },
              lastOpenedAt: new Date(),
            },
          })
        }
        break
      }

      case "email.clicked": {
        // Update email delivery with click count
        const emailDelivery = await prisma.emailDelivery.findFirst({
          where: { resendMessageId: data.email_id },
        })

        if (emailDelivery) {
          await prisma.emailDelivery.update({
            where: { deliveryId: emailDelivery.deliveryId },
            data: {
              clicks: { increment: 1 },
            },
          })
        }
        break
      }

      case "email.bounced":
      case "email.complained": {
        // Mark delivery as failed
        const emailDelivery = await prisma.emailDelivery.findFirst({
          where: { resendMessageId: data.email_id },
        })

        if (emailDelivery) {
          await prisma.delivery.update({
            where: { id: emailDelivery.deliveryId },
            data: {
              status: "failed",
              lastError: `Email ${type}: ${data.reason || "Unknown"}`,
            },
          })

          await prisma.emailDelivery.update({
            where: { deliveryId: emailDelivery.deliveryId },
            data: {
              bounces: { increment: 1 },
            },
          })
        }
        break
      }
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Error processing Resend webhook:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
