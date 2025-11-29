/**
 * Vitest Test Setup
 *
 * Global test configuration and mocks.
 */

import { beforeAll, afterEach, afterAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Extend Vitest matchers
import "@testing-library/jest-dom/vitest"

// ============================================================================
// Environment Variables
// ============================================================================

// Mock environment variables BEFORE any imports
;(process.env as any).NODE_ENV = "test"
process.env.SKIP_ENV_VALIDATION = "true"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CRYPTO_MASTER_KEY_V1 = "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=" // Base64 test key (exactly 32 bytes)
process.env.CRYPTO_MASTER_KEY_RUNTIME_ONLY = "true" // Force runtime-only mode (bypass env.mjs snapshot)
process.env.STRIPE_SECRET_KEY = "sk_test_mock"
process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CLERK_SECRET_KEY = "sk_test_mock"
process.env.CLERK_WEBHOOK_SECRET = "whsec_test_mock"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock"
process.env.RESEND_API_KEY = "re_test_mock"
process.env.RESEND_WEBHOOK_SECRET = "whsec_XAPoE+wn99ZKZC50ia725EC/aEDjei3a"
process.env.POSTMARK_SERVER_TOKEN = "pm_test_mock"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/capsulenote_test"
process.env.CRON_SECRET = "test_cron_secret"
process.env.INNGEST_SIGNING_KEY = "signkey-test-mock"
process.env.INNGEST_EVENT_KEY = "test"
process.env.EMAIL_FROM = "test@capsulenote.test"
process.env.UPSTASH_REDIS_REST_URL = "http://localhost:6379"
process.env.UPSTASH_REDIS_REST_TOKEN = "test_token"

// Validate critical test secrets early to fail fast on invalid fixtures
function assertValidBase64Key(key: string, expectedBytes: number, label: string) {
  try {
    const decoded = Buffer.from(key, "base64")
    if (decoded.length !== expectedBytes) {
      throw new Error(`expected ${expectedBytes} bytes, got ${decoded.length}`)
    }
  } catch (err) {
    throw new Error(`[Test Setup] Invalid ${label}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

assertValidBase64Key(process.env.CRYPTO_MASTER_KEY_V1!, 32, "CRYPTO_MASTER_KEY_V1")

// ============================================================================
// Next.js Mocks
// ============================================================================

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock Next.js cache functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock Next.js server components
vi.mock("server-only", () => ({}))

// ============================================================================
// Environment Variables Mock (env.mjs)
// ============================================================================

vi.mock("@/env.mjs", () => ({
  env: new Proxy({}, {
    get: (target, prop) => {
      // Return from process.env for test values
      return process.env[prop as string]
    }
  })
}))

// ============================================================================
// Upstash Redis Mock
// ============================================================================

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve("OK")),
    del: vi.fn(() => Promise.resolve(1)),
    incr: vi.fn(() => Promise.resolve(1)),
    expire: vi.fn(() => Promise.resolve(1)),
    ttl: vi.fn(() => Promise.resolve(-1)),
  })),
}))

// ============================================================================
// Clerk Mock
// ============================================================================

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => Promise.resolve({ userId: "user_test_123" }),
  currentUser: () =>
    Promise.resolve({
      id: "user_test_123",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      primaryEmailAddressId: "email_123",
    }),
  clerkClient: () => Promise.resolve({
    users: {
      getUser: vi.fn(() =>
        Promise.resolve({
          id: "user_test_123",
          emailAddresses: [{ emailAddress: "test@example.com" }],
        })
      ),
      updateUser: vi.fn(() => Promise.resolve({})),
      deleteUser: vi.fn(() => Promise.resolve({})),
    },
  }),
}))

// ============================================================================
// Inngest Mock
// ============================================================================

vi.mock("inngest", () => ({
  Inngest: vi.fn(() => ({
    send: vi.fn(() => Promise.resolve({ ids: ["test_event_id"] })),
    createFunction: vi.fn(),
  })),
}))

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
