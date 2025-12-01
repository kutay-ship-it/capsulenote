"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { HelpCircle, Plus, Minus } from "lucide-react"
import { useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

function FAQItemComponent({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "border-2 border-charcoal bg-white transition-all duration-200",
        isOpen ? "shadow-[4px_4px_0_theme(colors.charcoal)]" : "shadow-[2px_2px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-mono text-sm font-bold text-charcoal pr-4">
          {item.question}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center border-2 border-charcoal transition-colors flex-shrink-0",
            isOpen ? "bg-duck-yellow" : "bg-white"
          )}
          style={{ borderRadius: "2px" }}
        >
          {isOpen ? (
            <Minus className="h-4 w-4 text-charcoal" strokeWidth={2} />
          ) : (
            <Plus className="h-4 w-4 text-charcoal" strokeWidth={2} />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t-2 border-charcoal/10">
              <p className="font-mono text-sm leading-relaxed text-charcoal/70 pt-4">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const t = useTranslations("marketing.faqSection")
  const faqItems = t.raw("items") as FAQItem[]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section ref={ref} className="bg-off-white py-20 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span
            className="mb-6 inline-flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <HelpCircle className="h-4 w-4" strokeWidth={2} />
            {t("badge")}
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("title")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{t("titleHighlight")}</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-2xl space-y-3">
          {faqItems.map((item, index) => (
            <FAQItemComponent
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-sm text-charcoal/60">
            {t.rich("contactCta", {
              link: (chunks) => (
                <a
                  href="mailto:hello@capsulenote.com"
                  className="font-bold text-charcoal hover:text-teal-primary transition-colors underline underline-offset-2"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
