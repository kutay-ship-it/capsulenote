import { auth as clerkAuth } from "@clerk/nextjs/server"
import { prisma } from "./db"

export async function getCurrentUser() {
  const { userId: clerkUserId } = await clerkAuth()

  if (!clerkUserId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      profile: true,
    },
  })

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}
