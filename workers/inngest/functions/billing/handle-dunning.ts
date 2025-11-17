/**
 * Dunning Management Function
 *
 * Automated payment failure recovery with escalating communication:
 * - Day 0: Immediate notification
 * - Day 3: Urgent reminder
 * - Day 7: Final warning
 * - Day 10: Cancel subscription if still unpaid
 *
 * Uses Inngest step.sleep() for scheduled follow-ups.
 */

import { inngest } from "../../client"
import { prisma } from "@dearme/prisma"
import { sendBillingEmail } from "../../../../apps/web/server/lib/stripe-helpers"
import { stripe } from "../../../../apps/web/server/providers/stripe/client"

/**
 * Dunning management function
 */
export const handleDunning = inngest.createFunction(
  {
    id: "handle-dunning",
    name: "Handle Dunning Sequence",
    retries: 2,
  },
  { event: "billing/payment-failed" },
  async ({ event, step }) => {
    const { userId, email, invoiceId, amountDue, currency, attemptCount } = event.data

    console.log("[Dunning] Starting dunning sequence", {
      userId,
      email,
      invoiceId,
      attemptCount,
    })

    // Day 0: Immediate notification (already sent by invoice handler)
    console.log("[Dunning] Day 0: Initial notification already sent", {
      userId,
      invoiceId,
    })

    // Day 3: Urgent reminder
    await step.sleep("wait-3-days", "3d")

    // Check if invoice is still unpaid
    const invoiceAfter3Days = await step.run("check-invoice-day-3", async () => {
      const invoice = await stripe.invoices.retrieve(invoiceId)
      
      console.log("[Dunning] Day 3: Checking invoice status", {
        userId,
        invoiceId,
        status: invoice.status,
      })

      return invoice
    })

    if (invoiceAfter3Days.status === "paid") {
      console.log("[Dunning] Payment received, ending dunning sequence", {
        userId,
        invoiceId,
      })
      return { success: true, paidAt: "day-3", invoiceId }
    }

    // Send Day 3 reminder
    await step.run("send-day-3-reminder", async () => {
      await sendBillingEmail("payment-failed", userId, email, {
        invoiceId,
        amountDue,
        currency,
        attemptCount: attemptCount + 1,
        daysOverdue: 3,
        urgency: "high",
      })

      console.log("[Dunning] Day 3: Urgent reminder sent", {
        userId,
        invoiceId,
      })
    })

    // Day 7: Final warning
    await step.sleep("wait-7-days", "4d") // 3 + 4 = 7 days total

    const invoiceAfter7Days = await step.run("check-invoice-day-7", async () => {
      const invoice = await stripe.invoices.retrieve(invoiceId)
      
      console.log("[Dunning] Day 7: Checking invoice status", {
        userId,
        invoiceId,
        status: invoice.status,
      })

      return invoice
    })

    if (invoiceAfter7Days.status === "paid") {
      console.log("[Dunning] Payment received, ending dunning sequence", {
        userId,
        invoiceId,
      })
      return { success: true, paidAt: "day-7", invoiceId }
    }

    // Send Day 7 final warning
    await step.run("send-day-7-warning", async () => {
      await sendBillingEmail("payment-failed", userId, email, {
        invoiceId,
        amountDue,
        currency,
        attemptCount: attemptCount + 2,
        daysOverdue: 7,
        urgency: "critical",
        finalWarning: true,
      })

      console.log("[Dunning] Day 7: Final warning sent", {
        userId,
        invoiceId,
      })
    })

    // Day 10: Cancel subscription if still unpaid
    await step.sleep("wait-10-days", "3d") // 7 + 3 = 10 days total

    const invoiceAfter10Days = await step.run("check-invoice-day-10", async () => {
      const invoice = await stripe.invoices.retrieve(invoiceId)
      
      console.log("[Dunning] Day 10: Final invoice check", {
        userId,
        invoiceId,
        status: invoice.status,
      })

      return invoice
    })

    if (invoiceAfter10Days.status === "paid") {
      console.log("[Dunning] Payment received at final check", {
        userId,
        invoiceId,
      })
      return { success: true, paidAt: "day-10", invoiceId }
    }

    // Cancel subscription after 10 days of non-payment
    await step.run("cancel-subscription", async () => {
      // Find subscription by invoice
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["active", "past_due"] },
        },
      })

      if (!subscription) {
        console.warn("[Dunning] No active subscription found to cancel", {
          userId,
          invoiceId,
        })
        return
      }

      // Cancel in Stripe
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)

      // Update local database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "canceled" },
      })

      // Send cancellation email
      await sendBillingEmail("subscription-canceled", userId, email, {
        subscriptionId: subscription.stripeSubscriptionId,
        canceledAt: new Date().toISOString(),
        reason: "payment-failure",
        daysOverdue: 10,
      })

      // Record audit event
      await prisma.auditEvent.create({
        data: {
          userId,
          type: "subscription.canceled.dunning",
          data: {
            subscriptionId: subscription.stripeSubscriptionId,
            invoiceId,
            daysOverdue: 10,
          },
        },
      })

      console.log("[Dunning] Subscription canceled due to non-payment", {
        userId,
        subscriptionId: subscription.stripeSubscriptionId,
        invoiceId,
      })
    })

    return { success: true, action: "canceled", invoiceId }
  }
)
