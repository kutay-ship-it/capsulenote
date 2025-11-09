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

  // Get headers
  const headerPayload = headers()
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

        // Create user and profile
        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email,
            profile: {
              create: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

        // Soft delete or mark for deletion
        await prisma.user.update({
          where: { clerkUserId: id },
          data: {
            // Mark letters as deleted
            letters: {
              updateMany: {
                where: {},
                data: { deletedAt: new Date() },
              },
            },
          },
        })

        console.log(`User marked for deletion: ${id}`)
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
