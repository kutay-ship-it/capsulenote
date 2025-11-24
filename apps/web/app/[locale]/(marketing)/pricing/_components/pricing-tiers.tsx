import * as React from "react"

import { PricingCard } from "./pricing-card"

interface Tier {
  name: string
  price: number | string
  interval?: string
  intervalLabel?: string
  description: string
  features: string[]
  cta: string
  priceId?: string
  ctaHref?: string
  highlighted?: boolean
  popular?: boolean
  badge?: string
}

interface PricingTiersProps {
  tiers: Tier[]
  currencySymbol?: string
  popularBadgeText?: string
}

export function PricingTiers({ tiers, currencySymbol = "$", popularBadgeText }: PricingTiersProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
      {tiers.map((tier) => (
        <PricingCard
          key={tier.name}
          name={tier.name}
          price={tier.price}
          interval={tier.interval}
          intervalLabel={tier.intervalLabel}
          description={tier.description}
          features={tier.features}
          cta={tier.cta}
          priceId={tier.priceId}
          ctaHref={tier.ctaHref}
          highlighted={tier.highlighted}
          popular={tier.popular}
          popularBadgeText={popularBadgeText}
          badge={tier.badge}
          currencySymbol={currencySymbol}
        />
      ))}
    </div>
  )
}
