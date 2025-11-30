"use client"

import { motion, useInView } from "framer-motion"
import { Lock, Clock, Mail, Shield, Zap } from "lucide-react"
import { useRef } from "react"

// Prioritized features (4 instead of 6)
const FEATURES = [
  {
    icon: Lock,
    title: "Encrypted & Sealed",
    description: "AES-256 encryption protects your letters. Even we can't read them until delivery.",
    color: "bg-teal-primary",
    borderColor: "border-teal-primary",
  },
  {
    icon: Clock,
    title: "Arrives On Time",
    description: "99.9% delivery guarantee. Your letters arrive exactly when scheduled — no exceptions.",
    color: "bg-duck-yellow",
    borderColor: "border-duck-yellow",
  },
  {
    icon: Mail,
    title: "Email or Paper",
    description: "Digital delivery to your inbox, or real physical mail delivered to your door.",
    color: "bg-duck-blue",
    borderColor: "border-duck-blue",
  },
  {
    icon: Shield,
    title: "Never Lost",
    description: "Redundant backups across multiple data centers. Your letters survive anything.",
    color: "bg-coral",
    borderColor: "border-coral",
  },
]

export function FeaturesV2() {
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
            Features
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Built for{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Time Travel</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Everything you need to send meaningful messages to your future self.
          </p>
        </motion.div>

        {/* Features Grid - 2x2 on desktop */}
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
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
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center border-2 border-charcoal ${feature.color}`}
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
                  className={`absolute bottom-0 left-0 right-0 h-1 ${feature.color}`}
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
