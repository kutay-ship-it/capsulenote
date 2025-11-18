/**
 * Checkout Event Handlers
 *
 * Handles checkout.session.* webhook events from Stripe:
 * - checkout.session.completed (includes anonymous checkout support)
 * - checkout.session.expired
 */

import Stripe from "stripe"
import {
  getUserByStripeCustomer,
  recordBillingAudit,
} from "../../../../../apps/web/server/lib/stripe-helpers"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"
import { prisma } from "../../../../../apps/web/server/lib/db"
import { linkPendingSubscription } from "../../../../../apps/web/app/subscribe/actions"
import { sendPaymentConfirmationEmail } from "../../../../../apps/web/server/lib/emails/payment-confirmation"
import { env } from "../../../../../apps/web/env.mjs"

/**
 * Handle checkout.session.completed event
 *
 * Supports both authenticated and anonymous checkout flows:
 * 1. If user exists → log completion audit event
 * 2. If no user (anonymous checkout):
 *    - Update PendingSubscription to payment_complete
 *    - Store subscription ID
 *    - Check if user already exists with email (auto-link)
 *    - If no user, trigger signup reminder email
 *
 * @param session - Stripe Checkout Session object
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Checkout Handler] Checkout completed", {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
  })

  const customerId = session.customer as string
  if (!customerId) {
    console.warn("[Checkout Handler] No customer ID in checkout session", {
      sessionId: session.id,
    })
    return
  }

  // Try to find existing user
  const user = await getUserByStripeCustomer(customerId)

  if (user) {
    // Authenticated checkout - just log completion
    await recordBillingAudit(user.id, AuditEventType.CHECKOUT_COMPLETED, {
      sessionId: session.id,
      subscriptionId: session.subscription,
      amountTotal: session.amount_total,
      currency: session.currency,
    })

    console.log("[Checkout Handler] Checkout completion logged for existing user", {
      sessionId: session.id,
      userId: user.id,
    })
    return
  }

  // Anonymous checkout flow - find PendingSubscription
  const pending = await prisma.pendingSubscription.findFirst({
    where: {
      OR: [
        { stripeCustomerId: customerId },
        { stripeSessionId: session.id },
      ],
    },
  })

  if (!pending) {
    console.warn("[Checkout Handler] No PendingSubscription found for anonymous checkout", {
      customerId,
      sessionId: session.id,
    })
    return
  }

  console.log("[Checkout Handler] Found PendingSubscription for anonymous checkout", {
    pendingId: pending.id,
    email: pending.email,
  })

  // Update PendingSubscription to payment_complete
  // Use conditional update to prevent double-processing from concurrent webhooks
  const updatedPending = await prisma.pendingSubscription.updateMany({
    where: {
      id: pending.id,
      status: { not: "payment_complete" }, // Only update if not already processed
    },
    data: {
      status: "payment_complete",
      stripeSubscriptionId: session.subscription as string,
      paymentStatus: session.payment_status,
      webhookProcessedAt: new Date(),
    },
  })

  // Check if update succeeded (count > 0)
  if (updatedPending.count === 0) {
    console.log("[Checkout Handler] PendingSubscription already processed by concurrent webhook", {
      pendingId: pending.id,
    })
    return // Idempotent - already processed
  }

  // Fetch the updated record for email sending
  const updatedPendingRecord = await prisma.pendingSubscription.findUnique({
    where: { id: pending.id },
  })

  if (!updatedPendingRecord) {
    throw new Error("PendingSubscription not found after update")
  }

  // Send payment confirmation email (non-blocking)
  sendPaymentConfirmationEmail({
    email: updatedPendingRecord.email,
    plan: updatedPendingRecord.plan,
    amountCents: updatedPendingRecord.amountCents,
    currency: updatedPendingRecord.currency,
    nextSteps: {
      signUpUrl: `${env.NEXT_PUBLIC_APP_URL}/sign-up?email=${encodeURIComponent(updatedPendingRecord.email)}`,
      supportEmail: "support@dearme.app",
    },
  })
    .then((result) => {
      if (result.success) {
        // Update confirmationEmailSentAt timestamp
        prisma.pendingSubscription
          .update({
            where: { id: updatedPendingRecord.id },
            data: { confirmationEmailSentAt: new Date() },
          })
          .catch((error) => {
            console.warn("[Checkout Handler] Failed to update confirmationEmailSentAt", {
              pendingId: updatedPendingRecord.id,
              error: error instanceof Error ? error.message : String(error),
            })
          })

        console.log("[Checkout Handler] Payment confirmation email sent", {
          pendingId: updatedPendingRecord.id,
          email: updatedPendingRecord.email,
          emailId: result.emailId,
        })
      } else {
        console.error("[Checkout Handler] Failed to send payment confirmation email", {
          pendingId: updatedPendingRecord.id,
          email: updatedPendingRecord.email,
          error: result.error,
        })
      }
    })
    .catch((error) => {
      console.error("[Checkout Handler] Unexpected error sending confirmation email", {
        pendingId: updatedPendingRecord.id,
        error: error instanceof Error ? error.message : String(error),
      })
    })

  // Check if user already exists with this email (race condition: user signed up before webhook)
  const existingUser = await prisma.user.findUnique({
    where: { email: updatedPendingRecord.email },
  })

  if (existingUser) {
    console.log("[Checkout Handler] User already exists, auto-linking subscription", {
      userId: existingUser.id,
      email: pending.email,
    })

    // Auto-link immediately
    const result = await linkPendingSubscription(existingUser.id)

    if (result.success) {
      console.log("[Checkout Handler] Successfully auto-linked subscription", {
        userId: existingUser.id,
        subscriptionId: result.subscriptionId,
      })
    } else {
      console.error("[Checkout Handler] Failed to auto-link subscription", {
        userId: existingUser.id,
        error: result.error,
      })
    }
  } else {
    console.log("[Checkout Handler] No user exists yet, awaiting signup", {
      email: pending.email,
    })

    // TODO: Trigger signup reminder email (Phase 6)
    // await inngest.send({
    //   name: "billing.send-signup-reminder",
    //   data: {
    //     pendingSubscriptionId: pending.id,
    //     email: pending.email,
    //     immediate: true,
    //   },
    // })
  }
}

/**
 * Handle checkout.session.expired event
 *
 * Tracks checkout abandonment for analytics.
 *
 * @param session - Stripe Checkout Session object
 */
export async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Checkout Handler] Checkout expired", {
    sessionId: session.id,
    customerId: session.customer,
  })

  // Find user if customer exists
  const customerId = session.customer as string
  if (customerId) {
    const user = await getUserByStripeCustomer(customerId)
    if (user) {
      await recordBillingAudit(user.id, AuditEventType.CHECKOUT_CANCELED, {
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      })

      console.log("[Checkout Handler] Checkout expiration logged", {
        sessionId: session.id,
        userId: user.id,
      })
    }
  }
}
