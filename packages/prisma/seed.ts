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

  // Seed letter templates
  console.log("🌱 Seeding letter templates...")

  // Fixed UUIDs for idempotent seeding
  const templates = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      category: "reflection",
      title: "New Year Reflection",
      description: "Reflect on the past year and set intentions",
      promptText: `<h1>Dear Future Me,</h1><p>As this year comes to a close, I want to take a moment to reflect on everything that has happened...</p><p><strong>My biggest wins this year:</strong></p><ul><li></li><li></li><li></li></ul><p><strong>Challenges I overcame:</strong></p><ul><li></li><li></li></ul><p><strong>What I learned about myself:</strong></p><p></p><p>Looking forward, I hope to remember...</p>`,
      sortOrder: 1,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      category: "goals",
      title: "Career Goals",
      description: "Set professional objectives and career milestones",
      promptText: `<h1>Career Vision</h1><p>In the next year, I aim to achieve these professional goals:</p><p><strong>Primary Career Goal:</strong></p><p></p><p><strong>Skills I want to develop:</strong></p><ul><li></li><li></li><li></li></ul><p><strong>Projects I want to complete:</strong></p><ul><li></li><li></li></ul><p><strong>Why this matters to me:</strong></p><p></p>`,
      sortOrder: 2,
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      category: "gratitude",
      title: "Gratitude Letter",
      description: "Express appreciation for your journey",
      promptText: `<h1>A Letter of Gratitude</h1><p>Dear Future Me,</p><p>Today, I'm grateful for:</p><ul><li></li><li></li><li></li><li></li><li></li></ul><p><strong>People who made a difference:</strong></p><p></p><p><strong>Moments I want to remember:</strong></p><p></p><p>I hope when you read this, you'll remember to be grateful for...</p>`,
      sortOrder: 3,
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      category: "future-self",
      title: "Future Self Vision",
      description: "Visualize who you want to become",
      promptText: `<h1>Who I'm Becoming</h1><p>Dear Future Me,</p><p><strong>The person I'm working to become is:</strong></p><p></p><p><strong>The habits I'm building:</strong></p><ul><li></li><li></li><li></li></ul><p><strong>The values I'm living by:</strong></p><ul><li></li><li></li></ul><p><strong>My vision for my life:</strong></p><p></p><p>I believe in you. Keep going.</p>`,
      sortOrder: 4,
    },
    {
      id: "00000000-0000-4000-8000-000000000005",
      category: "goals",
      title: "Life Goals Blueprint",
      description: "Map out your long-term life aspirations",
      promptText: `<h1>Life Goals Blueprint</h1><p><strong>Personal Growth:</strong></p><p></p><p><strong>Relationships:</strong></p><p></p><p><strong>Health & Wellness:</strong></p><p></p><p><strong>Career & Financial:</strong></p><p></p><p><strong>Adventures & Experiences:</strong></p><p></p><p><strong>Legacy & Impact:</strong></p><p></p>`,
      sortOrder: 5,
    },
    {
      id: "00000000-0000-4000-8000-000000000006",
      category: "reflection",
      title: "Monthly Reflection",
      description: "Quick monthly check-in with yourself",
      promptText: `<h1>Monthly Check-In</h1><p><strong>What went well this month:</strong></p><p></p><p><strong>What I learned:</strong></p><p></p><p><strong>What I want to improve:</strong></p><p></p><p><strong>Next month, I will:</strong></p><ul><li></li><li></li><li></li></ul>`,
      sortOrder: 6,
    },
  ]

  for (const template of templates) {
    await prisma.letterTemplate.upsert({
      where: { id: template.id },
      create: {
        id: template.id,
        category: template.category,
        title: template.title,
        description: template.description,
        promptText: template.promptText,
        placeholders: {},
        isActive: true,
        sortOrder: template.sortOrder,
      },
      update: {
        category: template.category,
        title: template.title,
        description: template.description,
        promptText: template.promptText,
        isActive: true,
        sortOrder: template.sortOrder,
      },
    })
  }

  console.log("✅ Letter templates seeded")

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
