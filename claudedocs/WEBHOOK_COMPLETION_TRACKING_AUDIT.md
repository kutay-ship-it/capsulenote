# Webhook Completion Tracking System - Plan Rating & Audit

## Overall Rating: 8.2/10

### Rating Breakdown

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| **Correctness** | 9/10 | 25% | 2.25 |
| **Robustness** | 8/10 | 20% | 1.60 |
| **Simplicity** | 7/10 | 15% | 1.05 |
| **Maintainability** | 9/10 | 15% | 1.35 |
| **Performance** | 8/10 | 10% | 0.80 |
| **Observability** | 9/10 | 10% | 0.90 |
| **Risk** | 7/10 | 5% | 0.35 |
| **Total** | | 100% | **8.30** |

---

## Detailed Audit

### Strengths (What's Good)

#### 1. Solves the Root Cause
- **Rating**: 9/10
- The plan correctly identifies that idempotency is claimed before completion
- Three-step process (claim → process → mark-complete) is the industry-standard pattern
- Similar to Stripe's own "charge.pending → charge.succeeded" pattern

#### 2. Idempotency Preserved
- **Rating**: 9/10
- Unique constraint on event ID still prevents duplicate processing
- Status check distinguishes between "truly duplicate" vs "stuck" events
- Atomic operations prevent race conditions

#### 3. Self-Healing System
- **Rating**: 9/10
- Backstop reconciler automatically detects and retries stuck events
- Max retry limit prevents infinite loops
- FAILED status provides clear terminal state for investigation

#### 4. Excellent Observability
- **Rating**: 9/10
- Clear status transitions: CLAIMED → COMPLETED | FAILED
- Comprehensive logging at each step
- Metrics for SLO monitoring (reconciliation rate)
- Searchable log patterns for debugging

#### 5. Safe Migration Path
- **Rating**: 8/10
- Schema changes are additive (new columns with defaults)
- Backfill query is safe and idempotent
- Existing records get migrated to COMPLETED status
- Rollback plan documented

---

### Weaknesses & Risks (What Could Go Wrong)

#### 1. Complexity Increase
- **Rating**: 7/10
- **Issue**: Adds ~285 lines of code, new cron job, new Inngest function
- **Risk**: More moving parts = more potential failure points
- **Mitigation**: Code is well-documented, follows existing patterns

#### 2. Race Condition Window
- **Rating**: 7/10
- **Issue**: 5-minute threshold means events processing between 0-5 min could be mistakenly flagged
- **Scenario**: Worker takes 4 minutes to process large event → backstop sees it as stuck
- **Mitigation**:
  - Status check before retry prevents double-processing
  - Could increase threshold to 10 minutes for safety
  - **Recommendation**: Add "in-progress heartbeat" pattern (see improvements below)

#### 3. Inngest Dev Server Dependency
- **Rating**: 6/10
- **Issue**: If Inngest Dev Server isn't running, events still get queued but not processed
- **Root Cause**: This was likely the original issue!
- **Mitigation**:
  - Backstop runs in cron (Vercel), not Inngest
  - But retry still depends on Inngest
  - **Recommendation**: Add health check for Inngest connection

#### 4. Database Load During Backfill
- **Rating**: 8/10
- **Issue**: Backfill UPDATE on large webhook_events table could lock rows
- **Mitigation**: Run during low-traffic period, batch if needed
- **Impact**: Low - webhook_events table is typically small

#### 5. Cron Job Single Point of Failure
- **Rating**: 7/10
- **Issue**: If cron job fails repeatedly, stuck events won't be recovered
- **Mitigation**:
  - Vercel Cron is reliable
  - Could add redundant cron via external service (Upstash QStash)
  - **Recommendation**: Add Slack alert for cron failures

---

### Potential Improvements

#### 1. Heartbeat Pattern (Medium Priority)
Add periodic heartbeat updates during long-running handlers:

```typescript
// In routeWebhookEvent for long handlers
await prisma.webhookEvent.update({
  where: { id: eventId },
  data: { updatedAt: new Date() }  // Heartbeat
})
```

Backstop would then check:
```typescript
WHERE status = 'CLAIMED'
  AND updatedAt < NOW() - INTERVAL '5 minutes'  // No heartbeat for 5 min
```

**Benefit**: Prevents false positives for legitimately slow handlers.

#### 2. Circuit Breaker (Low Priority)
If reconciliation rate exceeds threshold, pause new webhook acceptance:

```typescript
if (reconciliationRate > 5) {
  // Something is very wrong - stop accepting new webhooks
  await redis.set("webhook:circuit-breaker", "open", { ex: 300 })
}
```

**Benefit**: Prevents cascade failures.

#### 3. Dead Letter Queue Integration (Low Priority)
Move FAILED events to existing FailedWebhook table automatically:

```typescript
// In backstop when marking FAILED
await prisma.failedWebhook.create({
  data: {
    eventId: event.id,
    eventType: event.type,
    payload: event.data,
    error: "Exceeded max retries after backstop recovery",
  }
})
```

**Benefit**: Single place to investigate all failed webhooks.

#### 4. Inngest Health Check (High Priority)
Add pre-flight check before queuing events:

```typescript
// In webhook route
const inngestHealthy = await checkInngestConnection()
if (!inngestHealthy) {
  // Store locally and alert
  await prisma.pendingWebhook.create({ data: { ... } })
  console.error("[Stripe Webhook] Inngest unhealthy, stored for retry")
  return new Response("Webhook stored for retry", { status: 202 })
}
```

**Benefit**: Would have caught the original issue.

---

### Edge Cases Considered

| Edge Case | Handled? | How |
|-----------|----------|-----|
| Duplicate webhook delivery | ✅ | P2002 unique constraint |
| Worker crashes mid-processing | ✅ | Backstop detects CLAIMED status |
| Inngest not running | ⚠️ | Backstop retries, but needs Inngest |
| Database unavailable | ❌ | Would fail - acceptable (retry later) |
| Cron job fails | ⚠️ | No auto-recovery - needs alerting |
| Event older than 5 min on first receive | ✅ | Webhook route rejects >5 min events |
| Malformed event data | ✅ | Handler errors → FAILED status |
| Concurrent backstop runs | ✅ | Optimistic locking with retryCount |

---

### Security Considerations

| Concern | Status | Notes |
|---------|--------|-------|
| Cron endpoint authentication | ✅ | CRON_SECRET header required |
| Event data exposure in logs | ✅ | Only IDs logged, not payloads |
| Retry amplification attack | ✅ | MAX_RETRIES = 3 limits exposure |
| SQL injection | ✅ | Prisma parameterized queries |

---

### Comparison to Alternatives

#### Alternative 1: Transactional Outbox Pattern
- **Approach**: Store events in local table, separate process reads and sends to Inngest
- **Pros**: Stronger consistency, no lost events
- **Cons**: More complex, requires additional infrastructure
- **Verdict**: Overkill for this use case

#### Alternative 2: Synchronous Processing (No Inngest)
- **Approach**: Process webhooks inline in the route handler
- **Pros**: Simpler, no message queue dependency
- **Cons**: Risk of Stripe timeout (must respond <30s), no retry logic
- **Verdict**: Not recommended for production

#### Alternative 3: Two-Phase Commit
- **Approach**: CLAIMED → PROCESSING → COMPLETED with explicit transitions
- **Pros**: More granular status tracking
- **Cons**: Additional complexity, PROCESSING state rarely useful
- **Verdict**: Marginal benefit for added complexity

**Conclusion**: The proposed plan is the right balance of robustness and simplicity.

---

### Final Recommendations

#### Must-Do Before Implementation
1. ✅ Add Inngest health check endpoint
2. ✅ Add Slack/Discord alert for high stuck count
3. ✅ Test with simulated worker failure

#### Nice-to-Have (Future)
1. Heartbeat pattern for long handlers
2. Dashboard for webhook processing metrics
3. Automated FAILED event replay tool

---

## Audit Summary

| Aspect | Verdict |
|--------|---------|
| **Does it solve the problem?** | ✅ Yes - prevents stuck events |
| **Is it production-ready?** | ✅ Yes - with recommended alerts |
| **Is it over-engineered?** | ❌ No - appropriate complexity |
| **Are there hidden risks?** | ⚠️ Minor - Inngest dependency |
| **Is rollback possible?** | ✅ Yes - documented |
| **Is it testable?** | ✅ Yes - can simulate failures |

### Final Verdict
**Approved for implementation** with the following conditions:
1. Add Inngest health check before deployment
2. Set up alerting for reconciliation rate > 0.5%
3. Monitor closely for first 48 hours after deployment
