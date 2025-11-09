"use server"

import { revalidatePath } from "next/cache"
import { createLetterSchema, updateLetterSchema } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"

export async function createLetter(input: unknown) {
  const user = await requireUser()

  const validated = createLetterSchema.parse(input)

  const letter = await prisma.letter.create({
    data: {
      userId: user.id,
      title: validated.title,
      bodyRich: validated.bodyRich,
      bodyHtml: validated.bodyHtml,
      tags: validated.tags,
      visibility: validated.visibility,
    },
  })

  await createAuditEvent({
    userId: user.id,
    type: "letter.created",
    data: { letterId: letter.id, title: letter.title },
  })

  revalidatePath("/letters")
  revalidatePath("/dashboard")

  return { success: true, letterId: letter.id }
}

export async function updateLetter(input: unknown) {
  const user = await requireUser()

  const validated = updateLetterSchema.parse(input)
  const { id, ...data } = validated

  // Verify ownership
  const existing = await prisma.letter.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  })

  if (!existing) {
    throw new Error("Letter not found")
  }

  const letter = await prisma.letter.update({
    where: { id },
    data,
  })

  await createAuditEvent({
    userId: user.id,
    type: "letter.updated",
    data: { letterId: letter.id },
  })

  revalidatePath(`/letters/${id}`)
  revalidatePath("/letters")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteLetter(letterId: string) {
  const user = await requireUser()

  // Verify ownership
  const existing = await prisma.letter.findFirst({
    where: { id: letterId, userId: user.id, deletedAt: null },
  })

  if (!existing) {
    throw new Error("Letter not found")
  }

  // Soft delete
  await prisma.letter.update({
    where: { id: letterId },
    data: { deletedAt: new Date() },
  })

  await createAuditEvent({
    userId: user.id,
    type: "letter.deleted",
    data: { letterId },
  })

  revalidatePath("/letters")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getLetters() {
  const user = await requireUser()

  const letters = await prisma.letter.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { deliveries: true },
      },
    },
  })

  return letters
}

export async function getLetter(letterId: string) {
  const user = await requireUser()

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      userId: user.id,
      deletedAt: null,
    },
    include: {
      deliveries: {
        include: {
          emailDelivery: true,
          mailDelivery: true,
        },
        orderBy: {
          deliverAt: "asc",
        },
      },
    },
  })

  if (!letter) {
    throw new Error("Letter not found")
  }

  return letter
}
