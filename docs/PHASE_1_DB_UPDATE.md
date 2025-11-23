# Phase 1: Database Update Complete ✅

**Date**: 2025-11-23
**Status**: Database reset and updated with credit-based system

## What Was Completed

### 1. Credit-Based Entitlement System ✅

**New User Fields**:
```typescript
model User {
  planType        PlanType?  // DIGITAL_CAPSULE | PAPER_PIXELS
  emailCredits    Int        // Default: 0
  physicalCredits Int        // Default: 0
  creditExpiresAt DateTime?  // Credit expiration tracking
  timezone        String     // Default: "UTC"
}
```

**New Enums**:
- `PlanType`: `DIGITAL_CAPSULE`, `PAPER_PIXELS`
- `AddOnType`: `email`, `physical`

### 2. Enhanced Letter Model ✅

**New Letter Fields**:
```typescript
model Letter {
  type            LetterType    // email | physical
  status          LetterStatus  // DRAFT | SCHEDULED | LOCKED | SENT | FAILED | BOUNCED | CANCELLED
  scheduledFor    DateTime?     // When letter should be delivered
  timezone        String        // User's timezone at scheduling
  lockedAt        DateTime?     // When letter was locked (can't edit)
  shareLinkToken  String        // Unique UUID for sharing (unique constraint)
}
```

**New Enums**:
- `LetterType`: `email`, `physical`
- `LetterStatus`: `DRAFT`, `SCHEDULED`, `LOCKED`, `SENT`, `FAILED`, `BOUNCED`, `CANCELLED`

### 3. Delivery Attempt Tracking ✅

**New Model**:
```typescript
model DeliveryAttempt {
  id           String          @id
  letterId     String
  channel      DeliveryChannel
  status       DeliveryStatus
  errorCode    String?
  errorMessage String?
  createdAt    DateTime
}
```

Purpose: Track all delivery attempts (successful and failed) for debugging and analytics.

### 4. Add-On Purchase System ✅

**New Model**:
```typescript
model AddOnPurchase {
  id                    String    @id
  userId                String
  type                  AddOnType  // email | physical
  quantity              Int        // Number of credits purchased
  amountCents           Int        // Price paid
  currency              String     // Default: "usd"
  stripePaymentIntentId String?
  metadata              Json
  createdAt             DateTime
}
```

Purpose: Track one-time credit purchases separate from subscriptions.

### 5. Plan Type Updates ✅

**Changed Fields**:
- `Subscription.plan`: Changed from `subscription_plan` enum → `PlanType` enum
- `PendingSubscription.plan`: Changed from `subscription_plan` → `PlanType`
- `PricingPlan.plan`: Changed from `subscription_plan` → `PlanType`

**Old enum removed**: `subscription_plan` (values: `pro`, `free`, `enterprise`)
**New enum**: `PlanType` (values: `DIGITAL_CAPSULE`, `PAPER_PIXELS`)

### 6. Anonymous Draft Enhancements ✅

**New Fields**:
```typescript
model AnonymousDraft {
  deliveryType String?  // Type of delivery requested
  timezone     String?  // User's timezone
}
```

## Database Migration Steps Taken

```bash
# 1. Generated Prisma Client with Phase 1 schema
cd packages/prisma
npx prisma generate

# 2. Reset database and applied new schema (⚠️ DATA LOSS)
pnpm dotenv -e ../../apps/web/.env.local -- \
  npx prisma db push --force-reset --skip-generate

# 3. Regenerated Prisma Client
npx prisma generate

# 4. Verified database schema matches
npx prisma db pull --print
```

## Architecture Changes

### Before (Monthly Usage Model)
```
User → Subscription → Monthly billing
                    → Usage limits per month
                    → Analytics: monthly usage tracking
```

### After (Credit-Based Model)
```
User → Credits (email + physical)
     → PlanType (DIGITAL_CAPSULE | PAPER_PIXELS)
     → Credit expiration tracking
     → Add-on purchases for extra credits
     → Analytics: credit consumption tracking
```

## Next Steps Required

### 1. Update Business Logic ⏳

**User Onboarding**:
- Assign initial credits based on `PlanType`
- Set `creditExpiresAt` on subscription creation

**Credit Management**:
- Implement credit deduction on letter delivery
- Implement credit refund on delivery failure
- Handle credit expiration cleanup

**Subscription Webhooks**:
- Update `Subscription.plan` to use `PlanType` values
- Grant credits on subscription activation
- Renew credits on billing cycle
- Handle plan upgrades/downgrades

**Add-On Purchases**:
- Implement add-on purchase flow
- Grant credits immediately on payment success
- Handle payment failures and refunds

### 2. Update Analytics ⏳

**Old Analytics (Monthly Usage)**:
```typescript
// Track letters sent per month
SubscriptionUsage.emailsSent
SubscriptionUsage.mailsSent
```

**New Analytics (Credit Consumption)**:
```typescript
// Track credit changes over time
User.emailCredits     // Current balance
User.physicalCredits  // Current balance
AddOnPurchase         // Purchase history
DeliveryAttempt       // Consumption events
```

**Required Changes**:
- Update dashboards to show credit balance instead of monthly usage
- Add credit consumption reports
- Track credit purchase conversion rates
- Monitor credit expiration and renewal patterns

### 3. Code Updates Needed ⏳

**Server Actions** (`apps/web/server/actions/`):
- `letters.ts`: Check credits before scheduling
- `deliveries.ts`: Deduct credits on delivery, refund on failure
- `subscriptions.ts`: Grant credits on subscription events

**Webhook Handlers** (`apps/web/app/api/webhooks/`):
- `stripe/route.ts`: Handle add-on purchases, subscription updates
- Update to use `PlanType` enum values

**Inngest Jobs** (`workers/inngest/functions/`):
- `deliver-email.ts`: Track credit deduction
- `deliver-mail.ts`: Handle physical mail credit consumption
- `process-stripe-webhook.ts`: Process add-on purchases

**UI Components** (`apps/web/components/`):
- Add credit balance display
- Update subscription UI to show `PlanType`
- Add add-on purchase flow

### 4. Testing Requirements ⏳

**Database Tests**:
- ✅ Schema validation (Prisma Client generated)
- ⏳ Credit deduction logic
- ⏳ Credit expiration handling
- ⏳ Add-on purchase flow
- ⏳ Subscription plan updates

**Integration Tests**:
- ⏳ Webhook processing with new plan types
- ⏳ Credit management across user lifecycle
- ⏳ Letter scheduling with insufficient credits
- ⏳ Delivery failure credit refunds

## Breaking Changes

### API Changes
1. **Subscription.plan values changed**:
   - Old: `"pro"`, `"free"`, `"enterprise"`
   - New: `"DIGITAL_CAPSULE"`, `"PAPER_PIXELS"`

2. **User model extended**:
   - New required fields: `planType`, `emailCredits`, `physicalCredits`, `timezone`
   - Old code assuming only `clerkUserId` and `email` will break

3. **Letter model extended**:
   - New required fields: `type`, `status`, `scheduledFor`, `timezone`, `shareLinkToken`
   - Old code creating letters without these fields will fail

### Data Migration (Future Production Deployment)

When deploying to production with existing data:

```sql
-- Step 1: Add new columns as nullable
ALTER TABLE users ADD COLUMN plan_type text;
ALTER TABLE users ADD COLUMN email_credits integer DEFAULT 0;
ALTER TABLE users ADD COLUMN physical_credits integer DEFAULT 0;
ALTER TABLE users ADD COLUMN credit_expires_at timestamptz;

-- Step 2: Migrate subscription plans
UPDATE subscriptions
SET plan = CASE
  WHEN plan = 'pro' THEN 'DIGITAL_CAPSULE'
  WHEN plan = 'enterprise' THEN 'PAPER_PIXELS'
  ELSE 'DIGITAL_CAPSULE'
END;

-- Step 3: Grant initial credits based on active subscriptions
UPDATE users
SET
  email_credits = 10,
  plan_type = 'DIGITAL_CAPSULE'
WHERE id IN (
  SELECT user_id FROM subscriptions
  WHERE status = 'active' AND plan = 'DIGITAL_CAPSULE'
);

-- Step 4: Add letter status and share tokens
ALTER TABLE letters ADD COLUMN type text DEFAULT 'email';
ALTER TABLE letters ADD COLUMN status text DEFAULT 'DRAFT';
ALTER TABLE letters ADD COLUMN share_link_token uuid DEFAULT gen_random_uuid();
```

## Verification Checklist

- ✅ Prisma schema updated with Phase 1 changes
- ✅ Database reset and schema applied
- ✅ Prisma Client regenerated
- ✅ Database schema verified
- ⏳ Business logic updated (credit management)
- ⏳ Analytics updated (credit consumption tracking)
- ⏳ Code updated (server actions, webhooks, jobs)
- ⏳ Tests written and passing
- ⏳ Production migration strategy documented

## Resources

- **Prisma Schema**: `packages/prisma/schema.prisma`
- **Migration Guide**: `packages/prisma/CREATE_MIGRATIONS.md`
- **Phase Plan**: `docs/CAPSULE_NOTE_PHASE_PLAN.md`
- **User Guide**: `CLAUDE.md` (DearMe repository guide)

## Notes

**⚠️ Development Database Reset**: All existing data was deleted during this update. This is acceptable for development but production deployment will require careful data migration.

**Credit System Benefits**:
- More flexible pricing (pay-per-use)
- Clear value proposition for users
- Better control over usage patterns
- Simpler accounting (credits vs usage periods)
- Easier to implement add-on purchases

**Analytics Migration Priority**: HIGH
Any downstream analytics systems expecting monthly usage data need immediate updates to work with the new credit-based model.
