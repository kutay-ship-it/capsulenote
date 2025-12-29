# API Audit Report

## Summary
- **Critical**: 3 issues
- **High**: 4 issues
- **Medium**: 7 issues
- **Low**: 5 issues

---

## Route Inventory

| Route | Auth | Rate Limit | Issues |
|-------|------|------------|--------|
| `/api/cron/*` | CRON_SECRET ✅ | None ❌ | No rate limit |
| `/api/inngest` | Inngest SDK | None | None |
| `/api/locale` | Clerk ✅ | None ❌ | **CRITICAL** |
| `/api/test/send-lob-letter` | Env Check ⚠️ | None ❌ | **CRITICAL** |
| `/api/webhooks/stripe` | Stripe ✅ | Upstash ✅ | None |
| `/api/webhooks/clerk` | Svix ✅ | Upstash ✅ | Low |
| `/api/webhooks/resend` | Svix ✅ | Upstash ✅ | Medium |
| `/api/webhooks/lob` | HMAC ✅ | Upstash ✅ | **HIGH** |

---

## CRITICAL Issues

### 1. `/api/locale` - No Rate Limiting
Authenticated endpoint lacks rate limiting - DoS via Clerk API calls

### 2. `/api/test/send-lob-letter` - Production Exposure Risk
Test endpoint relies on API key check only. If LOB_API_KEY set to test key in prod, endpoint accessible.

**Fix**: Check `NODE_ENV === "production"` and return 404

### 3. `/api/locale` - Silent Database Errors
Swallows Profile update errors, returns success even on partial failure

---

## HIGH Issues

### 4. Cron Routes - No Idempotency Protection
Duplicate cron triggers execute twice. Critical for `cleanup-pending-subscriptions` (duplicate refunds).

### 5. Cron Refunds - Race Condition
No locking before processing refunds. Concurrent runs = duplicate refunds.

### 6. `/api/webhooks/lob` - Missing Deduplication
No WebhookEvent table usage. Same event ID processed multiple times.

### 7. Inconsistent Error Message Safety
Some handlers expose internal error details in production

---

## MEDIUM Issues

### 8. All Cron Routes - No Rate Limiting
Leaked secret enables DoS. `ratelimit.cron` exists but unused.

### 9. `/api/locale` - Missing Input Validation
No Zod schema for locale value

### 10. Inconsistent Secret Validation
Mix of `env.CRON_SECRET` and `process.env.CRON_SECRET`

### 11. Missing Error Context in Reconciler
No error categorization or alerting threshold

### 12. `/api/webhooks/resend` - Array Transaction Risk
Uses array syntax (not atomic) for batch updates

### 13. Lob Webhook - Error Message Reveals Server State
"Server misconfiguration" message reveals internal state

### 14. No Structured Error Format
Mix of `Response` and `NextResponse.json`

---

## Good Patterns ✅

- Constant-time secret comparison
- Signature verification on all webhooks
- Timestamp validation (5min max age)
- Transaction usage for critical ops
- Rate limiting on webhooks
- `FOR UPDATE SKIP LOCKED` in reconcilers

---

## Recommendations

### Immediate
1. Add rate limiting to `/api/locale`
2. Add idempotency to refund logic
3. Implement WebhookEvent deduplication for Lob
4. Disable test endpoint in production

### Short-term
5. Add idempotency to all cron routes
6. Standardize error responses
7. Add Zod validation
8. Implement request ID tracking
