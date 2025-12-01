/**
 * Subscribe Guarantee Component (V3 Design)
 *
 * Money-back guarantee section for checkout reassurance.
 * Neo-brutalist design with the teal primary accent.
 */

"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Shield, Heart, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function SubscribeGuaranteeV3() {
  const t = useTranslations("subscribe.v3.guarantee")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      className="border-4 border-teal-primary bg-teal-primary/10 p-8 text-center"
      style={{ borderRadius: "2px" }}
    >
      <div className="mx-auto max-w-lg space-y-4">
        {/* Shield Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            delay: 0.2,
          }}
          className={cn(
            "mx-auto flex h-20 w-20 items-center justify-center",
            "border-2 border-charcoal bg-teal-primary",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <h3 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
          {t("title")}
        </h3>

        {/* Description */}
        <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
          {t("description")}
        </p>

        {/* Decorative Hearts */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Heart className="h-4 w-4 text-coral" fill="#FF7169" />
          <Sparkles className="h-4 w-4 text-duck-yellow" fill="#FFDE00" />
          <Heart className="h-4 w-4 text-coral" fill="#FF7169" />
        </div>
      </div>
    </motion.section>
  )
}
