"use client"

import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Testimonial {
  quote: string
  author: string
  role: string
  highlight: string
}

export function TestimonialsSection() {
  const t = useTranslations("marketing.testimonialsSection")
  const testimonials = t.raw("testimonials") as Testimonial[]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
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

  const changeSlide = (newIndex: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(newIndex)
      setIsTransitioning(false)
    }, 200)
  }

  const next = () => {
    changeSlide((currentIndex + 1) % testimonials.length)
  }

  const prev = () => {
    changeSlide((currentIndex - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex])

  const current = testimonials[currentIndex]!

  return (
    <section ref={sectionRef} className="bg-charcoal py-20 md:py-32 overflow-hidden">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <div
          className={cn(
            "mx-auto mb-12 max-w-3xl text-center md:mb-16 transition-all duration-500",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
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
        </div>

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
            <div
              className={cn(
                "min-h-[200px] flex flex-col justify-center transition-all duration-300",
                isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
              )}
            >
              {/* Quote Text */}
              <p className="mb-8 font-mono text-lg leading-relaxed text-charcoal sm:text-xl md:text-2xl">
                "{current.quote.split(current.highlight).map((part, i, arr) =>
                  i === arr.length - 1 ? (
                    part
                  ) : (
                    <span key={i}>
                      {part}
                      <span className="relative inline-block">
                        <span className="relative z-10 font-bold">{current.highlight}</span>
                        <span
                          className="absolute bottom-0 left-0 right-0 h-2 bg-duck-yellow -z-0"
                          style={{ borderRadius: "2px" }}
                        />
                      </span>
                    </span>
                  )
                )}"
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-teal-primary font-mono text-lg font-bold text-white"
                  style={{ borderRadius: "2px" }}
                >
                  {current.author.charAt(0)}
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-charcoal">
                    {current.author}
                  </p>
                  <p className="font-mono text-sm text-charcoal/60">
                    {current.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex items-center gap-2 sm:bottom-12 sm:right-12">
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
                onClick={() => changeSlide(i)}
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
      </div>
    </section>
  )
}
