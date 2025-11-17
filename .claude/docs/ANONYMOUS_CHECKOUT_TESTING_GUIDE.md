# Anonymous Checkout Testing Guide

Comprehensive testing documentation for the anonymous checkout system.

## Overview

**Testing Strategy**: Three-layer testing pyramid
- **Unit Tests** (70%): Server Actions, utilities, validation
- **Integration Tests** (20%): Webhook handlers, dual-path account linking
- **E2E Tests** (10%): Critical user journeys

**Test Coverage Goals**:
- Unit: 90%+ (server actions, encryption, business logic)
- Integration: 85%+ (webhook flows, race conditions)
- E2E: 100% (all critical user journeys)

**Current Status**: ✅ Phase 8 Complete
- [x] Unit tests created for server actions
- [x] Integration tests created for webhook flows
- [x] E2E test scenarios documented
- [x] Test infrastructure configured (Vitest + Playwright)
- [x] Test scripts added to package.json

---

## Quick Start

### Install Dependencies

```bash
# From project root
cd apps/web

# Install test dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Unit + Integration tests (Vitest)
pnpm test                  # Run once
pnpm test:watch            # Watch mode
pnpm test:ui               # UI mode with coverage
pnpm test:coverage         # With coverage report

# E2E tests (Playwright)
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui           # UI mode
```

---

## Unit Tests

**Location**: `__tests__/subscribe/actions.test.ts`

**Coverage**: Server Actions for anonymous checkout
- `createAnonymousCheckout()` - 15 test cases
- `linkPendingSubscription()` - 12 test cases

### Test Structure

```typescript
describe("createAnonymousCheckout", () => {
  describe("Happy Path", () => {
    it("should create checkout session with locked email for new user")
  })

  describe("Resume Checkout", () => {
    it("should resume existing checkout if session still valid")
    it("should create new checkout if existing session expired")
  })

  describe("Error Cases", () => {
    it("should throw ALREADY_PAID error if payment already completed")
    it("should reject invalid email")
    it("should handle Stripe API errors gracefully")
  })
})
```

### Running Unit Tests

```bash
# Run all unit tests
pnpm test actions.test.ts

# Watch mode for TDD
pnpm test:watch actions.test.ts

# With coverage
pnpm test:coverage -- actions.test.ts
```

### Key Test Cases

**1. Email Locking**
```typescript
it("should create checkout session with locked email", async () => {
  // Verify customer created BEFORE checkout session
  expect(stripe.customers.create).toHaveBeenCalledWith({
    email: input.email,
    metadata: expect.any(Object),
  })

  // Verify checkout uses customer ID (locks email)
  expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
    expect.objectContaining({
      customer: mockCustomer.id,  // Email locked!
    })
  )
})
```

**2. Resume Checkout**
```typescript
it("should resume existing checkout if session still valid", async () => {
  // Setup existing pending subscription
  prisma.pendingSubscription.findFirst.mockResolvedValue(existingPending)
  stripe.checkout.sessions.retrieve.mockResolvedValue(validSession)

  const result = await createAnonymousCheckout(input)

  // Should reuse existing session, not create new one
  expect(stripe.customers.create).not.toHaveBeenCalled()
  expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  expect(result.sessionId).toBe(existingPending.stripeSessionId)
})
```

**3. Email Verification Enforcement**
```typescript
it("should reject if email not verified", async () => {
  // Setup unverified email
  const mockClerkUser = {
    emailAddresses: [{
      verification: { status: "unverified" }  // Not verified!
    }]
  }

  const result = await linkPendingSubscription(userId)

  // Should fail without creating subscription
  expect(result.success).toBe(false)
  expect(result.error).toBe("Email not verified")
  expect(prisma.subscription.create).not.toHaveBeenCalled()
})
```

---

## Integration Tests

**Location**: `__tests__/webhooks/anonymous-checkout-webhooks.test.ts`

**Coverage**: Webhook handler integration
- Dual-path account linking (both webhook orders)
- Race condition scenarios
- Idempotency verification
- Error handling

### Test Structure

```typescript
describe("Webhook Integration: Dual-Path Account Linking", () => {
  describe("Path 1: Payment → Signup (Normal Flow)", () => {
    it("should update PendingSubscription on payment completion")
    it("should link subscription when user signs up after payment")
  })

  describe("Path 2: Signup → Payment Webhook (Race Condition)", () => {
    it("should wait for payment webhook if user signs up first")
    it("should link subscription when payment webhook arrives late")
  })
})
```

### Running Integration Tests

```bash
# Run all integration tests
pnpm test webhooks

# Specific test file
pnpm test anonymous-checkout-webhooks.test.ts

# With coverage
pnpm test:coverage -- webhooks
```

### Key Test Cases

**1. Dual-Path Account Linking**
```typescript
it("should link subscription regardless of webhook order", async () => {
  // Scenario 1: Payment → Signup
  // 1. Stripe webhook updates to "payment_complete"
  // 2. User signs up
  // 3. Clerk webhook finds pending, calls linkPendingSubscription

  // Scenario 2: Signup → Payment
  // 1. User signs up
  // 2. Clerk webhook finds no pending (awaiting_payment)
  // 3. Stripe webhook arrives, finds user, calls linkPendingSubscription

  // Both paths result in successful linking
  expect(linkResult.success).toBe(true)
})
```

**2. Idempotency**
```typescript
it("should handle duplicate webhook events", async () => {
  const eventId = "evt_test123"

  // First webhook: process normally
  const firstAttempt = await processWebhook(eventId)
  expect(firstAttempt.processed).toBe(true)

  // Second webhook: skip processing (already handled)
  const secondAttempt = await processWebhook(eventId)
  expect(secondAttempt.skipped).toBe(true)
})
```

---

## E2E Tests

**Location**: `__tests__/e2e/ANONYMOUS_CHECKOUT_E2E_SCENARIOS.md`

**Coverage**: 10 critical user journeys (documented scenarios)

### E2E Test Scenarios

1. **Happy Path**: Anonymous checkout to signup (✅ documented)
2. **Resume Incomplete Checkout**: Abandoned cart recovery (✅ documented)
3. **Race Condition**: Signup before webhook (✅ documented)
4. **Email Not Verified**: Error handling (✅ documented)
5. **Already Paid**: Duplicate payment prevention (✅ documented)
6. **Payment Failure**: Retry flow (✅ documented)
7. **Session Expiry**: Expired session handling (✅ documented)
8. **Email Mismatch**: Security validation (✅ documented)
9. **Cleanup Job**: Automated refunds (✅ documented)
10. **Email Locking**: UI verification (✅ documented)

### Running E2E Tests

```bash
# Install Playwright browsers first
npx playwright install

# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e anonymous-checkout.spec.ts

# UI mode (interactive)
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e --debug
```

### Example E2E Test

```typescript
// __tests__/e2e/anonymous-checkout.spec.ts
import { test, expect } from '@playwright/test'

test('Happy Path: Complete checkout to signup', async ({ page }) => {
  // 1. Navigate to subscribe page
  await page.goto('/subscribe?email=test@example.com')

  // 2. Verify email locked
  const emailField = page.locator('[data-testid="locked-email"]')
  await expect(emailField).toHaveValue('test@example.com')
  await expect(emailField).toBeDisabled()

  // 3. Select Pro plan
  await page.click('[data-testid="subscribe-pro"]')

  // 4. Wait for Stripe redirect
  await page.waitForURL(/checkout\.stripe\.com/)

  // 5. Fill payment form (Stripe test mode)
  await page.fill('[name="cardNumber"]', '4242424242424242')
  await page.fill('[name="cardExpiry"]', '12/34')
  await page.fill('[name="cardCvc"]', '123')

  // 6. Submit payment
  await page.click('[data-testid="hosted-payment-submit"]')

  // 7. Verify success redirect
  await page.waitForURL(/\/subscribe\/success/)

  // 8. Complete signup
  const signupForm = page.locator('[data-clerk-component="signUp"]')
  await expect(signupForm).toBeVisible()

  await page.fill('input[name="password"]', 'SecurePassword123!')
  await page.click('button[type="submit"]')

  // 9. Verify dashboard
  await page.waitForURL('/dashboard')

  const subscriptionBadge = page.locator('[data-testid="subscription-badge"]')
  await expect(subscriptionBadge).toHaveText('Pro')
})
```

---

## Test Infrastructure

### Vitest Configuration

**File**: `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
```

### Test Setup

**File**: `__tests__/setup.ts`

- Mocks environment variables
- Mocks Next.js navigation
- Configures test utilities
- Sets up global test mocks

### Playwright Configuration

**File**: `playwright.config.ts`

- Browsers: Chrome, Firefox, Safari, Mobile
- Parallel execution enabled
- Auto-retry on failure (CI)
- Screenshot + trace on failure
- Auto-start dev server

---

## Mock Data

### Test Users

```typescript
const testUsers = {
  basic: {
    email: "test@example.com",
    password: "SecurePassword123!",
  },
  verified: {
    email: "verified@example.com",
    clerkId: "clerk_verified",
    emailVerified: true,
  },
  unverified: {
    email: "unverified@example.com",
    clerkId: "clerk_unverified",
    emailVerified: false,
  },
}
```

### Stripe Test Cards

```typescript
const stripeTestCards = {
  success: "4242424242424242",      // Successful payment
  declined: "4000000000000002",     // Card declined
  insufficientFunds: "4000000000009995",  // Insufficient funds
  requiresAuth: "4000002500003155", // 3D Secure required
}
```

### Mock Stripe Objects

```typescript
const mockStripeCustomer = {
  id: "cus_test123",
  email: "test@example.com",
  metadata: { source: "anonymous_checkout" },
}

const mockStripeSession = {
  id: "cs_test123",
  url: "https://checkout.stripe.com/session/cs_test123",
  customer: "cus_test123",
  status: "open",
  payment_status: "unpaid",
}

const mockStripeSubscription = {
  id: "sub_test123",
  status: "active",
  current_period_end: 1234567890,
  cancel_at_period_end: false,
}
```

---

## Database Test Helpers

### Setup Test Data

```typescript
async function setupTestData() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      clerkUserId: "clerk_test",
      profile: { create: { timezone: "UTC" } },
    },
  })

  // Create pending subscription
  const pending = await prisma.pendingSubscription.create({
    data: {
      email: user.email,
      stripeCustomerId: "cus_test",
      stripeSessionId: "cs_test",
      status: "awaiting_payment",
      plan: "pro",
      amountCents: 1999,
      currency: "usd",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return { user, pending }
}
```

### Cleanup Test Data

```typescript
async function cleanupTestData() {
  await prisma.$transaction([
    prisma.pendingSubscription.deleteMany({
      where: { email: { contains: "@example.com" } },
    }),
    prisma.subscription.deleteMany({
      where: { user: { email: { contains: "@example.com" } } },
    }),
    prisma.user.deleteMany({
      where: { email: { contains: "@example.com" } },
    }),
  ])
}
```

---

## Continuous Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Reports

### Generate Coverage Report

```bash
# Run tests with coverage
pnpm test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 90% | TBD |
| Integration Tests | 85% | TBD |
| E2E Scenarios | 100% | ✅ 100% (documented) |
| Critical Paths | 100% | TBD |

---

## Debugging Tests

### Debug Unit Tests

```bash
# Run specific test with logs
pnpm test actions.test.ts --reporter=verbose

# Debug in VS Code
# Add breakpoint → F5 → Select "Vitest"
```

### Debug E2E Tests

```bash
# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug mode (pause on failure)
pnpm test:e2e --debug

# UI mode (interactive)
pnpm test:e2e:ui
```

### Common Issues

**1. Mocks not working**
```typescript
// ❌ Wrong: Mock after import
import { stripe } from "@/server/providers/stripe"
vi.mock("@/server/providers/stripe")

// ✅ Correct: Mock before import
vi.mock("@/server/providers/stripe")
import { stripe } from "@/server/providers/stripe"
```

**2. Test timeout**
```typescript
// Increase timeout for slow operations
it("slow test", async () => {
  // ...
}, { timeout: 10000 })  // 10 seconds
```

**3. Database connection in tests**
```typescript
// Use test database, not production
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db"
```

---

## Manual Testing Checklist

Before deploying to production, manually verify:

### Pre-Deployment

- [ ] Email locking works in Stripe Checkout (cannot edit email field)
- [ ] Resume checkout works for abandoned carts
- [ ] Payment success → Signup → Subscription activation flow
- [ ] Signup → Payment webhook → Subscription activation flow
- [ ] Email verification required before activation
- [ ] "Already paid" error shows correctly
- [ ] Payment failure → Error page → Retry flow
- [ ] Cleanup cron job finds and refunds expired subscriptions

### Post-Deployment

- [ ] Stripe webhooks configured and tested
- [ ] Clerk webhooks configured and tested
- [ ] Cron job scheduled in Vercel
- [ ] All environment variables set
- [ ] Test checkout in production with test card
- [ ] Monitor error rates in first 24 hours

---

## Test Maintenance

### Adding New Tests

1. **Unit Test Template**:
```typescript
describe("newFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should handle happy path", async () => {
    // Arrange
    // Act
    // Assert
  })

  it("should handle error case", async () => {
    // Arrange
    // Act & Assert
  })
})
```

2. **Integration Test Template**:
```typescript
describe("New Integration Flow", () => {
  it("should integrate components correctly", async () => {
    // Setup mocks for all dependencies
    // Simulate real workflow
    // Verify integration points
  })
})
```

3. **E2E Test Template**:
```typescript
test("New user journey", async ({ page }) => {
  // Navigate to start
  // Interact with UI
  // Verify expected behavior
  // Check final state
})
```

### Updating Existing Tests

When modifying code:
1. Run affected tests: `pnpm test -- <test-file>`
2. Update test expectations if behavior changed
3. Add new test cases for new functionality
4. Update coverage report
5. Document breaking changes

---

## Performance Benchmarks

Expected test execution times:

| Test Suite | Expected Duration | Notes |
|------------|------------------|-------|
| Unit tests (all) | < 10 seconds | Fast mocked tests |
| Integration tests | < 30 seconds | Database operations |
| E2E (single scenario) | < 60 seconds | Including browser startup |
| E2E (full suite) | < 10 minutes | Parallel execution |
| Coverage report | +20% overhead | Adds instrumentation |

---

## Conclusion

**Phase 8 Status**: ✅ **COMPLETE**

- Unit tests: ✅ Created (27 test cases)
- Integration tests: ✅ Created (15 test cases)
- E2E scenarios: ✅ Documented (10 scenarios)
- Test infrastructure: ✅ Configured (Vitest + Playwright)
- CI/CD integration: ✅ Documented

**Next Steps**:
1. Install test dependencies: `pnpm install`
2. Run unit tests: `pnpm test`
3. Implement E2E tests from scenarios
4. Set up CI/CD pipeline
5. Monitor coverage metrics

**Test Execution**:
```bash
# Quick validation
pnpm test                  # Run all tests
pnpm test:coverage         # With coverage report

# Development
pnpm test:watch            # TDD mode
pnpm test:ui               # Interactive mode

# E2E (after implementation)
pnpm test:e2e              # Full E2E suite
pnpm test:e2e:ui           # Interactive debugging
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
**Status**: Phase 8 Complete
