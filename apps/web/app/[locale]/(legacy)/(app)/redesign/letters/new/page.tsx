import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { prisma } from "@/server/lib/db"
import { CapsuleJourney } from "@/components/redesign/capsule-journey"

export const metadata = {
  title: "Write a Letter | Capsule Note",
  description: "Write a letter to your future self",
}

async function getUserEmail(): Promise<string> {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findFirst({
    where: { clerkUserId: userId },
    select: { email: true },
  })

  return user?.email || ""
}

export default async function NewLetterPage() {
  const userEmail = await getUserEmail()

  return <CapsuleJourney userEmail={userEmail} />
}
