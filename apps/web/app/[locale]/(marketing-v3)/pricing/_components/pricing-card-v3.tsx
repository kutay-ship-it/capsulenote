"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Link } from "@/i18n/routing"

interface PricingCardV3Props {
  name: string
  price: string | number
  interval?: string
  description: string
  features: string[]
  cta: string
  ctaHref?: string
  priceId?: string
  variant?: "default" | "popular" | "enterprise"
  popularBadgeText?: string
  enterpriseBadgeText?: string
  bestValueText?: string
  index?: number
}

export function PricingCardV3({
  name,
  price,
  interval,
  description,
  features,
  cta,
  ctaHref = "/sign-up",
  priceId,
  variant = "default",
  popularBadgeText,
  enterpriseBadgeText,
  bestValueText,
  index = 0,
}: PricingCardV3Props) {
  const t = useTranslations("pricing.card")
  const effectivePopularBadge = popularBadgeText || t("popularBadge")
  const effectiveEnterpriseBadge = enterpriseBadgeText || t("enterpriseBadge")
  const effectiveBestValue = bestValueText || t("bestValue")
  const cardRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const [isHovered, setIsHovered] = React.useState(false)

  const isPopular = variant === "popular"
  const isEnterprise = variant === "enterprise"

  // Stagger delay based on index
  const delay = index * 0.15

  // Card styles based on variant
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
    enterprise: {
      bg: "bg-charcoal",
      border: "border-charcoal",
      text: "text-white",
      shadow: "shadow-[4px_4px_0_theme(colors.duck-yellow)]",
      hoverShadow: "hover:shadow-[8px_8px_0_theme(colors.duck-yellow)]",
    },
  }

  const styles = cardStyles[variant]

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
          {/* Bottom layer - charcoal */}
          <div
            className="absolute inset-0 border-2 border-charcoal bg-charcoal translate-x-4 translate-y-4"
            style={{ borderRadius: "2px" }}
          />
          {/* Middle layer - duck-yellow */}
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
        {/* Popular Badge - Floating above card */}
        {isPopular && (
          <motion.div
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2",
              "px-4 py-1.5 border-2 border-charcoal bg-duck-yellow",
              "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
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
              {effectivePopularBadge}
            </span>
          </motion.div>
        )}

        {/* Enterprise Badge */}
        {isEnterprise && (
          <div
            className={cn(
              "absolute -top-3 left-6",
              "px-3 py-1 border-2 border-duck-yellow bg-duck-yellow",
              "font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
            )}
            style={{ borderRadius: "2px" }}
          >
            {effectiveEnterpriseBadge}
          </div>
        )}

        {/* Tier Name */}
        <div className="mb-4">
          <h3 className={cn(
            "font-mono text-sm uppercase tracking-widest",
            isEnterprise ? "text-white/70" : "text-charcoal/70"
          )}>
            {name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            {typeof price === "number" ? (
              <>
                <span className="font-mono text-5xl md:text-6xl font-normal tracking-tight">
                  ${price}
                </span>
                {interval && (
                  <span className={cn(
                    "font-mono text-lg",
                    isEnterprise ? "text-white/60" : "text-charcoal/60"
                  )}>
                    /{interval}
                  </span>
                )}
              </>
            ) : (
              <span className="font-mono text-4xl md:text-5xl font-normal tracking-tight">
                {price}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className={cn(
          "mb-8 font-mono text-sm leading-relaxed",
          isEnterprise ? "text-white/80" : "text-charcoal/80"
        )}>
          {description}
        </p>

        {/* Dashed Separator */}
        <div className={cn(
          "w-full border-t-2 border-dashed mb-6",
          isEnterprise ? "border-white/20" : "border-charcoal/20"
        )} />

        {/* Features List */}
        <ul className="mb-8 space-y-3 flex-1">
          {features.map((feature, i) => (
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
                  isEnterprise
                    ? "border-duck-yellow bg-duck-yellow"
                    : isPopular
                    ? "border-charcoal bg-duck-yellow"
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
                <Check
                  className={cn(
                    "h-3 w-3",
                    isEnterprise || isPopular ? "text-charcoal" : "text-white"
                  )}
                  strokeWidth={3}
                />
              </motion.div>
              <span className={cn(
                "font-mono text-sm leading-relaxed",
                isEnterprise ? "text-white/90" : "text-charcoal"
              )}>
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href={ctaHref as any} className="w-full">
          <motion.button
            className={cn(
              "group w-full h-[54px] px-6",
              "flex items-center justify-center gap-2",
              "border-2 font-mono text-sm uppercase tracking-wider",
              "transition-all duration-150",
              isPopular
                ? "border-charcoal bg-charcoal text-white hover:bg-charcoal/90"
                : isEnterprise
                ? "border-duck-yellow bg-duck-yellow text-charcoal hover:bg-duck-yellow/90"
                : "border-charcoal bg-duck-blue text-charcoal hover:bg-duck-blue/90",
              "shadow-[2px_2px_0_theme(colors.charcoal)]",
              "hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              "hover:-translate-y-0.5"
            )}
            style={{ borderRadius: "2px" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </Link>
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
              "border-2 border-charcoal bg-coral",
              "font-mono text-[8px] font-bold uppercase leading-tight text-white text-center",
              "shadow-[3px_3px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "50%" }}
          >
            {effectiveBestValue}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
