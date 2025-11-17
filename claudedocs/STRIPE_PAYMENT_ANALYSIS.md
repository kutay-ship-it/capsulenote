# Stripe Payment Integration - Deep Analysis

**Analysis Date:** 2025-11-17
**Analyst:** Claude Code
**Scope:** Complete Stripe and payment system analysis for DearMe application

---

## Executive Summary

### Current State
The DearMe application has **minimal Stripe integration** implemented. While database models exist and basic webhook handling is in place, **critical subscription enforcement, pricing pages, checkout flows, and customer portal are completely missing**. The application is **not production-ready** for monetization.

### Critical Severity Score: 🔴 HIGH (7/10)

**Key Findings:**
- ✅ Database schema complete (subscriptions, payments, profiles)
- ✅ Stripe webhook handler functional (basic events)
- ✅ Stripe client initialization and provider setup
- ❌ **NO subscription enforcement** in server actions
- ❌ **NO pricing page** or checkout flow implemented
- ❌ **NO customer portal** for subscription management
- ❌ **NO usage tracking** or quota enforcement
- ❌ **NO payment UI components** (except sandbox prototypes)
- ❌ Incomplete webhook event coverage
- ❌ Missing Stripe API functions (cancellation, upgrades, etc.)

---

## 1. Current State Assessment

### 1.1 What's Implemented

#### Database Models (Complete)

**Subscriptions Table** (`packages/prisma/schema.prisma:72-88`):
```prisma
model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @map("user_id")
  stripeSubscriptionId String             @unique @map("stripe_subscription_id")
  status               SubscriptionStatus @default(trialing)
  plan                 SubscriptionPlan   @default(pro)
  currentPeriodEnd     DateTime           @map("current_period_end")
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}
```

**Status:** ✅ Complete
- Supports trialing, active, past_due, canceled, unpaid, paused states
- Only "pro" plan defined (no free tier in schema)
- Links to user via userId
- Tracks Stripe subscription ID for API operations
- Cancellation intent tracking (cancelAtPeriodEnd)

**Payments Table** (`packages/prisma/schema.prisma:262-279`):
```prisma
model Payment {
  id                     String        @id @default(uuid())
  userId                 String        @map("user_id")
  type                   PaymentType   // subscription | shipping_addon
  amountCents            Int
  currency               String        @default("usd")
  stripePaymentIntentId  String?       @map("stripe_payment_intent_id")
  status                 PaymentStatus // succeeded | failed | pending | refunded
  metadata               Json          @default("{}")
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt
}
```

**Status:** ✅ Complete
- Records all payments (subscriptions + add-ons)
- Tracks payment intent IDs for reconciliation
- Supports multiple currencies (defaults to USD)
- Metadata field for extensibility

**Profile Integration** (`packages/prisma/schema.prisma:37-49`):
```prisma
model Profile {
  stripeCustomerId String? @unique @map("stripe_customer_id")
  // ... other fields
}
```

**Status:** ✅ Complete
- Stores Stripe customer ID on user profile
- Unique constraint prevents duplicate customers

#### Stripe Provider Setup

**File:** `apps/web/server/providers/stripe.ts`

**Stripe Client Initialization:**
```typescript
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
})
```

**Status:** ✅ Functional
- Version: `stripe@^14.10.0` (recent, secure)
- API version: `2023-10-16` (slightly outdated, latest is 2024-11-20)
- TypeScript support enabled

**Implemented Functions:**

1. **createCheckoutSession** (Lines 9-37):
```typescript
async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
})
```
- ⚠️ **NOT USED ANYWHERE** in codebase
- Creates subscription checkout sessions
- Missing: customer ID linking, metadata, trial periods
- Missing: subscription data configuration

2. **createCustomerPortalSession** (Lines 39-52):
```typescript
async function createCustomerPortalSession({
  customerId,
  returnUrl,
})
```
- ⚠️ **NOT USED ANYWHERE** in codebase
- Creates billing portal sessions for subscription management
- Missing: configuration options, allowed features

**Critical Missing Functions:**
- Cancel subscription
- Update subscription (upgrade/downgrade)
- Create customer with metadata
- Retrieve subscription details
- List customer subscriptions
- Handle proration
- Apply coupon codes
- Create usage records (for physical mail metering)

#### Webhook Handler

**File:** `apps/web/app/api/webhooks/stripe/route.ts`

**Security:**
```typescript
const signature = headerPayload.get("stripe-signature")
event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
```

**Status:** ✅ Signature verification implemented

**Implemented Events:**

1. **customer.created** (Lines 27-32):
   - Status: ⚠️ No-op (just logs)
   - Should: Create Profile.stripeCustomerId linkage

2. **customer.subscription.created** (Lines 34-70):
   - Status: ✅ Functional
   - Creates/updates subscription record
   - Maps Stripe status to DB enum
   - Calculates period end date

3. **customer.subscription.updated** (Lines 34-70):
   - Status: ✅ Functional (same handler as created)
   - Updates subscription status and period

4. **customer.subscription.deleted** (Lines 72-82):
   - Status: ✅ Functional
   - Sets subscription status to "canceled"

5. **payment_intent.succeeded** (Lines 84-104):
   - Status: ✅ Functional
   - Records successful payments
   - Extracts metadata (userId, type)

6. **payment_intent.payment_failed** (Lines 106-125):
   - Status: ✅ Functional
   - Records failed payments

**Missing Critical Events:**
- `customer.subscription.trial_will_end` (proactive notifications)
- `invoice.payment_failed` (dunning management)
- `invoice.payment_succeeded` (receipt emails)
- `customer.subscription.paused` / `resumed`
- `charge.refunded` (refund handling)
- `payment_method.attached` / `detached`

#### Environment Configuration

**File:** `apps/web/env.mjs` (Lines 19-24, 93-96)

**Required Variables:**
```typescript
STRIPE_SECRET_KEY: z.string().min(1)
STRIPE_WEBHOOK_SECRET: z.string().min(1)
STRIPE_PRICE_PRO_MONTHLY: z.string().min(1)
STRIPE_PRICE_PRO_ANNUAL: z.string().min(1)
```

**Status:** ✅ Validation configured
- All required keys enforced at build time
- Price IDs configured but **never referenced in code**
- Missing: Public/publishable key for client-side Stripe.js

### 1.2 What's Missing (Critical)

#### NO Subscription Enforcement

**Evidence:**
```typescript
// apps/web/server/actions/letters.ts:17-148
export async function createLetter(input: unknown): Promise<ActionResult> {
  const user = await requireUser()
  // ... validate, encrypt, create letter
  // ❌ NO SUBSCRIPTION CHECK
  return { success: true, data: { letterId: letter.id } }
}

// apps/web/server/actions/deliveries.ts:21-192
export async function scheduleDelivery(input: unknown): Promise<ActionResult> {
  const user = await requireUser()
  // ... validate, create delivery
  // ❌ NO PRO PLAN CHECK
  // ❌ NO USAGE LIMITS
  return { success: true, data: { deliveryId: delivery.id } }
}
```

**Impact:** 🔴 CRITICAL
- Users can create unlimited letters without payment
- Users can schedule unlimited deliveries without Pro plan
- Physical mail can be scheduled without payment
- No incentive to upgrade or pay

**Alignment Document Confirms:**
`sandbox/entitlement_alignment.md:9`:
> "server actions (`scheduleDelivery`) do **not** enforce plan status yet."

#### NO Pricing Page

**Evidence:**
- No `/pricing` route exists
- No pricing component found (searched components directory)
- Price IDs in env vars are unused
- Settings page shows "Subscription management coming soon" badge

**Impact:** 🔴 CRITICAL
- Users cannot discover pricing
- No conversion funnel
- No SEO for pricing terms

#### NO Checkout Flow

**Evidence:**
- `createCheckoutSession` function exists but **unused**
- No checkout page/route
- No "Upgrade" buttons in production UI
- Sandbox prototype exists (`apps/web/components/sandbox/entitlement-upsell.tsx`) but not integrated

**Impact:** 🔴 CRITICAL
- Users cannot purchase subscriptions
- No revenue generation possible
- Blocks go-to-market

#### NO Customer Portal

**Evidence:**
- `createCustomerPortalSession` function exists but **unused**
- Settings page (`apps/web/app/(app)/settings/page.tsx:156-190`) shows placeholder:
  ```tsx
  <Badge>Subscription management coming soon</Badge>
  ```

**Impact:** 🔴 CRITICAL
- Users cannot manage subscriptions
- Users cannot update payment methods
- Users cannot cancel (requires support)
- Poor user experience, high support burden

#### NO Usage Tracking

**Evidence:**
- No usage/quota enforcement functions
- No letter count limits
- No delivery count tracking
- No physical mail credit system

**Expected (from architecture):
```
Free tier: 5 letters/month, email only
Pro tier: Unlimited letters, email + mail
```

**Impact:** 🟡 HIGH
- No limits on free users
- Cannot enforce fair use
- Cannot implement pay-per-use for physical mail

---

## 2. Critical Findings (Prioritized by Severity)

### 🔴 P0 - Blocking Launch

#### 2.1 No Revenue Generation Mechanism
**Severity:** CRITICAL
**Impact:** Cannot monetize, blocks business model

**Details:**
- Pricing page missing
- Checkout flow not implemented
- Upgrade buttons not connected
- Free tier has no limits

**Required Actions:**
1. Create `/pricing` page with plan comparison
2. Implement checkout flow using `createCheckoutSession`
3. Add "Upgrade to Pro" CTAs throughout app
4. Wire up Stripe Checkout redirect flow
5. Handle post-checkout success/cancel redirects

**Estimated Effort:** 3-5 days

---

#### 2.2 No Subscription Enforcement
**Severity:** CRITICAL
**Impact:** Users access paid features for free

**Details:**
- `scheduleDelivery` action has no Pro plan check
- Physical mail scheduling has no payment check
- No usage quotas enforced

**Code Location:** `apps/web/server/actions/deliveries.ts:21-192`

**Required Implementation:**
```typescript
// Proposed: apps/web/server/lib/entitlements.ts
export async function getEntitlements(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    }
  })

  return {
    canScheduleDeliveries: subscription?.plan === 'pro',
    canSchedulePhysicalMail: subscription?.plan === 'pro',
    hasActiveSubscription: !!subscription,
    plan: subscription?.plan || 'free',
    status: subscription?.status || 'none'
  }
}

// Usage in scheduleDelivery:
export async function scheduleDelivery(input: unknown) {
  const user = await requireUser()
  const entitlements = await getEntitlements(user.id)

  if (!entitlements.canScheduleDeliveries) {
    return {
      success: false,
      error: {
        code: ErrorCodes.PAYMENT_REQUIRED,
        message: 'Pro plan required to schedule deliveries',
        details: { requiredFeature: 'scheduling' }
      }
    }
  }
  // ... continue with delivery creation
}
```

**Required Actions:**
1. Create entitlements helper with Redis caching (5-min TTL)
2. Add guards to `scheduleDelivery` server action
3. Add guards to physical mail scheduling
4. Implement trial delivery allowance (1 free delivery)
5. Handle `PAYMENT_REQUIRED` error in UI with upgrade modal

**Estimated Effort:** 2-3 days

---

#### 2.3 No Customer Self-Service
**Severity:** CRITICAL
**Impact:** High support burden, poor UX

**Details:**
- Users cannot manage subscriptions
- Users cannot update payment methods
- Users cannot view invoices
- Users cannot cancel without contacting support

**Required Actions:**
1. Create "Manage Subscription" page/component
2. Wire up `createCustomerPortalSession` to button
3. Implement portal redirect flow
4. Add subscription status display in settings
5. Show plan details, renewal date, payment method

**Estimated Effort:** 1-2 days

---

### 🟡 P1 - Required Before Beta

#### 2.4 Incomplete Webhook Coverage
**Severity:** HIGH
**Impact:** Poor user experience, missed notifications

**Missing Events:**
- `customer.subscription.trial_will_end` (3-day warning)
- `invoice.payment_failed` (dunning emails)
- `invoice.payment_succeeded` (receipt emails)
- `customer.subscription.paused`
- `charge.refunded`

**Required Actions:**
1. Add trial ending notification (email via Inngest)
2. Implement dunning flow for failed payments
3. Send receipt emails for successful payments
4. Handle subscription pauses (if offering pausing)
5. Process refunds and update payment records

**Estimated Effort:** 2-3 days

---

#### 2.5 No Upgrade/Downgrade Logic
**Severity:** HIGH
**Impact:** Users stuck on single plan

**Missing Functions:**
- Switch plan (monthly ↔ annual)
- Proration handling
- Plan change confirmation
- Downgrade scheduling (at period end)

**Required Actions:**
1. Add `updateSubscription` function to Stripe provider
2. Handle proration calculations
3. Show preview of charges/credits before change
4. Implement downgrade scheduling
5. Add telemetry for plan changes

**Estimated Effort:** 2-3 days

---

#### 2.6 Missing Usage-Based Billing for Physical Mail
**Severity:** HIGH
**Impact:** Cannot charge for physical mail per-letter

**Current Gap:**
- Architecture doc mentions "physical mail add-on fees"
- No metering implementation
- No Stripe usage record creation
- No credit/wallet system

**Architecture Reference (ARCHITECTURE.md:169-171):**
> "Physical mail per-letter fee
> Charged at schedule time (not delivery)"

**Required Actions:**
1. Define pricing model (per-letter or credit packs)
2. Implement Stripe usage records or one-time payments
3. Add physical mail credits to Profile model
4. Deduct credits on mail scheduling
5. Block mail scheduling when credits insufficient
6. Add "Buy Mail Credits" checkout flow

**Estimated Effort:** 3-4 days

---

### 🟢 P2 - Post-Beta Improvements

#### 2.7 No Coupon/Promotion Support
**Severity:** MEDIUM
**Impact:** Cannot run marketing campaigns

**Required Actions:**
1. Add coupon input to checkout
2. Apply Stripe promotion codes
3. Show discount in checkout preview
4. Track redemptions for analytics

**Estimated Effort:** 1-2 days

---

#### 2.8 No Tax Calculation
**Severity:** MEDIUM
**Impact:** Compliance risk in tax jurisdictions

**Required Actions:**
1. Enable Stripe Tax or integrate TaxJar
2. Collect customer tax address
3. Display tax on invoices
4. Comply with EU VAT, US sales tax

**Estimated Effort:** 2-3 days

---

#### 2.9 Limited Analytics/Telemetry
**Severity:** LOW
**Impact:** Poor visibility into revenue metrics

**Missing Metrics:**
- MRR (Monthly Recurring Revenue)
- Churn rate
- Trial conversion rate
- Upgrade funnel drop-off
- Payment failure rates

**Required Actions:**
1. Add PostHog event tracking for billing events
2. Create Stripe dashboard for MRR/ARR
3. Set up alerts for high churn or payment failures
4. Track conversion funnel (visitor → trial → paid)

**Estimated Effort:** 1-2 days

---

## 3. Architecture Analysis

### 3.1 Current Design Patterns

#### Webhook Pattern
```
Stripe Event → Webhook Endpoint → Signature Verification →
Switch by Event Type → Database Update → Return 200
```

**Pros:**
- ✅ Signature verification for security
- ✅ Idempotent webhook processing
- ✅ Proper error handling (500 on failure)

**Cons:**
- ❌ No webhook event deduplication (Stripe can retry)
- ❌ No processing queue for reliability
- ❌ Synchronous DB operations (blocks webhook response)

**Recommendation:**
Consider moving webhook processing to Inngest for durability:
```typescript
// apps/web/app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = verifyWebhook(req)

  // Queue for async processing
  await inngest.send({
    name: 'stripe.webhook.received',
    data: { event }
  })

  return new Response('Queued', { status: 200 })
}

// workers/inngest/functions/process-stripe-webhook.ts
export const processStripeWebhook = inngest.createFunction(
  { id: 'process-stripe-webhook', retries: 3 },
  { event: 'stripe.webhook.received' },
  async ({ event, step }) => {
    await step.run('process-event', async () => {
      // Durable processing with retries
    })
  }
)
```

#### Provider Abstraction (Partial)

**Evidence:**
Email provider abstraction exists (`apps/web/server/providers/email/`), but payment provider abstraction is minimal.

**Current:**
```typescript
// apps/web/server/providers/stripe.ts
export const stripe = new Stripe(...)
export async function createCheckoutSession(...) { }
```

**Proposed Enhancement:**
```typescript
// Interface for future multi-provider support
interface PaymentProvider {
  createCheckoutSession(...): Promise<CheckoutSession>
  createCustomerPortal(...): Promise<PortalSession>
  cancelSubscription(...): Promise<Subscription>
  updateSubscription(...): Promise<Subscription>
  createUsageRecord(...): Promise<UsageRecord>
}

class StripeProvider implements PaymentProvider {
  // Implementation
}

// Factory pattern
export async function getPaymentProvider(): Promise<PaymentProvider> {
  // Could support Paddle, Lemon Squeezy, etc. in future
  return new StripeProvider(stripe)
}
```

### 3.2 Integration Points

#### User Creation → Stripe Customer

**Current Flow:**
```
User Signs Up (Clerk) → Webhook (clerk/route.ts) →
Create User + Profile → ❌ NO STRIPE CUSTOMER CREATED
```

**Should Be:**
```
User Signs Up → Create User + Profile →
Create Stripe Customer → Store stripeCustomerId in Profile
```

**Implementation Gap:**
File: `apps/web/app/api/webhooks/clerk/route.ts` (not analyzed but likely missing)

**Proposed Fix:**
```typescript
// In Clerk webhook handler
case 'user.created': {
  const user = await prisma.user.create({ ... })

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id }
  })

  // Link customer ID
  await prisma.profile.update({
    where: { userId: user.id },
    data: { stripeCustomerId: customer.id }
  })
  break
}
```

#### Subscription Status → Feature Access

**Current Flow:**
```
Subscription Updated (Stripe) → Webhook → Update DB → ❌ NO CACHE UPDATE
```

**Proposed Flow:**
```
Subscription Updated → Webhook → Update DB → Invalidate Redis Cache →
Next Request → Cache Miss → Fetch Entitlements → Cache for 5min
```

**Cache Implementation:**
```typescript
// apps/web/server/lib/entitlements.ts
import { redis } from './redis'

const CACHE_TTL = 300 // 5 minutes

export async function getEntitlements(userId: string) {
  const cacheKey = `entitlements:${userId}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Fetch from DB
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] } }
  })

  const entitlements = {
    canScheduleDeliveries: subscription?.plan === 'pro',
    canSchedulePhysicalMail: subscription?.plan === 'pro',
    // ... other entitlements
  }

  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(entitlements))

  return entitlements
}

// Invalidate cache on webhook
export async function invalidateEntitlementsCache(userId: string) {
  await redis.del(`entitlements:${userId}`)
}
```

### 3.3 Data Flow Diagram (Text-Based)

```
┌──────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION LIFECYCLE                     │
└──────────────────────────────────────────────────────────────┘

1. USER SIGNUP
   User → Clerk → Webhook → Create User + Profile
                                     ↓
                          Create Stripe Customer (MISSING)
                                     ↓
                          Store stripeCustomerId in Profile

2. CHECKOUT FLOW (MISSING)
   User → Pricing Page → "Upgrade" Button → Create Checkout Session
                                                      ↓
                                          Redirect to Stripe Checkout
                                                      ↓
                          User Enters Payment → Success/Cancel URL
                                                      ↓
                                          Webhook: checkout.session.completed

3. SUBSCRIPTION CREATED
   Stripe → Webhook: customer.subscription.created
                ↓
        Verify Signature
                ↓
        Create/Update Subscription Record in DB
                ↓
        Invalidate Redis Cache (MISSING)
                ↓
        Return 200 OK

4. FEATURE USAGE
   User → Schedule Delivery → Server Action
                                     ↓
                          Check Entitlements (MISSING)
                                     ↓
                      Redis Cache Hit? → Yes: Return cached
                                     ↓ No
                          Query DB for Subscription
                                     ↓
                          Cache result (5min TTL)
                                     ↓
                      Plan === 'pro'? → Yes: Allow
                                     ↓ No
                      Return PAYMENT_REQUIRED Error

5. SUBSCRIPTION MANAGEMENT (MISSING)
   User → Settings → "Manage Subscription" Button
                                     ↓
                          Create Portal Session
                                     ↓
                          Redirect to Stripe Portal
                                     ↓
          User Updates Plan/Payment Method
                                     ↓
                          Webhook: customer.subscription.updated
                                     ↓
                          Update DB + Invalidate Cache

6. SUBSCRIPTION CANCELED
   User → Stripe Portal → Cancel Subscription
                                     ↓
                          Webhook: customer.subscription.deleted
                                     ↓
                          Set status = 'canceled' in DB
                                     ↓
                          Invalidate Cache
                                     ↓
                          Schedule Cleanup Job (30 days)
```

---

## 4. Gap Analysis

### 4.1 Missing Essential Features (Launch Blockers)

| Feature | Status | Priority | Effort | Risk |
|---------|--------|----------|--------|------|
| Pricing Page | ❌ Not Started | P0 | 2d | High |
| Checkout Flow | ❌ Not Started | P0 | 3d | High |
| Subscription Enforcement | ❌ Not Started | P0 | 3d | Critical |
| Customer Portal | ❌ Not Started | P0 | 1d | High |
| Entitlements Helper | ❌ Not Started | P0 | 2d | Critical |
| Upgrade CTAs | ❌ Not Started | P0 | 1d | Medium |
| Trial Delivery Allowance | ❌ Not Started | P1 | 2d | Medium |
| Physical Mail Billing | ❌ Not Started | P1 | 4d | High |

### 4.2 Incomplete Implementations

#### Webhook Handler
**File:** `apps/web/app/api/webhooks/stripe/route.ts`

**Implemented Events (6/12):**
- ✅ customer.created
- ✅ customer.subscription.created
- ✅ customer.subscription.updated
- ✅ customer.subscription.deleted
- ✅ payment_intent.succeeded
- ✅ payment_intent.payment_failed

**Missing Events (6/12):**
- ❌ customer.subscription.trial_will_end
- ❌ invoice.payment_failed
- ❌ invoice.payment_succeeded
- ❌ customer.subscription.paused
- ❌ customer.subscription.resumed
- ❌ charge.refunded

#### Stripe Provider Functions
**File:** `apps/web/server/providers/stripe.ts`

**Implemented Functions (2/10):**
- ✅ createCheckoutSession (unused)
- ✅ createCustomerPortalSession (unused)

**Missing Functions (8/10):**
- ❌ cancelSubscription
- ❌ updateSubscription (upgrade/downgrade)
- ❌ retrieveSubscription
- ❌ listCustomerSubscriptions
- ❌ createCustomer (should be in Clerk webhook)
- ❌ createUsageRecord (physical mail metering)
- ❌ applyPromotionCode
- ❌ previewInvoice (for proration)

### 4.3 Data Integrity Issues

#### Orphaned Customer Records
**Risk:** Users created without Stripe customer IDs

**Current State:**
```sql
SELECT COUNT(*) FROM profiles WHERE stripe_customer_id IS NULL;
-- Likely returns all users if no customer creation implemented
```

**Mitigation:**
1. Backfill script to create customers for existing users
2. Enforce customer creation in signup flow going forward

#### Dangling Subscriptions
**Risk:** Subscriptions in DB without corresponding Stripe records

**Detection:**
```sql
SELECT s.* FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.user_id
WHERE p.stripe_customer_id IS NULL;
```

**Mitigation:**
1. Reconciliation job to verify Stripe subscription status
2. Alert on mismatches

### 4.4 Security Concerns

#### Missing Webhook Idempotency
**Current Issue:**
```typescript
// apps/web/app/api/webhooks/stripe/route.ts
switch (event.type) {
  case "customer.subscription.created":
    await prisma.subscription.upsert({ ... })
    // ✅ Upsert is idempotent
    break

  case "payment_intent.succeeded":
    await prisma.payment.create({ ... })
    // ❌ Create is NOT idempotent - duplicate events = duplicate records
    break
}
```

**Fix:**
Use `createMany` with `skipDuplicates: true` or check for existing records:
```typescript
case "payment_intent.succeeded":
  const existing = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id }
  })

  if (!existing) {
    await prisma.payment.create({ ... })
  }
  break
```

#### Missing Stripe Signature Verification Logging
**Current:**
```typescript
try {
  event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
} catch (err) {
  console.error("Webhook signature verification failed:", err)
  return new Response("Invalid signature", { status: 400 })
}
```

**Enhancement:**
Log failed verification attempts for security monitoring:
```typescript
catch (err) {
  await logger.error('Stripe webhook signature verification failed', err, {
    ip: req.headers.get('x-forwarded-for'),
    userAgent: req.headers.get('user-agent')
  })
  // Potential attack detection
}
```

---

## 5. Recommendations (Prioritized)

### Phase 1: Launch Blockers (1-2 weeks)

#### Week 1: Core Revenue Infrastructure

**Day 1-2: Pricing Page**
- Create `/pricing` route
- Design plan comparison table (Free vs Pro)
- Add feature matrix
- Implement "Start Free Trial" and "Upgrade" CTAs
- Wire up checkout redirect

**Day 3-4: Checkout Flow**
- Connect `createCheckoutSession` to "Upgrade" buttons
- Implement success/cancel redirect handlers
- Add loading states during checkout
- Test Stripe Checkout flow end-to-end
- Configure Stripe customer portal settings in dashboard

**Day 5-7: Subscription Enforcement**
- Create `entitlements.ts` helper with Redis caching
- Add guards to `scheduleDelivery` server action
- Implement `PAYMENT_REQUIRED` error handling in UI
- Create upgrade modal component
- Test enforcement (free users blocked, Pro users allowed)

#### Week 2: Self-Service + Physical Mail

**Day 8-9: Customer Portal**
- Wire up `createCustomerPortalSession` to Settings page
- Implement portal redirect flow
- Display current subscription status in Settings
- Test subscription management (upgrade, cancel, payment method)

**Day 10-12: Physical Mail Billing**
- Define pricing model (per-letter or credit packs)
- Add `mailCredits` field to Profile model
- Implement credit deduction on mail scheduling
- Create "Buy Mail Credits" checkout flow
- Guard physical mail scheduling with credit check

**Day 13-14: Webhook Coverage**
- Add missing webhook events (trial ending, invoice failed, etc.)
- Implement notification emails via Inngest
- Test dunning flow for failed payments
- Add telemetry for all payment events

---

### Phase 2: Beta Improvements (1 week)

**Day 15-16: Plan Management**
- Implement plan upgrade/downgrade functions
- Add proration preview
- Handle plan changes with confirmation UI
- Test monthly ↔ annual switching

**Day 17-18: Analytics Setup**
- Add PostHog event tracking for billing events
- Create Stripe dashboard for MRR/ARR
- Set up Slack alerts for payment failures
- Track conversion funnel metrics

**Day 19-21: Quality & Testing**
- Add E2E tests for checkout flow
- Test webhook event processing
- Verify idempotency and error handling
- Load test payment processing

---

### Phase 3: Post-Launch (Ongoing)

**Tax Compliance:**
- Enable Stripe Tax or integrate TaxJar
- Collect customer tax address
- Comply with EU VAT, US sales tax

**Promotions:**
- Add coupon input to checkout
- Support trial extensions
- Implement referral credits

**Advanced Metering:**
- Usage-based pricing for power users
- Volume discounts
- Enterprise custom pricing

---

## 6. Technical Debt & Risks

### 6.1 API Version Lag
**Current:** Stripe API version `2023-10-16` (provider setup)
**Latest:** `2024-11-20` (as of analysis date)

**Risk:** Missing new features, potential breaking changes unaccounted for

**Recommendation:** Upgrade to latest API version, test thoroughly

---

### 6.2 No Webhook Replay Protection
**Current:** Webhooks processed synchronously without deduplication

**Risk:** Duplicate events could create duplicate payment records

**Recommendation:**
1. Add `processedEvents` table to track event IDs
2. Check `event.id` before processing
3. Or: Move to Inngest for automatic deduplication

---

### 6.3 Hardcoded "Pro" Plan
**Current:** Schema only supports `SubscriptionPlan.pro`

**Risk:** Cannot introduce additional tiers (e.g., "Basic", "Enterprise")

**Recommendation:**
1. Add "free" tier to enum
2. Plan for tiered pricing expansion
3. Consider JSON metadata field for flexible tier definitions

---

### 6.4 Missing Subscription Status Transitions
**Current:** Webhook updates status directly without validation

**Risk:** Invalid state transitions (e.g., `canceled` → `active`)

**Recommendation:**
Implement state machine validation:
```typescript
const VALID_TRANSITIONS = {
  trialing: ['active', 'canceled'],
  active: ['past_due', 'canceled', 'paused'],
  past_due: ['active', 'unpaid', 'canceled'],
  // ... define all valid transitions
}

function validateTransition(current: Status, next: Status): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false
}
```

---

## 7. Implementation Roadmap

### Immediate Actions (This Week)

**Priority 0 - Critical:**
1. ✅ Complete this analysis document
2. ⏳ Create pricing page wireframe
3. ⏳ Implement entitlements helper
4. ⏳ Add subscription guards to server actions
5. ⏳ Wire up checkout flow

### Short-Term (Weeks 1-2)

**Priority 1 - Launch Blockers:**
1. Complete checkout + pricing page
2. Implement customer portal
3. Add physical mail billing
4. Expand webhook coverage
5. Test end-to-end payment flows

### Medium-Term (Weeks 3-4)

**Priority 2 - Beta Quality:**
1. Plan management (upgrade/downgrade)
2. Analytics integration
3. E2E test suite
4. Performance optimization
5. Error recovery testing

### Long-Term (Post-Launch)

**Priority 3 - Growth:**
1. Tax compliance
2. Promotion support
3. Advanced metering
4. Multi-tier pricing
5. Enterprise features

---

## 8. Code Quality & Standards

### 8.1 Current Code Quality

**Stripe Provider (`stripe.ts`):**
- ✅ TypeScript types enabled
- ✅ Environment validation via Zod
- ✅ Async/await patterns
- ❌ Missing JSDoc comments
- ❌ No error handling in exported functions
- ❌ No input validation

**Webhook Handler (`route.ts`):**
- ✅ Signature verification
- ✅ Try/catch error handling
- ✅ Proper HTTP status codes
- ❌ Console.log instead of structured logger
- ❌ No webhook event deduplication
- ❌ No telemetry/metrics

**Database Models (`schema.prisma`):**
- ✅ Well-structured relationships
- ✅ Proper indexes
- ✅ Timestamp tracking
- ✅ Cascade deletes configured
- ❌ Missing free tier in SubscriptionPlan enum

### 8.2 Recommended Standards

**Error Handling:**
```typescript
// apps/web/server/providers/stripe.ts
export async function createCheckoutSession(params: CheckoutParams) {
  try {
    const session = await stripe.checkout.sessions.create({ ... })
    return { success: true, data: session }
  } catch (error) {
    await logger.error('Stripe checkout creation failed', error, { params })
    return {
      success: false,
      error: {
        code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
        message: 'Failed to create checkout session',
        details: error
      }
    }
  }
}
```

**Input Validation:**
```typescript
import { z } from 'zod'

const CheckoutParamsSchema = z.object({
  userId: z.string().uuid(),
  priceId: z.string().startsWith('price_'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
})

export async function createCheckoutSession(input: unknown) {
  const validated = CheckoutParamsSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: { ... } }
  }
  // ... proceed with validated.data
}
```

**Logging Standards:**
```typescript
// Use structured logger, not console.log
await logger.info('Stripe webhook processed', {
  event: event.type,
  eventId: event.id,
  customerId: customer.id,
  duration: Date.now() - startTime
})
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Not Implemented)

**Required Coverage:**
- Entitlements helper (plan checking)
- Webhook event processing
- Subscription status transitions
- Payment record creation

**Example:**
```typescript
// apps/web/server/lib/__tests__/entitlements.test.ts
describe('getEntitlements', () => {
  it('returns Pro entitlements for active subscription', async () => {
    const userId = 'test-user'
    await createMockSubscription({ userId, plan: 'pro', status: 'active' })

    const entitlements = await getEntitlements(userId)

    expect(entitlements.canScheduleDeliveries).toBe(true)
    expect(entitlements.plan).toBe('pro')
  })

  it('returns free entitlements when no subscription exists', async () => {
    const entitlements = await getEntitlements('no-subscription-user')

    expect(entitlements.canScheduleDeliveries).toBe(false)
    expect(entitlements.plan).toBe('free')
  })
})
```

### 9.2 Integration Tests (Not Implemented)

**Required Coverage:**
- Full checkout flow (Stripe test mode)
- Webhook processing with mock events
- Subscription lifecycle (create, update, cancel)
- Payment failure handling

**Example:**
```typescript
// apps/web/__tests__/integration/checkout.test.ts
describe('Checkout Flow', () => {
  it('completes subscription checkout successfully', async () => {
    const user = await createTestUser()

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      priceId: env.STRIPE_PRICE_PRO_MONTHLY,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    })

    expect(session.url).toBeDefined()

    // Simulate webhook (using Stripe CLI)
    await triggerStripeWebhook('customer.subscription.created', {
      customer: user.profile.stripeCustomerId,
      // ... event data
    })

    // Verify subscription created
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id }
    })

    expect(subscription).toBeDefined()
    expect(subscription.status).toBe('active')
  })
})
```

### 9.3 E2E Tests (Not Implemented)

**Required Coverage:**
- User signup → checkout → subscription active
- Free user blocked from scheduling → upgrades → can schedule
- Subscription cancellation → feature access revoked
- Physical mail purchase → credits deducted

**Tools:**
- Playwright for browser automation
- Stripe test mode API
- Database seeding/cleanup

---

## 10. Monitoring & Alerting

### 10.1 Required Metrics

**Revenue Metrics:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate (monthly)
- ARPU (Average Revenue Per User)
- Trial conversion rate

**Operational Metrics:**
- Webhook processing latency (p50, p95, p99)
- Webhook failure rate
- Payment failure rate
- Subscription creation rate
- Upgrade/downgrade rate

### 10.2 Alert Triggers

**Critical Alerts:**
- Webhook endpoint down (5+ consecutive failures)
- Payment failure rate > 5% (past 1 hour)
- Subscription churn spike (> 2σ from baseline)
- Revenue drop > 10% (week-over-week)

**Warning Alerts:**
- Webhook latency > 5s (p95)
- Trial conversion rate < 10% (weekly)
- Physical mail billing errors

### 10.3 Dashboards

**Stripe Dashboard:**
- MRR/ARR trends
- Subscriber count by plan
- Payment failure breakdown
- Refund volume

**Application Dashboard (PostHog/Custom):**
- Checkout funnel (visitor → trial → paid)
- Feature usage by plan tier
- Upgrade flow drop-off points
- Support ticket volume by topic

---

## 11. Security & Compliance

### 11.1 PCI Compliance

**Current State:**
- ✅ Stripe handles all card data (PCI DSS Level 1)
- ✅ No card details stored in application database
- ✅ Webhooks use HTTPS with signature verification
- ❌ Missing webhook IP whitelist (Vercel firewall rules)

**Recommendations:**
1. Restrict webhook endpoint to Stripe IPs
2. Rate limit webhook endpoint (prevent abuse)
3. Log all payment-related events for audit

### 11.2 Data Privacy

**Current State:**
- ✅ Payment data stored with user consent
- ✅ Minimal PII in payment records (userId, amount)
- ❌ No GDPR export for payment history
- ❌ No data retention policy documented

**Recommendations:**
1. Include payment history in GDPR export (`/api/dsr/export`)
2. Anonymize payment records after 7 years
3. Add subscription data to user deletion flow

### 11.3 Webhook Security

**Current Validation:**
```typescript
event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
```

**Status:** ✅ Signature verification implemented

**Additional Hardening:**
1. Validate event timestamps (reject old events)
2. Check event uniqueness (prevent replay)
3. Verify customer ID matches user profile
4. Rate limit webhook endpoint per IP

---

## 12. Documentation Gaps

### 12.1 Missing User Documentation

**Required Pages:**
- How billing works
- What happens when trial ends
- How to upgrade/downgrade
- Physical mail pricing explanation
- Cancellation policy
- Refund policy

### 12.2 Missing Developer Documentation

**Required Docs:**
- Stripe integration architecture
- Webhook event processing guide
- Testing payment flows locally
- Subscription lifecycle state machine
- Error handling patterns

### 12.3 Missing Runbooks

**Operations Runbooks:**
- Handle failed payment notification
- Investigate webhook processing failure
- Process manual refund request
- Backfill missing Stripe customer IDs
- Reconcile subscription status mismatches

---

## Conclusion

The DearMe application has a **solid foundation** for Stripe integration (database models, webhook infrastructure) but is **critically incomplete** for revenue generation. The following must be addressed immediately:

**Launch Blockers (P0):**
1. Implement pricing page and checkout flow
2. Add subscription enforcement to server actions
3. Wire up customer portal for self-service
4. Complete entitlements system with caching

**High Priority (P1):**
5. Expand webhook coverage for critical events
6. Implement physical mail billing system
7. Add plan upgrade/downgrade logic
8. Build analytics and monitoring

**Estimated Timeline:**
- P0 items: 1-2 weeks (with focused effort)
- P1 items: Additional 1-2 weeks
- Beta-ready: 3-4 weeks total

**Risk Assessment:**
Without P0 items, the application **cannot generate revenue** and should not launch to paying customers. The current state allows unlimited free usage of all features.

---

**Next Steps:**
1. Review this analysis with product and engineering teams
2. Prioritize features based on go-to-market timeline
3. Allocate engineering resources for 3-4 week sprint
4. Set up Stripe test environment for development
5. Create detailed implementation tickets from recommendations

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Complete
