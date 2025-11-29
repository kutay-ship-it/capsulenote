/**
 * Enhanced Mock Factories for Testing
 *
 * Provides comprehensive mock factories for all entities used in tests.
 * These factories create realistic test data with sensible defaults.
 */

import { vi } from "vitest"
import type Stripe from "stripe"

// ============================================================================
// Stripe Mock Factories
// ============================================================================

/**
 * Create a mock Stripe event
 */
export function createMockStripeEvent<T = object>(
  type: string,
  data: T,
  overrides: Partial<Stripe.Event> = {}
): Stripe.Event {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    object: "event",
    api_version: "2023-10-16",
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: data as Stripe.Event.Data.Object,
    },
    livemode: false,
    pending_webhooks: 0,
    request: { id: "req_test", idempotency_key: null },
    ...overrides,
  } as Stripe.Event
}

/**
 * Create a mock Stripe checkout session
 */
export function createMockStripeCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {}
): Stripe.Checkout.Session {
  return {
    id: `cs_test_${Math.random().toString(36).slice(2)}`,
    object: "checkout.session",
    customer: "cus_test_123",
    customer_email: "test@example.com",
    mode: "subscription",
    payment_status: "paid",
    status: "complete",
    subscription: "sub_test_123",
    url: "https://checkout.stripe.com/test",
    success_url: "http://localhost:3000/checkout/success",
    cancel_url: "http://localhost:3000/checkout/cancel",
    metadata: {
      userId: "user_test_123",
      plan: "DIGITAL_CAPSULE",
    },
    ...overrides,
  } as Stripe.Checkout.Session
}

/**
 * Create a mock Stripe subscription
 */
export function createMockStripeSubscription(
  overrides: Partial<Stripe.Subscription> = {}
): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000)
  return {
    id: `sub_test_${Math.random().toString(36).slice(2)}`,
    object: "subscription",
    customer: "cus_test_123",
    status: "active",
    current_period_start: now,
    current_period_end: now + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    trial_end: null,
    items: {
      object: "list",
      data: [
        {
          id: "si_test_123",
          price: {
            id: "price_test_123",
            metadata: { plan: "DIGITAL_CAPSULE" },
          } as Stripe.Price,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "",
    },
    metadata: { plan: "DIGITAL_CAPSULE" },
    ...overrides,
  } as Stripe.Subscription
}

/**
 * Create a mock Stripe invoice
 */
export function createMockStripeInvoice(
  overrides: Partial<Stripe.Invoice> = {}
): Stripe.Invoice {
  return {
    id: `inv_test_${Math.random().toString(36).slice(2)}`,
    object: "invoice",
    customer: "cus_test_123",
    subscription: "sub_test_123",
    status: "paid",
    amount_due: 900,
    amount_paid: 900,
    currency: "usd",
    payment_intent: "pi_test_123",
    number: "INV-001",
    hosted_invoice_url: "https://invoice.stripe.com/test",
    invoice_pdf: "https://invoice.stripe.com/test.pdf",
    attempt_count: 1,
    ...overrides,
  } as Stripe.Invoice
}

/**
 * Create a mock Stripe customer
 */
export function createMockStripeCustomer(
  overrides: Partial<Stripe.Customer> = {}
): Stripe.Customer {
  return {
    id: `cus_test_${Math.random().toString(36).slice(2)}`,
    object: "customer",
    email: "test@example.com",
    name: "Test User",
    metadata: {},
    ...overrides,
  } as Stripe.Customer
}

// ============================================================================
// Database Mock Factories
// ============================================================================

/**
 * Create a mock user with profile
 */
export function createMockUserWithProfile(overrides: {
  user?: Partial<any>
  profile?: Partial<any>
} = {}) {
  const userId = `user_${Math.random().toString(36).slice(2)}`
  return {
    id: userId,
    clerkUserId: `clerk_${Math.random().toString(36).slice(2)}`,
    email: "test@example.com",
    stripeCustomerId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides.user,
    profile: {
      userId,
      displayName: "Test User",
      timezone: "America/New_York",
      stripeCustomerId: null,
      pushEnabled: false,
      marketingOptIn: false,
      onboardingCompleted: false,
      referredByCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides.profile,
    },
  }
}

/**
 * Create a mock delivery with related data
 */
export function createMockDeliveryWithRelations(overrides: {
  delivery?: Partial<any>
  letter?: Partial<any>
  user?: Partial<any>
  emailDelivery?: Partial<any>
} = {}) {
  const deliveryId = `del_${Math.random().toString(36).slice(2)}`
  const letterId = `let_${Math.random().toString(36).slice(2)}`
  const userId = `user_${Math.random().toString(36).slice(2)}`

  return {
    id: deliveryId,
    userId,
    letterId,
    channel: "email" as const,
    status: "scheduled" as const,
    deliverAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    timezone: "America/New_York",
    toEmail: "recipient@example.com",
    toAddress: null,
    attemptCount: 0,
    lastAttemptAt: null,
    inngestRunId: null,
    providerMessageId: null,
    canceledAt: null,
    failureReason: null,
    failureCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides.delivery,
    letter: {
      id: letterId,
      userId,
      title: "Test Letter",
      bodyCiphertext: Buffer.from("encrypted_content"),
      bodyNonce: Buffer.from("test_nonce_12"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      shareLinkToken: `share_${Math.random().toString(36).slice(2)}`,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides.letter,
    },
    user: createMockUserWithProfile({ user: { id: userId, ...overrides.user } }),
    emailDelivery: {
      deliveryId,
      toEmail: "recipient@example.com",
      subject: "A Letter from Your Past Self",
      resendMessageId: null,
      openedAt: null,
      openCount: 0,
      clickedAt: null,
      clickCount: 0,
      ...overrides.emailDelivery,
    },
  }
}

/**
 * Create a mock subscription
 */
export function createMockSubscription(overrides: Partial<any> = {}) {
  return {
    id: `sub_${Math.random().toString(36).slice(2)}`,
    userId: `user_${Math.random().toString(36).slice(2)}`,
    stripeSubscriptionId: `sub_stripe_${Math.random().toString(36).slice(2)}`,
    stripeCustomerId: `cus_${Math.random().toString(36).slice(2)}`,
    plan: "DIGITAL_CAPSULE",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    trialEndsAt: null,
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock pending subscription
 */
export function createMockPendingSubscription(overrides: Partial<any> = {}) {
  return {
    id: `ps_${Math.random().toString(36).slice(2)}`,
    email: "test@example.com",
    plan: "DIGITAL_CAPSULE",
    stripeSessionId: `cs_test_${Math.random().toString(36).slice(2)}`,
    stripeCustomerId: `cus_${Math.random().toString(36).slice(2)}`,
    status: "awaiting_payment",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  }
}

// ============================================================================
// Request/Response Mock Factories
// ============================================================================

/**
 * Create a mock Next.js request with headers
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: string | object
  } = {}
): Request {
  const { method = "GET", headers = {}, body } = options

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  }

  if (body) {
    requestInit.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  return new Request(url, requestInit)
}

/**
 * Create mock headers for testing
 */
export function createMockHeaders(headers: Record<string, string> = {}) {
  return new Headers(headers)
}

// ============================================================================
// Encryption Mock Factories
// ============================================================================

/**
 * Test encryption key (32 bytes, base64 encoded)
 */
export const TEST_ENCRYPTION_KEY =
  "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE="

/**
 * Create mock encrypted content
 */
export function createMockEncryptedContent() {
  return {
    bodyCiphertext: Buffer.from("mock_encrypted_content_here"),
    bodyNonce: Buffer.from("mock_nonce_12"), // 12 bytes
    keyVersion: 1,
  }
}

/**
 * Create mock decrypted content
 */
export function createMockDecryptedContent() {
  return {
    bodyRich: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello from the past!" }],
        },
      ],
    },
    bodyHtml: "<p>Hello from the past!</p>",
  }
}

// ============================================================================
// Inngest Mock Factories
// ============================================================================

/**
 * Create a mock Inngest event
 */
export function createMockInngestEvent<T = object>(
  name: string,
  data: T
) {
  return {
    name,
    data,
    id: `evt_${Date.now()}`,
    ts: Date.now(),
  }
}

/**
 * Create mock Inngest step context
 */
export function createMockInngestStepContext() {
  return {
    run: vi.fn((id: string, fn: () => Promise<any>) => fn()),
    sleepUntil: vi.fn(() => Promise.resolve()),
    sleep: vi.fn(() => Promise.resolve()),
    sendEvent: vi.fn(() => Promise.resolve()),
    invoke: vi.fn(),
  }
}

// ============================================================================
// Webhook Mock Factories
// ============================================================================

/**
 * Create mock Svix headers for webhook verification
 */
export function createMockSvixHeaders(
  payload: string,
  secret: string = "whsec_test"
) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  // Note: In real tests, you'd compute actual HMAC signature
  // For mock purposes, we return placeholder values
  return {
    "svix-id": `msg_${Math.random().toString(36).slice(2)}`,
    "svix-timestamp": timestamp,
    "svix-signature": "v1,placeholder_signature",
  }
}

/**
 * Create mock Clerk webhook event
 */
export function createMockClerkWebhookEvent(
  type: "user.created" | "user.updated" | "user.deleted",
  userData: Partial<any> = {}
) {
  const userId = userData.id || `user_${Math.random().toString(36).slice(2)}`
  return {
    type,
    data: {
      id: userId,
      email_addresses: [
        {
          id: "email_123",
          email_address: userData.email || "test@example.com",
        },
      ],
      primary_email_address_id: "email_123",
      first_name: userData.firstName || "Test",
      last_name: userData.lastName || "User",
      created_at: Date.now(),
      updated_at: Date.now(),
      ...userData,
    },
  }
}

/**
 * Create mock Resend webhook event
 */
export function createMockResendWebhookEvent(
  type: "email.opened" | "email.clicked" | "email.bounced" | "email.complained",
  data: Partial<any> = {}
) {
  return {
    type,
    created_at: new Date().toISOString(),
    data: {
      email_id: data.emailId || `email_${Math.random().toString(36).slice(2)}`,
      from: data.from || "test@capsulenote.com",
      to: data.to || ["recipient@example.com"],
      subject: data.subject || "Test Email",
      ...data,
    },
  }
}
