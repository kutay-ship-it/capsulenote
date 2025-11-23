# Capsule Note — Test Repair & Quality Recovery Plan

This plan turns the test report into phase-by-phase, ticket-ready work. It prioritizes unblockers (encryption, webhooks), then functional correctness (entitlements, delivery, letters), then resiliency (rate limits, feature flags, date utils), and finally coverage/E2E hygiene. All solutions use current best practices for Next.js 15 App Router and Vitest.

## Phase 0 — Immediate Unblockers (P1)
- [x] **Valid test encryption key & guardrails**
  - Generate a 32-byte base64 key in `apps/web/__tests__/setup.ts` (AES-256 requires 32 bytes). Add a tiny runtime validator to fail fast if the key is wrong to prevent silent test breakage.
- [x] **Next.js request context mocking for webhooks**
  - Add a shared `mockHeadersContext` helper (e.g., `apps/web/__tests__/utils/next-context.ts`) that mocks `next/headers` (and `next/cookies` if needed) per-test using Vitest `vi.mock`.
  - Update webhook test files to use the helper so `headers()` is callable in App Router route handlers.

## Phase 1 — Webhook Handlers & Mocks (P1)
- [x] **Stripe webhook tests stable**
  - Refactor `apps/web/__tests__/integration/webhooks.test.ts` to wrap handlers with mocked `headers()` and request bodies.
  - Ensure signature verification is bypassed/controlled with deterministic `svix-*` headers fixture.
- [x] **Clerk webhook tests stable**
  - Apply the same request-context mock to Clerk webhook tests; ensure `getClerkClient()` is mocked to the awaited client shape.
  - Verify locked-email enforcement and pending subscription linking paths with deterministic fixtures.
- [x] **Resend webhook tests stable**
  - Mock headers/context and confirm delivery status updates persist via Prisma mock.

## Phase 2 — Core Delivery & Entitlements (P2)
- [x] **Entitlements test harness fixed**
  - Introduce a Prisma mock factory (vitest-mock-extended or manual) in entitlements unit tests to provide `findUnique`/`findFirst`/`update` stubs.
  - Add a small test-only `createMockPrisma` helper to reuse across suites.
- [x] **Delivery scheduling correctness**
  - Inspect `scheduleDelivery` validation: align error codes with expectations (`SUBSCRIPTION_REQUIRED`, `INSUFFICIENT_CREDITS`).
  - Ensure credit deduction path calls `deductMailCredit` and usage metrics helpers; add spies/mocks and assert calls.
  - Fix update/cancel responses to return truthy flags; add unit assertions.
- [x] **Letters CRUD completeness**
  - Export `getLetterById` from server actions and wire into tests.
  - Map quota failures to `QUOTA_EXCEEDED` instead of `INTERNAL_ERROR`.
  - Align Inngest event name to `letter/created` (or update test expectation if product wants `notification.letter.created`).
  - Validate update/delete actions return expected shapes/status codes.

## Phase 3 — Rate Limits, Feature Flags, Date Utilities (P2/P3)
- [x] **Rate limiting alignment with Upstash API**
  - Mock `@upstash/ratelimit` to return objects exposing `limit()` with `remaining`, `reset`, and allow `slidingWindow` factory; update mocks in integration and unit tests.
  - Fix off-by-one in remaining count calculation inside rate limiter logic.
  - Confirm our implementation matches the current Upstash API shape (upgrade package if needed).
 - [x] **Feature flags reliability**
  - Mock Unleash client in tests to return deterministic values; verify user context serialization and spy expectations.
  - Add a small adapter test to ensure request-scoped user context is passed.
- [x] **Date utility edge cases**
  - Review date-fns usage for 6-month preset, leap years, and time preservation; adjust helpers to keep timezone-aware arithmetic.
  - Add targeted unit cases for leap-year and time preservation regressions.

## Phase 4 — Anonymous Checkout Webhooks (P3)
- [x] **Comprehensive Prisma mocks for pending subscriptions**
  - In `apps/web/__tests__/webhooks/anonymous-checkout-webhooks.test.ts`, provide full mocks for `pendingSubscription` CRUD and transactions.
  - Validate dual-path linking (payment→signup, signup→payment) and idempotency success paths.

## Phase 5 — Coverage, E2E, and Tooling (P3/P4)
- [x] **Coverage enablement**
  - Add `@vitest/coverage-v8` as devDependency and wire `test:coverage` script; ensure CI uses it.
 - [x] **E2E config clarity**
  - Update E2E readme/fixture docs with the env block for checkout flow (E2E_ENABLE_CHECKOUT_FLOW, E2E_STRIPE_PAID_SESSION_ID, PLAYWRIGHT_BASE_URL).
  - Consider adding a lightweight mock-mode E2E that stubs Stripe/Clerk to validate UI flows without live keys.
 - [x] **Operational toggles documented**
  - Document `CLERK_AUTO_PROVISION_ENABLED` behavior in test/ops runbooks so teams can pause auto-provision during Clerk incidents without surprising auth flows.

## Notes on Outdated Techniques
- Replace ad-hoc `headers()` usage in tests with centralized mocks compatible with Next.js 15 App Router.
- Align Upstash rate limiter usage with the current API; our tests failing `slidingWindow` indicate mismatch or stale mocks.
- Add encryption key validation to prevent regressions from malformed CRYPTO_MASTER_KEY in tests/CI.

### Operational Toggle Reference
- `CLERK_AUTO_PROVISION_ENABLED=false` pauses auto-provision in `getCurrentUser` during Clerk outages while keeping read access; re-enable once webhooks catch up.
