/**
 * Billing and Subscription Type Definitions
 *
 * Zod schemas and TypeScript types for subscription management,
 * entitlements, and billing operations.
 *
 * @module billing
 */

import { z } from "zod"

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Subscription plan tiers
 */
export const subscriptionPlanSchema = z.enum(['free', 'pro', 'enterprise'])
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

/**
 * Subscription status values
 */
export const subscriptionStatusSchema = z.enum([
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused',
  'none' // For users without subscription
])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

/**
 * Payment types
 */
export const paymentTypeSchema = z.enum(['subscription', 'shipping_addon'])
export type PaymentType = z.infer<typeof paymentTypeSchema>

/**
 * Payment status values
 */
export const paymentStatusSchema = z.enum(['succeeded', 'failed', 'pending', 'refunded'])
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

// ============================================================================
// ENTITLEMENTS
// ============================================================================

/**
 * Feature access configuration
 */
export const featuresSchema = z.object({
  canCreateLetters: z.boolean(),
  canScheduleDeliveries: z.boolean(),
  canSchedulePhysicalMail: z.boolean(),
  maxLettersPerMonth: z.union([z.number(), z.literal('unlimited')]),
  emailDeliveriesIncluded: z.union([z.number(), z.literal('unlimited')]),
  mailCreditsPerMonth: z.number()
})

/**
 * Current usage data
 */
export const usageSchema = z.object({
  lettersThisMonth: z.number().int().min(0),
  emailsThisMonth: z.number().int().min(0),
  mailCreditsRemaining: z.number().int().min(0)
})

/**
 * Trial information
 */
export const trialInfoSchema = z.object({
  isInTrial: z.boolean(),
  trialEndsAt: z.date(),
  daysRemaining: z.number().int().min(0)
})

/**
 * Quota limit status
 */
export const limitsSchema = z.object({
  lettersReached: z.boolean(),
  emailsReached: z.boolean(),
  mailCreditsExhausted: z.boolean()
})

/**
 * Complete entitlements object
 */
export const entitlementsSchema = z.object({
  userId: z.string().uuid(),
  plan: z.union([subscriptionPlanSchema, z.literal('none')]),
  status: subscriptionStatusSchema,
  features: featuresSchema,
  usage: usageSchema,
  trialInfo: trialInfoSchema.optional(),
  limits: limitsSchema
})

export type Entitlements = z.infer<typeof entitlementsSchema>
export type Features = z.infer<typeof featuresSchema>
export type Usage = z.infer<typeof usageSchema>
export type TrialInfo = z.infer<typeof trialInfoSchema>
export type Limits = z.infer<typeof limitsSchema>

// ============================================================================
// PRICING PLANS
// ============================================================================

/**
 * Pricing plan configuration from database
 */
export const pricingPlanSchema = z.object({
  id: z.string().uuid(),
  stripeProductId: z.string(),
  stripePriceId: z.string(),
  name: z.string(),
  plan: subscriptionPlanSchema,
  interval: z.enum(['month', 'year']),
  amountCents: z.number().int().min(0),
  currency: z.string().length(3).default('usd'),
  features: z.record(z.unknown()), // JSON features object
  isActive: z.boolean(),
  sortOrder: z.number().int().default(0)
})

export type PricingPlan = z.infer<typeof pricingPlanSchema>

/**
 * Pricing plan for display (frontend)
 */
export const pricingPlanDisplaySchema = pricingPlanSchema.extend({
  displayPrice: z.string(), // "$9/month" or "$90/year"
  displayFeatures: z.array(z.string()), // Human-readable feature list
  isPopular: z.boolean().optional(),
  savings: z.string().optional() // "Save 17%" for annual
})

export type PricingPlanDisplay = z.infer<typeof pricingPlanDisplaySchema>

// ============================================================================
// CHECKOUT
// ============================================================================

/**
 * Create checkout session input
 */
export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string()).optional()
})

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>

/**
 * Checkout session response
 */
export const checkoutSessionSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
  expiresAt: z.date()
})

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>

// ============================================================================
// CUSTOMER PORTAL
// ============================================================================

/**
 * Create portal session input
 */
export const createPortalSessionSchema = z.object({
  returnUrl: z.string().url().optional()
})

export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>

/**
 * Portal session response
 */
export const portalSessionSchema = z.object({
  url: z.string().url()
})

export type PortalSession = z.infer<typeof portalSessionSchema>

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

/**
 * Subscription data from database
 */
export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  stripeSubscriptionId: z.string(),
  status: subscriptionStatusSchema,
  plan: subscriptionPlanSchema,
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type Subscription = z.infer<typeof subscriptionSchema>

/**
 * Cancel subscription input
 */
export const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().max(500).optional()
})

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>

/**
 * Resume subscription input
 */
export const resumeSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid()
})

export type ResumeSubscriptionInput = z.infer<typeof resumeSubscriptionSchema>

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Subscription usage data
 */
export const subscriptionUsageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  period: z.date(),
  lettersCreated: z.number().int().min(0),
  emailsSent: z.number().int().min(0),
  mailsSent: z.number().int().min(0),
  mailCredits: z.number().int().min(0)
})

export type SubscriptionUsage = z.infer<typeof subscriptionUsageSchema>

/**
 * Track letter creation input
 */
export const trackLetterCreationSchema = z.object({
  userId: z.string().uuid()
})

export type TrackLetterCreationInput = z.infer<typeof trackLetterCreationSchema>

/**
 * Add mail credits input
 */
export const addMailCreditsSchema = z.object({
  userId: z.string().uuid(),
  credits: z.number().int().min(1).max(100),
  purchaseAmount: z.number().int().min(0).optional() // Amount paid in cents
})

export type AddMailCreditsInput = z.infer<typeof addMailCreditsSchema>

// ============================================================================
// PAYMENTS
// ============================================================================

/**
 * Payment record
 */
export const paymentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: paymentTypeSchema,
  amountCents: z.number().int().min(0),
  currency: z.string().length(3),
  stripePaymentIntentId: z.string().optional(),
  status: paymentStatusSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type Payment = z.infer<typeof paymentSchema>

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Webhook event record
 */
export const webhookEventSchema = z.object({
  id: z.string(), // Stripe event ID
  type: z.string(),
  processedAt: z.date(),
  data: z.record(z.unknown())
})

export type WebhookEvent = z.infer<typeof webhookEventSchema>

/**
 * Failed webhook record
 */
export const failedWebhookSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string(),
  eventType: z.string(),
  payload: z.record(z.unknown()),
  error: z.string(),
  retriedAt: z.date(),
  resolvedAt: z.date().optional()
})

export type FailedWebhook = z.infer<typeof failedWebhookSchema>

/**
 * Stripe webhook signature verification
 */
export const stripeWebhookHeadersSchema = z.object({
  'stripe-signature': z.string()
})

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Billing-specific error codes
 */
export const billingErrorCodes = {
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  STRIPE_ERROR: 'STRIPE_ERROR',
  WEBHOOK_VERIFICATION_FAILED: 'WEBHOOK_VERIFICATION_FAILED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  INVALID_PLAN: 'INVALID_PLAN'
} as const

export type BillingErrorCode = (typeof billingErrorCodes)[keyof typeof billingErrorCodes]

/**
 * Billing error response
 */
export const billingErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional()
})

export type BillingError = z.infer<typeof billingErrorSchema>

// ============================================================================
// ADMIN
// ============================================================================

/**
 * Admin subscription update input
 */
export const adminUpdateSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  plan: subscriptionPlanSchema.optional(),
  status: subscriptionStatusSchema.optional(),
  addCredits: z.number().int().min(0).optional(),
  reason: z.string().max(500).optional()
})

export type AdminUpdateSubscriptionInput = z.infer<typeof adminUpdateSubscriptionSchema>

/**
 * Subscription analytics data
 */
export const subscriptionAnalyticsSchema = z.object({
  totalSubscriptions: z.number().int().min(0),
  activeSubscriptions: z.number().int().min(0),
  trialSubscriptions: z.number().int().min(0),
  churnedSubscriptions: z.number().int().min(0),
  monthlyRecurringRevenue: z.number().min(0),
  averageRevenuePerUser: z.number().min(0),
  periodStart: z.date(),
  periodEnd: z.date()
})

export type SubscriptionAnalytics = z.infer<typeof subscriptionAnalyticsSchema>
