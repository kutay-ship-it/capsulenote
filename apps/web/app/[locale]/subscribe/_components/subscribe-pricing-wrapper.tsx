/**
 * Subscribe Pricing Wrapper
 *
 * Allows switching between old and new pricing views.
 * Once approved, we can replace the old view entirely.
 *
 * Usage:
 * - Add ?view=new to URL to see new design
 * - Default shows old design (safe, no breaking changes)
 */

import * as React from "react"
import { SubscribePricingCard } from "./subscribe-pricing-card"
import { SubscribePricingNew } from "./subscribe-pricing-new"

interface SubscribePricingWrapperProps {
  email: string
  letterId?: string
  metadata?: Record<string, unknown>
  digitalPriceId: string
  paperPriceId: string
  /** Force new view (from query param) */
  useNewView?: boolean
}

export async function SubscribePricingWrapper({
  email,
  letterId,
  metadata,
  digitalPriceId,
  paperPriceId,
  useNewView = false,
}: SubscribePricingWrapperProps) {
  // Use new view if explicitly requested
  if (useNewView) {
    return (
      <SubscribePricingNew
        email={email}
        letterId={letterId}
        metadata={metadata}
        digitalPriceId={digitalPriceId}
        paperPriceId={paperPriceId}
      />
    )
  }

  // Default: Old view (current production)
  const { getTranslations } = await import("next-intl/server")
  const t = await getTranslations("subscribe")

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
      <SubscribePricingCard
        email={email}
        name={t("plans.digital.name")}
        price={9}
        interval="year"
        description={t("plans.digital.description")}
        features={[
          t("plans.digital.features.emailDeliveries"),
          t("plans.digital.features.scheduleYears"),
          t("plans.digital.features.timezoneReminders"),
          t("plans.digital.features.encryptedStorage"),
        ]}
        priceId={digitalPriceId}
        letterId={letterId}
        metadata={metadata}
      />

      <SubscribePricingCard
        email={email}
        name={t("plans.paper.name")}
        price={29}
        interval="year"
        description={t("plans.paper.description")}
        features={[
          t("plans.paper.features.emailDeliveries"),
          t("plans.paper.features.physicalLetters"),
          t("plans.paper.features.addressReminders"),
          t("plans.paper.features.priorityRouting"),
        ]}
        priceId={paperPriceId}
        letterId={letterId}
        metadata={metadata}
        highlighted
        popular
      />
    </div>
  )
}
