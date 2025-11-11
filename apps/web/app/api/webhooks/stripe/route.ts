import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/server/providers/stripe"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get("stripe-signature")

  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.created": {
        const customer = event.data.object as Stripe.Customer
        // Handled in user creation flow
        console.log(`Customer created: ${customer.id}`)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const profile = await prisma.profile.findUnique({
          where: { stripeCustomerId: customerId },
          include: { user: true },
        })

        if (!profile) {
          console.error(`User not found for customer: ${customerId}`)
          break
        }

        // Upsert subscription
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          create: {
            userId: profile.userId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status as any,
            plan: "pro",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            status: subscription.status as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })

        console.log(`Subscription updated: ${subscription.id}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "canceled" },
        })

        console.log(`Subscription canceled: ${subscription.id}`)
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Record payment
        if (paymentIntent.metadata.userId) {
          await prisma.payment.create({
            data: {
              userId: paymentIntent.metadata.userId,
              type: paymentIntent.metadata.type as any,
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              stripePaymentIntentId: paymentIntent.id,
              status: "succeeded",
              metadata: paymentIntent.metadata,
            },
          })
        }

        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        if (paymentIntent.metadata.userId) {
          await prisma.payment.create({
            data: {
              userId: paymentIntent.metadata.userId,
              type: paymentIntent.metadata.type as any,
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              stripePaymentIntentId: paymentIntent.id,
              status: "failed",
              metadata: paymentIntent.metadata,
            },
          })
        }

        console.log(`Payment failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Error processing Stripe webhook:", error)
    return new Response("Webhook processing failed", { status: 500 })
  }
}
