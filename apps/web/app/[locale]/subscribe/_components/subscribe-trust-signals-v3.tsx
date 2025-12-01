/**
 * Subscribe Trust Signals Component (V3 Design)
 *
 * Adapted from TrustSignalsV3 for the subscribe/checkout flow.
 * Uses the same neo-brutalist design language with checkout-focused signals.
 */

"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Lock, CreditCard, Shield, RefreshCw, Clock, CheckCircle, LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface TrustSignal {
  icon: LucideIcon
  title: string
  description: string
}

export function SubscribeTrustSignalsV3() {
  const t = useTranslations("subscribe.v3.trustSignals")

  const signals: TrustSignal[] = [
    {
      icon: Lock,
      title: t("secureCheckout.title"),
      description: t("secureCheckout.description"),
    },
    {
      icon: CreditCard,
      title: t("stripe.title"),
      description: t("stripe.description"),
    },
    {
      icon: Shield,
      title: t("guarantee.title"),
      description: t("guarantee.description"),
    },
    {
      icon: RefreshCw,
      title: t("cancel.title"),
      description: t("cancel.description"),
    },
    {
      icon: Clock,
      title: t("instantAccess.title"),
      description: t("instantAccess.description"),
    },
    {
      icon: CheckCircle,
      title: t("delivery.title"),
      description: t("delivery.description"),
    },
  ]
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })

  return (
    <section
      ref={containerRef}
      className="border-y-2 border-charcoal bg-charcoal py-8 md:py-10"
    >
      <div className="container px-4 sm:px-6">
        {/* Desktop/Tablet Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {/* Icon Container */}
              <motion.div
                className={cn(
                  "flex h-12 w-12 items-center justify-center",
                  "border-2 border-duck-yellow bg-charcoal"
                )}
                style={{ borderRadius: "2px" }}
                whileHover={{
                  scale: 1.05,
                  rotate: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <signal.icon
                  className="h-6 w-6 text-duck-yellow"
                  strokeWidth={2}
                />
              </motion.div>

              {/* Text */}
              <div className="space-y-0.5">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  {signal.title}
                </p>
                <p className="font-mono text-[10px] text-white/60">
                  {signal.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Scrollable Row */}
        <div className="sm:hidden overflow-hidden">
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate signals for seamless loop */}
            {[...signals, ...signals].map((signal, index) => (
              <div
                key={`${signal.title}-${index}`}
                className="flex items-center gap-3 whitespace-nowrap"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center flex-shrink-0",
                    "border-2 border-duck-yellow bg-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <signal.icon
                    className="h-5 w-5 text-duck-yellow"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-shrink-0">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    {signal.title}
                  </p>
                  <p className="font-mono text-[10px] text-white/60">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
