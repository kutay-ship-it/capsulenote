/**
 * Metadata Validation Schemas
 *
 * Zod schemas for validating JSON metadata fields in database models.
 * Ensures type safety and data integrity for unstructured data.
 *
 * @module types/schemas/metadata
 */

import { z } from "zod"

/**
 * Shipping Address Metadata Schema
 *
 * Stores Lob API verification results and delivery status.
 */
export const shippingAddressMetadataSchema = z
  .object({
    /** Whether address has been verified by Lob */
    verified: z.boolean().optional(),
    /** Lob address ID for API reference */
    lobAddressId: z.string().optional(),
    /** Lob deliverability score */
    deliverability: z
      .enum(["deliverable", "deliverable_unnecessary_unit", "deliverable_incorrect_unit", "deliverable_missing_unit", "undeliverable", "unknown"])
      .optional(),
    /** Lob deliverability analysis */
    deliverabilityAnalysis: z
      .object({
        dpvMatchCode: z.string().optional(),
        dpvFootnotes: z.array(z.string()).optional(),
        dpvActive: z.string().optional(),
        ewsMatch: z.boolean().optional(),
        lacsIndicator: z.string().optional(),
        lacsReturnCode: z.string().optional(),
        suiteReturnCode: z.string().optional(),
      })
      .optional(),
    /** Address components from verification */
    components: z
      .object({
        primaryNumber: z.string().optional(),
        streetPredirection: z.string().optional(),
        streetName: z.string().optional(),
        streetSuffix: z.string().optional(),
        streetPostdirection: z.string().optional(),
        secondaryDesignator: z.string().optional(),
        secondaryNumber: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        zipCodePlus4: z.string().optional(),
      })
      .optional(),
  })
  .passthrough() // Allow additional fields

/**
 * Payment Metadata Schema
 *
 * Stores additional context for payment records.
 */
export const paymentMetadataSchema = z
  .object({
    /** Stripe invoice ID if from subscription */
    invoiceId: z.string().optional(),
    /** Stripe subscription ID if from subscription */
    subscriptionId: z.string().optional(),
    /** Add-on type if credit purchase */
    addonType: z.enum(["email", "physical"]).optional(),
    /** Add-on quantity if credit purchase */
    addonQuantity: z.number().int().positive().optional(),
    /** Anonymization flag for GDPR deletion */
    anonymized: z.boolean().optional(),
    /** Original user ID if anonymized */
    originalUserId: z.string().optional(),
    /** Anonymization timestamp */
    anonymizedAt: z.string().datetime().optional(),
  })
  .passthrough()

/**
 * Credit Transaction Metadata Schema
 *
 * Stores context for credit operations.
 */
export const creditTransactionMetadataSchema = z
  .object({
    /** Reason for the transaction */
    reason: z
      .enum([
        "subscription_renewal",
        "addon_purchase",
        "delivery_scheduled",
        "delivery_canceled",
        "inngest_failure_rollback",
        "dunning_cancellation",
        "manual_adjustment",
        "trial_grant",
        "refund",
      ])
      .optional(),
    /** Related letter ID */
    letterId: z.string().uuid().optional(),
    /** Related delivery ID */
    deliveryId: z.string().uuid().optional(),
    /** For dunning: days overdue */
    daysOverdue: z.number().int().optional(),
    /** For dunning: related invoice */
    invoiceId: z.string().optional(),
    /** Trial credit flag */
    isTrialCredit: z.boolean().optional(),
    /** Physical mail trial used flag */
    physicalMailTrialUsed: z.boolean().optional(),
    /** Plan type at time of transaction */
    planType: z.enum(["digital", "paper", "physical"]).optional(),
  })
  .passthrough()

/**
 * Audit Event Metadata Schema
 *
 * Stores context for audit log entries.
 */
export const auditEventMetadataSchema = z
  .object({
    /** Session ID for tracking */
    sessionId: z.string().optional(),
    /** Previous value (for updates) */
    previousValue: z.unknown().optional(),
    /** New value (for updates) */
    newValue: z.unknown().optional(),
    /** Error message if failed */
    error: z.string().optional(),
    /** Error type */
    errorType: z.string().optional(),
    /** Key version for encryption events */
    keyVersion: z.number().int().optional(),
    /** Anonymization marker */
    anonymized: z.boolean().optional(),
  })
  .passthrough()

/**
 * Delivery Metadata Schema
 *
 * Stores additional delivery context.
 */
export const deliveryMetadataSchema = z
  .object({
    /** Email provider used */
    emailProvider: z.enum(["resend", "postmark"]).optional(),
    /** Mail provider used */
    mailProvider: z.enum(["lob", "clicksend"]).optional(),
    /** Lob letter ID */
    lobLetterId: z.string().optional(),
    /** Lob tracking number */
    lobTrackingNumber: z.string().optional(),
    /** Expected delivery date */
    expectedDeliveryDate: z.string().datetime().optional(),
    /** Carrier information */
    carrier: z.string().optional(),
    /** Tracking events */
    trackingEvents: z
      .array(
        z.object({
          event: z.string(),
          timestamp: z.string().datetime(),
          location: z.string().optional(),
        })
      )
      .optional(),
  })
  .passthrough()

/**
 * Subscription Metadata Schema
 *
 * Stores additional subscription context.
 */
export const subscriptionMetadataSchema = z
  .object({
    /** Original plan if upgraded/downgraded */
    previousPlanType: z.enum(["digital", "paper", "physical"]).optional(),
    /** Promo code applied */
    promoCode: z.string().optional(),
    /** Referral code used */
    referralCode: z.string().optional(),
    /** Referred by user ID */
    referredBy: z.string().uuid().optional(),
    /** Cancellation reason */
    cancellationReason: z.string().optional(),
    /** Pause reason */
    pauseReason: z.string().optional(),
  })
  .passthrough()

/**
 * Type exports for use with Prisma
 */
export type ShippingAddressMetadata = z.infer<typeof shippingAddressMetadataSchema>
export type PaymentMetadata = z.infer<typeof paymentMetadataSchema>
export type CreditTransactionMetadata = z.infer<typeof creditTransactionMetadataSchema>
export type AuditEventMetadata = z.infer<typeof auditEventMetadataSchema>
export type DeliveryMetadata = z.infer<typeof deliveryMetadataSchema>
export type SubscriptionMetadata = z.infer<typeof subscriptionMetadataSchema>

/**
 * Validate and parse metadata with schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws on invalid
 *
 * @example
 * const metadata = validateMetadata(shippingAddressMetadataSchema, input.metadata)
 */
export function validateMetadata<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data)
}

/**
 * Safely parse metadata without throwing
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Success result with data or error result
 *
 * @example
 * const result = safeParseMetadata(paymentMetadataSchema, input.metadata)
 * if (result.success) {
 *   console.log(result.data.invoiceId)
 * }
 */
export function safeParseMetadata<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.SafeParseReturnType<z.input<T>, z.infer<T>> {
  return schema.safeParse(data)
}
