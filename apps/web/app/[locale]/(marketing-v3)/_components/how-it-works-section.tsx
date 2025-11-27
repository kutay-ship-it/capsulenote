"use client"

import { motion, useInView } from "framer-motion"
import { PenSquare, CalendarDays, Lock, Mail, ArrowRight } from "lucide-react"
import { useRef } from "react"

const steps = [
  {
    number: "01",
    icon: PenSquare,
    title: "Write Your Letter",
    description: "Pour your thoughts, dreams, advice, or reflections into a letter. Take your time — there's no rush.",
    color: "bg-duck-blue",
    borderColor: "border-duck-blue",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Choose a Date",
    description: "Select when your letter should arrive. Tomorrow, next month, or years from now — you decide.",
    color: "bg-duck-yellow",
    borderColor: "border-duck-yellow",
  },
  {
    number: "03",
    icon: Lock,
    title: "Seal & Encrypt",
    description: "Your letter is encrypted and sealed. Even you can't read it until the delivery date arrives.",
    color: "bg-teal-primary",
    borderColor: "border-teal-primary",
  },
  {
    number: "04",
    icon: Mail,
    title: "Receive Your Message",
    description: "On the scheduled date, your letter arrives — a gift from your past self, exactly when you need it.",
    color: "bg-coral",
    borderColor: "border-coral",
  },
]

function StepCard({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0]
  index: number
  isLast: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const Icon = step.icon

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Connection Line (not for last item) */}
      {!isLast && (
        <div className="absolute left-1/2 top-24 hidden h-full w-0.5 -translate-x-1/2 bg-charcoal/10 lg:block" />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Step Number */}
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center border-4 border-charcoal ${step.color} font-mono text-2xl font-bold text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]`}
          style={{ borderRadius: "2px" }}
        >
          {step.number}
        </div>

        {/* Icon Badge */}
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <Icon className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>

        {/* Content */}
        <h3 className="mb-3 font-mono text-lg font-bold uppercase tracking-wide text-charcoal sm:text-xl">
          {step.title}
        </h3>

        <p className="max-w-xs font-mono text-sm leading-relaxed text-charcoal/70">
          {step.description}
        </p>

        {/* Arrow for desktop */}
        {!isLast && (
          <div className="mt-8 hidden lg:block">
            <ArrowRight className="h-6 w-6 text-charcoal/30" strokeWidth={2} />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export function HowItWorksSection() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <section className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center md:mb-20"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            Simple Process
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            How It Works
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Four simple steps to send a message to your future self.
            It's like having a time machine for your thoughts.
          </p>
        </motion.div>

        {/* Steps - Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
