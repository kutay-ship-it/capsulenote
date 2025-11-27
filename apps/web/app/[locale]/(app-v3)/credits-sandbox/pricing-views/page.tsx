"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Check,
  ArrowRight,
  Sparkles,
  Mail,
  Send,
  Calendar,
  Lock,
  Crown,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Calculator,
  CreditCard,
  Plus,
  Minus,
  Star,
  Quote,
  Heart,
  Zap,
  Shield,
  Clock,
  PenLine,
  Coins,
} from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

type PricingVariation = "journey" | "calculator" | "accordion" | "story" | "credits"
type BillingPeriod = "monthly" | "yearly"

// ============================================================================
// MOCK DATA
// ============================================================================

const TIERS = {
  journey: [
    {
      id: "first-letter",
      name: "First Letter",
      tagline: "Begin your journey",
      monthlyPrice: 0,
      yearlyPrice: 0,
      lettersPerMonth: 3,
      icon: PenLine,
      color: "duck-yellow",
      features: ["3 letters/month", "Email delivery", "7-day scheduling", "Basic editor"],
    },
    {
      id: "regular-writer",
      name: "Regular Writer",
      tagline: "Build your practice",
      monthlyPrice: 12,
      yearlyPrice: 79,
      lettersPerMonth: "Unlimited",
      icon: Heart,
      color: "duck-blue",
      popular: true,
      features: ["Unlimited letters", "Email + Paper mail", "10-year scheduling", "Rich editor", "Templates"],
    },
    {
      id: "collector",
      name: "Time Capsule Collector",
      tagline: "Create your legacy",
      monthlyPrice: 29,
      yearlyPrice: 199,
      lettersPerMonth: "Unlimited",
      icon: Crown,
      color: "teal-primary",
      features: ["Everything in Writer", "Priority delivery", "Custom branding", "Family sharing", "API access"],
    },
  ],
  standard: [
    {
      name: "Starter",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["3 letters/month", "Email delivery", "7-day scheduling", "Basic editor", "Community support"],
    },
    {
      name: "Pro",
      monthlyPrice: 12,
      yearlyPrice: 79,
      popular: true,
      features: ["Unlimited letters", "Email + Paper mail", "10-year scheduling", "Rich editor", "Letter templates", "Priority support"],
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      features: ["Everything in Pro", "Team collaboration", "Admin dashboard", "Custom branding", "API access", "SLA guarantee"],
    },
  ],
}

const FEATURES_LIST = [
  { category: "Letters", features: [
    { name: "Letters per month", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Rich text editor", free: false, pro: true, enterprise: true },
    { name: "Letter templates", free: false, pro: true, enterprise: true },
    { name: "Photo attachments", free: false, pro: true, enterprise: true },
  ]},
  { category: "Delivery", features: [
    { name: "Email delivery", free: true, pro: true, enterprise: true },
    { name: "Physical mail", free: false, pro: true, enterprise: true },
    { name: "Schedule ahead", free: "7 days", pro: "10 years", enterprise: "10 years" },
    { name: "Arrive-by mode", free: false, pro: true, enterprise: true },
  ]},
  { category: "Security", features: [
    { name: "End-to-end encryption", free: true, pro: true, enterprise: true },
    { name: "2FA authentication", free: true, pro: true, enterprise: true },
    { name: "SOC 2 compliance", free: false, pro: false, enterprise: true },
  ]},
]

const PERSONAS = [
  {
    name: "Sarah",
    avatar: "S",
    plan: "Starter",
    role: "Once-a-year writer",
    story: "Sarah writes one letter to herself every birthday. She's used the free plan for 3 years and received letters that brought tears of joy.",
    stats: { letters: 3, delivered: 3, nextDelivery: "Birthday 2025" },
    color: "duck-yellow",
  },
  {
    name: "Marcus",
    avatar: "M",
    plan: "Pro",
    role: "Weekly reflection practice",
    story: "Marcus writes weekly reflections and anniversary letters to his wife. He's built a meaningful practice that strengthens his marriage.",
    stats: { letters: 156, delivered: 142, nextDelivery: "This Sunday" },
    color: "duck-blue",
  },
  {
    name: "Elena Corp",
    avatar: "EC",
    plan: "Enterprise",
    role: "HR milestone program",
    story: "Elena's company sends personalized milestone letters to all 500+ employees on work anniversaries, creating memorable moments.",
    stats: { letters: 2847, delivered: 2834, nextDelivery: "Daily" },
    color: "teal-primary",
  },
]

const CREDIT_PACKS = [
  { credits: 5, price: 5, perCredit: 1.00, discount: 0 },
  { credits: 10, price: 9, perCredit: 0.90, discount: 10 },
  { credits: 25, price: 19, perCredit: 0.76, discount: 24 },
  { credits: 50, price: 35, perCredit: 0.70, discount: 30 },
  { credits: 100, price: 65, perCredit: 0.65, discount: 35 },
]

// ============================================================================
// VARIATION 1: JOURNEY TIERS
// ============================================================================

function JourneyTiersPricing({ billing }: { billing: BillingPeriod }) {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Choose Your Journey
        </h2>
        <p className="mt-2 font-mono text-sm text-charcoal/70">
          Every great journey starts with a single letter
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.journey.map((tier, i) => {
          const price = billing === "yearly" ? tier.yearlyPrice : tier.monthlyPrice
          const isHovered = hoveredTier === tier.id

          return (
            <motion.div
              key={tier.id}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 border-2 border-charcoal bg-coral px-3 py-1 shadow-[2px_2px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <motion.div
                className={cn(
                  "flex h-full flex-col border-2 border-charcoal p-6",
                  tier.popular ? "bg-duck-blue" : "bg-white",
                  "shadow-[4px_4px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
                animate={{ y: isHovered ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center border-2 border-charcoal",
                    `bg-${tier.color}`
                  )}
                  style={{
                    borderRadius: "2px",
                    backgroundColor:
                      tier.color === "duck-yellow" ? "#FFDE00" :
                      tier.color === "duck-blue" ? "#6FC2FF" :
                      tier.color === "teal-primary" ? "#38C1B0" : "#FFDE00",
                  }}
                >
                  <tier.icon className="h-7 w-7 text-charcoal" strokeWidth={2} />
                </div>

                {/* Name & Tagline */}
                <h3 className="font-mono text-lg font-bold uppercase text-charcoal">
                  {tier.name}
                </h3>
                <p className="mb-4 font-mono text-xs text-charcoal/60">
                  {tier.tagline}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold text-charcoal">
                    ${price}
                  </span>
                  {price > 0 && (
                    <span className="font-mono text-sm text-charcoal/60">
                      /{billing === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>

                {/* Letters visual */}
                <div
                  className="mb-4 flex items-center gap-2 border-2 border-charcoal/20 bg-white/50 px-3 py-2"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex -space-x-1">
                    {[...Array(typeof tier.lettersPerMonth === "number" ? Math.min(tier.lettersPerMonth, 5) : 5)].map((_, j) => (
                      <div
                        key={j}
                        className="h-6 w-4 border border-charcoal bg-duck-yellow"
                        style={{ borderRadius: "1px" }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-charcoal">
                    {tier.lettersPerMonth} letters/month
                  </span>
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <div
                        className="flex h-4 w-4 items-center justify-center border border-charcoal bg-teal-primary"
                        style={{ borderRadius: "2px" }}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-mono text-xs text-charcoal">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={cn(
                    "flex w-full items-center justify-center gap-2 border-2 border-charcoal px-4 py-3",
                    "font-mono text-xs font-bold uppercase tracking-wider",
                    "transition-all hover:-translate-y-0.5",
                    tier.popular
                      ? "bg-charcoal text-white hover:shadow-[4px_4px_0_theme(colors.duck-yellow)]"
                      : "bg-duck-yellow text-charcoal hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {price === 0 ? "Start Free" : "Choose Plan"}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 2: CALCULATOR-FIRST
// ============================================================================

function CalculatorPricing() {
  const [lettersPerMonth, setLettersPerMonth] = useState(5)
  const [deliveryType, setDeliveryType] = useState<"email" | "paper" | "both">("email")
  const [scheduleYears, setScheduleYears] = useState(1)

  // Calculate recommended plan
  const getRecommendedPlan = () => {
    if (lettersPerMonth <= 3 && deliveryType === "email" && scheduleYears <= 1) {
      return { plan: "Starter", price: 0, reason: "Free plan covers your needs!" }
    }
    if (lettersPerMonth <= 20 || deliveryType !== "both") {
      return { plan: "Pro", price: 12, reason: "Best value for regular writers" }
    }
    return { plan: "Enterprise", price: "Custom", reason: "For high-volume needs" }
  }

  const recommendation = getRecommendedPlan()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <Calculator className="h-4 w-4" strokeWidth={2} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Plan Calculator
          </span>
        </div>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Find Your Perfect Plan
        </h2>
        <p className="mt-2 font-mono text-sm text-charcoal/70">
          Answer a few questions and we'll recommend the best option
        </p>
      </div>

      {/* Calculator Card */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Letters per month */}
        <div className="mb-6">
          <label className="mb-3 block font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
            Letters per month
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLettersPerMonth(Math.max(1, lettersPerMonth - 1))}
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all hover:bg-charcoal/5"
              style={{ borderRadius: "2px" }}
            >
              <Minus className="h-4 w-4" strokeWidth={2} />
            </button>
            <div
              className="flex h-14 w-24 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-2xl font-bold text-charcoal">
                {lettersPerMonth}
              </span>
            </div>
            <button
              onClick={() => setLettersPerMonth(Math.min(50, lettersPerMonth + 1))}
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all hover:bg-charcoal/5"
              style={{ borderRadius: "2px" }}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
            <input
              type="range"
              min="1"
              max="50"
              value={lettersPerMonth}
              onChange={(e) => setLettersPerMonth(Number(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        {/* Delivery type */}
        <div className="mb-6">
          <label className="mb-3 block font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
            Delivery Type
          </label>
          <div className="flex gap-3">
            {[
              { id: "email", label: "Email Only", icon: Mail },
              { id: "paper", label: "Paper Mail", icon: Send },
              { id: "both", label: "Both", icon: Sparkles },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setDeliveryType(option.id as typeof deliveryType)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 border-2 border-charcoal p-4 transition-all",
                  deliveryType === option.id
                    ? "bg-duck-blue shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white hover:bg-charcoal/5"
                )}
                style={{ borderRadius: "2px" }}
              >
                <option.icon className="h-5 w-5 text-charcoal" strokeWidth={2} />
                <span className="font-mono text-xs font-bold uppercase">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule ahead */}
        <div className="mb-6">
          <label className="mb-3 block font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
            Schedule how far ahead?
          </label>
          <div className="flex gap-3">
            {[
              { years: 1, label: "1 Year" },
              { years: 5, label: "5 Years" },
              { years: 10, label: "10 Years" },
            ].map((option) => (
              <button
                key={option.years}
                onClick={() => setScheduleYears(option.years)}
                className={cn(
                  "flex flex-1 items-center justify-center border-2 border-charcoal py-3 transition-all",
                  scheduleYears === option.years
                    ? "bg-teal-primary text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal hover:bg-charcoal/5"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-xs font-bold uppercase">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t-2 border-dashed border-charcoal/20" />

        {/* Recommendation */}
        <motion.div
          key={recommendation.plan}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-charcoal/60">
            We Recommend
          </p>
          <div
            className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-6 py-3 shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-2xl font-bold uppercase text-charcoal">
              {recommendation.plan}
            </span>
            {typeof recommendation.price === "number" && (
              <span className="ml-2 font-mono text-lg text-charcoal/70">
                ${recommendation.price}/mo
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-charcoal/70">{recommendation.reason}</p>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.duck-yellow)]"
            style={{ borderRadius: "2px" }}
          >
            Get Started with {recommendation.plan}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 3: FEATURE ACCORDION
// ============================================================================

function AccordionPricing() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Letters")

  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <div
          className="flex h-6 w-6 items-center justify-center border-2 border-teal-primary bg-teal-primary"
          style={{ borderRadius: "2px" }}
        >
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      ) : (
        <div className="h-6 w-6 border-2 border-charcoal/20" style={{ borderRadius: "2px" }} />
      )
    }
    return (
      <span className="font-mono text-xs font-bold text-charcoal">{value}</span>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Compare Features
        </h2>
        <p className="mt-2 font-mono text-sm text-charcoal/70">
          Expand each category to see what's included
        </p>
      </div>

      {/* Plan Headers */}
      <div className="grid grid-cols-4 gap-4">
        <div /> {/* Empty cell */}
        {["Starter", "Pro", "Enterprise"].map((plan, i) => (
          <div
            key={plan}
            className={cn(
              "border-2 border-charcoal p-4 text-center",
              i === 1 ? "bg-duck-blue" : "bg-white"
            )}
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-sm font-bold uppercase text-charcoal">
              {plan}
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-charcoal">
              {plan === "Starter" ? "$0" : plan === "Pro" ? "$12" : "Custom"}
            </div>
          </div>
        ))}
      </div>

      {/* Accordion Categories */}
      <div className="space-y-3">
        {FEATURES_LIST.map((category) => {
          const isExpanded = expandedCategory === category.category

          return (
            <div
              key={category.category}
              className="border-2 border-charcoal overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                className={cn(
                  "flex w-full items-center justify-between p-4",
                  isExpanded ? "bg-duck-yellow" : "bg-white hover:bg-charcoal/5"
                )}
              >
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                  {category.category}
                </span>
                <div
                  className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  )}
                </div>
              </button>

              {/* Features List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t-2 border-charcoal bg-white"
                  >
                    {category.features.map((feature, i) => (
                      <div
                        key={feature.name}
                        className={cn(
                          "grid grid-cols-4 gap-4 p-4",
                          i !== category.features.length - 1 && "border-b border-charcoal/10"
                        )}
                      >
                        <span className="font-mono text-sm text-charcoal">
                          {feature.name}
                        </span>
                        <div className="flex justify-center">
                          {renderValue(feature.free)}
                        </div>
                        <div className="flex justify-center">
                          {renderValue(feature.pro)}
                        </div>
                        <div className="flex justify-center">
                          {renderValue(feature.enterprise)}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Sticky CTA */}
      <div
        className="sticky bottom-4 border-2 border-charcoal bg-charcoal p-4 shadow-[4px_4px_0_theme(colors.duck-yellow)]"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm text-white">
            Ready to start? Most users choose <strong>Pro</strong>
          </span>
          <button
            className="flex items-center gap-2 border-2 border-duck-yellow bg-duck-yellow px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5"
            style={{ borderRadius: "2px" }}
          >
            Start Pro Trial
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 4: VALUE STORY
// ============================================================================

function StoryPricing() {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[1]!)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Real Writers, Real Stories
        </h2>
        <p className="mt-2 font-mono text-sm text-charcoal/70">
          See how others use Capsule Note and find your fit
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PERSONAS.map((persona) => {
          const isSelected = selectedPersona.name === persona.name

          return (
            <motion.button
              key={persona.name}
              onClick={() => setSelectedPersona(persona)}
              className={cn(
                "relative text-left border-2 border-charcoal p-6 transition-all",
                isSelected
                  ? "bg-duck-blue shadow-[4px_4px_0_theme(colors.charcoal)]"
                  : "bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Avatar */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center border-2 border-charcoal font-mono text-lg font-bold"
                  style={{
                    borderRadius: "2px",
                    backgroundColor:
                      persona.color === "duck-yellow" ? "#FFDE00" :
                      persona.color === "duck-blue" ? "#6FC2FF" : "#38C1B0",
                  }}
                >
                  {persona.avatar}
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-charcoal">
                    {persona.name}
                  </div>
                  <div className="font-mono text-xs text-charcoal/60">
                    {persona.role}
                  </div>
                </div>
              </div>

              {/* Plan badge */}
              <div
                className={cn(
                  "mb-3 inline-block border-2 border-charcoal px-3 py-1",
                  persona.plan === "Pro" ? "bg-coral text-white" : "bg-white text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  {persona.plan} Plan
                </span>
              </div>

              {/* Story preview */}
              <p className="font-mono text-xs text-charcoal/70 line-clamp-2">
                {persona.story}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Persona Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPersona.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="border-2 border-charcoal bg-white p-8 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="grid gap-8 md:grid-cols-2">
            {/* Story */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Quote className="h-6 w-6 text-charcoal/30" />
                <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                  {selectedPersona.name}'s Story
                </span>
              </div>
              <p className="font-mono text-lg leading-relaxed text-charcoal">
                {selectedPersona.story}
              </p>
            </div>

            {/* Stats */}
            <div>
              <div className="mb-4 font-mono text-xs uppercase tracking-wider text-charcoal/60">
                By The Numbers
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="border-2 border-charcoal bg-duck-yellow p-4 text-center"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="font-mono text-2xl font-bold text-charcoal">
                    {selectedPersona.stats.letters}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                    Letters
                  </div>
                </div>
                <div
                  className="border-2 border-charcoal bg-teal-primary p-4 text-center"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="font-mono text-2xl font-bold text-white">
                    {selectedPersona.stats.delivered}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-white/70">
                    Delivered
                  </div>
                </div>
                <div
                  className="border-2 border-charcoal bg-white p-4 text-center"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="font-mono text-sm font-bold text-charcoal">
                    {selectedPersona.stats.nextDelivery}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                    Next
                  </div>
                </div>
              </div>

              <button
                className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.duck-yellow)]"
                style={{ borderRadius: "2px" }}
              >
                Start Like {selectedPersona.name.split(" ")[0]}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// VARIATION 5: CREDITS SYSTEM
// ============================================================================

function CreditsPricing() {
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKS[2]!)
  const [quantity, setQuantity] = useState(1)

  const totalCredits = selectedPack?.credits ?? 0
  const totalPrice = selectedPack?.price ?? 0

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <Coins className="h-4 w-4" strokeWidth={2} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Pay As You Go
          </span>
        </div>
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Buy Letter Credits
        </h2>
        <p className="mt-2 font-mono text-sm text-charcoal/70">
          No subscription required. Credits never expire.
        </p>
      </div>

      {/* Credit Info */}
      <div
        className="flex items-center justify-center gap-6 border-2 border-charcoal bg-white p-4"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-duck-blue"
            style={{ borderRadius: "50%" }}
          >
            <span className="font-mono text-sm font-bold">1</span>
          </div>
          <span className="font-mono text-xs">= 1 Email Letter</span>
        </div>
        <div className="h-6 w-px bg-charcoal/20" />
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "50%" }}
          >
            <span className="font-mono text-sm font-bold">3</span>
          </div>
          <span className="font-mono text-xs">= 1 Paper Letter</span>
        </div>
      </div>

      {/* Credit Packs */}
      <div className="grid gap-3">
        {CREDIT_PACKS.map((pack) => {
          const isSelected = selectedPack.credits === pack.credits

          return (
            <motion.button
              key={pack.credits}
              onClick={() => setSelectedPack(pack)}
              className={cn(
                "flex items-center justify-between border-2 border-charcoal p-4 transition-all",
                isSelected
                  ? "bg-duck-yellow shadow-[4px_4px_0_theme(colors.charcoal)]"
                  : "bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                {/* Credit coins visual */}
                <div className="flex -space-x-2">
                  {[...Array(Math.min(5, Math.ceil(pack.credits / 10)))].map((_, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-blue"
                      style={{ borderRadius: "50%" }}
                    >
                      <Star className="h-4 w-4 text-charcoal" fill="#383838" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="font-mono text-lg font-bold text-charcoal">
                    {pack.credits} Credits
                  </div>
                  <div className="font-mono text-xs text-charcoal/60">
                    ${pack.perCredit.toFixed(2)} per credit
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {pack.discount > 0 && (
                  <div
                    className="border-2 border-coral bg-coral/10 px-2 py-1"
                    style={{ borderRadius: "2px" }}
                  >
                    <span className="font-mono text-xs font-bold text-coral">
                      SAVE {pack.discount}%
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-charcoal">
                    ${pack.price}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Quantity Selector */}
      <div
        className="border-2 border-charcoal bg-charcoal p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-white/60">
              Your Order
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-8 w-8 items-center justify-center border-2 border-white bg-white/10 text-white transition-all hover:bg-white/20"
                style={{ borderRadius: "2px" }}
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="font-mono text-xl font-bold text-white">
                {quantity}x
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center border-2 border-white bg-white/10 text-white transition-all hover:bg-white/20"
                style={{ borderRadius: "2px" }}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="font-mono text-lg text-white/70">
                {selectedPack.credits} credit pack
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-3xl font-bold text-duck-yellow">
              {totalCredits} Credits
            </div>
            <div className="font-mono text-lg text-white">
              ${totalPrice}
            </div>
          </div>
        </div>

        <button
          className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-duck-yellow bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5"
          style={{ borderRadius: "2px" }}
        >
          <CreditCard className="h-4 w-4" strokeWidth={2} />
          Buy {totalCredits} Credits for ${totalPrice}
        </button>
      </div>

      {/* Unlimited option */}
      <div
        className="border-2 border-dashed border-charcoal/40 p-6 text-center"
        style={{ borderRadius: "2px" }}
      >
        <p className="mb-3 font-mono text-sm text-charcoal/70">
          Writing often? Get unlimited letters for a flat monthly fee.
        </p>
        <button
          className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal underline decoration-2 underline-offset-4 hover:text-charcoal/70"
        >
          View Subscription Plans
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// BEST PRACTICES GUIDE
// ============================================================================

function BestPracticesGuide({ variation }: { variation: PricingVariation }) {
  const practices = {
    journey: {
      title: "Journey Tiers",
      description: "Emotional framing that matches the product's meaningful nature.",
      when: "When your product is about personal growth, experiences, or transformation - not just features.",
      strengths: [
        "Emotional resonance with product value",
        "Differentiates from typical SaaS pricing",
        "Encourages upgrade as 'progression'",
        "Visual envelope metaphor reinforces product",
      ],
      weaknesses: [
        "May confuse users expecting standard pricing",
        "Tier names less immediately clear",
        "Harder to compare with competitors",
        "Requires strong brand identity",
      ],
      bestFor: "Lifestyle products, personal development, emotional services",
    },
    calculator: {
      title: "Calculator-First",
      description: "Personalized recommendation based on user needs.",
      when: "When users have different use cases and would benefit from guided selection.",
      strengths: [
        "Reduces decision paralysis",
        "Personalizes the recommendation",
        "Educates users about their needs",
        "Higher conversion through relevance",
      ],
      weaknesses: [
        "Requires user input before showing prices",
        "May feel like a barrier to some users",
        "More complex to implement",
        "Users might game the calculator",
      ],
      bestFor: "Complex products, variable pricing, enterprise sales",
    },
    accordion: {
      title: "Feature Accordion",
      description: "Feature-first comparison for detail-oriented buyers.",
      when: "When users care more about specific features than package bundles.",
      strengths: [
        "Deep feature comparison",
        "Good for SEO (all features listed)",
        "Scannable for specific needs",
        "Reduces page height",
      ],
      weaknesses: [
        "Less visual impact",
        "Harder to see full picture at once",
        "May overwhelm with details",
        "Less emotional appeal",
      ],
      bestFor: "Technical products, B2B, comparison shoppers",
    },
    story: {
      title: "Value Story",
      description: "Persona-based pricing that helps users self-identify.",
      when: "When you have distinct user segments with different needs and budgets.",
      strengths: [
        "Humanizes pricing decisions",
        "Social proof built in",
        "Easy self-identification",
        "Shows real use cases",
      ],
      weaknesses: [
        "Requires compelling user stories",
        "May alienate users who don't fit personas",
        "Less detailed feature comparison",
        "Stories may feel manufactured",
      ],
      bestFor: "Consumer products, community-driven products, lifestyle brands",
    },
    credits: {
      title: "Credits System",
      description: "Pay-as-you-go model for commitment-averse users.",
      when: "When users have variable usage or resist subscriptions.",
      strengths: [
        "No commitment required",
        "Value is tangible and concrete",
        "Appeals to casual users",
        "Bulk discounts encourage larger purchases",
      ],
      weaknesses: [
        "Less predictable revenue",
        "May feel transactional",
        "Users may hoard credits",
        "Harder to build habit/retention",
      ],
      bestFor: "Utility products, one-time use cases, price-sensitive markets",
    },
  }

  const p = practices[variation]

  return (
    <div
      className="border-2 border-charcoal bg-white p-6"
      style={{ borderRadius: "2px" }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Sparkles className="h-5 w-5 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            {p.title}
          </h2>
          <p className="font-mono text-xs text-charcoal/60">{p.description}</p>
        </div>
      </div>

      <div
        className="mb-6 border-2 border-duck-yellow bg-duck-yellow/10 p-4"
        style={{ borderRadius: "2px" }}
      >
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          When to Use
        </h3>
        <p className="font-mono text-sm text-charcoal/80">{p.when}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
            Strengths
          </h3>
          <ul className="space-y-2">
            {p.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-primary"
                  strokeWidth={2}
                />
                <span className="font-mono text-sm text-charcoal/80">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-coral">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {p.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 border border-coral bg-coral/20" />
                <span className="font-mono text-sm text-charcoal/80">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t-2 border-charcoal/20 pt-4">
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Best For
        </h3>
        <p className="font-mono text-sm text-charcoal/70">{p.bestFor}</p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SANDBOX PAGE
// ============================================================================

export default function PricingViewsSandbox() {
  const [variation, setVariation] = useState<PricingVariation>("journey")
  const [billing, setBilling] = useState<BillingPeriod>("yearly")

  const variations: { id: PricingVariation; label: string; desc: string }[] = [
    { id: "journey", label: "Journey", desc: "Emotional tiers" },
    { id: "calculator", label: "Calculator", desc: "Personalized" },
    { id: "accordion", label: "Accordion", desc: "Feature-first" },
    { id: "story", label: "Story", desc: "Persona-based" },
    { id: "credits", label: "Credits", desc: "Pay-as-you-go" },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Fixed header */}
      <div className="sticky top-0 z-50 border-b-2 border-charcoal bg-white p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Pricing Page Views
            </h1>
            <p className="font-mono text-xs text-charcoal/60">
              V3 Design Sandbox - Pricing Section Variations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Billing Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "border-2 border-charcoal px-3 py-1 font-mono text-xs uppercase transition-all",
                  billing === "monthly"
                    ? "bg-teal-primary text-white"
                    : "bg-white text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "border-2 border-charcoal px-3 py-1 font-mono text-xs uppercase transition-all",
                  billing === "yearly"
                    ? "bg-teal-primary text-white"
                    : "bg-white text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                Yearly
              </button>
            </div>

            {/* Variation selector */}
            <div className="flex flex-wrap gap-2">
              {variations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariation(v.id)}
                  className={cn(
                    "flex flex-col items-start border-2 border-charcoal px-3 py-2 transition-all",
                    variation === v.id
                      ? "bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                      : "bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                    {v.label}
                  </span>
                  <span className="font-mono text-[10px] text-charcoal/60">
                    {v.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing preview */}
      <div className="border-b-2 border-charcoal px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {variation === "journey" && <JourneyTiersPricing billing={billing} />}
          {variation === "calculator" && <CalculatorPricing />}
          {variation === "accordion" && <AccordionPricing />}
          {variation === "story" && <StoryPricing />}
          {variation === "credits" && <CreditsPricing />}
        </div>
      </div>

      {/* Best practices section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-teal-primary"
            style={{ borderRadius: "2px" }}
          >
            <Zap className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Design Rationale
          </h2>
        </div>

        <BestPracticesGuide variation={variation} />

        {/* Pricing Psychology Tips */}
        <div
          className="mt-8 border-2 border-charcoal bg-charcoal p-6"
          style={{ borderRadius: "2px" }}
        >
          <h3 className="mb-4 font-mono text-lg font-bold uppercase tracking-wide text-white">
            Pricing Psychology Principles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Anchoring & Decoy Effect
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Show highest tier first (anchoring)</li>
                <li>• Make middle tier the obvious choice</li>
                <li>• Use a "decoy" tier to push upgrades</li>
                <li>• Cross out original prices for discounts</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Reducing Friction
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• "No credit card required" badge</li>
                <li>• Money-back guarantee visible</li>
                <li>• Social proof near CTAs</li>
                <li>• Clear comparison tables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
