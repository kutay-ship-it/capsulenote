# Entitlements Service - Quick Start Guide

## Import and Use

```typescript
import {
  getEntitlements,
  checkFeatureAccess,
  trackLetterCreation,
  deductMailCredit,
  QuotaExceededError
} from '@/server/lib/entitlements'
```

## Common Patterns

### 1. Check Feature Access in Server Actions

```typescript
// apps/web/server/actions/deliveries.ts
import { getEntitlements } from '@/server/lib/entitlements'

export async function scheduleDelivery(input: unknown) {
  const user = await requireUser()

  // Get full entitlements
  const entitlements = await getEntitlements(user.id)

  // Check feature access
  if (!entitlements.features.canScheduleDeliveries) {
    return {
      success: false,
      error: {
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Scheduling requires Pro subscription',
        details: {
          currentPlan: entitlements.plan,
          requiredPlan: 'pro',
          upgradeUrl: '/pricing'
        }
      }
    }
  }

  // Check mail credits if physical mail
  if (input.channel === 'mail') {
    if (entitlements.limits.mailCreditsExhausted) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: 'No mail credits remaining'
        }
      }
    }

    // Deduct credit
    await deductMailCredit(user.id)
  }

  // Proceed with delivery creation...
}
```

### 2. Quick Boolean Feature Check

```typescript
// For simple yes/no checks
const canSchedule = await checkFeatureAccess(user.id, 'canScheduleDeliveries')

if (!canSchedule) {
  throw new Error('Pro subscription required')
}
```

### 3. Display Entitlements in UI

```typescript
// Server Component (apps/web/app/dashboard/page.tsx)
import { getEntitlements } from '@/server/lib/entitlements'

export default async function DashboardPage() {
  const user = await requireUser()
  const entitlements = await getEntitlements(user.id)

  return (
    <div>
      <h1>Dashboard</h1>
      <UsageWidget entitlements={entitlements} />

      {entitlements.trialInfo && (
        <TrialBanner daysRemaining={entitlements.trialInfo.daysRemaining} />
      )}

      {entitlements.plan === 'none' && (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

### 4. Track Usage After Actions

```typescript
// After creating a letter
export async function createLetter(input: unknown) {
  const user = await requireUser()

  // Check if user can create letter
  const entitlements = await getEntitlements(user.id)
  if (!entitlements.features.canCreateLetters) {
    throw new QuotaExceededError('letters', 5, entitlements.usage.lettersThisMonth)
  }

  // Create letter
  const letter = await prisma.letter.create({
    data: { userId: user.id, ... }
  })

  // Track usage (for Pro users)
  await trackLetterCreation(user.id)

  return { success: true, data: letter }
}
```

### 5. Handle Quota Errors in UI

```typescript
// Client Component (apps/web/components/new-letter-form.tsx)
'use client'

import { createLetter } from '@/server/actions/letters'
import { QuotaExceededError } from '@/server/lib/entitlements'

export function NewLetterForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: FormData) {
    try {
      await createLetter(data)
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        setError(`You've reached your ${err.quotaType} limit (${err.limit})`)
        // Show upgrade modal
      } else {
        setError('Failed to create letter')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}
      {/* form fields */}
    </form>
  )
}
```

### 6. Invalidate Cache After Subscription Update

```typescript
// Webhook handler (Phase 1)
import { invalidateEntitlementsCache } from '@/server/lib/entitlements'

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription

  // Update database
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: subscription.status, ... }
  })

  // Invalidate cache so next request gets fresh data
  await invalidateEntitlementsCache(userId)
}
```

## Feature Access Reference

### Free Tier
- ❌ `canCreateLetters`: Only if < 5 letters this month
- ❌ `canScheduleDeliveries`: false
- ❌ `canSchedulePhysicalMail`: false
- 📊 `maxLettersPerMonth`: 5
- 📧 `emailDeliveriesIncluded`: 0
- 📮 `mailCreditsPerMonth`: 0

### Pro Tier
- ✅ `canCreateLetters`: true
- ✅ `canScheduleDeliveries`: true
- ✅ `canSchedulePhysicalMail`: true
- 📊 `maxLettersPerMonth`: 'unlimited'
- 📧 `emailDeliveriesIncluded`: 'unlimited'
- 📮 `mailCreditsPerMonth`: 2

## Entitlements Object Structure

```typescript
interface Entitlements {
  userId: string
  plan: 'free' | 'pro' | 'enterprise' | 'none'
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'none'

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
```

## Performance Notes

- **Cache Hit:** <10ms (Redis GET)
- **Cache Miss:** <50ms (database query + Redis SET)
- **Cache TTL:** 5 minutes (automatic)
- **Cache Key:** `entitlements:${userId}`

## Error Handling

```typescript
// QuotaExceededError properties
error.quotaType  // 'letters' | 'emails' | 'mail_credits'
error.limit      // The quota limit (e.g., 5)
error.current    // Current usage (e.g., 5)
error.message    // "Quota exceeded for letters: 5/5"
```

## Testing

```typescript
// Mock for tests
jest.mock('@/server/lib/entitlements', () => ({
  getEntitlements: jest.fn().mockResolvedValue({
    userId: 'test-user',
    plan: 'pro',
    status: 'active',
    features: {
      canCreateLetters: true,
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: true,
      maxLettersPerMonth: 'unlimited',
      emailDeliveriesIncluded: 'unlimited',
      mailCreditsPerMonth: 2
    },
    usage: {
      lettersThisMonth: 10,
      emailsThisMonth: 5,
      mailCreditsRemaining: 2
    },
    limits: {
      lettersReached: false,
      emailsReached: false,
      mailCreditsExhausted: false
    }
  })
}))
```

## Troubleshooting

**Cache not invalidating?**
- Check Redis connection: `await redis.ping()`
- Verify cache key format: `entitlements:${userId}`
- Confirm `invalidateEntitlementsCache()` called after updates

**Free tier showing wrong usage?**
- Free tier counts actual `Letter` records, not cached
- Check `deletedAt IS NULL` filter in query

**Pro tier credits not resetting?**
- Credits reset at billing period start (monthly)
- Check `SubscriptionUsage.period` matches current month
- Verify upsert creates record with `mailCredits: 2`
