# Lob Physical Mail Integration Audit Report

**Date**: 2025-12-04
**Scope**: Full flow audit of Lob mail delivery integration
**Status**: ⚠️ ISSUES FOUND

---

## Executive Summary

The Lob integration is **functional but has several bugs and gaps** that could cause delivery failures, inconsistent tracking, or poor user experience. Critical issues identified:

1. **✅ FIXED**: ~~Inngest worker uses different template than `sendTemplatedLetter`~~
2. **✅ FIXED**: ~~Missing idempotency keys for Lob API calls~~
3. **🟡 MEDIUM**: Webhook signature skipped when secret not configured
4. **🟡 MEDIUM**: Sender address env vars not in Zod schema
5. **🟢 LOW**: Inconsistent address field mapping between components

---

## Architecture Overview

```
User Action
    │
    ▼
scheduleDelivery() [apps/web/server/actions/deliveries.ts]
    │
    ├── Validates entitlements, credits
    ├── Creates Delivery + MailDelivery records
    └── Triggers Inngest event: "mail.delivery.scheduled"
             │
             ▼
deliverMail() [workers/inngest/functions/deliver-mail.ts]
    │
    ├── sleepUntil(sendDate)
    ├── Decrypts letter content
    ├── formatLetterForPrint() ← ⚠️ DIFFERENT FROM sendTemplatedLetter()
    └── sendLetter() [apps/web/server/providers/lob.ts]
             │
             ▼
Lob API → Webhook → /api/webhooks/lob/route.ts
                         │
                         └── Updates MailDelivery.trackingStatus
```

---

## 🔴 CRITICAL ISSUES

### 1. ~~Template Mismatch Between Worker and Provider~~ ✅ FIXED

**Status**: RESOLVED on 2025-12-04

**Fix Applied**:
- Removed `formatLetterForPrint()` function from worker
- Updated worker to use `sendTemplatedLetter()` from Lob provider
- Workers now send V3 branded 2-page letters (cover page + content)

---

### 2. ~~Missing Idempotency Keys for Lob API~~ ✅ FIXED

**Status**: RESOLVED on 2025-12-04

**Fix Applied**:
- Added `idempotency_key` to Lob type definitions (`lob.d.ts`)
- Added `idempotencyKey` option to `MailOptions` and `TemplatedLetterOptions`
- Updated `sendLetter()` to pass idempotency key to Lob API
- Updated worker to generate key: `mail-delivery-{deliveryId}-attempt-{attemptNumber}`
- Retries now safely deduplicate - no duplicate letters printed

---

## 🟡 MEDIUM ISSUES

### 3. Webhook Signature Verification Optional

**File**: `apps/web/app/api/webhooks/lob/route.ts:157-171`

**Problem**:
```typescript
if (env.LOB_WEBHOOK_SECRET) {
  // verify signature
} else {
  console.warn("[Lob Webhook] No webhook secret configured, skipping signature verification")
}
```

If `LOB_WEBHOOK_SECRET` is not set, **anyone can POST fake tracking events** to `/api/webhooks/lob` and manipulate delivery status.

**Impact**: Malicious actors could mark deliveries as "delivered" or "failed" without actual mail being sent.

**Fix**: Require signature in production:
```typescript
if (!env.LOB_WEBHOOK_SECRET && env.NODE_ENV === "production") {
  return new Response("Webhook secret not configured", { status: 500 })
}
```

---

### 4. Sender Address Env Vars Not in Zod Schema

**File**: `apps/web/server/templates/mail/envelope-template.ts:146-152`

**Problem**: These env vars are used but not validated:
- `LOB_SENDER_NAME`
- `LOB_SENDER_LINE1`
- `LOB_SENDER_LINE2`
- `LOB_SENDER_CITY`
- `LOB_SENDER_STATE`
- `LOB_SENDER_ZIP`
- `LOB_SENDER_COUNTRY`

They're accessed via raw `process.env` instead of the validated `env.mjs` schema.

**Impact**:
- No build-time validation of required sender address
- Falls back to hardcoded SF address silently
- Could cause mail to be returned if address is wrong

**Fix**: Add to `apps/web/env.mjs` server schema:
```typescript
LOB_SENDER_NAME: z.string().optional(),
LOB_SENDER_LINE1: z.string().optional(),
// etc.
```

---

### 5. No Audit Event on Webhook Status Update

**File**: `apps/web/app/api/webhooks/lob/route.ts:277-306`

**Problem**: When Lob webhooks update tracking status, no `AuditEvent` is created. Only a console.log exists.

**Impact**: No audit trail for tracking status changes, making debugging delivery issues harder.

**Fix**: Add audit event creation:
```typescript
await tx.auditEvent.create({
  data: {
    userId: mailDelivery.delivery.userId,
    type: "mail.tracking.updated",
    data: { deliveryId, eventType, trackingStatus }
  }
})
```

---

## 🟢 LOW ISSUES

### 6. Address Field Mapping Inconsistency

**Files**:
- `apps/web/server/providers/lob.ts` - Uses `line1`, `line2`
- `apps/web/server/templates/mail/envelope-template.ts` - Uses `address_line1`, `address_line2`
- `packages/prisma/schema.prisma` - Uses `line1`, `line2`

**Problem**: Internal code uses camelCase (`line1`) but Lob API uses snake_case (`address_line1`). The mapping is done manually in `sendLetter()` which is error-prone.

**Impact**: Minor - currently working, but future changes could introduce bugs.

---

### 7. Hardcoded Sender Address Placeholder

**File**: `apps/web/server/templates/mail/envelope-template.ts:14-29`

**Problem**: Default sender address uses "185 Berry Street" (San Francisco) which appears to be a placeholder.

```typescript
export const CAPSULE_NOTE_RETURN_ADDRESS = {
  name: "Capsule Note",
  address_line1: "185 Berry Street",
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  // ...
}
```

**Impact**: If env vars not set, mail will be sent with this return address. If it's not a valid business address, returned mail issues could occur.

---

### 8. Transit Time Estimates Hardcoded

**File**: `apps/web/server/lib/mail-delivery-calculator.ts:58-69`

**Problem**: Transit estimates are hardcoded:
```typescript
usps_first_class: { transitDays: 5, bufferDays: 3 }
usps_standard: { transitDays: 8, bufferDays: 4 }
```

These don't account for:
- Destination distance
- Holiday periods
- USPS delays

**Impact**: Arrive-by mode may miss target dates during busy periods.

**Recommendation**: Consider using Lob's expected_delivery_date from letter creation response instead of hardcoded estimates.

---

## Security Analysis

### ✅ Good Practices Found

1. **Constant-time signature comparison** (lob/route.ts:117-124)
2. **Timestamp replay protection** (5-minute window)
3. **Rate limiting on webhooks** (ratelimit.webhook.lob.limit)
4. **HTML sanitization** for letter content (sanitizeForPrint)
5. **Script/iframe removal** from user content

### ⚠️ Security Concerns

1. **No CSP on rendered letters** - XSS possible if content escapes sanitization
2. **Event handler removal uses regex** - Could be bypassed with unicode tricks
3. **No audit trail for webhook updates** - Cannot detect tampering

---

## Data Flow Validation

### Credit Deduction Flow ✅
```
1. Check entitlements.features.canSchedulePhysicalMail
2. Atomic updateMany with physicalCredits >= 1
3. If fail → QuotaExceededError (no deduction)
4. Create CreditTransaction record
5. Transaction commits atomically
```
**Assessment**: Correct, race-condition safe.

### Cancellation Refund Flow ✅
```
1. Check delivery status is scheduled/failed
2. Check not within 72h lock window
3. Refund credit + CreditTransaction
4. Update delivery status to canceled
```
**Assessment**: Correct, but consider adding Lob letter cancellation API call.

---

## Missing Features

1. **No Lob letter cancellation** - When user cancels delivery, we don't call `lob.letters.delete()` to prevent printing
2. **No cost tracking** - No record of actual Lob costs per letter
3. **No retry limit for mail** - Email has idempotency, mail doesn't
4. **No expected delivery date stored** - Could enhance tracking UX

---

## Test Coverage Assessment

Based on file discovery:
- `apps/web/__tests__/unit/webhook-signatures.test.ts` - Exists
- No dedicated Lob provider tests found
- No integration tests for full mail flow

---

## Recommendations Summary

| Priority | Issue | Fix Complexity | Impact |
|----------|-------|----------------|--------|
| 🔴 P0 | Use sendTemplatedLetter in worker | Medium | High |
| 🔴 P0 | Add idempotency keys to Lob | Low | High |
| 🟡 P1 | Require webhook secret in prod | Low | Medium |
| 🟡 P1 | Add sender env vars to schema | Low | Medium |
| 🟡 P2 | Add audit events for webhooks | Low | Medium |
| 🟢 P3 | Call Lob cancel on delivery cancel | Medium | Low |
| 🟢 P3 | Store expected_delivery_date | Low | Low |

---

## Files Audited

1. `apps/web/server/providers/lob.ts` - Main Lob provider
2. `workers/inngest/functions/deliver-mail.ts` - Mail delivery worker
3. `apps/web/server/actions/deliveries.ts` - Server actions
4. `apps/web/app/api/webhooks/lob/route.ts` - Webhook handler
5. `apps/web/server/templates/mail/*.ts` - Template system
6. `apps/web/server/lib/mail-delivery-calculator.ts` - Transit calculations
7. `apps/web/server/actions/addresses.ts` - Address management
8. `apps/web/env.mjs` - Environment validation
9. `packages/prisma/schema.prisma` - Database schema

---

*Report generated by Claude Code audit*
