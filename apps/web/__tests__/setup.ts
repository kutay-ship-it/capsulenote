/**
 * Vitest Test Setup
 *
 * Global test configuration and mocks.
 */

import { beforeAll, afterEach, afterAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Extend Vitest matchers
import "@testing-library/jest-dom/vitest"

// Mock environment variables BEFORE any imports
process.env.NODE_ENV = "test"
process.env.SKIP_ENV_VALIDATION = "true"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock"
process.env.CRYPTO_MASTER_KEY = "dGVzdF9rZXlfMzJfYnl0ZXNfZm9yX3Rlc3Rpbmcx" // Base64 test key
process.env.STRIPE_SECRET_KEY = "sk_test_mock"
process.env.CLERK_SECRET_KEY = "sk_test_mock"
process.env.CLERK_WEBHOOK_SECRET = "whsec_test_mock"
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock"
process.env.RESEND_API_KEY = "re_test_mock"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.CRON_SECRET = "test_cron_secret"
process.env.INNGEST_SIGNING_KEY = "signkey-test-mock"
process.env.INNGEST_EVENT_KEY = "test"
process.env.EMAIL_FROM = "test@test.com"

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "/",
}))

// Mock Next.js server components
vi.mock("server-only", () => ({}))

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
