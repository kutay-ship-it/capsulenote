/**
 * Sync Stripe Products to Database
 *
 * This script fetches your Stripe products and creates corresponding
 * PricingPlan records in the database.
 *
 * Usage:
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/sync-stripe-products.ts
 */

import { PrismaClient, PlanType } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

async function main() {
  console.log('🔄 Fetching Stripe products...')

  // Fetch all active products with prices
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  })

  console.log(`📦 Found ${products.data.length} products`)

  for (const product of products.data) {
    const defaultPrice = product.default_price as Stripe.Price | null

    if (!defaultPrice) {
      console.log(`⏭️  Skipping ${product.name} (no default price)`)
      continue
    }

    if (defaultPrice.type !== 'recurring') {
      console.log(`⏭️  Skipping ${product.name} (not recurring)`)
      continue
    }

    // Map product name to plan enum
    const name = product.name.toLowerCase()
    let plan: PlanType | null = null
    if (name.includes('digital')) {
      plan = 'DIGITAL_CAPSULE'
    } else if (name.includes('paper')) {
      plan = 'PAPER_PIXELS'
    }

    if (!plan) {
      console.log(`⏭️  Skipping ${product.name} (unknown plan type)`)
      continue
    }

    // Extract features from product metadata or description
    const features = {
      maxLettersPerMonth: 'unlimited',
      emailDeliveriesIncluded: plan === 'DIGITAL_CAPSULE' ? 6 : 24,
      mailCreditsPerMonth: plan === 'PAPER_PIXELS' ? 3 : 0,
      canScheduleDeliveries: true,
      canSchedulePhysicalMail: plan === 'PAPER_PIXELS',
      supportLevel: 'standard'
    }

    // Upsert pricing plan
    const pricingPlan = await prisma.pricingPlan.upsert({
      where: { stripePriceId: defaultPrice.id },
      create: {
        stripeProductId: product.id,
        stripePriceId: defaultPrice.id,
        name: product.name,
        plan,
        interval: defaultPrice.recurring!.interval,
        amountCents: defaultPrice.unit_amount || 0,
        features
      },
      update: {
        name: product.name,
        amountCents: defaultPrice.unit_amount || 0,
        features
      }
    })

    console.log(`✅ Synced: ${pricingPlan.name} ($${pricingPlan.amountCents / 100}/${pricingPlan.interval})`)
  }

  console.log('\n✨ Sync complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
