/**
 * New Subscribe Pricing Component (V3 Design)
 *
 * Journey-focused pricing that resonates with Capsule Note's meaningful,
 * emotional value proposition. Based on the pricing-views sandbox patterns
 * but adapted for the anonymous checkout flow.
 *
 * Key Features:
 * - Journey-tier emotional framing
 * - Visual letter metaphors
 * - Neo-brutalist design (MotherDuck aesthetic)
 * - Locked email integration
 * - Seamless Stripe checkout flow
 */

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Check,
  ArrowRight,
  Mail,
  Send,
  Heart,
  Sparkles,
  Info,
  Shield,
  Users,
  Quote,
} from "lucide-react"
import { SubscribeButton } from "./subscribe-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ============================================================================
// TYPES
// ============================================================================

interface Plan {
  id: "digital" | "paper"
  name: string
  tagline: string
  price: number
  interval: "year"
  icon: React.ElementType
  color: string
  popular?: boolean
  priceId: string
  features: string[]
  lettersPerMonth: string | number
  savingsText?: string
}

interface SubscribePricingNewProps {
  email: string
  letterId?: string
  metadata?: Record<string, unknown>
  digitalPriceId: string
  paperPriceId: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SubscribePricingNew({
  email,
  letterId,
  metadata,
  digitalPriceId,
  paperPriceId,
}: SubscribePricingNewProps) {
  const [hoveredPlan, setHoveredPlan] = React.useState<string | null>(null)
  const [showStickyMobile, setShowStickyMobile] = React.useState(false)
  const planCardsRef = React.useRef<HTMLDivElement>(null)

  // Show sticky mobile CTA when user scrolls past plan cards
  React.useEffect(() => {
    const handleScroll = () => {
      if (!planCardsRef.current) return
      const rect = planCardsRef.current.getBoundingClientRect()
      const isScrolledPast = rect.bottom < 0
      setShowStickyMobile(isScrolledPast)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const plans: Plan[] = [
    {
      id: "digital",
      name: "Digital Capsule",
      tagline: "For personal reflection",
      price: 9,
      interval: "year",
      icon: Mail,
      color: "duck-blue",
      priceId: digitalPriceId,
      lettersPerMonth: "6",
      features: [
        "6 digital letter deliveries per year",
        "Send to yourself or friends & family",
        "Schedule up to 100 years ahead",
        "Timezone-aware delivery",
        "End-to-end encryption",
        "Extra digital letters purchaseable",
      ],
    },
    {
      id: "paper",
      name: "Paper & Pixels",
      tagline: "For meaningful keepsakes",
      price: 29,
      interval: "year",
      icon: Send,
      color: "teal-primary",
      popular: true,
      priceId: paperPriceId,
      lettersPerMonth: "24",
      savingsText: "Most Popular",
      features: [
        "24 digital letter deliveries per year",
        "3 physical letters per year",
        "Send to yourself or friends & family",
        "Address confirmation reminders",
        "Priority mail routing",
        "Extra digital & physical letters purchaseable",
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal md:text-4xl">
          Choose Your Journey
        </h2>
        <p className="mx-auto max-w-2xl font-mono text-base text-charcoal/70">
          Every meaningful connection starts with a single letter.
          <br />
          Build your practice of reflection and connection.
        </p>
      </div>

      {/* Plan Cards */}
      <div ref={planCardsRef} className="grid gap-6 md:grid-cols-2">
        {plans.map((plan, i) => {
          const isHovered = hoveredPlan === plan.id

          return (
            <motion.div
              key={plan.id}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 border-2 border-charcoal bg-coral px-4 py-1.5 shadow-[2px_2px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    {plan.savingsText || "Most Popular"}
                  </span>
                </div>
              )}

              <motion.div
                className={cn(
                  "flex h-full flex-col border-2 border-charcoal p-6",
                  plan.popular ? "bg-duck-blue" : "bg-white",
                  "shadow-[4px_4px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
                animate={{ y: isHovered ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center border-2 border-charcoal"
                  )}
                  style={{
                    borderRadius: "2px",
                    backgroundColor:
                      plan.color === "duck-blue"
                        ? "#6FC2FF"
                        : plan.color === "teal-primary"
                        ? "#38C1B0"
                        : "#FFDE00",
                  }}
                >
                  <plan.icon className="h-7 w-7 text-charcoal" strokeWidth={2} />
                </div>

                {/* Name & Tagline */}
                <h3 className="font-mono text-xl font-bold uppercase text-charcoal">
                  {plan.name}
                </h3>
                <p className="mb-4 font-mono text-sm text-charcoal/60">
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <span className="font-mono text-5xl font-bold text-charcoal">
                    ${plan.price}
                  </span>
                  <span className="font-mono text-lg text-charcoal/60">
                    /year
                  </span>
                  <div className="mt-1 font-mono text-xs text-charcoal/50">
                    ${(plan.price / 12).toFixed(2)}/month billed annually
                  </div>
                </div>

                {/* Letters Visual Indicator */}
                <div className="mb-6 space-y-2">
                  {/* Digital Letters */}
                  <div
                    className="flex items-center gap-2 border-2 border-charcoal/20 bg-white/50 px-3 py-2"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex -space-x-1">
                      {[...Array(plan.id === "digital" ? 3 : 5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-6 w-4 border border-charcoal bg-duck-yellow"
                          style={{ borderRadius: "1px" }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-bold text-charcoal">
                      {plan.lettersPerMonth} digital/year
                    </span>
                  </div>

                  {/* Physical Letters (Paper & Pixels only) */}
                  {plan.id === "paper" && (
                    <div
                      className="flex items-center gap-2 border-2 border-charcoal/20 bg-white/50 px-3 py-2"
                      style={{ borderRadius: "2px" }}
                    >
                      <div className="flex -space-x-1">
                        {[...Array(3)].map((_, j) => (
                          <div
                            key={j}
                            className="h-6 w-4 border border-charcoal bg-coral"
                            style={{ borderRadius: "1px" }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs font-bold text-charcoal">
                        3 physical/year
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center border border-charcoal bg-teal-primary"
                        style={{ borderRadius: "2px" }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-mono text-sm text-charcoal leading-relaxed">
                        {feature}
                      </span>
                    </li>
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
                    "flex w-full items-center justify-center gap-2 border-2 border-charcoal px-6 py-3",
                    "font-mono text-sm font-bold uppercase tracking-wider",
                    "transition-all hover:-translate-y-0.5",
                    plan.popular
                      ? "bg-charcoal text-white hover:shadow-[4px_4px_0_theme(colors.duck-yellow)]"
                      : "bg-duck-yellow text-charcoal hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  Choose {plan.name}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </SubscribeButton>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Guarantee Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-4 border-teal-primary bg-teal-primary/10 p-8 text-center"
        style={{ borderRadius: "2px" }}
      >
        <div className="mx-auto max-w-md space-y-4">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-teal-primary"
            style={{ borderRadius: "2px" }}
          >
            <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="font-mono text-2xl font-bold uppercase text-charcoal">
            30-Day Money Back Guarantee
          </h3>
          <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
            Try Capsule Note risk-free. If you're not completely satisfied within the first 30 days,
            we'll refund you in full—no questions asked. We're confident you'll love it.
          </p>
        </div>
      </motion.div>

      {/* Social Proof */}
      <div
        className="border-2 border-charcoal bg-white p-6 text-center"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="h-5 w-5 text-teal-primary" strokeWidth={2} />
          <p className="font-mono text-sm font-bold uppercase text-charcoal">
            Join 10,000+ People Reflecting with Capsule Note
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {/* Testimonial 1 */}
          <div className="space-y-3">
            <Quote className="h-6 w-6 text-duck-blue mx-auto" />
            <p className="font-mono text-xs text-charcoal/80 italic leading-relaxed">
              "Reading my letter one year later was incredibly powerful. I forgot I wrote those goals, and I actually achieved most of them!"
            </p>
            <p className="font-mono text-xs font-bold text-charcoal">
              — Sarah K., Digital Plan
            </p>
          </div>
          {/* Testimonial 2 */}
          <div className="space-y-3">
            <Quote className="h-6 w-6 text-teal-primary mx-auto" />
            <p className="font-mono text-xs text-charcoal/80 italic leading-relaxed">
              "The physical letter to my daughter for her 18th birthday is going to be priceless. This is more than an app—it's a time capsule."
            </p>
            <p className="font-mono text-xs font-bold text-charcoal">
              — Michael T., Paper & Pixels
            </p>
          </div>
          {/* Testimonial 3 */}
          <div className="space-y-3">
            <Quote className="h-6 w-6 text-coral mx-auto" />
            <p className="font-mono text-xs text-charcoal/80 italic leading-relaxed">
              "I use it for gratitude journaling. Getting those letters quarterly reminds me how far I've come. Simple, but life-changing."
            </p>
            <p className="font-mono text-xs font-bold text-charcoal">
              — Emma L., Digital Plan
            </p>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div
        className="border-2 border-dashed border-charcoal/30 bg-cream p-6 text-center"
        style={{ borderRadius: "2px" }}
      >
        <div className="mx-auto max-w-2xl space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-coral" fill="#FF7169" />
            <Sparkles className="h-5 w-5 text-duck-yellow" fill="#FFDE00" />
            <Heart className="h-5 w-5 text-coral" fill="#FF7169" />
          </div>
          <h3 className="font-mono text-lg font-bold uppercase text-charcoal">
            Why Capsule Note?
          </h3>
          <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
            We believe in the power of reflection. Every letter you write is an
            investment in your future self—a moment of clarity, connection, or
            celebration delivered exactly when you need it most.
          </p>
        </div>
      </div>

      {/* Trust Signals */}
      <div
        className="border-2 border-charcoal bg-white p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="grid gap-6 text-center sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-2xl">🔒</div>
            <p className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
              Secure & Private
            </p>
            <p className="font-mono text-xs text-charcoal/60">
              End-to-end encryption for all your letters
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">💳</div>
            <p className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
              Safe Payments
            </p>
            <p className="font-mono text-xs text-charcoal/60">
              Powered by Stripe, industry-leading security
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">❌</div>
            <p className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
              Cancel Anytime
            </p>
            <p className="font-mono text-xs text-charcoal/60">
              No commitments, cancel your subscription anytime
            </p>
          </div>
        </div>
      </div>

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
              Most Popular
            </p>
            <p className="font-mono text-sm text-charcoal">
              Paper & Pixels - $29/year
            </p>
          </div>
          <SubscribeButton
            email={email}
            priceId={paperPriceId}
            planName="Paper & Pixels"
            letterId={letterId}
            metadata={metadata}
            className="flex items-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3 font-mono text-sm font-bold uppercase text-white hover:shadow-[2px_2px_0_theme(colors.duck-yellow)]"
            style={{ borderRadius: "2px" }}
          >
            Choose Plan
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </SubscribeButton>
        </div>
      </motion.div>
    </div>
  )
}
