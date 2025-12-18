"use client"

import * as React from "react"
import { PricingCardV3 } from "./pricing-card-v3"
import { cn } from "@/lib/utils"
import type { AppHref } from "@/i18n/routing"

interface PricingTier {
  name: string
  description: string
  features: string[]
  cta: string
  ctaHref?: AppHref
  priceId?: string
  variant?: "default" | "popular" | "enterprise"
}

interface PricingTiersV3Props {
  tiers: PricingTier[]
  popularBadgeText?: string
}

export function PricingTiersV3({
  tiers,
  popularBadgeText = "MOST POPULAR",
}: PricingTiersV3Props) {
  const gridColsClass =
    tiers.length === 1 ? "md:grid-cols-1" : tiers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:gap-8", gridColsClass)}>
      {tiers.map((tier, index) => (
        <PricingCardV3
          key={tier.name}
          name={tier.name}
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
  )
}
