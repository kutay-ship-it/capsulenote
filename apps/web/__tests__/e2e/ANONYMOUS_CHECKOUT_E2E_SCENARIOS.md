# E2E Test Scenarios: Anonymous Checkout

Comprehensive end-to-end test scenarios for anonymous checkout flow using Playwright.

## Test Environment Setup

```bash
# Prerequisites
npm install -D @playwright/test
npx playwright install

# Environment
- Local development server running on :3000
- Stripe test mode (use test cards)
- Clerk test instance
- Test database with seed data
# Required env for checkout E2E
export E2E_ENABLE_CHECKOUT_FLOW=true
export E2E_STRIPE_PAID_SESSION_ID=cs_test_xxx   # from a paid test session
export PLAYWRIGHT_BASE_URL=http://localhost:3000
```

## Scenario 1: Happy Path - Anonymous Checkout to Signup

**Objective**: Verify complete flow from pricing selection to active subscription.

### Steps

1. **Start anonymous checkout**
   - Navigate to `/subscribe?email=test@example.com`
   - Verify email is pre-filled and locked
   - Verify pricing cards displayed

2. **Select Pro plan**
   - Click "Subscribe to Pro" button
   - Verify redirected to Stripe Checkout
   - Verify email is locked in Stripe UI (cannot be edited)

3. **Complete payment**
   - Enter test card: `4242 4242 4242 4242`
   - Complete payment form
   - Click "Pay" button

4. **Verify success redirect**
   - Verify redirected to `/subscribe/success?session_id=xxx`
   - Verify success message displayed
   - Verify Clerk SignUp form shown with locked email

5. **Complete signup**
   - Enter password (email pre-filled)
   - Submit signup form
   - Verify redirected to `/journey`

6. **Verify subscription activated**
   - Check subscription card shows "Pro" plan
   - Verify billing section shows active subscription
   - Verify Stripe subscription created in dashboard

### Expected Results

- [x] Email locked throughout entire flow
- [x] PendingSubscription created with `awaiting_payment`
- [x] PendingSubscription updated to `payment_complete` after payment
- [x] User created in database
- [x] Subscription linked to user account
- [x] PendingSubscription marked as `linked`
- [x] User redirected to journey with active subscription

### Database Verification Queries

```sql
-- Check PendingSubscription lifecycle
SELECT id, email, status, created_at, linked_at
FROM pending_subscriptions
WHERE email = 'test@example.com'
ORDER BY created_at DESC;

-- Check Subscription linked correctly
SELECT s.id, s.user_id, s.plan, s.status, u.email
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'test@example.com';

-- Check audit trail
SELECT type, data, created_at
FROM audit_events
WHERE data->>'email' = 'test@example.com'
AND type LIKE 'subscription.%'
ORDER BY created_at DESC;
```

---

## Scenario 2: Resume Incomplete Checkout

**Objective**: Verify users can resume checkout if they abandon and return.

### Steps

1. **Start checkout**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan
   - Redirected to Stripe

2. **Abandon checkout**
   - Close Stripe Checkout tab WITHOUT paying
   - Navigate away from site

3. **Return to subscribe**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan again

4. **Verify resume behavior**
   - Check browser network tab
   - Verify API returns existing session URL
   - Verify redirected to SAME Stripe session (resume)

5. **Complete payment**
   - Complete payment in resumed session
   - Verify successful completion

### Expected Results

- [x] Same `stripeSessionId` reused (not creating duplicate sessions)
- [x] PendingSubscription not duplicated
- [x] User can complete abandoned checkout

---

## Scenario 3: Race Condition - Signup Before Webhook

**Objective**: Verify account linking works when user signs up before payment webhook.

### Steps

1. **Start checkout and pay**
   - Complete payment flow (Scenario 1, steps 1-3)
   - Immediately after payment, BEFORE webhook processes

2. **Sign up immediately**
   - On success page, fill signup form QUICKLY
   - Submit signup before Stripe webhook arrives

3. **Verify webhook handling**
   - Wait for Stripe webhook (check logs)
   - Verify webhook finds existing user
   - Verify webhook calls `linkPendingSubscription`

4. **Verify subscription activated**
   - Refresh dashboard
   - Verify subscription shows as active
   - Verify no errors in webhook logs

### Expected Results

- [x] User created BEFORE Stripe webhook
- [x] Stripe webhook finds existing user by email
- [x] Stripe webhook calls linkPendingSubscription
- [x] Subscription successfully linked
- [x] No race condition errors

### Manual Testing Note

To reliably test this race condition:
1. Add artificial delay in Stripe webhook handler
2. Sign up immediately after payment
3. Or use Stripe CLI to manually trigger webhook after signup

---

## Scenario 4: Email Not Verified Error

**Objective**: Verify email verification is enforced before subscription activation.

### Steps

1. **Complete payment**
   - Complete checkout flow (Scenario 1, steps 1-3)

2. **Sign up WITHOUT verifying email**
   - On success page, submit signup form
   - DO NOT click email verification link

3. **Attempt to access journey**
   - Try navigating to `/journey`
   - Verify redirected to error page

4. **Verify error message**
   - Check for "Email not verified" error
   - Verify "Resend Verification Email" button shown
   - Verify clear instructions

5. **Verify email and retry**
   - Click verification link in email
   - Return to journey
   - Verify subscription now activated

### Expected Results

- [x] `linkPendingSubscription` returns error if email unverified
- [x] User redirected to `/subscribe/error?code=email_not_verified`
- [x] Clear recovery instructions shown
- [x] After verification, subscription activates successfully

---

## Scenario 5: Already Paid Error

**Objective**: Verify duplicate payment prevention.

### Steps

1. **Complete full checkout**
   - Complete entire flow (Scenario 1)
   - Verify subscription active

2. **Attempt second checkout**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan again
   - Click subscribe button

3. **Verify error handling**
   - Check for "ALREADY_PAID" error
   - Verify redirected to signup page
   - Verify clear message: "You already have a pending payment"

### Expected Results

- [x] Server Action throws "ALREADY_PAID" error
- [x] User not redirected to Stripe
- [x] Clear message to sign in instead
- [x] No duplicate PendingSubscription created

---

## Scenario 6: Payment Failure

**Objective**: Verify error handling for failed payments.

### Steps

1. **Start checkout**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan

2. **Use failing test card**
   - Enter card: `4000 0000 0000 0002` (declined)
   - Submit payment

3. **Verify error handling**
   - Verify Stripe shows error message
   - Cancel and return to site

4. **Verify redirect to error page**
   - Verify redirected to `/subscribe/error?code=payment_failed`
   - Verify "Try Again" button shown
   - Verify button links back to `/subscribe?email=test@example.com`

5. **Retry with valid card**
   - Click "Try Again"
   - Use valid card `4242 4242 4242 4242`
   - Complete payment successfully

### Expected Results

- [x] Failed payment redirects to error page
- [x] User can retry with same email
- [x] Retry reuses existing PendingSubscription
- [x] Successful retry completes flow

---

## Scenario 7: Session Expiry

**Objective**: Verify handling of expired Stripe checkout sessions.

### Steps

1. **Start checkout**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan
   - Get redirected to Stripe

2. **Wait for session expiry**
   - Wait 24 hours (or manually expire in Stripe Dashboard)
   - Do NOT complete payment

3. **Return to subscribe page**
   - Navigate to `/subscribe?email=test@example.com`
   - Select Pro plan

4. **Verify new session created**
   - Verify NEW Stripe session created (not expired one)
   - Verify redirected to new Stripe Checkout
   - Complete payment in new session

### Expected Results

- [x] Expired session detected
- [x] New checkout session created
- [x] Old PendingSubscription updated with new sessionId
- [x] Payment completes successfully

---

## Scenario 8: Email Mismatch Error

**Objective**: Verify security - cannot sign up with different email than payment.

### Steps

1. **Complete payment**
   - Pay with email: `payment@example.com`
   - Navigate to success page

2. **Sign up with different email**
   - Manually navigate to signup
   - Create account with: `different@example.com`

3. **Verify no subscription**
   - Log in with `different@example.com`
   - Navigate to dashboard
   - Verify NO subscription activated

4. **Check original email**
   - Log out
   - Sign up with original email: `payment@example.com`
   - Verify subscription NOW activated

### Expected Results

- [x] Email mismatch detected
- [x] Wrong email account gets no subscription
- [x] Correct email account gets subscription
- [x] Secure email validation enforced

---

## Scenario 9: Cleanup Job - Expired Subscription Refund

**Objective**: Verify automated cleanup and refund of expired subscriptions.

### Steps

1. **Create expired pending subscription**
   - Manually insert test data:
   ```sql
   INSERT INTO pending_subscriptions (
     email, stripe_customer_id, stripe_subscription_id,
     status, expires_at, plan, amount_cents, currency
   ) VALUES (
     'expired@example.com', 'cus_test', 'sub_test',
     'payment_complete', NOW() - INTERVAL '31 days',
     'pro', 1999, 'usd'
   );
   ```

2. **Trigger cron job**
   - Call cron endpoint:
   ```bash
   curl -X GET http://localhost:3000/api/cron/cleanup-pending-subscriptions \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

3. **Verify cleanup**
   - Check PendingSubscription updated to `refunded`
   - Check Stripe subscription cancelled
   - Check refund issued in Stripe
   - Check audit event created

4. **Verify monitoring**
   - If > 10 subscriptions cleaned, verify alert logged
   - Check cleanup rate calculation

### Expected Results

- [x] Expired subscriptions found
- [x] Stripe subscriptions cancelled
- [x] Refunds issued
- [x] Status updated to `refunded`
- [x] Audit trail complete
- [x] High cleanup rate triggers alert

### Manual Verification

```sql
-- Check cleanup results
SELECT id, email, status, expires_at, linked_at
FROM pending_subscriptions
WHERE email = 'expired@example.com';

-- Should show status = 'refunded'
```

---

## Scenario 10: Email Locking Verification

**Objective**: Verify email cannot be changed in Stripe Checkout.

### Steps

1. **Start checkout**
   - Navigate to `/subscribe?email=locked@example.com`
   - Select Pro plan
   - Redirected to Stripe

2. **Inspect Stripe form**
   - Open browser DevTools
   - Inspect email field in Stripe Checkout
   - Verify field is disabled/read-only

3. **Attempt to change email**
   - Try clicking email field
   - Try keyboard input
   - Try browser autofill
   - Try DevTools HTML editing

4. **Verify email locked**
   - Confirm email field cannot be edited
   - Complete payment
   - Verify payment associated with `locked@example.com`

### Expected Results

- [x] Email field disabled in Stripe Checkout UI
- [x] Email cannot be changed via any method
- [x] Payment correctly associated with locked email
- [x] Security: Prevents email substitution attacks

---

## Playwright Test Structure

```typescript
// __tests__/e2e/anonymous-checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Anonymous Checkout E2E', () => {
  test('Happy Path: Complete checkout to signup', async ({ page }) => {
    // Navigate to subscribe page
    await page.goto('/subscribe?email=test@example.com')

    // Verify email locked
    const emailField = page.locator('[data-testid="locked-email"]')
    await expect(emailField).toHaveValue('test@example.com')
    await expect(emailField).toBeDisabled()

    // Select Pro plan
    await page.click('[data-testid="subscribe-pro"]')

    // Wait for Stripe redirect
    await page.waitForURL(/checkout\.stripe\.com/)

    // Fill payment form (Stripe test mode)
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="cardExpiry"]', '12/34')
    await page.fill('[name="cardCvc"]', '123')
    await page.fill('[name="billingName"]', 'Test User')

    // Submit payment
    await page.click('[data-testid="hosted-payment-submit"]')

    // Wait for success redirect
    await page.waitForURL(/\/subscribe\/success/)

    // Verify Clerk signup form
    const signupForm = page.locator('[data-clerk-component="signUp"]')
    await expect(signupForm).toBeVisible()

    // Complete signup
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.click('button[type="submit"]')

    // Verify journey redirect
    await page.waitForURL('/journey')

    // Verify subscription active
    const subscriptionBadge = page.locator('[data-testid="subscription-badge"]')
    await expect(subscriptionBadge).toHaveText('Pro')
  })

  test('Email not verified error', async ({ page }) => {
    // Implementation...
  })

  test('Resume incomplete checkout', async ({ page }) => {
    // Implementation...
  })
})
```

---

## Test Data Cleanup

After each test run:

```sql
-- Clean up test data
DELETE FROM pending_subscriptions WHERE email LIKE '%@example.com';
DELETE FROM subscriptions WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);
DELETE FROM users WHERE email LIKE '%@example.com';
DELETE FROM audit_events WHERE data->>'email' LIKE '%@example.com';
```

---

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Setup test database
        run: |
          pnpm db:push
          pnpm db:seed

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
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

## Performance Benchmarks

Expected performance metrics:

| Scenario | Expected Duration | Notes |
|----------|------------------|-------|
| Happy path (full flow) | < 30 seconds | Including Stripe redirect |
| Resume checkout | < 5 seconds | Should reuse session |
| Email verification error | < 3 seconds | Fast validation |
| Cleanup job | < 10 seconds | For <100 subscriptions |

---

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for server actions
- **Integration Tests**: 85%+ coverage for webhook handlers
- **E2E Tests**: All critical user journeys (10 scenarios)

**Current Status**:
- Unit: ✅ Created
- Integration: ✅ Created
- E2E: 📝 Scenarios documented (implementation pending)
