/**
 * New Subscribe Pricing Component (V3 Design)
 *
 * Upgraded to match the marketing pricing page patterns.
 * Uses PricingHero-style header, PricingCard-style tiers,
 * and TrustSignals-style guarantees.
 *
 * Key Features:
 * - Hero section with stats and social proof
 * - Two pricing tiers (Digital + Paper) - no Enterprise
 * - Letter count visualization
 * - Monthly equivalent pricing display
 * - Trust signals strip
 * - Money-back guarantee section
 * - Testimonials and value proposition
 * - Sticky mobile CTA
 */

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Quote, Heart, Sparkles, ArrowRight, Users, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { SubscribeHeroV3 } from "./subscribe-hero-v3"
import { SubscribePricingTiersV3 } from "./subscribe-pricing-tiers-v3"
import { SubscribeTrustSignalsV3 } from "./subscribe-trust-signals-v3"
import { SubscribeGuaranteeV3 } from "./subscribe-guarantee-v3"
import { SubscribeButton } from "./subscribe-button"

interface SubscribePricingNewProps {
  email: string
  letterId?: string
  metadata?: Record<string, unknown>
  digitalPriceId: string
  paperPriceId: string
}

export function SubscribePricingNew({
  email,
  letterId,
  metadata,
  digitalPriceId,
  paperPriceId,
}: SubscribePricingNewProps) {
  const t = useTranslations("subscribe.v3")
  const [showStickyMobile, setShowStickyMobile] = React.useState(false)
  const pricingRef = React.useRef<HTMLDivElement>(null)

  // Show sticky mobile CTA when user scrolls past pricing cards
  React.useEffect(() => {
    const handleScroll = () => {
      if (!pricingRef.current) return
      const rect = pricingRef.current.getBoundingClientRect()
      const isScrolledPast = rect.bottom < 0
      setShowStickyMobile(isScrolledPast)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <SubscribeHeroV3 />

      {/* Pricing Tiers */}
      <section ref={pricingRef} className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <SubscribePricingTiersV3
          email={email}
          letterId={letterId}
          metadata={metadata}
          digitalPriceId={digitalPriceId}
          paperPriceId={paperPriceId}
        />
      </section>

      {/* Trust Signals Strip */}
      <SubscribeTrustSignalsV3 />

      {/* Guarantee Section */}
      <section className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <SubscribeGuaranteeV3 />
      </section>

      {/* Testimonials Section */}
      <section className="container px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20">
        <div
          className="border-2 border-charcoal bg-white p-6 md:p-8"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="h-5 w-5 text-teal-primary" strokeWidth={2} />
            <p className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
              {t("testimonials.heading")}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="space-y-3 text-center">
	              <Quote className="h-6 w-6 text-duck-blue mx-auto" />
	              <p className="font-mono text-sm text-charcoal/80 italic leading-relaxed">
	                &quot;{t("testimonials.items.sarah.quote")}&quot;
	              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                — {t("testimonials.items.sarah.author")}
              </p>
            </div>
            {/* Testimonial 2 */}
            <div className="space-y-3 text-center">
	              <Quote className="h-6 w-6 text-teal-primary mx-auto" />
	              <p className="font-mono text-sm text-charcoal/80 italic leading-relaxed">
	                &quot;{t("testimonials.items.michael.quote")}&quot;
	              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                — {t("testimonials.items.michael.author")}
              </p>
            </div>
            {/* Testimonial 3 */}
            <div className="space-y-3 text-center">
	              <Quote className="h-6 w-6 text-coral mx-auto" />
	              <p className="font-mono text-sm text-charcoal/80 italic leading-relaxed">
	                &quot;{t("testimonials.items.emma.quote")}&quot;
	              </p>
              <p className="font-mono text-xs font-bold text-charcoal">
                — {t("testimonials.items.emma.author")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="container px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20">
        <div
          className="border-2 border-dashed border-charcoal/30 bg-cream p-6 md:p-8 text-center"
          style={{ borderRadius: "2px" }}
        >
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-coral" fill="#FF7169" />
              <Sparkles className="h-5 w-5 text-duck-yellow" fill="#FFDE00" />
              <Heart className="h-5 w-5 text-coral" fill="#FF7169" />
            </div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              {t("valueProposition.title")}
            </h3>
            <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
              {t("valueProposition.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Email Badge Section */}
      {email && (
        <section className="container px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div
              className="inline-flex items-center gap-3 px-6 py-3 border-2 border-charcoal bg-off-white shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-5 w-5 text-charcoal" />
              <span className="font-mono text-sm text-charcoal">
                <span className="text-charcoal/60">{t("hero.checkoutFor")}</span>{" "}
                <strong>{email}</strong>
              </span>
            </div>
          </motion.div>
        </section>
      )}

      {/* Sticky Mobile CTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: showStickyMobile ? 0 : 100, opacity: showStickyMobile ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-charcoal bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] md:hidden"
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-mono text-xs font-bold uppercase text-charcoal">
              {t("stickyMobile.mostPopular")}
            </p>
            <p className="font-mono text-sm text-charcoal">
              {t("stickyMobile.planPrice")}
            </p>
          </div>
          <SubscribeButton
            email={email}
            priceId={paperPriceId}
            planName={t("pricing.plans.paper.name")}
            letterId={letterId}
            metadata={metadata}
            className={cn(
              "flex items-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3",
              "font-mono text-sm font-bold uppercase text-white",
              "hover:shadow-[2px_2px_0_theme(colors.duck-yellow)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {t("stickyMobile.choosePlan")}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </SubscribeButton>
        </div>
      </motion.div>
    </div>
  )
}
