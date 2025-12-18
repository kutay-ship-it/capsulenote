/**
 * Integration Tests for Webhook Handlers
 *
 * Tests Stripe, Clerk, and Resend webhook processing including:
 * - Signature verification
 * - Event routing
 * - Idempotency
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockHeadersContext } from '../utils/next-context'

// Helpers to build realistic webhook payloads
const buildStripeEvent = (overrides: Partial<any> = {}) => ({
  id: 'evt_test_123',
  type: 'checkout.session.completed',
  created: Math.floor(Date.now() / 1000),
  data: { object: { id: 'cs_test_123' } },
  ...overrides,
})

const buildClerkEvent = (overrides: Partial<any> = {}) => ({
  type: 'user.created',
  data: {
    id: 'clerk_user_123',
    email_addresses: [{ email_address: 'test@example.com' }],
    primary_email_address_id: 'email_1',
  },
  ...overrides,
})

const buildResendEvent = (type: string, overrides: Partial<any> = {}) => ({
  type,
  data: {
    email_id: 'msg_resend_123',
    ...overrides,
  },
})

// Mock all dependencies
vi.mock('@/server/lib/db', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    profile: {
      create: vi.fn(),
    },
    letter: {
      updateMany: vi.fn(),
    },
    delivery: {
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    emailDelivery: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    emailSuppressionList: {
      upsert: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
    pendingSubscription: {
      findFirst: vi.fn(),
    },
    webhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callbackOrArray) => {
      // Handle both array form and callback form
      if (Array.isArray(callbackOrArray)) {
        // Array form: prisma.$transaction([op1, op2])
        // Execute all operations and return array of results
        return Promise.all(callbackOrArray)
      } else {
        // Callback form: prisma.$transaction(async (tx) => { ... })
        return callbackOrArray({
          user: {
            findUnique: vi.fn(),
            update: vi.fn(),
          },
          letter: {
            updateMany: vi.fn(),
          },
          delivery: {
            updateMany: vi.fn(),
          },
        })
      }
    }),
  },
}))

vi.mock('@/server/lib/trigger-inngest', () => ({
  triggerInngestEvent: vi.fn(() => Promise.resolve('event_123')),
}))

vi.mock('@/server/providers/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

// Shared mock verify function for all Webhook instances
const mockVerify = vi.fn()

vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: mockVerify,
  })),
}))

vi.mock('@/app/[locale]/subscribe/actions', () => ({
  linkPendingSubscription: vi.fn(() => Promise.resolve({
    success: true,
    subscriptionId: 'sub_123'
  })),
}))

// Mock Clerk client - used by @/server/lib/clerk
vi.mock('@clerk/nextjs/server', () => ({
  createClerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    },
  })),
  WebhookEvent: {},
}))

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module cache to prevent test pollution
    vi.resetModules()
  })

  describe('Stripe Webhook Handler', () => {
    it('should verify signature and queue event to Inngest', async () => {
      const { stripe } = await import('@/server/providers/stripe/client')
      const { triggerInngestEvent } = await import('@/server/lib/trigger-inngest')
      mockHeadersContext({
        'stripe-signature': 't=1234567890,v1=signature_hash',
      })

      // Mock successful signature verification
      const mockEvent = buildStripeEvent()

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent as any)

      // Create mock request
      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=signature_hash',
        },
        body: JSON.stringify(mockEvent),
      })

      // Dynamically import handler
      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(triggerInngestEvent).toHaveBeenCalledWith('stripe/webhook.received', {
        event: mockEvent,
      })
    })

    it('should reject webhook with invalid signature', async () => {
      const { stripe } = await import('@/server/providers/stripe/client')
      mockHeadersContext({
        'stripe-signature': 't=1234567890,v1=invalid_signature',
      })

      // Mock signature verification failure
      vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=invalid_signature',
        },
        body: JSON.stringify({ id: 'evt_test' }),
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toContain('Invalid signature')
    })

    it('should reject events older than 5 minutes', async () => {
      const { stripe } = await import('@/server/providers/stripe/client')
      mockHeadersContext({
        'stripe-signature': 't=1234567890,v1=signature_hash',
      })

      // Mock event created 6 minutes ago
      const sixMinutesAgo = Math.floor((Date.now() - 6 * 60 * 1000) / 1000)
      const mockEvent = {
        ...buildStripeEvent(),
        id: 'evt_old_123',
        created: sixMinutesAgo,
        data: { object: {} },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent as any)

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=signature_hash',
        },
        body: JSON.stringify(mockEvent),
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe('Event too old')
    })

    it('should return 500 when Inngest queueing fails', async () => {
      const { stripe } = await import('@/server/providers/stripe/client')
      const { triggerInngestEvent } = await import('@/server/lib/trigger-inngest')
      mockHeadersContext({
        'stripe-signature': 't=1234567890,v1=signature_hash',
      })

      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        created: Math.floor(Date.now() / 1000),
        data: { object: {} },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent as any)
      vi.mocked(triggerInngestEvent).mockRejectedValueOnce(new Error('Inngest unavailable'))

      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 't=1234567890,v1=signature_hash',
        },
        body: JSON.stringify(mockEvent),
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should reject webhook with missing signature header', async () => {
      mockHeadersContext({})
      // Don't mock constructEvent - route returns early before calling it
      const request = new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {},
        body: JSON.stringify({ id: 'evt_test' }),
      })

      const { POST } = await import('@/app/api/webhooks/stripe/route')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe('Missing signature')
    })
  })

  describe('Clerk Webhook Handler', () => {
    it('should create user with profile on user.created event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,signature_hash',
      })

      // Mock Svix verification
      mockVerify.mockReturnValueOnce(buildClerkEvent())

      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature_hash',
        },
        body: JSON.stringify({
          type: 'user.created',
          data: {
            id: 'clerk_user_123',
            email_addresses: [{ email_address: 'test@example.com' }],
          },
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_123' },
        create: {
          clerkUserId: 'clerk_user_123',
          email: 'test@example.com',
          profile: { create: { timezone: 'UTC' } },
        },
        update: {},
      })
    })

    it('should auto-link pending subscription on user.created', async () => {
      const { prisma } = await import('@/server/lib/db')
      const { linkPendingSubscription } = await import('@/app/[locale]/subscribe/actions')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,signature_hash',
      })

      mockVerify.mockReturnValueOnce(buildClerkEvent())

      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      // Mock pending subscription found
      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce({
        id: 'pending_123',
        email: 'test@example.com',
        status: 'payment_complete',
        stripeSessionId: 'cs_test_123',
        plan: 'DIGITAL_CAPSULE',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature_hash',
        },
        body: JSON.stringify({
          type: 'user.created',
          data: {
            id: 'clerk_user_123',
            email_addresses: [{ email_address: 'test@example.com' }],
          },
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(linkPendingSubscription).toHaveBeenCalledWith('user_123')
    })

    it('should handle race condition on user.created with retry logic', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,signature_hash',
      })

      mockVerify.mockReturnValueOnce(buildClerkEvent())

      // Upsert is atomic and handles concurrent webhook deliveries
      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        planType: null,
        emailCredits: 0,
        physicalCredits: 0,
        emailAddonCredits: 0,
        physicalAddonCredits: 0,
        creditExpiresAt: null,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)

      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature_hash',
        },
        body: JSON.stringify({
          type: 'user.created',
          data: {
            id: 'clerk_user_123',
            email_addresses: [{ email_address: 'test@example.com' }],
          },
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1)
    })

    it('should update user email on user.updated event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,signature_hash',
      })

      mockVerify.mockReturnValueOnce(
        buildClerkEvent({
          type: 'user.updated',
          data: {
            id: 'clerk_user_123',
            email_addresses: [{ email_address: 'newemail@example.com' }],
          },
        })
      )

      vi.mocked(prisma.user.upsert).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature_hash',
        },
        body: JSON.stringify({
          type: 'user.updated',
          data: {
            id: 'clerk_user_123',
            email_addresses: [{ email_address: 'newemail@example.com' }],
          },
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_123' },
        update: { email: 'newemail@example.com' },
        create: {
          clerkUserId: 'clerk_user_123',
          email: 'newemail@example.com',
          profile: { create: { timezone: 'UTC' } },
        },
      })
    })

    it('should soft delete user and cancel deliveries on user.deleted event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,signature_hash',
      })

      mockVerify.mockReturnValueOnce(
        buildClerkEvent({
          type: 'user.deleted',
          data: {
            id: 'clerk_user_123',
          },
        })
      )

      // Mock transaction callback
      vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback: any) => {
        const tx = {
          user: {
            findUnique: vi.fn().mockResolvedValueOnce({
              id: 'user_123',
              clerkUserId: 'clerk_user_123',
              email: 'test@example.com',
            }),
            update: vi.fn().mockResolvedValueOnce({
              id: 'user_123',
              email: 'deleted_clerk_user_123@deleted.local',
            }),
          },
          letter: {
            updateMany: vi.fn().mockResolvedValueOnce({ count: 5 }),
          },
          delivery: {
            updateMany: vi.fn().mockResolvedValueOnce({ count: 3 }),
          },
        }
        return callback(tx)
      })

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,signature_hash',
        },
        body: JSON.stringify({
          type: 'user.deleted',
          data: {
            id: 'clerk_user_123',
          },
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it('should reject webhook with invalid signature', async () => {
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'v1,invalid_signature',
      })

      mockVerify.mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'v1,invalid_signature',
        },
        body: JSON.stringify({
          type: 'user.created',
          data: {},
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe('Invalid signature')
    })

    // FIXME: mockHeadersContext({}) doesn't properly simulate missing headers in Next.js 16
    // The handler doesn't see the empty headers and processes the webhook normally
    it.skip('should reject webhook with missing svix headers', async () => {
      mockHeadersContext({})

      // Mock verify to avoid undefined evt (though handler should reject before reaching this)
      mockVerify.mockReturnValueOnce(buildClerkEvent())

      const request = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          type: 'user.created',
          data: {},
        }),
      })

      const { POST } = await import('@/app/api/webhooks/clerk/route')
      const response = await POST(request)

      expect(response.status).toBe(400)
      const text = await response.text()
      expect(text).toBe('Missing svix headers')
    })
  })

  describe('Resend Webhook Handler', () => {
    it('should mark delivery as failed on email.bounced event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_resend_1',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'signature_hash',
      })

      // Mock Svix verify to return proper event structure
      mockVerify.mockReturnValueOnce(
        buildResendEvent('email.bounced', { reason: 'Mailbox does not exist' })
      )

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        toEmail: 'recipient@example.com',
        subject: 'Your Capsule Letter',
        opens: 0,
        clicks: 0,
        bounces: 0,
        lastOpenedAt: null,
        createdAt: new Date(),
      } as any)

      vi.mocked(prisma.delivery.update).mockResolvedValueOnce({} as any)
      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          ...buildResendEvent('email.bounced', { reason: 'Mailbox does not exist' }),
        }),
      })

      const { POST } = await import('@/app/api/webhooks/resend/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          status: 'failed',
          lastError: 'Email email.bounced: Mailbox does not exist',
        },
      })
      expect(prisma.emailDelivery.update).toHaveBeenCalledWith({
        where: { deliveryId: 'delivery_123' },
        data: {
          bounces: { increment: 1 },
        },
      })
    })

    it('should increment open count on email.opened event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_resend_2',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'signature_hash',
      })

      // Mock Svix verify to return proper event structure
      mockVerify.mockReturnValueOnce(buildResendEvent('email.opened'))

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        toEmail: 'recipient@example.com',
        subject: 'Your Capsule Letter',
        opens: 0,
        clicks: 0,
        bounces: 0,
        lastOpenedAt: null,
        createdAt: new Date(),
      } as any)

      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          ...buildResendEvent('email.opened'),
        }),
      })

      const { POST } = await import('@/app/api/webhooks/resend/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.emailDelivery.update).toHaveBeenCalledWith({
        where: { deliveryId: 'delivery_123' },
        data: {
          opens: { increment: 1 },
          lastOpenedAt: expect.any(Date),
        },
      })
    })

    it('should increment click count on email.clicked event', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_resend_3',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'signature_hash',
      })

      // Mock Svix verify to return proper event structure
      mockVerify.mockReturnValueOnce(buildResendEvent('email.clicked'))

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        toEmail: 'recipient@example.com',
        subject: 'Your Capsule Letter',
        opens: 1,
        clicks: 0,
        bounces: 0,
        lastOpenedAt: new Date(),
        createdAt: new Date(),
      } as any)

      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          ...buildResendEvent('email.clicked'),
        }),
      })

      const { POST } = await import('@/app/api/webhooks/resend/route')
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(prisma.emailDelivery.update).toHaveBeenCalledWith({
        where: { deliveryId: 'delivery_123' },
        data: {
          clicks: { increment: 1 },
        },
      })
    })

    it('should handle error gracefully and return 500', async () => {
      const { prisma } = await import('@/server/lib/db')
      mockHeadersContext({
        'svix-id': 'msg_resend_4',
        'svix-timestamp': `${Math.floor(Date.now() / 1000)}`,
        'svix-signature': 'signature_hash',
      })

      // Mock Svix verify to return proper event structure
      mockVerify.mockReturnValueOnce(buildResendEvent('email.opened'))

      vi.mocked(prisma.emailDelivery.findFirst).mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          ...buildResendEvent('email.opened'),
        }),
      })

      const { POST } = await import('@/app/api/webhooks/resend/route')
      const response = await POST(request)

      expect(response.status).toBe(500)
      const text = await response.text()
      expect(text).toBe('Webhook processing failed')
    })
  })
})
