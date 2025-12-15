"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Mail, Star, Clock, Users } from "lucide-react"
import { useRef } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface HeroV2Props {
  isSignedIn: boolean
}

const STAT_ICONS = [Mail, Clock, Star]

export function HeroV2({ isSignedIn }: HeroV2Props) {
  const t = useTranslations("marketing.heroV2")
  const stats = t.raw("stats") as Array<{ value: string; label: string }>
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={containerRef} className="relative min-h-[85vh] overflow-hidden bg-cream">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.12, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-20 -right-20 h-[400px] w-[400px] border-[8px] border-charcoal"
          style={{ borderRadius: "2px" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/3 -left-32 h-[300px] w-[300px] bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.06, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-20 right-1/4 h-[200px] w-[200px] bg-teal-primary"
          style={{ borderRadius: "2px" }}
        />
      </div>

      <div className="container relative z-10 px-4 pt-24 pb-12 sm:px-6 sm:pt-32 md:pt-36">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <span
              className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              {t("badge")}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="font-mono text-4xl font-bold uppercase leading-none tracking-wide text-charcoal sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">{t("titleLine1")}</span>
              <span className="relative inline-block mt-2">
                <span className="relative z-10">{t("titleLine2")}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow origin-left -z-0 sm:h-4 md:h-5"
                  style={{ borderRadius: "2px" }}
                />
              </span>
            </h1>
          </motion.div>

          {/* Subheadline - More Specific */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-center font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg md:text-xl"
          >
            {t.rich("description", {
              years1: () => <span className="font-bold text-charcoal">{t("years1")}</span>,
              years5: () => <span className="font-bold text-charcoal">{t("years5")}</span>,
              years25: () => <span className="font-bold text-charcoal">{t("years25")}</span>,
            })}
          </motion.p>

          {/* Single Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 flex justify-center"
          >
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="group gap-3 text-lg shadow-md hover:shadow-lg px-8">
                  {t("goToDashboard")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <a href="#try-demo">
                <Button size="lg" className="group gap-3 text-lg shadow-md hover:shadow-lg px-8">
                  {t("startWritingFree")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            )}
          </motion.div>

          {/* Stats Bar - Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-16"
          >
            <div
              className="mx-auto max-w-3xl border-2 border-charcoal bg-white p-4 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x-2 sm:divide-charcoal/20">
                {stats.map((stat, i) => {
                  const Icon = STAT_ICONS[i] ?? Mail
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                      className="flex items-center justify-center gap-3 px-4 py-2"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                        style={{ borderRadius: "2px" }}
                      >
                        <Icon className="h-5 w-5 text-charcoal" strokeWidth={2} />
                      </div>
                      <div className="text-left">
                        <p className="font-mono text-xl font-bold text-charcoal sm:text-2xl">
                          {stat.value}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator - Fixed to 2px radius */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
                {t("tryItBelow")}
              </span>
              <div
                className="h-10 w-6 border-2 border-charcoal/30 flex items-start justify-center pt-2"
                style={{ borderRadius: "2px" }}
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 bg-charcoal/50"
                  style={{ borderRadius: "2px" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
