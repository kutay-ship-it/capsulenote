"use client"

import * as React from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { ChevronRight, HelpCircle, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

interface PricingFAQV3Props {
  items: FAQItem[]
  title?: string
  subtitle?: string
  contactText?: string
  contactLinkText?: string
  contactEmail?: string
}

function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      className={cn(
        "border-2 border-charcoal bg-white overflow-hidden",
        "transition-shadow duration-200",
        isOpen ? "shadow-[4px_4px_0_theme(colors.charcoal)]" : "shadow-[2px_2px_0_theme(colors.charcoal)]"
      )}
      style={{ borderRadius: "2px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Question Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-4 p-4 md:p-5",
          "text-left transition-colors duration-150",
          "hover:bg-cream",
          isOpen && "bg-duck-yellow/30"
        )}
      >
        {/* Question Number */}
        <span className="flex-shrink-0 font-mono text-xs text-charcoal/50 uppercase">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question Text */}
        <span className="flex-1 font-mono text-sm md:text-base text-charcoal font-normal">
          {item.question}
        </span>

        {/* Arrow Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-shrink-0 h-8 w-8 flex items-center justify-center",
            "border-2 border-charcoal transition-colors duration-150",
            isOpen ? "bg-duck-blue" : "bg-off-white"
          )}
          style={{ borderRadius: "2px" }}
        >
          <ChevronRight className="h-4 w-4 text-charcoal" strokeWidth={2} />
        </motion.div>
      </button>

      {/* Answer Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="border-t-2 border-dashed border-charcoal/20 px-4 py-5 md:px-5">
              <p className="font-mono text-sm leading-relaxed text-charcoal/80 pl-8 md:pl-10">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function PricingFAQV3({
  items,
  title = "FREQUENTLY ASKED QUESTIONS",
  subtitle = "Everything you need to know about plans, deliveries, and security",
  contactText = "Still have questions?",
  contactLinkText = "Contact us",
  contactEmail = "support@capsulenote.com",
}: PricingFAQV3Props) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon Badge */}
        <motion.div
          className={cn(
            "inline-flex items-center justify-center mb-6",
            "h-14 w-14 border-2 border-charcoal bg-duck-yellow",
            "shadow-[3px_3px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
          initial={{ scale: 0, rotate: -10 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
        >
          <HelpCircle className="h-7 w-7 text-charcoal" strokeWidth={2} />
        </motion.div>

        <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-wide text-charcoal mb-4">
          {title}
        </h2>
        <p className="font-mono text-sm md:text-base text-charcoal/70 max-w-xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* FAQ Grid */}
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, index) => (
          <FAQAccordionItem
            key={index}
            item={item}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className={cn(
            "inline-flex items-center gap-4 px-6 py-4",
            "border-2 border-dashed border-charcoal/30 bg-cream"
          )}
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-5 w-5 text-charcoal/60" />
          <span className="font-mono text-sm text-charcoal/70">
            {contactText}{" "}
            <a
              href={`mailto:${contactEmail}`}
              className={cn(
                "text-charcoal underline underline-offset-4",
                "hover:text-duck-blue transition-colors"
              )}
            >
              {contactLinkText}
            </a>
          </span>
        </div>
      </motion.div>
    </div>
  )
}
