"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Mail, Clock, Sparkles } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface HeroSectionProps {
  isSignedIn: boolean
}

export function HeroSection({ isSignedIn }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-[90vh] overflow-hidden bg-cream">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-20 -right-20 h-[400px] w-[400px] border-[8px] border-charcoal"
          style={{ borderRadius: "2px" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/3 -left-32 h-[300px] w-[300px] bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.08, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-20 right-1/4 h-[200px] w-[200px] bg-duck-blue"
          style={{ borderRadius: "2px" }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="container relative z-10 px-4 pt-24 pb-16 sm:px-6 sm:pt-32 md:pt-40">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <span
              className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              Write letters to your future self
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="font-mono text-4xl font-bold uppercase leading-none tracking-wide text-charcoal sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              <span className="block">Send a</span>
              <span className="relative inline-block mt-2">
                <span className="relative z-10">Message</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute bottom-2 left-0 right-0 h-4 bg-duck-blue origin-left -z-0 sm:h-6 md:h-8"
                  style={{ borderRadius: "2px" }}
                />
              </span>
              <span className="block mt-2">
                Through{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-teal-primary">Time</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="absolute bottom-2 left-0 right-0 h-4 bg-duck-yellow origin-left -z-0 sm:h-6 md:h-8"
                    style={{ borderRadius: "2px" }}
                  />
                </span>
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto mt-8 max-w-2xl text-center font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg md:text-xl"
          >
            Write letters that arrive when you need them most.
            Digital delivery or real physical mail — your words, waiting in the future.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="group gap-3 text-lg shadow-md hover:shadow-lg">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button size="lg" className="group gap-3 text-lg shadow-md hover:shadow-lg">
                    Start Writing Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: Mail, label: "Email Delivery" },
              { icon: Clock, label: "Scheduled Release" },
              { label: "Physical Mail" },
            ].map((item, i) => (
              <span
                key={item.label}
                className="flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
                style={{ borderRadius: "2px" }}
              >
                {item.icon && <item.icon className="h-4 w-4" strokeWidth={2} />}
                {!item.icon && (
                  <span className="flex h-4 w-4 items-center justify-center border-2 border-charcoal bg-coral" style={{ borderRadius: "2px" }}>
                    <span className="text-[8px] text-white font-bold">NEW</span>
                  </span>
                )}
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">Scroll</span>
          <div className="h-12 w-6 border-2 border-charcoal/30" style={{ borderRadius: "9999px" }}>
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mt-2 h-2 w-2 bg-charcoal/50"
              style={{ borderRadius: "9999px" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
