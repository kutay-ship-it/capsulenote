import { inngest } from "../client"
import { prisma } from "@dearme/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const deliverEmail = inngest.createFunction(
  {
    id: "deliver-email",
    name: "Deliver Email",
    retries: 5,
  },
  { event: "delivery.scheduled" },
  async ({ event, step }) => {
    const { deliveryId } = event.data

    // Fetch delivery details
    const delivery = await step.run("fetch-delivery", async () => {
      return prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          letter: true,
          emailDelivery: true,
          user: {
            include: { profile: true },
          },
        },
      })
    })

    if (!delivery || delivery.channel !== "email" || !delivery.emailDelivery) {
      throw new Error("Invalid email delivery")
    }

    // Check if delivery time has arrived
    await step.sleepUntil("wait-for-delivery-time", delivery.deliverAt)

    // Update status to processing
    await step.run("update-status-processing", async () => {
      return prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: "processing" },
      })
    })

    // Send email via Resend
    const result = await step.run("send-email", async () => {
      return resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@mail.dearme.app",
        to: delivery.emailDelivery!.toEmail,
        subject: delivery.emailDelivery!.subject,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">A Letter from Your Past Self</h1>
            <p style="color: #666;">You scheduled this letter to be delivered on ${delivery.deliverAt.toLocaleDateString()}.</p>
            <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
              <h2 style="margin-top: 0;">${delivery.letter.title}</h2>
              ${delivery.letter.bodyHtml}
            </div>
            <p style="color: #999; font-size: 14px;">
              This letter was sent via DearMe.
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your dashboard</a>
            </p>
          </div>
        `,
      })
    })

    // Update delivery status and store message ID
    await step.run("update-status-sent", async () => {
      return prisma.$transaction([
        prisma.delivery.update({
          where: { id: deliveryId },
          data: {
            status: "sent",
            attemptCount: { increment: 1 },
          },
        }),
        prisma.emailDelivery.update({
          where: { deliveryId },
          data: {
            resendMessageId: result.data?.id,
          },
        }),
        prisma.auditEvent.create({
          data: {
            userId: delivery.userId,
            type: "delivery.sent",
            data: {
              deliveryId,
              letterId: delivery.letterId,
              channel: "email",
            },
          },
        }),
      ])
    })

    return { success: true, messageId: result.data?.id }
  }
)
