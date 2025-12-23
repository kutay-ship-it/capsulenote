"use client"

import { ArrowRight, Mail, Clock, Star, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

const STAT_ICONS = [Mail, Clock, Star]

export function HeroSection() {
  const t = useTranslations("marketing.heroV3")
  const { isSignedIn, isLoaded } = useAuth()
  const isAuthenticated = isLoaded && isSignedIn

  // Get stats from translations
  const stats = t.raw("stats") as Array<{ value: string; label: string }>

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-cream">
      {/* Animated Background Shapes - CSS animations instead of framer-motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div
          className="absolute -top-20 -right-20 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] border-[4px] sm:border-[6px] md:border-[8px] border-charcoal animate-in fade-in zoom-in-95 duration-1000"
          style={{ borderRadius: "2px", opacity: 0.15 }}
        />
        <div
          className="absolute top-1/3 -left-32 h-[150px] w-[150px] sm:h-[200px] sm:w-[200px] md:h-[300px] md:w-[300px] bg-duck-yellow animate-in fade-in zoom-in-95 duration-1000 delay-200"
          style={{ borderRadius: "2px", opacity: 0.1 }}
        />
        <div
          className="absolute bottom-20 right-1/4 h-[100px] w-[100px] sm:h-[150px] sm:w-[150px] md:h-[200px] md:w-[200px] bg-duck-blue animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
          style={{ borderRadius: "2px", opacity: 0.08 }}
        />
      </div>

      <div className="container relative z-10 px-4 pt-24 pb-16 sm:px-6 sm:pt-32 md:pt-40">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span
              className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
              {t("badge")}
            </span>
          </div>

          {/* Main Headline */}
          <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <h1 className="font-mono text-4xl font-bold uppercase leading-none tracking-wide text-charcoal sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              <span className="block">{t("titlePart1")}</span>
              <span className="relative inline-block mt-2">
                <span className="relative z-10">{t("titlePart2")}</span>
                <span
                  className="absolute bottom-2 left-0 right-0 h-4 bg-duck-blue origin-left -z-0 sm:h-6 md:h-8 animate-scale-x-in"
                  style={{ borderRadius: "2px", animationDelay: "0.6s" }}
                />
              </span>
              <span className="block mt-2">
                {t("titlePart3")}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-teal-primary">{t("titlePart4")}</span>
                  <span
                    className="absolute bottom-2 left-0 right-0 h-4 bg-duck-yellow origin-left -z-0 sm:h-6 md:h-8 animate-scale-x-in"
                    style={{ borderRadius: "2px", animationDelay: "0.8s" }}
                  />
                </span>
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="mx-auto mt-8 max-w-2xl text-center font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
            {isAuthenticated ? (
              <Link href="/letters">
                <Button size="lg" className="group gap-3 text-lg shadow-md hover:shadow-lg">
                  {t("goToLetters")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="group gap-3 text-lg shadow-md hover:shadow-lg"
                onClick={() => {
                  document.getElementById("try-demo")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }}
              >
                {t("startWriting")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {/* Stats Bar - Social Proof */}
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-900">
            <div
              className="mx-auto max-w-3xl border-2 border-charcoal bg-white p-3 sm:p-4 shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="grid grid-cols-3 gap-0 divide-x-2 divide-charcoal/20">
                {stats.map((stat, i) => {
                  const Icon = STAT_ICONS[i] ?? Mail
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${1000 + i * 100}ms` }}
                    >
                      <div
                        className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow shrink-0"
                        style={{ borderRadius: "2px" }}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-charcoal" strokeWidth={2} />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="font-mono text-base sm:text-xl md:text-2xl font-bold text-charcoal">
                          {stat.value}
                        </p>
                        <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-wider text-charcoal/60">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - CSS animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-500 delay-1000">
        <div className="flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
            {t("scrollIndicator")}
          </span>
          <div
            className="h-10 w-6 border-2 border-charcoal/30 flex items-start justify-center pt-2"
            style={{ borderRadius: "2px" }}
          >
            <div
              className="h-2 w-2 bg-charcoal/50 animate-scroll-indicator"
              style={{ borderRadius: "2px" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
