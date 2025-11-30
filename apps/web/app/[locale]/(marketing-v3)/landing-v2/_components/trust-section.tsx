"use client"

import { motion, useInView } from "framer-motion"
import { Shield, Lock, Clock, CheckCircle, Mail, Server, Eye, FileCheck } from "lucide-react"
import { useRef } from "react"

const TRUST_POINTS = [
  {
    icon: Lock,
    title: "AES-256-GCM Encryption",
    description: "Military-grade encryption protects your letters from the moment you write them.",
    color: "bg-teal-primary",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description: "We can't read your letters. Only you can decrypt them when they arrive.",
    color: "bg-duck-blue",
  },
  {
    icon: Clock,
    title: "99.9% Delivery Guarantee",
    description: "Your letters arrive on time, every time. Backed by our delivery SLO.",
    color: "bg-duck-yellow",
  },
  {
    icon: FileCheck,
    title: "GDPR Compliant",
    description: "Full data export and deletion rights. Your data, your control.",
    color: "bg-coral",
  },
]

const COMPARISON = [
  { feature: "End-to-end encryption", us: true, email: false },
  { feature: "Guaranteed future delivery", us: true, email: false },
  { feature: "Physical mail option", us: true, email: false },
  { feature: "Can't be accidentally opened early", us: true, email: false },
  { feature: "Survives account changes", us: true, email: false },
]

export function TrustSection() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const comparisonRef = useRef(null)
  const isComparisonInView = useInView(comparisonRef, { once: true, margin: "-100px" })

  return (
    <section className="bg-charcoal py-20 md:py-32 overflow-hidden">
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
            className="mb-6 inline-flex items-center gap-2 border-2 border-white bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Shield className="h-4 w-4" strokeWidth={2} />
            Security First
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl md:text-5xl">
            Your Words,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Protected</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-teal-primary -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-white/70 sm:text-lg">
            Bank-grade encryption ensures your letters stay private until delivery day.
            <br className="hidden sm:block" />
            No one — not even us — can read your messages.
          </p>
        </motion.div>

        {/* Trust Points Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {TRUST_POINTS.map((point, index) => {
            const Icon = point.icon
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="relative border-2 border-white bg-white/5 p-6"
                style={{ borderRadius: "2px" }}
              >
                {/* Icon */}
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center border-2 border-white ${point.color}`}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="h-6 w-6 text-charcoal" strokeWidth={2} />
                </div>

                <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wide text-white">
                  {point.title}
                </h3>

                <p className="font-mono text-xs leading-relaxed text-white/60">
                  {point.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <motion.div
          ref={comparisonRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isComparisonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl"
        >
          <div
            className="border-2 border-white bg-white overflow-hidden"
            style={{ borderRadius: "2px" }}
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-charcoal border-b-2 border-white">
              <div className="p-4 font-mono text-xs font-bold uppercase tracking-wider text-white">
                Feature
              </div>
              <div className="p-4 text-center font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow border-l-2 border-white/20">
                Capsule Note
              </div>
              <div className="p-4 text-center font-mono text-xs font-bold uppercase tracking-wider text-white/60 border-l-2 border-white/20">
                Regular Email
              </div>
            </div>

            {/* Table Rows */}
            {COMPARISON.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${index !== COMPARISON.length - 1 ? "border-b-2 border-charcoal/10" : ""}`}
              >
                <div className="p-4 font-mono text-xs text-charcoal">
                  {row.feature}
                </div>
                <div className="p-4 flex justify-center items-center border-l-2 border-charcoal/10">
                  {row.us ? (
                    <div
                      className="flex h-6 w-6 items-center justify-center bg-teal-primary border-2 border-charcoal"
                      style={{ borderRadius: "2px" }}
                    >
                      <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="h-4 w-4 bg-charcoal/20" style={{ borderRadius: "2px" }} />
                  )}
                </div>
                <div className="p-4 flex justify-center items-center border-l-2 border-charcoal/10">
                  {row.email ? (
                    <div
                      className="flex h-6 w-6 items-center justify-center bg-teal-primary border-2 border-charcoal"
                      style={{ borderRadius: "2px" }}
                    >
                      <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="h-4 w-4 bg-charcoal/20" style={{ borderRadius: "2px" }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-center font-mono text-xs text-white/50">
            Unlike regular email, your letters are encrypted and locked until delivery.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
