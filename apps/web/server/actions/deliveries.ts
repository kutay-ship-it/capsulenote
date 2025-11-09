"use server"

import { revalidatePath } from "next/cache"
import {
  scheduleDeliverySchema,
  updateDeliverySchema,
  cancelDeliverySchema,
} from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"

export async function scheduleDelivery(input: unknown) {
  const user = await requireUser()

  const validated = scheduleDeliverySchema.parse(input)

  // Verify letter ownership
  const letter = await prisma.letter.findFirst({
    where: {
      id: validated.letterId,
      userId: user.id,
      deletedAt: null,
    },
  })

  if (!letter) {
    throw new Error("Letter not found")
  }

  // Create delivery
  const delivery = await prisma.delivery.create({
    data: {
      userId: user.id,
      letterId: validated.letterId,
      channel: validated.channel,
      deliverAt: validated.deliverAt,
      timezoneAtCreation: validated.timezone,
      status: "scheduled",
    },
  })

  // Create channel-specific delivery record
  if (validated.channel === "email") {
    await prisma.emailDelivery.create({
      data: {
        deliveryId: delivery.id,
        toEmail: validated.toEmail ?? user.email,
        subject: `Letter to your future self: ${letter.title}`,
      },
    })
  } else if (validated.channel === "mail" && validated.shippingAddressId) {
    await prisma.mailDelivery.create({
      data: {
        deliveryId: delivery.id,
        shippingAddressId: validated.shippingAddressId,
        printOptions: validated.printOptions ?? { color: false, doubleSided: false },
      },
    })
  }

  // Trigger Inngest workflow to schedule delivery
  // Note: In production, import and use inngest client here
  // Example: await inngest.send({ name: "delivery.scheduled", data: { deliveryId: delivery.id } })

  await createAuditEvent({
    userId: user.id,
    type: "delivery.scheduled",
    data: {
      deliveryId: delivery.id,
      letterId: validated.letterId,
      channel: validated.channel,
      deliverAt: validated.deliverAt.toISOString(),
    },
  })

  revalidatePath(`/letters/${validated.letterId}`)
  revalidatePath("/deliveries")
  revalidatePath("/dashboard")

  return { success: true, deliveryId: delivery.id }
}

export async function updateDelivery(input: unknown) {
  const user = await requireUser()

  const validated = updateDeliverySchema.parse(input)
  const { deliveryId, ...data } = validated

  // Verify ownership and status
  const existing = await prisma.delivery.findFirst({
    where: {
      id: deliveryId,
      userId: user.id,
      status: { in: ["scheduled", "failed"] },
    },
  })

  if (!existing) {
    throw new Error("Delivery not found or cannot be updated")
  }

  const delivery = await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      ...(data.deliverAt && { deliverAt: data.deliverAt }),
      ...(data.timezone && { timezoneAtCreation: data.timezone }),
    },
  })

  await createAuditEvent({
    userId: user.id,
    type: "delivery.updated",
    data: { deliveryId: delivery.id },
  })

  revalidatePath(`/deliveries/${deliveryId}`)
  revalidatePath("/deliveries")

  return { success: true }
}

export async function cancelDelivery(input: unknown) {
  const user = await requireUser()

  const validated = cancelDeliverySchema.parse(input)

  // Verify ownership and status
  const existing = await prisma.delivery.findFirst({
    where: {
      id: validated.deliveryId,
      userId: user.id,
      status: { in: ["scheduled", "failed"] },
    },
  })

  if (!existing) {
    throw new Error("Delivery not found or cannot be canceled")
  }

  await prisma.delivery.update({
    where: { id: validated.deliveryId },
    data: { status: "canceled" },
  })

  await createAuditEvent({
    userId: user.id,
    type: "delivery.canceled",
    data: { deliveryId: validated.deliveryId },
  })

  revalidatePath(`/deliveries/${validated.deliveryId}`)
  revalidatePath("/deliveries")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getDeliveries() {
  const user = await requireUser()

  const deliveries = await prisma.delivery.findMany({
    where: { userId: user.id },
    include: {
      letter: {
        select: {
          id: true,
          title: true,
        },
      },
      emailDelivery: true,
      mailDelivery: true,
    },
    orderBy: {
      deliverAt: "asc",
    },
  })

  return deliveries
}
