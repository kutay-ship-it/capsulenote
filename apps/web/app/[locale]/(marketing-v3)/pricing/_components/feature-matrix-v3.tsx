"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Check, Minus, HelpCircle } from "lucide-react"
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

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <motion.div
        className="flex items-center justify-center"
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
      <div className="flex items-center justify-center">
        <Minus className="h-5 w-5 text-charcoal/30" strokeWidth={2} />
      </div>
    )
  }
  return (
    <span className="font-mono text-sm text-charcoal">{value}</span>
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
  mobileNote = "Scroll horizontally to view all plans",
}: FeatureMatrixV3Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })

  return (
    <div ref={containerRef} className="w-full">
      {/* Mobile Scroll Note */}
      <p className="mb-4 font-mono text-xs text-charcoal/60 text-center md:hidden">
        {mobileNote}
      </p>

      {/* Matrix Container */}
      <div className="overflow-x-auto">
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
