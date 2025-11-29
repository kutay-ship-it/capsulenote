# Capsule Note: User Journey Deep Dive Report

**Date**: 2025-11-28
**Scope**: Landing page to letter delivery - complete flow analysis
**Methodology**: End-to-end code trace of every API request and server action

---

## Executive Summary

This report traces the complete user journey from landing page to successful letter delivery, examining every API call, server action, and background job. The analysis reveals a **well-architected system** with strong patterns for security, error handling, and durability, but with **several bugs and improvement areas** that should be addressed.

**Overall Rating: 78/100**

---

## 1. Complete User Journey Flow

### Phase 1: Landing Page (Marketing)

**Entry Point**: `/apps/web/app/[locale]/(marketing-v3)/page.tsx`

```
User visits capsulenote.com
      ↓
Server Component: MarketingPage
      ↓
await auth() → Check if user is signed in
      ↓
Render: <HeroSection isSignedIn={isSignedIn} />
```

**CTAs Based on Auth State**:
- **Not signed in**: "Start Writing Free" → `/sign-up`, "Sign In" → `/sign-in`
- **Signed in**: "Go to Dashboard" → `/dashboard`

**Files**:
- `apps/web/app/[locale]/(marketing-v3)/page.tsx:1-27`
- `apps/web/app/[locale]/(marketing-v3)/_components/hero-section.tsx:1-135`

---

### Phase 2: Sign-Up Flow

**Entry Point**: `/apps/web/app/[locale]/sign-up/[[...sign-up]]/page.tsx`

```
User clicks "Start Writing Free"
      ↓
Navigate to /sign-up
      ↓
<CustomSignUp> component renders
      ↓
User enters email/password or OAuth
      ↓
Clerk creates user session
      ↓
Webhook: user.created → POST /api/webhooks/clerk
      ↓
OR Self-healing: getCurrentUser() auto-provisions
```

**Key Implementation**: `apps/web/server/lib/auth.ts:20-189`

The auth system uses a **hybrid pattern**:
1. **Primary**: Clerk webhooks create users in real-time
2. **Fallback**: `getCurrentUser()` auto-creates missing users if webhook failed
3. **Race condition handling**: Retry loop with P2002 detection (lines 82-140)

**Timezone Detection**: User's timezone is captured from Clerk metadata and stored in profile.

---

### Phase 3: App Layout & Entitlements

**Entry Point**: `/apps/web/app/[locale]/(app-v3)/layout.tsx`

```
User enters protected app area
      ↓
await getCurrentUser() → User object with profile
      ↓
await getEntitlements(user.id) → Credits, plan, features
      ↓
Render: <CreditsBarV3>, <WriteButtonV3>, <SettingsDropdown>
```

**Entitlements System** (`apps/web/server/lib/entitlements.ts`):
- Redis cache with 5-minute TTL
- Credit-based access control
- Plans: DIGITAL_CAPSULE (6 email), PAPER_PIXELS (24 email + 3 physical)
- No free tier - paid-only model

---

### Phase 4: Letter Creation Page

**Entry Point**: `/apps/web/app/[locale]/(app-v3)/letters/new/page.tsx`

```
User clicks "Write a Letter"
      ↓
await getDeliveryEligibility()
      ↓
Returns: { canScheduleEmail, canSchedulePhysical, emailCredits, physicalCredits }
      ↓
Render: <LetterEditorWrapper eligibility={eligibility}>
```

**Server Action**: `getDeliveryEligibility()` in `apps/web/server/actions/entitlements.ts:37-53`

---

### Phase 5: Letter Editor (Critical Component)

**Component**: `/apps/web/components/v3/letter-editor-v3.tsx` (1,116 lines)

```
User writes letter content
      ↓
Form state: title, bodyRich, bodyHtml, recipientEmail, deliveryChannels, deliveryDate
      ↓
Autosave every 30s → localStorage (key: "capsule_draft_{date}")
      ↓
User clicks "Seal & Schedule"
      ↓
validateForm() → showSealConfirmation modal
      ↓
User confirms
      ↓
[Critical Flow Begins]
```

**Key Features**:
- TipTap rich text editor integration
- Anonymous draft migration (pre-signup drafts)
- Credit eligibility computed live
- CreditWarningBanner when insufficient credits

---

### Phase 6: Letter Creation (Server Action)

**Server Action**: `createLetter()` in `apps/web/server/actions/letters.ts`

```
Client: await createLetter({ title, bodyRich, bodyHtml, recipientType, visibility })
      ↓
Server: requireUser() → Authentication check
      ↓
Zod validation → createLetterSchema.safeParse(input)
      ↓
encryptLetter({ bodyRich, bodyHtml }) → AES-256-GCM encryption
      ↓
Returns: { ciphertext, nonce, keyVersion }
      ↓
prisma.letter.create({
  bodyCiphertext, bodyNonce, keyVersion, bodyFormat: "rich"
})
      ↓
trackLetterCreation(user.id) → Usage tracking
      ↓
inngest.send("letter.created", { letterId, userId }) → Confirmation email
      ↓
Return: { success: true, data: { id, title } }
```

**Encryption**: `apps/web/server/lib/encryption.ts`
- AES-256-GCM algorithm
- Key versioning for rotation (V1-V5 support)
- Per-record unique nonce (96-bit)

---

### Phase 7: Delivery Scheduling (Server Action)

**Server Action**: `scheduleDelivery()` in `apps/web/server/actions/deliveries.ts`

```
Client: await scheduleDelivery({
  letterId, channel: "email", recipientEmail, deliverAt
})
      ↓
Server: requireUser()
      ↓
Validation:
  - Time bounds: 5 minutes to 100 years in future
  - Zod schema validation
      ↓
Check entitlements:
  - canScheduleDeliveries?
  - Has credits for channel?
      ↓
Auto-link pending subscription if needed
      ↓
ATOMIC TRANSACTION:
  ├── Decrement credit (email or physical)
  ├── Create delivery record (status: "scheduled")
  ├── Create channel-specific record (EmailDelivery or MailDelivery)
  └── Record credit transaction (audit trail)
      ↓
inngest.send("delivery.scheduled", { deliveryId }) → Main delivery job
inngest.send("notification.delivery.scheduled", { deliveryId }) → Confirmation email
      ↓
Return: { success: true, data: { id, deliverAt, status } }
```

**Critical Safeguard**: If Inngest fails to enqueue, the entire transaction rolls back and credit is refunded.

---

### Phase 8: Confirmation Email (Background Job)

**Worker**: `workers/inngest/functions/send-delivery-scheduled-email.ts`

```
Event: notification.delivery.scheduled
      ↓
Inngest Function: sendDeliveryScheduledEmail
      ↓
Step 1: fetch-delivery
  - Get delivery with user, letter, emailDelivery relations
  - Get user's locale preference
      ↓
Step 2: send-email
  - Generate HTML/text from React Email template
  - Idempotency key: "delivery-scheduled-{deliveryId}"
  - Send via provider abstraction (Resend/Postmark)
      ↓
Return: { success: true, messageId }
```

---

### Phase 9: Delivery Execution (Background Job)

**Worker**: `workers/inngest/functions/deliver-email.ts`

```
Event: delivery.scheduled
      ↓
Inngest Function: deliverEmail (5 retries, exponential backoff)
      ↓
Step 1: fetch-delivery
  - Get delivery record
  - Verify status is "scheduled"
      ↓
Step 2: update-status-processing
  - delivery.status = "processing"
      ↓
Step 3: wait-for-delivery-time
  - step.sleepUntil(delivery.deliverAt) → DURABLE SLEEP
      ↓
Step 4: fetch-encrypted-content
  - Fresh fetch from DB (Buffer serialization workaround)
  - Get letter.bodyCiphertext, bodyNonce, keyVersion
      ↓
Step 5: decrypt-letter
  - decryptLetter() → { bodyRich, bodyHtml }
      ↓
Step 6: render-email
  - Generate final HTML from template
  - Inject letter content
      ↓
Step 7: send-with-primary
  - Idempotency key: "delivery-{deliveryId}-attempt-{attemptCount}"
  - Try primary provider (Resend)
      ↓
[If primary fails]
Step 8: send-with-fallback
  - Try fallback provider (Postmark)
      ↓
Step 9: update-delivery-sent
  - delivery.status = "sent"
  - Store messageId, sentAt
      ↓
Return: { success: true, messageId, provider }
```

**onFailure Handler**: After 5 failed attempts, marks delivery as "failed" with error details.

---

### Phase 10: Backstop Reconciler (Cron Job)

**API Route**: `/apps/web/app/api/cron/reconcile-deliveries/route.ts`

```
Vercel Cron: Every 5 minutes
      ↓
Authorization: Bearer CRON_SECRET
      ↓
Query: SELECT deliveries WHERE
  - status = 'scheduled'
  - deliver_at < NOW() - 5 minutes
  - (no inngest_run_id OR updated_at > 1 hour ago)
  FOR UPDATE SKIP LOCKED
      ↓
For each stuck delivery:
  - triggerInngestEvent("delivery.scheduled", { deliveryId })
  - Increment attemptCount
  - Create audit event
      ↓
Alert if > 10 stuck deliveries found
      ↓
Return: { count, reconciliationRate }
```

---

## 2. Bugs Found

### BUG #1: Missing Letter Relation in cancelDelivery (CRITICAL)

**Location**: `apps/web/server/actions/deliveries.ts:753-793`

**Problem**:
```typescript
// Line 753 - Query does NOT include letter relation
const existing = await prisma.delivery.findFirst({
  where: {
    id: deliveryId,
    userId: user.id,
    status: { in: ["scheduled", "failed"] },
  },
})

// Line 788 - Tries to access letter property (WILL BE UNDEFINED)
if (existing.letter) {
  await tx.letter.update({
    where: { id: existing.letter.id },  // existing.letter is undefined!
    data: { status: "CANCELLED" },
  })
}
```

**Impact**: Letter status is NEVER updated to CANCELLED when a delivery is cancelled. The conditional check `if (existing.letter)` will always be falsy because `letter` is never included in the query.

**Fix**: Add `include: { letter: true }` to the findFirst query.

**Severity**: HIGH - Data integrity issue

---

### BUG #2: Reconciliation Rate Calculation is Wrong

**Location**: `apps/web/app/api/cron/reconcile-deliveries/route.ts:112-117`

**Problem**:
```typescript
// Assumes ~100 deliveries/period - this is arbitrary and wrong
const reconciliationRate = (stuckDeliveries.length / 100) * 100

// Alert if > 0.1% - but this calculation is meaningless
if (reconciliationRate > 0.1) {
  console.error(`❌ Reconciliation rate too high: ${reconciliationRate}%`)
}
```

**Impact**: The SLO monitoring is completely broken. The rate should be calculated against actual scheduled deliveries in the time period, not a hardcoded 100.

**Fix**: Query total scheduled deliveries in the past 5 minutes and calculate actual percentage.

**Severity**: MEDIUM - Monitoring gap

---

### BUG #3: Letter Editor Component is Too Large

**Location**: `apps/web/components/v3/letter-editor-v3.tsx` (1,116 lines)

**Problem**: Single component handling too many responsibilities:
- Form state management
- Autosave logic
- Anonymous draft migration
- Credit eligibility computation
- Delivery channel selection
- Confirmation modal
- Celebration modal
- Error handling

**Impact**:
- Hard to test individual features
- High cognitive load for maintenance
- Potential performance issues from re-renders

**Recommendation**: Split into smaller components:
- `LetterForm.tsx` - Form fields and state
- `DeliveryChannelSelector.tsx` - Channel selection
- `AutosaveManager.tsx` - Autosave hook
- `CreditEligibilityGuard.tsx` - Credit checks
- `ConfirmationFlow.tsx` - Modal management

**Severity**: MEDIUM - Maintainability

---

### BUG #4: Race Condition in Credit Deduction

**Location**: `apps/web/server/actions/deliveries.ts` (scheduleDelivery)

**Problem**: The entitlement check and credit deduction are not atomic:
```typescript
// Step 1: Check credits (outside transaction)
const entitlements = await getEntitlements(user.id)
if (entitlements.limits.emailsReached) {
  return { error: "No credits" }
}

// Step 2: Deduct credit (inside transaction)
await tx.user.update({
  data: { emailCredits: { decrement: 1 } }
})
```

**Impact**: Between the check and deduction, another request could deduct the last credit, resulting in negative credit balance.

**Fix**: Move credit check inside the transaction with `FOR UPDATE` lock.

**Severity**: MEDIUM - Edge case race condition

---

### BUG #5: No Physical Mail Worker Exists

**Location**: `workers/inngest/functions/` - Missing `deliver-mail.ts`

**Problem**: The schema supports physical mail (`channel: "mail"`), but there's no Inngest worker to handle physical mail delivery via Lob API.

**Impact**: Users on PAPER_PIXELS plan can schedule physical mail, but it will never be delivered.

**Recommendation**: Either:
1. Implement the physical mail worker
2. Disable physical mail scheduling in UI until implemented
3. Add feature flag check in scheduleDelivery

**Severity**: HIGH - Feature gap (if physical mail is advertised)

---

## 3. Bad Patterns Identified

### Pattern #1: Inconsistent Error Handling

Some functions use `ActionResult<T>` pattern:
```typescript
return { success: false, error: { code, message } }
```

Others throw errors:
```typescript
throw new Error("Not found")
```

**Recommendation**: Standardize on ActionResult for all server actions.

---

### Pattern #2: Magic Numbers

```typescript
const LOCK_WINDOW_MS = 72 * 60 * 60 * 1000  // OK - named constant
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)  // OK - inline
const MAX_AGE_MS = 5 * 60 * 1000  // OK - named

// But in reconcile-deliveries:
const reconciliationRate = (stuckDeliveries.length / 100) * 100  // BAD - magic 100
```

---

### Pattern #3: Type Safety Gaps

```typescript
// In subscribe/actions.ts
const planMap: Record<string, PlanType> = {
  "digital capsule": "DIGITAL_CAPSULE",
  ...
}
const plan = planMap[product.name.toLowerCase()] || "DIGITAL_CAPSULE"
```

If Stripe product name changes, this silently falls back to wrong plan.

**Fix**: Use product.id or price.id for deterministic mapping.

---

### Pattern #4: Audit Event Types Not Centralized

Some audit events use string literals:
```typescript
type: "delivery.reconciled"
type: "system.reconciler_high_volume"
```

Others use enum:
```typescript
type: AuditEventType.SUBSCRIPTION_LINKED
```

**Recommendation**: Centralize all audit types in the enum.

---

## 4. Good Patterns Identified

### Pattern #1: ActionResult Pattern (Excellent)

```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError }
```

Provides type-safe error handling with discriminated unions. Used consistently in billing.ts and most server actions.

---

### Pattern #2: Atomic Transactions with Rollback

```typescript
await prisma.$transaction(async (tx) => {
  // Deduct credit
  await tx.user.update({ data: { emailCredits: { decrement: 1 } } })

  // Create delivery
  const delivery = await tx.delivery.create({ ... })

  // If Inngest fails, entire transaction rolls back
  await inngest.send("delivery.scheduled", { deliveryId: delivery.id })
})
```

Credit deduction is safely rolled back if any step fails.

---

### Pattern #3: Encryption Key Rotation Support

```typescript
const getEncryptionKey = async (version = 1): Promise<CryptoKey> => {
  const envKey = `CRYPTO_MASTER_KEY_V${version}`
  // Falls back to CRYPTO_MASTER_KEY for V1
}
```

Future-proofed for key rotation without data migration.

---

### Pattern #4: Provider Abstraction

```typescript
interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>
  getName(): string
}

const provider = await getEmailProvider()  // Returns Resend or Postmark
await provider.send({ to, from, html })
```

Easy to switch providers or add fallbacks.

---

### Pattern #5: Idempotency Keys

```typescript
const idempotencyKey = `delivery-${deliveryId}-attempt-${attemptCount}`
headers: { "X-Idempotency-Key": idempotencyKey }
```

Prevents duplicate sends on retry. Key includes attempt count for intentional retries.

---

### Pattern #6: Durable Sleep with Inngest

```typescript
await step.sleepUntil("wait-for-delivery-time", delivery.deliverAt)
```

Survives server restarts. Inngest handles the wake-up scheduling.

---

### Pattern #7: Advisory Locks for Concurrency

```typescript
const lockAcquired = await acquireAdvisoryLock(userId, 5000)
try {
  // Critical section
} finally {
  await prisma.$executeRaw`SELECT pg_advisory_unlock(hashtext(${userId}))`
}
```

PostgreSQL advisory locks prevent race conditions in subscription linking.

---

### Pattern #8: Self-Healing Auth

```typescript
// If user not in DB but has Clerk session, auto-create
if (!user && autoProvisionEnabled) {
  const clerkUser = await clerk.users.getUser(clerkUserId)
  user = await prisma.user.create({ data: { ... } })
}
```

System recovers from webhook failures automatically.

---

### Pattern #9: Credit Transaction Audit Trail

```typescript
await recordCreditTransaction({
  userId,
  creditType: "email",
  transactionType: "deduct_delivery",
  amount: -1,
  source: deliveryId,
  tx,  // Inside transaction for consistency
})
```

Every credit change is logged with before/after balances.

---

### Pattern #10: Webhook Dead Letter Queue

```typescript
onFailure: async ({ event, error }) => {
  await prisma.failedWebhook.create({
    data: {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      payload: stripeEvent,
      error: error.message,
    },
  })
}
```

Failed webhooks are preserved for manual investigation.

---

## 5. API Request Sequence (Complete)

| Step | Action | API/Endpoint | Method |
|------|--------|--------------|--------|
| 1 | Visit landing | `/` (page) | GET |
| 2 | Click sign-up | `/sign-up` (page) | GET |
| 3 | Submit signup | Clerk API | POST |
| 4 | Webhook | `/api/webhooks/clerk` | POST |
| 5 | Redirect to app | `/journey` (page) | GET |
| 6 | Load entitlements | `getEntitlements()` | Server Action |
| 7 | Navigate to write | `/letters/new` (page) | GET |
| 8 | Get eligibility | `getDeliveryEligibility()` | Server Action |
| 9 | Write letter | (client-side) | - |
| 10 | Autosave | localStorage | - |
| 11 | Click seal | (client-side) | - |
| 12 | Confirm | `createLetter()` | Server Action |
| 13 | Schedule | `scheduleDelivery()` | Server Action |
| 14 | Inngest event | `delivery.scheduled` | Internal |
| 15 | Inngest event | `notification.delivery.scheduled` | Internal |
| 16 | Confirmation email | Resend/Postmark | External |
| 17 | Sleep until delivery time | Inngest step | Internal |
| 18 | Decrypt letter | `decryptLetter()` | Internal |
| 19 | Send letter | Resend/Postmark | External |
| 20 | Update status | `prisma.delivery.update()` | Internal |

---

## 6. Rating Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| **Architecture** | 85/100 | Clean separation, good abstractions |
| **Security** | 90/100 | Encryption, idempotency, signature verification |
| **Error Handling** | 75/100 | ActionResult pattern good, but inconsistent |
| **Durability** | 90/100 | Inngest steps, backstop reconciler, DLQ |
| **Testability** | 65/100 | Large components, tight coupling in places |
| **Code Quality** | 75/100 | Some bugs, magic numbers, type gaps |
| **Documentation** | 80/100 | Good inline comments, comprehensive CLAUDE.md |
| **Monitoring** | 70/100 | Audit events exist, but reconciliation calc broken |

**Overall: 78/100**

---

## 7. Priority Fix Recommendations

### P0 (Critical - Fix Immediately)
1. **BUG #1**: Add `include: { letter: true }` in cancelDelivery query
2. **BUG #5**: Implement physical mail worker OR disable UI

### P1 (High - Fix This Sprint)
3. **BUG #4**: Move credit check inside transaction with row lock
4. Fix reconciliation rate calculation

### P2 (Medium - Technical Debt)
5. Split letter-editor-v3.tsx into smaller components
6. Standardize error handling on ActionResult
7. Centralize all audit event types

### P3 (Low - Nice to Have)
8. Replace magic numbers with named constants
9. Add product ID mapping instead of name-based plan detection

---

## 8. Conclusion

Capsule Note demonstrates **strong architectural foundations** with enterprise-grade patterns for security, durability, and reliability. The encryption system, provider abstraction, and Inngest integration are particularly well-designed.

However, the codebase has **accumulated technical debt** in the form of large components, inconsistent patterns, and several bugs that could impact data integrity. The critical bug in `cancelDelivery` should be fixed immediately.

With the recommended fixes applied, this could easily be an **85-90/100** system.

---

*Report generated by Claude Code deep-dive analysis*
