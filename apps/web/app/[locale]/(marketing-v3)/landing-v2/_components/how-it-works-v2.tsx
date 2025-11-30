"use client"

import { motion, useInView } from "framer-motion"
import { PenLine, Calendar, Mail, ArrowRight } from "lucide-react"
import { useRef } from "react"

const STEPS = [
  {
    number: "01",
    icon: PenLine,
    title: "Write",
    subtitle: "Pour your thoughts into a letter",
    description: "Use our beautiful editor to write to your future self. No rush — take your time.",
    color: "bg-duck-yellow",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Schedule",
    subtitle: "Pick any date in the future",
    description: "Tomorrow, next year, or decades from now. Your letter waits patiently.",
    color: "bg-duck-blue",
  },
  {
    number: "03",
    icon: Mail,
    title: "Receive",
    subtitle: "Get your letter when it arrives",
    description: "Email or physical mail — a gift from your past self, exactly when you need it.",
    color: "bg-teal-primary",
  },
]

export function HowItWorksV2() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-cream py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-blue px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            Simple Process
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            How It Works
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Three simple steps to send a message to your future self.
          </p>
        </motion.div>

        {/* Steps - Horizontal Layout */}
        <div className="relative mx-auto max-w-5xl">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[16.67%] right-[16.67%] h-1 bg-charcoal/10" />

          {/* Steps Grid */}
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isLast = index === STEPS.length - 1

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Number Badge */}
                  <div
                    className={`relative z-10 mb-6 flex h-[120px] w-[120px] items-center justify-center border-4 border-charcoal ${step.color} shadow-[6px_6px_0_theme(colors.charcoal)]`}
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="text-center">
                      <span className="font-mono text-3xl font-bold text-charcoal">
                        {step.number}
                      </span>
                      <div className="mt-1">
                        <Icon className="mx-auto h-8 w-8 text-charcoal" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  {/* Arrow (Mobile/Tablet) */}
                  {!isLast && (
                    <div className="my-4 lg:hidden">
                      <ArrowRight className="h-6 w-6 text-charcoal/30 rotate-90" strokeWidth={2} />
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="mb-1 font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mb-3 font-mono text-sm font-medium text-charcoal/60">
                    {step.subtitle}
                  </p>
                  <p className="max-w-xs font-mono text-sm leading-relaxed text-charcoal/70">
                    {step.description}
                  </p>

                  {/* Arrow (Desktop) */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-[50px] -right-8 z-20">
                      <div
                        className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                        style={{ borderRadius: "2px" }}
                      >
                        <ArrowRight className="h-5 w-5 text-charcoal" strokeWidth={2} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
