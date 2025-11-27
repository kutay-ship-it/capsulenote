/**
 * Audit Logging System
 *
 * Provides comprehensive audit trail for all billing, security, and GDPR operations.
 * Audit logs are immutable and retained for 7 years for compliance.
 *
 * Security Requirements:
 * - Never log passwords, API keys, card numbers, or PII
 * - Logs are write-only (no delete capability)
 * - Admin-only access for viewing
 * - Redact sensitive data before logging
 *
 * @module lib/audit
 */

import { prisma } from "./db"

/**
 * Audit Event Types
 *
 * Comprehensive list of all auditable events in the system.
 * Events are categorized by domain for easier filtering.
 */
export const AuditEventType = {
  // Checkout events
  CHECKOUT_SESSION_CREATED: "checkout.session.created",
  CHECKOUT_COMPLETED: "checkout.completed",
  CHECKOUT_CANCELED: "checkout.canceled",

  // Subscription events
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_RESUMED: "subscription.resumed",
  SUBSCRIPTION_PAUSED: "subscription.paused",
  SUBSCRIPTION_TRIAL_ENDING: "subscription.trial_ending",

  // Billing portal events
  BILLING_PORTAL_ACCESSED: "billing_portal.accessed",
  BILLING_PORTAL_SESSION_CREATED: "billing_portal.session.created",

  // Payment events
  PAYMENT_SUCCEEDED: "payment.succeeded",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_METHOD_ATTACHED: "payment_method.attached",
  PAYMENT_METHOD_DETACHED: "payment_method.detached",
  REFUND_CREATED: "refund.created",
  INVOICE_PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",

  // GDPR events
  DATA_EXPORT_REQUESTED: "gdpr.data_export.requested",
  DATA_EXPORT_COMPLETED: "gdpr.data_export.completed",
  DATA_DELETION_REQUESTED: "gdpr.data_deletion.requested",
  DATA_DELETION_COMPLETED: "gdpr.data_deletion.completed",

  // Admin events
  ADMIN_SUBSCRIPTION_UPDATED: "admin.subscription.updated",
  ADMIN_REFUND_ISSUED: "admin.refund.issued",
  ADMIN_USER_IMPERSONATED: "admin.user.impersonated",

  // Security events
  UNAUTHORIZED_ACCESS_ATTEMPT: "security.unauthorized_access",
  RATE_LIMIT_EXCEEDED: "security.rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY: "security.suspicious_activity",

  // Letter events
  LETTER_CREATED: "letter.created",
  LETTER_UPDATED: "letter.updated",
  LETTER_DELETED: "letter.deleted",
  LETTER_AUTO_DELETED: "letter.auto_deleted",
  LETTER_SHARED: "letter.shared",
  LETTER_MIGRATED_FROM_ANONYMOUS: "letter.migrated_from_anonymous",

  // Delivery events
  DELIVERY_SCHEDULED: "delivery.scheduled",
  DELIVERY_SENT: "delivery.sent",
  DELIVERY_FAILED: "delivery.failed",
  DELIVERY_CANCELED: "delivery.canceled",
  DELIVERY_RECONCILED: "delivery.reconciled",

  // System events
  SYSTEM_RECONCILER_HIGH_VOLUME: "system.reconciler_high_volume",

  // Credit events
  CREDITS_ADDED: "credits.added",
  CREDITS_DEDUCTED: "credits.deducted",
  ENTITLEMENTS_UPDATED: "entitlements.updated",
} as const

export type AuditEventTypeValue =
  (typeof AuditEventType)[keyof typeof AuditEventType]

/**
 * Parameters for creating an audit event
 */
export interface CreateAuditEventParams {
  userId: string | null
  type: AuditEventTypeValue
  data: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Create an audit event
 *
 * @param params - Audit event parameters
 * @returns Created audit event
 *
 * @example
 * await createAuditEvent({
 *   userId: user.id,
 *   type: AuditEventType.CHECKOUT_SESSION_CREATED,
 *   data: {
 *     sessionId: session.id,
 *     priceId: input.priceId,
 *     customerId: customerId
 *   },
 *   ipAddress: req.headers.get('x-forwarded-for'),
 *   userAgent: req.headers.get('user-agent')
 * })
 */
export async function createAuditEvent(params: CreateAuditEventParams) {
  try {
    return await prisma.auditEvent.create({
      data: {
        userId: params.userId,
        type: params.type,
        data: params.data as Record<string, never>, // Type assertion to satisfy Prisma JsonValue
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    // Log but don't throw - audit logging should never break the main flow
    console.error("[Audit] Failed to create audit event:", {
      type: params.type,
      userId: params.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Query audit events for a specific user
 *
 * @param userId - User ID to query events for
 * @param options - Optional filters
 * @returns List of audit events
 *
 * @example
 * const events = await getAuditEvents(user.id, { limit: 50 })
 */
export async function getAuditEvents(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    type?: string
    startDate?: Date
    endDate?: Date
  }
) {
  const { limit = 50, offset = 0, type, startDate, endDate } = options || {}

  return prisma.auditEvent.findMany({
    where: {
      userId,
      ...(type && { type }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}

/**
 * Get count of audit events by type
 *
 * Useful for analytics and monitoring.
 *
 * @param userId - Optional user ID to filter by
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 * @returns Event counts by type
 */
export async function getAuditEventCounts(options?: {
  userId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { userId, startDate, endDate } = options || {}

  return prisma.auditEvent.groupBy({
    by: ["type"],
    where: {
      ...(userId && { userId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  })
}

/**
 * Redact sensitive data from objects before logging
 *
 * Removes or masks fields that should never be logged:
 * - Passwords
 * - API keys
 * - Credit card numbers
 * - SSN
 * - Other PII
 *
 * @param data - Data object to redact
 * @returns Redacted data object
 */
export function redactSensitiveData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const redacted = { ...data }

  const sensitiveFields = [
    "password",
    "apiKey",
    "api_key",
    "secret",
    "token",
    "creditCard",
    "cardNumber",
    "cvv",
    "ssn",
    "socialSecurity",
  ]

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = "[REDACTED]"
    }
  }

  return redacted
}
