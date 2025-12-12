import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"
import { linkPendingSubscription } from "@/app/[locale]/subscribe/actions"
import { getClerkClient } from "@/server/lib/clerk"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { getDetectedTimezoneFromMetadata, isValidTimezone } from "@dearme/types"
import { createReferralCodeForUser } from "@/server/actions/referral-codes"
import { ratelimit } from "@/server/lib/redis"

export async function POST(req: Request) {
  // Get headers (Next.js 15 requires await)
  const headerPayload = await headers()

  // Rate limit by IP
  const ip = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { success: rateLimitOk } = await ratelimit.webhook.clerk.limit(ip)

  if (!rateLimitOk) {
    console.warn("[Clerk Webhook] Rate limit exceeded", { ip })
    return new Response("Rate limit exceeded", { status: 429 })
  }

  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET")
  }

  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Get raw body - CRITICAL: Must use raw text, not JSON.parse then stringify
  // Svix signs the exact bytes sent, so round-tripping through JSON can change
  // whitespace/key ordering and break signature verification
  const rawBody = await req.text()

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  // Validate event age (prevent replay attacks - both past AND future timestamps)
  const svix_timestamp_ms = parseInt(svix_timestamp, 10) * 1000
  const eventAge = Math.abs(Date.now() - svix_timestamp_ms) // Absolute value catches future timestamps
  const MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes

  if (eventAge > MAX_AGE_MS) {
    console.warn("Clerk webhook timestamp invalid (too old or future), rejecting", {
      eventType: evt.type,
      age: Math.floor((Date.now() - svix_timestamp_ms) / 1000) + "s",
      maxAge: "300s",
      isFuture: svix_timestamp_ms > Date.now(),
    })
    return new Response("Event timestamp invalid", { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, unsafe_metadata } = evt.data
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

        // Extract detected timezone from Clerk metadata (set by TimezoneDetector component)
        const detectedTimezone = getDetectedTimezoneFromMetadata(unsafe_metadata)
        const timezone =
          detectedTimezone && isValidTimezone(detectedTimezone)
            ? detectedTimezone
            : "UTC" // Fallback only if detection failed

        console.log(`[Clerk Webhook] Creating user with timezone: ${timezone}`, {
          detected: detectedTimezone,
          usingFallback: !detectedTimezone,
        })

        // Create user and profile with detected or fallback timezone
        // Use upsert pattern for atomic race condition handling
        const user = await prisma.user.upsert({
          where: { clerkUserId: id },
          create: {
            clerkUserId: id,
            email: email,
            profile: {
              create: {
                timezone,
              },
            },
          },
          update: {}, // No-op if user already exists (concurrent webhook created it)
        })

        console.log(`[Clerk Webhook] User created/found: ${id}`)

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

        // Pre-generate referral code asynchronously (fire-and-forget)
        // This ensures the code exists when user visits settings page
        // Uses .then() to not block webhook response
        createReferralCodeForUser(user.id).then((code) => {
          if (code) {
            console.log(`[Clerk Webhook] Pre-generated referral code for user ${user.id}`)
          }
        }).catch((error) => {
          // Non-fatal: user can still generate code on-demand
          console.warn(`[Clerk Webhook] Failed to pre-generate referral code:`, error)
        })

        break
      }

      case "user.updated": {
        const { id, email_addresses } = evt.data
        const email = email_addresses[0]?.email_address

        if (!email) {
          return new Response("No email found", { status: 400 })
        }

        // Use upsert to handle race condition where user.updated arrives before user.created
        await prisma.user.upsert({
          where: { clerkUserId: id },
          update: { email },
          create: {
            clerkUserId: id,
            email,
            profile: { create: { timezone: "UTC" } },
          },
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
