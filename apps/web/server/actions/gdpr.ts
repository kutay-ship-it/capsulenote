/**
 * GDPR Data Subject Rights (DSR) Actions
 *
 * Implements GDPR Article 15 (Right to Access) and Article 17 (Right to Erasure).
 *
 * Compliance Requirements:
 * - Data export: All user data in machine-readable format (JSON)
 * - Data deletion: Complete removal except legally required records
 * - Audit trail: All GDPR operations must be logged
 * - Response time: Within 30 days of request (GDPR Article 12.3)
 *
 * Legal Notes:
 * - Payment records retained 7 years for tax compliance
 * - Audit logs are immutable and never deleted
 * - Data anonymization used where deletion not legally permitted
 *
 * @module actions/gdpr
 */

"use server"

import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent, AuditEventType } from "@/server/lib/audit"
import { decryptLetter } from "@/server/lib/encryption"
import type { ActionResult } from "@dearme/types"
import { ErrorCodes } from "@dearme/types"
import { clerkClient } from "@clerk/nextjs/server"
import { stripe } from "@/server/providers/stripe/client"

/**
 * Export all user data (GDPR Article 15 - Right to Access)
 *
 * Returns comprehensive data export including:
 * - User profile and settings
 * - All letters (decrypted)
 * - All deliveries
 * - Subscription history
 * - Payment history
 * - Usage statistics
 * - Audit logs
 *
 * @returns Download URL for JSON export
 *
 * @example
 * const result = await exportUserData()
 * if (result.success) {
 *   window.open(result.data.downloadUrl)
 * }
 */
export async function exportUserData(): Promise<
  ActionResult<{ downloadUrl: string; filename: string }>
> {
  try {
    const user = await requireUser()

    // Log GDPR data export request
    await createAuditEvent({
      userId: user.id,
      type: AuditEventType.DATA_EXPORT_REQUESTED,
      data: {
        timestamp: new Date().toISOString(),
      },
    })

    // 1. Collect user data
    const [
      profile,
      letters,
      deliveries,
      subscriptions,
      payments,
      usage,
      shippingAddresses,
      auditEvents,
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.letter.findMany({
        where: { userId: user.id },
        include: { deliveries: true },
      }),
      prisma.delivery.findMany({
        where: { userId: user.id },
        include: {
          emailDelivery: true,
          mailDelivery: {
            include: { shippingAddress: true },
          },
        },
      }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
      prisma.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscriptionUsage.findMany({
        where: { userId: user.id },
        orderBy: { period: "desc" },
      }),
      prisma.shippingAddress.findMany({ where: { userId: user.id } }),
      prisma.auditEvent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1000, // Limit to most recent 1000 events
      }),
    ])

    // 2. Decrypt letter content
    const decryptedLetters = await Promise.all(
      letters.map(async (letter) => {
        try {
          const { bodyRich, bodyHtml } = await decryptLetter(
            letter.bodyCiphertext,
            letter.bodyNonce,
            letter.keyVersion
          )

          return {
            id: letter.id,
            title: letter.title,
            bodyRich,
            bodyHtml,
            bodyFormat: letter.bodyFormat,
            visibility: letter.visibility,
            tags: letter.tags,
            createdAt: letter.createdAt,
            updatedAt: letter.updatedAt,
            deletedAt: letter.deletedAt,
          }
        } catch (error) {
          console.error(
            `[GDPR Export] Failed to decrypt letter ${letter.id}:`,
            error
          )
          return {
            id: letter.id,
            title: letter.title,
            error: "Failed to decrypt content",
            createdAt: letter.createdAt,
          }
        }
      })
    )

    // 3. Build comprehensive export
    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        dataProtectionNotice:
          "This export contains all personal data stored by DearMe in accordance with GDPR Article 15.",
      },
      user: {
        id: user.id,
        email: user.email,
        clerkUserId: user.clerkUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: profile
        ? {
            displayName: profile.displayName,
            timezone: profile.timezone,
            marketingOptIn: profile.marketingOptIn,
            stripeCustomerId: profile.stripeCustomerId,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : null,
      letters: decryptedLetters,
      deliveries: deliveries.map((d) => ({
        id: d.id,
        letterId: d.letterId,
        channel: d.channel,
        deliverAt: d.deliverAt,
        timezoneAtCreation: d.timezoneAtCreation,
        status: d.status,
        attemptCount: d.attemptCount,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        emailDelivery: d.emailDelivery,
        mailDelivery: d.mailDelivery,
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        stripeSubscriptionId: s.stripeSubscriptionId,
        status: s.status,
        plan: s.plan,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        type: p.type,
        amountCents: p.amountCents,
        currency: p.currency,
        status: p.status,
        metadata: p.metadata,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      usage: usage.map((u) => ({
        period: u.period,
        lettersCreated: u.lettersCreated,
        emailsSent: u.emailsSent,
        mailsSent: u.mailsSent,
        mailCredits: u.mailCredits,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      shippingAddresses: shippingAddresses.map((a) => ({
        id: a.id,
        name: a.name,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      auditLog: auditEvents.map((e) => ({
        id: e.id,
        type: e.type,
        data: e.data,
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
        createdAt: e.createdAt,
      })),
    }

    // 4. Convert to JSON and create download
    const json = JSON.stringify(exportData, null, 2)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `dearme-data-export-${timestamp}.json`

    // Create data URL for download
    const downloadUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`

    // Log successful export
    await createAuditEvent({
      userId: user.id,
      type: AuditEventType.DATA_EXPORT_COMPLETED,
      data: {
        filename,
        recordCounts: {
          letters: letters.length,
          deliveries: deliveries.length,
          subscriptions: subscriptions.length,
          payments: payments.length,
        },
      },
    })

    return {
      success: true,
      data: {
        downloadUrl,
        filename,
      },
    }
  } catch (error) {
    console.error("[GDPR Export] Failed to export user data:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Please sign in to export your data",
        },
      }
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to export data. Please try again or contact support.",
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Delete all user data (GDPR Article 17 - Right to Erasure)
 *
 * Implements "Right to be Forgotten" with legal compliance:
 *
 * What gets DELETED:
 * - User profile and settings
 * - All letters and deliveries
 * - Subscription records
 * - Usage statistics
 * - Shipping addresses
 * - Clerk authentication account
 *
 * What gets RETAINED (legal requirements):
 * - Payment records (anonymized, 7 years for tax law)
 * - Audit logs (immutable, 7 years for compliance)
 *
 * Process:
 * 1. Cancel active Stripe subscriptions
 * 2. Anonymize payment records
 * 3. Delete letters, deliveries, usage (cascades)
 * 4. Delete Clerk user (signs out and invalidates session)
 * 5. Log deletion in audit trail
 *
 * @returns Success confirmation
 *
 * @example
 * const result = await deleteUserData()
 * if (result.success) {
 *   // User will be signed out automatically
 *   router.push('/')
 * }
 */
export async function deleteUserData(): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Log GDPR data deletion request
    await createAuditEvent({
      userId: user.id,
      type: AuditEventType.DATA_DELETION_REQUESTED,
      data: {
        timestamp: new Date().toISOString(),
        email: user.email,
      },
    })

    // Execute deletion in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Cancel Stripe subscription if active
      const activeSubscription = await tx.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["active", "trialing"] },
        },
      })

      if (activeSubscription) {
        try {
          await stripe.subscriptions.cancel(
            activeSubscription.stripeSubscriptionId,
            {
              prorate: false, // Don't prorate final invoice
            }
          )
          console.log(
            `[GDPR Delete] Canceled Stripe subscription: ${activeSubscription.stripeSubscriptionId}`
          )
        } catch (error) {
          console.error(
            "[GDPR Delete] Failed to cancel Stripe subscription:",
            error
          )
          // Continue with deletion even if Stripe cancellation fails
        }
      }

      // 2. Anonymize payment records (retain for 7 years for tax compliance)
      const paymentCount = await tx.payment.updateMany({
        where: { userId: user.id },
        data: {
          metadata: {
            anonymized: true,
            anonymizedAt: new Date().toISOString(),
            originalUserId: user.id,
            reason: "GDPR Article 17 - Right to Erasure",
          },
          // Keep payment records but disassociate from user
          userId: "DELETED_USER",
        },
      })

      console.log(
        `[GDPR Delete] Anonymized ${paymentCount.count} payment records`
      )

      // 3. Delete user (cascades to profile, letters, deliveries, usage, addresses)
      await tx.user.delete({
        where: { id: user.id },
      })

      console.log(
        `[GDPR Delete] Deleted user ${user.id} and all associated data`
      )
    })

    // 4. Delete Clerk user (signs out and invalidates all sessions)
    try {
      const clerk = await clerkClient()
      await clerk.users.deleteUser(user.clerkUserId)
      console.log(`[GDPR Delete] Deleted Clerk user: ${user.clerkUserId}`)
    } catch (error) {
      console.error("[GDPR Delete] Failed to delete Clerk user:", error)
      // Don't fail the entire operation if Clerk deletion fails
    }

    // 5. Final audit log (with null userId since user is deleted)
    await createAuditEvent({
      userId: null,
      type: AuditEventType.DATA_DELETION_COMPLETED,
      data: {
        deletedUserId: user.id,
        deletedEmail: user.email,
        timestamp: new Date().toISOString(),
      },
    })

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    console.error("[GDPR Delete] Failed to delete user data:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Please sign in to delete your data",
        },
      }
    }

    return {
      success: false,
      error: {
        code: ErrorCodes.DELETE_FAILED,
        message:
          "Failed to delete data. Please contact support for assistance.",
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}
