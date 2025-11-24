/**
 * Cleanup Pending Subscriptions Cron Job
 *
 * Runs daily to handle expired PendingSubscriptions:
 * 1. Find subscriptions past expiry (30 days from creation)
 * 2. Check Stripe subscription status
 * 3. Cancel active subscriptions and issue refunds
 * 4. Update status to "expired" or "refunded"
 * 5. Send notification emails
 *
 * Scheduled via Vercel Cron: Daily at 2am UTC
 * Security: Verifies CRON_SECRET header
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { stripe } from "@/server/providers/stripe/client"
import { createAuditEvent } from "@/server/lib/audit"
import { env } from "@/env.mjs"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[Cleanup Cron] Starting cleanup of expired pending subscriptions")

  try {
    // Find expired pending subscriptions that haven't been processed
    const expiredSubscriptions = await prisma.pendingSubscription.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { in: ["awaiting_payment", "payment_complete"] },
      },
      take: 100, // Process in batches
    })

    console.log(
      `[Cleanup Cron] Found ${expiredSubscriptions.length} expired pending subscriptions`
    )

    const results = {
      processed: 0,
      refunded: 0,
      expired: 0,
      errors: 0,
    }

    for (const pending of expiredSubscriptions) {
      try {
        // If payment was completed but never linked, need to refund
        if (pending.status === "payment_complete" && pending.stripeSubscriptionId) {
          console.log(`[Cleanup Cron] Processing refund for ${pending.email}`, {
            pendingId: pending.id,
            subscriptionId: pending.stripeSubscriptionId,
          })

          // Get Stripe subscription
          const subscription = await stripe.subscriptions.retrieve(pending.stripeSubscriptionId)

          // Cancel subscription if still active
          if (subscription.status === "active" || subscription.status === "trialing") {
            await stripe.subscriptions.cancel(pending.stripeSubscriptionId)
            console.log(`[Cleanup Cron] Cancelled subscription ${pending.stripeSubscriptionId}`)
          }

          // Issue refund for last payment
          if (subscription.latest_invoice) {
            const invoice =
              typeof subscription.latest_invoice === "string"
                ? await stripe.invoices.retrieve(subscription.latest_invoice)
                : subscription.latest_invoice

            if (invoice.payment_intent) {
              const paymentIntent =
                typeof invoice.payment_intent === "string"
                  ? await stripe.paymentIntents.retrieve(invoice.payment_intent)
                  : invoice.payment_intent

              if (
                paymentIntent.status === "succeeded" &&
                paymentIntent.amount > 0 &&
                paymentIntent.charges?.data[0]
              ) {
                await stripe.refunds.create({
                  charge: paymentIntent.charges.data[0].id,
                  reason: "requested_by_customer",
                  metadata: {
                    reason: "subscription_expired_before_activation",
                    pendingSubscriptionId: pending.id,
                  },
                })

                console.log(`[Cleanup Cron] Issued refund for ${pending.email}`)
                results.refunded++
              }
            }
          }

          // Update status to refunded
          await prisma.pendingSubscription.update({
            where: { id: pending.id },
            data: { status: "refunded" },
          })

          // TODO: Send refund notification email (Phase 7)
          // await sendEmail({
          //   to: pending.email,
          //   template: "subscription-expired-refunded",
          //   data: { plan: pending.plan, amountCents: pending.amountCents }
          // })
        } else {
          // Just mark as expired (payment never completed)
          await prisma.pendingSubscription.update({
            where: { id: pending.id },
            data: { status: "expired" },
          })

          console.log(`[Cleanup Cron] Marked as expired: ${pending.email}`)
          results.expired++
        }

        // Create audit event
        await createAuditEvent({
          userId: null,
          type: "subscription.cleanup",
          data: {
            pendingSubscriptionId: pending.id,
            email: pending.email,
            status: pending.status === "payment_complete" ? "refunded" : "expired",
            plan: pending.plan,
          },
        })

        results.processed++
      } catch (error) {
        console.error(`[Cleanup Cron] Error processing ${pending.id}:`, error)
        results.errors++
      }
    }

    console.log("[Cleanup Cron] Cleanup completed", results)

    // Alert if cleanup rate is too high (> 10 per day suggests issues)
    if (results.processed > 10) {
      console.warn(
        `[Cleanup Cron] High cleanup rate detected: ${results.processed} subscriptions cleaned up. Investigate potential issues.`
      )
      // TODO: Send alert to monitoring system
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error("[Cleanup Cron] Fatal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
