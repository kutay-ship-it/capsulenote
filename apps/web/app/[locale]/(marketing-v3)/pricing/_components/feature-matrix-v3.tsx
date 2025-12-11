"use client"

import * as React from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Check, Minus, HelpCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureItem {
  name: string
  tooltip?: string
  free: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}

interface FeatureCategory {
  name: string
  features: FeatureItem[]
}

interface FeatureMatrixV3Props {
  categories: FeatureCategory[]
  headers?: {
    feature: string
    free: string
    pro: string
    enterprise: string
  }
  mobileNote?: string
}

function FeatureValue({ value, inline = false }: { value: boolean | string; inline?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <motion.div
        className={cn("flex items-center", inline ? "justify-start" : "justify-center")}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center border-2 border-charcoal bg-teal-primary"
          style={{ borderRadius: "2px" }}
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </div>
      </motion.div>
    ) : (
      <div className={cn("flex items-center", inline ? "justify-start" : "justify-center")}>
        <Minus className="h-5 w-5 text-charcoal/30" strokeWidth={2} />
      </div>
    )
  }
  return (
    <span className="font-mono text-sm text-charcoal">{value}</span>
  )
}

// Mobile tier card component for accordion view
interface MobileTierCardProps {
  tierName: string
  tierLabel: string
  categories: FeatureCategory[]
  isExpanded: boolean
  onToggle: () => void
  isHighlighted?: boolean
}

function MobileTierCard({
  tierName,
  tierLabel,
  categories,
  isExpanded,
  onToggle,
  isHighlighted = false,
}: MobileTierCardProps) {
  return (
    <div
      className={cn(
        "border-2 border-charcoal bg-white",
        isHighlighted && "border-duck-blue bg-duck-blue/5",
        "shadow-[3px_3px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Accordion Header - Touch-friendly (48px min height) */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full min-h-[48px] p-4 flex items-center justify-between",
          "transition-colors duration-150",
          isHighlighted && "bg-duck-blue/10"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
            {tierLabel}
          </span>
          {isHighlighted && (
            <span
              className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-duck-blue text-charcoal border border-charcoal"
              style={{ borderRadius: "2px" }}
            >
              Popular
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-charcoal transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-charcoal">
              {categories.map((category) => (
                <div key={category.name}>
                  {/* Category Header */}
                  <div className="px-4 py-2 bg-cream border-b border-charcoal/20">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/70">
                      {category.name}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="divide-y divide-charcoal/10">
                    {category.features.map((feature) => {
                      const value = feature[tierName as keyof FeatureItem]
                      return (
                        <div
                          key={feature.name}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="font-mono text-xs text-charcoal flex-1 pr-3">
                            {feature.name}
                          </span>
                          <div className="flex-shrink-0">
                            <FeatureValue value={value as boolean | string} inline />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FeatureMatrixV3({
  categories,
  headers = {
    feature: "Feature",
    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",
  },
  mobileNote = "Tap a plan to see features",
}: FeatureMatrixV3Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })
  const [expandedTier, setExpandedTier] = React.useState<string | null>("pro") // Pro expanded by default

  const tiers = [
    { name: "free", label: headers.free, isHighlighted: false },
    { name: "pro", label: headers.pro, isHighlighted: true },
    { name: "enterprise", label: headers.enterprise, isHighlighted: false },
  ]

  return (
    <div ref={containerRef} className="w-full">
      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-3">
        <p className="mb-4 font-mono text-xs text-charcoal/60 text-center">
          {mobileNote}
        </p>
        {tiers.map((tier) => (
          <MobileTierCard
            key={tier.name}
            tierName={tier.name}
            tierLabel={tier.label}
            categories={categories}
            isExpanded={expandedTier === tier.name}
            onToggle={() =>
              setExpandedTier((prev) => (prev === tier.name ? null : tier.name))
            }
            isHighlighted={tier.isHighlighted}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <div
          className="min-w-[640px] border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          {/* Header Row */}
          <div className="grid grid-cols-4 border-b-2 border-charcoal bg-off-white">
            <div className="p-4 font-mono text-xs uppercase tracking-wider text-charcoal/70">
              {headers.feature}
            </div>
            <div className="p-4 text-center font-mono text-xs uppercase tracking-wider text-charcoal/70 border-l-2 border-charcoal/20">
              {headers.free}
            </div>
            <div className="p-4 text-center border-l-2 border-charcoal bg-duck-blue/20">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                {headers.pro}
              </span>
            </div>
            <div className="p-4 text-center font-mono text-xs uppercase tracking-wider text-charcoal/70 border-l-2 border-charcoal/20">
              {headers.enterprise}
            </div>
          </div>

          {/* Categories */}
          {categories.map((category, catIndex) => (
            <div key={category.name}>
              {/* Category Header */}
              <motion.div
                className="grid grid-cols-4 border-b-2 border-charcoal/20 bg-cream"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="col-span-4 px-4 py-3">
                  <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                    {category.name}
                  </span>
                </div>
              </motion.div>

              {/* Features */}
              {category.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature.name}
                  className={cn(
                    "group grid grid-cols-4 transition-colors duration-150",
                    "hover:bg-duck-yellow/20",
                    featureIndex < category.features.length - 1 && "border-b border-charcoal/10"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{
                    delay: catIndex * 0.1 + featureIndex * 0.05,
                    duration: 0.4,
                  }}
                >
                  {/* Feature Name */}
                  <div className="flex items-center gap-2 p-4">
                    <span className="font-mono text-sm text-charcoal">
                      {feature.name}
                    </span>
                    {feature.tooltip && (
                      <div className="group/tooltip relative">
                        <HelpCircle className="h-4 w-4 text-charcoal/40 cursor-help" />
                        <div
                          className={cn(
                            "absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50",
                            "hidden group-hover/tooltip:block",
                            "w-48 p-2 border-2 border-charcoal bg-white",
                            "font-mono text-xs text-charcoal",
                            "shadow-[2px_2px_0_theme(colors.charcoal)]"
                          )}
                          style={{ borderRadius: "2px" }}
                        >
                          {feature.tooltip}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Free Column */}
                  <div className="flex items-center justify-center p-4 border-l-2 border-charcoal/10">
                    <FeatureValue value={feature.free} />
                  </div>

                  {/* Pro Column (Highlighted) */}
                  <div className="flex items-center justify-center p-4 border-l-2 border-charcoal/20 bg-duck-blue/10 group-hover:bg-duck-blue/30">
                    <FeatureValue value={feature.pro} />
                  </div>

                  {/* Enterprise Column */}
                  <div className="flex items-center justify-center p-4 border-l-2 border-charcoal/10">
                    <FeatureValue value={feature.enterprise} />
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
