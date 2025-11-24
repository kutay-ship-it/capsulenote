# Critical Bugs Found - 2025-11-24

**Session**: Post-Webhook Testing - User Reported "Failed to Schedule Delivery"

---

## 🚨 Critical Issues Identified

### 1. Clerk Client Initialization Error (CRITICAL)

**Error**: `TypeError: Cannot read properties of undefined (reading 'getUser')`

**Location**: `apps/web/server/lib/auth.ts:56`

**Occurrences**: 150+ errors in logs

**Root Cause**:
```typescript
// auth.ts:55
const clerk = await getClerkClient()
const clerkUser = await clerk.users.getUser(clerkUserId)  // ❌ clerk is undefined
```

**Analysis**:
- `getClerkClient()` from `server/lib/clerk.ts` returns `clerkClientFactory()`
- In Clerk v6+, `clerkClientFactory()` must be awaited
- The function is already async and awaits, but something is returning `undefined`

**Impact**:
- User auto-sync fails completely
- Users cannot be created in database even if Clerk auth succeeds
- "Failed to schedule delivery" error shown to users
- Authentication appears broken to end users

**Likely Cause**:
The `clerkClient` import from `@clerk/nextjs/server` may have changed its API or requires additional configuration.

---

### 2. Next.js Build Cache Corruption (HIGH)

**Error**: `Module parse failed: Identifier 'getUserTimezone' has already been declared`

**Location**: Multiple files, references `apps/web/lib/utils.ts:9` or `:8`

**Root Cause**:
- Next.js build cache (`.next/` directory) is corrupted
- Hot reload introduced stale module references
- File appears to have duplicate declarations in cached version

**Impact**:
- Fast Refresh failures requiring full page reload
- Development experience degraded
- Unpredictable build errors

**Fix**: Clear Next.js cache and rebuild

---

### 3. Database Connection Pool Exhaustion (MEDIUM)

**Error**: `Error in PostgreSQL connection: Error { kind: Closed, cause: None }`

**Occurrences**: 2 instances in logs

**Root Cause**:
- Prisma connection pool may be exhausted due to:
  - 150+ rapid auth failures creating many concurrent requests
  - Clerk auto-sync logic retrying rapidly
  - No connection pool limits configured

**Impact**:
- Intermittent database connectivity failures
- Cascade effect from auth errors

**Likely Secondary Effect**: This is probably caused by Issue #1 (auth failures) creating excessive database load

---

### 4. Routes Manifest Missing (LOW - Side Effect)

**Error**: `ENOENT: no such file or directory, open '.next/routes-manifest.json'`

**Occurrences**: Multiple during hot reload

**Root Cause**: Build cache corruption (related to Issue #2)

**Impact**: Hot Module Replacement failures

---

## Root Cause Chain

```
1. Clerk Client Initialization Fails
   ↓
2. getCurrentUser() throws error on line 56
   ↓
3. Every authenticated request fails
   ↓
4. Rapid retries exhaust database connections
   ↓
5. Build cache gets corrupted from constant Hot Reloads
   ↓
6. Development server becomes unstable
   ↓
7. User sees: "Failed to schedule delivery"
```

---

## Priority Fixes

### Fix #1: Clerk Client Initialization (IMMEDIATE)

**Problem**:
`clerkClientFactory()` is returning `undefined` instead of Clerk client

**Diagnosis Steps**:
1. Check if `@clerk/nextjs` package version has breaking changes
2. Verify `CLERK_SECRET_KEY` is set in `.env.local`
3. Test if `clerkClientFactory` signature changed in recent Clerk versions

**Potential Fixes**:

#### Option A: Add Error Handling
```typescript
// apps/web/server/lib/clerk.ts
export async function getClerkClient(): Promise<ClerkClient> {
  try {
    const client = await clerkClientFactory()
    if (!client) {
      throw new Error("Clerk client factory returned undefined - check CLERK_SECRET_KEY")
    }
    return client
  } catch (error) {
    console.error("[Clerk] Failed to initialize client:", error)
    throw error
  }
}
```

#### Option B: Direct Import (If API Changed)
```typescript
// apps/web/server/lib/clerk.ts
import { createClerkClient } from "@clerk/nextjs/server"
import { env } from "@/env.mjs"

export async function getClerkClient(): Promise<ClerkClient> {
  return createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
}
```

#### Option C: Fallback to Null Check
```typescript
// apps/web/server/lib/auth.ts (line 54-56)
const clerk = await getClerkClient()
if (!clerk || !clerk.users) {
  console.error(`[Auth] ❌ Clerk client unavailable for user ${clerkUserId}`)
  return null
}
const clerkUser = await clerk.users.getUser(clerkUserId)
```

---

### Fix #2: Clear Build Cache (IMMEDIATE)

**Commands**:
```bash
# Terminal 1: Stop dev server (Ctrl+C)

# Terminal 2: Clean Next.js cache
cd apps/web
rm -rf .next
pnpm build  # Rebuild from scratch
pnpm dev    # Restart

# Alternative: Full clean
cd /Users/dev/Desktop/capsulenote/capsulenote
rm -rf apps/web/.next
rm -rf node_modules/.cache
pnpm install
pnpm dev
```

---

### Fix #3: Database Connection Pooling (PREVENTIVE)

**Add to** `apps/web/server/lib/db.ts`:

```typescript
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  // Add connection pool limits
  log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
})

// Configure connection pool (Neon recommendation for serverless)
prisma.$connect().then(() => {
  console.log("[DB] Connected to Neon Postgres")
}).catch((error) => {
  console.error("[DB] Connection failed:", error)
})
```

**Add to** `packages/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings for Neon
  // connectionLimit = 10  // Adjust based on Neon plan
}
```

---

## Investigation Steps

### Step 1: Check Clerk Package Version
```bash
cd apps/web
cat package.json | grep "@clerk"
```

**Expected Output**:
```json
"@clerk/nextjs": "^6.x.x",
"@clerk/backend": "^1.x.x"
```

**Check for breaking changes**:
- Visit: https://clerk.com/docs/upgrade-guides
- Look for API changes in v6+

---

### Step 2: Verify Environment Variables
```bash
grep "CLERK" apps/web/.env.local
```

**Required**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

---

### Step 3: Test Clerk Client Directly
Create `apps/web/scripts/test-clerk.ts`:

```typescript
import { clerkClient } from "@clerk/nextjs/server"

async function testClerk() {
  try {
    const client = await clerkClient()
    console.log("Clerk client initialized:", !!client)
    console.log("Has users method:", !!client?.users)

    // Try to list users (requires valid secret key)
    const users = await client.users.getUserList({ limit: 1 })
    console.log("Fetched users:", users.data.length)
  } catch (error) {
    console.error("Clerk test failed:", error)
  }
}

testClerk()
```

Run:
```bash
npx tsx apps/web/scripts/test-clerk.ts
```

---

### Step 4: Add Comprehensive Logging

Update `apps/web/server/lib/clerk.ts`:

```typescript
export async function getClerkClient(): Promise<ClerkClient> {
  console.log("[Clerk] Attempting to initialize client...")
  console.log("[Clerk] Secret key present:", !!process.env.CLERK_SECRET_KEY)

  try {
    const client = await clerkClientFactory()
    console.log("[Clerk] Client created:", !!client)
    console.log("[Clerk] Client type:", typeof client)
    console.log("[Clerk] Has users:", !!client?.users)

    if (!client) {
      throw new Error("clerkClientFactory() returned undefined")
    }

    return client
  } catch (error) {
    console.error("[Clerk] Initialization failed:", error)
    throw error
  }
}
```

---

## Verification Steps (After Fixes)

### 1. Verify Clerk Client Works
```bash
# Should NOT see any "[Auth] ❌ Failed to auto-sync user" errors
# Check logs after triggering auth flow
```

### 2. Verify Build Cache Cleared
```bash
ls -la apps/web/.next  # Should exist and be recent
# No "Module parse failed" errors in logs
```

### 3. Test User Flow End-to-End
1. Sign up new user in Clerk
2. Check database for user creation:
   ```sql
   SELECT * FROM users WHERE "clerkUserId" = 'user_xxx';
   ```
3. Try to schedule a delivery
4. Should NOT see "Failed to schedule delivery" error

---

## Long-term Recommendations

### 1. Add Clerk Client Health Check

**Create** `apps/web/server/lib/health-checks.ts`:

```typescript
export async function checkClerkHealth(): Promise<boolean> {
  try {
    const clerk = await getClerkClient()
    await clerk.users.getUserList({ limit: 1 })
    return true
  } catch (error) {
    console.error("[Health] Clerk unhealthy:", error)
    return false
  }
}
```

### 2. Add Retry Logic for Database Operations

**Update** `apps/web/server/lib/db.ts`:

```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (attempt === maxRetries) throw error
      if (error?.code === 'P2024') {  // Connection timeout
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        continue
      }
      throw error
    }
  }
  throw new Error("withRetry: Unreachable code")
}
```

### 3. Add Circuit Breaker for Clerk Calls

Prevent cascading failures when Clerk API is down or rate-limited.

---

## Files to Review/Modify

### Critical Files
1. ✅ `apps/web/server/lib/clerk.ts` - Add error handling and logging
2. ✅ `apps/web/server/lib/auth.ts` - Add null checks before clerk.users calls
3. ✅ `apps/web/.env.local` - Verify CLERK_SECRET_KEY is set

### Build Files
4. ✅ `apps/web/.next/` - Delete and rebuild
5. ✅ `node_modules/.cache/` - Clear if issues persist

### Configuration Files
6. ⚠️ `packages/prisma/schema.prisma` - Add connection pooling config
7. ⚠️ `apps/web/server/lib/db.ts` - Add connection limits

---

## Testing Checklist

- [ ] Stop all dev servers
- [ ] Clear `.next` cache
- [ ] Verify `CLERK_SECRET_KEY` in `.env.local`
- [ ] Add Clerk client error handling
- [ ] Restart dev servers
- [ ] Test user signup flow
- [ ] Test delivery scheduling
- [ ] Monitor logs for "[Auth] ❌" errors
- [ ] Verify no "Module parse failed" errors
- [ ] Check database connections don't exhaust

---

**Status**: 🔴 CRITICAL - Blocks all user operations
**Priority**: P0 - Immediate fix required
**Est. Time to Fix**: 30 minutes (Clerk client fix + cache clear)

---

**Next Step**: Implement Fix #1 (Clerk Client) + Fix #2 (Cache Clear)
