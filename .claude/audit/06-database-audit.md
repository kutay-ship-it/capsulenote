# Database Audit Report

## Summary
- **Critical**: 2 issues
- **High**: 4 issues
- **Medium**: 3 issues
- **Low**: 2 issues

---

## CRITICAL Issues

### C1: Missing Composite Index for Backstop Reconciler
**Impact**: Reconciler runs every 5 minutes, can lock more rows than necessary
**Query Pattern**:
```sql
WHERE status='scheduled' AND deliver_at < X AND inngest_run_id IS NULL
```
**Missing Index**:
```prisma
@@index([status, deliverAt, inngestRunId, updatedAt])
```

### C2: Potential Deadlock in Credit Transactions
**Location**: `deliveries.ts:465-639`
Large transaction combining credit deduction, delivery creation, audit records
**Issue**: Multiple transactions on same user could deadlock
**Fix**: Enforce consistent ordering by userId or use advisory locks

---

## HIGH Priority Missing Indexes

### H1: Email Suppression List
```prisma
@@index([email, reason]) // Missing combined lookup
```

### H2: Webhook Events
```prisma
@@index([status, processedAt]) // For stuck webhooks
@@index([type, status])        // Admin queries
```

### H3: Pending Subscriptions
```prisma
@@index([status, expiresAt]) // For expiry cleanup
```

### H4: Credit Transactions
```prisma
@@index([creditType, transactionType, createdAt]) // Reports
```

---

## Schema Analysis

### ✅ Strengths
- Proper normalization (3NF)
- Correct data types (Uuid, Citext, Timestamptz)
- PostgreSQL extensions (pg_trgm, citext)
- Encrypted content as Bytes

### ⚠️ Issues
- No migrations directory (using db push)
- Enum naming inconsistency (physical vs mail)
- Large transaction boundaries with external API calls

---

## Transaction Patterns

### Good Practices ✅
- Atomic credit deduction with WHERE condition
- `FOR UPDATE SKIP LOCKED` in reconciler
- Transactional rollback on failures

### Issues ❌
- External Lob API call happens outside transaction
- Should separate DB operations from external calls

---

## Recommendations

### Immediate (Week 1)
1. Add composite index for backstop reconciler
2. Initialize migration history

### Short-term (Month 1)
3. Add webhook/suppression indexes
4. Review transaction boundaries
5. Configure connection pooling

### Long-term (Quarter)
6. Add composite indexes for reporting
7. Consider partitioning AuditEvent table
8. Set up query performance monitoring
