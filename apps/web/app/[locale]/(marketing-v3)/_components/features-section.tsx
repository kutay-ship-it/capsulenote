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
} from "lucide-react"
import { useRef } from "react"

const features = [
  {
    icon: PenSquare,
    title: "Rich Text Editor",
    description: "Write your thoughts with a beautiful, distraction-free editor. Format your letters exactly how you want them.",
    bg: "bg-bg-blue-light",
    borderColor: "border-duck-blue",
    badgeBg: "bg-duck-blue",
  },
  {
    icon: Clock,
    title: "Schedule Delivery",
    description: "Choose any date in the future. Your letter will arrive exactly when you need it — days, months, or years from now.",
    bg: "bg-bg-yellow-pale",
    borderColor: "border-duck-yellow",
    badgeBg: "bg-duck-yellow",
  },
  {
    icon: ShieldCheck,
    title: "End-to-End Encryption",
    description: "Your words are encrypted the moment you write them. Only you can read your letters when they arrive.",
    bg: "bg-bg-green-light",
    borderColor: "border-teal-primary",
    badgeBg: "bg-teal-primary",
  },
  {
    icon: Mail,
    title: "Email & Physical Mail",
    description: "Receive your letters digitally via email, or opt for real physical mail delivered to your door.",
    bg: "bg-bg-peach-light",
    borderColor: "border-peach",
    badgeBg: "bg-peach",
  },
  {
    icon: Lock,
    title: "Locked Until Arrival",
    description: "Your letters remain sealed and unreadable until their delivery date. True anticipation, true surprise.",
    bg: "bg-bg-purple-light",
    borderColor: "border-lavender",
    badgeBg: "bg-lavender",
  },
  {
    icon: Sparkles,
    title: "Writing Prompts",
    description: "Need inspiration? Choose from thoughtful prompts designed for reflection, goals, and gratitude.",
    bg: "bg-bg-pink-light",
    borderColor: "border-coral",
    badgeBg: "bg-coral",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const Icon = feature.icon

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative border-2 ${feature.borderColor} ${feature.bg} p-6 shadow-[2px_2px_0_theme(colors.charcoal)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]`}
      style={{ borderRadius: "2px" }}
    >
      {/* Floating Badge */}
      <div
        className={`absolute -top-3 left-4 flex items-center gap-1.5 ${feature.badgeBg} px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal`}
        style={{ borderRadius: "2px" }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
        <span>Feature</span>
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
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section className="bg-cream py-20 md:py-32">
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
            Features
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Everything You Need to
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10">Connect with Tomorrow</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Write letters that matter. Schedule them for any moment in the future.
            Let your past self speak to who you'll become.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
