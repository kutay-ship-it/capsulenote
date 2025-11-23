# Capsule Note — Test Repair Phase 3 Plan

Goal: Close the remaining 19 failing tests (84% → 100%) with precise, ticket-ready tasks. Focus on test harness correctness (webhook mocks), DST/date math, anonymous checkout expectations, and filling empty suites.

## Workstream 1 — Webhook Test Harness Fixes (12 failures) [P0]
- [ ] **Stripe webhook test event shape**
  - In `apps/web/__tests__/integration/webhooks.test.ts`, ensure Stripe mock events include `created` (unix seconds) and nested `data.object` when invoking handler. Add a shared `buildStripeEvent` helper in the test to avoid regressions.
  - Assert handler receives `event.created` and passes it through age checks.
- [ ] **Clerk webhook test event type**
  - In the same file, fix Clerk test fixtures to set `evt.type` and `evt.data` as Clerk/Svix expects. Add a `buildClerkEvent` helper that mirrors production payload shape.
  - Verify locked-email and pending-subscription tests use that helper to prevent undefined `type` errors.
- [ ] **Resend webhook test payload**
  - Standardize Resend fixtures with `{ type, data: { email_id, ... } }` and headers; ensure handler reads `event.data.email_id`. Add `buildResendEvent` helper and reuse across Resend tests.

## Workstream 2 — Date Utilities (2 failures) [P1]
- [ ] **DST/leap-year correctness**
  - Update `apps/web/components/sandbox/simplified-letter-editor/lib/dateCalculations.ts` tests to cover leap year rollovers and time preservation.
  - If remaining drift persists, adjust helper to clamp using UTC math + calendar-safe month addition (no local offset bleed) and ensure `formatDate` ignores local TZ when formatting dates.

## Workstream 3 — Anonymous Checkout Tests (4 failures) [P1]
- [ ] **Align expectations with auto-linking**
  - In `apps/web/__tests__/webhooks/anonymous-checkout-webhooks.test.ts`, update assertions to allow auto-link when auth flow runs before checks; document timing assumptions.
  - Add explicit `$transaction` mock paths for idempotency, already-linked, expired pending, and transaction-failure branches to satisfy remaining idempotency tests.

## Workstream 4 — Empty/Low-Signal Suites (6 files) [P3]
- [ ] **Add smoke tests or docstrings**
  - For `__tests__/subscribe/actions.test.ts`, `integration/gdpr.test.ts`, `unit/entitlements.test.ts`, `integration/deliveries.test.ts`, `integration/letters-crud.test.ts`, `unit/error-classification.test.ts`, `unit/audit-logging.test.ts`, add a top-level smoke test or an explicit TODO with context so CI isn’t skewed by zero tests. Prefer minimal, fast assertions over disabling.

## Rollout
- Run `pnpm vitest run` after each workstream; ensure 0 remaining failures.
- Keep `E2E_ENABLE_CHECKOUT_FLOW` gating Playwright optional; no changes required unless regressions surface.
