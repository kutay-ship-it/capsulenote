/**
 * Webhook Backstop Reconciler
 *
 * Runs every 5 minutes via Vercel Cron to detect and retry stuck webhook events.
 *
 * An event is considered "stuck" if:
 * - status = CLAIMED (not COMPLETED or FAILED)
 * - claimedAt > 5 minutes ago
 * - retryCount < MAX_RETRIES (3)
 *
 * SLO: < 0.1% of webhooks should require reconciliation
 *
 * @see workers/inngest/functions/billing/retry-stripe-webhook.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { validateCronSecret } from "@/server/lib/crypto-utils"

const STUCK_THRESHOLD_MINUTES = 5
const MAX_RETRIES = 3
const BATCH_SIZE = 50
const ALERT_THRESHOLD = 10 // Alert if more than 10 stuck events

export async function GET(request: NextRequest) {
  // Verify cron secret using constant-time comparison
  const authHeader = request.headers.get("authorization")
  if (!validateCronSecret(authHeader, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    const stuckThreshold = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000)

    // Find stuck webhook events (CLAIMED or PROCESSING but not completed for >5 minutes)
    // PROCESSING events can get stuck if the handler crashes mid-execution
    const stuckEvents = await prisma.webhookEvent.findMany({
      where: {
        status: { in: ["CLAIMED", "PROCESSING"] },
        claimedAt: { lt: stuckThreshold },
        retryCount: { lt: MAX_RETRIES },
      },
      orderBy: { claimedAt: "asc" },
      take: BATCH_SIZE,
    })

    if (stuckEvents.length === 0) {
      console.log("[Webhook Reconciler] No stuck events found")
      return NextResponse.json({
        success: true,
        message: "No stuck webhooks found",
        reconciled: 0,
        total: 0,
        durationMs: Date.now() - startTime,
      })
    }

    // Alert if too many stuck events
    if (stuckEvents.length > ALERT_THRESHOLD) {
      console.error("[Webhook Reconciler] HIGH STUCK EVENT COUNT - investigate primary system", {
        count: stuckEvents.length,
        threshold: ALERT_THRESHOLD,
        oldestClaimedAt: stuckEvents[0]?.claimedAt,
      })

      // Create system audit event for alerting
      await createAuditEvent({
        userId: null,
        type: "system.webhook_reconciler_high_volume",
        data: {
          count: stuckEvents.length,
          threshold: ALERT_THRESHOLD,
          oldestClaimedAt: stuckEvents[0]?.claimedAt,
        },
      })
    }

    let reconciledCount = 0
    const errors: Array<{ eventId: string; error: string }> = []
    const results: Array<{ eventId: string; status: string; inngestEventId?: string }> = []

    for (const event of stuckEvents) {
      // Atomically increment retry count and reset status to CLAIMED for retry (optimistic locking)
      const updated = await prisma.webhookEvent.updateMany({
        where: {
          id: event.id,
          status: { in: ["CLAIMED", "PROCESSING"] },
          retryCount: event.retryCount, // Optimistic lock - prevents race condition
        },
        data: {
          retryCount: { increment: 1 },
          status: "CLAIMED", // Reset to CLAIMED for retry
        },
      })

      if (updated.count === 0) {
        // Another process already handling this event
        results.push({
          eventId: event.id,
          status: "skipped",
        })
        continue
      }

      // Re-queue to Inngest with retry metadata
      try {
        const inngestEventId = await triggerInngestEvent("stripe/webhook.retry", {
          event: event.data,
          webhookEventId: event.id,
          retryCount: event.retryCount + 1,
        })

        reconciledCount++

        results.push({
          eventId: event.id,
          status: "re-queued",
          inngestEventId,
        })

        console.log("[Webhook Reconciler] Re-queued stuck event", {
          eventId: event.id,
          eventType: event.type,
          retryCount: event.retryCount + 1,
          stuckDurationMinutes: Math.round(
            (Date.now() - new Date(event.claimedAt).getTime()) / 60000
          ),
        })

        // Create audit event for tracking
        await createAuditEvent({
          userId: null,
          type: "webhook.reconciled",
          data: {
            webhookEventId: event.id,
            eventType: event.type,
            retryCount: event.retryCount + 1,
            inngestEventId,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        errors.push({ eventId: event.id, error: errorMessage })

        results.push({
          eventId: event.id,
          status: "error",
        })

        console.error("[Webhook Reconciler] Failed to re-queue event", {
          eventId: event.id,
          error: errorMessage,
        })
      }
    }

    // Mark events that exceeded retry limit as FAILED (includes stuck PROCESSING events)
    const failedCount = await prisma.webhookEvent.updateMany({
      where: {
        status: { in: ["CLAIMED", "PROCESSING"] },
        retryCount: { gte: MAX_RETRIES },
      },
      data: {
        status: "FAILED",
        error: `Exceeded maximum retry attempts (${MAX_RETRIES})`,
      },
    })

    if (failedCount.count > 0) {
      console.error("[Webhook Reconciler] Events marked as FAILED after max retries", {
        count: failedCount.count,
      })

      // These need manual investigation - create audit event
      await createAuditEvent({
        userId: null,
        type: "system.webhook_max_retries_exceeded",
        data: {
          count: failedCount.count,
          maxRetries: MAX_RETRIES,
        },
      })
    }

    // Calculate reconciliation rate for SLO monitoring (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const totalProcessed = await prisma.webhookEvent.count({
      where: {
        claimedAt: { gte: oneDayAgo },
      },
    })

    const reconciliationRate = totalProcessed > 0
      ? (reconciledCount / totalProcessed) * 100
      : 0

    // Alert if reconciliation rate exceeds SLO (0.1%)
    if (reconciliationRate > 0.1) {
      console.error("[Webhook Reconciler] SLO BREACH - reconciliation rate too high", {
        reconciliationRate: `${reconciliationRate.toFixed(4)}%`,
        target: "< 0.1%",
        reconciledCount,
        totalProcessed,
      })
    }

    console.log("[Webhook Reconciler] Reconciliation complete", {
      reconciled: reconciledCount,
      total: stuckEvents.length,
      failed: failedCount.count,
      errors: errors.length,
      reconciliationRate: `${reconciliationRate.toFixed(4)}%`,
      sloTarget: "< 0.1%",
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({
      success: true,
      message: `Reconciled ${reconciledCount} stuck webhooks`,
      reconciled: reconciledCount,
      total: stuckEvents.length,
      failed: failedCount.count,
      errors: errors.length > 0 ? errors : undefined,
      reconciliationRate: `${reconciliationRate.toFixed(4)}%`,
      durationMs: Date.now() - startTime,
    })
  } catch (error) {
    console.error("[Webhook Reconciler] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
