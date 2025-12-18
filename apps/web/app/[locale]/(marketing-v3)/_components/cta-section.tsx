"use client"

import { ArrowRight, Heart } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CTASectionProps {
  isSignedIn: boolean
}

export function CTASection({ isSignedIn }: CTASectionProps) {
  void isSignedIn
  const t = useTranslations("marketing.ctaSection")
  const stats = t.raw("stats") as Array<{ value: string; label: string }>
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
    <section ref={sectionRef} className="bg-cream py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        <div
          className={cn(
            "relative mx-auto max-w-4xl overflow-hidden transition-all duration-500",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {/* Decorative Background Shapes - Reduced offset on mobile */}
          <div
            className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 h-full w-full bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          />
          <div
            className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 h-full w-full bg-charcoal"
            style={{ borderRadius: "2px" }}
          />

          {/* Main Card */}
          <div
            className="relative border-2 sm:border-4 border-charcoal bg-duck-blue p-6 sm:p-12 md:p-16"
            style={{ borderRadius: "2px" }}
          >
            {/* Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div
                className="flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Heart className="h-4 w-4 fill-coral text-coral" strokeWidth={2} />
                {t("badge")}
              </div>
            </div>

            {/* Content */}
            <div className="text-center pt-4">
              <h2 className="mb-3 sm:mb-4 font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold uppercase leading-tight tracking-wide text-charcoal">
                {t("title")}
              </h2>

              <p className="mx-auto mb-6 sm:mb-8 max-w-xl font-mono text-sm sm:text-base md:text-lg leading-relaxed text-charcoal/80">
                {t("description")}
                <br className="hidden sm:block" />
                {t("question")}
              </p>

              {/* Stats */}
              <div className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-2 border-charcoal bg-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4"
                    style={{ borderRadius: "2px" }}
                  >
                    <p className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-charcoal">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-charcoal/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <a href="#try-demo">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="group gap-3 text-lg shadow-md hover:shadow-lg"
                  >
                    {t("cta")}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
