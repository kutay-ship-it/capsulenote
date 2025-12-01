"use client"

import { motion, useInView } from "framer-motion"
import {
  PenSquare,
  Clock,
  ShieldCheck,
  Mail,
  CalendarDays,
  Sparkles,
  Lock,
  Send,
  type LucideIcon,
} from "lucide-react"
import { useRef } from "react"
import { useTranslations } from "next-intl"

const FEATURE_ICONS: LucideIcon[] = [PenSquare, Clock, ShieldCheck, Mail, Lock, Sparkles]

const FEATURE_STYLES = [
  { bg: "bg-bg-blue-light", borderColor: "border-duck-blue", badgeBg: "bg-duck-blue" },
  { bg: "bg-bg-yellow-pale", borderColor: "border-duck-yellow", badgeBg: "bg-duck-yellow" },
  { bg: "bg-bg-green-light", borderColor: "border-teal-primary", badgeBg: "bg-teal-primary" },
  { bg: "bg-bg-peach-light", borderColor: "border-peach", badgeBg: "bg-peach" },
  { bg: "bg-bg-purple-light", borderColor: "border-lavender", badgeBg: "bg-lavender" },
  { bg: "bg-bg-pink-light", borderColor: "border-coral", badgeBg: "bg-coral" },
]

interface FeatureCardProps {
  feature: { title: string; description: string }
  style: (typeof FEATURE_STYLES)[0]
  Icon: LucideIcon
  index: number
  featureBadge: string
}

function FeatureCard({ feature, style, Icon, index, featureBadge }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative border-2 ${style.borderColor} ${style.bg} p-6 shadow-[2px_2px_0_theme(colors.charcoal)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]`}
      style={{ borderRadius: "2px" }}
    >
      {/* Floating Badge */}
      <div
        className={`absolute -top-3 left-4 flex items-center gap-1.5 ${style.badgeBg} px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal`}
        style={{ borderRadius: "2px" }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
        <span>{featureBadge}</span>
      </div>

      {/* Content */}
      <div className="mt-4">
        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <Icon className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>

        <h3 className="mb-2 font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
          {feature.title}
        </h3>

        <p className="font-mono text-sm leading-relaxed text-charcoal/70">
          {feature.description}
        </p>
      </div>
    </motion.article>
  )
}

export function FeaturesSection() {
  const t = useTranslations("marketing.featuresSection")
  const features = t.raw("features") as Array<{ title: string; description: string }>
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section id="features" className="bg-cream py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            {t("badge")}
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("title")}
            <br />
            <span className="relative inline-block mt-2">
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

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              style={FEATURE_STYLES[index]!}
              Icon={FEATURE_ICONS[index]!}
              index={index}
              featureBadge={t("featureBadge")}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
