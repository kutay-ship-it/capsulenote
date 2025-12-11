"use client"

import * as React from "react"
import { PricingCardV3 } from "./pricing-card-v3"
import { PricingToggleV3 } from "./pricing-toggle-v3"

interface PricingTier {
  name: string
  monthlyPrice: number | string
  yearlyPrice: number | string
  interval: string
  description: string
  features: string[]
  cta: string
  ctaHref?: string
  priceId?: string
  variant?: "default" | "popular" | "enterprise"
}

interface PricingTiersV3Props {
  tiers: PricingTier[]
  popularBadgeText?: string
  toggleLabels?: {
    monthly: string
    yearly: string
    savings: string
  }
}

export function PricingTiersV3({
  tiers,
  popularBadgeText = "MOST POPULAR",
  toggleLabels = {
    monthly: "MONTHLY",
    yearly: "YEARLY",
    savings: "SAVE 40%",
  },
}: PricingTiersV3Props) {
  const [isYearly, setIsYearly] = React.useState(true)

  return (
    <div className="space-y-12">
      {/* Billing Toggle */}
      <PricingToggleV3
        isYearly={isYearly}
        onToggle={() => setIsYearly(!isYearly)}
        monthlyLabel={toggleLabels.monthly}
        yearlyLabel={toggleLabels.yearly}
        savingsLabel={toggleLabels.savings}
      />

      {/* Pricing Cards - 1 column mobile, 2 columns tablet, 3 columns desktop */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-4 md:gap-6 lg:gap-8">
        {tiers.map((tier, index) => (
          <PricingCardV3
            key={tier.name}
            name={tier.name}
            price={isYearly ? tier.yearlyPrice : tier.monthlyPrice}
            interval={typeof tier.yearlyPrice === "number" || typeof tier.monthlyPrice === "number"
              ? (isYearly ? "year" : "month")
              : undefined
            }
            description={tier.description}
            features={tier.features}
            cta={tier.cta}
            ctaHref={tier.ctaHref}
            priceId={tier.priceId}
            variant={tier.variant}
            popularBadgeText={popularBadgeText}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
