# CapsuleNote Codebase Audit Report

## 1. Executive Summary

**Project Name:** CapsuleNote
**Date:** November 21, 2025
**Auditor:** Antigravity (AI Assistant)

This report provides a comprehensive audit of the CapsuleNote codebase. The application is a modern, full-stack web platform built to allow users to write, schedule, and send letters (digital and physical) to their future selves or others. The codebase is structured as a monorepo using Turborepo, leveraging Next.js for the frontend and backend API, with a robust set of integrations including Clerk (Auth), Stripe (Payments), Resend (Email), Lob (Physical Mail), and Inngest (Background Jobs).

**Overall Assessment:** The codebase is well-structured, modern, and demonstrates a high standard of engineering practices. It prioritizes security (content encryption), scalability (serverless-ready, background jobs), and type safety (TypeScript, Zod, Prisma).

## 2. Architecture & Technology Stack

### 2.1 Monorepo Structure
The project uses **Turborepo** to manage a monorepo workspace, promoting code sharing and build optimization.
- **`apps/web`**: The main Next.js 15 application.
- **`packages/prisma`**: Database schema and client configuration.
- **`packages/config`**: Shared configuration (ESLint, TypeScript).
- **`packages/types`**: Shared type definitions.

### 2.2 Core Technologies
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **State Management**: React Server Components (Server State), React Hook Form (Form State)
- **Job Queue**: Inngest
- **Caching/Rate Limiting**: Upstash Redis

## 3. Database Design (Prisma)

The database schema (`packages/prisma/schema.prisma`) is well-designed and normalized.

### 3.1 Key Models
- **User & Profile**: Separates identity (Clerk) from application profile data.
- **Letter**: The core entity. Notably includes `bodyCiphertext` and `bodyNonce`, indicating that letter content is encrypted at rest.
- **Delivery**: Handles scheduling and status for both Email and Mail channels.
- **Subscription & Payment**: Comprehensive modeling of subscriptions (Stripe) and usage limits.
- **PendingSubscription & AnonymousDraft**: Supports complex flows like anonymous checkout and draft restoration.

### 3.2 Strengths
- **Encryption**: `bodyCiphertext` ensures user privacy.
- **Audit Logging**: `AuditEvent` table tracks critical system actions.
- **Idempotency**: `WebhookEvent` and `FailedWebhook` tables support robust event processing.
- **Scalability**: Indexes are well-placed on frequently queried fields (`userId`, `status`, `createdAt`).

## 4. Security Audit

### 4.1 Data Privacy
- **Content Encryption**: The presence of `apps/web/server/lib/encryption.ts` and the schema design confirms that sensitive letter content is encrypted. This is a critical feature for a "journaling" type application.
- **Authentication**: Delegated to Clerk, a secure industry-standard provider.

### 4.2 Authorization
- **Row-Level Security (Application Layer)**: The use of `apps/web/server/lib/entitlements.ts` suggests a centralized logic for checking user permissions and subscription limits.

### 4.3 Infrastructure
- **Environment Variables**: Managed via `@t3-oss/env-nextjs` (`env.mjs`), ensuring type-safe and validated configuration.

## 5. Code Quality & Organization

### 5.1 Project Structure (`apps/web`)
The Next.js App Router structure is utilized effectively:
- **`(app)` vs `(marketing)`**: Clear separation of authenticated app logic and public marketing pages using Route Groups.
- **`server/` directory**: Explicit separation of server-side logic (Actions, Libs) from UI components, which is excellent for security and clarity in Next.js.
- **`components/`**: Likely follows a modular pattern (UI primitives vs. feature components).

### 5.2 Testing
- **Unit/Integration**: Vitest is configured.
- **E2E**: Playwright is configured.
- **Coverage**: `__tests__` directories are present, indicating a commitment to testing.

### 5.3 Developer Experience
- **Linting/Formatting**: ESLint and Prettier are configured.
- **Type Safety**: Strict TypeScript usage throughout.
- **Tooling**: `turbo.json` ensures efficient builds and linting across the monorepo.

## 6. Key Features Implementation

- **Letter Editor**: Uses Tiptap (`@tiptap/react`) for a rich text editing experience.
- **Background Jobs**: Inngest is used for reliable delivery of scheduled letters, handling retries and failures gracefully.
- **Physical Mail**: Integration with Lob for sending physical letters.
- **3D Elements**: Usage of `three` and `@react-three/fiber` suggests a premium, interactive UI (likely for the "Time Capsule" visualization).

## 7. Recommendations

While the codebase is high-quality, the following areas could be reviewed for continuous improvement:

1.  **Documentation**: Ensure `CONTRIBUTING.md` and `README.md` are kept up-to-date with the rapid development of features.
2.  **Key Rotation**: The `keyVersion` field in `Letter` model suggests a key rotation strategy. Ensure the implementation of this rotation logic is robust and tested.
3.  **Error Handling**: Verify that the `FailedWebhook` pattern is effectively monitored and alerted on.
4.  **Performance**: With 3D elements (`three.js`), ensure lazy loading and performance optimization to avoid impacting Core Web Vitals on lower-end devices.

---

# Deep Dive Audit: Payments, Registration & Workers
**Date:** November 24, 2025
**Scope:** Stripe, Clerk, Inngest, User Registration Flow, Paywall Logic.

## 1. Critical Findings (Immediate Action Required)

### 1.1 Transaction Safety Violation in Clerk Webhook
**Location:** `apps/web/app/api/webhooks/clerk/route.ts` (Lines 206-273)
**Issue:** The `user.deleted` handler executes external API calls (Stripe cancellation and customer deletion) *inside* a Prisma database transaction.
**Risk:** External API calls are unpredictable. If Stripe is slow or times out, the database transaction remains open, holding locks on the `User` table and potentially exhausting the database connection pool. This can bring down the entire application during high load or network issues.
**Recommendation:** Move Stripe API calls *outside* the transaction.
- **Option A:** Perform Stripe cleanup first. If it fails, log it but proceed with local deletion (or vice-versa).
- **Option B (Best):** Queue a "cleanup user data" job to Inngest upon receiving the webhook. Let the worker handle Stripe deletion and then local DB deletion.

### 1.2 Inngest Idempotency Logic Bug
**Location:** `workers/inngest/functions/billing/process-stripe-webhook.ts` (Lines 218-247)
**Issue:** The `claim-idempotency` step attempts to create a `WebhookEvent` record. If it fails with `P2002` (unique constraint), it throws `NonRetriableError`.
**Scenario:**
1. Inngest runs `claim-idempotency`. The DB record is created.
2. The Inngest step completes, but the worker crashes or network fails *before* Inngest records the step completion.
3. Inngest retries the function.
4. It runs `claim-idempotency` again.
5. The DB insert fails because the record already exists (`P2002`).
6. The code throws `NonRetriableError`, permanently failing the job.
**Result:** The event is never processed, even though it was valid.
**Recommendation:** Use `upsert` or check for existence. If the record exists, check if it was processed. Ideally, rely on Inngest's built-in deduplication (using `id` in `inngest.createFunction` options) or modify the logic to treat `P2002` as "success, proceed" if the processing hasn't happened yet.

## 2. High Severity Findings

### 2.1 Silent Failure in Subscription Linking
**Location:** `apps/web/app/api/webhooks/clerk/route.ts` (Lines 160-173)
**Issue:** When a new user is created, the code attempts to link a pending subscription (`linkPendingSubscription`). If this fails (returns `{ success: false }`), the error is logged, but the webhook returns 200 OK.
**Risk:** The user account is created, but their paid subscription is not attached. The user will be confused and likely contact support.
**Recommendation:**
- Throw an error if linking fails to trigger a webhook retry (if the error is transient).
- Or better, queue a dedicated `billing.link-subscription` job to Inngest that can retry independently of the user creation flow.

### 2.2 Hardcoded Plan Credits & Logic Duplication
**Location:** `handlers/checkout.ts`, `handlers/subscription.ts`, `actions.ts`
**Issue:** The `PLAN_CREDITS` object (defining how many credits each plan gets) is hardcoded in three separate files.
**Risk:** If the business logic changes (e.g., "Paper & Pixels" gets 30 emails instead of 24), a developer might update it in one place and miss the others, leading to inconsistent data.
**Recommendation:** Move `PLAN_CREDITS` and helper functions like `toDateOrNow` to a shared library file (e.g., `apps/web/server/lib/billing-constants.ts`).

## 3. Medium Severity Findings

### 3.1 Advisory Lock Collision Risk
**Location:** `apps/web/app/subscribe/actions.ts` (Line 251)
**Issue:** Uses `pg_advisory_lock(hashtext(${userId}))`. `hashtext` returns a 32-bit integer.
**Risk:** While unlikely for UUIDs, hash collisions are possible. If User A and User B hash to the same integer, User A's action could block User B's action unnecessarily.
**Recommendation:** Use a namespaced lock key (e.g., `hashtext('link_sub:' + userId)`) to reduce collision probability with other parts of the app, or use `pg_advisory_xact_lock` (transaction level) if appropriate.

### 3.2 Missing DLQ Alerting
**Location:** `workers/inngest/functions/billing/process-stripe-webhook.ts` (Line 166)
**Issue:** The code has a `TODO` for alerting when a webhook moves to the Dead Letter Queue.
**Risk:** If webhooks fail repeatedly, they will silently pile up in the `FailedWebhook` table without the team knowing.
**Recommendation:** Implement the `sendSlackAlert` or email notification immediately.

## 4. Low Severity Findings

### 4.1 Stripe Metadata Limits
**Location:** `apps/web/app/subscribe/actions.ts` (Line 165)
**Issue:** Passes `...validated.metadata` directly to Stripe.
**Risk:** Stripe limits metadata to 50 keys and 500 characters per value. Unsanitized input could cause the API call to fail.
**Recommendation:** Sanitize and limit metadata before sending to Stripe.

### 4.2 Race Condition in Checkout Handler
**Location:** `workers/inngest/functions/billing/handlers/checkout.ts`
**Issue:** The handler updates `PendingSubscription` status to `payment_complete` *before* checking if the user exists.
**Risk:** Minor race condition where `linkPendingSubscription` (called by Clerk webhook) might run *before* the status update and fail to find the subscription.
**Mitigation:** The current flow eventually resolves itself because `handleCheckoutCompleted` also attempts to link the subscription. No immediate action needed, but worth noting.

## 5. Summary of Recommendations

1.  **Refactor Clerk Webhook:** Remove Stripe API calls from the Prisma transaction.
2.  **Fix Idempotency:** Update `process-stripe-webhook.ts` to handle `P2002` gracefully without permanently failing valid retries.
3.  **Centralize Constants:** Create a `billing-constants.ts` file for `PLAN_CREDITS` and date helpers.
4.  **Robust Linking:** Ensure `linkPendingSubscription` failures are retried or alerted.
5.  **Implement Alerts:** Add Slack/Email alerts for the Dead Letter Queue.
