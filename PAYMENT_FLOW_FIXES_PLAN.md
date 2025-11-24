# Payment & Registration Flow Fixes Plan

This document outlines the implementation plan to fix the critical and high-severity issues identified in the Codebase Audit (Deep Dive: Payments, Registration & Workers).

Each item below is formatted as a "ready-to-work" task ticket.

---

## 🎫 Task 1: Fix Transaction Safety in Clerk Webhook (Critical)

**Priority:** Critical
**Files:** `apps/web/app/api/webhooks/clerk/route.ts`

### 📋 Description
The `user.deleted` webhook handler currently executes external Stripe API calls (canceling subscriptions, deleting customers) inside a Prisma database transaction. This is dangerous because external API latency can hold database locks for too long, potentially exhausting the connection pool and causing site-wide outages.

### ✅ Acceptance Criteria
1.  Stripe API calls (subscription cancellation, customer deletion) must NOT happen inside the Prisma `$transaction`.
2.  If Stripe deletion fails, the user should still be soft-deleted in the local database (or vice-versa, but local deletion is priority).
3.  Ideally, offload the cleanup to a background job to ensure reliability.

### 🛠️ Implementation Plan
1.  **Create a new Inngest function:** `workers/inngest/functions/users/cleanup-deleted-user.ts`.
    *   Trigger: `user/deleted` (new event).
    *   Steps:
        *   Fetch user profile to get `stripeCustomerId`.
        *   Call Stripe API to cancel subscriptions and delete customer.
        *   Log success/failure.
2.  **Refactor `apps/web/app/api/webhooks/clerk/route.ts`**:
    *   Remove the Stripe logic from the `user.deleted` case.
    *   Keep the Prisma transaction for local data cleanup (soft delete user, cancel deliveries, etc.).
    *   Trigger the new Inngest event `user/deleted` *after* the local transaction commits (or before, depending on preference, but "fire and forget" is fine here).
    *   *Alternative (Simpler):* Just move the Stripe code block *before* the `prisma.$transaction` block in the webhook. If Stripe fails, log it but proceed to delete the local user.

---

## 🎫 Task 2: Fix Inngest Idempotency Logic Bug (Critical)

**Priority:** Critical
**Files:** `workers/inngest/functions/billing/process-stripe-webhook.ts`

### 📋 Description
The `claim-idempotency` step in the Stripe webhook processor handles duplicate events incorrectly. If the `WebhookEvent` record already exists (Prisma error `P2002`), it throws a `NonRetriableError`.

However, if the worker crashes *after* creating the record but *before* Inngest marks the step as complete, the retry will fail with `P2002` and the event will be permanently dropped.

### ✅ Acceptance Criteria
1.  Retries of the `claim-idempotency` step must succeed even if the database record already exists.
2.  The function should still prevent *actual* double-processing of the business logic.

### 🛠️ Implementation Plan
1.  Modify `workers/inngest/functions/billing/process-stripe-webhook.ts`:
    *   Change `prisma.webhookEvent.create` to `prisma.webhookEvent.upsert` OR catch `P2002` and check if the event is "fresh".
    *   **Recommended Logic:**
        ```typescript
        try {
          await prisma.webhookEvent.create({ ... })
        } catch (err) {
          if (err.code === 'P2002') {
             // Check if we are in a retry context or if this is a true duplicate from Stripe
             // If the record exists, we can just return and let the next step run.
             // The "idempotency" is actually ensuring we have a record locked.
             console.log("Event record already exists, proceeding...")
             return;
          }
          throw err;
        }
        ```
    *   *Correction:* The goal of that step is to "claim" it. If it exists, it might mean another worker is processing it OR we crashed.
    *   **Better Logic:** Use `upsert`. If it exists, do nothing. The *next* step (`process-event`) is where the work happens. Inngest guarantees steps run in order. If `claim-idempotency` succeeds (even if it was a no-op because it existed), `process-event` runs.
    *   *Refinement:* We need to ensure we don't process it twice if two *different* Inngest runs pick it up. Inngest handles this via `id: "process-stripe-webhook"`. The manual DB lock is an extra safety layer.
    *   **Final Fix:** Remove `NonRetriableError`. If `P2002` occurs, just log "Record exists" and return successfully from the step. This allows the function to proceed to the next step (processing).

---

## 🎫 Task 3: Centralize Billing Constants (High)

**Priority:** High
**Files:**
*   `apps/web/server/lib/billing-constants.ts` (New)
*   `workers/inngest/functions/billing/handlers/checkout.ts`
*   `workers/inngest/functions/billing/handlers/subscription.ts`
*   `apps/web/app/subscribe/actions.ts`

### 📋 Description
The `PLAN_CREDITS` object and helper functions like `toDateOrNow` are duplicated across three files. This creates a risk of inconsistent business logic.

### ✅ Acceptance Criteria
1.  A single source of truth exists for Plan Credits and Plan Types.
2.  All consumers import from this shared file.

### 🛠️ Implementation Plan
1.  Create `apps/web/server/lib/billing-constants.ts`.
2.  Move `PLAN_CREDITS` constant there.
3.  Move `toDateOrNow` and `ensureValidDate` helpers there.
4.  Update imports in the 3 affected files to use the new library.

---

## 🎫 Task 4: Robust Subscription Linking (High)

**Priority:** High
**Files:** `apps/web/app/api/webhooks/clerk/route.ts`

### 📋 Description
In the `user.created` webhook, if `linkPendingSubscription` fails, the error is logged but the webhook returns 200. This results in a "silent failure" where a user pays but doesn't get their plan.

### ✅ Acceptance Criteria
1.  If `linkPendingSubscription` fails with a transient error, the webhook should throw (return 500) to trigger a retry.
2.  Alternatively, queue a dedicated background job to retry linking.

### 🛠️ Implementation Plan
1.  Modify `apps/web/app/api/webhooks/clerk/route.ts`:
    *   Capture the result of `linkPendingSubscription`.
    *   If `!result.success`, check the error type.
    *   If it's a "User not found" (unlikely in this flow) or "Already linked", log and ignore.
    *   If it's an unknown error, throw `new Error("Failed to link subscription")` to force Clerk to retry the webhook.
    *   *Bonus:* Add an Inngest event `billing/link-subscription.retry` and trigger it on failure for more robust handling.

---

## 🎫 Task 5: Fix Advisory Lock Collision Risk (Medium)

**Priority:** Medium
**Files:** `apps/web/app/subscribe/actions.ts`

### 📋 Description
The code uses `pg_advisory_lock(hashtext(userId))`. `hashtext` returns a 32-bit integer, which has a collision risk.

### ✅ Acceptance Criteria
1.  Reduce the risk of lock collisions between different parts of the application.

### 🛠️ Implementation Plan
1.  Change the lock key to include a namespace.
    *   Old: `hashtext(userId)`
    *   New: `hashtext('link_sub:' + userId)`

---

## 🎫 Task 6: Implement DLQ Alerting (Medium)

**Priority:** Medium
**Files:** `workers/inngest/functions/billing/process-stripe-webhook.ts`

### 📋 Description
The `onFailure` handler has a TODO for alerting. We need to know when webhooks fail permanently.

### ✅ Acceptance Criteria
1.  When a webhook moves to the DLQ (Dead Letter Queue), an email or log alert is sent.

### 🛠️ Implementation Plan
1.  In `process-stripe-webhook.ts`, inside `onFailure`:
    *   Use the existing `sendEmail` utility (or `resend` directly) to send an email to the developer/admin email address defined in env vars.
    *   Subject: `[URGENT] Stripe Webhook Failed (DLQ)`
    *   Body: Event ID, Type, Error Stack.

---

## 🎫 Task 7: Sanitize Stripe Metadata (Low)

**Priority:** Low
**Files:** `apps/web/app/subscribe/actions.ts`

### 📋 Description
User-provided metadata is passed directly to Stripe. Stripe has limits (50 keys, 500 chars).

### ✅ Acceptance Criteria
1.  Metadata passed to Stripe is sanitized.

### 🛠️ Implementation Plan
1.  Create a helper `sanitizeMetadata(metadata: Record<string, any>)`.
2.  Truncate strings to 500 chars.
3.  Slice keys to 50 items.
4.  Apply this helper in `createAnonymousCheckout`.
