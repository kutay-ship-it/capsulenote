# Usage Tracking Quick Reference

Quick reference guide for the DearMe usage tracking system.

## Core Concepts

### Subscription Plans
- **Free**: 5 letters/month, no deliveries, no mail credits
- **Pro**: Unlimited letters/emails, 2 mail credits/month
- **Enterprise**: Unlimited letters/emails, 10 mail credits/month

### Usage Tracking
- **Pro/Enterprise**: Tracked in `subscription_usage` table
- **Free Tier**: Count actual `Letter` records (no table overhead)
- **Reset**: Monthly at billing period start

## API Reference

### Check Entitlements

```typescript
import { getEntitlements } from '@/server/lib/entitlements'

const entitlements = await getEntitlements(userId)

// Check access
if (!entitlements.features.canScheduleDeliveries) {
  return { error: 'Pro subscription required' }
}

// Check quota
if (entitlements.limits.lettersReached) {
  return { error: 'Monthly letter limit reached' }
}

// Check credits
if (entitlements.limits.mailCreditsExhausted) {
  return { error: 'No mail credits remaining' }
}
```

### Track Usage

```typescript
import {
  trackLetterCreation,
  trackEmailDelivery,
  deductMailCredit
} from '@/server/lib/entitlements'

// After creating letter
await trackLetterCreation(userId)

// After scheduling email
await trackEmailDelivery(userId)

// After scheduling physical mail
await deductMailCredit(userId) // Throws if no credits
```

### Usage Metrics

```typescript
import {
  getUserMonthlyUsageSummary,
  getRemainingQuota,
  getUsageByPeriod,
  isNearingQuota
} from '@/server/lib/usage-metrics'

// Get full summary
const summary = await getUserMonthlyUsageSummary(userId)
console.log(`Letters: ${summary.usage.lettersCreated}/${summary.limits.maxLetters}`)
console.log(`Utilization: ${summary.utilization.lettersPercent}%`)

// Quick quota check
const quota = await getRemainingQuota(userId)
console.log(`Remaining: ${quota.letters} letters, ${quota.mailCredits} mail credits`)
console.log(`Resets: ${quota.periodEndsAt.toLocaleDateString()}`)

// Historical data (last 6 months)
const history = await getUsageByPeriod(userId, 6)

// Check if nearing limit (80% threshold)
const warning = await isNearingQuota(userId, 0.8)
if (warning) {
  showWarning('Approaching monthly limit')
}
```

### Invalidate Cache

```typescript
import { invalidateEntitlementsCache } from '@/server/lib/entitlements'

// Call after:
// - Subscription status change
// - Plan upgrade/downgrade
// - Manual credit adjustment
await invalidateEntitlementsCache(userId)
```

## Database Schema

### SubscriptionUsage Table

```sql
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  period TIMESTAMPTZ NOT NULL,        -- Billing period start (UTC)
  letters_created INT DEFAULT 0,       -- Letters created this period
  emails_sent INT DEFAULT 0,           -- Emails delivered this period
  mails_sent INT DEFAULT 0,            -- Physical mails sent this period
  mail_credits INT DEFAULT 0,          -- Remaining mail credits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, period)
);

CREATE INDEX idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period);
```

### Atomic Operations

```typescript
// Increment counter (race-safe)
await prisma.subscriptionUsage.update({
  where: { userId_period: { userId, period } },
  data: {
    lettersCreated: { increment: 1 }
  }
})

// Decrement with check (prevents negative)
await prisma.subscriptionUsage.update({
  where: {
    userId_period: { userId, period },
    mailCredits: { gte: 1 } // Only if available
  },
  data: {
    mailCredits: { decrement: 1 }
  }
})
```

## Cron Jobs

### Rollover Usage (Daily at Midnight UTC)

**Endpoint**: `/api/cron/rollover-usage`
**Schedule**: `0 0 * * *`

```bash
# Manual trigger
curl -X GET https://dearme.app/api/cron/rollover-usage \
  -H "Authorization: Bearer $CRON_SECRET"
```

**What it does**:
1. Finds subscriptions with periods ending today
2. Creates new usage records for next period
3. Resets counters to 0
4. Replenishes mail credits

**Monitoring**:
- Processing time: <30s target
- Error rate: <5% target
- Alert if thresholds exceeded

### Reconcile Deliveries (Every 5 Minutes)

**Endpoint**: `/api/cron/reconcile-deliveries`
**Schedule**: `*/5 * * * *`

```bash
# Manual trigger
curl -X GET https://dearme.app/api/cron/reconcile-deliveries \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Common Patterns

### Pre-Operation Check

```typescript
export async function createLetter(input: unknown) {
  const user = await requireUser()
  const entitlements = await getEntitlements(user.id)

  // Check quota
  if (!entitlements.features.canCreateLetters) {
    return {
      success: false,
      error: {
        code: 'QUOTA_EXCEEDED',
        message: `Free plan limit reached (${entitlements.features.maxLettersPerMonth} letters/month)`
      }
    }
  }

  // Create letter
  const letter = await prisma.letter.create({ /* ... */ })

  // Track usage (non-blocking)
  try {
    await trackLetterCreation(user.id)
  } catch (error) {
    // Log but don't fail operation
    console.error('Failed to track usage:', error)
  }

  return { success: true, data: { letterId: letter.id } }
}
```

### Usage Display Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

export function UsageIndicator({ userId }: { userId: string }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    fetch(`/api/usage/${userId}`)
      .then(r => r.json())
      .then(setUsage)
  }, [userId])

  if (!usage) return <div>Loading...</div>

  const { lettersCreated, maxLetters, utilization } = usage

  return (
    <div>
      <p>Letters this month: {lettersCreated}/{maxLetters}</p>
      <Progress value={utilization.lettersPercent} />
      {utilization.lettersPercent >= 80 && (
        <p className="text-amber-500">Approaching monthly limit</p>
      )}
    </div>
  )
}
```

## Error Handling

### QuotaExceededError

```typescript
import { QuotaExceededError } from '@/server/lib/entitlements'

try {
  await deductMailCredit(userId)
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // Show upgrade prompt or charge $3
    return {
      error: {
        code: 'INSUFFICIENT_CREDITS',
        message: 'No mail credits remaining',
        details: {
          action: 'purchase_credits',
          price: 300 // $3.00 in cents
        }
      }
    }
  }
  throw error
}
```

## Performance Optimization

### Redis Caching

```typescript
// Entitlements cached for 5 minutes
const entitlements = await getEntitlements(userId)
// First call: Database query (~50ms)
// Cached calls: Redis read (~5ms)

// Invalidate after changes
await invalidateEntitlementsCache(userId)
```

### Database Indexes

```sql
-- Efficient queries
CREATE INDEX idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period);
CREATE INDEX idx_letters_created_at ON letters(user_id, created_at, deleted_at);
```

## Testing

### Unit Tests

```typescript
describe('Usage Tracking', () => {
  it('should track letter creation', async () => {
    await trackLetterCreation(userId)
    const usage = await getCurrentUsage(userId)
    expect(usage.lettersCreated).toBe(1)
  })

  it('should throw when mail credits exhausted', async () => {
    await expect(deductMailCredit(userId)).rejects.toThrow(QuotaExceededError)
  })

  it('should handle concurrent requests safely', async () => {
    await Promise.all([
      deductMailCredit(userId),
      deductMailCredit(userId)
    ])
    // Only one should succeed
    const usage = await getCurrentUsage(userId)
    expect(usage.mailsSent).toBe(1)
  })
})
```

### Integration Tests

```typescript
describe('Rollover Cron Job', () => {
  it('should replenish credits on rollover', async () => {
    await GET(request) // Trigger cron job
    const usage = await getCurrentUsage(userId)
    expect(usage.mailCredits).toBe(2) // Pro plan
  })
})
```

## Monitoring

### Metrics to Track

```typescript
// Daily rollover metrics
{
  totalProcessed: 1250,
  successCount: 1248,
  errorCount: 2,
  errorRate: 0.16,
  processingTimeMs: 18543
}

// Usage statistics
{
  totalLetters: 125000,
  totalEmails: 98000,
  totalMails: 4200,
  uniqueUsers: 2450,
  avgLettersPerUser: 51,
  creditUtilization: 68 // % of free credits used
}
```

### Alert Thresholds

- **Processing time >30s**: Optimize or scale
- **Error rate >5%**: Investigate failures
- **Reconciliation rate >0.1%**: Primary job system issues
- **Credit exhaustion >50%**: Consider increasing allocation

## Troubleshooting

### Issue: Usage not updating

**Check**:
1. Redis cache TTL (5 minutes)
2. Invalidate cache after manual updates
3. Verify cron job is running

**Fix**:
```typescript
await invalidateEntitlementsCache(userId)
```

### Issue: Rollover not running

**Check**:
1. Vercel Cron enabled
2. `CRON_SECRET` set in environment
3. Check Vercel logs for errors

**Fix**:
```bash
# Manual trigger
curl -H "Authorization: Bearer $CRON_SECRET" \
     https://dearme.app/api/cron/rollover-usage
```

### Issue: Negative mail credits

**Cause**: Race condition or manual DB edit

**Prevention**: Atomic operations with `{ gte: 1 }` check

**Fix**:
```sql
-- Reset to correct value
UPDATE subscription_usage
SET mail_credits = 2
WHERE user_id = '...' AND mail_credits < 0;
```

## References

- Full Documentation: `claudedocs/PHASE_3_USAGE_TRACKING_IMPLEMENTATION_SUMMARY.md`
- Mail Credit Flow: `claudedocs/MAIL_CREDIT_PURCHASE_FLOW.md`
- Entitlements Service: `apps/web/server/lib/entitlements.ts`
- Usage Metrics: `apps/web/server/lib/usage-metrics.ts`
- Rollover Cron Job: `apps/web/app/api/cron/rollover-usage/route.ts`
