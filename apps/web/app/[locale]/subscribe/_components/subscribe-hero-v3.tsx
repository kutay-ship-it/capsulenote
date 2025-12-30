/**
 * Subscribe Hero Component (V3 Design)
 *
 * Adapted from PricingHeroV3 for the subscribe/checkout flow.
 * Uses the same neo-brutalist design language but with
 * checkout-focused messaging.
 */

"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Timer, Star, Users, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SubscribeHeroV3() {
  const t = useTranslations("subscribe.v3.hero")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  const stats = [
    { icon: Timer, value: t("stats.uptime.value"), label: t("stats.uptime.label") },
    { icon: Star, value: t("stats.rating.value"), label: t("stats.rating.label") },
    { icon: Users, value: t("stats.users.value"), label: t("stats.users.label") },
  ]

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      style={{ contain: "paint layout" }}
    >
      {/* Background Decorative Elements - Hidden on mobile to prevent overflow scroll */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large Circle - Top Right - Hidden on mobile */}
        <motion.div
          className="hidden md:block absolute -top-20 -right-20 w-96 h-96 border-2 border-charcoal/10"
          style={{
            borderRadius: "50%",
            y: useTransform(scrollYProgress, [0, 1], [0, 100]),
          }}
        />

        {/* Small Square - Left - Safe positioning */}
        <motion.div
          className="absolute top-1/4 left-4 md:left-10 w-12 md:w-16 h-12 md:h-16 border-2 border-duck-yellow bg-duck-yellow/20"
          style={{
            borderRadius: "2px",
            rotate: 12,
            y: useTransform(scrollYProgress, [0, 1], [0, 60]),
          }}
        />

        {/* Medium Square - Right - Hidden on mobile */}
        <motion.div
          className="hidden sm:block absolute bottom-1/4 right-4 md:right-20 w-16 md:w-24 h-16 md:h-24 border-2 border-duck-blue bg-duck-blue/20"
          style={{
            borderRadius: "2px",
            rotate: -8,
            y: useTransform(scrollYProgress, [0, 1], [0, 80]),
          }}
        />

        {/* Dotted Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(56, 56, 56) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="container relative px-4 sm:px-6"
        style={{ opacity, y }}
      >
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "border-2 border-charcoal bg-teal-primary",
                "font-mono text-xs uppercase tracking-widest text-white",
                "shadow-[3px_3px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-3 w-3" />
              {t("badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide text-charcoal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="relative inline-block">
              {t("title").split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3 md:mr-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  {word === "PLAN" || word === "PLANINI" ? (
                    <span className="relative">
                      {word}
                      <motion.span
                        className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-2 md:h-3 bg-duck-blue -z-10"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto max-w-2xl font-mono text-sm md:text-base lg:text-lg leading-relaxed text-charcoal/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t("subtitle")}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={cn(
                  "flex items-center gap-2 px-4 py-2",
                  "border-2 border-charcoal bg-white",
                  "shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  y: -2,
                  boxShadow: "4px 4px 0 rgb(56, 56, 56)",
                }}
              >
                <stat.icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="font-mono text-base font-bold text-charcoal">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-charcoal/60">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof Avatars */}
          <motion.div
            className="flex items-center justify-center gap-3 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-8 w-8 border-2 border-charcoal",
                    i % 2 === 0 ? "bg-duck-blue" : "bg-duck-yellow"
                  )}
                  style={{ borderRadius: "50%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: 0.9 + i * 0.05,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-charcoal">
              {t("socialProof")}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
