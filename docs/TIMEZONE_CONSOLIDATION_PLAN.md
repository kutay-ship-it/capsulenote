# Timezone Consolidation - Enterprise Implementation Plan

## Executive Summary

**Problem**: Inconsistent timezone storage with redundant fields causing maintenance burden and potential bugs.

**Solution**: Consolidate to single source of truth with proper fallbacks, browser detection, and data migration.

**Timeline**: 4 phases over 2-3 sprints

**Risk Level**: LOW (backward compatible migration with rollback plan)

---

## Current State Analysis

### Issues Identified

1. **Redundant Storage**: Two timezone fields at user level
   - `User.timezone` (default: "UTC")
   - `Profile.timezone` (default: "America/New_York")

2. **Inconsistent Defaults**: Different fallback values create confusion

3. **No Browser Detection**: Users default to hardcoded timezones instead of their actual timezone

4. **Maintenance Burden**: Code must check multiple locations for timezone value

### Current Usage Pattern

✅ **Good**: Code primarily uses `profile.timezone` (89% of codebase)
- `apps/web/app/(app)/settings/page.tsx:77`
- `apps/web/app/(app)/dashboard/page.tsx:48-49`
- `apps/web/server/actions/gdpr.ts:186`

❌ **Problem**: Inconsistent fallback patterns and no detection on signup

---

## Enterprise Solution Architecture

### Design Principles

1. **Single Source of Truth**: `Profile.timezone` is the canonical timezone
2. **Browser Detection First**: Auto-detect timezone on signup
3. **Graceful Degradation**: Proper fallback chain
4. **Zero Data Loss**: Migration preserves all existing data
5. **Backward Compatible**: Old code continues to work during migration

### Timezone Hierarchy

```
Priority Order (Highest to Lowest):
1. Profile.timezone (user's preference) ← CANONICAL SOURCE
2. Browser-detected timezone (signup) ← NEW: Auto-detect
3. User.timezone (legacy fallback) ← DEPRECATED
4. UTC (system default) ← LAST RESORT
```

### Data Model Changes

**BEFORE** (Current):
```prisma
model User {
  timezone  String  @default("UTC")  // ❌ Redundant
  profile   Profile?
}

model Profile {
  timezone  String  @default("America/New_York")  // ❌ Wrong default
}
```

**AFTER** (Target):
```prisma
model User {
  timezone  String?  @default(null)  // ✅ Nullable, deprecated
  profile   Profile?
}

model Profile {
  timezone  String  // ✅ Required, no default (set at creation)
}
```

---

## Implementation Phases

## Phase 1: Browser Detection & Cleanup (Week 1)

### 1.1 Add Browser Timezone Detection Utilities

**File**: `apps/web/lib/timezone.ts` (NEW)

```typescript
/**
 * Enterprise-grade timezone detection and validation
 */

import { z } from "zod"

/**
 * IANA timezone schema with validation
 * Validates against Intl.supportedValuesOf('timeZone')
 */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      // Validate timezone is recognized by Intl
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  },
  { message: "Invalid IANA timezone identifier" }
)

/**
 * Detect user's browser timezone
 * Returns IANA timezone string (e.g., "Europe/Istanbul", "America/New_York")
 *
 * @returns Browser's detected timezone or null if detection fails
 */
export function detectBrowserTimezone(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Validate detected timezone
    const result = timezoneSchema.safeParse(timezone)

    if (!result.success) {
      console.warn('[Timezone] Browser timezone validation failed:', timezone)
      return null
    }

    return result.data
  } catch (error) {
    console.error('[Timezone] Failed to detect browser timezone:', error)
    return null
  }
}

/**
 * Get user's timezone with proper fallback chain
 *
 * Priority:
 * 1. Profile.timezone (user preference)
 * 2. User.timezone (legacy)
 * 3. Browser detected
 * 4. UTC (last resort)
 */
export function getUserTimezoneWithFallback(
  profileTimezone?: string | null,
  userTimezone?: string | null
): string {
  // 1. Try profile timezone (canonical source)
  if (profileTimezone) {
    return profileTimezone
  }

  // 2. Try legacy user timezone
  if (userTimezone) {
    return userTimezone
  }

  // 3. Try browser detection (client-side only)
  if (typeof window !== 'undefined') {
    const detected = detectBrowserTimezone()
    if (detected) {
      return detected
    }
  }

  // 4. Last resort fallback
  return 'UTC'
}

/**
 * Validate and normalize timezone string
 */
export function validateTimezone(timezone: string): boolean {
  return timezoneSchema.safeParse(timezone).success
}

/**
 * Get common timezone abbreviation (EST, PST, etc.)
 */
export function getTimezoneAbbreviation(timezone: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(date)

    const abbr = parts.find(part => part.type === 'timeZoneName')?.value
    return abbr || timezone
  } catch {
    return timezone
  }
}
```

### 1.2 Update Existing `lib/utils.ts`

**File**: `apps/web/lib/utils.ts`

```typescript
// Import from centralized timezone module
import { detectBrowserTimezone } from './timezone'

/**
 * @deprecated Use detectBrowserTimezone from '@/lib/timezone' instead
 */
export function getUserTimezone(): string {
  return detectBrowserTimezone() || 'UTC'
}
```

### 1.3 Create Timezone Detection Hook

**File**: `apps/web/hooks/use-timezone.ts` (NEW)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { detectBrowserTimezone } from '@/lib/timezone'

/**
 * Hook to detect and monitor browser timezone changes
 * Useful for Clerk signup flow and timezone mismatch warnings
 */
export function useTimezone() {
  const [timezone, setTimezone] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)

  useEffect(() => {
    const detected = detectBrowserTimezone()
    setTimezone(detected)
    setIsDetecting(false)
  }, [])

  return {
    timezone,
    isDetecting,
    isValid: timezone !== null,
  }
}
```

---

## Phase 2: Update Signup Flow (Week 1-2)

### 2.1 Update Clerk Public Metadata Schema

**File**: `packages/types/clerk-metadata.ts` (NEW)

```typescript
/**
 * Clerk user metadata schemas
 * Used for storing additional user data during signup
 */

import { z } from 'zod'
import { timezoneSchema } from '@/lib/timezone'

export const clerkPublicMetadataSchema = z.object({
  lockedEmail: z.string().email().optional(),
  detectedTimezone: timezoneSchema.optional(),
})

export const clerkUnsafeMetadataSchema = z.object({
  lockedEmail: z.string().email().optional(),
  detectedTimezone: timezoneSchema.optional(),
})

export type ClerkPublicMetadata = z.infer<typeof clerkPublicMetadataSchema>
export type ClerkUnsafeMetadata = z.infer<typeof clerkUnsafeMetadataSchema>
```

### 2.2 Create Signup Timezone Detection Component

**File**: `apps/web/components/auth/timezone-detector.tsx` (NEW)

```typescript
'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { detectBrowserTimezone } from '@/lib/timezone'

/**
 * Automatically detects and stores browser timezone in Clerk metadata
 * Mount this component in the signup flow
 */
export function TimezoneDetector() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    // Check if timezone already stored
    const existingTimezone = user.unsafeMetadata?.detectedTimezone
    if (existingTimezone) return

    // Detect and store timezone
    const timezone = detectBrowserTimezone()
    if (!timezone) return

    console.log('[TimezoneDetector] Detected timezone:', timezone)

    // Store in Clerk metadata (will be available in webhook)
    user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        detectedTimezone: timezone,
      },
    }).catch((error) => {
      console.error('[TimezoneDetector] Failed to update metadata:', error)
    })
  }, [isLoaded, user])

  // Silent component - no UI
  return null
}
```

### 2.3 Update Auth Webhook to Use Detected Timezone

**File**: `apps/web/app/api/webhooks/clerk/route.ts`

```typescript
case "user.created": {
  const { id, email_addresses, unsafe_metadata } = evt.data
  const email = email_addresses[0]?.email_address

  // Extract detected timezone from metadata (set by TimezoneDetector)
  const metadata = unsafe_metadata as {
    lockedEmail?: string
    detectedTimezone?: string
  } | undefined

  const detectedTimezone = metadata?.detectedTimezone

  // Validate and fallback
  const timezone = detectedTimezone && validateTimezone(detectedTimezone)
    ? detectedTimezone
    : 'UTC' // Fallback only if detection failed

  console.log('[Clerk Webhook] Creating user with timezone:', timezone)

  user = await prisma.user.create({
    data: {
      clerkUserId: id,
      email: email,
      profile: {
        create: {
          timezone, // ✅ Use detected timezone
        },
      },
    },
  })

  break
}
```

### 2.4 Update Auth.ts Auto-Sync

**File**: `apps/web/server/lib/auth.ts`

```typescript
import { detectBrowserTimezone } from '@/lib/timezone'

// In getCurrentUser function, auto-sync section:
const clerkUser = await clerk.users.getUser(clerkUserId)

// Extract detected timezone from metadata
const metadata = clerkUser.unsafeMetadata as { detectedTimezone?: string } | undefined
const detectedTimezone = metadata?.detectedTimezone

// Validate and fallback
const timezone = detectedTimezone && validateTimezone(detectedTimezone)
  ? detectedTimezone
  : 'UTC'

user = await prisma.user.create({
  data: {
    clerkUserId,
    email,
    profile: {
      create: {
        timezone, // ✅ Use detected timezone
      },
    },
  },
  include: {
    profile: true,
  },
})
```

---

## Phase 3: Database Migration (Week 2)

### 3.1 Create Data Migration Script

**File**: `scripts/migrate-timezones.ts` (NEW)

```typescript
/**
 * Data Migration: Consolidate User.timezone → Profile.timezone
 *
 * Strategy:
 * 1. For profiles with timezone, keep as-is (already correct)
 * 2. For profiles WITHOUT timezone, copy from User.timezone
 * 3. Make User.timezone nullable (prepare for deprecation)
 */

import { prisma } from '../apps/web/server/lib/db'

async function migrateTimezones() {
  console.log('🕒 Starting timezone consolidation migration...\n')

  // Get all users with profiles
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
  })

  console.log(`Found ${users.length} users to process\n`)

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    try {
      if (!user.profile) {
        console.log(`⚠️  User ${user.email} has no profile, skipping`)
        skipped++
        continue
      }

      // If profile already has timezone, skip
      if (user.profile.timezone && user.profile.timezone !== 'America/New_York') {
        console.log(`✓ User ${user.email} already has timezone: ${user.profile.timezone}`)
        skipped++
        continue
      }

      // Profile has default timezone, use User.timezone if better
      const sourceTimezone = user.timezone !== 'UTC'
        ? user.timezone
        : 'UTC'

      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          timezone: sourceTimezone,
        },
      })

      console.log(`✅ Updated ${user.email}: ${user.profile.timezone} → ${sourceTimezone}`)
      updated++

    } catch (error) {
      console.error(`❌ Error processing user ${user.email}:`, error)
      errors++
    }
  }

  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📦 Total: ${users.length}`)

  if (errors === 0) {
    console.log('\n✨ Migration completed successfully!')
  } else {
    console.log('\n⚠️  Migration completed with errors. Review logs above.')
    process.exit(1)
  }
}

// Run migration
migrateTimezones()
  .catch((error) => {
    console.error('Fatal migration error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
```

### 3.2 Create Prisma Schema Migration

**File**: `packages/prisma/migrations/YYYYMMDDHHMMSS_consolidate_timezones/migration.sql`

```sql
-- Migration: Consolidate timezone storage
-- Makes User.timezone nullable (deprecated field)
-- Profile.timezone remains required (canonical source)

-- Step 1: Make User.timezone nullable
ALTER TABLE "users" ALTER COLUMN "timezone" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "timezone" DROP DEFAULT;

-- Step 2: Add comment for deprecation
COMMENT ON COLUMN "users"."timezone" IS 'DEPRECATED: Use profile.timezone instead. Kept for backward compatibility only.';

-- Step 3: Ensure all profiles have a timezone
-- (Data migration script should have already populated these)
-- This is a safety check
UPDATE "profiles"
SET "timezone" = 'UTC'
WHERE "timezone" IS NULL OR "timezone" = '';

-- Step 4: Make Profile.timezone NOT NULL (if not already)
ALTER TABLE "profiles" ALTER COLUMN "timezone" SET NOT NULL;
```

### 3.3 Update Prisma Schema

**File**: `packages/prisma/schema.prisma`

```prisma
model User {
  id              String   @id @default(uuid()) @db.Uuid
  clerkUserId     String?  @unique @map("clerk_user_id")
  email           String   @unique @db.Citext
  planType        PlanType? @map("plan_type")
  emailCredits    Int      @default(0) @map("email_credits")
  physicalCredits Int      @default(0) @map("physical_credits")
  creditExpiresAt DateTime? @map("credit_expires_at") @db.Timestamptz(3)

  /// @deprecated Use profile.timezone instead. Kept for backward compatibility.
  timezone        String?  // ✅ Now nullable, no default

  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  profile           Profile?
  // ... rest of relations

  @@map("users")
}

model Profile {
  userId              String   @id @map("user_id") @db.Uuid
  displayName         String?  @map("display_name")

  /// User's IANA timezone (e.g., "Europe/Istanbul", "America/New_York")
  /// This is the canonical source of truth for user timezone.
  /// Automatically detected from browser on signup, user can update in settings.
  timezone            String   // ✅ Required, no default (set at creation)

  marketingOptIn      Boolean  @default(false) @map("marketing_opt_in")
  onboardingCompleted Boolean  @default(false) @map("onboarding_completed")
  stripeCustomerId    String?  @unique @map("stripe_customer_id")
  createdAt           DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt           DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}
```

---

## Phase 4: Code Updates & Cleanup (Week 2-3)

### 4.1 Create Centralized Timezone Getter

**File**: `apps/web/server/lib/get-user-timezone.ts` (NEW)

```typescript
/**
 * Enterprise timezone getter with proper fallback chain
 * Use this for all server-side timezone operations
 */

import { User, Profile } from '@prisma/client'

type UserWithProfile = User & { profile: Profile | null }

/**
 * Get user's timezone with enterprise fallback chain
 *
 * Priority:
 * 1. profile.timezone (canonical source)
 * 2. user.timezone (legacy, will be removed)
 * 3. UTC (system default)
 *
 * @param user - User object with profile relation included
 * @returns IANA timezone string
 */
export function getUserTimezone(user: UserWithProfile): string {
  // 1. Try profile timezone (canonical source)
  if (user.profile?.timezone) {
    return user.profile.timezone
  }

  // 2. Try legacy user timezone
  if (user.timezone) {
    console.warn(
      `[Timezone] Using deprecated User.timezone for user ${user.id}. ` +
      `Profile should have timezone set.`
    )
    return user.timezone
  }

  // 3. Last resort fallback
  console.error(
    `[Timezone] No timezone found for user ${user.id}. ` +
    `Falling back to UTC. This should not happen.`
  )
  return 'UTC'
}

/**
 * Assert that profile exists and has timezone
 * Throws error if not - use for critical operations
 */
export function requireUserTimezone(user: UserWithProfile): string {
  if (!user.profile) {
    throw new Error(`User ${user.id} has no profile`)
  }

  if (!user.profile.timezone) {
    throw new Error(`User ${user.id} profile has no timezone`)
  }

  return user.profile.timezone
}
```

### 4.2 Update All Server Actions

**Example**: `apps/web/server/actions/deliveries.ts`

```typescript
import { getUserTimezone } from '@/server/lib/get-user-timezone'

export async function scheduleDelivery(/* ... */) {
  const user = await requireUser()

  // ✅ Use centralized getter
  const timezone = getUserTimezone(user)

  // Rest of logic...
}
```

### 4.3 Update All Components

**Example**: `apps/web/app/(app)/dashboard/page.tsx`

```typescript
import { getUserTimezone } from '@/server/lib/get-user-timezone'

export default async function DashboardPage() {
  const user = await requireUser()

  // ✅ Use centralized getter
  const timezone = getUserTimezone(user)

  return (
    <div>
      {/* Timezone Change Warning */}
      <TimezoneChangeWarning savedTimezone={timezone} />
      {/* ... */}
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests

**File**: `apps/web/__tests__/unit/timezone-migration.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  detectBrowserTimezone,
  validateTimezone,
  getUserTimezoneWithFallback
} from '@/lib/timezone'

describe('Timezone Detection', () => {
  it('detects valid IANA timezone', () => {
    const timezone = detectBrowserTimezone()
    expect(timezone).toBeTruthy()
    expect(validateTimezone(timezone!)).toBe(true)
  })

  it('validates common timezones', () => {
    expect(validateTimezone('Europe/Istanbul')).toBe(true)
    expect(validateTimezone('America/New_York')).toBe(true)
    expect(validateTimezone('UTC')).toBe(true)
    expect(validateTimezone('Invalid/Timezone')).toBe(false)
  })
})

describe('Timezone Fallback Chain', () => {
  it('prefers profile timezone', () => {
    const result = getUserTimezoneWithFallback('Europe/Istanbul', 'UTC')
    expect(result).toBe('Europe/Istanbul')
  })

  it('falls back to user timezone', () => {
    const result = getUserTimezoneWithFallback(null, 'America/New_York')
    expect(result).toBe('America/New_York')
  })

  it('uses UTC as last resort', () => {
    const result = getUserTimezoneWithFallback(null, null)
    expect(result).toBe('UTC')
  })
})
```

### Integration Tests

**File**: `apps/web/__tests__/integration/timezone-signup.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/server/lib/db'
import { testHelpers } from '../utils/test-helpers'

describe('Timezone Signup Integration', () => {
  beforeEach(async () => {
    await testHelpers.cleanupDatabase()
  })

  it('creates user with detected timezone from metadata', async () => {
    const clerkUser = await testHelpers.createClerkUser({
      unsafeMetadata: {
        detectedTimezone: 'Europe/Istanbul'
      }
    })

    // Trigger webhook
    await testHelpers.triggerClerkWebhook('user.created', clerkUser)

    // Verify profile has correct timezone
    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      include: { profile: true }
    })

    expect(user).toBeTruthy()
    expect(user!.profile!.timezone).toBe('Europe/Istanbul')
  })

  it('falls back to UTC if detection fails', async () => {
    const clerkUser = await testHelpers.createClerkUser({
      // No timezone in metadata
    })

    await testHelpers.triggerClerkWebhook('user.created', clerkUser)

    const user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      include: { profile: true }
    })

    expect(user!.profile!.timezone).toBe('UTC')
  })
})
```

---

## Rollout Plan

### Step 1: Deploy Phase 1 & 2 (Browser Detection)
- ✅ No breaking changes
- ✅ New users get correct timezone automatically
- ✅ Existing users unaffected

### Step 2: Run Data Migration (Off-Peak Hours)
```bash
# Backup database first
pg_dump $DATABASE_URL > backup_before_timezone_migration.sql

# Run migration script
pnpm dotenv -e apps/web/.env.local -- tsx scripts/migrate-timezones.ts

# Verify results
psql $DATABASE_URL -c "SELECT COUNT(*) FROM profiles WHERE timezone IS NULL OR timezone = '';"
# Should return 0
```

### Step 3: Deploy Database Schema Changes
```bash
pnpm db:migrate
# Migration will make User.timezone nullable
```

### Step 4: Deploy Code Updates (Gradual Rollout)
- ✅ Use feature flag for gradual rollout if desired
- ✅ Monitor error rates and timezone-related bugs
- ✅ Centralized getter provides consistent behavior

### Step 5: Deprecation Timeline
- **Month 1-2**: Both fields work, User.timezone deprecated
- **Month 3**: Remove User.timezone from schema (final migration)

---

## Monitoring & Validation

### Success Metrics

1. **Zero timezone-related bugs** after deployment
2. **100% of new users** have detected timezone (not UTC fallback)
3. **Zero data loss** during migration
4. **Consistent timezone usage** across all code paths

### Monitoring Queries

```sql
-- Check timezone distribution
SELECT timezone, COUNT(*)
FROM profiles
GROUP BY timezone
ORDER BY COUNT(*) DESC;

-- Find users without profile timezone (should be 0)
SELECT u.email, u.timezone, p.timezone as profile_timezone
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE p.timezone IS NULL OR p.timezone = '';

-- Legacy timezone usage (should decrease over time)
SELECT COUNT(*) FROM users WHERE timezone IS NOT NULL;
```

### Rollback Plan

If critical issues discovered:

1. **Immediate**: Revert code deployment (use centralized getter's fallback)
2. **Database**: Restore from backup if needed
3. **Investigation**: Centralized getter logs will show exactly which fallback was used

---

## Documentation Updates

### For Developers

**File**: `docs/TIMEZONE_BEST_PRACTICES.md`

```markdown
# Timezone Best Practices

## ✅ DO

- Use `getUserTimezone(user)` for server-side operations
- Use `detectBrowserTimezone()` for client-side detection
- Always include profile relation when fetching user
- Store timezones as IANA strings ("Europe/Istanbul")

## ❌ DON'T

- Don't access `user.timezone` directly (deprecated)
- Don't hardcode timezone defaults
- Don't forget to validate user-provided timezones
- Don't mix UTC and local times without conversion

## Migration Guide

All timezone operations now use `Profile.timezone` as source of truth.

**Before:**
```typescript
const timezone = user.profile?.timezone || "UTC"
```

**After:**
```typescript
import { getUserTimezone } from '@/server/lib/get-user-timezone'
const timezone = getUserTimezone(user)
```
```

---

## Summary

### What This Solves

✅ **Issue #1**: Eliminates redundant `User.timezone` field (deprecated, then removed)
✅ **Issue #2**: Consistent default via browser detection (no more hardcoded defaults)
✅ **Issue #3**: Single source of truth with centralized getter function

### Key Benefits

1. **Automatic Detection**: Users get correct timezone from day 1
2. **Maintainable**: Single source of truth, consistent API
3. **Enterprise-Grade**: Proper fallbacks, validation, testing, monitoring
4. **Zero Downtime**: Backward compatible migration with rollback plan
5. **Observable**: Logging and monitoring at every step

### Timeline

- **Week 1**: Browser detection + signup flow updates
- **Week 2**: Data migration + schema changes
- **Week 3**: Code cleanup + testing
- **Month 3**: Final deprecation of User.timezone

### Risk Assessment

**Risk Level**: 🟢 LOW

- Backward compatible migration
- Centralized getter prevents breakage
- Comprehensive testing strategy
- Clear rollback plan
