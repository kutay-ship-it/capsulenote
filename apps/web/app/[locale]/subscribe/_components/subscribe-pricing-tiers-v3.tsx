/**
 * Subscribe Pricing Tiers Component (V3 Design)
 *
 * Matches the pricing-tiers-v3 and pricing-card-v3 pattern from
 * the marketing pricing page, adapted for the checkout flow.
 *
 * Key differences from marketing pricing page:
 * - Only 2 tiers (Digital + Paper, no Enterprise)
 * - Integrates with SubscribeButton for checkout
 * - Shows locked email
 * - Keeps the letter count visualization
 * - Displays monthly equivalent pricing
 */

"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Check, ArrowRight, Sparkles, Mail, Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { SubscribeButton } from "./subscribe-button"

// ============================================================================
// TYPES
// ============================================================================

interface SubscribePlan {
  id: "digital" | "paper"
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  icon: React.ElementType
  priceId: string
  popular?: boolean
  features: string[]
  digitalLetters: number
  physicalLetters?: number
}

interface SubscribePricingTiersV3Props {
  email: string
  letterId?: string
  metadata?: Record<string, unknown>
  digitalPriceId: string
  paperPriceId: string
}

// ============================================================================
// PRICING CARD COMPONENT
// ============================================================================

interface SubscribePricingCardProps {
  plan: SubscribePlan
  email: string
  letterId?: string
  metadata?: Record<string, unknown>
  index: number
  t: ReturnType<typeof useTranslations<"subscribe.v3.pricing">>
}

function SubscribePricingCard({
  plan,
  email,
  letterId,
  metadata,
  index,
  t,
}: SubscribePricingCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const [isHovered, setIsHovered] = React.useState(false)

  const isPopular = plan.popular
  const delay = index * 0.15

  const cardStyles = {
    default: {
      bg: "bg-white",
      border: "border-charcoal",
      text: "text-charcoal",
      shadow: "shadow-[4px_4px_0_theme(colors.charcoal)]",
      hoverShadow: "hover:shadow-[8px_8px_0_theme(colors.charcoal)]",
    },
    popular: {
      bg: "bg-duck-blue",
      border: "border-charcoal",
      text: "text-charcoal",
      shadow: "shadow-[8px_8px_0_theme(colors.charcoal)]",
      hoverShadow: "hover:shadow-[12px_12px_0_theme(colors.charcoal)]",
    },
  }

  const styles = isPopular ? cardStyles.popular : cardStyles.default
  const monthlyEquivalent = (plan.yearlyPrice / 12).toFixed(2)

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layered Background Cards for Popular Tier */}
      {isPopular && (
        <>
          <div
            className="absolute inset-0 border-2 border-charcoal bg-charcoal translate-x-4 translate-y-4"
            style={{ borderRadius: "2px" }}
          />
          <div
            className="absolute inset-0 border-2 border-charcoal bg-duck-yellow translate-x-2 translate-y-2"
            style={{ borderRadius: "2px" }}
          />
        </>
      )}

      {/* Main Card */}
      <motion.article
        className={cn(
          "relative flex flex-col border-2 p-6 md:p-8",
          "transition-all duration-200",
          styles.bg,
          styles.border,
          styles.text,
          styles.shadow,
          styles.hoverShadow,
          isPopular && "z-10"
        )}
        style={{ borderRadius: "2px" }}
        animate={{
          y: isHovered ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Popular Badge */}
        {isPopular && (
          <motion.div
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2",
              "px-4 py-1.5 border-2 border-charcoal bg-coral",
              "font-mono text-xs font-bold uppercase tracking-wider text-white",
              "shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
            initial={{ scale: 0, rotate: -10 }}
            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              delay: delay + 0.3,
            }}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              {t("popularBadge")}
            </span>
          </motion.div>
        )}

        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center border-2 border-charcoal",
            isPopular ? "bg-duck-yellow" : "bg-duck-blue"
          )}
          style={{ borderRadius: "2px" }}
        >
          <plan.icon className="h-7 w-7 text-charcoal" strokeWidth={2} />
        </div>

        {/* Plan Name & Tagline */}
        <div className="mb-2">
          <h3 className="font-mono text-sm uppercase tracking-widest text-charcoal/70">
            {plan.name}
          </h3>
        </div>
        <p className="mb-4 font-mono text-sm text-charcoal/60">
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-5xl md:text-6xl font-normal tracking-tight">
              ${plan.yearlyPrice}
            </span>
            <span className="font-mono text-lg text-charcoal/60">{t("perYear")}</span>
          </div>
        </div>

        {/* Monthly Equivalent */}
        <div className="mb-6">
          <span className="font-mono text-xs text-charcoal/50">
            {t("billedAnnually", { price: `$${monthlyEquivalent}` })}
          </span>
        </div>

        {/* Letters Visualization */}
        <div className="mb-6 space-y-2">
          {/* Digital Letters */}
          <div
            className="flex items-center gap-2 border-2 border-charcoal/20 bg-white/50 px-3 py-2"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex -space-x-1">
              {[...Array(Math.min(plan.digitalLetters / 2, 6))].map((_, j) => (
                <div
                  key={j}
                  className="h-6 w-4 border border-charcoal bg-duck-yellow"
                  style={{ borderRadius: "1px" }}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-charcoal">
              {t("digitalLetters", { count: plan.digitalLetters })}
            </span>
          </div>

          {/* Physical Letters (Paper plan only) */}
          {plan.physicalLetters && (
            <div
              className="flex items-center gap-2 border-2 border-charcoal/20 bg-white/50 px-3 py-2"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex -space-x-1">
                {[...Array(plan.physicalLetters)].map((_, j) => (
                  <div
                    key={j}
                    className="h-6 w-4 border border-charcoal bg-coral"
                    style={{ borderRadius: "1px" }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-charcoal">
                {t("physicalLetters", { count: plan.physicalLetters })}
              </span>
            </div>
          )}
        </div>

        {/* Dashed Separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/20 mb-6" />

        {/* Features List */}
        <ul className="mb-8 space-y-3 flex-1">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{
                duration: 0.4,
                delay: delay + 0.4 + i * 0.08,
              }}
            >
              <motion.div
                className={cn(
                  "mt-0.5 flex h-5 w-5 items-center justify-center border-2",
                  isPopular
                    ? "border-charcoal bg-teal-primary"
                    : "border-charcoal bg-teal-primary"
                )}
                style={{ borderRadius: "2px" }}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: delay + 0.5 + i * 0.08,
                }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </motion.div>
              <span className="font-mono text-sm leading-relaxed text-charcoal">
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <SubscribeButton
          email={email}
          priceId={plan.priceId}
          planName={plan.name}
          letterId={letterId}
          metadata={metadata}
          className={cn(
            "group w-full h-[54px] px-6",
            "flex items-center justify-center gap-2",
            "border-2 font-mono text-sm uppercase tracking-wider",
            "transition-all duration-150",
            isPopular
              ? "border-charcoal bg-charcoal text-white hover:bg-charcoal/90"
              : "border-charcoal bg-duck-yellow text-charcoal hover:bg-duck-yellow/90",
            "shadow-[2px_2px_0_theme(colors.charcoal)]",
            "hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "hover:-translate-y-0.5"
          )}
          style={{ borderRadius: "2px" }}
        >
          {t("choosePlan", { planName: plan.name })}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </SubscribeButton>
      </motion.article>

      {/* Decorative Seal for Popular Tier */}
      {isPopular && (
        <motion.div
          className="absolute -right-4 -top-4 z-20"
          initial={{ scale: 0, rotate: -30 }}
          animate={isInView ? { scale: 1, rotate: isHovered ? 5 : -5 } : { scale: 0, rotate: -30 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: delay + 0.5,
          }}
        >
          <div
            className={cn(
              "h-16 w-16 flex items-center justify-center",
              "border-2 border-charcoal bg-teal-primary",
              "font-mono text-[8px] font-bold uppercase leading-tight text-white text-center",
              "shadow-[3px_3px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "50%" }}
          >
            {t("bestValue").split(" ").join("\n")}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SubscribePricingTiersV3({
  email,
  letterId,
  metadata,
  digitalPriceId,
  paperPriceId,
}: SubscribePricingTiersV3Props) {
  const t = useTranslations("subscribe.v3.pricing")

  const plans: SubscribePlan[] = [
    {
      id: "digital",
      name: t("plans.digital.name"),
      tagline: t("plans.digital.tagline"),
      monthlyPrice: 0.75,
      yearlyPrice: 9,
      icon: Mail,
      priceId: digitalPriceId,
      digitalLetters: 6,
      features: [
        t("plans.digital.features.deliveries"),
        t("plans.digital.features.recipients"),
        t("plans.digital.features.schedule"),
        t("plans.digital.features.timezone"),
        t("plans.digital.features.encryption"),
        t("plans.digital.features.extra"),
      ],
    },
    {
      id: "paper",
      name: t("plans.paper.name"),
      tagline: t("plans.paper.tagline"),
      monthlyPrice: 2.42,
      yearlyPrice: 29,
      icon: Send,
      priceId: paperPriceId,
      popular: true,
      digitalLetters: 24,
      physicalLetters: 3,
      features: [
        t("plans.paper.features.digitalDeliveries"),
        t("plans.paper.features.physicalDeliveries"),
        t("plans.paper.features.recipients"),
        t("plans.paper.features.addressReminders"),
        t("plans.paper.features.priorityRouting"),
        t("plans.paper.features.extra"),
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Pricing Cards - 2 Column Grid */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-6 lg:gap-8">
        {plans.map((plan, index) => (
          <SubscribePricingCard
            key={plan.id}
            plan={plan}
            email={email}
            letterId={letterId}
            metadata={metadata}
            index={index}
            t={t}
          />
        ))}
      </div>
    </div>
  )
}
