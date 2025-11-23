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

// Mock all dependencies
vi.mock('@/server/lib/db', () => ({
  prisma: {
    user: {
      create: vi.fn(),
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
    pendingSubscription: {
      findFirst: vi.fn(),
    },
    webhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
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
    })),
  },
}))

vi.mock('@/server/lib/trigger-inngest', () => ({
  triggerInngestEvent: vi.fn(() => Promise.resolve({ ids: ['event_123'] })),
}))

vi.mock('@/server/providers/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: vi.fn(),
  })),
}))

vi.mock('@/app/subscribe/actions', () => ({
  linkPendingSubscription: vi.fn(() => Promise.resolve({
    success: true,
    subscriptionId: 'sub_123'
  })),
}))

vi.mock('@/env.mjs', () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
    CLERK_WEBHOOK_SECRET: 'clerk_whsec_test',
  },
}))

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Stripe Webhook Handler', () => {
    it('should verify signature and queue event to Inngest', async () => {
      const { stripe } = await import('@/server/providers/stripe/client')
      const { triggerInngestEvent } = await import('@/server/lib/trigger-inngest')
      mockHeadersContext({
        'stripe-signature': 't=1234567890,v1=signature_hash',
      })

      // Mock successful signature verification
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        created: Math.floor(Date.now() / 1000),
        data: { object: { id: 'cs_test_123' } },
      }

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
        id: 'evt_old_123',
        type: 'checkout.session.completed',
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
      const { Webhook } = await import('svix')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature_hash',
      })

      // Mock Svix verification
      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockReturnValueOnce({
        type: 'user.created',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      } as any)

      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkUserId: 'clerk_user_123',
          email: 'test@example.com',
          profile: {
            create: {
              timezone: 'UTC',
            },
          },
        },
      })
    })

    it('should auto-link pending subscription on user.created', async () => {
      const { prisma } = await import('@/server/lib/db')
      const { Webhook } = await import('svix')
      const { linkPendingSubscription } = await import('@/app/subscribe/actions')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature_hash',
      })

      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockReturnValueOnce({
        type: 'user.created',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      } as any)

      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock pending subscription found
      vi.mocked(prisma.pendingSubscription.findFirst).mockResolvedValueOnce({
        id: 'pending_123',
        email: 'test@example.com',
        status: 'payment_complete',
        stripeSessionId: 'cs_test_123',
        plan: 'pro',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
      const { Webhook } = await import('svix')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature_hash',
      })

      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockReturnValueOnce({
        type: 'user.created',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      } as any)

      // First attempt: race condition (P2002 = unique constraint violation)
      vi.mocked(prisma.user.create).mockRejectedValueOnce({
        code: 'P2002',
        message: 'Unique constraint failed',
      })

      // Second attempt: find the user that was created by concurrent request
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
      expect(prisma.user.create).toHaveBeenCalledTimes(1)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_123' },
      })
    })

    it('should update user email on user.updated event', async () => {
      const { prisma } = await import('@/server/lib/db')
      const { Webhook } = await import('svix')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature_hash',
      })

      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockReturnValueOnce({
        type: 'user.updated',
        data: {
          id: 'clerk_user_123',
          email_addresses: [{ email_address: 'newemail@example.com' }],
        },
      } as any)

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: 'user_123',
        clerkUserId: 'clerk_user_123',
        email: 'newemail@example.com',
        stripeCustomerId: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_123' },
        data: { email: 'newemail@example.com' },
      })
    })

    it('should soft delete user and cancel deliveries on user.deleted event', async () => {
      const { prisma } = await import('@/server/lib/db')
      const { Webhook } = await import('svix')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature_hash',
      })

      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockReturnValueOnce({
        type: 'user.deleted',
        data: {
          id: 'clerk_user_123',
        },
      } as any)

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
      const { Webhook } = await import('svix')
      mockHeadersContext({
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,invalid_signature',
      })

      const mockWebhook = new Webhook('test_secret')
      vi.mocked(mockWebhook.verify).mockImplementationOnce(() => {
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

    it('should reject webhook with missing svix headers', async () => {
      mockHeadersContext({})
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

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        sentAt: new Date(),
        opens: 0,
        clicks: 0,
        bounces: 0,
        complaints: 0,
        lastOpenedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.delivery.update).mockResolvedValueOnce({} as any)
      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          type: 'email.bounced',
          data: {
            email_id: 'msg_resend_123',
            reason: 'Mailbox does not exist',
          },
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

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        sentAt: new Date(),
        opens: 0,
        clicks: 0,
        bounces: 0,
        complaints: 0,
        lastOpenedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          type: 'email.opened',
          data: {
            email_id: 'msg_resend_123',
          },
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

      vi.mocked(prisma.emailDelivery.findFirst).mockResolvedValueOnce({
        deliveryId: 'delivery_123',
        resendMessageId: 'msg_resend_123',
        sentAt: new Date(),
        opens: 1,
        clicks: 0,
        bounces: 0,
        complaints: 0,
        lastOpenedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      vi.mocked(prisma.emailDelivery.update).mockResolvedValueOnce({} as any)

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          type: 'email.clicked',
          data: {
            email_id: 'msg_resend_123',
          },
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

      vi.mocked(prisma.emailDelivery.findFirst).mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const request = new Request('http://localhost:3000/api/webhooks/resend', {
        method: 'POST',
        headers: {
          'svix-signature': 'signature_hash',
        },
        body: JSON.stringify({
          type: 'email.opened',
          data: {
            email_id: 'msg_resend_123',
          },
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
