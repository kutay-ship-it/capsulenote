"use server"

import { revalidatePath } from "next/cache"
import { createLetterSchema, updateLetterSchema } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { createAuditEvent } from "@/server/lib/audit"
import { encryptLetter, decryptLetter } from "@/server/lib/encryption"

export async function createLetter(input: unknown) {
  const user = await requireUser()

  const validated = createLetterSchema.parse(input)

  // Encrypt letter content
  const encrypted = await encryptLetter({
    bodyRich: validated.bodyRich,
    bodyHtml: validated.bodyHtml,
  })

  const letter = await prisma.letter.create({
    data: {
      userId: user.id,
      title: validated.title,
      bodyCiphertext: encrypted.bodyCiphertext,
      bodyNonce: encrypted.bodyNonce,
      bodyFormat: "rich",
      keyVersion: encrypted.keyVersion,
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

  // Prepare update data
  const updateData: {
    title?: string
    bodyCiphertext?: Buffer
    bodyNonce?: Buffer
    keyVersion?: number
    tags?: string[]
    visibility?: "private" | "link"
  } = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.visibility !== undefined) updateData.visibility = data.visibility

  // If body content is being updated, re-encrypt
  if (data.bodyRich || data.bodyHtml) {
    const bodyRich = data.bodyRich || (await decryptLetter(
      existing.bodyCiphertext,
      existing.bodyNonce,
      existing.keyVersion
    )).bodyRich

    const bodyHtml = data.bodyHtml || (await decryptLetter(
      existing.bodyCiphertext,
      existing.bodyNonce,
      existing.keyVersion
    )).bodyHtml

    const encrypted = await encryptLetter({ bodyRich, bodyHtml })
    updateData.bodyCiphertext = encrypted.bodyCiphertext
    updateData.bodyNonce = encrypted.bodyNonce
    updateData.keyVersion = encrypted.keyVersion
  }

  const letter = await prisma.letter.update({
    where: { id },
    data: updateData,
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
    select: {
      id: true,
      title: true,
      tags: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { deliveries: true },
      },
      // Don't select encrypted content in list view for performance
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

  // Decrypt content
  const decrypted = await decryptLetter(
    letter.bodyCiphertext,
    letter.bodyNonce,
    letter.keyVersion
  )

  return {
    ...letter,
    bodyRich: decrypted.bodyRich,
    bodyHtml: decrypted.bodyHtml,
  }
}
