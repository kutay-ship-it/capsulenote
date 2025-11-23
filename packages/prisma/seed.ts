import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Seed pricing plans (requires Stripe price IDs in env)
  const digitalPriceId = process.env.STRIPE_PRICE_DIGITAL_ANNUAL
  const paperPriceId = process.env.STRIPE_PRICE_PAPER_ANNUAL

  if (!digitalPriceId || !paperPriceId) {
    console.warn("⚠️  Skipping PricingPlan seed (Stripe price env vars missing)")
  } else {
    await prisma.pricingPlan.upsert({
      where: { stripePriceId: digitalPriceId },
      create: {
        stripeProductId: "prod_digital_capsule",
        stripePriceId: digitalPriceId,
        name: "Digital Capsule",
        plan: "DIGITAL_CAPSULE",
        interval: "year",
        amountCents: 900,
        features: {
          emailCredits: 6,
          physicalCredits: 0,
        },
        isActive: true,
        sortOrder: 1,
      },
      update: {
        amountCents: 900,
        features: {
          emailCredits: 6,
          physicalCredits: 0,
        },
        isActive: true,
        name: "Digital Capsule",
        plan: "DIGITAL_CAPSULE",
      },
    })

    await prisma.pricingPlan.upsert({
      where: { stripePriceId: paperPriceId },
      create: {
        stripeProductId: "prod_paper_pixels",
        stripePriceId: paperPriceId,
        name: "Paper & Pixels",
        plan: "PAPER_PIXELS",
        interval: "year",
        amountCents: 2900,
        features: {
          emailCredits: 24,
          physicalCredits: 3,
        },
        isActive: true,
        sortOrder: 2,
      },
      update: {
        amountCents: 2900,
        features: {
          emailCredits: 24,
          physicalCredits: 3,
        },
        isActive: true,
        name: "Paper & Pixels",
        plan: "PAPER_PIXELS",
      },
    })

    console.log("✅ Pricing plans seeded")
  }

  console.log("✅ Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
