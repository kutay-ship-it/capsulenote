# DearMe - Comprehensive Test Coverage Plan

**Created:** 2025-11-18
**Target Coverage:** 80% for critical paths
**Framework:** Vitest + Playwright
**Status:** Implementation in progress

---

## Current State

### Existing Tests (42 total)
- `apps/web/__tests__/subscribe/actions.test.ts` (27 tests) - Anonymous checkout
- `apps/web/__tests__/webhooks/anonymous-checkout-webhooks.test.ts` (15 tests) - Webhook handling

### Coverage Gaps
- **0%** encryption/decryption
- **0%** letter CRUD operations
- **0%** delivery scheduling
- **0%** GDPR flows
- **0%** rate limiting
- **0%** authentication flows
- **0%** Inngest workflows
- **0%** feature flags
- **0%** entitlements

**Total Coverage: <5% 🔴**

---

## Test Strategy

### 1. Unit Tests (Target: 100 tests)

**Purpose:** Test individual functions in isolation

#### 1.1 Encryption (apps/web/server/lib/encryption.ts)
- [x] `encryptLetter()` - encrypts data correctly
- [x] `decryptLetter()` - decrypts data correctly
- [x] Round-trip encryption (encrypt → decrypt)
- [x] Handles missing master key gracefully
- [x] Handles invalid ciphertext
- [x] Handles invalid nonce
- [x] Key version tracking
- [x] Supports key rotation

**Priority:** CRITICAL (8 tests)

#### 1.2 Date/Timezone Utilities
- [ ] Timezone conversion accuracy
- [ ] DST handling
- [ ] Future date validation
- [ ] Date preset calculations
- [ ] Leap year handling

**Priority:** HIGH (5 tests)

#### 1.3 Email Validation
- [ ] Valid email formats
- [ ] Invalid email formats
- [ ] Edge cases (unicode, special chars)

**Priority:** MEDIUM (3 tests)

#### 1.4 Feature Flags (apps/web/server/lib/feature-flags.ts)
- [ ] Default values returned
- [ ] Cache expiration works
- [ ] Unleash integration
- [ ] Env var fallbacks

**Priority:** HIGH (4 tests)

#### 1.5 Entitlements (apps/web/server/lib/entitlements.ts)
- [ ] Free plan limits
- [ ] Pro plan limits
- [ ] Quota calculations
- [ ] Usage tracking
- [ ] Plan upgrades

**Priority:** CRITICAL (5 tests)

#### 1.6 Error Classification (workers/inngest/lib/errors.ts)
- [ ] Retryable errors identified
- [ ] Non-retryable errors identified
- [ ] Error code mapping
- [ ] Idempotency key generation

**Priority:** HIGH (4 tests)

**Total Unit Tests Planned: 29 tests**

---

### 2. Integration Tests (Target: 50 tests)

**Purpose:** Test interactions between components

#### 2.1 Server Actions - Letters (apps/web/server/actions/letters.ts)
- [ ] `createLetter()` - success path
- [ ] `createLetter()` - validation failures
- [ ] `createLetter()` - quota exceeded
- [ ] `createLetter()` - encryption failure
- [ ] `createLetter()` - database failure
- [ ] `createLetter()` - audit logging
- [ ] `updateLetter()` - success
- [ ] `updateLetter()` - ownership check
- [ ] `deleteLetter()` - soft delete
- [ ] `getLetters()` - pagination
- [ ] `getLetter()` - decryption

**Priority:** CRITICAL (11 tests)

#### 2.2 Server Actions - Deliveries (apps/web/server/actions/deliveries.ts)
- [ ] `scheduleDelivery()` - success path
- [ ] `scheduleDelivery()` - validation failures
- [ ] `scheduleDelivery()` - quota check
- [ ] `scheduleDelivery()` - entitlement check
- [ ] `scheduleDelivery()` - Inngest event triggered
- [ ] `cancelDelivery()` - success
- [ ] `cancelDelivery()` - ownership check
- [ ] `getDeliveries()` - filtering by status
- [ ] `rescheduleDelivery()` - updates deliverAt

**Priority:** CRITICAL (9 tests)

#### 2.3 Server Actions - GDPR (apps/web/server/actions/gdpr.ts)
- [ ] `exportUserData()` - returns complete data
- [ ] `exportUserData()` - includes encrypted letters
- [ ] `exportUserData()` - includes deliveries
- [ ] `deleteUserData()` - soft deletes letters
- [ ] `deleteUserData()` - cancels pending deliveries
- [ ] `deleteUserData()` - anonymizes data
- [ ] `deleteUserData()` - audit trail preserved

**Priority:** CRITICAL (7 tests)

#### 2.4 Webhooks - Clerk (apps/web/app/api/webhooks/clerk/route.ts)
- [ ] `user.created` - creates profile
- [ ] `user.updated` - updates email
- [ ] `user.deleted` - anonymizes data
- [ ] Invalid signature rejected
- [ ] Duplicate events handled

**Priority:** HIGH (5 tests)

#### 2.5 Webhooks - Stripe (apps/web/app/api/webhooks/stripe/route.ts)
- [ ] `checkout.session.completed` - creates subscription
- [ ] `customer.subscription.updated` - updates status
- [ ] `customer.subscription.deleted` - cancels subscription
- [ ] `invoice.payment_succeeded` - records payment
- [ ] `invoice.payment_failed` - records failure

**Priority:** HIGH (5 tests)

#### 2.6 Webhooks - Resend (apps/web/app/api/webhooks/resend/route.ts)
- [ ] `email.delivered` - updates status
- [ ] `email.opened` - increments opens
- [ ] `email.clicked` - increments clicks
- [ ] `email.bounced` - marks failed
- [ ] `email.complained` - marks failed

**Priority:** MEDIUM (5 tests)

#### 2.7 Rate Limiting (apps/web/middleware.ts)
- [ ] Auth endpoints rate limited (10/10s)
- [ ] API endpoints rate limited (100/min)
- [ ] Webhook endpoints rate limited (1000/min)
- [ ] Rate limit headers returned
- [ ] Graceful degradation without Redis

**Priority:** HIGH (5 tests)

**Total Integration Tests Planned: 47 tests**

---

### 3. E2E Tests (Target: 15 journeys)

**Purpose:** Test complete user workflows

#### 3.1 Critical Happy Paths
- [ ] **Journey 1:** Anonymous → Write → Signup → Schedule → Delivery
  - Visit landing page
  - Start writing letter (localStorage)
  - Sign up with Clerk
  - Draft persists after signup
  - Schedule delivery
  - Verify in deliveries list
  - Wait for delivery (mock time)
  - Verify email sent

- [ ] **Journey 2:** Authenticated → Create Letter → Schedule
  - Login
  - Navigate to /letters/new
  - Write letter
  - Submit (creates encrypted record)
  - Navigate to letter detail
  - Schedule delivery
  - Verify in dashboard

- [ ] **Journey 3:** GDPR Data Export
  - Login
  - Create 2 letters
  - Schedule 1 delivery
  - Navigate to settings
  - Click "Export Data"
  - Download JSON
  - Verify complete data

- [ ] **Journey 4:** GDPR Account Deletion
  - Login
  - Create letter
  - Navigate to settings
  - Click "Delete Account"
  - Confirm deletion
  - Verify letters soft-deleted
  - Verify deliveries canceled

- [ ] **Journey 5:** Payment → Subscribe
  - Anonymous visitor
  - Click "Get Started"
  - Fill checkout form
  - Complete payment (Stripe test mode)
  - Verify account created
  - Verify subscription active
  - Verify access to features

**Priority:** CRITICAL (5 journeys)

#### 3.2 Error Recovery Paths
- [ ] **Journey 6:** Encryption Key Rotation
  - Create letter with keyVersion=1
  - Rotate encryption key
  - Update letter (should use keyVersion=2)
  - Verify old letter still readable

- [ ] **Journey 7:** Delivery Failure → Retry
  - Schedule delivery
  - Mock provider failure (retryable)
  - Verify retry attempted
  - Mock provider success
  - Verify delivery completes

- [ ] **Journey 8:** Backstop Reconciler
  - Schedule delivery
  - Mock Inngest failure (stuck job)
  - Wait 5 minutes
  - Trigger reconciler cron
  - Verify job re-enqueued

**Priority:** HIGH (3 journeys)

#### 3.3 Edge Cases
- [ ] **Journey 9:** Quota Exceeded
  - Free plan user
  - Create 5 letters (monthly limit)
  - Attempt 6th letter
  - Verify quota error shown
  - Verify upgrade prompt

- [ ] **Journey 10:** Timezone Change During Scheduling
  - Create letter
  - Set timezone to PST
  - Schedule for "9:00 AM tomorrow"
  - Change timezone to EST
  - Verify time adjusted correctly

- [ ] **Journey 11:** Concurrent Scheduling
  - Login from two devices
  - Schedule same letter simultaneously
  - Verify only one delivery created
  - Verify no race condition

- [ ] **Journey 12:** Rate Limit Hit
  - Make 100 API requests in 1 minute
  - Verify 101st request blocked
  - Wait 1 minute
  - Verify requests resume

**Priority:** MEDIUM (4 journeys)

#### 3.4 Mobile Journeys
- [ ] **Journey 13:** Mobile Letter Creation
  - Mobile viewport
  - Touch-optimized editor
  - Keyboard handling
  - Date picker usability

- [ ] **Journey 14:** Mobile Dashboard
  - Mobile navigation
  - Stats display
  - Quick actions
  - Responsive cards

- [ ] **Journey 15:** Mobile Settings
  - Scrollable settings
  - Touch targets >44px
  - GDPR flows mobile-friendly

**Priority:** LOW (3 journeys)

**Total E2E Tests Planned: 15 journeys**

---

## Test Infrastructure

### Required Setup

#### 1. Test Database
```bash
# Create test database
createdb dearme_test

# Run migrations
DATABASE_URL=postgresql://localhost/dearme_test pnpm db:migrate
```

#### 2. Environment Variables
```bash
# .env.test
DATABASE_URL=postgresql://localhost/dearme_test
CRYPTO_MASTER_KEY=test_key_base64_encoded
CLERK_SECRET_KEY=test_clerk_key
INNGEST_EVENT_KEY=test_inngest_key
STRIPE_SECRET_KEY=sk_test_xxx
RESEND_API_KEY=re_test_xxx
```

#### 3. Mocking Strategy
- **Clerk:** Mock `@clerk/nextjs/server` with test fixtures
- **Inngest:** Mock `inngest.send()` to verify events
- **Stripe:** Use Stripe test mode + fixtures
- **Resend:** Mock email provider interface
- **Redis:** Use `ioredis-mock` or in-memory cache

#### 4. Test Utilities
```typescript
// __tests__/utils/test-helpers.ts
export async function createTestUser()
export async function createTestLetter()
export async function createTestDelivery()
export async function cleanupTestData()
export async function mockClerkAuth()
export async function mockInngestClient()
```

---

## Implementation Timeline

### Week 1: Foundation
**Days 1-2:** Infrastructure setup
- Configure Vitest
- Set up test database
- Create test utilities
- Mock external services

**Days 3-5:** Unit tests
- Encryption tests (8 tests) ✅
- Feature flags tests (4 tests)
- Entitlements tests (5 tests)
- Date/timezone tests (5 tests)

**Target:** 22 unit tests complete

### Week 2: Integration
**Days 1-3:** Server Actions
- Letters CRUD tests (11 tests)
- Delivery scheduling tests (9 tests)
- GDPR tests (7 tests)

**Days 4-5:** Webhooks & Middleware
- Clerk webhook tests (5 tests)
- Stripe webhook tests (5 tests)
- Rate limiting tests (5 tests)

**Target:** 42 integration tests complete

### Week 3: E2E
**Days 1-2:** Playwright setup + Critical paths
- Journey 1-5 (5 critical journeys)

**Days 3-4:** Error recovery
- Journey 6-8 (3 error journeys)

**Day 5:** Edge cases
- Journey 9-12 (4 edge case journeys)

**Target:** 12 E2E tests complete

### Week 4: Polish & CI/CD
**Days 1-2:** Mobile E2E
- Journey 13-15 (3 mobile journeys)

**Days 3-5:** CI/CD integration
- GitHub Actions workflow
- Pre-commit hooks
- Coverage reporting
- Performance benchmarks

**Target:** 15 E2E tests + CI/CD complete

---

## Success Metrics

### Coverage Targets
- **Unit Tests:** >90% for utility functions
- **Integration Tests:** >80% for Server Actions
- **E2E Tests:** 15 critical journeys covered
- **Overall:** >75% statement coverage

### Quality Gates
- ✅ All tests pass
- ✅ No flaky tests
- ✅ Test run time <5 minutes
- ✅ Coverage >75%
- ✅ No skipped tests in CI

### Continuous Monitoring
- Coverage tracked in pull requests
- New features require tests
- Regressions caught in CI
- Performance benchmarks tracked

---

## Risk Mitigation

### Common Testing Pitfalls

1. **Flaky tests from timing**
   - Use `vi.useFakeTimers()` for time-dependent tests
   - Await all async operations
   - Mock external API calls

2. **Database state pollution**
   - Clean up after each test
   - Use transactions that rollback
   - Isolate test data

3. **Slow E2E tests**
   - Run in parallel where possible
   - Mock time-intensive operations
   - Use fixtures for common states

4. **Brittle selectors**
   - Use data-testid attributes
   - Avoid CSS/class selectors
   - Test behavior, not implementation

---

## Appendix: Test File Structure

```
apps/web/__tests__/
├── setup.ts                          # Test configuration
├── utils/
│   ├── test-helpers.ts               # Shared utilities
│   ├── fixtures.ts                   # Test data
│   └── mocks.ts                      # Mock factories
├── unit/
│   ├── encryption.test.ts            # ✅ CREATED
│   ├── feature-flags.test.ts
│   ├── entitlements.test.ts
│   ├── date-utils.test.ts
│   └── error-classification.test.ts
├── integration/
│   ├── letters/
│   │   ├── create.test.ts
│   │   ├── update.test.ts
│   │   ├── delete.test.ts
│   │   └── list.test.ts
│   ├── deliveries/
│   │   ├── schedule.test.ts
│   │   ├── cancel.test.ts
│   │   └── reschedule.test.ts
│   ├── gdpr/
│   │   ├── export.test.ts
│   │   └── delete.test.ts
│   ├── webhooks/
│   │   ├── clerk.test.ts
│   │   ├── stripe.test.ts
│   │   └── resend.test.ts
│   └── middleware/
│       └── rate-limiting.test.ts
└── e2e/
    ├── anonymous-to-delivery.spec.ts
    ├── authenticated-letter.spec.ts
    ├── gdpr-export.spec.ts
    ├── gdpr-delete.spec.ts
    ├── payment-flow.spec.ts
    ├── encryption-rotation.spec.ts
    ├── delivery-retry.spec.ts
    ├── backstop-reconciler.spec.ts
    ├── quota-exceeded.spec.ts
    ├── timezone-change.spec.ts
    ├── concurrent-scheduling.spec.ts
    ├── rate-limit.spec.ts
    ├── mobile-letter.spec.ts
    ├── mobile-dashboard.spec.ts
    └── mobile-settings.spec.ts
```

---

**Next Steps:**
1. ✅ Set up test infrastructure
2. ✅ Implement encryption unit tests
3. [ ] Implement Server Action integration tests
4. [ ] Implement E2E critical journeys
5. [ ] Configure CI/CD pipeline
6. [ ] Achieve >75% coverage

**Status:** Week 1 Day 3 - Unit tests in progress
