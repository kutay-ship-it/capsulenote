# DearMe Stripe Integration - Enterprise Architecture Design

**Version:** 1.0
**Date:** 2025-11-17
**Status:** Architecture Complete - Ready for Implementation
**Author:** Claude Code (System Architect)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Database Schema Design](#3-database-schema-design)
4. [Subscription Enforcement](#4-subscription-enforcement)
5. [Webhook Handler Architecture](#5-webhook-handler-architecture)
6. [Pricing Page Design](#6-pricing-page-design)
7. [Checkout Flow](#7-checkout-flow)
8. [Customer Portal Integration](#8-customer-portal-integration)
9. [Usage Tracking System](#9-usage-tracking-system)
10. [Security Architecture](#10-security-architecture)
11. [Error Handling & Monitoring](#11-error-handling--monitoring)
12. [Testing Strategy](#12-testing-strategy)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Code Organization](#14-code-organization)
15. [Admin Billing Dashboard](#15-admin-billing-dashboard)
16. [Critical Data Flows](#16-critical-data-flows)
17. [Performance & Scalability](#17-performance--scalability)
18. [Risk Assessment](#18-risk-assessment)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the comprehensive architecture for integrating Stripe payments into the DearMe application. The design supports subscription billing, usage-based limits, physical mail add-ons, and self-service subscription management.

### 1.2 Critical Gaps Addressed

Based on the analysis document (`STRIPE_PAYMENT_ANALYSIS.md`), this design addresses:

- **P0 Blockers**: No revenue generation, no subscription enforcement, no customer portal
- **P1 Requirements**: Incomplete webhook coverage, missing usage tracking, no plan management
- **P2 Improvements**: Tax compliance, analytics, admin dashboard

### 1.3 Design Principles

1. **Enterprise Quality**: Production-ready architecture, not MVP
2. **Security First**: PCI compliance, webhook verification, GDPR adherence
3. **Resilient**: Failure handling, retry logic, idempotency
4. **Observable**: Comprehensive logging, monitoring, alerting
5. **Maintainable**: Clear separation of concerns, well-documented
6. **Scalable**: Supports 10,000+ users from day one

### 1.4 Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions, React 19)
- **Payment Provider**: Stripe (API version 2024-11-20)
- **Database**: Neon Postgres + Prisma ORM
- **Cache**: Upstash Redis (entitlements, metrics)
- **Job Processor**: Inngest (webhook processing, email notifications)
- **Auth**: Clerk (with admin role support)
- **Email**: Resend (via existing provider abstraction)

### 1.5 Key Metrics

- **Target Capacity**: 10,000+ active subscriptions
- **Performance**: <50ms p95 entitlement checks, <500ms p95 checkout creation
- **Reliability**: 99.95% webhook processing success
- **Security**: PCI DSS Level 1 compliant (via Stripe)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │ Pricing Page │  │ Checkout Flow │  │ Settings/Billing   │   │
│  │ (Marketing)  │  │ (Stripe UI)   │  │ (Customer Portal)  │   │
│  └──────┬───────┘  └───────┬───────┘  └─────────┬──────────┘   │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
┌─────────┼──────────────────┼──────────────────────┼──────────────┐
│         │        APPLICATION TIER (Next.js)       │              │
│  ┌──────▼─────┐  ┌─────────▼──────┐  ┌───────────▼─────────┐   │
│  │   Server   │  │  Middleware    │  │    API Routes       │   │
│  │   Actions  │  │  (Auth/Rate    │  │  (Webhooks, Cron)   │   │
│  │            │  │   Limiting)    │  │                     │   │
│  └──────┬─────┘  └────────────────┘  └─────────┬───────────┘   │
│         │                                       │               │
│  ┌──────▼────────────────────────────────────┬─▼─────────────┐ │
│  │         Business Logic Layer              │               │ │
│  │  ┌──────────────┐  ┌──────────────────┐  │  Stripe API   │ │
│  │  │ Entitlements │  │ Usage Tracking   │  │  Provider     │ │
│  │  │ Service      │  │ Service          │  │               │ │
│  │  └──────┬───────┘  └────────┬─────────┘  └───────────────┘ │
│  └─────────┼────────────────────┼────────────────────────────┘ │
└────────────┼────────────────────┼───────────────────────────────┘
             │                    │
┌────────────┼────────────────────┼───────────────────────────────┐
│            │      DATA TIER     │                               │
│  ┌─────────▼────────┐  ┌───────▼──────────┐  ┌──────────────┐ │
│  │  Redis Cache     │  │  PostgreSQL      │  │   Inngest    │ │
│  │  (5min TTL)      │  │  (Source of      │  │   Workers    │ │
│  │                  │  │   Truth)         │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────────────┘
             │                    │                    │
┌────────────┼────────────────────┼────────────────────┼──────────┐
│            │   EXTERNAL SERVICES│                    │          │
│  ┌─────────▼────────┐  ┌───────▼──────────┐  ┌──────▼───────┐ │
│  │  Stripe API      │  │  Clerk Auth      │  │  Resend      │ │
│  │  (Payments,      │  │  (User Mgmt)     │  │  (Email)     │ │
│  │   Billing)       │  │                  │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

#### Client Tier
- **Pricing Page**: Display plans, feature comparison, CTA buttons
- **Checkout Flow**: Redirect to Stripe, handle success/cancel
- **Settings/Billing**: Display subscription status, link to portal

#### Application Tier
- **Server Actions**: User-facing operations (checkout, portal, cancel)
- **Middleware**: Authentication, rate limiting, admin authorization
- **API Routes**: Webhook endpoints, cron jobs

#### Business Logic Layer
- **Entitlements Service**: Plan checking, feature access, caching
- **Usage Tracking Service**: Quota management, credit deduction
- **Stripe Provider**: Abstracted payment operations

#### Data Tier
- **Redis Cache**: Fast entitlements lookups, metrics aggregation
- **PostgreSQL**: Source of truth for subscriptions, payments, usage
- **Inngest Workers**: Async webhook processing, email notifications

#### External Services
- **Stripe**: Payment processing, subscription management, billing portal
- **Clerk**: User authentication, admin role management
- **Resend**: Transactional email delivery

### 2.3 Data Flow Patterns

#### Read Path (Entitlements Check)
```
User Request → Server Action → Entitlements Service
    → Redis (cache hit) → Return entitlements
    → Redis (cache miss) → Database → Cache result → Return entitlements
```

#### Write Path (Subscription Update)
```
Stripe Event → Webhook Endpoint → Verify Signature → Queue to Inngest
    → Inngest Worker → Update Database → Invalidate Redis Cache
    → Send Notification Email → Complete
```

### 2.4 Scalability Strategy

- **Horizontal Scaling**: Vercel auto-scales Next.js instances
- **Database Scaling**: Neon read replicas for analytics
- **Cache Scaling**: Redis for hot path (entitlements)
- **Async Processing**: Inngest for webhooks, emails, background jobs
- **CDN**: Vercel Edge for static assets

---

## 3. Database Schema Design

### 3.1 Schema Updates Required

Add to existing `packages/prisma/schema.prisma`:

```prisma
// ============================================================================
// SUBSCRIPTION ENHANCEMENTS
// ============================================================================

enum SubscriptionPlan {
  free        // NEW: Add free tier
  pro
  enterprise  // FUTURE: For growth

  @@map("subscription_plan")
}

// ============================================================================
// USAGE TRACKING (NEW)
// ============================================================================

model SubscriptionUsage {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  period         DateTime @map("period") @db.Timestamptz(3) // Billing period start
  lettersCreated Int      @default(0) @map("letters_created")
  emailsSent     Int      @default(0) @map("emails_sent")
  mailsSent      Int      @default(0) @map("mails_sent")
  mailCredits    Int      @default(0) @map("mail_credits") // Physical mail credits
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, period], map: "subscription_usage_user_period_unique")
  @@index([userId])
  @@index([period])
  @@map("subscription_usage")
}

// ============================================================================
// WEBHOOK EVENT TRACKING (NEW)
// ============================================================================

model WebhookEvent {
  id          String   @id // Use Stripe event.id for natural idempotency
  type        String   // event.type
  processedAt DateTime @default(now()) @map("processed_at") @db.Timestamptz(3)
  data        Json     @default("{}") // Full event payload for debugging

  @@index([type])
  @@index([processedAt])
  @@map("webhook_events")
}

// ============================================================================
// PRICING PLANS (NEW)
// ============================================================================

model PricingPlan {
  id              String           @id @db.Uuid @default(uuid())
  stripeProductId String           @unique @map("stripe_product_id")
  stripePriceId   String           @unique @map("stripe_price_id")
  name            String           // "Pro Monthly"
  plan            SubscriptionPlan
  interval        String           // "month" | "year"
  amountCents     Int              @map("amount_cents")
  currency        String           @default("usd") @db.Char(3)
  features        Json             @default("{}") // Feature matrix
  isActive        Boolean          @default(true) @map("is_active")
  sortOrder       Int              @default(0) @map("sort_order")
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@index([plan])
  @@index([isActive])
  @@map("pricing_plans")
}

// ============================================================================
// FAILED WEBHOOKS (NEW) - Dead Letter Queue
// ============================================================================

model FailedWebhook {
  id         String   @id @default(uuid()) @db.Uuid
  eventId    String   @map("event_id")
  eventType  String   @map("event_type")
  payload    Json
  error      String   @db.Text
  retriedAt  DateTime @default(now()) @map("retried_at") @db.Timestamptz(3)
  resolvedAt DateTime? @map("resolved_at") @db.Timestamptz(3)

  @@index([eventType])
  @@index([retriedAt])
  @@map("failed_webhooks")
}

// ============================================================================
// RELATIONSHIPS (UPDATE EXISTING MODELS)
// ============================================================================

model User {
  // ... existing fields ...
  subscriptionUsage SubscriptionUsage[]
}
```

### 3.2 Migration Strategy

```sql
-- Migration: add_subscription_enhancements

-- 1. Add free tier to SubscriptionPlan enum
ALTER TYPE "subscription_plan" ADD VALUE 'free';
ALTER TYPE "subscription_plan" ADD VALUE 'enterprise';

-- 2. Create subscription_usage table
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period TIMESTAMPTZ NOT NULL,
  letters_created INT NOT NULL DEFAULT 0,
  emails_sent INT NOT NULL DEFAULT 0,
  mails_sent INT NOT NULL DEFAULT 0,
  mail_credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, period)
);

CREATE INDEX idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period);

-- 3. Create webhook_events table (for idempotency)
CREATE TABLE webhook_events (
  id VARCHAR(255) PRIMARY KEY, -- Stripe event ID
  type VARCHAR(255) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_webhook_events_type ON webhook_events(type);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at);

-- 4. Create pricing_plans table
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  plan subscription_plan NOT NULL,
  interval VARCHAR(20) NOT NULL,
  amount_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'usd',
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_plans_plan ON pricing_plans(plan);
CREATE INDEX idx_pricing_plans_is_active ON pricing_plans(is_active);

-- 5. Create failed_webhooks table
CREATE TABLE failed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  error TEXT NOT NULL,
  retried_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_failed_webhooks_event_type ON failed_webhooks(event_type);
CREATE INDEX idx_failed_webhooks_retried_at ON failed_webhooks(retried_at);

-- 6. Seed pricing plans
INSERT INTO pricing_plans (stripe_product_id, stripe_price_id, name, plan, interval, amount_cents, sort_order, features)
VALUES
  ('prod_pro', 'price_pro_monthly', 'Pro Monthly', 'pro', 'month', 900, 1,
   '{"maxLettersPerMonth": "unlimited", "emailDelivery": true, "physicalMail": true, "mailCreditsPerMonth": 2}'::jsonb),
  ('prod_pro', 'price_pro_annual', 'Pro Annual', 'pro', 'year', 9000, 2,
   '{"maxLettersPerMonth": "unlimited", "emailDelivery": true, "physicalMail": true, "mailCreditsPerMonth": 2}'::jsonb);
```

### 3.3 Index Strategy

Critical indexes for performance:

```sql
-- Hot path: entitlements check
CREATE INDEX CONCURRENTLY idx_subscriptions_user_status
  ON subscriptions(user_id, status)
  WHERE status IN ('active', 'trialing');

-- Usage tracking
CREATE INDEX CONCURRENTLY idx_subscription_usage_user_period
  ON subscription_usage(user_id, period);

-- Admin dashboard queries
CREATE INDEX CONCURRENTLY idx_subscriptions_created_status
  ON subscriptions(created_at DESC, status);

CREATE INDEX CONCURRENTLY idx_payments_user_created
  ON payments(user_id, created_at DESC);

-- Webhook processing
CREATE INDEX CONCURRENTLY idx_webhook_events_type_processed
  ON webhook_events(type, processed_at);
```

### 3.4 Data Retention Policies

```typescript
// Automated cleanup jobs

// 1. Archive old webhook events (retain 30 days)
DELETE FROM webhook_events
WHERE processed_at < NOW() - INTERVAL '30 days';

// 2. Archive old audit events (retain 2 years)
DELETE FROM audit_events
WHERE created_at < NOW() - INTERVAL '2 years';

// 3. Anonymize payment records (7 years for tax compliance)
UPDATE payments
SET metadata = jsonb_set(metadata, '{anonymized}', 'true')
WHERE created_at < NOW() - INTERVAL '7 years'
  AND metadata->>'anonymized' IS NULL;
```

---

## 4. Subscription Enforcement

### 4.1 Entitlements Service Architecture

Core service for all plan-based feature access control.

**File**: `apps/web/server/lib/entitlements.ts`

```typescript
import { prisma } from './db'
import { redis } from './redis'

/**
 * Entitlements interface - defines what users can do
 */
export interface Entitlements {
  userId: string
  plan: 'free' | 'pro' | 'enterprise'
  status: SubscriptionStatus | 'none'
  features: {
    canCreateLetters: boolean
    canScheduleDeliveries: boolean
    canSchedulePhysicalMail: boolean
    maxLettersPerMonth: number | 'unlimited'
    emailDeliveriesIncluded: number | 'unlimited'
    mailCreditsPerMonth: number
  }
  usage: {
    lettersThisMonth: number
    emailsThisMonth: number
    mailCreditsRemaining: number
  }
  trialInfo?: {
    isInTrial: boolean
    trialEndsAt: Date
    daysRemaining: number
  }
  limits: {
    lettersReached: boolean
    emailsReached: boolean
    mailCreditsExhausted: boolean
  }
}

/**
 * Get user entitlements with Redis caching
 *
 * @param userId - User ID to check entitlements for
 * @returns Entitlements object with plan, features, usage, limits
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const cacheKey = `entitlements:${userId}`

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Cache miss - fetch from database
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  const entitlements = subscription
    ? await buildProEntitlements(userId, subscription)
    : await buildFreeEntitlements(userId)

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(entitlements))

  return entitlements
}

/**
 * Build entitlements for Pro plan
 */
async function buildProEntitlements(
  userId: string,
  subscription: Subscription
): Promise<Entitlements> {
  const usage = await getCurrentUsage(userId)
  const period = subscription.currentPeriodEnd

  return {
    userId,
    plan: subscription.plan,
    status: subscription.status,
    features: {
      canCreateLetters: true,
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: true,
      maxLettersPerMonth: 'unlimited',
      emailDeliveriesIncluded: 'unlimited',
      mailCreditsPerMonth: 2
    },
    usage: {
      lettersThisMonth: usage.lettersCreated,
      emailsThisMonth: usage.emailsSent,
      mailCreditsRemaining: usage.mailCredits
    },
    trialInfo: subscription.status === 'trialing' ? {
      isInTrial: true,
      trialEndsAt: subscription.currentPeriodEnd,
      daysRemaining: Math.ceil(
        (subscription.currentPeriodEnd.getTime() - Date.now()) / 86400000
      )
    } : undefined,
    limits: {
      lettersReached: false,
      emailsReached: false,
      mailCreditsExhausted: usage.mailCredits === 0
    }
  }
}

/**
 * Build entitlements for Free plan
 */
async function buildFreeEntitlements(userId: string): Promise<Entitlements> {
  const usage = await getCurrentUsageForFreeTier(userId)

  return {
    userId,
    plan: 'free',
    status: 'none',
    features: {
      canCreateLetters: usage.lettersThisMonth < 5,
      canScheduleDeliveries: false, // Free tier cannot schedule
      canSchedulePhysicalMail: false,
      maxLettersPerMonth: 5,
      emailDeliveriesIncluded: 0,
      mailCreditsPerMonth: 0
    },
    usage,
    limits: {
      lettersReached: usage.lettersThisMonth >= 5,
      emailsReached: false,
      mailCreditsExhausted: true
    }
  }
}

/**
 * Invalidate entitlements cache
 * Call this on subscription updates
 */
export async function invalidateEntitlementsCache(userId: string): Promise<void> {
  await redis.del(`entitlements:${userId}`)
}

/**
 * Check if user has specific feature access
 * Convenience wrapper around getEntitlements
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof Entitlements['features']
): Promise<boolean> {
  const entitlements = await getEntitlements(userId)
  return entitlements.features[feature] === true
}
```

### 4.2 Server Action Guards

Pattern for protecting server actions with subscription checks:

```typescript
// apps/web/server/actions/deliveries.ts

import { getEntitlements } from '@/server/lib/entitlements'
import { ErrorCodes } from '@dearme/types'

export async function scheduleDelivery(
  input: unknown
): Promise<ActionResult<{ deliveryId: string }>> {
  const user = await requireUser()

  // ENFORCEMENT POINT: Check entitlements before proceeding
  const entitlements = await getEntitlements(user.id)

  if (!entitlements.features.canScheduleDeliveries) {
    return {
      success: false,
      error: {
        code: ErrorCodes.SUBSCRIPTION_REQUIRED,
        message: 'Scheduling deliveries requires a Pro subscription',
        details: {
          requiredPlan: 'pro',
          currentPlan: entitlements.plan,
          upgradeUrl: '/pricing'
        }
      }
    }
  }

  // Validate input
  const validated = scheduleDeliverySchema.safeParse(input)
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'Invalid delivery data',
        details: validated.error.flatten().fieldErrors
      }
    }
  }

  // Check if physical mail requires credits
  if (validated.data.channel === 'mail') {
    if (!entitlements.features.canSchedulePhysicalMail) {
      return {
        success: false,
        error: {
          code: ErrorCodes.FEATURE_NOT_AVAILABLE,
          message: 'Physical mail requires Pro subscription'
        }
      }
    }

    if (entitlements.limits.mailCreditsExhausted) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INSUFFICIENT_CREDITS,
          message: 'No mail credits remaining',
          details: {
            action: 'purchase_credits',
            url: '/settings/billing'
          }
        }
      }
    }
  }

  // Proceed with delivery creation...
  const delivery = await prisma.delivery.create({
    data: {
      userId: user.id,
      letterId: validated.data.letterId,
      channel: validated.data.channel,
      deliverAt: validated.data.deliverAt,
      // ...
    }
  })

  // Deduct credits if physical mail
  if (validated.data.channel === 'mail') {
    await deductMailCredit(user.id)
  }

  return { success: true, data: { deliveryId: delivery.id }}
}
```

### 4.3 Error Handling in UI

Client-side handling of subscription errors:

```tsx
// apps/web/components/upgrade-modal.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  error?: {
    code: string
    message: string
    details?: {
      currentPlan?: string
      requiredPlan?: string
      upgradeUrl?: string
    }
  }
  open: boolean
  onClose: () => void
}

export function UpgradeModal({ error, open, onClose }: UpgradeModalProps) {
  const router = useRouter()

  if (!error || error.code !== 'SUBSCRIPTION_REQUIRED') {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Upgrade to Pro</Dialog.Title>
          <Dialog.Description>
            This feature requires a Pro subscription.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-4">
          <p>{error.message}</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm">
              <strong>Current Plan:</strong> {error.details?.currentPlan || 'Free'}
            </p>
            <p className="text-sm">
              <strong>Required:</strong> {error.details?.requiredPlan || 'Pro'}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => router.push('/pricing')}>
              View Plans
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
```

### 4.4 Middleware-Based Enforcement (Optional)

For page-level blocking:

```typescript
// apps/web/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function middleware(req: NextRequest) {
  const { userId } = auth()

  // Protect /letters/new route (example)
  if (req.nextUrl.pathname === '/letters/new') {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Could check entitlements here, but better to check in page/action
    // Middleware should be fast, entitlements check requires DB/cache lookup
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/letters/:path*', '/deliveries/:path*']
}
```

---

## 5. Webhook Handler Architecture

### 5.1 Async Processing via Inngest

Move webhook processing to Inngest for durability and retry logic.

**Current Problem**: Synchronous webhook processing blocks response, no retry on failure.

**Solution**: Webhook endpoint quickly verifies and queues, Inngest processes asynchronously.

#### Webhook Endpoint (Minimal)

**File**: `apps/web/app/api/webhooks/stripe/route.ts`

```typescript
import { headers } from 'next/headers'
import { stripe } from '@/server/providers/stripe/client'
import { env } from '@/env.mjs'
import { inngest } from '@/server/lib/inngest'

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event

  // 1. Verify signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // 2. Validate event age (reject >5min old)
  const eventAge = Date.now() - (event.created * 1000)
  if (eventAge > 5 * 60 * 1000) {
    console.warn('Webhook event too old', { eventId: event.id, age: eventAge })
    return new Response('Event too old', { status: 400 })
  }

  // 3. Queue to Inngest for async processing
  await inngest.send({
    name: 'stripe/webhook.received',
    data: { event }
  })

  // 4. Return 200 immediately (don't block Stripe)
  return new Response('Webhook queued', { status: 200 })
}
```

#### Inngest Webhook Processor

**File**: `workers/inngest/functions/billing/process-stripe-webhook.ts`

```typescript
import { inngest } from '../../client'
import { prisma } from '@dearme/prisma'
import { invalidateEntitlementsCache } from '@/server/lib/entitlements'

export const processStripeWebhook = inngest.createFunction(
  {
    id: 'process-stripe-webhook',
    retries: 3,
    onFailure: async ({ event, error }) => {
      // Move to dead letter queue after 3 retries
      await prisma.failedWebhook.create({
        data: {
          eventId: event.data.event.id,
          eventType: event.data.event.type,
          payload: event.data.event,
          error: error.message
        }
      })

      // Alert engineering team
      await sendSlackAlert({
        channel: '#billing-alerts',
        message: `🚨 Webhook processing failed after 3 retries`,
        details: {
          eventId: event.data.event.id,
          eventType: event.data.event.type,
          error: error.message
        }
      })
    }
  },
  { event: 'stripe/webhook.received' },
  async ({ event, step }) => {
    const stripeEvent = event.data.event

    // Step 1: Idempotency check
    const exists = await step.run('check-idempotency', async () => {
      return await prisma.webhookEvent.findUnique({
        where: { id: stripeEvent.id }
      })
    })

    if (exists) {
      return { message: 'Event already processed', eventId: stripeEvent.id }
    }

    // Step 2: Route to specific handler
    await step.run('process-event', async () => {
      await routeWebhookEvent(stripeEvent)
    })

    // Step 3: Mark as processed
    await step.run('mark-processed', async () => {
      await prisma.webhookEvent.create({
        data: {
          id: stripeEvent.id,
          type: stripeEvent.type,
          data: stripeEvent
        }
      })
    })

    return { message: 'Webhook processed', eventId: stripeEvent.id }
  }
)

/**
 * Route webhook event to appropriate handler
 */
async function routeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.created':
      await handleCustomerCreated(event.data.object as Stripe.Customer)
      break

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription)
      break

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
      break

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}
```

### 5.2 Webhook Event Handlers

#### Subscription Created/Updated

```typescript
async function handleSubscriptionCreatedOrUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!profile) {
    throw new Error(`User not found for customer: ${customerId}`)
  }

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId: profile.userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status as any,
      plan: 'pro', // TODO: Derive from subscription metadata
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    },
    update: {
      status: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })

  // Invalidate entitlements cache
  await invalidateEntitlementsCache(profile.userId)

  // Create usage record for new period if needed
  if (subscription.status === 'active') {
    await prisma.subscriptionUsage.upsert({
      where: {
        userId_period: {
          userId: profile.userId,
          period: new Date(subscription.current_period_start * 1000)
        }
      },
      create: {
        userId: profile.userId,
        period: new Date(subscription.current_period_start * 1000),
        mailCredits: 2 // Pro includes 2 mail credits/month
      },
      update: {}
    })
  }
}
```

#### Trial Will End

```typescript
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customerId },
    include: { user: true }
  })

  if (!profile) return

  // Trigger email notification via Inngest
  await inngest.send({
    name: 'email/trial-ending',
    data: {
      userId: profile.userId,
      email: profile.user.email,
      trialEndsAt: new Date(subscription.trial_end! * 1000),
      daysRemaining: Math.ceil(
        (subscription.trial_end! * 1000 - Date.now()) / 86400000
      )
    }
  })
}
```

#### Invoice Payment Failed

```typescript
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customerId },
    include: { user: true }
  })

  if (!profile) return

  // Record failed payment
  await prisma.payment.create({
    data: {
      userId: profile.userId,
      type: 'subscription',
      amountCents: invoice.amount_due,
      currency: invoice.currency,
      stripePaymentIntentId: invoice.payment_intent as string,
      status: 'failed',
      metadata: {
        invoiceId: invoice.id,
        attemptCount: invoice.attempt_count
      }
    }
  })

  // Trigger dunning sequence via Inngest
  await inngest.send({
    name: 'billing/payment-failed',
    data: {
      userId: profile.userId,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due,
      attemptCount: invoice.attempt_count,
      nextPaymentAttempt: invoice.next_payment_attempt
    }
  })
}
```

### 5.3 Complete Event Coverage

All 14+ critical Stripe events handled:

| Event | Handler | Purpose |
|-------|---------|---------|
| `customer.created` | handleCustomerCreated | Log customer creation (handled in Clerk webhook) |
| `customer.updated` | handleCustomerUpdated | Sync customer metadata |
| `customer.deleted` | handleCustomerDeleted | Cleanup on customer deletion |
| `customer.subscription.created` | handleSubscriptionCreatedOrUpdated | Create subscription record |
| `customer.subscription.updated` | handleSubscriptionCreatedOrUpdated | Update subscription status |
| `customer.subscription.deleted` | handleSubscriptionDeleted | Mark as canceled |
| `customer.subscription.trial_will_end` | handleTrialWillEnd | Send reminder email (3 days before) |
| `customer.subscription.paused` | handleSubscriptionPaused | Update status to paused |
| `customer.subscription.resumed` | handleSubscriptionResumed | Reactivate subscription |
| `invoice.payment_succeeded` | handleInvoicePaymentSucceeded | Record payment, send receipt |
| `invoice.payment_failed` | handleInvoicePaymentFailed | Trigger dunning sequence |
| `checkout.session.completed` | handleCheckoutCompleted | Log successful checkout |
| `checkout.session.expired` | handleCheckoutExpired | Track abandonment |
| `payment_intent.succeeded` | handlePaymentIntentSucceeded | Record one-time payments (physical mail) |
| `payment_intent.payment_failed` | handlePaymentIntentFailed | Log failed payment attempts |
| `charge.refunded` | handleChargeRefunded | Record refunds |
| `payment_method.attached` | handlePaymentMethodAttached | Track payment method changes |
| `payment_method.detached` | handlePaymentMethodDetached | Log payment method removal |

---

## 6. Pricing Page Design

### 6.1 Component Architecture

**File**: `apps/web/app/(marketing)/pricing/page.tsx`

```tsx
import { Metadata } from 'next'
import { PricingTiers } from './_components/pricing-tiers'
import { FeatureMatrix } from './_components/feature-matrix'
import { PricingFAQ } from './_components/pricing-faq'

export const metadata: Metadata = {
  title: 'Pricing - DearMe',
  description: 'Choose the perfect plan for your letter writing journey',
}

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Start free, upgrade when you're ready
        </p>
      </div>

      {/* Pricing Tiers */}
      <PricingTiers />

      {/* Feature Comparison */}
      <FeatureMatrix />

      {/* FAQ */}
      <PricingFAQ />

      {/* Trust Signals */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          🔒 Secure payments via Stripe • 14-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  )
}
```

### 6.2 Pricing Tiers Component

**File**: `apps/web/app/(marketing)/pricing/_components/pricing-tiers.tsx`

```tsx
import { Check } from 'lucide-react'
import { PricingCard } from './pricing-card'

export function PricingTiers() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* FREE TIER */}
      <PricingCard
        name="Free"
        price="$0"
        interval="forever"
        description="Perfect for getting started"
        features={[
          '5 letters per month',
          'Email delivery only',
          'Basic templates',
          'Standard support'
        ]}
        cta="Start Free"
        ctaHref="/sign-up"
      />

      {/* PRO TIER (Highlighted) */}
      <PricingCard
        name="Pro"
        price="$9"
        interval="per month"
        annualPrice="$90"
        annualSavings="Save 17%"
        description="For serious letter writers"
        features={[
          'Unlimited letters',
          'Email + Physical mail delivery',
          '2 free physical mails/month',
          'Advanced scheduling (arrive-by mode)',
          'Premium templates',
          'Priority support'
        ]}
        cta="Start Free Trial"
        ctaHref="/sign-up?plan=pro"
        highlighted={true}
        badge="Most Popular"
      />

      {/* ENTERPRISE TIER */}
      <PricingCard
        name="Enterprise"
        price="Custom"
        description="For teams and organizations"
        features={[
          'Everything in Pro',
          'Dedicated account manager',
          'Custom branding',
          'API access',
          'SSO support',
          'SLA guarantee'
        ]}
        cta="Contact Sales"
        ctaHref="/contact?type=enterprise"
      />
    </div>
  )
}
```

### 6.3 Feature Matrix

Detailed feature comparison table:

```tsx
const features = [
  {
    category: 'Core Features',
    items: [
      { name: 'Letters per month', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Email delivery', free: true, pro: true, enterprise: true },
      { name: 'Physical mail delivery', free: false, pro: true, enterprise: true },
      { name: 'Letter templates', free: 'Basic', pro: 'Premium', enterprise: 'Custom' }
    ]
  },
  {
    category: 'Advanced Features',
    items: [
      { name: 'Arrive-by scheduling', free: false, pro: true, enterprise: true },
      { name: 'Mail credits per month', free: '0', pro: '2', enterprise: 'Custom' },
      { name: 'API access', free: false, pro: false, enterprise: true },
      { name: 'Custom branding', free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: 'Support',
    items: [
      { name: 'Email support', free: 'Standard', pro: 'Priority', enterprise: '24/7' },
      { name: 'Dedicated account manager', free: false, pro: false, enterprise: true },
      { name: 'SLA guarantee', free: false, pro: false, enterprise: true }
    ]
  }
]
```

### 6.4 Conversion Optimization

Key elements for conversion:

1. **Social Proof**: "Join 10,000+ users writing to their future selves"
2. **Risk Reversal**: "14-day free trial, no credit card required"
3. **Value Proposition**: Highlight savings for annual plans (17% discount)
4. **Trust Signals**: Stripe badge, security icons, testimonials
5. **Urgency** (subtle): "Limited-time offer: Extra month free on annual"
6. **Clear CTA**: "Start Free Trial" (not "Sign Up" or "Get Started")
7. **Mobile-First**: Responsive design, stacked cards on mobile
8. **Fast Loading**: Server Component, optimized images, minimal JS

---

## 7. Checkout Flow

### 7.1 Server Action: Create Checkout Session

**File**: `apps/web/server/actions/billing.ts`

```typescript
'use server'

import { requireUser } from '@/server/lib/auth'
import { stripe } from '@/server/providers/stripe/client'
import { prisma } from '@/server/lib/db'
import { env } from '@/env.mjs'
import { ActionResult, ErrorCodes } from '@dearme/types'

export async function createCheckoutSession(input: {
  priceId: string
  billingInterval: 'month' | 'year'
}): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireUser()

    // 1. Validate price ID
    const validPriceIds = [
      env.STRIPE_PRICE_PRO_MONTHLY,
      env.STRIPE_PRICE_PRO_ANNUAL
    ]

    if (!validPriceIds.includes(input.priceId)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INVALID_INPUT,
          message: 'Invalid pricing plan selected'
        }
      }
    }

    // 2. Check existing subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing'] }
      }
    })

    if (existingSubscription) {
      return {
        success: false,
        error: {
          code: ErrorCodes.ALREADY_SUBSCRIBED,
          message: 'You already have an active subscription',
          details: {
            subscriptionId: existingSubscription.id,
            manageUrl: '/settings/billing'
          }
        }
      }
    }

    // 3. Get or create Stripe customer
    let customerId = user.profile?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkUserId: user.clerkUserId
        }
      })

      await prisma.profile.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customer.id }
      })

      customerId = customer.id
    }

    // 4. Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: input.priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id
        }
      },
      metadata: {
        userId: user.id,
        source: 'pricing_page',
        priceId: input.priceId
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto'
      }
    })

    // 5. Audit log
    await createAuditEvent({
      userId: user.id,
      type: 'checkout.session.created',
      data: {
        sessionId: session.id,
        priceId: input.priceId,
        customerId
      }
    })

    return {
      success: true,
      data: { url: session.url! }
    }
  } catch (error) {
    console.error('Checkout session creation failed:', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
        message: 'Failed to create checkout session. Please try again.'
      }
    }
  }
}
```

### 7.2 Success Page with Polling

**File**: `apps/web/app/checkout/success/page.tsx`

```tsx
import { redirect } from 'next/navigation'
import { requireUser } from '@/server/lib/auth'
import { prisma } from '@/server/lib/db'
import { CheckoutSuccess } from './_components/checkout-success'
import { CheckoutProcessing } from './_components/checkout-processing'

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string }
}) {
  const user = await requireUser()

  if (!searchParams.session_id) {
    redirect('/dashboard')
  }

  // Poll for subscription (webhook may still be processing)
  let subscription = null
  for (let i = 0; i < 10; i++) {
    subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing'] }
      }
    })

    if (subscription) break

    // Wait 1 second between polls
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (!subscription) {
    // Webhook not processed yet, show loading state
    return <CheckoutProcessing sessionId={searchParams.session_id} />
  }

  // Success state
  return (
    <CheckoutSuccess
      subscription={subscription}
      trialEndsAt={subscription.currentPeriodEnd}
    />
  )
}
```

### 7.3 Cancel Page

**File**: `apps/web/app/checkout/cancel/page.tsx`

```tsx
export default function CheckoutCancelPage() {
  return (
    <div className="container max-w-2xl mx-auto py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Checkout Canceled
        </h1>
        <p className="text-muted-foreground mb-8">
          No worries! You can return to pricing and try again whenever you're ready.
        </p>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 7.4 Edge Cases Handled

1. **User already has subscription**: Return error with link to manage
2. **Invalid price ID**: Validate before calling Stripe
3. **Missing customer ID**: Create on-the-fly
4. **Webhook delay**: Poll for up to 10 seconds
5. **Stripe API failure**: Retry with exponential backoff
6. **Checkout abandonment**: Show return path, track metric

---

## 8. Customer Portal Integration

### 8.1 Server Action: Create Portal Session

**File**: `apps/web/server/actions/billing.ts` (continued)

```typescript
export async function createBillingPortalSession(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    const user = await requireUser()

    // Require existing Stripe customer
    const customerId = user.profile?.stripeCustomerId

    if (!customerId) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NO_CUSTOMER,
          message: 'No billing account found. Please subscribe first.',
          details: {
            action: 'subscribe',
            url: '/pricing'
          }
        }
      }
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/settings/billing`
    })

    // Audit log
    await createAuditEvent({
      userId: user.id,
      type: 'billing_portal.session.created',
      data: { sessionId: session.id }
    })

    return {
      success: true,
      data: { url: session.url }
    }
  } catch (error) {
    console.error('Billing portal session creation failed:', error)

    return {
      success: false,
      error: {
        code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
        message: 'Failed to access billing portal. Please try again.'
      }
    }
  }
}
```

### 8.2 Billing Settings Page

**File**: `apps/web/app/(app)/settings/billing/page.tsx`

```tsx
import { requireUser } from '@/server/lib/auth'
import { prisma } from '@/server/lib/db'
import { SubscriptionStatus } from './_components/subscription-status'
import { ManageSubscriptionButton } from './_components/manage-subscription-button'
import { InvoiceHistory } from './_components/invoice-history'
import { UsageIndicator } from './_components/usage-indicator'

export default async function BillingSettingsPage() {
  const user = await requireUser()

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view billing history
        </p>
      </div>

      {subscription ? (
        <>
          <SubscriptionStatus
            plan={subscription.plan}
            status={subscription.status}
            renewsAt={subscription.currentPeriodEnd}
            cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          />

          <UsageIndicator userId={user.id} />

          <ManageSubscriptionButton />

          <InvoiceHistory userId={user.id} />
        </>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
          <p className="text-muted-foreground mb-4">
            You're currently on the free plan
          </p>
          <Button asChild>
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
```

### 8.3 Manage Subscription Button

**File**: `apps/web/app/(app)/settings/billing/_components/manage-subscription-button.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createBillingPortalSession } from '@/server/actions/billing'
import { toast } from 'sonner'

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)

    try {
      const result = await createBillingPortalSession()

      if (result.success) {
        window.location.href = result.data.url
      } else {
        toast.error(result.error.message)
        setIsLoading(false)
      }
    } catch (error) {
      toast.error('Failed to load billing portal')
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}
```

### 8.4 Stripe Customer Portal Configuration

Configure in Stripe Dashboard:

1. **Enabled Features**:
   - Cancel subscription (immediate or at period end)
   - Update payment method
   - View invoice history
   - Upgrade/downgrade plans
   - Update billing information

2. **Branding**:
   - Logo: DearMe logo (upload to Stripe)
   - Colors: Match application theme
   - Business info: Support email, terms URL

3. **Business Settings**:
   - Display name: "DearMe"
   - Support email: support@dearme.app
   - Terms of service: https://dearme.app/terms
   - Privacy policy: https://dearme.app/privacy

---

## 9. Usage Tracking System

### 9.1 Usage Tracking Service

**File**: `apps/web/server/lib/usage-tracking.ts`

```typescript
import { prisma } from './db'
import { startOfMonth } from 'date-fns'

export class QuotaExceededError extends Error {
  constructor(
    public feature: string,
    public limit: number
  ) {
    super(`Quota exceeded for ${feature}: ${limit}`)
    this.name = 'QuotaExceededError'
  }
}

/**
 * Get current usage for user
 */
export async function getCurrentUsage(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] }
    }
  })

  if (!subscription) {
    // Free tier - count actual letters this month
    return await getCurrentUsageForFreeTier(userId)
  }

  // Pro tier - get or create usage record
  const period = startOfMonth(new Date())

  const usage = await prisma.subscriptionUsage.upsert({
    where: {
      userId_period: { userId, period }
    },
    create: {
      userId,
      period,
      mailCredits: 2 // Pro includes 2 free mails/month
    },
    update: {}
  })

  return {
    period,
    lettersCreated: usage.lettersCreated,
    emailsSent: usage.emailsSent,
    mailsSent: usage.mailsSent,
    mailCredits: usage.mailCredits,
    limits: {
      maxLettersPerMonth: Infinity,
      maxEmailsPerMonth: Infinity,
      mailCreditsPerMonth: 2
    }
  }
}

/**
 * Get usage for free tier users (no subscription)
 */
async function getCurrentUsageForFreeTier(userId: string) {
  const thisMonth = startOfMonth(new Date())

  const lettersThisMonth = await prisma.letter.count({
    where: {
      userId,
      createdAt: { gte: thisMonth }
    }
  })

  return {
    period: thisMonth,
    lettersThisMonth,
    emailsThisMonth: 0, // Free tier can't schedule emails
    mailCreditsRemaining: 0,
    limits: {
      maxLettersPerMonth: 5,
      maxEmailsPerMonth: 0,
      mailCreditsPerMonth: 0
    }
  }
}

/**
 * Increment letter count with quota check
 */
export async function incrementLetterCount(userId: string) {
  const usage = await getCurrentUsage(userId)

  // Check quota
  if (
    usage.limits.maxLettersPerMonth !== Infinity &&
    usage.lettersCreated >= usage.limits.maxLettersPerMonth
  ) {
    throw new QuotaExceededError('letters', usage.limits.maxLettersPerMonth)
  }

  // Atomic increment (only for Pro users with usage record)
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] }}
  })

  if (subscription) {
    await prisma.subscriptionUsage.update({
      where: {
        userId_period: { userId, period: usage.period }
      },
      data: {
        lettersCreated: { increment: 1 }
      }
    })
  }

  // Free tier: count is implicit from letter createdAt
}

/**
 * Increment email count
 */
export async function incrementEmailCount(userId: string) {
  const usage = await getCurrentUsage(userId)

  if (
    usage.limits.maxEmailsPerMonth !== Infinity &&
    usage.emailsSent >= usage.limits.maxEmailsPerMonth
  ) {
    throw new QuotaExceededError('emails', usage.limits.maxEmailsPerMonth)
  }

  await prisma.subscriptionUsage.update({
    where: {
      userId_period: { userId, period: usage.period }
    },
    data: {
      emailsSent: { increment: 1 }
    }
  })
}

/**
 * Deduct mail credit or charge for additional mail
 */
export async function deductMailCredit(userId: string): Promise<{
  remaining: number
  charged: boolean
  amountCents: number
}> {
  const usage = await getCurrentUsage(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  })

  if (!user) throw new Error('User not found')

  if (usage.mailCredits > 0) {
    // Use included credit
    await prisma.subscriptionUsage.update({
      where: {
        userId_period: { userId, period: usage.period }
      },
      data: {
        mailCredits: { decrement: 1 },
        mailsSent: { increment: 1 }
      }
    })

    return {
      remaining: usage.mailCredits - 1,
      charged: false,
      amountCents: 0
    }
  } else {
    // Charge for additional mail ($3.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 300,
      currency: 'usd',
      customer: user.profile!.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        type: 'physical_mail'
      }
    })

    await prisma.subscriptionUsage.update({
      where: {
        userId_period: { userId, period: usage.period }
      },
      data: {
        mailsSent: { increment: 1 }
      }
    })

    // Record payment
    await prisma.payment.create({
      data: {
        userId,
        type: 'shipping_addon',
        amountCents: 300,
        currency: 'usd',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        metadata: { type: 'physical_mail' }
      }
    })

    return {
      remaining: 0,
      charged: true,
      amountCents: 300
    }
  }
}
```

### 9.2 Usage Period Rollover

**File**: `apps/web/app/api/cron/rollover-usage/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/server/lib/db'
import { env } from '@/env.mjs'
import { startOfDay, endOfDay } from 'date-fns'

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = new Date()

  // Find subscriptions with period ending today
  const endingToday = await prisma.subscription.findMany({
    where: {
      currentPeriodEnd: {
        gte: startOfDay(today),
        lte: endOfDay(today)
      },
      status: { in: ['active', 'trialing'] }
    }
  })

  let createdCount = 0

  for (const sub of endingToday) {
    // Create new usage record for next period
    await prisma.subscriptionUsage.create({
      data: {
        userId: sub.userId,
        period: sub.currentPeriodEnd, // New period starts at old period end
        lettersCreated: 0,
        emailsSent: 0,
        mailsSent: 0,
        mailCredits: sub.plan === 'pro' ? 2 : 0
      }
    })

    createdCount++
  }

  return NextResponse.json({
    message: 'Usage rollover complete',
    subscriptionsProcessed: endingToday.length,
    usageRecordsCreated: createdCount
  })
}
```

Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/rollover-usage",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 9.3 Usage Display Component

**File**: `apps/web/app/(app)/settings/billing/_components/usage-indicator.tsx`

```tsx
import { getCurrentUsage } from '@/server/lib/usage-tracking'
import { Progress } from '@/components/ui/progress'

export async function UsageIndicator({ userId }: { userId: string }) {
  const usage = await getCurrentUsage(userId)

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold">Current Usage</h3>

      {/* Letters */}
      {usage.limits.maxLettersPerMonth !== Infinity && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Letters Created</span>
            <span>
              {usage.lettersCreated} / {usage.limits.maxLettersPerMonth}
            </span>
          </div>
          <Progress
            value={(usage.lettersCreated / usage.limits.maxLettersPerMonth) * 100}
          />
        </div>
      )}

      {/* Emails */}
      {usage.limits.maxEmailsPerMonth !== Infinity && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Email Deliveries</span>
            <span>
              {usage.emailsSent} / {usage.limits.maxEmailsPerMonth}
            </span>
          </div>
          <Progress
            value={(usage.emailsSent / usage.limits.maxEmailsPerMonth) * 100}
          />
        </div>
      )}

      {/* Mail Credits */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Physical Mail Credits</span>
          <span>{usage.mailCredits} remaining</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Resets on {new Date(usage.period).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
```

---

## 10. Security Architecture

### 10.1 PCI Compliance

**Strategy**: Let Stripe handle all card data (PCI DSS Level 1).

- Never store card numbers, CVV, or expiration dates
- Use Stripe Checkout (hosted) or Stripe Elements (embedded)
- Only store Stripe customer/subscription IDs
- All payment data encrypted in transit (HTTPS)
- Audit logging for all payment operations

**Implementation**:
```typescript
// ✅ GOOD: Store Stripe IDs only
await prisma.profile.update({
  where: { userId },
  data: { stripeCustomerId: customer.id }
})

// ❌ BAD: Never do this
await prisma.profile.update({
  where: { userId },
  data: { cardNumber: '4242...' } // NEVER store card data
})
```

### 10.2 Webhook Security

**5 Layers of Protection**:

1. **Signature Verification** (IMPLEMENTED)
```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  env.STRIPE_WEBHOOK_SECRET
)
```

2. **Event Age Validation** (NEW)
```typescript
const eventAge = Date.now() - (event.created * 1000)
if (eventAge > 5 * 60 * 1000) {
  return new Response('Event too old', { status: 400 })
}
```

3. **Rate Limiting** (NEW)
```typescript
const ip = req.headers.get('x-forwarded-for')
const count = await redis.incr(`webhook:ratelimit:${ip}`)

if (count === 1) {
  await redis.expire(`webhook:ratelimit:${ip}`, 60)
}

if (count > 10) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

4. **IP Whitelist** (Vercel Configuration)
```json
// vercel.json
{
  "routes": [
    {
      "src": "/api/webhooks/stripe",
      "headers": {
        "X-Allowed-IPs": "3.18.12.63,3.130.192.231,..." // Stripe IPs
      }
    }
  ]
}
```

5. **Customer ID Verification** (NEW)
```typescript
const profile = await prisma.profile.findUnique({
  where: { stripeCustomerId: customer.id }
})

if (!profile) {
  logger.error('Webhook customer not found', { customerId: customer.id })
  return new Response('OK', { status: 200 }) // Don't retry
}
```

### 10.3 Server Action Security

All server actions protected with:

1. **Authentication** (Clerk)
```typescript
const user = await requireUser() // Throws if not authenticated
```

2. **Authorization** (Entitlements)
```typescript
const entitlements = await getEntitlements(user.id)
if (!entitlements.features.canScheduleDeliveries) {
  return { success: false, error: { code: 'FORBIDDEN' }}
}
```

3. **Input Validation** (Zod)
```typescript
const validated = schema.safeParse(input)
if (!validated.success) {
  return { success: false, error: { code: 'VALIDATION_FAILED' }}
}
```

4. **CSRF Protection** (Built into Next.js Server Actions)
- Automatic CSRF token validation
- No additional configuration needed

5. **Rate Limiting** (Per-user)
```typescript
const key = `action:${actionName}:${user.id}`
const attempts = await redis.incr(key)

if (attempts === 1) {
  await redis.expire(key, 60)
}

if (attempts > 10) {
  return { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' }}
}
```

### 10.4 GDPR Compliance

**Data Export** (DSR):
```typescript
export async function exportUserData(userId: string) {
  return {
    user: await prisma.user.findUnique({ where: { id: userId }}),
    subscriptions: await prisma.subscription.findMany({ where: { userId }}),
    payments: await prisma.payment.findMany({ where: { userId }}),
    usage: await prisma.subscriptionUsage.findMany({ where: { userId }})
  }
}
```

**Data Deletion** (Right to be Forgotten):
```typescript
async function deleteUserData(userId: string) {
  // 1. Cancel Stripe subscription
  const subscription = await getActiveSubscription(userId)
  if (subscription) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
  }

  // 2. Anonymize payment records (retain for accounting)
  await prisma.payment.updateMany({
    where: { userId },
    data: { userId: 'DELETED_USER' }
  })

  // 3. Delete user (cascades to subscriptions, usage)
  await prisma.user.delete({ where: { id: userId }})
}
```

### 10.5 Audit Logging

**Log All Payment Operations**:
```typescript
await createAuditEvent({
  userId: user.id,
  type: 'checkout.session.created',
  data: { sessionId, priceId, customerId },
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent')
})
```

**Retention**: 7 years (tax compliance)
**Never Log**: Card numbers, CVV, passwords, API keys

---

## 11. Error Handling & Monitoring

### 11.1 Retry Logic

**Pattern for Stripe API Calls**:
```typescript
async function callStripeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<Result<T>> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation()
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeAPIError) {
        // Rate limit - exponential backoff
        if (error.statusCode === 429) {
          await sleep(Math.pow(2, i) * 1000)
          continue
        }

        // Server error - retry
        if (error.statusCode >= 500) {
          await sleep(Math.pow(2, i) * 1000)
          continue
        }

        // Client error (4xx) - don't retry
        break
      }

      // Network error - retry
      await sleep(Math.pow(2, i) * 1000)
    }
  }

  return {
    success: false,
    error: {
      code: ErrorCodes.PAYMENT_PROVIDER_ERROR,
      message: 'Payment provider temporarily unavailable'
    }
  }
}
```

### 11.2 Dunning Management

**Automated Payment Failure Recovery**:
```typescript
// workers/inngest/functions/billing/handle-failed-payment.ts

export const handleFailedPayment = inngest.createFunction(
  { id: 'handle-failed-payment' },
  { event: 'billing/payment-failed' },
  async ({ event, step }) => {
    const { userId, invoiceId, attemptCount } = event.data

    // Day 0: Send immediate notification
    await step.run('send-notification', async () => {
      await sendEmail({
        to: user.email,
        template: 'payment-failed',
        data: {
          amountDue: event.data.amountDue / 100,
          updatePaymentUrl: await createBillingPortalSession(userId)
        }
      })
    })

    // Day 3: Check status, send urgent reminder
    await step.sleep('wait-3-days', '3d')

    const subscription = await step.run('check-status-day-3', async () => {
      return await getActiveSubscription(userId)
    })

    if (subscription?.status === 'past_due') {
      await step.run('send-urgent-reminder', async () => {
        await sendEmail({
          to: user.email,
          template: 'payment-failed-urgent',
          data: { daysRemaining: 7 }
        })
      })
    }

    // Day 7: Final warning
    await step.sleep('wait-4-days', '4d')

    const stillPastDue = await step.run('check-status-day-7', async () => {
      const sub = await getActiveSubscription(userId)
      return sub?.status === 'past_due'
    })

    if (stillPastDue) {
      await step.run('send-final-warning', async () => {
        await sendEmail({
          to: user.email,
          template: 'subscription-at-risk',
          data: { cancelDate: addDays(new Date(), 3) }
        })
      })
    }

    // Day 10: Cancel if still unpaid
    await step.sleep('wait-3-days', '3d')

    await step.run('cancel-if-unpaid', async () => {
      const sub = await getActiveSubscription(userId)
      if (sub?.status === 'past_due') {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId)

        await sendEmail({
          to: user.email,
          template: 'subscription-canceled',
          data: { reason: 'payment_failure' }
        })
      }
    })
  }
)
```

### 11.3 Monitoring Dashboards

**Key Metrics**:

1. **Revenue Metrics**
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - Churn rate (monthly)
   - ARPU (Average Revenue Per User)
   - Trial conversion rate

2. **Operational Metrics**
   - Webhook processing latency (p50, p95, p99)
   - Webhook failure rate
   - Payment success rate
   - Subscription creation rate
   - API error rate

3. **User Journey Metrics**
   - Pricing page views
   - Checkout starts
   - Checkout completions
   - Checkout abandonment rate
   - Time to first payment

### 11.4 Alert Configuration

**Critical Alerts** (PagerDuty):
```yaml
webhook_failure_rate:
  threshold: 5%
  window: 5m
  action: page_on_call

payment_success_rate:
  threshold: 95%  # Below
  window: 1h
  action: page_on_call

api_error_rate:
  threshold: 1%
  window: 5m
  action: page_on_call
```

**Warning Alerts** (Slack):
```yaml
churn_rate:
  threshold: 10%  # Monthly
  window: 1d
  action: slack_notification

trial_conversion_rate:
  threshold: 20%  # Below
  window: 7d
  action: slack_notification

checkout_abandonment_rate:
  threshold: 50%  # Above
  window: 1d
  action: slack_notification
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Coverage Target**: 100% for critical services

```typescript
// server/lib/__tests__/entitlements.test.ts

describe('Entitlements Service', () => {
  describe('getEntitlements', () => {
    it('returns Pro features for active subscription', async () => {
      const userId = await createTestUser()
      await createTestSubscription({ userId, plan: 'pro', status: 'active' })

      const entitlements = await getEntitlements(userId)

      expect(entitlements.plan).toBe('pro')
      expect(entitlements.features.canScheduleDeliveries).toBe(true)
      expect(entitlements.features.maxLettersPerMonth).toBe('unlimited')
    })

    it('returns free features for no subscription', async () => {
      const userId = await createTestUser()

      const entitlements = await getEntitlements(userId)

      expect(entitlements.plan).toBe('free')
      expect(entitlements.features.maxLettersPerMonth).toBe(5)
    })

    it('caches entitlements in Redis', async () => {
      const userId = await createTestUser()

      await getEntitlements(userId) // Cache miss
      await getEntitlements(userId) // Cache hit

      expect(redis.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('incrementLetterCount', () => {
    it('increments counter atomically', async () => {
      const userId = await createTestUser({ plan: 'pro' })

      await Promise.all([
        incrementLetterCount(userId),
        incrementLetterCount(userId),
        incrementLetterCount(userId)
      ])

      const usage = await getCurrentUsage(userId)
      expect(usage.lettersCreated).toBe(3)
    })

    it('throws QuotaExceededError when limit reached', async () => {
      const userId = await createTestUser() // Free tier

      for (let i = 0; i < 5; i++) {
        await incrementLetterCount(userId)
      }

      await expect(incrementLetterCount(userId)).rejects.toThrow(QuotaExceededError)
    })
  })
})
```

### 12.2 Integration Tests

**Webhook Processing**:
```typescript
describe('Webhook Processing', () => {
  it('processes subscription.created webhook', async () => {
    const testUser = await createTestUser()

    const webhookPayload = {
      id: 'evt_test123',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test123',
          customer: testUser.profile.stripeCustomerId,
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 2592000
        }
      }
    }

    const signature = generateWebhookSignature(webhookPayload)

    const response = await POST(new Request('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    }))

    expect(response.status).toBe(200)

    // Wait for Inngest processing
    await waitForInngestExecution()

    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: 'sub_test123' }
    })

    expect(subscription).toBeDefined()
    expect(subscription.userId).toBe(testUser.id)
  })

  it('handles duplicate webhooks idempotently', async () => {
    const webhookPayload = createTestWebhook('invoice.payment_succeeded')

    await processWebhook(webhookPayload)
    await processWebhook(webhookPayload) // Duplicate

    const payments = await prisma.payment.findMany({
      where: { stripePaymentIntentId: webhookPayload.data.object.payment_intent }
    })

    expect(payments).toHaveLength(1)
  })
})
```

### 12.3 E2E Tests

**Full Checkout Flow** (Playwright):
```typescript
test('user can upgrade to Pro plan', async ({ page }) => {
  // 1. Login
  await page.goto('/sign-in')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')

  // 2. Navigate to pricing
  await page.goto('/pricing')

  // 3. Click "Upgrade to Pro"
  await page.click('text=Upgrade to Pro')

  // 4. Should redirect to Stripe checkout
  await page.waitForURL(/checkout\.stripe\.com/)

  // 5. Fill payment details (Stripe test mode)
  await page.fill('[name=cardnumber]', '4242 4242 4242 4242')
  await page.fill('[name=exp-date]', '12/34')
  await page.fill('[name=cvc]', '123')
  await page.fill('[name=postal]', '12345')

  // 6. Submit payment
  await page.click('button[type=submit]')

  // 7. Should redirect to success page
  await page.waitForURL(/checkout\/success/)

  // 8. Verify success message
  await expect(page.locator('text=Welcome to Pro!')).toBeVisible()

  // 9. Navigate to settings
  await page.goto('/settings/billing')

  // 10. Verify Pro status displayed
  await expect(page.locator('text=Pro Plan')).toBeVisible()
  await expect(page.locator('text=Active')).toBeVisible()
})
```

### 12.4 Coverage Targets

- **Entitlements Service**: 100%
- **Stripe Provider Functions**: 100%
- **Server Actions**: 90%
- **Webhook Handlers**: 95%
- **Overall**: 85%

---

## 13. Implementation Roadmap

### 13.1 Phase 0: Foundation (Days 1-3)

**Priority**: P0 - Blocking all other work
**Effort**: 3 days

**Tasks**:
1. Update Stripe API version (2023-10-16 → 2024-11-20) - 4h
2. Database schema migrations (SubscriptionUsage, WebhookEvent, PricingPlan) - 4h
3. Entitlements service implementation with Redis caching - 1d
4. Stripe customer creation on Clerk signup + backfill script - 4h

**Deliverable**: Foundation ready for revenue features
**Risk**: Low (backward compatible)

---

### 13.2 Phase 1: Revenue Infrastructure (Days 4-10)

**Priority**: P0 - Launch blocker
**Effort**: 7 days

#### Sub-phase 1A: Pricing Page (Days 4-5)
- Create pricing page with tiers, feature matrix, FAQ
- Connect to checkout server action
- SEO optimization
- Effort: 2 days

#### Sub-phase 1B: Checkout Flow (Days 6-7)
- Implement createCheckoutSession server action
- Build success/cancel pages
- Add subscription polling
- E2E test
- Effort: 2 days

#### Sub-phase 1C: Subscription Enforcement (Days 8-9)
- Add guards to scheduleDelivery, createLetter actions
- Build UpgradeModal component
- Add upgrade CTAs
- Effort: 2 days

#### Sub-phase 1D: Customer Portal (Day 10)
- Configure Stripe Portal
- Implement createBillingPortalSession action
- Update settings/billing page
- Effort: 1 day

**Success Criteria**:
- Users can subscribe via Stripe Checkout ✅
- Free users blocked from Pro features ✅
- Pro users can manage subscriptions ✅

---

### 13.3 Phase 2: Webhook Infrastructure (Days 11-14)

**Priority**: P0 - Required for production reliability
**Effort**: 4 days

**Tasks**:
1. Move webhook processing to Inngest - 1d
2. Implement missing webhook handlers (8 events) - 1.5d
3. Email notifications (trial ending, payment failed, etc.) - 1d
4. Security hardening (rate limiting, IP whitelist) - 0.5d

**Deliverable**: Robust webhook processing
**Risk**: Medium (async complexity)

---

### 13.4 Phase 3: Usage Tracking (Days 15-18)

**Priority**: P1 - Required for fair use enforcement
**Effort**: 4 days

**Tasks**:
1. Usage tracking service with atomic operations - 1d
2. Physical mail credits system - 1.5d
3. Usage period rollover cron job - 0.5d
4. Usage display in UI - 1d

**Deliverable**: Usage-based limitations functional

---

### 13.5 Phase 4: Plan Management (Days 19-23)

**Priority**: P1 - Required for beta
**Effort**: 5 days

**Tasks**:
1. Upgrade/downgrade functions with proration - 1.5d
2. Plan switching UI - 1d
3. Cancellation flow - 1d
4. Reactivation flow - 0.5d
5. Testing and QA - 1d

**Deliverable**: Complete subscription lifecycle management

---

### 13.6 Phase 5: Analytics & Monitoring (Days 24-28)

**Priority**: P1 - Required for business insights
**Effort**: 5 days

**Tasks**:
1. Revenue metrics dashboard (MRR, ARR, churn) - 2d
2. Operational monitoring (webhooks, payments) - 1d
3. Alerting infrastructure (PagerDuty, Slack) - 1d
4. Analytics integration (PostHog events) - 1d

**Deliverable**: Full visibility into payment operations

---

### 13.7 Phase 6: Polish & Optimization (Days 29-35)

**Priority**: P2 - Post-launch improvements
**Effort**: 7 days

**Tasks**:
1. Tax compliance (Stripe Tax) - 1d
2. Coupon/promotion support - 1d
3. Admin billing dashboard - 2d
4. Performance optimization - 1d
5. Testing and bug fixes - 2d

**Deliverable**: Production-ready, optimized system

---

### 13.8 Timeline Summary

**Total Timeline**: 5 weeks (35 working days)

- **Weeks 1-2**: P0 features (launch blockers) - Days 1-14
- **Week 3**: P1 features (beta requirements) - Days 15-21
- **Week 4**: P1 features (analytics, plan management) - Days 22-28
- **Week 5**: P2 features (polish, optimization) - Days 29-35

**Critical Path**: Phase 0 → Phase 1 → Phase 2 → Launch

**Team Allocation** (2 engineers):
- Engineer 1: UI/Frontend (Pricing, Checkout, Settings)
- Engineer 2: Backend (Webhooks, Entitlements, Usage)

**Milestones**:
- Day 10: MVP revenue generation ready
- Day 18: Webhook infrastructure complete
- Day 28: Beta-ready (all P0/P1 complete)
- Day 35: Production-ready

---

## 14. Code Organization

### 14.1 File Structure

```
apps/web/
├── app/
│   ├── (marketing)/
│   │   └── pricing/
│   │       ├── page.tsx                    # Pricing page (Server Component)
│   │       └── _components/
│   │           ├── pricing-tiers.tsx
│   │           ├── feature-matrix.tsx
│   │           ├── pricing-faq.tsx
│   │           └── upgrade-modal.tsx
│   │
│   ├── (app)/
│   │   └── settings/
│   │       └── billing/
│   │           ├── page.tsx                # Billing settings
│   │           └── _components/
│   │               ├── subscription-status.tsx
│   │               ├── invoice-history.tsx
│   │               ├── usage-indicator.tsx
│   │               └── manage-subscription-button.tsx
│   │
│   ├── checkout/
│   │   ├── success/page.tsx                # Post-checkout success
│   │   ├── cancel/page.tsx                 # Checkout abandoned
│   │   └── _components/
│   │       ├── checkout-processing.tsx
│   │       └── checkout-success.tsx
│   │
│   ├── admin/
│   │   └── billing/
│   │       ├── page.tsx                    # Revenue dashboard
│   │       ├── customers/page.tsx
│   │       ├── subscriptions/page.tsx
│   │       └── _components/
│   │           ├── revenue-metrics.tsx
│   │           ├── subscription-table.tsx
│   │           └── failed-payments.tsx
│   │
│   └── api/
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts                # Webhook endpoint
│       └── cron/
│           └── rollover-usage/
│               └── route.ts                # Usage period reset
│
├── server/
│   ├── actions/
│   │   ├── billing.ts                      # Billing Server Actions
│   │   │   ├── createCheckoutSession()
│   │   │   ├── createBillingPortalSession()
│   │   │   ├── cancelSubscription()
│   │   │   ├── updateSubscription()
│   │   │   └── reactivateSubscription()
│   │   ├── letters.ts                      # (add enforcement)
│   │   └── deliveries.ts                   # (add enforcement)
│   │
│   ├── lib/
│   │   ├── entitlements.ts                 # CORE: Entitlements service
│   │   │   ├── getEntitlements()
│   │   │   ├── invalidateEntitlementsCache()
│   │   │   └── checkFeatureAccess()
│   │   │
│   │   ├── usage-tracking.ts               # Usage tracking service
│   │   │   ├── getCurrentUsage()
│   │   │   ├── incrementLetterCount()
│   │   │   ├── incrementEmailCount()
│   │   │   └── deductMailCredit()
│   │   │
│   │   └── billing-helpers.ts              # Utility functions
│   │       ├── formatCurrency()
│   │       ├── calculateProration()
│   │       └── getPlanFeatures()
│   │
│   └── providers/
│       └── stripe/
│           ├── index.ts                    # Main export
│           ├── client.ts                   # Stripe client
│           ├── checkout.ts                 # Checkout operations
│           ├── subscriptions.ts            # Subscription operations
│           ├── customers.ts                # Customer operations
│           ├── billing-portal.ts           # Portal operations
│           ├── payments.ts                 # Payment operations
│           ├── usage.ts                    # Usage-based billing
│           └── webhooks.ts                 # Webhook utilities
│
workers/inngest/
└── functions/
    └── billing/
        ├── process-stripe-webhook.ts       # Main webhook processor
        ├── handle-subscription-created.ts
        ├── handle-subscription-updated.ts
        ├── handle-subscription-deleted.ts
        ├── handle-invoice-payment-succeeded.ts
        ├── handle-invoice-payment-failed.ts
        ├── handle-trial-will-end.ts
        ├── handle-checkout-completed.ts
        └── send-billing-notifications.ts

packages/types/
└── schemas/
    └── billing.ts                          # Billing Zod schemas

components/
└── billing/                                # Shared billing components
    ├── plan-badge.tsx
    ├── upgrade-cta.tsx
    ├── subscription-status-badge.tsx
    └── usage-progress.tsx
```

### 14.2 Import Patterns

```typescript
// Server Actions (callable from Client Components)
import { createCheckoutSession } from '@/server/actions/billing'

// Services (server-side only)
import { getEntitlements } from '@/server/lib/entitlements'

// Stripe provider (server-side only)
import { stripe } from '@/server/providers/stripe/client'

// Shared types
import { type ActionResult } from '@dearme/types'

// Components
import { PlanBadge } from '@/components/billing/plan-badge'
```

### 14.3 Naming Conventions

- **Files**: kebab-case (`billing-helpers.ts`)
- **Components**: PascalCase files (`UpgradeModal.tsx`)
- **Functions**: camelCase (`getEntitlements`)
- **Types/Interfaces**: PascalCase (`Entitlements`, `SubscriptionStatus`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LETTERS_FREE_TIER`)

---

## 15. Admin Billing Dashboard

### 15.1 Revenue Metrics

**File**: `apps/web/server/lib/billing-metrics.ts`

```typescript
export async function getBillingMetrics() {
  const cached = await redis.get('billing:metrics')
  if (cached) return JSON.parse(cached)

  const [
    activeSubscriptions,
    trialSubscriptions,
    canceledThisMonth,
    newThisMonth,
    revenueHistory
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: 'active' }}),
    prisma.subscription.count({ where: { status: 'trialing' }}),
    prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: { gte: startOfMonth(new Date()) }
      }
    }),
    prisma.subscription.count({
      where: { createdAt: { gte: startOfMonth(new Date()) }}
    }),
    prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        SUM(amount_cents) / 100 as revenue
      FROM payments
      WHERE status = 'succeeded'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `
  ])

  const pricePerMonth = 9
  const mrr = activeSubscriptions * pricePerMonth
  const arr = mrr * 12

  const activeAtStartOfMonth = activeSubscriptions + canceledThisMonth - newThisMonth
  const churnRate = (canceledThisMonth / activeAtStartOfMonth) * 100

  const metrics = {
    mrr,
    arr,
    activeSubscriptions,
    trialSubscriptions,
    churnRate: churnRate.toFixed(2),
    trialConversionRate: '0.00', // TODO: Calculate
    failedPaymentsCount: await getFailedPaymentsCount(),
    revenueHistory
  }

  await redis.setex('billing:metrics', 300, JSON.stringify(metrics))

  return metrics
}
```

### 15.2 Dashboard Page

**File**: `apps/web/app/admin/billing/page.tsx`

```tsx
export default async function BillingDashboardPage() {
  await requireAdmin()

  const metrics = await getBillingMetrics()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Billing Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          title="MRR"
          value={formatCurrency(metrics.mrr)}
          trend="+12%"
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
        />
        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate}%`}
        />
        <MetricCard
          title="Trial Conversion"
          value={`${metrics.trialConversionRate}%`}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={metrics.revenueHistory} />

      {/* Recent Activity */}
      <RecentSubscriptions limit={10} />
      <FailedPaymentsAlert count={metrics.failedPaymentsCount} />
    </div>
  )
}
```

### 15.3 Customer Management

Server action for admin operations:

```typescript
export async function updateCustomerSubscription(
  customerId: string,
  action: 'cancel' | 'reactivate' | 'refund'
) {
  await requireAdmin()

  const customer = await prisma.profile.findUnique({
    where: { stripeCustomerId: customerId },
    include: { user: { include: { subscriptions: true }}}
  })

  if (!customer) {
    return { success: false, error: { code: 'CUSTOMER_NOT_FOUND' }}
  }

  const subscription = customer.user.subscriptions[0]

  switch (action) {
    case 'cancel':
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      break
    case 'reactivate':
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      })
      break
    case 'refund':
      const lastPayment = await prisma.payment.findFirst({
        where: { userId: customer.userId, status: 'succeeded' },
        orderBy: { createdAt: 'desc' }
      })

      if (lastPayment?.stripePaymentIntentId) {
        await stripe.refunds.create({
          payment_intent: lastPayment.stripePaymentIntentId
        })
      }
      break
  }

  await createAuditEvent({
    userId: null,
    type: 'admin.subscription.updated',
    data: { customerId, action, adminId: await getCurrentAdmin() }
  })

  return { success: true }
}
```

---

## 16. Critical Data Flows

### 16.1 New User Subscription Flow

```
User                Next.js            Stripe            Webhook          Inngest
  │                   │                   │                 │                │
  │ 1. Click        │                   │                 │                │
  │ "Upgrade"       │                   │                 │                │
  ├────────────────>│                   │                 │                │
  │                   │ 2. Check        │                 │                │
  │                   │ existing sub    │                 │                │
  │                   │                   │                 │                │
  │                   │ 3. Create       │                 │                │
  │                   │ checkout        │                 │                │
  │                   ├──────────────────>│                 │                │
  │                   │                   │                 │                │
  │                   │ 4. Return       │                 │                │
  │                   │ session URL     │                 │                │
  │                   │<──────────────────┤                 │                │
  │                   │                   │                 │                │
  │ 5. Redirect      │                   │                 │                │
  │<─────────────────│                   │                 │                │
  ├──────────────────────────────────────>│                 │                │
  │                   │                   │                 │                │
  │ 6. Enter         │                   │                 │                │
  │ payment          │                   │                 │                │
  │                   │                   │                 │                │
  │ 7. Submit        │                   │                 │                │
  ├──────────────────────────────────────>│                 │                │
  │                   │                   │                 │                │
  │                   │                   │ 8. Webhook:     │                │
  │                   │                   │ subscription    │                │
  │                   │                   │ .created        │                │
  │                   │                   ├────────────────>│                │
  │                   │                   │                 │                │
  │                   │                   │                 │ 9. Queue to   │
  │                   │                   │                 │ Inngest       │
  │                   │                   │                 ├───────────────>│
  │                   │                   │                 │                │
  │                   │                   │ 10. Return      │                │
  │                   │                   │ 200 OK          │                │
  │                   │                   │<────────────────┤                │
  │                   │                   │                 │                │
  │                   │                   │                 │ 11. Process   │
  │                   │                   │                 │ (create sub)  │
  │                   │                   │                 │                │
  │                   │                   │                 │ 12. Invalidate│
  │                   │                   │                 │ cache         │
  │                   │                   │                 │                │
  │ 13. Redirect     │                   │                 │                │
  │ to success       │                   │                 │                │
  │<─────────────────────────────────────│                 │                │
  ├────────────────>│                   │                 │                │
  │                   │ 14. Poll for    │                 │                │
  │                   │ subscription    │                 │                │
  │                   │                   │                 │                │
  │                   │ 15. Return      │                 │                │
  │                   │ success page    │                 │                │
  │<─────────────────│                   │                 │                │
```

### 16.2 Subscription Enforcement Flow

```
User Action      Server Action     Entitlements     Redis        Database
    │                │                 │               │              │
    │ 1. Schedule   │                 │               │              │
    │ Delivery      │                 │               │              │
    ├──────────────>│                 │               │              │
    │                │ 2. Get          │               │              │
    │                │ entitlements    │               │              │
    │                ├────────────────>│               │              │
    │                │                 │ 3. Check      │              │
    │                │                 │ cache         │              │
    │                │                 ├──────────────>│              │
    │                │                 │               │              │
    │                │                 │ 4. Cache miss │              │
    │                │                 │<──────────────┤              │
    │                │                 │               │              │
    │                │                 │ 5. Query      │              │
    │                │                 │ subscription  │              │
    │                │                 ├───────────────────────────>│
    │                │                 │               │              │
    │                │                 │ 6. Return     │              │
    │                │                 │<───────────────────────────┤
    │                │                 │               │              │
    │                │                 │ 7. Cache      │              │
    │                │                 │ (5min TTL)    │              │
    │                │                 ├──────────────>│              │
    │                │                 │               │              │
    │                │ 8. Check plan   │               │              │
    │                │<────────────────┤               │              │
    │                │                 │               │              │
    │                │ [IF FREE]       │               │              │
    │ 9. Return     │                 │               │              │
    │ PAYMENT_      │                 │               │              │
    │ REQUIRED      │                 │               │              │
    │<───────────────                 │               │              │
    │                │ [IF PRO]        │               │              │
    │                │ 10. Continue    │               │              │
    │                │ with delivery   │               │              │
    │ 11. Success   │                 │               │              │
    │<───────────────                 │               │              │
```

### 16.3 Failed Payment Dunning Flow

```
Stripe         Webhook        Inngest        Email          Customer
  │              │              │              │                │
  │ 1. Payment   │              │              │                │
  │ fails        │              │              │                │
  ├─────────────>│              │              │                │
  │              │              │              │                │
  │              │ 2. Trigger   │              │                │
  │              │ dunning job  │              │                │
  │              ├─────────────>│              │                │
  │              │              │              │                │
  │              │              │ DAY 0:       │                │
  │              │              │ 3. Send      │                │
  │              │              │ notification │                │
  │              │              ├─────────────>│                │
  │              │              │              ├───────────────>│
  │              │              │              │                │
  │              │              │ 4. Sleep 3d  │                │
  │              │              │              │                │
  │              │              │ DAY 3:       │                │
  │              │              │ 5. Send      │                │
  │              │              │ urgent       │                │
  │              │              ├─────────────>│                │
  │              │              │              ├───────────────>│
  │              │              │              │                │
  │              │              │ 6. Sleep 4d  │                │
  │              │              │              │                │
  │              │              │ DAY 7:       │                │
  │              │              │ 7. Send      │                │
  │              │              │ final warn   │                │
  │              │              ├─────────────>│                │
  │              │              │              ├───────────────>│
  │              │              │              │                │
  │              │              │ 8. Sleep 3d  │                │
  │              │              │              │                │
  │              │              │ DAY 10:      │                │
  │              │              │ 9. Cancel    │                │
  │              │              │ subscription │                │
  │              │              │              │                │
  │              │              │ 10. Send     │                │
  │              │              │ canceled     │                │
  │              │              ├─────────────>│                │
  │              │              │              ├───────────────>│
```

---

## 17. Performance & Scalability

### 17.1 Target Metrics

- **Capacity**: 10,000+ active subscriptions
- **Throughput**: 100+ checkout sessions/minute, 500+ webhooks/minute
- **Latency**: <50ms p95 entitlement checks, <500ms p95 checkout creation

### 17.2 Optimization Strategies

**Database Layer**:
- Connection pooling via PgBouncer (100 connections)
- Read replicas for analytics queries
- Optimized indexes on hot paths
- Query batching for admin dashboard

**Caching Layer**:
- Redis for entitlements (5min TTL)
- Metrics aggregation caching
- LRU eviction policy (1GB max)

**Application Layer**:
- Vercel auto-scaling
- Edge functions for static content
- Server Actions for dynamic operations
- Streaming for large responses

**Async Processing**:
- Inngest for webhooks, emails, background jobs
- Automatic concurrency control
- Dead letter queue for failures

### 17.3 Load Testing

```javascript
// k6 load test script
export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
}
```

### 17.4 Capacity Planning

For 10,000 active subscriptions:
- **Database**: ~100k queries/day (mostly reads, cached)
- **Redis**: ~1M cache requests/day
- **Webhooks**: ~50k events/month
- **Stripe API**: ~100k requests/month

**Cost Estimates**:
- Neon Postgres: $20/month
- Upstash Redis: $10/month
- Vercel: $20/month
- Inngest: Free (<1M steps/month)
- Stripe: 2.9% + $0.30 per transaction

---

## 18. Risk Assessment

### 18.1 Risk Matrix

| Risk | Likelihood | Impact | Priority | Mitigation |
|------|-----------|--------|----------|------------|
| R1: Webhook Processing Failures | High | High | Urgent | Async processing via Inngest, DLQ, daily reconciliation |
| R2: Payment Fraud | Medium | Critical | Urgent | Stripe Radar, 3D Secure, rate limiting |
| R3: Entitlements Cache Stale | High | Medium | Mitigate | 5min TTL, webhook invalidation |
| R4: Stripe API Outage | Medium | Critical | Urgent | Retry logic, queue checkouts, SLA 99.99% |
| R5: Race Condition (Usage) | High | Medium | Mitigate | Atomic operations, pessimistic locking |
| R6: Subscription Desync | Medium | High | Mitigate | Daily reconciliation, admin tools |
| R7: Checkout Abandonment | High | Low | Monitor | Abandoned cart emails, UX optimization |
| R8: Email Notifications Missed | Medium | Medium | Monitor | Inngest retries, in-app notifications |
| R9: GDPR Violation | Medium | High | Mitigate | Automated retention, export/delete flows |
| R10: API Key Exposure | Low | Medium | Monitor | Never commit, quarterly rotation |

### 18.2 Mitigation Summary

**High Priority Risks** (R1, R2, R4):
- Comprehensive monitoring and alerting
- Automatic retries and failover
- Dependency on Stripe's 99.99% SLA

**Medium Priority Risks** (R3, R5, R6, R8, R9):
- Technical controls (caching, atomic ops, reconciliation)
- Process controls (GDPR compliance, audit logging)

**Low Priority Risks** (R7, R10):
- Accept as business-as-usual
- Monitor and optimize over time

### 18.3 Contingency Plans

1. **Stripe Outage**: Queue checkout attempts, process when restored
2. **Webhook Failures**: Manual reconciliation script, customer support
3. **Payment Fraud**: Temporarily disable signups, manual review
4. **Database Failure**: Read-only mode, Neon automatic failover

---

## Appendices

### A. Environment Variables

**Required**:
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx

# Database
DATABASE_URL=postgresql://xxx

# Auth
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Jobs
INNGEST_SIGNING_KEY=signkey-prod-xxx
INNGEST_EVENT_KEY=xxx

# Cache
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Email
RESEND_API_KEY=re_xxx

# Cron
CRON_SECRET=random_secret_string

# Encryption
CRYPTO_MASTER_KEY=base64_encoded_32_bytes
```

### B. Stripe Dashboard Configuration

1. **Products & Prices**:
   - Create "Pro" product
   - Create monthly price ($9/month)
   - Create annual price ($90/year)
   - Note price IDs for environment variables

2. **Customer Portal**:
   - Enable subscription cancellation
   - Enable payment method update
   - Enable invoice history
   - Configure branding (logo, colors)

3. **Webhooks**:
   - Add endpoint: `https://dearme.app/api/webhooks/stripe`
   - Select all subscription, invoice, payment events
   - Note webhook secret for environment

4. **Tax Settings** (Optional):
   - Enable Stripe Tax
   - Configure tax jurisdictions

### C. Glossary

- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **ARPU**: Average Revenue Per User
- **SLO**: Service Level Objective
- **DLQ**: Dead Letter Queue
- **PCI DSS**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation
- **Entitlements**: Set of features/permissions a user has based on subscription
- **Dunning**: Automated process for recovering failed payments

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | Claude Code | Initial comprehensive design |

---

**End of Document**

This design is production-ready and addresses all requirements identified in the analysis. Implementation can proceed with confidence.
