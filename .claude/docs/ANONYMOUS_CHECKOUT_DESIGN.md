# Anonymous Checkout & Subscription Paywall - System Design

**Status**: Design Specification
**Created**: 2025-11-17
**Architecture Pattern**: Anonymous Checkout → Payment → Forced Signup → Account Linking

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Requirements](#core-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [User Flows](#user-flows)
6. [API Specification](#api-specification)
7. [Security Architecture](#security-architecture)
8. [Error Handling](#error-handling)
9. [Background Jobs](#background-jobs)
10. [UI/UX Specification](#uiux-specification)
11. [Testing Strategy](#testing-strategy)
12. [Migration Plan](#migration-plan)
13. [Monitoring & Observability](#monitoring--observability)

---

## Executive Summary

### Problem Statement
Enable users to purchase subscriptions **before creating an account**, using the email they entered in the letter form. After payment completion, require account creation to activate the subscription.

### Solution Overview
Implement a **PendingSubscription** pattern that:
1. Creates Stripe Customer with email **before** checkout (locks email in Stripe UI)
2. Stores subscription data temporarily while awaiting account creation
3. Links subscription to user account after signup via dual-path resolution
4. Handles all edge cases: payment failures, abandoned checkouts, email mismatches, race conditions

### Key Benefits
- **Reduced Friction**: Users can pay without signup upfront
- **Higher Conversion**: Fewer barriers to purchase
- **Email Security**: Locked email prevents account hijacking
- **Resilient**: Handles webhooks, race conditions, and edge cases gracefully

---

## Core Requirements

### Functional Requirements

**FR1: Anonymous Checkout**
- User can purchase subscription without authentication
- Email from letter form is used for payment (prefilled, locked)
- Supports both "coming from letter" and "direct subscribe" paths

**FR2: Email Locking**
- Email cannot be changed in Stripe Checkout UI
- Implemented by creating Stripe Customer before checkout session

**FR3: Forced Signup After Payment**
- Success page requires account creation
- Email must match payment email (Clerk signup with locked field)
- Email verification required before subscription activation

**FR4: Automatic Account Linking**
- Webhook receives payment → checks if user exists → auto-link if found
- Signup webhook → checks if pending subscription exists → auto-link if found
- Dual-path resolution handles race conditions

**FR5: Error State Handling**
- Payment failed: show error, allow retry
- Session expired: show expired message, allow new checkout
- Email mismatch: block signup, force correct email
- Incomplete payment: allow resume checkout

### Non-Functional Requirements

**NFR1: Performance**
- Subscribe page load: < 500ms
- Checkout creation: < 2s
- Webhook processing: < 100ms (queue to Inngest)
- Account linking: < 500ms

**NFR2: Security**
- Email verification before activation
- Prevent account hijacking via email locking
- Idempotent webhook processing
- Secure session handling

**NFR3: Reliability**
- 99.9% uptime for checkout flow
- Graceful degradation if Stripe API slow
- Retry logic for failed operations
- 30-day grace period before auto-refund

**NFR4: Observability**
- Complete audit trail for all subscription operations
- Metrics: conversion rate, abandonment rate, linking success rate
- Alerts: high error rates, stuck pending subscriptions

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Journey                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. /subscribe (Pricing Page)                                    │
│     - Server Component                                           │
│     - Email capture form (if not from letter)                    │
│     - 3 pricing cards: Free, Pro Monthly, Pro Yearly            │
│     - No header/footer                                           │
└─────────────────────────────────────────────────────────────────┘
                              │ createAnonymousCheckout()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Action: createAnonymousCheckout()                        │
│     1. Validate email format                                     │
│     2. Check for existing PendingSubscription                    │
│     3. Create Stripe Customer with email                         │
│     4. Create Stripe Checkout Session (customer param)           │
│     5. Create PendingSubscription record                         │
│     6. Return checkout URL                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Stripe Checkout (External)                                   │
│     - Email locked (customer already exists)                     │
│     - Payment form                                               │
│     - Redirects to success_url after payment                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Webhook Path            │   │  User Path              │
│  checkout.session        │   │  /subscribe/success     │
│  .completed              │   │                         │
│                          │   │  - Verify session       │
│  1. Find PendingSub      │   │  - Show Clerk SignUp    │
│  2. Update status:       │   │  - Email locked         │
│     payment_complete     │   │  - After signup:        │
│  3. Check if User exists │   │    linkPendingSub()     │
│  4. If yes: auto-link    │   │                         │
└─────────────────────────┘   └─────────────────────────┘
                 │                         │
                 └────────────┬────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Account Linked - Subscription Active                         │
│     - User redirected to /dashboard                              │
│     - Subscription features enabled                              │
│     - Entitlements cache invalidated                             │
└─────────────────────────────────────────────────────────────────┘
```

### State Machine

```
[Initial]
   │ createAnonymousCheckout()
   ▼
[awaiting_payment]
   │ checkout.session.completed
   ▼
[payment_complete]
   │ linkPendingSubscription()
   ▼
[linked] (Terminal)

Alternative Paths:
[awaiting_payment] → [expired] (24h timeout)
[payment_complete] → [expired] (30d timeout) → [refunded]
```

---

## Database Schema

### New Model: PendingSubscription

```prisma
model PendingSubscription {
  id                   String   @id @default(uuid()) @db.Uuid
  email                String   @db.Citext // Case-insensitive, links to User.email

  // Stripe references
  stripeCustomerId     String   @unique @map("stripe_customer_id")
  stripeSessionId      String   @unique @map("stripe_session_id")
  stripeSubscriptionId String?  @unique @map("stripe_subscription_id") // Null until payment

  // Plan details
  priceId              String   @map("price_id")
  plan                 SubscriptionPlan
  amountCents          Int      @map("amount_cents")
  currency             String   @default("usd") @db.Char(3)

  // Status tracking
  status               PendingSubscriptionStatus @default(awaiting_payment)
  paymentStatus        String?  @map("payment_status") // From Stripe

  // Metadata
  metadata             Json     @default("{}") // { letterId, source, etc }

  // Lifecycle
  expiresAt            DateTime @map("expires_at") // 30 days from creation
  linkedAt             DateTime? @map("linked_at")
  linkedUserId         String?  @db.Uuid @map("linked_user_id") // Audit trail

  createdAt            DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt            DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@index([email])
  @@index([status])
  @@index([expiresAt])
  @@map("pending_subscriptions")
}

enum PendingSubscriptionStatus {
  awaiting_payment  // Checkout created, payment pending
  payment_complete  // Payment succeeded, awaiting signup
  linked            // Successfully linked to user account
  expired           // Expired without signup
  refunded          // Refunded due to expiry

  @@map("pending_subscription_status")
}
```

### Schema Changes to Existing Models

**No changes required** to existing User, Profile, or Subscription models. The PendingSubscription acts as a temporary staging area before promotion.

### Indexes for Performance

```sql
-- Fast email lookups (case-insensitive)
CREATE INDEX idx_pending_subscriptions_email ON pending_subscriptions (email);

-- Status filtering
CREATE INDEX idx_pending_subscriptions_status ON pending_subscriptions (status);

-- Expiry cleanup job
CREATE INDEX idx_pending_subscriptions_expires_at ON pending_subscriptions (expires_at);

-- Composite for common query: find pending by email + status
CREATE INDEX idx_pending_subscriptions_email_status ON pending_subscriptions (email, status);
```

---

## User Flows

### Flow 1: New User from Letter Form (Happy Path)

```
1. User writes letter, enters email: user@example.com
2. Clicks "Schedule Letter" → Paywall: "Upgrade to schedule"
3. Redirected to /subscribe?email=user@example.com&letterId=xxx
4. Email prefilled, plan selection shown
5. Clicks "Subscribe to Pro Monthly"
   → Server Action: createAnonymousCheckout()
   → Creates Stripe Customer
   → Creates PendingSubscription (awaiting_payment)
   → Returns Stripe Checkout URL
6. Redirects to Stripe Checkout (email locked)
7. User enters payment info, completes payment
8. Stripe webhook: checkout.session.completed
   → Updates PendingSubscription (payment_complete)
   → Checks if User exists (not yet) → no action
9. User redirected to /subscribe/success?session_id=xxx
10. Success page shows:
    - "Payment Successful!"
    - Clerk SignUp component (email locked to user@example.com)
11. User completes signup, verifies email
12. Clerk webhook: user.created
    → Calls linkPendingSubscription()
    → Finds PendingSubscription with matching email
    → Creates Subscription record
    → Updates Profile.stripeCustomerId
    → Updates PendingSubscription (linked)
    → Invalidates entitlements cache
13. User redirected to /dashboard
14. Letter can now be scheduled
```

### Flow 2: Direct Subscribe (No Letter)

```
1. User visits /subscribe directly
2. Enters email manually in form: user@example.com
3. Selects "Subscribe to Pro Yearly"
4. Same flow as Flow 1 (steps 5-13)
5. Dashboard shows: "No letters yet, create your first one!"
```

### Flow 3: Existing User Upgrading

```
1. Authenticated user visits /subscribe
2. Email auto-filled from user.email (no input needed)
3. Selects plan, clicks Subscribe
   → createAnonymousCheckout() OR direct Stripe checkout
   → If user has stripeCustomerId: use existing customer
   → If not: create new customer, link immediately
4. Payment completes
5. Webhook auto-links immediately (user already exists)
6. Success page: "Subscription Activated!" → /dashboard
```

### Flow 4: Abandoned Checkout Recovery

```
1. User creates checkout, gets to Stripe, abandons
2. PendingSubscription status: awaiting_payment
3. After 6 hours: Inngest sends "Complete Your Checkout" email
4. User clicks link in email
5. Redirected to /subscribe
6. Banner shows: "You have an incomplete payment. [Resume Checkout]"
7. Click → /subscribe/resume/[sessionId]
8. Verifies session not expired
9. Redirects to Stripe Checkout (same session)
10. User completes payment → normal flow
```

### Flow 5: Payment Failed

```
1. User completes checkout, payment fails (card declined)
2. Stripe redirects to /subscribe/error?code=payment_failed
3. Error page shows:
   - "Payment Unsuccessful"
   - Reason: "Your card was declined"
   - Button: "Try Again" → /subscribe (email prefilled)
4. User tries with different card → normal flow
```

### Flow 6: Email Mismatch (Edge Case)

```
1. User pays with payment@example.com
2. User tries to sign up with different@example.com
3. Clerk allows signup (different email)
4. linkPendingSubscription() checks email match
5. No match found → subscription NOT linked
6. Dashboard shows banner: "Email mismatch detected. Contact support."
7. Support manually links OR user signs out, signs in with correct email
```

---

## API Specification

### Server Actions

#### 1. createAnonymousCheckout

**File**: `apps/web/app/subscribe/actions.ts`

```typescript
/**
 * Create anonymous checkout session for subscription purchase
 *
 * Flow:
 * 1. Validate email
 * 2. Check for existing PendingSubscription
 * 3. Create Stripe Customer
 * 4. Create Stripe Checkout Session
 * 5. Create PendingSubscription record
 *
 * @returns Checkout session URL and ID
 */
export async function createAnonymousCheckout(
  input: AnonymousCheckoutInput
): Promise<CheckoutSessionResponse>

// Input Schema
type AnonymousCheckoutInput = {
  email: string           // User's email (from form or letter)
  priceId: string         // Stripe Price ID (e.g., "price_xxx")
  letterId?: string       // Optional letter ID (if from letter form)
  metadata?: Record<string, unknown> // Additional metadata
}

// Response Schema
type CheckoutSessionResponse = {
  sessionId: string       // Stripe Session ID
  sessionUrl: string      // Redirect URL for Stripe Checkout
  customerId: string      // Stripe Customer ID
}

// Error Cases
throw new Error("Email is required")
throw new Error("Invalid price ID")
throw new Error("Stripe API error: [message]")
```

**Implementation Details**:

```typescript
export async function createAnonymousCheckout(
  input: AnonymousCheckoutInput
): Promise<CheckoutSessionResponse> {
  // 1. Validate input
  const validated = AnonymousCheckoutSchema.parse(input)

  // 2. Check for existing PendingSubscription
  const existing = await prisma.pendingSubscription.findFirst({
    where: {
      email: validated.email,
      status: { in: ["awaiting_payment", "payment_complete"] },
      expiresAt: { gt: new Date() } // Not expired
    }
  })

  if (existing && existing.status === "awaiting_payment") {
    // Resume existing checkout
    const session = await stripe.checkout.sessions.retrieve(existing.stripeSessionId)
    if (session.status === "open") {
      return {
        sessionId: session.id,
        sessionUrl: session.url!,
        customerId: existing.stripeCustomerId
      }
    }
  }

  if (existing && existing.status === "payment_complete") {
    // Already paid, redirect to signup
    throw new Error("ALREADY_PAID")
  }

  // 3. Create Stripe Customer (locks email)
  const customer = await stripe.customers.create({
    email: validated.email,
    metadata: {
      source: "anonymous_checkout",
      letterId: validated.letterId || "",
    }
  })

  // 4. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id, // THIS LOCKS THE EMAIL
    payment_method_types: ["card"],
    line_items: [
      {
        price: validated.priceId,
        quantity: 1,
      }
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe`,
    metadata: {
      email: validated.email,
      letterId: validated.letterId || "",
      ...validated.metadata,
    },
    expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  })

  // 5. Get pricing info
  const price = await stripe.prices.retrieve(validated.priceId)
  const product = await stripe.products.retrieve(price.product as string)

  // 6. Create PendingSubscription record
  await prisma.pendingSubscription.create({
    data: {
      email: validated.email,
      stripeCustomerId: customer.id,
      stripeSessionId: session.id,
      priceId: validated.priceId,
      plan: mapProductToPlan(product.name), // "pro"
      amountCents: price.unit_amount!,
      currency: price.currency,
      status: "awaiting_payment",
      metadata: validated.metadata || {},
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  })

  // 7. Create audit event
  await createAuditEvent({
    userId: null, // No user yet
    type: "subscription.checkout_created",
    data: {
      email: validated.email,
      sessionId: session.id,
      plan: product.name,
      amount: price.unit_amount,
    }
  })

  return {
    sessionId: session.id,
    sessionUrl: session.url!,
    customerId: customer.id,
  }
}
```

#### 2. linkPendingSubscription

**File**: `apps/web/server/actions/subscriptions.ts`

```typescript
/**
 * Link pending subscription to user account
 *
 * Called after:
 * 1. User signup (Clerk webhook)
 * 2. Dashboard mount (if missed in webhook)
 * 3. Manual admin action
 *
 * @param userId User ID to link subscription to
 * @returns Success status and subscription details
 */
export async function linkPendingSubscription(
  userId: string
): Promise<LinkResult>

type LinkResult = {
  success: boolean
  subscriptionId?: string
  error?: string
}
```

**Implementation**:

```typescript
export async function linkPendingSubscription(
  userId: string
): Promise<LinkResult> {
  // 1. Get user with email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  // 2. Find pending subscription with matching email
  const pending = await prisma.pendingSubscription.findFirst({
    where: {
      email: user.email,
      status: "payment_complete",
      expiresAt: { gt: new Date() }
    }
  })

  if (!pending) {
    // No pending subscription found (not an error, just nothing to link)
    return { success: true }
  }

  // 3. Verify email is verified in Clerk
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(user.clerkUserId)

  if (!clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.verification?.status === "verified") {
    return { success: false, error: "Email not verified" }
  }

  // 4. Create Subscription record (promote from pending)
  const subscription = await prisma.$transaction(async (tx) => {
    // Create subscription
    const sub = await tx.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: pending.stripeSubscriptionId!,
        status: "active", // Webhook will update if different
        plan: pending.plan,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Webhook will update
      }
    })

    // Update profile with Stripe customer ID
    await tx.profile.update({
      where: { userId: user.id },
      data: { stripeCustomerId: pending.stripeCustomerId }
    })

    // Update pending subscription status
    await tx.pendingSubscription.update({
      where: { id: pending.id },
      data: {
        status: "linked",
        linkedAt: new Date(),
        linkedUserId: user.id,
      }
    })

    return sub
  })

  // 5. Invalidate entitlements cache
  await invalidateEntitlementsCache(user.id)

  // 6. Create usage record
  await createUsageRecord(user.id, new Date(), 2) // 2 mail credits

  // 7. Audit event
  await createAuditEvent({
    userId: user.id,
    type: "subscription.linked",
    data: {
      subscriptionId: subscription.id,
      pendingSubscriptionId: pending.id,
      plan: pending.plan,
    }
  })

  return {
    success: true,
    subscriptionId: subscription.id,
  }
}
```

### API Routes

#### 1. Enhanced Stripe Webhook Handler

**File**: `apps/web/app/api/webhooks/stripe/route.ts`

**New Event Handling**:

```typescript
// Existing: queues to Inngest
await triggerInngestEvent("stripe/webhook.received", { event })
```

**Inngest Function Enhancement**:

**File**: `workers/inngest/functions/billing/process-stripe-webhook.ts`

```typescript
// Add new case for checkout.session.completed
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session

  // 1. Find PendingSubscription by customer or session ID
  const pending = await prisma.pendingSubscription.findFirst({
    where: {
      OR: [
        { stripeCustomerId: session.customer as string },
        { stripeSessionId: session.id },
      ]
    }
  })

  if (!pending) {
    console.warn("[Webhook] No pending subscription found", {
      sessionId: session.id,
      customer: session.customer,
    })
    break
  }

  // 2. Update status to payment_complete
  await prisma.pendingSubscription.update({
    where: { id: pending.id },
    data: {
      status: "payment_complete",
      stripeSubscriptionId: session.subscription as string,
      paymentStatus: session.payment_status,
    }
  })

  // 3. Check if user already exists with this email
  const user = await prisma.user.findUnique({
    where: { email: pending.email }
  })

  if (user) {
    // User exists! Auto-link immediately
    console.log("[Webhook] User exists, auto-linking", {
      userId: user.id,
      email: pending.email,
    })

    await linkPendingSubscription(user.id)
  } else {
    // User doesn't exist yet, wait for signup
    console.log("[Webhook] Waiting for signup", {
      email: pending.email,
    })

    // Send "complete signup" email
    await triggerInngestEvent("billing/send-signup-reminder", {
      pendingSubscriptionId: pending.id,
      email: pending.email,
      immediate: true, // Send immediately after payment
    })
  }

  // 4. Audit event
  await createAuditEvent({
    userId: user?.id || null,
    type: "subscription.payment_completed",
    data: {
      pendingSubscriptionId: pending.id,
      sessionId: session.id,
      autoLinked: !!user,
    }
  })

  break
}
```

#### 2. Cron Job: Cleanup Pending Subscriptions

**File**: `apps/web/app/api/cron/cleanup-pending-subscriptions/route.ts`

```typescript
/**
 * Daily cleanup job for expired pending subscriptions
 *
 * Runs daily at 2am UTC
 *
 * Steps:
 * 1. Find expired pending subscriptions (status != linked, expiresAt < now)
 * 2. For each: check if subscription still active on Stripe
 * 3. If active: cancel + refund
 * 4. Update status to refunded
 * 5. Send notification email
 */
export async function POST(req: Request) {
  // 1. Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = new Date()

  // 2. Find expired pending subscriptions
  const expired = await prisma.pendingSubscription.findMany({
    where: {
      status: { in: ["awaiting_payment", "payment_complete"] },
      expiresAt: { lt: now },
    },
    take: 100, // Process in batches
  })

  console.log("[Cleanup] Found expired pending subscriptions", {
    count: expired.length,
  })

  let refundedCount = 0
  let errors: Array<{ id: string; error: string }> = []

  for (const pending of expired) {
    try {
      // Skip if no subscription ID (never paid)
      if (!pending.stripeSubscriptionId) {
        await prisma.pendingSubscription.update({
          where: { id: pending.id },
          data: { status: "expired" }
        })
        continue
      }

      // Check subscription status on Stripe
      const subscription = await stripe.subscriptions.retrieve(
        pending.stripeSubscriptionId
      )

      if (subscription.status === "active" || subscription.status === "trialing") {
        // Cancel subscription
        await stripe.subscriptions.cancel(pending.stripeSubscriptionId)

        // Issue refund if payment exists
        if (subscription.latest_invoice) {
          const invoice = await stripe.invoices.retrieve(
            subscription.latest_invoice as string
          )

          if (invoice.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              invoice.payment_intent as string
            )

            if (paymentIntent.status === "succeeded") {
              await stripe.refunds.create({
                payment_intent: paymentIntent.id,
                reason: "requested_by_customer",
                metadata: {
                  reason: "subscription_expired_without_activation",
                  pendingSubscriptionId: pending.id,
                }
              })
              refundedCount++
            }
          }
        }
      }

      // Update status
      await prisma.pendingSubscription.update({
        where: { id: pending.id },
        data: {
          status: subscription.status === "active" ? "refunded" : "expired"
        }
      })

      // Send email notification
      await triggerInngestEvent("billing/send-expiry-notification", {
        email: pending.email,
        refunded: subscription.status === "active",
      })

    } catch (error) {
      console.error("[Cleanup] Error processing pending subscription", {
        id: pending.id,
        error: error instanceof Error ? error.message : String(error),
      })
      errors.push({
        id: pending.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Log results
  console.log("[Cleanup] Completed", {
    processed: expired.length,
    refunded: refundedCount,
    errors: errors.length,
  })

  return Response.json({
    success: true,
    processed: expired.length,
    refunded: refundedCount,
    errors,
  })
}
```

---

## Security Architecture

### 1. Email Locking Mechanism

**Problem**: Prevent email from being changed in Stripe Checkout UI

**Solution**: Create Stripe Customer **before** checkout session

```typescript
// INCORRECT (email can be changed):
stripe.checkout.sessions.create({
  customer_email: "user@example.com", // User can edit this!
  ...
})

// CORRECT (email locked):
const customer = await stripe.customers.create({
  email: "user@example.com"
})

stripe.checkout.sessions.create({
  customer: customer.id, // Email locked because customer exists
  ...
})
```

### 2. Email Verification Attack Prevention

**Attack**: Malicious user pays with `victim@email.com`, creates account with that email

**Mitigation**:
1. Clerk requires email verification before account is active
2. `linkPendingSubscription()` checks `emailVerified` status
3. Don't activate subscription until email verified
4. Show banner: "Verify your email to activate subscription"

```typescript
// In linkPendingSubscription()
const clerkUser = await clerk.users.getUser(user.clerkUserId)
const emailVerified = clerkUser.emailAddresses
  .find(e => e.id === clerkUser.primaryEmailAddressId)
  ?.verification?.status === "verified"

if (!emailVerified) {
  return { success: false, error: "Email not verified" }
}
```

### 3. Race Condition Handling

**Problem**: Webhook arrives before/after signup

**Solution**: Dual-path resolution

**Scenario A: Webhook → Signup**
```
1. Webhook: checkout.session.completed
   → Updates PendingSubscription (payment_complete)
   → Checks if User exists → NO
2. User signs up
   → linkPendingSubscription() finds PendingSubscription
   → Links successfully
```

**Scenario B: Signup → Webhook**
```
1. User signs up (immediately after payment)
   → linkPendingSubscription() finds nothing (webhook not arrived yet)
   → No action
2. Webhook: checkout.session.completed
   → Checks if User exists → YES
   → Auto-links immediately
```

**Both paths work!**

### 4. Session Hijacking Prevention

**Attack**: Someone steals success URL with `session_id`

**Mitigation**:
1. Stripe session is single-use (can only be retrieved once in full)
2. Email must match between payment and signup
3. Clerk handles auth session security
4. Session expires after 24 hours

### 5. Idempotency

**Webhook Idempotency**:
- Already handled by `WebhookEvent` table (event.id is primary key)
- Duplicate webhooks are ignored

**Linking Idempotency**:
- `linkPendingSubscription()` checks if already linked
- Returns success if subscription already exists for user
- Updates are idempotent (same result if called multiple times)

---

## Error Handling

### Error States & User Feedback

#### 1. Payment Failed

**Trigger**: Stripe payment fails (card declined, insufficient funds, etc.)

**User Experience**:
```
/subscribe/error?code=payment_failed&reason=card_declined

┌─────────────────────────────────────────┐
│  ❌ Payment Unsuccessful                 │
│                                          │
│  Your payment could not be processed.   │
│  Reason: Your card was declined          │
│                                          │
│  [Try Again]  [Contact Support]         │
└─────────────────────────────────────────┘
```

**Actions**:
- "Try Again" → `/subscribe` with email prefilled
- "Contact Support" → Support email/form

#### 2. Session Expired

**Trigger**: Checkout session expires (24 hours)

**User Experience**:
```
/subscribe/error?code=session_expired

┌─────────────────────────────────────────┐
│  ⏰ Checkout Session Expired             │
│                                          │
│  This checkout link has expired.        │
│  Sessions expire after 24 hours.        │
│                                          │
│  [Start New Checkout]                   │
└─────────────────────────────────────────┘
```

#### 3. Email Mismatch

**Trigger**: User signs up with different email than payment

**User Experience**:
```
/subscribe/error?code=email_mismatch&payment_email=user@example.com&signup_email=different@example.com

┌─────────────────────────────────────────┐
│  ⚠️ Email Mismatch                       │
│                                          │
│  Payment was made with:                 │
│  user@example.com                       │
│                                          │
│  But you signed up with:                │
│  different@example.com                  │
│                                          │
│  [Sign in with correct email]           │
│  [Contact Support]                      │
└─────────────────────────────────────────┘
```

#### 4. Incomplete Payment (Abandoned Checkout)

**Trigger**: User abandons checkout before payment

**User Experience**:
```
/subscribe (shows banner)

┌─────────────────────────────────────────┐
│  ℹ️ You have an incomplete payment       │
│  Started 3 hours ago                    │
│                                          │
│  [Resume Checkout]  [Start Over]       │
└─────────────────────────────────────────┘
```

**Actions**:
- "Resume Checkout" → Resume Stripe session (same URL)
- "Start Over" → Clear pending, create new checkout

#### 5. Already Paid (Returning to /subscribe)

**Trigger**: User completed payment but hasn't signed up yet

**User Experience**:
```
/subscribe (shows banner)

┌─────────────────────────────────────────┐
│  ✅ Payment Complete!                    │
│  Please create your account to activate │
│                                          │
│  [Complete Signup]                      │
└─────────────────────────────────────────┘
```

**Actions**:
- "Complete Signup" → `/subscribe/success?session_id=xxx`

### Loading States

**Subscribe Button**:
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Processing...
    </>
  ) : (
    <>
      <Mail className="mr-2" />
      Subscribe
    </>
  )}
</Button>
```

**Success Page (Verifying Payment)**:
```tsx
{isVerifying && (
  <div className="flex items-center gap-2">
    <Spinner />
    <p>Verifying payment...</p>
  </div>
)}
```

**Dashboard (Activating Subscription)**:
```tsx
{isLinking && (
  <Banner variant="info">
    <Spinner /> Activating subscription...
  </Banner>
)}
```

---

## Background Jobs

### 1. Abandoned Checkout Reminder

**Inngest Function**: `billing/send-checkout-reminder`

**Trigger**: 6 hours after `PendingSubscription` created with `status: awaiting_payment`

**Logic**:
```typescript
export const sendCheckoutReminder = inngest.createFunction(
  { id: "send-checkout-reminder" },
  { event: "billing/checkout-reminder" },
  async ({ event, step }) => {
    const { pendingSubscriptionId } = event.data

    // 1. Fetch pending subscription
    const pending = await step.run("fetch-pending", async () => {
      return prisma.pendingSubscription.findUnique({
        where: { id: pendingSubscriptionId }
      })
    })

    if (!pending || pending.status !== "awaiting_payment") {
      return { skipped: true, reason: "Already completed or expired" }
    }

    // 2. Send email
    await step.run("send-email", async () => {
      await emailProvider.send({
        to: pending.email,
        subject: "Complete Your DearMe Subscription",
        template: "abandoned-checkout",
        data: {
          resumeUrl: `${env.NEXT_PUBLIC_APP_URL}/subscribe/resume/${pending.stripeSessionId}`,
          expiresInHours: 18,
        }
      })
    })

    return { sent: true }
  }
)
```

**Scheduling**: Create event on checkout creation with 6-hour delay

```typescript
// In createAnonymousCheckout()
await inngest.send({
  name: "billing/checkout-reminder",
  data: { pendingSubscriptionId: pending.id },
  ts: Date.now() + (6 * 60 * 60 * 1000), // 6 hours
})
```

### 2. Post-Payment Signup Reminder

**Inngest Function**: `billing/send-signup-reminder`

**Trigger**: 24 hours after `status: payment_complete`

**Logic**:
```typescript
export const sendSignupReminder = inngest.createFunction(
  { id: "send-signup-reminder" },
  { event: "billing/send-signup-reminder" },
  async ({ event, step }) => {
    const { pendingSubscriptionId, immediate } = event.data

    // Wait 24 hours unless immediate
    if (!immediate) {
      await step.sleep("wait-24h", "24h")
    }

    // Check if still pending
    const pending = await step.run("fetch-pending", async () => {
      return prisma.pendingSubscription.findUnique({
        where: { id: pendingSubscriptionId }
      })
    })

    if (!pending || pending.status === "linked") {
      return { skipped: true }
    }

    // Send email with magic signup link
    await step.run("send-email", async () => {
      const magicLink = await clerk.users.createMagicLink({
        email: pending.email,
        redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
      })

      await emailProvider.send({
        to: pending.email,
        subject: "Activate Your DearMe Subscription",
        template: "signup-reminder",
        data: {
          magicLink: magicLink.url,
          daysRemaining: Math.ceil(
            (pending.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          ),
        }
      })
    })

    return { sent: true }
  }
)
```

### 3. Expiry Warning (7 Days Before)

**Inngest Function**: `billing/send-expiry-warning`

**Trigger**: Daily cron checks for subscriptions expiring in 7 days

**Cron**: `/api/cron/send-expiry-warnings` (runs daily at 10am UTC)

### 4. Cleanup Job

**Already specified** in API Routes section above.

**Cron Schedule** in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-deliveries",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-pending-subscriptions",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/send-checkout-reminders",
      "schedule": "0 */1 * * *"
    },
    {
      "path": "/api/cron/send-expiry-warnings",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## UI/UX Specification

### Page 1: /subscribe (Pricing Selection)

**Layout**: Minimal (no header/footer as required)

**Components**:
```
┌─────────────────────────────────────────────────────────────────┐
│                          DearMe Logo                             │
│                                                                  │
│                   Choose Your Plan                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   FREE       │  │  PRO MONTHLY │  │  PRO YEARLY  │         │
│  │              │  │              │  │              │         │
│  │  $0/month    │  │  $9/month    │  │  $90/year    │         │
│  │              │  │              │  │  Save $18!   │  ⭐     │
│  │ • 3 letters  │  │ • Unlimited  │  │ • Unlimited  │         │
│  │ • Email only │  │ • Email+Mail │  │ • Email+Mail │         │
│  │ • 6mo min    │  │ • Any date   │  │ • Any date   │         │
│  │              │  │ • 2 credits  │  │ • 2 credits  │         │
│  │              │  │              │  │              │         │
│  │ [Current]    │  │ [Subscribe]  │  │ [Subscribe]  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  If from letter: "Email for subscription: user@example.com"    │
│  If direct: [Email Input Field]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design System**: Match letter form aesthetic
- Duck yellow accents
- Charcoal borders
- Brutalist shadows
- Monospace fonts for prices
- Clean, minimal

**Responsive**:
- Desktop: 3 columns
- Tablet: 2 columns (Free + Pro Monthly, then Pro Yearly)
- Mobile: Stack vertically

### Page 2: /subscribe/success (Post-Payment)

**Variant A: Not Authenticated**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    🎉 Payment Successful!                        │
│                                                                  │
│              Create your account to access your                 │
│                      Pro subscription                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │         Your subscription is linked to:                │    │
│  │               user@example.com                         │    │
│  │                                                         │    │
│  │  [Clerk SignUp Component - Email Locked]              │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Variant B: Authenticated**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                 ✅ Subscription Activated!                       │
│                                                                  │
│              Your Pro features are now available                │
│                                                                  │
│                  [Go to Dashboard]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Page 3: /subscribe/error

**Dynamic content based on error code** (see Error Handling section)

### Component: PricingCard

**Props**:
```typescript
type PricingCardProps = {
  plan: "free" | "pro_monthly" | "pro_yearly"
  name: string
  price: string
  features: string[]
  highlighted?: boolean // For "Best Value"
  current?: boolean // User's current plan
  onSubscribe?: () => void
}
```

**Styling**: Match letter form aesthetic (brutalist, duck yellow accents)

---

## Testing Strategy

### Unit Tests

**File**: `apps/web/app/subscribe/actions.test.ts`

```typescript
describe("createAnonymousCheckout", () => {
  it("should create checkout session with locked email", async () => {
    const result = await createAnonymousCheckout({
      email: "test@example.com",
      priceId: "price_test",
    })

    expect(result.sessionUrl).toBeDefined()
    expect(result.customerId).toBeDefined()

    // Verify customer created with email
    const customer = await stripe.customers.retrieve(result.customerId)
    expect(customer.email).toBe("test@example.com")
  })

  it("should resume existing checkout if pending", async () => {
    // Create pending subscription
    await createAnonymousCheckout({
      email: "test@example.com",
      priceId: "price_test",
    })

    // Call again with same email
    const result = await createAnonymousCheckout({
      email: "test@example.com",
      priceId: "price_test",
    })

    // Should return same session
    expect(result.sessionId).toBe(existingSessionId)
  })

  it("should throw error if already paid", async () => {
    // Create pending with payment_complete status
    await expect(
      createAnonymousCheckout({
        email: "paid@example.com",
        priceId: "price_test",
      })
    ).rejects.toThrow("ALREADY_PAID")
  })
})

describe("linkPendingSubscription", () => {
  it("should link subscription to user", async () => {
    // Create user
    const user = await createTestUser("test@example.com")

    // Create pending subscription
    await createPendingSubscription({
      email: "test@example.com",
      status: "payment_complete",
    })

    // Link
    const result = await linkPendingSubscription(user.id)

    expect(result.success).toBe(true)
    expect(result.subscriptionId).toBeDefined()

    // Verify subscription created
    const subscription = await prisma.subscription.findUnique({
      where: { id: result.subscriptionId }
    })
    expect(subscription?.userId).toBe(user.id)
  })

  it("should fail if email not verified", async () => {
    const user = await createTestUser("test@example.com", { emailVerified: false })

    const result = await linkPendingSubscription(user.id)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Email not verified")
  })

  it("should be idempotent (safe to call multiple times)", async () => {
    const user = await createTestUser("test@example.com")
    await createPendingSubscription({ email: "test@example.com" })

    const result1 = await linkPendingSubscription(user.id)
    const result2 = await linkPendingSubscription(user.id)

    expect(result1.subscriptionId).toBe(result2.subscriptionId)
  })
})
```

### Integration Tests

**File**: `apps/web/__tests__/integration/subscription-flow.test.ts`

```typescript
describe("Anonymous Checkout Flow", () => {
  it("should complete full flow: checkout → payment → signup → link", async () => {
    // 1. Create checkout
    const checkout = await createAnonymousCheckout({
      email: "test@example.com",
      priceId: "price_test",
    })

    expect(checkout.sessionUrl).toBeDefined()

    // 2. Simulate webhook (payment completed)
    await simulateStripeWebhook({
      type: "checkout.session.completed",
      data: {
        object: {
          id: checkout.sessionId,
          customer: checkout.customerId,
          subscription: "sub_test",
          payment_status: "paid",
        }
      }
    })

    // 3. Verify pending subscription updated
    const pending = await prisma.pendingSubscription.findFirst({
      where: { email: "test@example.com" }
    })
    expect(pending?.status).toBe("payment_complete")

    // 4. Simulate user signup
    const user = await createTestUser("test@example.com")

    // 5. Simulate Clerk webhook
    await simulateClerkWebhook({
      type: "user.created",
      data: { id: user.clerkUserId, email: "test@example.com" }
    })

    // 6. Verify subscription linked
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id }
    })
    expect(subscription).toBeDefined()
    expect(pending?.status).toBe("linked")
  })
})
```

### E2E Tests (Playwright)

**File**: `apps/web/__tests__/e2e/subscribe.spec.ts`

```typescript
import { test, expect } from "@playwright/test"

test("anonymous checkout flow", async ({ page }) => {
  // 1. Go to subscribe page
  await page.goto("/subscribe")

  // 2. Enter email
  await page.fill('input[type="email"]', "test@example.com")

  // 3. Click subscribe on Pro Monthly
  await page.click('button:has-text("Subscribe")')

  // 4. Should redirect to Stripe Checkout
  await expect(page).toHaveURL(/checkout\.stripe\.com/)

  // 5. Email should be locked (readonly)
  const emailInput = page.locator('input[type="email"]')
  await expect(emailInput).toBeDisabled()
  await expect(emailInput).toHaveValue("test@example.com")

  // 6. Fill payment info (test mode)
  await page.fill('[name="cardnumber"]', "4242424242424242")
  await page.fill('[name="exp-date"]', "12/34")
  await page.fill('[name="cvc"]', "123")
  await page.fill('[name="postal"]', "12345")

  // 7. Submit payment
  await page.click('button[type="submit"]')

  // 8. Should redirect to success page
  await expect(page).toHaveURL(/\/subscribe\/success/)

  // 9. Should show signup form
  await expect(page.locator('text=Create your account')).toBeVisible()

  // 10. Email should be prefilled and locked
  const signupEmail = page.locator('.cl-formFieldInput__emailAddress')
  await expect(signupEmail).toHaveValue("test@example.com")
  await expect(signupEmail).toBeDisabled()
})

test("resume incomplete checkout", async ({ page }) => {
  // TODO: Implement resume flow test
})

test("error handling: payment failed", async ({ page }) => {
  // TODO: Implement error state test
})
```

---

## Migration Plan

### Phase 1: Database Setup (Week 1)

**Risk**: Low (additive only)

**Tasks**:
1. Add `PendingSubscription` model to `schema.prisma`
2. Add `PendingSubscriptionStatus` enum
3. Create migration: `pnpm db:migrate`
4. Deploy migration to staging
5. Verify indexes created

**Rollback**: Drop table if issues

### Phase 2: Backend Implementation (Week 2)

**Risk**: Medium (new API surface)

**Tasks**:
1. Implement `createAnonymousCheckout()` Server Action
2. Implement `linkPendingSubscription()` Server Action
3. Enhance Stripe webhook handler
4. Add Inngest functions for emails
5. Add TypeScript types and Zod schemas
6. Write unit tests
7. Deploy to staging with feature flag: `FEATURE_ANONYMOUS_CHECKOUT_ENABLED=false`

**Testing**:
- Run unit tests in CI
- Manual testing in staging with Stripe test mode
- Verify all error paths

**Rollback**: Disable feature flag

### Phase 3: Frontend Implementation (Week 3)

**Risk**: Medium (user-facing)

**Tasks**:
1. Build `/subscribe` page
   - PricingCard component
   - Email capture form
   - Pricing grid layout
2. Build `/subscribe/success` page
   - Clerk SignUp integration
   - Email locking
3. Build `/subscribe/error` page
   - All error states
4. Build `/subscribe/resume/[sessionId]` page
5. Add email capture to letter form
6. Add loading states and error feedback

**Testing**:
- Visual regression tests
- Accessibility audit
- Cross-browser testing
- Mobile responsive testing

**Rollback**: Revert deployment, feature flag off

### Phase 4: Background Jobs (Week 4)

**Risk**: Low (non-critical path)

**Tasks**:
1. Implement cleanup cron job
2. Implement reminder Inngest functions
3. Add cron endpoints with auth
4. Test with manual triggers
5. Deploy cron jobs to Vercel

**Testing**:
- Manual trigger of cron jobs
- Verify emails sent correctly
- Test refund flow in Stripe test mode

**Rollback**: Disable cron jobs in Vercel

### Phase 5: Gradual Rollout (Week 5)

**Risk**: High (production traffic)

**Tasks**:
1. Enable feature flag in production: `FEATURE_ANONYMOUS_CHECKOUT_ENABLED=true`
2. Monitor metrics:
   - Conversion rate
   - Error rates
   - Webhook processing time
   - Subscription linking success rate
3. A/B test: 10% traffic → 50% → 100%
4. Collect user feedback
5. Fix any issues found

**Success Criteria**:
- Conversion rate ≥ baseline
- Error rate < 1%
- Linking success rate > 95%
- Zero payment processing issues

**Rollback**: Set feature flag to false

### Phase 6: Optimization (Week 6+)

**Tasks**:
- Optimize database queries
- Add Redis caching where beneficial
- Improve email templates based on feedback
- Add admin dashboard for support team
- Implement advanced analytics

---

## Monitoring & Observability

### Metrics to Track

**Conversion Funnel**:
```
/subscribe page views
  → Subscribe button clicks (%)
  → Checkout sessions created (%)
  → Payments completed (%)
  → Signups completed (%)
  → Subscriptions linked (%)
```

**Target**:
- Checkout creation rate: > 30%
- Payment completion rate: > 80%
- Signup completion rate: > 90%
- Linking success rate: > 95%

**Payment Health**:
- Payment success rate: > 95%
- Payment failure reasons (card declined, insufficient funds, etc.)
- Average time from payment to signup: < 2 hours median
- Abandoned checkout rate: < 20%
- Expired pending subscriptions: < 5% of total

**Error Rates**:
- Webhook processing failures: < 0.1%
- Subscription linking failures: < 1%
- Email delivery failures: < 0.5%

**Business Metrics**:
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate: < 5% monthly
- Conversion rate (free → pro): track trend

### Audit Events

**All events logged to `audit_events` table**:

```typescript
// Subscription lifecycle
"subscription.checkout_created"
"subscription.payment_completed"
"subscription.pending_created"
"subscription.linked"
"subscription.link_failed"
"subscription.expired"
"subscription.refunded"

// User actions
"subscription.signup_initiated"
"subscription.signup_completed"
"subscription.email_verified"

// Admin actions
"subscription.manual_link"
"subscription.manual_refund"
```

### Alerts

**Critical**:
- Payment success rate < 95% (investigate immediately)
- Webhook processing failures > 5/hour (check Inngest)
- Linking success rate < 90% (race condition issue?)

**Warning**:
- Abandoned checkout rate > 25% (UX issue?)
- Signup completion rate < 85% (signup friction?)
- Expired pending subscriptions > 10% (email reminders not working?)

**Info**:
- New subscription linked (Slack notification)
- Refund processed (Slack notification)
- Daily summary report (email to team)

### Dashboards

**Admin Dashboard** (to be built):
- Real-time conversion funnel
- Pending subscriptions table
- Failed operations log
- Revenue metrics
- Email delivery status

**Metrics Tools**:
- PostHog: User behavior analytics
- Stripe Dashboard: Payment analytics
- Inngest Dashboard: Job execution monitoring
- Upstash Console: Redis cache hit rates

---

## Appendix

### A. Environment Variables

```bash
# New variables for anonymous checkout
FEATURE_ANONYMOUS_CHECKOUT_ENABLED=true
SUBSCRIPTION_PENDING_EXPIRY_DAYS=30
SUBSCRIPTION_CHECKOUT_REMINDER_HOURS=6
SUBSCRIPTION_SIGNUP_REMINDER_HOURS=24

# Existing variables (already configured)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CRON_SECRET=random_secret_here
```

### B. File Structure

```
apps/web/
  app/
    subscribe/
      page.tsx                    # Pricing selection (Server Component)
      layout.tsx                  # Minimal layout (no header/footer)
      actions.ts                  # createAnonymousCheckout, etc.
      success/
        page.tsx                  # Post-payment success
      error/
        page.tsx                  # Error handling
      resume/
        [sessionId]/
          page.tsx                # Resume checkout

  components/
    subscribe/
      pricing-card.tsx            # Individual card (Client)
      pricing-grid.tsx            # Grid layout (Server)
      email-capture-form.tsx      # Email input (Client)
      checkout-button.tsx         # Subscribe button (Client)
      success-signup-form.tsx     # Signup form (Client)

  server/
    lib/
      pending-subscriptions.ts    # Helper functions
    actions/
      subscriptions.ts            # All subscription Server Actions

workers/inngest/functions/
  billing/
    process-stripe-webhook.ts     # Enhanced webhook processor
    send-checkout-reminder.ts     # Abandoned cart email
    send-signup-reminder.ts       # Post-payment email

packages/
  types/
    schemas/
      subscriptions.ts            # Zod schemas
```

### C. Clerk Integration Code Examples

**Success Page with Locked Email**:

```tsx
// app/subscribe/success/page.tsx
import { SignUp } from "@clerk/nextjs"

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string }
}) {
  const session = await stripe.checkout.sessions.retrieve(
    searchParams.session_id
  )

  const customer = await stripe.customers.retrieve(
    session.customer as string
  )

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Create your account to activate your subscription</p>

      <SignUp
        appearance={{
          elements: {
            formFieldInput__emailAddress: {
              disabled: true, // Lock email
            }
          }
        }}
        initialValues={{
          emailAddress: customer.email! // Prefill from Stripe
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
```

**Enhanced Clerk Webhook**:

```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  // ... existing verification code ...

  if (event.type === "user.created") {
    const user = event.data

    // Existing: Create user in database
    await createUser(user)

    // NEW: Check for pending subscription
    const pending = await prisma.pendingSubscription.findFirst({
      where: {
        email: user.email_addresses[0].email_address,
        status: "payment_complete",
      }
    })

    if (pending) {
      // Auto-link subscription
      await linkPendingSubscription(user.id)

      console.log("[Clerk Webhook] Auto-linked subscription", {
        userId: user.id,
        email: user.email_addresses[0].email_address,
      })
    }
  }

  return new Response("OK", { status: 200 })
}
```

### D. Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
Processing error: 4000 0000 0000 0119
```

---

## Summary

This design provides a **complete, production-ready specification** for anonymous checkout with forced post-payment signup. Key highlights:

✅ **Email Locking**: Stripe Customer created first, email cannot be changed
✅ **Dual-Path Linking**: Handles race conditions between webhook and signup
✅ **Error Handling**: Comprehensive coverage of all failure modes
✅ **Security**: Email verification, idempotency, attack prevention
✅ **Observability**: Complete audit trail, metrics, and monitoring
✅ **Testing**: Unit, integration, and E2E test strategies
✅ **Migration**: Phased rollout with rollback plan

**Next Steps**:
1. Review this design document
2. Get stakeholder approval
3. Begin Phase 1: Database migration
4. Implement Server Actions and webhook enhancements
5. Build frontend UI
6. Deploy to staging for testing
7. Gradual production rollout

**Estimated Timeline**: 6 weeks from approval to 100% rollout
