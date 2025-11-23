# Capsule Note — Stripe Signup Recovery Plan

Deep-dive plan to fix the Stripe → Clerk signup path, making it ticket-ready with clear acceptance criteria and validation steps.

## Objectives
- Eliminate Clerk `<SignUp />` routing errors on `/subscribe/success` so paid users can complete account creation.
- Fix server-side Clerk client usage to stop `clerkClient.users` undefined errors and stabilize `getCurrentUser()/requireUser()`.
- Ensure pending Stripe subscriptions link automatically post-signup with telemetry and regression coverage.

## Context & Diagnosis
- Clerk requires catch-all routing (or hash routing) for embedded `<SignUp />`. Current route `/subscribe/success` is not catch-all, triggering Clerk error.
- In Clerk v6, `clerkClient` from `@clerk/nextjs/server` is an async factory. Current code treats it as a ready client (`clerkClient.users.getUser`), causing runtime `Cannot read properties of undefined (reading 'getUser')` when dashboard loads.
- Subscription linking relies on `getCurrentUser` autoprovisioning; failures above block webhook/linking paths and surface as dashboard crashes.

## Ticket-Ready Tasks
- [x] **T1 — Stabilize Clerk routing on success page**
  - Convert `/subscribe/success` to optional catch-all route (`app/subscribe/success/[[...rest]]/page.tsx`) to satisfy Clerk sub-routing.
  - Add `routing="hash"` to `<SignUp />` on the success page as a belt-and-suspenders fallback (keeps URL clean, avoids nested routing issues).
  - Verify middleware `isPublicRoute` still allows `/subscribe/success(.*)` (adjust matcher if needed).
  - AC: Visiting `/subscribe/success?session_id=...` and `/subscribe/success/foo` renders signup without Clerk config errors.

- [x] **T2 — Correct Clerk client usage across server code**
  - Introduce a tiny helper (e.g., `getClerkClient()` in `apps/web/server/lib/clerk.ts`) that awaits `clerkClient()` once and returns the real client.
  - Refactor all server paths to use the awaited client: `apps/web/server/lib/auth.ts`, `apps/web/app/subscribe/actions.ts`, `apps/web/app/api/webhooks/clerk/route.ts`, `apps/web/server/actions/gdpr.ts`, test helpers/mocks, and any remaining `clerkClient.users` usages.
  - Add type-safe imports to prevent regressions (eslint rule or utility export).
  - AC: No `clerkClient.users` undefined errors in runtime or tests; type-check passes where enabled.

- [x] **T3 — Harden `getCurrentUser` and auth fallback**
  - Add explicit guard/telemetry for missing `userId` from `clerkAuth()` to return `null` cleanly.
  - Wrap Clerk fetch with error boundary: log structured error, avoid throwing to callers; return `null` on Clerk outages.
  - Add a feature flag to bypass auto-provisioning in case of repeated Clerk outages (ops safety).
  - AC: `getCurrentUser` never throws on Clerk errors; returns `null` and logs; dashboard handles unauthenticated state gracefully.

- [x] **T4 — Reliable pending subscription linking after signup**
  - Ensure `linkPendingSubscription` is invoked in success page flow after auth and by Clerk webhook; add idempotent call in dashboard mount guarded by a short circuit to avoid excess DB churn.
  - Add structured logs/metrics for linking attempts (found/not found/linked/already linked/email not verified).
  - Add DB/index check for `pendingSubscription.email` + `status` to keep lookup performant.
  - AC: After paid checkout + signup, dashboard shows active plan, credits allocated, and no orphaned pending subscriptions remain.

- [x] **T5 — Regression coverage & monitoring**
  - Add integration test for `getCurrentUser` + auto-sync using mocked Clerk client; add unit for `linkPendingSubscription` idempotency.
  - Add Playwright flow: anonymous checkout → success page → signup (locked email) → dashboard shows subscription and credits.
  - Add alerting for repeated `getCurrentUser` Clerk fetch failures and failed linking attempts (Sentry or logs-based metric).
  - AC: Tests cover happy path and failure modes; alerts configured with sensible thresholds.

## Validation & Rollout
- Local: Run vitest integration suite and Playwright flow; manually hit `/subscribe/success?session_id=test` with mocked Stripe session to confirm Clerk renders.
- Staging: Shadow-deploy, monitor Sentry/logs for Clerk fetch errors and success-page render errors; verify one real checkout + signup.
- Rollback: Keep hash-routing toggle and feature flag to disable auto-provisioning; revert route move by symlinking/redirecting if catch-all causes regressions.

## Dependencies/Risks
- Clerk SDK v6 async client pattern is required; ensure no transitive upgrade downgrades this behavior.
- Stripe webhooks must be healthy; linking relies on `payment_complete` pending rows. Add retry/observability if webhook lag is observed.
