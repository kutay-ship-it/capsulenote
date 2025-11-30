"use client"

import { motion, useInView } from "framer-motion"
import { Sparkles, Check, ArrowRight, Gift, Crown } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for your first letter",
    icon: Gift,
    color: "bg-duck-blue",
    features: [
      "1 free letter",
      "Email delivery",
      "Basic encryption",
      "Schedule up to 5 years ahead",
    ],
    cta: "Start Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Premium",
    price: "$5",
    period: "/year",
    description: "Unlimited letters, physical mail",
    icon: Crown,
    color: "bg-duck-yellow",
    features: [
      "Unlimited letters",
      "Email + physical mail",
      "Advanced encryption",
      "Schedule up to 50 years ahead",
      "Priority delivery",
      "Writing prompts",
    ],
    cta: "Go Premium",
    href: "/pricing",
    popular: true,
  },
]

export function PricingPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-cream py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Simple Pricing
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Start Free,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Upgrade Anytime</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-blue -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Your first letter is always free. No credit card required.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-3xl grid gap-6 md:grid-cols-2">
          {TIERS.map((tier, index) => {
            const Icon = tier.icon
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className={`relative border-2 border-charcoal bg-white p-6 ${
                  tier.popular
                    ? "shadow-[6px_6px_0_theme(colors.charcoal)]"
                    : "shadow-[4px_4px_0_theme(colors.charcoal)]"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral border-2 border-charcoal px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ borderRadius: "2px" }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center border-2 border-charcoal ${tier.color} mb-3`}
                      style={{ borderRadius: "2px" }}
                    >
                      <Icon className="h-5 w-5 text-charcoal" strokeWidth={2} />
                    </div>
                    <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                      {tier.name}
                    </h3>
                    <p className="font-mono text-xs text-charcoal/60">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-charcoal">{tier.price}</span>
                    <span className="font-mono text-sm text-charcoal/60">{tier.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div
                        className="flex h-5 w-5 items-center justify-center bg-teal-primary border border-charcoal"
                        style={{ borderRadius: "2px" }}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-mono text-xs text-charcoal/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={tier.href as any}>
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className="w-full gap-2 group"
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Full Pricing Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 font-mono text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            See full pricing details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
