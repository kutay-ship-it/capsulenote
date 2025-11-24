import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"
import { linkPendingSubscription } from "@/app/[locale]/subscribe/actions"
import { getClerkClient } from "@/server/lib/clerk"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"

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

  // Validate event age (prevent replay attacks)
  const svix_timestamp_ms = parseInt(svix_timestamp, 10) * 1000
  const eventAge = Date.now() - svix_timestamp_ms
  const MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes

  if (eventAge > MAX_AGE_MS) {
    console.warn("Clerk webhook too old, rejecting", {
      eventType: evt.type,
      age: Math.floor(eventAge / 1000) + "s",
      maxAge: "300s",
    })
    return new Response("Event too old", { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address
        const lockedEmail =
          (evt.data.unsafe_metadata as { lockedEmail?: string } | undefined)?.lockedEmail ||
          (evt.data.public_metadata as { lockedEmail?: string } | undefined)?.lockedEmail

        if (!email) {
          return new Response("No email found", { status: 400 })
        }

        // Enforce locked email if provided
        if (lockedEmail && lockedEmail.toLowerCase() !== email.toLowerCase()) {
          console.error(`[Clerk Webhook] Locked email mismatch. Expected ${lockedEmail}, got ${email}`)
          try {
            const clerk = getClerkClient()
            await clerk.users.deleteUser(id)
          } catch (deleteErr) {
            console.error(`[Clerk Webhook] Failed to delete user after mismatch`, deleteErr)
          }
          return new Response("Email mismatch for locked signup", { status: 400 })
        }

        // Create user and profile with default timezone (user can update in settings)
        // Handle race condition: concurrent webhook deliveries or retries
        let user
        let attempts = 0
        const maxAttempts = 3

        while (attempts < maxAttempts) {
          try {
            user = await prisma.user.create({
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

            console.log(`[Clerk Webhook] ✅ User created: ${id}`)
            break
          } catch (error: any) {
            // Handle race condition: another webhook delivery created the user
            if (error?.code === 'P2002') {
              attempts++
              console.log(`[Clerk Webhook] 🔄 Race condition detected (attempt ${attempts}/${maxAttempts})`)

              // Add jitter to prevent thundering herd
              await new Promise(resolve => setTimeout(resolve, 20 * attempts + Math.random() * 10))

              // Try to fetch the user that was created by concurrent request
              user = await prisma.user.findUnique({
                where: { clerkUserId: id },
              })

              if (user) {
                console.log(`[Clerk Webhook] ✅ User already created by concurrent webhook`)
                break
              }

              // If still not found and we have attempts left, try again
              if (attempts >= maxAttempts) {
                throw new Error(`Failed to create or find user after ${maxAttempts} attempts`)
              }
            } else {
              // Different error, not a race condition
              throw error
            }
          }
        }

        if (!user) {
          throw new Error('Failed to get or create user')
        }

        // Check for pending subscription (anonymous checkout flow)
        const pendingSubscription = await prisma.pendingSubscription.findFirst({
          where: {
            email: email,
            status: "payment_complete",
            expiresAt: { gt: new Date() },
          },
        })

        if (pendingSubscription) {
          console.log(`[Clerk Webhook] Found pending subscription for new user`, {
            userId: user.id,
            email: email,
            pendingId: pendingSubscription.id,
          })

          // Auto-link the pending subscription
          const result = await linkPendingSubscription(user.id)

          if (result.success) {
            console.log(`[Clerk Webhook] Successfully linked pending subscription`, {
              userId: user.id,
              subscriptionId: result.subscriptionId,
            })
          } else {
            console.error(`[Clerk Webhook] Failed to link pending subscription`, {
              userId: user.id,
              error: result.error,
            })
          }
        }

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

        // 1. Trigger async Stripe cleanup (outside transaction)
        const userForStripe = await prisma.user.findUnique({
          where: { clerkUserId: id },
          include: { profile: true },
        })

        if (userForStripe?.profile?.stripeCustomerId) {
          await triggerInngestEvent("user/deleted", {
            userId: userForStripe.id,
            stripeCustomerId: userForStripe.profile.stripeCustomerId,
          })
        }

        // 2. Perform local DB cleanup
        await prisma.$transaction(async (tx) => {
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
