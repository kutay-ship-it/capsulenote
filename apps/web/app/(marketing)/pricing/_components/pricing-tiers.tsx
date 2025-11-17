import * as React from "react"
import { PricingCard } from "./pricing-card"
import { env } from "@/env.mjs"

interface PricingTiersProps {
  interval?: "month" | "year"
}

export function PricingTiers({ interval = "month" }: PricingTiersProps) {
  const isAnnual = interval === "year"

  // Pricing configuration
  const monthlyPrice = 19
  const annualPrice = 189 // 17% savings
  const annualMonthlyEquivalent = Math.round(annualPrice / 12)

  // Stripe price IDs from environment
  const priceId = isAnnual
    ? env.STRIPE_PRICE_PRO_ANNUAL
    : env.STRIPE_PRICE_PRO_MONTHLY

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
      {/* Free Tier */}
      <PricingCard
        name="Free"
        price="$0"
        description="Perfect for trying out Capsule Note and writing your first letters."
        features={[
          "3 letters per month",
          "Email delivery only",
          "Basic scheduling",
          "Community support",
          "Encrypted storage",
        ]}
        cta="Start Free"
        ctaHref="/sign-up"
      />

      {/* Pro Tier - Highlighted */}
      <PricingCard
        name="Pro"
        price={isAnnual ? annualMonthlyEquivalent : monthlyPrice}
        interval="month"
        description="For serious letter writers who want unlimited letters and premium features."
        features={[
          "Unlimited letters",
          "Email + Physical mail delivery",
          "2 free physical mails/month",
          "Advanced scheduling (arrive-by mode)",
          "Premium templates",
          "Priority support",
          "Unlimited encrypted storage",
          "Cancel anytime",
        ]}
        cta="Start Free Trial"
        priceId={priceId}
        highlighted
        popular
        badge={isAnnual ? "Save 17%" : undefined}
      />

      {/* Enterprise Tier */}
      <PricingCard
        name="Enterprise"
        price="Custom"
        description="For organizations that want white-label solutions and custom integrations."
        features={[
          "Everything in Pro",
          "White-label solution",
          "Custom integrations",
          "Dedicated account manager",
          "SLA guarantees",
          "Volume discounts",
          "Custom branding",
          "Advanced analytics",
        ]}
        cta="Contact Sales"
        ctaHref="mailto:sales@capsulenote.com"
      />
    </div>
  )
}
