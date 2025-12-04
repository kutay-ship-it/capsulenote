# Capsule Note - Full Application Map

## Overview

Privacy-first platform for writing letters to your future self via email or physical mail.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPSULE NOTE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   MARKETING          AUTH            APP                BACKGROUND          │
│   ┌─────────┐    ┌─────────┐    ┌─────────────────┐    ┌─────────────┐     │
│   │ Landing │    │ Clerk   │    │ Journey/Letters │    │ Inngest     │     │
│   │ Pricing │───▶│ Sign-in │───▶│ Settings/New    │───▶│ Workers     │     │
│   │ About   │    │ Sign-up │    │ Schedule        │    │ Cron Jobs   │     │
│   └─────────┘    └─────────┘    └─────────────────┘    └─────────────┘     │
│        │              │                  │                    │             │
│        └──────────────┴──────────────────┴────────────────────┘             │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         EXTERNAL SERVICES                            │  │
│   │  Stripe │ Clerk │ Resend/Postmark │ Lob │ Neon Postgres │ Upstash   │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. User Journey Flow

### 1.1 Entry Points

```
VISITOR
   │
   ├─[/]──────────────▶ Landing Page (marketing-v3)
   │                         │
   │                         ├─ Hero with value prop
   │                         ├─ Features showcase
   │                         ├─ Testimonials
   │                         └─ CTA → /pricing or /sign-up
   │
   ├─[/pricing]────────▶ Pricing Page
   │                         │
   │                         ├─ Digital Capsule (email only)
   │                         ├─ Paper & Pixels (email + mail)
   │                         └─ CTA → Stripe Checkout
   │
   ├─[/about]──────────▶ About Page
   ├─[/security]───────▶ Security Page
   ├─[/privacy]────────▶ Privacy Policy
   ├─[/terms]──────────▶ Terms of Service
   └─[/contact]────────▶ Contact Page
```

### 1.2 Authentication Flow

```
VISITOR
   │
   ├─[/sign-up]────────▶ Clerk Sign-Up
   │                         │
   │                         ├─ OAuth (Google, Apple)
   │                         ├─ Email + Password
   │                         └─ Passkeys (WebAuthn)
   │                              │
   │                              ▼
   │                    Clerk Webhook → User Created
   │                         │
   │                         ├─ Create DB User record
   │                         ├─ Create Profile (timezone: UTC)
   │                         └─ Redirect → /welcome
   │
   └─[/sign-in]────────▶ Clerk Sign-In
                              │
                              └─ Redirect → /journey
```

### 1.3 Welcome / Onboarding

```
NEW USER
   │
   └─[/welcome]────────▶ Welcome Modal (onboardingCompleted: false)
                              │
                              ├─ Step 1: Welcome message
                              ├─ Step 2: Features tour
                              ├─ Step 3: First letter prompt
                              │
                              └─ completeOnboarding() → profile.onboardingCompleted = true
```

---

## 2. Core App Routes (app-v3)

### 2.1 Journey Page (Dashboard)

```
[/journey]
   │
   ├─ Auth Check (layout.tsx)
   │       │
   │       └─ Not authenticated → redirect /sign-in
   │
   ├─ Data Fetch (parallel)
   │       │
   │       ├─ getNextDeliveryForHero()
   │       └─ getDeliveryTimeline()
   │
   └─ Render
           │
           ├─[Has deliveries]──▶ CountdownHeroV3
           │                         │
           │                         ├─ Days/hours/minutes countdown
           │                         ├─ Next delivery details
           │                         └─ Link to letter
           │
           ├─[No deliveries]───▶ EmptyStateHeroV3
           │                         │
           │                         └─ CTA → Write first letter
           │
           └─ EmotionalJourneyV2 (timeline visualization)
```

### 2.2 Letters List

```
[/letters]
   │
   ├─ Data Fetch (parallel - ALL filters for instant switching)
   │       │
   │       ├─ getLettersWithPreview("all")
   │       ├─ getLettersWithPreview("drafts")
   │       ├─ getLettersWithPreview("scheduled")
   │       ├─ getLettersWithPreview("sent")
   │       └─ getLetterCounts()
   │
   └─ Render
           │
           ├─[No letters]──────▶ EmptyStateHeroV3
           │                         │
           │                         └─ Daily rotating prompt + CTA
           │
           └─[Has letters]─────▶ LettersListV3
                                    │
                                    ├─ Tab filters (client-side instant)
                                    │     ├─ All
                                    │     ├─ Drafts
                                    │     ├─ Scheduled
                                    │     └─ Delivered
                                    │
                                    └─ Letter cards (click → /letters/[id])
```

### 2.3 Letter Detail

```
[/letters/[id]]
   │
   ├─ Data Fetch
   │       │
   │       └─ getLetter(id) → Decrypt content
   │
   └─ Render States
           │
           ├─[Draft]───────────▶ Edit available
           │                         │
           │                         ├─ Edit button → /letters/[id]/edit
           │                         └─ Schedule button → wizard
           │
           ├─[Scheduled]───────▶ Edit conditional
           │                         │
           │                         ├─[Email only]──▶ Edit available until lock
           │                         ├─[Mail sealed]─▶ Edit BLOCKED
           │                         └─ Cancel/Reschedule available
           │
           └─[Sent]────────────▶ View only
                                    │
                                    ├─ Delivered timestamp
                                    └─ Delivery timeline (tracking for mail)
```

### 2.4 New Letter (Editor)

```
[/letters/new]
   │
   ├─ Data Fetch
   │       │
   │       └─ getDeliveryEligibility()
   │               │
   │               ├─ canScheduleEmail
   │               ├─ canSchedulePhysical
   │               ├─ emailCredits
   │               ├─ physicalCredits
   │               └─ plan info
   │
   └─ LetterEditorWrapper
           │
           ├─ TitleField (auto-save draft)
           ├─ TipTap Rich Editor
           │       │
           │       ├─ Bold, italic, underline
           │       ├─ Headings, lists
           │       ├─ Quotes, dividers
           │       └─ Keyboard shortcuts
           │
           └─ Action Bar
                   │
                   ├─ Save Draft → createLetter()
                   └─ Continue → Schedule Wizard
```

### 2.5 Schedule Wizard

```
[/letters/[id]/schedule] or Inline Wizard
   │
   ├─ Step 1: Delivery Type
   │       │
   │       ├─ Email only
   │       ├─ Physical mail only
   │       └─ Both (combo discount)
   │
   ├─ Step 2: Date Selection
   │       │
   │       ├─ Calendar picker
   │       ├─ Time selection
   │       └─ Timezone (from profile)
   │
   ├─ Step 3: Recipient (email)
   │       │
   │       ├─ Myself (user's email)
   │       └─ Someone else (name + email)
   │
   ├─ Step 4: Address (mail)
   │       │
   │       ├─ Select existing address
   │       ├─ Add new address
   │       └─ Lob verification
   │
   ├─ Step 5: Print Options (mail)
   │       │
   │       ├─ Color (+1 credit)
   │       ├─ Double-sided
   │       └─ Preview template
   │
   └─ Step 6: Summary + Confirm
           │
           ├─ ScheduleSummaryV3
           │       │
           │       ├─ Delivery details
           │       ├─ Credit usage preview
           │       └─ Lock date warning
           │
           └─ SealConfirmationV3 (dialog)
                   │
                   ├─ Physical mail warning (content sealed)
                   └─ Confirm → scheduleDelivery()
```

### 2.6 Settings

```
[/settings]
   │
   ├─ Data Fetch (parallel - ALL tabs for instant switching)
   │       │
   │       ├─ getEntitlements()
   │       ├─ subscription
   │       ├─ payments
   │       ├─ addresses
   │       ├─ referralCode
   │       └─ referralStats
   │
   └─ Tabs
           │
           ├─ Account
           │       │
           │       ├─ Email (readonly)
           │       ├─ Display Name (editable)
           │       ├─ Timezone (picker)
           │       └─ Status + Plan badges
           │
           ├─ Billing
           │       │
           │       ├─ Trial Section (Digital Capsule → try physical)
           │       ├─ Subscription status
           │       ├─ Usage (email + mail credits)
           │       ├─ Invoices
           │       └─ Add-ons purchase
           │
           ├─ Addresses
           │       │
           │       ├─ List addresses
           │       ├─ Add new (with Lob verification)
           │       ├─ Edit existing
           │       └─ Delete (if not in use)
           │
           ├─ Privacy
           │       │
           │       ├─ Export Data (GDPR Article 15)
           │       ├─ Legal links
           │       └─ Danger Zone (delete account)
           │
           └─ Referrals
                   │
                   ├─ Referral code + link
                   ├─ Stats (clicks, signups, conversions)
                   └─ Referral history
```

---

## 3. Server Actions

### 3.1 Letters Actions

```
apps/web/server/actions/letters.ts
   │
   ├─ createLetter(data)
   │       │
   │       ├─ Validate input
   │       ├─ Encrypt content (AES-256-GCM)
   │       │       ├─ bodyCiphertext
   │       │       ├─ bodyNonce
   │       │       └─ keyVersion
   │       └─ Insert DB record
   │
   ├─ updateLetter(id, data)
   │       │
   │       ├─ Verify ownership
   │       ├─ Check sealed status
   │       │       └─[Sealed mail exists + content edit]──▶ BLOCKED
   │       ├─ Re-encrypt if content changed
   │       └─ Update DB record
   │
   ├─ getLetter(id)
   │       │
   │       ├─ Verify ownership
   │       ├─ Decrypt content
   │       └─ Return with deliveries
   │
   ├─ getLetters(filter)
   │       │
   │       ├─ Filter by status
   │       └─ Return WITHOUT decryption (list view)
   │
   └─ deleteLetter(id)
           │
           ├─ Verify ownership
           ├─ Check no active deliveries
           └─ Soft delete (deletedAt timestamp)
```

### 3.2 Deliveries Actions

```
apps/web/server/actions/deliveries.ts
   │
   ├─ scheduleDelivery(data)
   │       │
   │       ├─ Transaction:
   │       │       ├─ Verify letter ownership
   │       │       ├─ Check eligibility
   │       │       ├─ Deduct credits (atomic)
   │       │       │
   │       │       ├─[Email]
   │       │       │       ├─ Create delivery record
   │       │       │       └─ Trigger Inngest event
   │       │       │
   │       │       └─[Mail]
   │       │               ├─ Calculate send date
   │       │               ├─ Seal content (encrypt snapshot)
   │       │               ├─ Create delivery + mailDelivery
   │       │               │
   │       │               ├─[≤180 days]──▶ IMMEDIATE MODE
   │       │               │       ├─ Call Lob API NOW
   │       │               │       ├─ Store lobJobId
   │       │               │       └─ Trigger Inngest (status update only)
   │       │               │
   │       │               └─[>180 days]──▶ DEFERRED MODE
   │       │                       └─ Trigger Inngest (will call Lob later)
   │       │
   │       └─ Rollback on failure
   │
   ├─ cancelDelivery(id)
   │       │
   │       ├─ Verify ownership
   │       ├─ Check cancellable (status = scheduled)
   │       ├─ Refund credit
   │       │
   │       ├─[Email]──▶ Cancel Inngest event
   │       │
   │       └─[Mail]──▶ Cancel Inngest + Lob API (if lobJobId)
   │
   └─ retryDelivery(id)
           │
           ├─ Verify ownership
           ├─ Check status = failed
           └─ Re-trigger Inngest event
```

### 3.3 Billing Actions

```
apps/web/server/actions/billing.ts
   │
   ├─ createCheckoutSession({ priceId })
   │       │
   │       ├─ Validate price ID
   │       ├─ Check no existing subscription
   │       ├─ Get/create Stripe customer
   │       └─ Create Stripe Checkout session
   │
   ├─ createBillingPortalSession()
   │       │
   │       ├─ Require existing customer
   │       └─ Create Stripe Billing Portal session
   │
   └─ checkSubscriptionStatus()
           │
           └─ Poll for subscription after checkout
```

### 3.4 Address Actions

```
apps/web/server/actions/addresses.ts
   │
   ├─ listShippingAddresses()
   ├─ getShippingAddress(id)
   ├─ createShippingAddress(data)
   ├─ updateShippingAddress(id, data)
   ├─ deleteShippingAddress(id)
   │       └─ Check not in use by pending deliveries
   │
   ├─ verifyShippingAddress(data)
   │       └─ Call Lob verification API
   │
   └─ createVerifiedShippingAddress(data, verification)
           └─ Create with verification metadata
```

### 3.5 GDPR Actions

```
apps/web/server/actions/gdpr.ts
   │
   ├─ exportUserData()
   │       │
   │       ├─ Collect all user data
   │       ├─ Decrypt all letters
   │       ├─ Generate JSON export
   │       └─ Return as data URL
   │
   └─ deleteUserAccount()
           │
           ├─ Transaction:
           │       ├─ Cancel Stripe subscription
           │       ├─ Anonymize payment records (sentinel user)
           │       └─ Delete user (cascades to all data)
           │
           └─ Delete Clerk user (signs out)
```

---

## 4. Background Jobs (Inngest)

### 4.1 Email Delivery Worker

```
workers/inngest/functions/deliver-email.ts
   │
   └─ Event: delivery.scheduled
           │
           ├─ Step: Fetch delivery record
           │
           ├─ Step: Sleep until deliverAt
           │
           ├─ Step: Decrypt letter content
           │       └─ Uses letter.bodyCiphertext (live content)
           │
           ├─ Step: Render email template
           │
           ├─ Step: Send via provider
           │       │
           │       ├─ Idempotency key
           │       ├─ Resend (primary)
           │       └─ Postmark (fallback)
           │
           └─ Step: Update status → sent/failed
```

### 4.2 Mail Delivery Worker

```
workers/inngest/functions/deliver-mail.ts
   │
   └─ Event: mail.delivery.scheduled
           │
           ├─ Step: Fetch delivery record
           │
           ├─ Step: Check mode
           │       │
           │       ├─[Immediate + lobJobId]
           │       │       └─ Skip Lob call, update status only
           │       │
           │       └─[Deferred]
           │               │
           │               ├─ Sleep until send date
           │               │
           │               ├─ Decrypt SEALED content
           │               │       └─ Uses mailDelivery.sealedContentCiphertext
           │               │
           │               ├─ Render letter HTML
           │               │
           │               └─ Call Lob API
           │
           └─ Step: Update status → sent/failed
```

### 4.3 Backstop Reconciler (Cron)

```
apps/web/app/api/cron/reconcile-deliveries/route.ts
   │
   └─ Every 5 minutes
           │
           ├─ Find stuck deliveries
           │       │
           │       └─ status = scheduled
           │       └─ deliverAt < NOW() - 5 minutes
           │
           ├─ Lock records (FOR UPDATE SKIP LOCKED)
           │
           ├─ Re-trigger Inngest events (up to 100)
           │
           └─ Alert if >10 stuck (investigate)
```

---

## 5. Webhooks

### 5.1 Stripe Webhook

```
apps/web/app/api/webhooks/stripe/route.ts
   │
   ├─ checkout.session.completed
   │       │
   │       ├─ Create subscription record
   │       ├─ Create payment record
   │       └─ Send confirmation email
   │
   ├─ customer.subscription.updated
   │       └─ Update subscription status
   │
   ├─ customer.subscription.deleted
   │       └─ Mark subscription canceled
   │
   └─ invoice.payment_succeeded
           │
           ├─ Reset usage credits
           └─ Create payment record
```

### 5.2 Clerk Webhook

```
apps/web/app/api/webhooks/clerk/route.ts
   │
   ├─ user.created
   │       │
   │       ├─ Create DB user record
   │       └─ Create profile
   │
   ├─ user.updated
   │       └─ Sync email changes
   │
   └─ user.deleted
           └─ Cascade delete user data
```

### 5.3 Resend Webhook

```
apps/web/app/api/webhooks/resend/route.ts
   │
   ├─ email.delivered
   │       └─ Update delivery status
   │
   ├─ email.bounced
   │       └─ Mark failed + log
   │
   └─ email.complained
           └─ Mark failed + alert
```

### 5.4 Lob Webhook

```
apps/web/app/api/webhooks/lob/route.ts
   │
   ├─ letter.in_transit
   │       └─ Update tracking status
   │
   ├─ letter.processed_for_delivery
   │       └─ Update tracking status
   │
   └─ letter.delivered
           └─ Mark delivery sent
```

---

## 6. Security Architecture

### 6.1 Encryption

```
Letter Content Encryption (AES-256-GCM)
   │
   ├─ Master Key: CRYPTO_MASTER_KEY (env)
   │
   ├─ Per-record encryption:
   │       ├─ bodyCiphertext (encrypted JSON)
   │       ├─ bodyNonce (96-bit unique)
   │       └─ keyVersion (rotation support)
   │
   └─ Decrypt on:
           ├─ Single letter view
           ├─ Email delivery
           ├─ Mail delivery (sealed content)
           └─ GDPR export
```

### 6.2 Content Sealing (Physical Mail)

```
Sealing Process (at schedule time)
   │
   ├─ Snapshot current letter content
   ├─ Encrypt with same algorithm
   │       ├─ sealedContentCiphertext
   │       ├─ sealedContentNonce
   │       └─ sealedTitle
   │
   ├─ Set sealedAt timestamp
   │
   └─ Block future content edits
```

### 6.3 Idempotency

```
Idempotency Keys
   │
   └─ Format: delivery-{uuid}-attempt-{number}
           │
           ├─ Resend headers
           └─ Prevents duplicate sends on retry
```

---

## 7. Data Models

### 7.1 User & Profile

```
User
├─ id (UUID)
├─ clerkUserId
├─ email
├─ physicalMailTrialUsed
└─ profile (1:1)
        ├─ displayName
        ├─ timezone
        ├─ stripeCustomerId
        ├─ onboardingCompleted
        └─ marketingOptIn
```

### 7.2 Letter

```
Letter
├─ id (UUID)
├─ userId (FK)
├─ title
├─ bodyCiphertext (encrypted)
├─ bodyNonce
├─ keyVersion
├─ bodyFormat (rich | md | html)
├─ visibility (private | shared)
├─ tags[]
└─ deliveries (1:N)
```

### 7.3 Delivery

```
Delivery
├─ id (UUID)
├─ userId (FK)
├─ letterId (FK)
├─ channel (email | mail)
├─ status (scheduled | processing | sent | failed | canceled)
├─ deliverAt (DateTime)
├─ timezoneAtCreation
├─ attemptCount
├─ lastError
├─ inngestRunId
├─ emailDelivery (1:1, optional)
│       ├─ toEmail
│       ├─ toName
│       └─ recipientType (myself | someone_else)
│
└─ mailDelivery (1:1, optional)
        ├─ shippingAddressId (FK)
        ├─ lobScheduleMode (immediate | deferred)
        ├─ lobJobId
        ├─ lobSendDate
        ├─ sealedAt
        ├─ sealedTitle
        ├─ sealedContentCiphertext
        ├─ sealedContentNonce
        ├─ printColor
        ├─ printDoubleSided
        └─ trackingStatus
```

### 7.4 Subscription & Payment

```
Subscription
├─ id (UUID)
├─ userId (FK)
├─ stripeSubscriptionId
├─ status (active | trialing | past_due | canceled | unpaid)
├─ plan (DIGITAL_CAPSULE | PAPER_PIXELS)
├─ currentPeriodEnd
└─ cancelAtPeriodEnd

Payment
├─ id (UUID)
├─ userId (FK)
├─ stripePaymentId
├─ type (subscription | addon | trial)
├─ amountCents
├─ currency
├─ status
└─ metadata
```

---

## 8. Feature Flags

```
Feature Flags (Unleash / env)
   │
   ├─ use-postmark-email ──▶ Switch to Postmark provider
   ├─ enable-physical-mail ──▶ Enable Lob integration
   ├─ enable-arrive-by-mode ──▶ Arrive-by delivery mode
   ├─ enable-letter-templates ──▶ Template system
   ├─ use-clicksend-mail ──▶ ClickSend instead of Lob
   └─ enable-client-encryption ──▶ Future E2EE
```

---

## 9. Credit System

```
Credit Flow
   │
   ├─ Subscription grants:
   │       ├─ Digital Capsule: 12 email / year
   │       └─ Paper & Pixels: 12 email + 4 mail / year
   │
   ├─ Schedule: Deduct atomically (in transaction)
   │
   ├─ Cancel: Refund credit
   │
   ├─ Failure: NO auto-refund (manual review)
   │
   └─ Add-ons: Purchase additional credits via Stripe
```

---

## 10. URL Structure

```
MARKETING (public)
/                    Landing page
/pricing             Pricing comparison
/about               About us
/security            Security info
/privacy             Privacy policy
/terms               Terms of service
/contact             Contact form

AUTH (Clerk)
/sign-in             Sign in
/sign-up             Sign up
/sso-callback        OAuth callback
/reset-password      Password reset
/welcome             Post-signup onboarding

APP (authenticated)
/journey             Dashboard with countdown
/letters             Letters list (tabs: all/drafts/scheduled/delivered)
/letters/new         Write new letter
/letters/[id]        Letter detail view
/letters/[id]/schedule  Schedule wizard
/settings            Settings (tabs: account/billing/addresses/privacy/referrals)
/credits/success     Credit purchase success
/unlock/[id]         View delivered letter

CHECKOUT
/subscribe           Plan selection
/subscribe/success   Subscription success
/subscribe/error     Subscription error
/checkout/success    One-time purchase success
/checkout/cancel     Checkout canceled

API
/api/webhooks/stripe Stripe webhook
/api/webhooks/clerk  Clerk webhook
/api/webhooks/resend Resend webhook
/api/webhooks/lob    Lob webhook
/api/cron/*          Cron endpoints

VIEWER
/view/[token]        Public letter view (shared)
```

---

## 11. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| Language | TypeScript 5.3+ |
| Database | Neon Postgres + Prisma ORM |
| Auth | Clerk (OAuth, passkeys, email) |
| Jobs | Inngest (durable workflows) |
| Email | Resend (primary) + Postmark (fallback) |
| Mail | Lob API |
| Payments | Stripe Billing |
| Cache | Upstash Redis |
| Feature Flags | Unleash |
| i18n | next-intl (en, tr) |

---

## 12. Key Constants

```typescript
// Physical mail
LOB_MAX_SCHEDULE_DAYS = 180     // Lob API max scheduling window
PHYSICAL_MAIL_BUFFER_DAYS = 3   // Safety buffer for delivery
PHYSICAL_MAIL_MIN_LEAD_DAYS = 7 // Minimum days before delivery

// Lock windows
LOCK_WINDOW_HOURS = 72          // Content locks 72h before delivery

// Credits
DIGITAL_CAPSULE_EMAIL = 12      // Emails per year
PAPER_PIXELS_EMAIL = 12         // Emails per year
PAPER_PIXELS_MAIL = 4           // Mail credits per year

// Reconciler
BACKSTOP_INTERVAL_MINUTES = 5   // Run every 5 minutes
BACKSTOP_MAX_BATCH = 100        // Max deliveries per run
BACKSTOP_ALERT_THRESHOLD = 10   // Alert if >10 stuck
```
