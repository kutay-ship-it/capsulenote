"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Timer, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingHeroV3Props {
  badge?: string
  title?: string
  subtitle?: string
  socialProofText?: string
}

export function PricingHeroV3({
  badge = "SIMPLE PRICING",
  title = "CHOOSE YOUR PLAN",
  subtitle = "Start free, upgrade when you're ready. No hidden fees, no surprises.",
  socialProofText = "10,000+ letters delivered",
}: PricingHeroV3Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  // Animated stats
  const stats = [
    { icon: Timer, value: "99.9%", label: "Uptime" },
    { icon: Star, value: "4.9/5", label: "Rating" },
    { icon: Users, value: "10K+", label: "Users" },
  ]

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-20 md:py-28 lg:py-32"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large Circle - Top Right */}
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 border-2 border-charcoal/10"
          style={{
            borderRadius: "50%",
            y: useTransform(scrollYProgress, [0, 1], [0, 100]),
          }}
        />

        {/* Small Square - Left */}
        <motion.div
          className="absolute top-1/4 left-10 w-16 h-16 border-2 border-duck-yellow bg-duck-yellow/20"
          style={{
            borderRadius: "2px",
            rotate: 12,
            y: useTransform(scrollYProgress, [0, 1], [0, 60]),
          }}
        />

        {/* Medium Square - Right */}
        <motion.div
          className="absolute bottom-1/4 right-20 w-24 h-24 border-2 border-duck-blue bg-duck-blue/20"
          style={{
            borderRadius: "2px",
            rotate: -8,
            y: useTransform(scrollYProgress, [0, 1], [0, 80]),
          }}
        />

        {/* Dotted Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
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
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={cn(
                "inline-flex items-center px-4 py-2",
                "border-2 border-charcoal bg-duck-yellow",
                "font-mono text-xs uppercase tracking-widest text-charcoal",
                "shadow-[3px_3px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {badge}
            </span>
          </motion.div>

          {/* Title with animated highlight */}
          <motion.h1
            className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-wide text-charcoal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="relative inline-block">
              {title.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  {word === "PLAN" ? (
                    <span className="relative">
                      {word}
                      <motion.span
                        className="absolute -bottom-2 left-0 right-0 h-3 bg-duck-blue -z-10"
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
            className="mx-auto max-w-2xl font-mono text-base md:text-lg lg:text-xl leading-relaxed text-charcoal/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={cn(
                  "flex items-center gap-3 px-5 py-3",
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
                <stat.icon className="h-5 w-5 text-charcoal" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="font-mono text-lg font-bold text-charcoal">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof Avatars */}
          <motion.div
            className="flex items-center justify-center gap-3 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-10 w-10 border-2 border-charcoal",
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
            <span className="font-mono text-sm text-charcoal">
              {socialProofText}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Border Line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </section>
  )
}
