/**
 * Customer Event Handlers
 *
 * Handles customer.* webhook events from Stripe:
 * - customer.created
 * - customer.updated  
 * - customer.deleted
 */

import Stripe from "stripe"
import { prisma } from "@dearme/prisma"

/**
 * Handle customer.created event
 *
 * Customer creation is primarily handled in Clerk webhook.
 * This handler is for logging/audit purposes only.
 *
 * @param customer - Stripe Customer object
 */
export async function handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
  console.log("[Customer Handler] Customer created", {
    customerId: customer.id,
    email: customer.email,
  })

  // Audit log only - user should already exist from Clerk webhook
  // If we find a user, record audit event
  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customer.id },
  })

  if (profile) {
    await prisma.auditEvent.create({
      data: {
        userId: profile.userId,
        type: "stripe.customer.created",
        data: {
          customerId: customer.id,
          email: customer.email,
        },
      },
    })
  }
}

/**
 * Handle customer.updated event
 *
 * Syncs customer metadata changes from Stripe to our database.
 *
 * @param customer - Stripe Customer object
 */
export async function handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
  console.log("[Customer Handler] Customer updated", {
    customerId: customer.id,
    email: customer.email,
  })

  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customer.id },
    include: { user: true },
  })

  if (!profile) {
    console.warn("[Customer Handler] User not found for customer update", {
      customerId: customer.id,
    })
    return
  }

  // Sync email if changed (Clerk is source of truth but keep in sync)
  if (customer.email && profile.user && customer.email !== profile.user.email) {
    console.log("[Customer Handler] Customer email changed in Stripe", {
      customerId: customer.id,
      oldEmail: profile.user.email,
      newEmail: customer.email,
    })

    // Note: Don't update user.email here - Clerk is source of truth
    // This is just for logging mismatches
  }

  // Record audit event
  await prisma.auditEvent.create({
    data: {
      userId: profile.userId,
      type: "stripe.customer.updated",
      data: {
        customerId: customer.id,
        email: customer.email,
        metadata: customer.metadata,
      },
    },
  })
}

/**
 * Handle customer.deleted event
 *
 * Cleanup when customer is deleted in Stripe.
 * This should rarely happen - prefer keeping customer records.
 *
 * @param customer - Stripe Customer object
 */
export async function handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
  console.log("[Customer Handler] Customer deleted", {
    customerId: customer.id,
  })

  const profile = await prisma.profile.findUnique({
    where: { stripeCustomerId: customer.id },
  })

  if (!profile) {
    console.warn("[Customer Handler] User not found for customer deletion", {
      customerId: customer.id,
    })
    return
  }

  // Remove stripeCustomerId from profile
  await prisma.profile.update({
    where: { userId: profile.userId },
    data: {
      stripeCustomerId: null,
    },
  })

  // Cancel any active subscriptions
  await prisma.subscription.updateMany({
    where: {
      userId: profile.userId,
      status: { in: ["active", "trialing"] },
    },
    data: {
      status: "canceled",
    },
  })

  // Record audit event
  await prisma.auditEvent.create({
    data: {
      userId: profile.userId,
      type: "stripe.customer.deleted",
      data: {
        customerId: customer.id,
      },
    },
  })

  console.log("[Customer Handler] Customer cleanup completed", {
    customerId: customer.id,
    userId: profile.userId,
  })
}
