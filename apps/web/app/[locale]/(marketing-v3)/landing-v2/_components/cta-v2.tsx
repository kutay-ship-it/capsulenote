"use client"

import { motion, useInView } from "framer-motion"
import { ArrowRight, Mail, Sparkles, Clock, Heart } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface CTAV2Props {
  isSignedIn: boolean
}

export function CTAV2({ isSignedIn }: CTAV2Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-cream py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Decorative Background Shapes */}
          <div
            className="absolute -top-4 -left-4 h-full w-full bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          />
          <div
            className="absolute -top-2 -left-2 h-full w-full bg-charcoal"
            style={{ borderRadius: "2px" }}
          />

          {/* Main Card */}
          <div
            className="relative border-4 border-charcoal bg-teal-primary p-8 sm:p-12 md:p-16"
            style={{ borderRadius: "2px" }}
          >
            {/* Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div
                className="flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Heart className="h-4 w-4 text-coral fill-coral" strokeWidth={2} />
                Your Future Self is Waiting
              </div>
            </div>

            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.5 }}
                className="flex h-24 w-24 items-center justify-center border-4 border-charcoal bg-white shadow-[6px_6px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-12 w-12 text-charcoal" strokeWidth={2} />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="mb-4 font-mono text-2xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
                Start Your First Letter Today
              </h2>

              <p className="mx-auto mb-8 max-w-xl font-mono text-base leading-relaxed text-charcoal/80 sm:text-lg">
                It takes just 5 minutes to plant a seed that will bloom in your future.
                <br className="hidden sm:block" />
                What will you tell yourself?
              </p>

              {/* Unique Stats (different from hero) */}
              <div className="mb-8 flex flex-wrap justify-center gap-4 sm:gap-6">
                {[
                  { icon: Sparkles, value: "Free", label: "First Letter" },
                  { icon: Clock, value: "5 min", label: "To Write" },
                  { icon: Mail, value: "50 yrs", label: "Max Schedule" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 border-2 border-charcoal bg-white px-4 py-3"
                    style={{ borderRadius: "2px" }}
                  >
                    <stat.icon className="h-5 w-5 text-charcoal" strokeWidth={2} />
                    <div className="text-left">
                      <p className="font-mono text-lg font-bold text-charcoal">
                        {stat.value}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Single Focused CTA */}
              <div className="flex justify-center">
                {isSignedIn ? (
                  <Link href="/letters/new">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="group gap-3 text-lg shadow-md hover:shadow-lg px-8"
                    >
                      Write a New Letter
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="group gap-3 text-lg shadow-md hover:shadow-lg px-8"
                    >
                      Start Writing Free
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* No credit card required note */}
              <p className="mt-4 font-mono text-xs text-charcoal/60">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
