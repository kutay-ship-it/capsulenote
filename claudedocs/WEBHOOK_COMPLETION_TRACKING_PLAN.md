# Webhook Completion Tracking System Plan

## Problem Statement

The current idempotency pattern creates the `webhookEvent` record BEFORE processing completes. If the `process-event` step fails, the event is marked as "claimed" but never actually processed. Subsequent webhook deliveries get deduplicated (P2002 unique constraint), leaving the event permanently stuck.

### Current Flow (Broken)
```
1. claim-idempotency: CREATE webhookEvent (processedAt = now())
2. process-event: Run handler
3. If step 2 fails → webhookEvent exists → future retries blocked → STUCK
```

### Proposed Flow (Fixed)
```
1. claim-idempotency: CREATE webhookEvent (status = CLAIMED, processedAt = null)
2. process-event: Run handler
3. mark-complete: UPDATE webhookEvent (status = COMPLETED, processedAt = now())
4. If step 2 fails → webhookEvent.status = CLAIMED → backstop detects → retries
```

---

## Schema Changes

### File: `packages/prisma/schema.prisma`

```prisma
// NEW: Webhook processing status enum
enum WebhookStatus {
  CLAIMED     // Idempotency claimed, processing started
  COMPLETED   // Successfully processed
  FAILED      // Processing failed (after retries exhausted)
}

model WebhookEvent {
  id          String        @id                    // Stripe event ID (unique)
  type        String                               // Event type (e.g., "checkout.session.completed")
  data        Json                                 // Full Stripe event payload
  status      WebhookStatus @default(CLAIMED)      // NEW: Processing state
  claimedAt   DateTime      @default(now())        // NEW: When idempotency claimed
  processedAt DateTime?                            // CHANGED: Nullable, set on completion
  error       String?                              // NEW: Error message if failed
  retryCount  Int           @default(0)            // NEW: Backstop retry attempts
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status, claimedAt])                     // NEW: For backstop queries
}
```

### Migration SQL
```sql
-- Add new columns
ALTER TABLE "WebhookEvent" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'CLAIMED';
ALTER TABLE "WebhookEvent" ADD COLUMN "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "WebhookEvent" ADD COLUMN "error" TEXT;
ALTER TABLE "WebhookEvent" ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;

-- Make processedAt nullable
ALTER TABLE "WebhookEvent" ALTER COLUMN "processedAt" DROP NOT NULL;

-- Backfill existing records as COMPLETED
UPDATE "WebhookEvent" SET status = 'COMPLETED', claimedAt = "processedAt" WHERE "processedAt" IS NOT NULL;

-- Add index for backstop queries
CREATE INDEX "WebhookEvent_status_claimedAt_idx" ON "WebhookEvent"("status", "claimedAt");
```

---

## Inngest Function Changes

### File: `workers/inngest/functions/billing/process-stripe-webhook.ts`

```typescript
export const processStripeWebhook = inngest.createFunction(
  {
    id: "process-stripe-webhook",
    name: "Process Stripe Webhook",
    retries: 3,
    onFailure: async ({ event, error }) => {
      // Handle duplicate detection (not a real failure)
      if (error.message?.includes("already processed") ||
          error.message?.includes("backstop will retry")) {
        console.log("[Webhook Processor] Expected deduplication", {
          eventId: event.data?.event?.id,
        })
        return
      }

      const stripeEvent = (event.data as unknown as { event: Stripe.Event }).event

      // Mark as FAILED in webhookEvent table
      await prisma.webhookEvent.updateMany({
        where: { id: stripeEvent?.id, status: "CLAIMED" },
        data: {
          status: "FAILED",
          error: `${error.message}\n\nStack:\n${error.stack}`,
        },
      })

      // Move to DLQ
      await prisma.failedWebhook.create({
        data: {
          eventId: stripeEvent?.id ?? "unknown",
          eventType: stripeEvent?.type ?? "unknown",
          payload: stripeEvent as any,
          error: `${error.message}\n\nStack:\n${error.stack}`,
        },
      })

      console.error("[Webhook Processor] Processing failed, moved to DLQ", {
        eventId: stripeEvent?.id,
      })
    },
  },
  { event: "stripe/webhook.received" },
  async ({ event, step }) => {
    const stripeEvent = event.data.event as Stripe.Event

    // Step 1: Claim idempotency (status = CLAIMED, not COMPLETED)
    await step.run("claim-idempotency", async () => {
      try {
        await prisma.webhookEvent.create({
          data: {
            id: stripeEvent.id,
            type: stripeEvent.type,
            data: stripeEvent as any,
            status: "CLAIMED",        // NOT completed yet
            claimedAt: new Date(),
            processedAt: null,        // Will be set on completion
          },
        })

        console.log("[Webhook Processor] Idempotency claimed", {
          eventId: stripeEvent.id,
        })
      } catch (error: any) {
        if (error?.code === 'P2002') {
          // Check if already COMPLETED vs still CLAIMED
          const existing = await prisma.webhookEvent.findUnique({
            where: { id: stripeEvent.id },
            select: { status: true, claimedAt: true, retryCount: true }
          })

          if (existing?.status === "COMPLETED") {
            throw new NonRetriableError(
              `Event ${stripeEvent.id} already processed - duplicate delivery detected`
            )
          }

          if (existing?.status === "FAILED") {
            throw new NonRetriableError(
              `Event ${stripeEvent.id} previously failed - check DLQ`
            )
          }

          // Status is CLAIMED but not completed
          // Could be: (a) still processing, (b) stuck
          // Let backstop handle stuck events - don't retry here
          throw new NonRetriableError(
            `Event ${stripeEvent.id} claimed but not completed - backstop will retry if stuck`
          )
        }
        throw error
      }
    })

    // Step 2: Process event
    await step.run("process-event", async () => {
      await routeWebhookEvent(stripeEvent)

      console.log("[Webhook Processor] Event processed", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
      })
    })

    // Step 3: Mark complete (NEW - critical step)
    await step.run("mark-complete", async () => {
      await prisma.webhookEvent.update({
        where: { id: stripeEvent.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      })

      console.log("[Webhook Processor] Event marked complete", {
        eventId: stripeEvent.id,
      })
    })

    return {
      message: "Webhook processed successfully",
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    }
  }
)
```

---

## New Backstop Reconciler

### File: `apps/web/app/api/cron/reconcile-webhooks/route.ts`

```typescript
/**
 * Webhook Backstop Reconciler
 *
 * Runs every 5 minutes to detect and retry stuck webhook events.
 *
 * An event is considered "stuck" if:
 * - status = CLAIMED (not COMPLETED or FAILED)
 * - claimedAt > 5 minutes ago
 * - retryCount < MAX_RETRIES (3)
 *
 * SLO: < 0.1% of webhooks should require reconciliation
 */

import { NextResponse } from "next/server"
import { prisma } from "@/server/lib/db"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"
import { env } from "@/env.mjs"

const STUCK_THRESHOLD_MINUTES = 5
const MAX_RETRIES = 3
const BATCH_SIZE = 50
const ALERT_THRESHOLD = 10  // Alert if more than 10 stuck events

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const startTime = Date.now()

  // Find stuck webhook events
  const stuckEvents = await prisma.webhookEvent.findMany({
    where: {
      status: "CLAIMED",
      claimedAt: {
        lt: new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000)
      },
      retryCount: { lt: MAX_RETRIES }
    },
    orderBy: { claimedAt: "asc" },
    take: BATCH_SIZE,
  })

  if (stuckEvents.length === 0) {
    console.log("[Webhook Reconciler] No stuck events found")
    return NextResponse.json({
      reconciled: 0,
      total: 0,
      durationMs: Date.now() - startTime
    })
  }

  // Alert if too many stuck events
  if (stuckEvents.length > ALERT_THRESHOLD) {
    console.error("[Webhook Reconciler] HIGH STUCK EVENT COUNT - investigate primary system", {
      count: stuckEvents.length,
      threshold: ALERT_THRESHOLD,
      oldestClaimedAt: stuckEvents[0]?.claimedAt,
    })
    // TODO: Send Slack/PagerDuty alert
  }

  let reconciledCount = 0
  const errors: Array<{ eventId: string; error: string }> = []

  for (const event of stuckEvents) {
    // Atomically increment retry count (optimistic locking)
    const updated = await prisma.webhookEvent.updateMany({
      where: {
        id: event.id,
        status: "CLAIMED",
        retryCount: event.retryCount,  // Optimistic lock
      },
      data: {
        retryCount: { increment: 1 },
      },
    })

    if (updated.count === 0) {
      // Another process already handling this event
      continue
    }

    // Re-queue to Inngest with retry metadata
    try {
      await triggerInngestEvent("stripe/webhook.retry", {
        event: event.data,
        webhookEventId: event.id,
        retryCount: event.retryCount + 1,
      })

      reconciledCount++

      console.log("[Webhook Reconciler] Re-queued stuck event", {
        eventId: event.id,
        eventType: event.type,
        retryCount: event.retryCount + 1,
        stuckDurationMinutes: Math.round(
          (Date.now() - new Date(event.claimedAt).getTime()) / 60000
        ),
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push({ eventId: event.id, error: errorMessage })

      console.error("[Webhook Reconciler] Failed to re-queue event", {
        eventId: event.id,
        error: errorMessage,
      })
    }
  }

  // Mark events that exceeded retry limit as FAILED
  const failedCount = await prisma.webhookEvent.updateMany({
    where: {
      status: "CLAIMED",
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
    // TODO: Alert - these need manual investigation
  }

  // Calculate reconciliation rate for SLO monitoring
  const totalProcessed = await prisma.webhookEvent.count({
    where: {
      claimedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)  // Last 24 hours
      }
    }
  })

  const reconciliationRate = totalProcessed > 0
    ? (reconciledCount / totalProcessed) * 100
    : 0

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
    reconciled: reconciledCount,
    total: stuckEvents.length,
    failed: failedCount.count,
    errors,
    reconciliationRate: `${reconciliationRate.toFixed(4)}%`,
    durationMs: Date.now() - startTime,
  })
}
```

---

## New Retry Handler

### File: `workers/inngest/functions/billing/retry-stripe-webhook.ts`

```typescript
/**
 * Retry Stripe Webhook Handler
 *
 * Processes webhooks that were re-queued by the backstop reconciler.
 * Separate from primary handler to:
 * - Have different retry policy (fewer retries)
 * - Skip idempotency claim (already claimed)
 * - Include retry-specific logging
 */

import { inngest } from "../../client"
import { prisma } from "@dearme/prisma"
import Stripe from "stripe"
import { routeWebhookEvent } from "./handlers"

export const retryStripeWebhook = inngest.createFunction(
  {
    id: "retry-stripe-webhook",
    name: "Retry Stripe Webhook",
    retries: 2,  // Fewer retries for reconciled events
    onFailure: async ({ event, error }) => {
      const webhookEventId = event.data?.webhookEventId as string

      if (webhookEventId) {
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: "FAILED",
            error: `Retry failed: ${error.message}`,
          },
        })
      }

      console.error("[Webhook Retry] Retry failed, marked as FAILED", {
        webhookEventId,
        error: error.message,
      })
    },
  },
  { event: "stripe/webhook.retry" },
  async ({ event, step }) => {
    const stripeEvent = event.data.event as Stripe.Event
    const webhookEventId = event.data.webhookEventId as string
    const retryCount = event.data.retryCount as number

    console.log("[Webhook Retry] Processing stuck webhook", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      webhookEventId,
      retryCount,
    })

    // Step 1: Verify still needs processing
    const existing = await step.run("verify-needs-retry", async () => {
      return prisma.webhookEvent.findUnique({
        where: { id: webhookEventId },
        select: { status: true }
      })
    })

    if (!existing) {
      console.warn("[Webhook Retry] WebhookEvent record not found", { webhookEventId })
      return { skipped: true, reason: "record_not_found" }
    }

    if (existing.status === "COMPLETED") {
      console.log("[Webhook Retry] Already completed by another process", {
        webhookEventId,
      })
      return { skipped: true, reason: "already_completed" }
    }

    if (existing.status === "FAILED") {
      console.log("[Webhook Retry] Already marked as failed", { webhookEventId })
      return { skipped: true, reason: "already_failed" }
    }

    // Step 2: Process event (same handler as primary)
    await step.run("process-event", async () => {
      await routeWebhookEvent(stripeEvent)

      console.log("[Webhook Retry] Event processed", {
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
      })
    })

    // Step 3: Mark complete
    await step.run("mark-complete", async () => {
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      })

      console.log("[Webhook Retry] Event marked complete", {
        webhookEventId,
        retryCount,
      })
    })

    return {
      success: true,
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      retryCount,
    }
  }
)
```

---

## Cron Configuration

### File: `vercel.json` (update)

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-deliveries",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/reconcile-webhooks",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Export Updates

### File: `workers/inngest/functions/billing/index.ts`

```typescript
export { processStripeWebhook } from "./process-stripe-webhook"
export { retryStripeWebhook } from "./retry-stripe-webhook"  // NEW
// ... other exports
```

### File: `workers/inngest/functions/index.ts`

```typescript
import { processStripeWebhook, retryStripeWebhook } from "./billing"
// ...

export const functions = [
  processStripeWebhook,
  retryStripeWebhook,  // NEW
  // ... other functions
]
```

---

## Implementation Checklist

- [ ] 1. Create Prisma migration for schema changes
- [ ] 2. Run migration on development database
- [ ] 3. Update `process-stripe-webhook.ts` with three-step flow
- [ ] 4. Create `retry-stripe-webhook.ts`
- [ ] 5. Update exports in `billing/index.ts` and `functions/index.ts`
- [ ] 6. Create `reconcile-webhooks/route.ts`
- [ ] 7. Update `vercel.json` with new cron job
- [ ] 8. Test locally:
   - [ ] Simulate stuck event by killing worker mid-processing
   - [ ] Verify backstop detects and retries
   - [ ] Verify completion marking works
- [ ] 9. Deploy to staging
- [ ] 10. Run backfill migration for existing records
- [ ] 11. Monitor reconciliation rate (target < 0.1%)
- [ ] 12. Deploy to production

---

## Metrics & Monitoring

### Key Metrics
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Reconciliation rate | < 0.1% | > 0.5% |
| Stuck events per run | 0-2 | > 10 |
| Retry success rate | > 95% | < 80% |
| FAILED events per day | 0 | > 5 |

### Log Queries (for observability)
```
# Find stuck events
"[Webhook Reconciler]" AND "Re-queued stuck event"

# Find failed retries
"[Webhook Retry]" AND "Retry failed"

# High stuck count alerts
"[Webhook Reconciler]" AND "HIGH STUCK EVENT COUNT"
```

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate**: Disable cron job in Vercel dashboard
2. **Code rollback**: Revert to previous `process-stripe-webhook.ts` (will lose completion tracking)
3. **Data fix**: Update all CLAIMED events to COMPLETED if they have processedAt set:
   ```sql
   UPDATE "WebhookEvent"
   SET status = 'COMPLETED'
   WHERE status = 'CLAIMED' AND "processedAt" IS NOT NULL;
   ```

---

## Estimated Effort

| Component | Lines of Code | Complexity |
|-----------|---------------|------------|
| Schema changes | ~15 | Low |
| Migration + backfill | ~20 | Low |
| process-stripe-webhook.ts changes | ~40 | Medium |
| retry-stripe-webhook.ts (new) | ~80 | Medium |
| reconcile-webhooks/route.ts (new) | ~120 | Medium |
| Export updates | ~10 | Low |
| **Total** | **~285** | **Medium** |

Estimated implementation time: 2-3 hours
