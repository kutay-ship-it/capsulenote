/**
 * Test Utilities and Helpers
 *
 * Provides common utilities for testing including:
 * - Test user creation
 * - Test letter creation
 * - Test delivery creation
 * - Database cleanup
 * - Mock factories
 */

import { vi } from 'vitest'
import type { User, Profile, Letter, Delivery } from '@prisma/client'

// ============================================================================
// Type Definitions
// ============================================================================

export type TestUser = User & {
  profile: Profile | null
}

export type TestLetter = Letter

export type TestDelivery = Delivery

// ============================================================================
// Mock Factories
// ============================================================================

/**
 * Create a mock Clerk user object
 */
export function createMockClerkUser(overrides: Partial<any> = {}) {
  return {
    id: 'user_test_123',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [
      {
        id: 'email_123',
        emailAddress: 'test@example.com',
      },
    ],
    primaryEmailAddressId: 'email_123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

/**
 * Create a mock test user for database operations
 */
export function createTestUserData(overrides: Partial<User> = {}): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    clerkUserId: `clerk_test_${Math.random().toString(36).substring(7)}`,
    email: `test-${Math.random().toString(36).substring(7)}@example.com`,
    planType: null,
    emailCredits: 0,
    physicalCredits: 0,
    emailAddonCredits: 0,
    physicalAddonCredits: 0,
    creditExpiresAt: null,
    timezone: 'UTC',
    ...overrides,
  }
}

/**
 * Create a mock test profile
 */
export function createTestProfileData(userId: string, overrides: Partial<Profile> = {}): Omit<Profile, 'createdAt' | 'updatedAt'> {
  return {
    userId,
    displayName: 'Test User',
    timezone: 'America/New_York',
    marketingOptIn: false,
    onboardingCompleted: false,
    stripeCustomerId: null,
    pushEnabled: false,
    referredByCode: null,
    ...overrides,
  }
}

/**
 * Create a mock test letter
 */
export function createTestLetterData(userId: string, overrides: Partial<Letter> = {}): Omit<Letter, 'id' | 'createdAt' | 'updatedAt'> {
  // Create encrypted content buffers
  const bodyCiphertext = Buffer.from('encrypted_test_content')
  const bodyNonce = Buffer.from('test_nonce_12')

  return {
    userId,
    title: 'Test Letter',
    bodyCiphertext,
    bodyNonce,
    bodyFormat: 'rich',
    keyVersion: 1,
    visibility: 'private',
    tags: [],
    type: 'email',
    status: 'DRAFT',
    scheduledFor: null,
    timezone: 'UTC',
    lockedAt: null,
    shareLinkToken: `share_${Math.random().toString(36).substring(7)}`,
    firstOpenedAt: null,
    deletedAt: null,
    ...overrides,
  } as Omit<Letter, 'id' | 'createdAt' | 'updatedAt'>
}

/**
 * Create a mock test delivery
 */
export function createTestDeliveryData(
  userId: string,
  letterId: string,
  overrides: Partial<Delivery> = {}
): Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date()
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow

  return {
    userId,
    letterId,
    channel: 'email',
    status: 'scheduled',
    deliverAt: futureDate,
    timezoneAtCreation: 'America/New_York',
    attemptCount: 0,
    inngestRunId: null,
    lastError: null,
    ...overrides,
  } as Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>
}

// ============================================================================
// Mock Functions
// ============================================================================

/**
 * Mock Clerk authentication
 */
export function mockClerkAuth(user: { userId: string } | null = { userId: 'user_test_123' }) {
  const { auth } = vi.hoisted(() => ({
    auth: vi.fn(),
  }))

  vi.mock('@clerk/nextjs/server', () => ({
    auth: () => Promise.resolve(user),
    currentUser: () => Promise.resolve(user ? createMockClerkUser({ id: user.userId }) : null),
    clerkClient: () => Promise.resolve({
      users: {
        getUser: vi.fn(() => Promise.resolve(createMockClerkUser({ id: user?.userId }))),
        updateUser: vi.fn(() => Promise.resolve(createMockClerkUser({ id: user?.userId }))),
        deleteUser: vi.fn(() => Promise.resolve({ id: user?.userId, deleted: true })),
      },
    }),
  }))

  return auth
}

/**
 * Mock Inngest client
 */
export function mockInngestClient() {
  const sendMock = vi.fn(() => Promise.resolve({ ids: ['test_event_id'] }))

  vi.mock('inngest', () => ({
    Inngest: vi.fn(() => ({
      send: sendMock,
      createFunction: vi.fn(),
    })),
  }))

  return { send: sendMock }
}

/**
 * Mock Stripe client
 */
export function mockStripeClient() {
  const createCheckoutSessionMock = vi.fn(() =>
    Promise.resolve({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    })
  )

  const createCustomerMock = vi.fn(() =>
    Promise.resolve({
      id: 'cus_test_123',
      email: 'test@example.com',
    })
  )

  const createPortalSessionMock = vi.fn(() =>
    Promise.resolve({
      id: 'ps_test_123',
      url: 'https://billing.stripe.com/test',
    })
  )

  vi.mock('stripe', () => ({
    default: vi.fn(() => ({
      checkout: {
        sessions: {
          create: createCheckoutSessionMock,
        },
      },
      customers: {
        create: createCustomerMock,
      },
      billingPortal: {
        sessions: {
          create: createPortalSessionMock,
        },
      },
      webhooks: {
        constructEvent: vi.fn((payload, sig, secret) => ({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              customer: 'cus_test_123',
            },
          },
        })),
      },
    })),
  }))

  return {
    createCheckoutSession: createCheckoutSessionMock,
    createCustomer: createCustomerMock,
    createPortalSession: createPortalSessionMock,
  }
}

/**
 * Mock Resend email provider
 */
export function mockResendClient() {
  const sendMock = vi.fn(() =>
    Promise.resolve({
      id: 'email_test_123',
      from: 'test@test.com',
      to: 'recipient@test.com',
    })
  )

  vi.mock('resend', () => ({
    Resend: vi.fn(() => ({
      emails: {
        send: sendMock,
      },
    })),
  }))

  return { send: sendMock }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Wait for a specific amount of time (for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random UUID for testing
 */
export function generateTestUUID(): string {
  return `test-${crypto.randomUUID()}`
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
  return `test-${Math.random().toString(36).substring(7)}@example.com`
}

/**
 * Create a date in the future for testing
 */
export function futureDate(daysFromNow: number = 1): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

/**
 * Create a date in the past for testing
 */
export function pastDate(daysAgo: number = 1): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that a value is defined (not null or undefined)
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined')
  }
}

/**
 * Assert that an async function throws an error
 */
export async function assertThrows(fn: () => Promise<any>, expectedError?: string): Promise<void> {
  try {
    await fn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (expectedError && error instanceof Error) {
      if (!error.message.includes(expectedError)) {
        throw new Error(`Expected error message to include "${expectedError}", but got "${error.message}"`)
      }
    }
  }
}

// ============================================================================
// Test Data Cleanup
// ============================================================================

/**
 * Cleanup test data (placeholder - implement with actual DB operations)
 *
 * In integration tests, this would delete test users, letters, deliveries, etc.
 * For now, this is a placeholder for the test infrastructure.
 */
export async function cleanupTestData(identifiers: {
  userIds?: string[]
  letterIds?: string[]
  deliveryIds?: string[]
}): Promise<void> {
  // This would be implemented with actual Prisma operations in integration tests
  // For unit tests, this is not needed as we use mocks
  console.log('Cleanup test data:', identifiers)
}
