/**
 * Seed a local active subscription for a user (dev/test only).
 *
 * Usage:
 *   pnpm dev:seed-subscription --email=user@example.com [--plan=DIGITAL_CAPSULE|PAPER_PIXELS] [--sub=dev_sub_123]
 */

import path from "path"
import { config } from "dotenv"
import { PrismaClient, type PlanType } from "@prisma/client"

config({ path: path.join(process.cwd(), "apps/web/.env.local") })

const prisma = new PrismaClient()

const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 6, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
}

function getArg(key: string) {
  const prefix = `--${key}=`
  const arg = process.argv.find((a) => a.startsWith(prefix))
  return arg ? arg.replace(prefix, "") : undefined
}

async function main() {
  const email = getArg("email")
  const planInput = getArg("plan") as PlanType | undefined
  const plan: PlanType = planInput && planInput in PLAN_CREDITS ? planInput : "DIGITAL_CAPSULE"
  const stripeSubscriptionId = getArg("sub") ?? `dev_sub_${Date.now()}`

  if (!email) {
    throw new Error("Missing required --email argument")
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  })

  if (!user) {
    throw new Error(`User not found for email: ${email}`)
  }

  const credits = PLAN_CREDITS[plan]
  const customerId = user.profile?.stripeCustomerId ?? `dev_cus_${user.id}`
  const now = new Date()
  const periodEnd = new Date(now.getTime())
  periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1)

  const existingActive = await prisma.subscription.findFirst({
    where: { userId: user.id, status: { in: ["active", "trialing"] } },
    orderBy: { updatedAt: "desc" },
  })

  const subscriptionId = existingActive?.stripeSubscriptionId ?? stripeSubscriptionId

  await prisma.$transaction(async (tx) => {
    // Ensure profile has customer id
    await tx.profile.update({
      where: { userId: user.id },
      data: { stripeCustomerId: customerId },
    })

    await tx.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscriptionId,
        status: "active",
        plan,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      update: {
        status: "active",
        plan,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    })

    await tx.user.update({
      where: { id: user.id },
      data: {
        planType: plan,
        emailCredits: credits.email,
        physicalCredits: credits.physical,
        creditExpiresAt: periodEnd,
      },
    })
  })

  console.log("✅ Seeded subscription", {
    email,
    plan,
    stripeSubscriptionId: subscriptionId,
    customerId,
    periodEnd: periodEnd.toISOString(),
  })
}

main()
  .catch((error) => {
    console.error("Failed to seed subscription:", error instanceof Error ? error.message : error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
