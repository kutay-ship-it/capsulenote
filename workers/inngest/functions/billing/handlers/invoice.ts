/**
 * Invoice Event Handlers
 *
 * Handles invoice.* webhook events from Stripe:
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

import Stripe from "stripe"
import { prisma } from "@dearme/prisma"
import {
  getUserByStripeCustomer,
  sendBillingEmail,
  recordBillingAudit,
} from "../../../../../apps/web/server/lib/stripe-helpers"
import { triggerInngestEvent } from "../../../../../apps/web/server/lib/trigger-inngest"
import { AuditEventType } from "../../../../../apps/web/server/lib/audit"

/**
 * Handle invoice.payment_succeeded event
 *
 * Records successful payment and sends receipt.
 *
 * @param invoice - Stripe Invoice object
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string

  console.log("[Invoice Handler] Payment succeeded", {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
  })

  // Find user
  const user = await getUserByStripeCustomer(customerId)
  if (!user) {
    console.warn("[Invoice Handler] User not found for invoice payment", {
      customerId,
      invoiceId: invoice.id,
    })
    return
  }

  // Record payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "subscription",
      amountCents: invoice.amount_paid,
      currency: invoice.currency,
      stripePaymentIntentId: invoice.payment_intent as string,
      status: "succeeded",
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        subscriptionId: invoice.subscription,
      },
    },
  })

  // Send receipt email
  await sendBillingEmail("payment-receipt", user.id, user.email, {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    invoiceUrl: invoice.hosted_invoice_url,
    pdfUrl: invoice.invoice_pdf,
  })

  // Record audit event
  await recordBillingAudit(user.id, AuditEventType.INVOICE_PAYMENT_SUCCEEDED, {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
  })

  console.log("[Invoice Handler] Payment recorded and receipt sent", {
    invoiceId: invoice.id,
    userId: user.id,
  })
}

/**
 * Handle invoice.payment_failed event
 *
 * Records failed payment and triggers dunning sequence.
 *
 * @param invoice - Stripe Invoice object
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string

  console.log("[Invoice Handler] Payment failed", {
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    attemptCount: invoice.attempt_count,
  })

  // Find user
  const user = await getUserByStripeCustomer(customerId)
  if (!user) {
    console.warn("[Invoice Handler] User not found for failed payment", {
      customerId,
      invoiceId: invoice.id,
    })
    return
  }

  // Record failed payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "subscription",
      amountCents: invoice.amount_due,
      currency: invoice.currency,
      stripePaymentIntentId: invoice.payment_intent as string,
      status: "failed",
      metadata: {
        invoiceId: invoice.id,
        attemptCount: invoice.attempt_count,
        nextPaymentAttempt: invoice.next_payment_attempt,
      },
    },
  })

  // Trigger dunning sequence
  await triggerInngestEvent("billing/payment-failed", {
    userId: user.id,
    email: user.email,
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    currency: invoice.currency,
    attemptCount: invoice.attempt_count,
    nextPaymentAttempt: invoice.next_payment_attempt,
  })

  // Record audit event
  await recordBillingAudit(user.id, AuditEventType.INVOICE_PAYMENT_FAILED, {
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    attemptCount: invoice.attempt_count,
  })

  console.log("[Invoice Handler] Failed payment recorded and dunning triggered", {
    invoiceId: invoice.id,
    userId: user.id,
    attemptCount: invoice.attempt_count,
  })
}
