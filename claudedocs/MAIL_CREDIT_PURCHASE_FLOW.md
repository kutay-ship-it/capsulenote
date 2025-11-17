# Mail Credit Purchase Flow

## Overview

Physical mail delivery system using a hybrid model:
- **Pro Plan**: 2 free mail credits per month (replenished monthly)
- **Additional Mails**: Pay-as-you-go at $3.00 per mail
- **No Upfront Purchase**: Credits charged automatically when needed

## Architecture

### Monthly Allocation

**Pro Subscribers**:
- Receive 2 mail credits at start of each billing period
- Credits reset monthly (do not roll over)
- Usage tracked in `subscription_usage` table

**Free Tier**:
- No mail credits included
- Cannot schedule physical mail deliveries
- Must upgrade to Pro to access physical mail

### Pay-As-You-Go System

When a Pro user schedules physical mail delivery:

1. **Check Credits** (`apps/web/server/lib/entitlements.ts`):
   ```typescript
   const entitlements = await getEntitlements(user.id)
   if (entitlements.limits.mailCreditsExhausted) {
     // Show upgrade prompt or charge $3
   }
   ```

2. **Deduct Credit** (if available):
   ```typescript
   await deductMailCredit(user.id)
   // Decrements mailCredits in subscription_usage
   // Increments mailsSent counter
   ```

3. **Charge for Additional** (future implementation):
   ```typescript
   if (mailCreditsRemaining === 0) {
     // Create Stripe PaymentIntent for $3.00
     const paymentIntent = await stripe.paymentIntents.create({
       amount: 300, // $3.00 in cents
       currency: 'usd',
       customer: user.stripeCustomerId,
       description: 'Physical mail delivery',
       metadata: {
         deliveryId: delivery.id,
         userId: user.id,
         letterId: letter.id
       }
     })

     // Confirm payment automatically (saved payment method)
     await stripe.paymentIntents.confirm(paymentIntent.id)
   }
   ```

## Database Schema

### Subscription Usage Table

```sql
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  period TIMESTAMPTZ NOT NULL, -- Billing period start
  letters_created INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  mails_sent INT DEFAULT 0,
  mail_credits INT DEFAULT 0, -- Remaining credits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, period)
);
```

### Mail Credits Lifecycle

**Period Start** (via cron job):
```typescript
// apps/web/app/api/cron/rollover-usage/route.ts
await prisma.subscriptionUsage.create({
  data: {
    userId: user.id,
    period: startOfMonth,
    mailCredits: 2 // Pro plan allocation
  }
})
```

**Credit Deduction** (on mail delivery):
```typescript
// apps/web/server/lib/entitlements.ts
await prisma.subscriptionUsage.update({
  where: { userId_period: { userId, period } },
  data: {
    mailsSent: { increment: 1 },
    mailCredits: { decrement: 1 }
  }
})
```

**Manual Credit Addition** (purchase/refund):
```typescript
// apps/web/server/lib/entitlements.ts
await addMailCredits(userId, count)
// Increments mailCredits atomically
```

## User Experience

### Scheduling Physical Mail

**With Credits Available**:
```
1. User selects "Physical Mail" delivery
2. System checks: mailCreditsRemaining > 0
3. Delivery scheduled immediately
4. Credit deducted after successful scheduling
5. User sees: "2 of 2 mail credits used this month"
```

**Without Credits (Future)**:
```
1. User selects "Physical Mail" delivery
2. System checks: mailCreditsRemaining === 0
3. Show confirmation dialog:
   "You've used your 2 free mails this month.
    Additional mails cost $3.00 each.
    Confirm to charge your saved payment method."
4. User confirms → Stripe PaymentIntent created
5. Payment succeeds → Delivery scheduled
6. User sees receipt and delivery confirmation
```

**Without Pro Subscription**:
```
1. User selects "Physical Mail" delivery
2. System checks: plan === 'none'
3. Show upgrade prompt:
   "Physical mail requires Pro subscription ($X/month).
    Includes 2 free mails/month + unlimited letters & emails."
4. Redirect to /pricing
```

## Pricing Structure

| Plan | Mail Credits | Additional Mails | Cost per Mail |
|------|--------------|------------------|---------------|
| Free | 0 | Not available | N/A |
| Pro | 2/month | Pay-as-you-go | $3.00 |
| Enterprise | 10/month | Pay-as-you-go | $2.50 |

## Implementation Status

### ✅ Completed (Phase 3)

- [x] Usage tracking in `entitlements.ts`
- [x] Credit deduction with atomic operations
- [x] Monthly rollover cron job
- [x] Database schema and migrations
- [x] Entitlements API with quota checks

### 🟡 Partially Completed

- [ ] UI for credit balance display (schema ready)
- [ ] Usage indicators in settings (components exist)

### ❌ Not Started

- [ ] Stripe PaymentIntent creation for additional mails
- [ ] Confirmation dialog for pay-as-you-go charges
- [ ] Payment receipt generation
- [ ] Refund flow for failed deliveries
- [ ] Bulk credit purchase option (discount)

## Edge Cases

### 1. Credit Exhaustion Mid-Month

**Scenario**: User uses both free credits, wants to send 3rd mail

**Behavior**:
- Current: Show error "No mail credits remaining"
- Future: Offer $3 charge with confirmation

### 2. Subscription Cancellation

**Scenario**: User cancels Pro during billing period

**Behavior**:
- Credits remain valid until period end
- New period: no credits allocated (subscription inactive)

### 3. Subscription Upgrade

**Scenario**: Free user upgrades to Pro mid-month

**Behavior**:
- Create usage record immediately
- Allocate full 2 credits (no pro-rating)
- Credits valid until end of current month

### 4. Failed Payment (Dunning)

**Scenario**: Subscription payment fails, enters grace period

**Behavior**:
- Keep credits active during grace period (7 days)
- If subscription canceled: revoke remaining credits
- No refunds for unused credits

### 5. Concurrent Mail Scheduling

**Scenario**: User schedules 2 mails simultaneously with 1 credit remaining

**Behavior**:
- First request: succeeds, credit deducted
- Second request: fails with "No credits remaining"
- Database lock prevents race condition

**Implementation**:
```typescript
// Atomic decrement prevents race condition
await prisma.subscriptionUsage.update({
  where: {
    userId_period: { userId, period },
    mailCredits: { gte: 1 } // Only update if credits available
  },
  data: {
    mailCredits: { decrement: 1 }
  }
})
```

### 6. Delivery Failure

**Scenario**: Mail delivery fails (Lob/ClickSend error)

**Behavior**:
- Automatic refund: add credit back
- Log failure reason
- Notify user with retry option

```typescript
// In delivery failure handler
await addMailCredits(userId, 1)
await createAuditEvent({
  type: 'mail_delivery.failed_refunded',
  data: { deliveryId, reason, creditRefunded: 1 }
})
```

## Security Considerations

### 1. Credit Tampering Prevention

- All credit operations use atomic database increments
- No client-side credit calculations
- Server-side validation before every deduction

### 2. Payment Intent Idempotency

```typescript
const idempotencyKey = `mail-delivery-${deliveryId}-${attemptCount}`

await stripe.paymentIntents.create({
  amount: 300,
  currency: 'usd',
  // ... other params
}, {
  idempotencyKey
})
```

### 3. Fraud Prevention

- Rate limiting: max 10 mails/day per user
- Suspicious activity detection: >20 mails/month
- Address verification before delivery
- Webhook validation for all Stripe events

## Monitoring & Alerts

### Metrics to Track

```typescript
// Monthly reports
{
  totalMailsDelivered: number,
  freeMailsUsed: number,
  paidMailsUsed: number,
  revenueFromAdditionalMails: number,
  averageMailsPerProUser: number,
  creditUtilization: number // % of free credits used
}
```

### Alert Thresholds

- **Credit exhaustion rate > 50%**: Consider increasing free allocation
- **Pay-as-you-go conversion < 5%**: Price may be too high
- **Failed payment rate > 2%**: Payment flow issues
- **Refund rate > 5%**: Delivery reliability concerns

## Future Enhancements

### 1. Credit Bundles (Discounts)

```typescript
const creditBundles = [
  { count: 5, price: 1400, perCredit: 280 }, // $2.80/mail (7% off)
  { count: 10, price: 2700, perCredit: 270 }, // $2.70/mail (10% off)
  { count: 25, price: 6250, perCredit: 250 }  // $2.50/mail (17% off)
]
```

### 2. Rollover Credits (Premium Feature)

- Enterprise plan: unused credits roll over (max 10)
- Expire after 3 months
- Tracked in separate `rollover_credits` column

### 3. Gift Credits

- Allow users to gift mail credits
- Generate unique gift codes
- Track attribution for referral programs

### 4. Subscription Tiers with More Credits

```typescript
const subscriptionPlans = {
  pro: { price: 900, mailCredits: 2 },
  pro_plus: { price: 1500, mailCredits: 5 }, // New tier
  enterprise: { price: 2900, mailCredits: 10 }
}
```

## Testing Scenarios

### Unit Tests

```typescript
describe('Mail Credit System', () => {
  it('should deduct credit atomically', async () => {
    await deductMailCredit(userId)
    const usage = await getUsage(userId)
    expect(usage.mailCredits).toBe(1)
    expect(usage.mailsSent).toBe(1)
  })

  it('should throw when no credits remaining', async () => {
    await expect(deductMailCredit(userId)).rejects.toThrow(QuotaExceededError)
  })

  it('should replenish credits on rollover', async () => {
    await rolloverUsage(userId)
    const usage = await getUsage(userId)
    expect(usage.mailCredits).toBe(2)
  })
})
```

### Integration Tests

```typescript
describe('Pay-as-you-go Flow', () => {
  it('should charge $3 for additional mail', async () => {
    // Exhaust free credits
    await deductMailCredit(userId)
    await deductMailCredit(userId)

    // Schedule 3rd mail
    const result = await scheduleMailDelivery({
      userId,
      letterId,
      // ... other params
    })

    expect(result.paymentIntent).toBeDefined()
    expect(result.paymentIntent.amount).toBe(300)
  })
})
```

## References

- Entitlements Service: `apps/web/server/lib/entitlements.ts`
- Usage Metrics: `apps/web/server/lib/usage-metrics.ts`
- Rollover Cron Job: `apps/web/app/api/cron/rollover-usage/route.ts`
- Stripe Integration: `claudedocs/STRIPE_INTEGRATION_DESIGN.md`
- Database Schema: `packages/prisma/schema.prisma`
