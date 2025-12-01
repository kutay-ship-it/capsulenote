"use client"

import { motion, useInView } from "framer-motion"
import { Lock, Clock, Mail, Shield, Zap, LucideIcon } from "lucide-react"
import { useRef } from "react"
import { useTranslations } from "next-intl"

interface Feature {
  title: string
  description: string
}

const FEATURE_ICONS: LucideIcon[] = [Lock, Clock, Mail, Shield]
const FEATURE_COLORS = ["bg-teal-primary", "bg-duck-yellow", "bg-duck-blue", "bg-coral"]

export function FeaturesV2() {
  const t = useTranslations("marketing.featuresV2")
  const features = t.raw("features") as Feature[]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Zap className="h-4 w-4" strokeWidth={2} />
            {t("badge")}
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("title")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{t("titleHighlight")}</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {t("description")}
          </p>
        </motion.div>

        {/* Features Grid - 2x2 on desktop */}
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Lock
            const color = FEATURE_COLORS[index] ?? "bg-teal-primary"
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`relative border-2 border-charcoal bg-white p-6 shadow-[3px_3px_0_theme(colors.charcoal)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[5px_5px_0_theme(colors.charcoal)]`}
                style={{ borderRadius: "2px" }}
              >
                {/* Icon */}
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center border-2 border-charcoal ${color}`}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="h-7 w-7 text-charcoal" strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  {feature.title}
                </h3>

                <p className="font-mono text-sm leading-relaxed text-charcoal/70">
                  {feature.description}
                </p>

                {/* Accent line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${color}`}
                  style={{ borderRadius: "0 0 2px 2px" }}
                />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
