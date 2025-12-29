# Security Audit Report - Capsule Note

## Summary
- **Critical**: 3 issues
- **High**: 4 issues
- **Medium**: 5 issues
- **Low**: 3 issues

---

## CRITICAL Issues

### 1. Weak Key Derivation - No HKDF
**File**: `apps/web/server/lib/encryption.ts:12-17`

Master key used directly without proper key derivation function (HKDF/PBKDF2). Single key compromise = all data compromised.

**Fix**: Use HKDF with per-record salt

### 2. Nonce Collision Risk - No Counter
**File**: `apps/web/server/lib/encryption.ts:27`

Random nonces with same key → birthday paradox collision after ~2^48 encryptions. No tracking mechanism.

**Fix**: Use deterministic nonce = `HMAC-SHA256(key, letterId + version)[:12]` OR add nonce counter

### 3. Missing Auth Tag Verification Error Handling
**File**: `apps/web/server/lib/encryption.ts:55-65`

No explicit auth tag verification error handling. Corrupted ciphertext could cause crashes. Timing attacks possible.

---

## HIGH Issues

### 4. Insecure Key Rotation - Old Keys Not Managed
**File**: `apps/web/server/lib/encryption.ts:8-10`

Code only loads single key from env. Old data undecryptable after rotation.

### 5. Webhook HMAC Timing Attack
**File**: `apps/web/app/api/webhooks/stripe/route.ts:22-28`

Stripe SDK may use `===` for signature comparison (timing attack vulnerable).

### 6. Cron Authorization - Weak Secret
**File**: `apps/web/app/api/cron/reconcile-deliveries/route.ts:12-16`

No minimum secret length enforcement, non-constant-time comparison.

### 7. Missing Rate Limiting on Auth Endpoints
**File**: `apps/web/server/lib/redis.ts:58-95`

Rate limiting NOT applied to `/api/webhooks/*`, `/api/cron/*`

---

## MEDIUM Issues

### 8. XSS via Tiptap Content - No CSP
- DOMPurify sanitization present but no Content-Security-Policy headers

### 9. IDOR - Missing Ownership Checks
**File**: `apps/web/server/actions/deliveries.ts:89-107`

User can cancel ANY delivery by guessing UUID. No userId check in where clause.

Same pattern in: `deleteLetterAction`, `updateLetterAction`

### 10. Sensitive Data in Logs
**File**: `workers/inngest/functions/deliver-email.ts:47-52`

Letter content logged to stdout → compliance violation

### 11. Email Injection via Custom Headers
**File**: `apps/web/server/providers/email/resend-provider.ts:18-25`

Headers not whitelisted, could inject Bcc

### 12. Database Seed Script - Insecure Defaults
**File**: `packages/prisma/seed.ts:15-30`

Known admin UUID, seed script might run in production

---

## LOW Issues

### 13. No Subresource Integrity (SRI)
### 14. Missing Security Headers (X-Content-Type-Options, X-Frame-Options)
### 15. Overly Permissive CORS

---

## Priority Recommendations

**Fix Immediately**:
1. Add HKDF key derivation
2. Implement nonce counter or deterministic nonces
3. Fix IDOR vulnerabilities
4. Implement key rotation registry

**Fix This Sprint**:
5. Add CSP headers
6. Sanitize email headers
7. Constant-time comparisons
8. Remove sensitive logging
