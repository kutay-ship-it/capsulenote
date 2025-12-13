"use client"

import { PenSquare, CalendarDays, Lock, Mail, ArrowRight, type LucideIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

const STEP_ICONS: LucideIcon[] = [PenSquare, CalendarDays, Lock, Mail]

const STEP_STYLES = [
  { color: "bg-duck-blue", borderColor: "border-duck-blue" },
  { color: "bg-duck-yellow", borderColor: "border-duck-yellow" },
  { color: "bg-teal-primary", borderColor: "border-teal-primary" },
  { color: "bg-coral", borderColor: "border-coral" },
]

interface StepCardProps {
  step: { number: string; title: string; description: string }
  style: (typeof STEP_STYLES)[0]
  Icon: LucideIcon
  index: number
  isLast: boolean
  isInView: boolean
}

function StepCard({ step, style, Icon, index, isLast, isInView }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Connection Line (not for last item) */}
      {!isLast && (
        <div className="absolute left-1/2 top-24 hidden h-full w-0.5 -translate-x-1/2 bg-charcoal/10 lg:block" />
      )}

      <div
        className={cn(
          "relative z-10 flex flex-col items-center text-center transition-all duration-500",
          isInView ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        {/* Step Number */}
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center border-4 border-charcoal ${style.color} font-mono text-2xl font-bold text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]`}
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
      </div>
    </div>
  )
}

export function HowItWorksSection() {
  const t = useTranslations("marketing.howItWorksSteps")
  const steps = t.raw("steps") as Array<{ number: string; title: string; description: string }>
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "-100px", threshold: 0 }
    )
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <div
          className={cn(
            "mx-auto mb-16 max-w-3xl text-center md:mb-20 transition-all duration-500",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            {t("badge")}
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Steps - Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              style={STEP_STYLES[index]!}
              Icon={STEP_ICONS[index]!}
              index={index}
              isLast={index === steps.length - 1}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
