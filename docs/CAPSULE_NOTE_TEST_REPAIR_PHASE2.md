# Capsule Note — Test Repair Phase 2 Plan

Focused on remaining 25 failing tests (17.2%) with enterprise-grade, ticket-ready tasks. Prioritized by production risk.

## Phase 1 — Webhooks & Messaging (P0)
- [ ] **Resend webhook tests: Svix headers**
  - Add Svix header fixtures (`svix-id`, `svix-timestamp`, `svix-signature`) to Resend cases in `apps/web/__tests__/integration/webhooks.test.ts` using `mockHeadersContext`.
  - Ensure handler rejects missing headers and passes for valid headers; assert delivery/bounce updates persist via Prisma mock.

## Phase 2 — Anonymous Checkout Webhooks (P0/P1)
- [ ] **Align tests with auto-link behavior**
  - Update `apps/web/__tests__/webhooks/anonymous-checkout-webhooks.test.ts` to expect auto-link when auth flow runs before assertions; document in test comments.
  - Add explicit Prisma transaction mocks for idempotency and failure branches (`$transaction` success/failure, pending already linked).
  - Cover expired pending subscription path by stubbing `pendingSubscription.status/expiresAt` and ensuring no link + correct response.
  - Add “already linked” validation case and assert no duplicate linking.

## Phase 3 — Date Utilities (P1)
- [ ] **DST-safe date arithmetic**
  - Patch `calculatePresetDate` and formatting helpers to be timezone-stable (UTC math + preserve wall-clock time) and add unit coverage for DST boundaries, leap years, and year-end.
  - Ensure formatting isolates date from time-of-day so rendering is consistent.

## Phase 4 — Feature Flags (P2)
- [ ] **Robust Unleash mocking**
  - Introduce a dedicated Unleash mock helper that returns deterministic `enabled` values and captures context payload.
  - Set CI env defaults (`UNLEASH_API_URL`, `UNLEASH_API_TOKEN`) in test setup to avoid undefined fetch paths.
  - Update `apps/web/__tests__/unit/feature-flags.test.ts` to assert context payload (user/session) and success path when Unleash is configured.

## Phase 5 — Encryption Edge Case (P2)
- [ ] **Missing master key behavior**
  - Decide and codify behavior when `CRYPTO_MASTER_KEY` is absent in test mode: either throw (preferred) or adjust test expectation to match fallback. Implement guard in encryption util and update the single failing test accordingly.

## Phase 6 — Documentation & Skipped Suites (P3)
- [ ] **Document removed/empty tests**
  - Add short docstrings/comments in the following files explaining paid-only migration or deferral: `__tests__/subscribe/actions.test.ts`, `integration/gdpr.test.ts`, `unit/entitlements.test.ts`, `integration/deliveries.test.ts`, `integration/letters-crud.test.ts`, `unit/error-classification.test.ts`, `unit/audit-logging.test.ts`.
  - If appropriate, add TODO tickets or minimal smoke tests to keep coverage hooks alive.

## Rollout & Verification
- Run `pnpm vitest run` to confirm remaining suites pass.
- Optional: run `pnpm test:e2e` with documented envs to ensure no regressions in checkout/signup flow.
