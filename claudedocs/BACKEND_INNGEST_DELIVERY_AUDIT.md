# Backend & Inngest Delivery System Audit Report

**Date:** 2025-11-27
**Scope:** Scheduled letter delivery infrastructure, safety nets, and failure recovery
**Auditor:** Claude Code (Opus 4.5)

---

## Executive Summary

The Capsule Note delivery system uses a **dual-layer architecture**:
1. **Primary:** Inngest durable workflows for scheduled email delivery
2. **Backup:** Vercel Cron backstop reconciler (runs every 5 minutes)

**Overall Assessment:** The architecture is **well-designed with robust safety nets** for most failure scenarios. However, **11 gaps** were identified across observability, resilience, and edge-case handling.

| Category | Score | Notes |
|----------|-------|-------|
| Inngest Integration | ✅ Excellent | Durable, retryable, step-based |
| Database Resilience | ⚠️ Good | Missing pool/circuit breaker |
| Email Provider Failover | ✅ Excellent | Dual provider with smart retry |
| Backstop Reconciler | ⚠️ Has gaps | No backup, depends on Inngest |
| Race Condition Prevention | ⚠️ Moderate gap | Idempotency key issue |
| User Notification | ❌ Missing | No failure alerts to users |
| Observability | ⚠️ Gaps | Event ID vs Run ID confusion |
| Inngest Outage Handling | ⚠️ Gaps | No offline queue/fallback |

---

## Architecture Overview

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER SCHEDULES DELIVERY                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    scheduleDelivery() Server Action                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Validate   │→ │  Reserve    │→ │   Create    │→ │  Trigger    │   │
│  │   Input     │  │  Credits    │  │  Delivery   │  │  Inngest    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘   │
│                                                            │           │
│  ┌─────────────────────────────────────────────────────────┴────────┐  │
│  │ If Inngest fails → DELETE delivery + REFUND credits             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ Event: "delivery.scheduled"
┌─────────────────────────────────────────────────────────────────────────┐
│                        INNGEST CLOUD (External)                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    deliverEmail() Function                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │   │
│  │  │ Fetch   │→ │ Sleep   │→ │ Decrypt │→ │  Send   │→ │Update │ │   │
│  │  │Delivery │  │ Until   │  │ Letter  │  │ Email   │  │Status │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │   │
│  │                                              │                   │   │
│  │  Retries: 5 attempts with exponential backoff │                   │   │
│  │  Fallback: Resend → Postmark                  │                   │   │
│  └───────────────────────────────────────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
          ┌──────────────────────┴──────────────────────┐
          │                                             │
          ▼ Success                                     ▼ Failure
┌─────────────────────┐                    ┌─────────────────────────┐
│  status = 'sent'    │                    │  status = 'failed'      │
│  + AuditEvent       │                    │  + DeliveryAttempt      │
│  + Push notification│                    │  + AuditEvent           │
└─────────────────────┘                    └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKSTOP RECONCILER (Every 5 min)                    │
│                    /api/cron/reconcile-deliveries                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Query: SELECT * FROM deliveries WHERE                            │   │
│  │        status = 'scheduled'                                      │   │
│  │        AND deliver_at < NOW() - 5 minutes                        │   │
│  │        AND (inngest_run_id IS NULL OR updated_at < NOW() - 1hr) │   │
│  │        FOR UPDATE SKIP LOCKED                                    │   │
│  │        LIMIT 100                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ For each stuck delivery → Re-trigger Inngest event              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### What Backend (Next.js) Handles

Backend (Next.js server actions) owns validation/authorization, entitlements, credit reservation, delivery row creation, and audit logging. The `scheduleDelivery` action rolls back the DB if anything fails before Inngest accepts the job.

| Responsibility | Location | Lines | Description |
|----------------|----------|-------|-------------|
| Validation & Authorization | `server/actions/deliveries.ts` | 34-56, 224-246 | Input validation, user ownership checks |
| Entitlements Check | `server/actions/deliveries.ts` | 84-222 | Subscription & credit verification |
| Credit Reservation | `server/actions/deliveries.ts` | 248-294 | Reserve before create, refund on failure |
| Delivery Creation | `server/actions/deliveries.ts` | 296-365 | Atomic transaction with channel-specific records |
| Inngest Trigger | `server/actions/deliveries.ts` | 367-411 | Rollback delivery if Inngest fails |
| Audit Logging | `server/actions/deliveries.ts` | 414-423 | Creates audit events for all operations |
| Backstop Cron | `api/cron/reconcile-deliveries/` | 6-136 | Catches stuck deliveries every 5 min |
| Email Providers | `server/providers/email/` | - | Resend (primary) + Postmark (fallback) |

**Key Safety Feature:** If Inngest `send()` fails, the delivery record is deleted and credits are refunded. User sees a service-unavailable error instead of a "scheduled" phantom delivery.

```typescript
// apps/web/server/actions/deliveries.ts:387-411
} catch (inngestError) {
  // CRITICAL: If Inngest fails, rollback the delivery
  await prisma.delivery.delete({ where: { id: delivery.id } })
  if (reservedChannel) {
    await refundReservedCredit()
  }
  return { success: false, error: { code: ErrorCodes.SERVICE_UNAVAILABLE, ... } }
}
```

### What Inngest Handles

Inngest is the **only scheduler/worker**. The Next.js API route registers delivery/billing functions and serves the Inngest endpoint. All delivery processing happens entirely in the worker: wait-until logic, status transitions, decryption, email provider selection/fallback, and audit attempts.

| Responsibility | Location | Lines | Description |
|----------------|----------|-------|-------------|
| Function Registration | `apps/web/app/api/inngest/route.ts` | 1-26 | Registers all Inngest functions |
| Durable Scheduling | `workers/inngest/functions/deliver-email.ts` | 275 | `step.sleepUntil()` for future delivery |
| State Refresh | `workers/inngest/functions/deliver-email.ts` | 279-332 | Re-checks state after sleep, handles cancel/reschedule |
| Decryption | `workers/inngest/functions/deliver-email.ts` | 368-418 | Fetches fresh encrypted data, decrypts |
| Email Send | `workers/inngest/functions/deliver-email.ts` | 421-585 | Primary + fallback provider with idempotency |
| Status Update | `workers/inngest/functions/deliver-email.ts` | 588-658 | Transaction: delivery + attempt + audit |
| Retry Logic | Inngest config | 120-161 | 5 retries with exponential backoff |
| Failure Handling | `workers/inngest/functions/deliver-email.ts` | 126-160 | `onFailure` marks delivery failed |
| Error Classification | `workers/inngest/lib/errors.ts` | 52-244 | Retryable vs non-retryable errors |

**Worker Safety Features:**
- Double-checks state before sending: refresh after `sleepUntil`, aborts on cancellation, adjusts to reschedules
- Non-blocking notifications: confirmation email trigger failures are logged but don't affect the main schedule path

---

## Failure Scenario Analysis

### Scenario 1: Complete Inngest Outage

**Risk Level:** 🟢 LOW (Handled)

**During Scheduling:**
- `inngest.send()` throws error
- `scheduleDelivery()` catches at line 387-412
- Delivery record is DELETED (rollback)
- Credits are REFUNDED
- User sees: "Failed to schedule delivery. Please try again."

**During Sleep (already scheduled):**
- Inngest function never wakes up
- Backstop reconciler catches delivery after 5+ minutes past `deliver_at`
- Re-enqueues to Inngest (or catches when Inngest recovers)

**Verdict:** ✅ HANDLED - Both scheduling and execution phases have safety nets.

---

### Scenario 2: Database Connection Lost

**Risk Level:** 🟡 MEDIUM (Mostly handled)

**During Scheduling:**
```typescript
// apps/web/server/actions/deliveries.ts:297-365
delivery = await prisma.$transaction(async (tx) => {
  // If this fails, entire transaction rolls back
})
// If fails → refundReservedCredit() is called
```

**During Inngest Execution:**
- Each DB operation uses `classifyDatabaseError()`
- Connection errors → `DatabaseConnectionError` (retryable)
- Inngest retries up to 5 times

**During Backstop:**
- Raw query fails → HTTP 500
- Vercel Cron marks job as failed
- Next run in 5 minutes retries

**Gap:** Extended DB outage (>1 hour) causes delivery delays but no data loss.

**Verdict:** ✅ HANDLED for temporary outages, ⚠️ DELAYS for extended outages.

---

### Scenario 3: Email Provider Outage

**Risk Level:** 🟢 LOW (Excellent handling)

**Failover Chain:**
```
Resend (primary) → fails → Postmark (fallback) → fails → retry with backoff
```

**Code Location:** `workers/inngest/functions/deliver-email.ts:421-585`

**Error Classification:**
| Error Type | Retryable | Action |
|------------|-----------|--------|
| Network errors | Yes | Retry with backoff |
| Rate limit (429) | Yes | Retry with backoff |
| Timeout (408/504) | Yes | Retry with backoff |
| Server error (5xx) | Yes | Retry with backoff |
| Client error (4xx) | No | Mark as failed |
| Invalid email | No | Mark as failed |

**Verdict:** ✅ EXCELLENT - Dual provider with intelligent retry logic.

---

### Scenario 4: Inngest Event Lost in Transit

**Risk Level:** 🟢 LOW (Handled)

Even if `inngest.send()` returns success but the event is lost:
- Delivery record exists with `status='scheduled'`
- After `deliver_at` + 5 minutes passes, backstop query finds it
- Condition: `inngest_run_id IS NULL OR updated_at < NOW() - 1 hour`
- Re-enqueues the delivery

**Verdict:** ✅ HANDLED - Backstop catches orphaned deliveries.

---

### Scenario 5: Backstop Reconciler Fails ⚠️ GAP

**Risk Level:** 🔴 HIGH (Unhandled)

**Failure Modes:**
1. `CRON_SECRET` not set → 401 silently fails
2. Vercel Cron service outage → reconciler never runs
3. Code exception → 500 error, cron retries but may keep failing

**Current Alerting:**
```typescript
// apps/web/app/api/cron/reconcile-deliveries/route.ts:52-65
if (stuckDeliveries.length > 10) {
  console.warn(`⚠️ Backstop found ${stuckDeliveries.length} stuck deliveries`)
  await createAuditEvent({ type: "system.reconciler_high_volume", ... })
}
```

**Problem:** AuditEvent is in the database - no external alerting!

**Impact:** If backstop fails AND Inngest has issues, deliveries remain stuck indefinitely.

**Verdict:** ❌ GAP - No backup for the backup. Single point of failure.

---

### Scenario 6: Race Condition - Duplicate Sends ⚠️ GAP

**Risk Level:** 🟡 MEDIUM (Partial handling)

**The Problem:**

Current idempotency key format:
```typescript
// workers/inngest/functions/deliver-email.ts:422
const idempotencyKey = `delivery-${deliveryId}-attempt-${delivery.attemptCount}`
```

**Race Condition Scenario:**
1. Inngest is retrying delivery (attempt 3) - takes longer than expected
2. Backstop runs, sees delivery as stuck (updated_at > 1 hour)
3. Backstop increments attemptCount and re-enqueues (now attempt 4)
4. BOTH jobs run:
   - Original retry: `delivery-XXX-attempt-3` → sends email
   - Backstop job: `delivery-XXX-attempt-4` → sends email
5. **Result: User receives duplicate emails**

**Why Current Protections Fail:**
- `FOR UPDATE SKIP LOCKED` only prevents concurrent reconciler runs
- Doesn't prevent Inngest-vs-reconciler race
- Different idempotency keys mean provider accepts both

**Verdict:** ⚠️ GAP - Rare but possible duplicate sends.

---

### Scenario 7: User Not Notified of Failures ⚠️ GAP

**Risk Level:** 🟡 MEDIUM (Missing feature)

When a delivery permanently fails (after 5 retries):
```typescript
// workers/inngest/functions/deliver-email.ts:73-118
async function markDeliveryFailed(...) {
  await prisma.$transaction([
    prisma.delivery.update({ data: { status: "failed" } }),
    prisma.deliveryAttempt.create({ ... }),
    prisma.auditEvent.create({ ... }),
  ])
}
```

**What's Missing:**
- No email to user: "Your letter delivery failed"
- No push notification
- User must check dashboard to discover failure

**Verdict:** ⚠️ GAP - User has no way to know delivery failed without checking.

---

### Scenario 8: No Offline Queue / Local Fallback ⚠️ GAP

**Risk Level:** 🟡 MEDIUM

**The Problem:**
If Inngest is unreachable, new schedules simply fail and require the user to retry. There is no "pending to enqueue later" record stored locally.

```typescript
// apps/web/server/actions/deliveries.ts:367-411
// If Inngest fails → delivery deleted, user must retry manually
// No local queue stores "needs to be sent to Inngest when available"
```

**Impact:** During Inngest outages, users cannot schedule deliveries at all. No deferred enqueueing.

**Verdict:** ⚠️ GAP - No graceful degradation for Inngest unavailability.

---

### Scenario 9: Reconciler Depends on Inngest ⚠️ GAP

**Risk Level:** 🟡 MEDIUM

**The Problem:**
During an Inngest outage, the backstop reconciler will just log errors and not persist any "needs requeue" marker beyond `updated_at`. Recovery waits for Inngest to come back with no alerting beyond console/audit.

```typescript
// apps/web/app/api/cron/reconcile-deliveries/route.ts:67-108
// Re-enqueue via triggerInngestEvent() - if Inngest is down, this fails
// No persistent "retry queue" marker is set
```

**Verdict:** ⚠️ GAP - Reconciler cannot function without Inngest.

---

### Scenario 10: inngestRunId Stores Event ID, Not Run ID ⚠️ GAP

**Risk Level:** 🟢 LOW (Debugging concern)

**The Problem:**
The `inngestRunId` field stores the **event ID** returned by `inngest.send()`, not the actual **run ID** assigned when the function executes. This reduces observability.

```typescript
// apps/web/server/lib/trigger-inngest.ts:7-36
const result = await inngest.send({ name: eventName, data })
const eventId = ids.find((id) => typeof id === "string") ?? null
return eventId  // This is EVENT id, not RUN id
```

**Implications:**
- No call to `inngest.cancel()` is implemented
- Cannot correlate or trace actual runs in Inngest dashboard
- Cancel simply flips status in DB and relies on worker to notice later

```typescript
// apps/web/server/actions/deliveries.ts:696-700
// Cancel just updates status - no Inngest cancellation API call
await tx.delivery.update({
  where: { id: deliveryId },
  data: { status: "canceled" },
})
```

**Verdict:** ⚠️ Minor gap - Reduced debuggability and no active cancellation.

---

### Scenario 11: Manual Retry Doesn't Persist Event ID ⚠️ GAP

**Risk Level:** 🟢 LOW (Debugging concern)

**The Problem:**
The `retryDelivery()` action doesn't store the new event ID, reducing debuggability and cancelability of retried jobs.

```typescript
// apps/web/server/actions/deliveries.ts:832-845
try {
  await triggerInngestEvent("delivery.scheduled", { deliveryId })
  // Event ID is NOT stored back to delivery.inngestRunId
} catch (inngestError) {
  // Don't fail - backstop will catch
}
```

**Verdict:** ⚠️ Minor gap - Retried jobs have stale/missing event correlation.

---

### Scenario 12: Reschedule Race Condition ⚠️ GAP

**Risk Level:** 🟡 MEDIUM

**The Problem:**
When rescheduling, the code updates the DB and clears `inngestRunId` **before** re-triggering Inngest. If the Inngest call fails, the delivery remains scheduled but unenqueued until the reconciler catches it.

```typescript
// apps/web/server/actions/deliveries.ts:536-577
// 1. Update delivery with new time and CLEAR run ID
await prisma.delivery.update({
  where: { id: deliveryId },
  data: {
    deliverAt: data.deliverAt,
    inngestRunId: null,  // Cleared BEFORE Inngest call
  },
})

// 2. Try to re-schedule - if this fails, delivery is orphaned
try {
  const eventId = await triggerInngestEvent("delivery.scheduled", { deliveryId })
  // ...
} catch (rescheduleError) {
  return { success: false, error: { ... } }  // Delivery exists but not enqueued!
}
```

**Impact:** For near-term reschedules, user may see success but delivery is stuck until backstop runs (up to 5+ minutes late).

**Verdict:** ⚠️ GAP - Race window creates user-facing failures for near-term reschedules.

---

### Scenario 13: Failed Deliveries Never Auto-Requeued ⚠️ GAP

**Risk Level:** 🟡 MEDIUM

**The Problem:**
Failed deliveries caused by transient DB outages get marked `failed` after worker retries and are **never auto-requeued**. The reconciler only scans `status='scheduled'`, so manual retry is required even after the DB recovers.

```typescript
// Reconciler query - note: only 'scheduled' status
// apps/web/app/api/cron/reconcile-deliveries/route.ts:30-42
WHERE status = 'scheduled'  // <-- 'failed' not included
  AND deliver_at < ${fiveMinutesAgo}
```

**Recovery Path:**
```typescript
// apps/web/server/actions/deliveries.ts:776-882
// User must manually call retryDelivery()
```

**Verdict:** ⚠️ GAP - Transient failures require manual intervention even after recovery.

---

### Scenario 14: No Prisma Connection Pool / Circuit Breaker ⚠️ GAP

**Risk Level:** 🟡 MEDIUM

**The Problem:**
Prisma client uses defaults with no custom pool, circuit breaker, or timeout configuration. If the database throttles/limits connections, backend calls will error immediately without backoff (beyond the worker classification path).

```typescript
// packages/prisma/index.ts:7-18
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["error"],
    // No connection pool configuration
    // No timeout settings
    // No circuit breaker
  })
```

**Impact:**
- Under high load or DB throttling, requests fail immediately
- No graceful degradation or backpressure
- Server Actions fail with cryptic Prisma errors

**Verdict:** ⚠️ GAP - No resilience configuration for database client.

---

## Risk Matrix

### Handled Scenarios ✅

| Scenario | Likelihood | Impact | Risk Level | Status |
|----------|------------|--------|------------|--------|
| Inngest outage during scheduling | Low | Low | 🟢 Low | ✅ Handled (rollback) |
| Inngest outage during sleep | Low | Medium | 🟡 Medium | ✅ Handled (backstop) |
| Database temporary outage | Medium | Low | 🟢 Low | ✅ Handled (retries) |
| Email provider outage | Medium | Low | 🟢 Low | ✅ Handled (dual provider) |
| Inngest event lost | Very Low | Medium | 🟢 Low | ✅ Handled (backstop) |
| Cancel while sleeping | Low | Low | 🟢 Low | ✅ Handled (state refresh) |
| Reschedule while sleeping | Low | Low | 🟢 Low | ✅ Handled (state refresh) |

### Gaps & Risks ⚠️

| Scenario | Likelihood | Impact | Risk Level | Code Reference |
|----------|------------|--------|------------|----------------|
| Backstop reconciler fails | Low | Critical | 🔴 High | `reconcile-deliveries/route.ts` |
| Race condition duplicates | Very Low | Medium | 🟡 Medium | `deliver-email.ts:422` |
| User not notified of failure | N/A | Medium | 🟡 Medium | `deliver-email.ts:126-160` |
| No offline queue/fallback | Low | Medium | 🟡 Medium | `deliveries.ts:367-411` |
| Reconciler depends on Inngest | Low | Medium | 🟡 Medium | `reconcile-deliveries:67-108` |
| inngestRunId is event ID, not run ID | N/A | Low | 🟢 Low | `trigger-inngest.ts:7-36` |
| Manual retry loses event ID | Low | Low | 🟢 Low | `deliveries.ts:832-845` |
| Reschedule race condition | Low | Medium | 🟡 Medium | `deliveries.ts:536-577` |
| Failed deliveries never auto-retry | Medium | Medium | 🟡 Medium | `reconcile-deliveries:30-42` |
| No Prisma pool/circuit breaker | Medium | Medium | 🟡 Medium | `packages/prisma/index.ts:7-18` |
| Database extended outage | Low | High | 🟡 Medium | All DB operations |

---

## Recommendations

### Priority 1: Critical (Fix immediately)

#### 1.1 Add External Monitoring for Backstop Cron

**Problem:** No alerting if backstop fails
**Solution:** Add external uptime monitoring

```typescript
// Option A: Add to reconciler response for external monitoring
return NextResponse.json({
  success: true,
  count: stuckDeliveries.length,
  timestamp: new Date().toISOString(),
  // External monitor can alert if this endpoint returns non-200
})
```

**Recommended Services:**
- Checkly (monitors cron endpoints)
- Better Uptime
- Vercel's upcoming cron monitoring

#### 1.2 Add Sentry/Error Alerting

```typescript
// apps/web/app/api/cron/reconcile-deliveries/route.ts
import * as Sentry from "@sentry/nextjs"

try {
  // ... reconciler logic
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: "backstop-reconciler" },
    extra: { stuckCount: stuckDeliveries?.length }
  })
  throw error
}
```

### Priority 2: High (Fix within sprint)

#### 2.1 Fix Idempotency Key Race Condition

**Current (problematic):**
```typescript
const idempotencyKey = `delivery-${deliveryId}-attempt-${delivery.attemptCount}`
```

**Recommended (delivery-level):**
```typescript
const idempotencyKey = `delivery-${deliveryId}-v1`
// OR use a dedicated idempotency field in the delivery record
```

**Alternative:** Add optimistic locking
```typescript
// In deliver-email.ts, before sending:
const current = await prisma.delivery.findUnique({ where: { id: deliveryId } })
if (current.status !== 'scheduled' && current.status !== 'processing') {
  throw new NonRetriableError('Delivery already processed')
}
```

#### 2.2 Add User Failure Notifications

```typescript
// In onFailure handler of deliver-email.ts
await triggerInngestEvent("notification.delivery.failed", {
  userId: delivery.userId,
  deliveryId,
  letterTitle: delivery.letter.title,
  errorMessage: error.message,
})
```

### Priority 3: Medium (Add to backlog)

#### 3.1 Auto-Retry Failed Deliveries

Add a cron job that retries failed deliveries after 24 hours:

```typescript
// /api/cron/retry-failed-deliveries/route.ts
const failedDeliveries = await prisma.delivery.findMany({
  where: {
    status: 'failed',
    updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    attemptCount: { lt: 10 }, // Max total attempts
  },
  take: 50,
})
```

#### 3.2 Add Delivery Health Dashboard

Create an admin endpoint that shows:
- Deliveries by status (scheduled, processing, sent, failed)
- Average delivery latency
- Reconciliation rate over time
- Failed deliveries requiring attention

#### 3.3 Store Event ID on Retry

```typescript
// apps/web/server/actions/deliveries.ts - retryDelivery()
const eventId = await triggerInngestEvent("delivery.scheduled", { deliveryId })
// ADD: Store the new event ID
await prisma.delivery.update({
  where: { id: deliveryId },
  data: { inngestRunId: eventId }
})
```

#### 3.4 Fix Reschedule Race Condition

Use atomic update pattern - only clear `inngestRunId` after successful re-trigger:

```typescript
// apps/web/server/actions/deliveries.ts - updateDelivery()
// Option A: Update DB AFTER successful Inngest call
const eventId = await triggerInngestEvent("delivery.scheduled", { deliveryId })
await prisma.delivery.update({
  where: { id: deliveryId },
  data: {
    deliverAt: data.deliverAt,
    inngestRunId: eventId  // Only update after success
  },
})

// Option B: Mark as "pending_reschedule" and let backstop handle
```

### Priority 4: Low (Future improvements)

#### 4.1 Add Prisma Connection Pool Configuration

```typescript
// packages/prisma/index.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  // Add connection pool settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Consider using @prisma/extension-accelerate for connection pooling
// Or PgBouncer in front of Neon
```

#### 4.2 Implement Inngest Cancellation API

```typescript
// When user cancels, actually cancel the Inngest run
import { inngest } from "@dearme/inngest"

// Store run ID (not event ID) when function starts
// Call inngest.cancel(runId) on user cancel
```

#### 4.3 Add Local Fallback Queue (Optional)

For graceful degradation during Inngest outages:

```typescript
// Create a "pending_enqueue" status
// Store deliveries that failed to enqueue
// Backstop picks these up and retries Inngest
enum DeliveryStatus {
  pending_enqueue  // NEW: Inngest send failed
  scheduled
  processing
  sent
  failed
  canceled
}
```

---

## Conclusion

The Capsule Note delivery system has **solid fundamentals** with a well-designed Inngest integration and backstop pattern.

### What Works Well ✅
- **Atomic scheduling**: Delivery + Inngest trigger in atomic sequence with rollback
- **Durable execution**: Inngest handles long sleeps, retries, and checkpointing
- **Dual email providers**: Resend → Postmark failover with intelligent error classification
- **State validation**: Worker re-checks delivery status after sleep, handles cancel/reschedule
- **Backstop pattern**: 5-minute cron catches stuck deliveries

### Key Risks ⚠️

| Risk | Impact | Fix Priority |
|------|--------|--------------|
| Backstop has no backup | Critical | P1 - Week 1 |
| Idempotency race condition | Medium | P2 - Week 2 |
| Users not notified of failures | Medium | P2 - Week 2 |
| Failed deliveries never auto-retry | Medium | P3 - Week 3 |
| Reschedule race condition | Medium | P3 - Week 3 |
| No Prisma pool/circuit breaker | Medium | P4 - Backlog |
| No offline queue for Inngest outage | Medium | P4 - Backlog |
| Event ID vs Run ID confusion | Low | P4 - Backlog |

### Recommended Action Plan

**Week 1 (Critical):**
- Add Sentry alerting to backstop reconciler
- Add external cron monitoring (Checkly/Better Uptime)

**Week 2 (High):**
- Fix idempotency key to delivery-level (remove `attemptCount`)
- Add user email notification when delivery fails

**Week 3 (Medium):**
- Add auto-retry cron for failed deliveries (24h delay)
- Fix reschedule race condition (atomic update)
- Store event ID on manual retry

**Week 4+ (Backlog):**
- Add Prisma connection pool / circuit breaker
- Implement actual Inngest cancellation API
- Consider offline fallback queue

### Expected Outcomes

With all P1-P3 fixes implemented, the system would achieve:
- **99.95%+ delivery reliability** even under adverse conditions
- **Zero silent failures** - users always notified
- **Automated recovery** from transient failures
- **Better observability** for debugging delivery issues

---

## Appendix: Key File Locations

| Component | Path |
|-----------|------|
| Inngest Client | `workers/inngest/client.ts` |
| Email Delivery Function | `workers/inngest/functions/deliver-email.ts` |
| Error Classification | `workers/inngest/lib/errors.ts` |
| Backstop Reconciler | `apps/web/app/api/cron/reconcile-deliveries/route.ts` |
| Delivery Server Action | `apps/web/server/actions/deliveries.ts` |
| Email Providers | `apps/web/server/providers/email/` |
| Trigger Helper | `apps/web/server/lib/trigger-inngest.ts` |
| Database Schema | `packages/prisma/schema.prisma` |
| Cron Configuration | `vercel.json` |
