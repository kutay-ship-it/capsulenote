"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Shield, RefreshCw, Mail, Sparkles } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

interface PricingCTAV3Props {
  title?: string
  description?: string
  badges?: string[]
  primaryCta?: string
  primaryCtaHref?: string
  secondaryCta?: string
  secondaryCtaHref?: string
  contactText?: string
  contactLinkText?: string
}

export function PricingCTAV3({
  title = "START YOUR TIME CAPSULE JOURNEY",
  description = "Join thousands of people sending meaningful letters to their future selves. Start free, upgrade anytime.",
  badges = ["14-day free trial", "No credit card required", "Cancel anytime"],
  primaryCta = "GET STARTED FREE",
  primaryCtaHref = "/sign-up",
  secondaryCta = "VIEW DEMO",
  secondaryCtaHref = "/demo",
  contactText = "Questions?",
  contactLinkText = "Contact us",
}: PricingCTAV3Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const guaranteeItems = [
    { icon: RefreshCw, text: "14-day money-back guarantee" },
    { icon: Shield, text: "Bank-level encryption" },
    { icon: Mail, text: "99.9% delivery rate" },
  ]

  return (
    <div ref={containerRef} className="w-full">
      {/* Layered Card Design */}
      <div className="relative max-w-4xl mx-auto">
        {/* Background Layer 1 - Charcoal */}
        <motion.div
          className="absolute inset-0 border-2 border-charcoal bg-charcoal"
          style={{ borderRadius: "2px" }}
          initial={{ opacity: 0, x: 16, y: 16 }}
          animate={isInView ? { opacity: 1, x: 16, y: 16 } : { opacity: 0, x: 16, y: 16 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Background Layer 2 - Duck Yellow */}
        <motion.div
          className="absolute inset-0 border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
          initial={{ opacity: 0, x: 8, y: 8 }}
          animate={isInView ? { opacity: 1, x: 8, y: 8 } : { opacity: 0, x: 8, y: 8 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Main Card */}
        <motion.div
          className={cn(
            "relative border-2 border-charcoal bg-duck-blue",
            "p-8 md:p-12 lg:p-16"
          )}
          style={{ borderRadius: "2px" }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Decorative Corner Element */}
          <motion.div
            className="absolute -top-6 -right-6 z-10"
            initial={{ scale: 0, rotate: -20 }}
            animate={isInView ? { scale: 1, rotate: 5 } : { scale: 0, rotate: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          >
            <div
              className={cn(
                "h-20 w-20 flex items-center justify-center",
                "border-2 border-charcoal bg-coral",
                "shadow-[3px_3px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "50%" }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center space-y-8">
            {/* Title */}
            <motion.h2
              className="font-mono text-2xl md:text-3xl lg:text-4xl uppercase tracking-wide text-charcoal"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="font-mono text-base md:text-lg text-charcoal/80 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {description}
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  className={cn(
                    "px-3 py-1.5 border-2 border-charcoal bg-white",
                    "font-mono text-xs uppercase tracking-wider text-charcoal",
                    "shadow-[2px_2px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  {badge}
                </motion.div>
              ))}
            </motion.div>

            {/* Dashed Separator */}
            <div className="w-full max-w-md mx-auto border-t-2 border-dashed border-charcoal/20" />

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {/* Primary CTA */}
              <Link href={primaryCtaHref as any}>
                <motion.button
                  className={cn(
                    "group h-[58px] px-8 flex items-center justify-center gap-3",
                    "border-2 border-charcoal bg-charcoal text-white",
                    "font-mono text-sm uppercase tracking-wider",
                    "shadow-[4px_4px_0_theme(colors.duck-yellow)]",
                    "hover:shadow-[6px_6px_0_theme(colors.duck-yellow)]",
                    "hover:-translate-y-1 transition-all duration-200"
                  )}
                  style={{ borderRadius: "2px" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {primaryCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>

              {/* Secondary CTA */}
              <Link href={secondaryCtaHref as any}>
                <motion.button
                  className={cn(
                    "h-[58px] px-8 flex items-center justify-center",
                    "border-2 border-charcoal bg-white text-charcoal",
                    "font-mono text-sm uppercase tracking-wider",
                    "shadow-[2px_2px_0_theme(colors.charcoal)]",
                    "hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                    "hover:-translate-y-0.5 transition-all duration-200"
                  )}
                  style={{ borderRadius: "2px" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {secondaryCta}
                </motion.button>
              </Link>
            </motion.div>

            {/* Guarantee Strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1 }}
            >
              {guaranteeItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-charcoal/60" strokeWidth={2} />
                  <span className="font-mono text-xs text-charcoal/70">
                    {item.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Contact Link */}
            <motion.p
              className="font-mono text-xs text-charcoal/60"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.1 }}
            >
              {contactText}{" "}
              <a
                href="mailto:support@capsulenote.com"
                className="underline underline-offset-2 hover:text-charcoal transition-colors"
              >
                {contactLinkText}
              </a>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
