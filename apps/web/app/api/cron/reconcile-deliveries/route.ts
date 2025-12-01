import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { validateCronSecret } from "@/server/lib/crypto-utils"

/**
 * Backstop reconciler for stuck deliveries
 * Runs every 5 minutes via Vercel Cron
 * Finds deliveries that should have been processed but weren't
 */
export async function GET(request: NextRequest) {
  // Verify cron secret using constant-time comparison (prevents timing attacks)
  const authHeader = request.headers.get("authorization")
  if (!validateCronSecret(authHeader, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find deliveries that are stuck
    // Status is 'scheduled' but deliver_at is in the past (>5 min ago)
    // AND either inngest_run_id is null OR we haven't attempted in >1 hour
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const stuckDeliveries = await prisma.$queryRaw<Array<{
      id: string
      deliver_at: Date
      attempt_count: number
    }>>`
      SELECT id, deliver_at, attempt_count
      FROM deliveries
      WHERE status = 'scheduled'
        AND deliver_at < ${fiveMinutesAgo}
        AND (
          inngest_run_id IS NULL
          OR updated_at < NOW() - INTERVAL '1 hour'
        )
      ORDER BY deliver_at ASC, attempt_count ASC
      LIMIT 100
      FOR UPDATE SKIP LOCKED
    `

    if (stuckDeliveries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stuck deliveries found",
        count: 0,
      })
    }

    // Log warning if we're seeing too many stuck deliveries
    if (stuckDeliveries.length > 10) {
      console.warn(`⚠️ Backstop found ${stuckDeliveries.length} stuck deliveries - investigate!`)

      // Create system audit event
      await createAuditEvent({
        userId: null,
        type: "system.reconciler_high_volume",
        data: {
          count: stuckDeliveries.length,
          threshold: 10,
        },
      })
    }

    // Re-enqueue each delivery by triggering Inngest jobs
    // Process each in a transaction to prevent race conditions with concurrent cron runs
    const results = []

    for (const delivery of stuckDeliveries) {
      try {
        // Use transaction to atomically update and re-enqueue
        // This prevents duplicate re-enqueues if cron runs again before completion
        const eventId = await prisma.$transaction(async (tx) => {
          // Re-check that delivery is still stuck (might have been processed by another cron run)
          const current = await tx.delivery.findUnique({
            where: { id: delivery.id },
            select: { status: true, updatedAt: true },
          })

          // Skip if status changed or was recently updated (processed by concurrent run)
          const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
          if (!current || current.status !== "scheduled" || current.updatedAt > oneMinuteAgo) {
            return null // Skip - already being processed
          }

          // Mark as being reconciled BEFORE triggering Inngest
          // This prevents duplicate re-enqueues from concurrent cron runs
          await tx.delivery.update({
            where: { id: delivery.id },
            data: {
              attemptCount: { increment: 1 },
              updatedAt: new Date(),
            },
          })

          // Trigger Inngest job (outside transaction would be better for atomicity,
          // but we've already marked the record to prevent duplicates)
          const inngestEventId = await triggerInngestEvent("delivery.scheduled", {
            deliveryId: delivery.id
          })

          // Store the event ID for correlation
          if (inngestEventId) {
            await tx.delivery.update({
              where: { id: delivery.id },
              data: { inngestRunId: inngestEventId },
            })
          }

          return inngestEventId
        })

        if (eventId === null) {
          results.push({
            deliveryId: delivery.id,
            status: "skipped",
            reason: "already_processing",
          })
          continue
        }

        results.push({
          deliveryId: delivery.id,
          status: "re-enqueued",
          eventId,
        })

        // Log audit event (non-blocking)
        await createAuditEvent({
          userId: null,
          type: "delivery.reconciled",
          data: {
            deliveryId: delivery.id,
            deliverAt: delivery.deliver_at,
            attemptCount: delivery.attempt_count + 1,
            eventId,
          },
        })
      } catch (error) {
        console.error(`Failed to reconcile delivery ${delivery.id}:`, error)
        results.push({
          deliveryId: delivery.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Calculate reconciliation rate for monitoring
    const reconciliationRate = (stuckDeliveries.length / 100) * 100 // Assuming ~100 deliveries/period

    // Alert if reconciliation rate is > 0.1%
    if (reconciliationRate > 0.1) {
      console.error(`❌ Reconciliation rate too high: ${reconciliationRate}% - SLO breach!`)
    }

    return NextResponse.json({
      success: true,
      message: `Reconciled ${stuckDeliveries.length} stuck deliveries`,
      count: stuckDeliveries.length,
      results,
      reconciliationRate: `${reconciliationRate.toFixed(3)}%`,
    })
  } catch (error) {
    console.error("Reconciler error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
