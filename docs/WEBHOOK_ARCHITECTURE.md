# Webhook Architecture & Flow

Visual guide to webhook processing in DearMe/Capsule Note.

---

## Local Development Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Stripe       │
│ Dashboard    │──┐
└──────────────┘  │
                  │ Webhook Event
                  ▼
              ┌────────────────┐
              │  Stripe CLI    │
              │  (localhost)   │
              └────────────────┘
                  │ Forward with signature
                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    localhost:3000                            │
├──────────────────────────────────────────────────────────────┤
│  POST /api/webhooks/stripe                                   │
│    ├─ Verify signature (STRIPE_WEBHOOK_SECRET)              │
│    ├─ Send to Inngest                                       │
│    └─ Return 200 OK                                         │
└──────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────┐
│         Inngest Worker (localhost:8288)                      │
├──────────────────────────────────────────────────────────────┤
│  process-stripe-webhook                                      │
│    ├─ Step 1: Claim idempotency                            │
│    │   └─ Create webhook_events record (P2002 = duplicate)  │
│    ├─ Step 2: Route event                                   │
│    │   └─ Update subscriptions/payments/etc                 │
│    └─ Step 3: Return success                                │
└──────────────────────────────────────────────────────────────┘


┌──────────────┐
│ Resend       │
│ Dashboard    │──┐
└──────────────┘  │
                  │ Webhook Event
                  ▼
              ┌────────────────┐
              │     ngrok      │
              │ (abc123.ngrok) │
              └────────────────┘
                  │ Tunnel with signature
                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    localhost:3000                            │
├──────────────────────────────────────────────────────────────┤
│  POST /api/webhooks/resend                                   │
│    ├─ Extract Svix headers                                   │
│    ├─ Verify signature (RESEND_WEBHOOK_SECRET)              │
│    ├─ Process event (opens/clicks/bounces)                  │
│    └─ Return 200 OK                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       PRODUCTION                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐                    ┌──────────────┐
│ Stripe       │                    │ Resend       │
│ (Production) │                    │ (Production) │
└──────────────┘                    └──────────────┘
      │                                     │
      │ HTTPS POST                          │ HTTPS POST
      │ with signature                      │ with signature
      ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│              https://your-domain.com                         │
│              (Vercel Production)                             │
└─────────────────────────────────────────────────────────────┘
      │                                     │
      ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────┐
│ /api/webhooks/stripe │          │ /api/webhooks/resend │
│                      │          │                      │
│ ✓ Signature verify   │          │ ✓ Signature verify   │
│ ✓ Send to Inngest    │          │ ✓ Update deliveries  │
│ ✓ Return 200         │          │ ✓ Return 200         │
└──────────────────────┘          └──────────────────────┘
      │
      ▼
┌──────────────────────────────────────────────────────────────┐
│              Inngest Cloud (Production)                      │
│                                                              │
│  process-stripe-webhook                                      │
│    ├─ Idempotency check                                     │
│    ├─ Update subscriptions/payments                         │
│    └─ Retry on failure (3 attempts)                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Stripe Webhook Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Stripe Event Occurs                                       │
│    (e.g., payment_intent.succeeded)                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Stripe sends webhook to your endpoint                    │
│    POST /api/webhooks/stripe                                │
│    Headers:                                                  │
│      - stripe-signature: t=123,v1=abc...                    │
│    Body: { id: "evt_xxx", type: "payment_intent.succeeded" }│
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Route Handler (apps/web/app/api/webhooks/stripe/route.ts)│
│    ├─ Extract raw body                                      │
│    ├─ Get stripe-signature header                           │
│    ├─ Verify with stripe.webhooks.constructEvent()          │
│    │   (Uses STRIPE_WEBHOOK_SECRET)                         │
│    ├─ If invalid: Return 401 Unauthorized                   │
│    └─ If valid: Continue                                    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Send to Inngest                                          │
│    await inngest.send({                                     │
│      name: "stripe/webhook.received",                       │
│      data: { event: stripeEvent }                           │
│    })                                                       │
│    Return 200 OK                                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Inngest: process-stripe-webhook function                 │
│    Step 1: Claim Idempotency                                │
│      ├─ Try: Create webhook_events record (id = evt_xxx)    │
│      ├─ Success: Continue                                   │
│      └─ P2002 (duplicate): throw NonRetriableError ✅       │
│                                                              │
│    Step 2: Route Event                                      │
│      ├─ Switch on event.type                                │
│      ├─ payment_intent.succeeded → handlePaymentSuccess()   │
│      ├─ invoice.payment_failed → handleInvoiceFailed()      │
│      └─ etc.                                                │
│                                                              │
│    Step 3: Update Database                                  │
│      ├─ Create/update payment records                       │
│      ├─ Update subscription status                          │
│      └─ Send notification emails                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Success or Retry                                         │
│    ├─ Success: Mark complete in Inngest                     │
│    ├─ Retriable Error: Retry up to 3 times                  │
│    ├─ NonRetriableError: Exit gracefully (duplicate) ✅     │
│    └─ Final Failure: Move to DLQ (failed_webhooks table)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Resend Webhook Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Email Event Occurs                                       │
│    (e.g., email opened by recipient)                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Resend sends webhook to your endpoint                   │
│    POST /api/webhooks/resend                                │
│    Headers (Svix standard):                                 │
│      - svix-id: msg_xxx                                     │
│      - svix-timestamp: 1234567890                           │
│      - svix-signature: v1,sig1 v1,sig2                      │
│    Body: {                                                  │
│      type: "email.opened",                                  │
│      data: { email_id: "abc123" }                           │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Route Handler (apps/web/app/api/webhooks/resend/route.ts)│
│    ├─ Extract Svix headers                                  │
│    │   - svix-id, svix-timestamp, svix-signature            │
│    ├─ Validate headers present                              │
│    │   └─ Missing: Return 400 Bad Request                   │
│    └─ Get raw body (needed for signature verification)      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Signature Verification ✅ NEW                            │
│    const webhook = new Webhook(RESEND_WEBHOOK_SECRET)      │
│    try {                                                    │
│      event = webhook.verify(payload, headers)               │
│      // Signature valid, continue                           │
│    } catch (error) {                                        │
│      // Invalid signature                                   │
│      return 401 Unauthorized                                │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Process Event (Verified)                                 │
│    Switch on event.type:                                    │
│                                                              │
│    email.opened:                                            │
│      ├─ Find EmailDelivery by resendMessageId              │
│      └─ Increment opens, update lastOpenedAt                │
│                                                              │
│    email.clicked:                                           │
│      ├─ Find EmailDelivery                                  │
│      └─ Increment clicks                                    │
│                                                              │
│    email.bounced / email.complained:                        │
│      ├─ Find EmailDelivery                                  │
│      ├─ Update Delivery.status = "failed"                   │
│      └─ Increment bounces                                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Database Update                                          │
│    ├─ Transaction for atomic updates                        │
│    ├─ Update delivery records                               │
│    ├─ Update email_delivery metrics                         │
│    └─ Return 200 OK                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Comparison

### Before Fixes ❌

```
Stripe Webhook:
  ✅ Signature verification
  ❌ Missing NonRetriableError import → ReferenceError on duplicates
  ❌ Idempotency breaks, events retry unnecessarily

Resend Webhook:
  ❌ NO signature verification
  ❌ Anyone can POST
  ❌ Can manipulate delivery status
  ❌ Can poison analytics
  ❌ No authentication at all
```

### After Fixes ✅

```
Stripe Webhook:
  ✅ Signature verification
  ✅ NonRetriableError imported correctly
  ✅ Graceful idempotency handling
  ✅ Clean duplicate detection
  ✅ No DLQ pollution

Resend Webhook:
  ✅ Svix signature verification
  ✅ HMAC-SHA256 authentication
  ✅ Timestamp validation (replay attack prevention)
  ✅ Header validation (400 for missing)
  ✅ Unauthorized rejection (401 for invalid)
  ✅ Comprehensive error handling
```

---

## Idempotency Pattern (NonRetriableError Fix)

### Problem Before

```typescript
// ❌ Missing import
throw new NonRetriableError("Event already processed")
// → ReferenceError: NonRetriableError is not defined
// → Inngest retries the error
// → DLQ fills with duplicate events
// → Clean idempotency handling broken
```

### Solution After

```typescript
// ✅ Import added
import { NonRetriableError } from "inngest"

// ✅ Graceful handling
try {
  await prisma.webhookEvent.create({ id: eventId, ... })
} catch (error) {
  if (error?.code === 'P2002') {  // Unique constraint violation
    // Duplicate webhook delivery detected
    throw new NonRetriableError("Event already processed")
    // → Inngest exits cleanly
    // → No retries
    // → No DLQ entry
  }
  throw error  // Other errors still retry
}
```

**Why this matters**:
- Duplicate webhooks are EXPECTED (network retries, load balancers)
- Should exit gracefully, not fill DLQ with noise
- Maintains clean observability
- Prevents false alerts

---

## GDPR Anonymization Pattern

### Problem Before

```typescript
// ❌ Invalid UUID string
await prisma.payment.updateMany({
  where: { userId: user.id },
  data: { userId: "DELETED_USER" }  // ← String, not UUID
})
// → PostgreSQL error: invalid input syntax for type uuid
// → Transaction fails
// → User not deleted
// → GDPR breach (personal data remains)
```

### Solution After

```typescript
// ✅ Valid sentinel UUID
const DELETED_USER_ID = "00000000-0000-0000-0000-000000000000"

// ✅ Ensure system user exists
await tx.user.upsert({
  where: { id: DELETED_USER_ID },
  create: { id: DELETED_USER_ID, ... }
})

// ✅ Transfer to sentinel user
await tx.payment.updateMany({
  where: { userId: user.id },
  data: {
    userId: DELETED_USER_ID,  // ← Valid UUID
    metadata: {
      anonymized: true,
      anonymizedAt: new Date().toISOString(),
      originalUserId: user.id,
      reason: "GDPR Article 17 - Right to Erasure"
    }
  }
})
// → Transaction succeeds
// → Payments anonymized
// → User deleted
// → GDPR compliant
```

**Why this matters**:
- Tax law requires 7-year payment retention
- GDPR Article 17.3.b allows retention for legal compliance
- Anonymization satisfies both requirements
- Audit trail preserved in metadata

---

## Event Flow Timing

```
Local Development (Typical):
  Webhook trigger → Route Handler → Inngest → Complete
  50-200ms          50ms             100-500ms   ✅

  With signature verification: +10-20ms (negligible)

Production (Typical):
  Webhook trigger → Route Handler → Inngest Cloud → Complete
  100-500ms         50-100ms         200-1000ms      ✅

  Retries (if needed): 3 attempts with exponential backoff
    - Attempt 1: immediate
    - Attempt 2: +5 seconds
    - Attempt 3: +15 seconds
    - After 3 failures: → DLQ (failed_webhooks table)
```

---

## Monitoring & Observability

### Key Metrics to Track

**Idempotency Rate**:
```sql
-- Should be < 0.1% of total webhooks
SELECT COUNT(*) FROM webhook_events;
-- vs duplicate detection logs
```

**Webhook Success Rate**:
```
Stripe: > 99.5%
Resend: > 99.5%
```

**Processing Latency**:
```
p50: < 200ms
p95: < 500ms
p99: < 1000ms
```

**DLQ Size**:
```sql
-- Should be nearly zero after fixes
SELECT COUNT(*) FROM failed_webhooks;
```

---

## Security Best Practices

✅ **Always verify signatures** (both Stripe and Resend)
✅ **Use HTTPS in production** (no plain HTTP)
✅ **Validate webhook origin** (IP allowlist optional)
✅ **Log all webhook events** (security audit trail)
✅ **Monitor for anomalies** (unusual patterns)
✅ **Rotate secrets regularly** (quarterly recommended)
✅ **Use idempotency** (prevent duplicate processing)
✅ **Set up alerts** (webhook failures, security events)
❌ **Never skip verification** (even in "trusted" networks)
❌ **Never log secrets** (only log webhook IDs)

---

## Further Reading

- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Svix Webhook Security](https://docs.svix.com/receiving/verifying-payloads/how)
- [Inngest Error Handling](https://www.inngest.com/docs/functions/error-handling)
- [OWASP Webhook Security](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html)
