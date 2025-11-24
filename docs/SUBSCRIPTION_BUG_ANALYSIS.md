# Subscription Bug Analysis & Fix

## 🐛 Critical Bug: Data Model Mismatch in Entitlements

### Root Cause
**Location**: `apps/web/server/lib/entitlements.ts:212-277`

The `buildEntitlements()` function has a **data model inconsistency** that causes valid paying users to be blocked from scheduling deliveries.

### The Problem

```typescript
// Line 213-222: Query for active subscriptions ONLY
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    subscriptions: {
      where: { status: { in: ACTIVE_SUBSCRIPTION_STATUSES } },  // ❌ Only "active" or "trialing"
      orderBy: { createdAt: "desc" },
      take: 1,
    },
  },
})

// Line 228-230: Status determination
const subscription = user.subscriptions[0]  // undefined if no subscription record
const plan = subscription?.plan ?? user.planType ?? null  // ✅ Correctly falls back
const status = subscription?.status ?? ("none" as const)  // ❌ BUG: Doesn't check user.planType

// Line 257: Access control
canScheduleDeliveries: ACTIVE_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus),
// ❌ Returns FALSE when status is "none" even if user.planType is set
```

### Why This Happens

The database has **two places** where subscription data can live:

1. **`users` table** (User model)
   - `planType`: DIGITAL_CAPSULE | PAPER_PIXELS | null
   - `emailCredits`: number
   - `physicalCredits`: number
   - Used as fallback/legacy storage

2. **`subscriptions` table** (Subscription model)
   - `status`: trialing | active | past_due | canceled | unpaid | paused
   - `plan`: DIGITAL_CAPSULE | PAPER_PIXELS
   - Tracks active Stripe subscriptions

The code correctly falls back to `user.planType` for the **plan**, but NOT for the **status**.

### Impact

**Symptom**: "Scheduling deliveries requires an active subscription" error even when user has:
- ✅ Valid `planType` set on `users.planType`
- ✅ Email credits (`emailCredits > 0`)
- ❌ No record in `subscriptions` table (or status not "active"/"trialing")

**Affected Users**:
- Users who subscribed before `subscriptions` table was added
- Users whose subscription record was deleted/corrupted
- Users manually granted access via admin panel (setting `planType` directly)
- Test/development users with credits but no Stripe subscription

### Example Scenario

```typescript
// User in database:
{
  id: "123",
  planType: "DIGITAL_CAPSULE",  // ✅ Has plan
  emailCredits: 6,               // ✅ Has credits
  subscriptions: []              // ❌ No subscription record
}

// Entitlements calculated:
{
  plan: "DIGITAL_CAPSULE",              // ✅ Correct
  status: "none",                       // ❌ BUG!
  canScheduleDeliveries: false,         // ❌ BLOCKED!
  canCreateLetters: true,               // ✅ OK
  emailDeliveriesIncluded: 6            // ✅ Correct
}
```

## 🔧 Solution: Hybrid Status Detection

### Fix Option 1: Use `planType` as Status Indicator (Recommended)

```typescript
async function buildEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: { in: ACTIVE_SUBSCRIPTION_STATUSES } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const subscription = user.subscriptions[0]
  const plan = subscription?.plan ?? user.planType ?? null

  // ✅ FIX: If no active subscription but planType is set, treat as "active"
  const status = subscription?.status
    ?? (user.planType ? "active" as const : "none" as const)

  // ... rest of logic
}
```

**Pros**:
- Simple, minimal change
- Honors both data sources
- Users with `planType` can schedule immediately

**Cons**:
- Doesn't distinguish between truly active subscriptions and manually granted access
- May allow scheduling for users whose Stripe subscription lapsed

### Fix Option 2: Check Credit Expiration Date

```typescript
async function buildEntitlements(userId: string): Promise<Entitlements> {
  // ... query same as before ...

  const subscription = user.subscriptions[0]
  const plan = subscription?.plan ?? user.planType ?? null

  // ✅ FIX: Check if credits are still valid
  const hasValidCredits = user.creditExpiresAt
    ? user.creditExpiresAt > new Date()
    : !!user.planType  // If no expiry but has plan, assume valid

  const status = subscription?.status
    ?? (hasValidCredits ? "active" as const : "none" as const)

  // ... rest of logic
}
```

**Pros**:
- More accurate - respects credit expiration
- Allows for temporary access grants
- Better alignment with business logic

**Cons**:
- Requires `creditExpiresAt` to be properly maintained
- More complex logic

### Fix Option 3: Always Require Subscription Record (Strictest)

```typescript
// No code change, but requires data migration
```

**Process**:
1. Create subscription records for all users with `planType` set
2. Backfill `status: "active"` and `currentPeriodEnd`
3. Continue using existing logic

**Pros**:
- Clean data model - single source of truth
- Easier to reason about
- Better audit trail

**Cons**:
- Requires migration script
- May break for users added before migration runs
- More work upfront

## 🎯 Recommended Fix

**Use Fix Option 2** (Credit Expiration Check) with migration to populate `subscriptions` table:

1. **Immediate fix**: Deploy Fix Option 2 to unblock users NOW
2. **Long-term**: Create migration to backfill subscription records
3. **Future**: Deprecate `users.planType` in favor of subscription records only

## 📋 Implementation Checklist

- [ ] Apply Fix Option 2 to `entitlements.ts`
- [ ] Add unit tests for all subscription states
- [ ] Test with user who has:
  - [x] Active subscription record → should work
  - [x] No subscription but planType set → should work after fix
  - [x] Expired credits → should be blocked
  - [x] No planType and no subscription → should be blocked
- [ ] Create migration script for backfilling subscriptions table
- [ ] Add monitoring/alerts for users in this state
- [ ] Update webhook handlers to ensure subscription records are always created

## 🧪 Test Cases

```typescript
describe("Entitlements - Subscription Status", () => {
  it("allows scheduling with active subscription record", async () => {
    // User with subscriptions[0].status = "active"
    const entitlements = await getEntitlements(userId)
    expect(entitlements.canScheduleDeliveries).toBe(true)
  })

  it("allows scheduling with planType but no subscription record", async () => {
    // User with planType = "DIGITAL_CAPSULE" but subscriptions = []
    const entitlements = await getEntitlements(userId)
    expect(entitlements.canScheduleDeliveries).toBe(true)  // ❌ Currently fails
  })

  it("blocks scheduling with expired credits", async () => {
    // User with planType but creditExpiresAt < now
    const entitlements = await getEntitlements(userId)
    expect(entitlements.canScheduleDeliveries).toBe(false)
  })

  it("blocks scheduling with no planType and no subscription", async () => {
    // User with planType = null and subscriptions = []
    const entitlements = await getEntitlements(userId)
    expect(entitlements.canScheduleDeliveries).toBe(false)
  })
})
```

## 🔍 Related Issues to Check

1. **Webhook Handlers**: Do Stripe webhooks always create subscription records?
   - Check: `app/api/webhooks/stripe/route.ts`
   - Verify: `checkout.session.completed` creates Subscription record

2. **Admin Panel**: Does manual user setup create subscription records?
   - Check: Any admin endpoints that set `planType`
   - Should also create corresponding Subscription record

3. **Seed Scripts**: Do they create consistent data?
   - Check: `packages/prisma/seed.ts`
   - Ensure test users have both `planType` AND subscription records

4. **Cache Invalidation**: Is cache properly cleared on status changes?
   - Current: `invalidateEntitlementsCache()` called after credit changes
   - Need: Also call after subscription updates

## 📊 Monitoring Recommendations

Add metrics/alerts for:
- Users with `planType` but no active subscription record (data inconsistency)
- Users blocked from scheduling despite having credits
- Failed subscription lookups

## 🚀 Deployment Plan

1. **Phase 1**: Deploy Fix Option 2 (immediate unblock)
2. **Phase 2**: Create and run backfill migration
3. **Phase 3**: Add monitoring and alerts
4. **Phase 4**: Update webhook handlers to ensure consistency
5. **Phase 5**: Add comprehensive test coverage

---

**Priority**: 🔴 CRITICAL - Blocking paying users from core functionality
**Estimated Fix Time**: 30 minutes (immediate fix) + 2 hours (full solution)
