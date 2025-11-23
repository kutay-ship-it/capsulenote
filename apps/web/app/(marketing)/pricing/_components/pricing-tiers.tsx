import * as React from "react"
import { PricingCard } from "./pricing-card"
import { env } from "@/env.mjs"

export function PricingTiers() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
      <PricingCard
        name="Digital Capsule"
        price={9}
        interval="year"
        description="For personal letters to yourself—purely digital delivery."
        features={[
          "6 email deliveries / year",
          "Schedule up to 100 years out",
          "Timezone-aware reminders",
          "Encrypted storage",
        ]}
        cta="Choose Digital"
        priceId={env.STRIPE_PRICE_DIGITAL_ANNUAL}
      />

      <PricingCard
        name="Paper & Pixels"
        price={29}
        interval="year"
        description="For gifting and tangible keepsakes—email plus premium mail."
        features={[
          "24 email deliveries / year",
          "3 physical letters / year",
          "Address confirmation reminders",
          "Priority delivery routing",
        ]}
        cta="Choose Paper & Pixels"
        priceId={env.STRIPE_PRICE_PAPER_ANNUAL}
        highlighted
        popular
      />
    </div>
  )
}
