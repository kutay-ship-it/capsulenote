"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useTranslations } from "next-intl"

interface Testimonial {
  quote: string
  author: string
  role: string
  context: string
}

const TESTIMONIAL_COLORS = [
  "bg-duck-yellow",
  "bg-duck-blue",
  "bg-teal-primary",
  "bg-coral",
  "bg-lavender",
  "bg-duck-yellow",
  "bg-teal-primary",
  "bg-duck-blue",
]

export function SocialProofV2() {
  const t = useTranslations("marketing.socialProofV2")
  const testimonials = t.raw("testimonials") as Testimonial[]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const current = testimonials[currentIndex]!
  const currentColor = TESTIMONIAL_COLORS[currentIndex] ?? "bg-duck-yellow"
  const currentInitials = current.author.split(" ").map(n => n[0]).join("")

  return (
    <section className="bg-charcoal py-20 md:py-32 overflow-hidden">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-white bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Star className="h-4 w-4 fill-duck-yellow text-duck-yellow" strokeWidth={2} />
            {t("badge")}
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl md:text-5xl">
            {t("title")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{t("titleHighlight")}</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-coral -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-white/70 sm:text-lg">
            {t("writersCount", { count: testimonials.length })}
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Quote Icon */}
          <div
            className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center border-2 border-white bg-duck-yellow z-10"
            style={{ borderRadius: "2px" }}
          >
            <Quote className="h-6 w-6 text-charcoal" strokeWidth={2} />
          </div>

          {/* Testimonial Card */}
          <div
            className="relative border-2 border-white bg-white p-8 shadow-[8px_8px_0_theme(colors.duck-yellow)] sm:p-12"
            style={{ borderRadius: "2px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="min-h-[220px] flex flex-col justify-center"
              >
                {/* Quote Text */}
                <p className="mb-8 font-mono text-lg leading-relaxed text-charcoal sm:text-xl">
                  "{current.quote}"
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center border-2 border-charcoal ${currentColor} font-mono text-lg font-bold text-charcoal`}
                    style={{ borderRadius: "2px" }}
                  >
                    {currentInitials}
                  </div>
                  <div>
                    <p className="font-mono text-base font-bold text-charcoal">
                      {current.author}
                    </p>
                    <p className="font-mono text-sm text-charcoal/60">
                      {current.role}
                    </p>
                    <p className="font-mono text-xs text-teal-primary font-medium">
                      {current.context}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2 sm:bottom-12 sm:right-12">
              <span className="font-mono text-xs text-charcoal/50 mr-2">
                {currentIndex + 1} / {testimonials.length}
              </span>
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                style={{ borderRadius: "2px" }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                style={{ borderRadius: "2px" }}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 transition-all duration-200 ${
                  i === currentIndex
                    ? "w-8 bg-duck-yellow"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                style={{ borderRadius: "2px" }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-4 border-2 border-white/20 bg-white/5 px-6 py-3"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-duck-yellow text-duck-yellow"
                  strokeWidth={2}
                />
              ))}
            </div>
            <div className="h-6 w-px bg-white/20" />
            <span className="font-mono text-sm text-white">
              {t.rich("rating", {
                score: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
