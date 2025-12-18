/**
 * Stripe Checkout Operations
 *
 * Handles checkout session creation and management for subscription purchases.
 * Provides abstraction layer over Stripe Checkout API.
 *
 * @module stripe/checkout
 */

import type Stripe from "stripe"
import { stripe } from "./client"
import { env } from "@/env.mjs"

/**
 * Options for creating a checkout session
 */
interface CreateCheckoutSessionOptions {
  /** Stripe customer ID */
  customerId: string
  /** Stripe price ID for the subscription */
  priceId: string
  /** User ID for metadata tracking */
  userId: string
  /** Optional metadata for tracking */
  metadata?: Record<string, string>
}

/**
 * Create a Stripe Checkout Session for subscription purchase
 *
 * Includes:
 * - 14-day trial
 * - Card payment only
 * - Promotion code support
 * - Auto-collect billing address
 *
 * @param options - Checkout session configuration
 * @returns Stripe checkout session object
 *
 * @throws {Stripe.errors.StripeError} If Stripe API call fails
 *
 * @example
 * const session = await createCheckoutSession({
 *   customerId: 'cus_123',
 *   priceId: 'price_123',
 *   userId: 'user_123'
 * })
 */
export async function createCheckoutSession(
  options: CreateCheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const { customerId, priceId, userId, metadata = {} } = options

  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        userId,
      },
    },
    metadata: {
      userId,
      source: "pricing_page",
      priceId,
      ...metadata,
    },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer_update: {
      address: "auto",
    },
  })
}

/**
 * Create or get Stripe customer for user
 *
 * Returns existing customer ID if available, otherwise creates new customer.
 *
 * @param options - Customer creation options
 * @returns Stripe customer ID
 *
 * @throws {Stripe.errors.StripeError} If customer creation fails
 */
export async function getOrCreateCustomer(options: {
  email: string
  userId: string
  clerkUserId?: string
  existingCustomerId?: string | null
}): Promise<string> {
  const { email, userId, clerkUserId, existingCustomerId } = options

  // Return existing customer if available
  if (existingCustomerId) {
    return existingCustomerId
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
      ...(clerkUserId && { clerkUserId }),
    },
  })

  return customer.id
}

/**
 * Create billing portal session for subscription management
 *
 * @param customerId - Stripe customer ID
 * @returns Portal session with URL
 *
 * @throws {Stripe.errors.StripeError} If portal session creation fails
 */
export async function createBillingPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
  })
}

/**
 * Retrieve checkout session by ID
 *
 * @param sessionId - Checkout session ID
 * @returns Checkout session object
 *
 * @throws {Stripe.errors.StripeError} If session not found
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId)
}
