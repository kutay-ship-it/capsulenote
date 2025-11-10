import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET")
  }

  // Get headers (Next.js 15 requires await)
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          return new Response("No email found", { status: 400 })
        }

        // Create user and profile with default timezone (user can update in settings)
        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email,
            profile: {
              create: {
                // Default to UTC - user can update in settings
                timezone: "UTC",
              },
            },
          },
        })

        console.log(`User created: ${id}`)
        break
      }

      case "user.updated": {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          return new Response("No email found", { status: 400 })
        }

        await prisma.user.update({
          where: { clerkUserId: id },
          data: { email },
        })

        console.log(`User updated: ${id}`)
        break
      }

      case "user.deleted": {
        const { id } = evt.data

        if (!id) {
          return new Response("No user ID found", { status: 400 })
        }

        // Soft delete user and cascade to related data
        const deletedAt = new Date()

        await prisma.$transaction(async (tx) => {
          // First, find the user
          const user = await tx.user.findUnique({
            where: { clerkUserId: id },
          })

          if (!user) {
            console.warn(`User not found for deletion: ${id}`)
            return
          }

          // Mark all letters as deleted
          await tx.letter.updateMany({
            where: { userId: user.id },
            data: { deletedAt },
          })

          // Cancel all scheduled deliveries
          await tx.delivery.updateMany({
            where: {
              userId: user.id,
              status: "scheduled",
            },
            data: { status: "canceled" },
          })

          // Anonymize and mark user for data retention/audit purposes
          await tx.user.update({
            where: { clerkUserId: id },
            data: {
              email: `deleted_${id}@deleted.local`,
            },
          })
        })

        console.log(`User deleted and data cleaned up: ${id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error(`Error processing webhook:`, error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
