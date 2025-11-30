"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, Plus, Minus } from "lucide-react"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

const FAQ_ITEMS = [
  {
    question: "What happens if I forget my account?",
    answer:
      "Your letters are tied to your email address. If you forget your password, you can reset it anytime. Your letters will still be delivered to the email address you specified, even if you never log in again. We also send reminder emails before delivery.",
  },
  {
    question: "How do you guarantee delivery?",
    answer:
      "We use multiple redundant systems to ensure 99.9% on-time delivery. Letters are stored with military-grade encryption and backed up across multiple data centers. We also have a reconciliation system that catches any delayed deliveries and expedites them.",
  },
  {
    question: "Can anyone else read my letters?",
    answer:
      "No. Your letters are encrypted using AES-256-GCM encryption the moment you write them. We use a zero-knowledge architecture, meaning not even our team can read your letters. Only you can decrypt them when they're delivered.",
  },
  {
    question: "What if I change my email address?",
    answer:
      "You can update your delivery email address anytime before the delivery date. Simply log in, find the letter, and update the recipient email. The letter will be delivered to your new address.",
  },
  {
    question: "Can I cancel or edit a scheduled letter?",
    answer:
      "Yes! You can edit or cancel any letter up until its delivery date. However, once a letter is delivered, it cannot be undelivered. For physical mail, cancellation must be done at least 7 days before the delivery date.",
  },
  {
    question: "How does physical mail work?",
    answer:
      "With our Premium plan, we print your letter on high-quality paper and mail it to any address worldwide. You can choose 'send on date' (mailed on a specific date) or 'arrive by date' (we calculate transit time to ensure arrival). Physical letters are printed from our secure facility and your content is never stored in plain text.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes. If you're not satisfied within 30 days of your Premium purchase, we'll refund you in full — no questions asked. For annual subscriptions, you can cancel anytime and continue using Premium features until your billing period ends.",
  },
  {
    question: "How far in the future can I schedule?",
    answer:
      "Free users can schedule up to 5 years ahead. Premium users can schedule up to 50 years ahead. Yes, you can write a letter to yourself 50 years from now. We're committed to being around to deliver it.",
  },
]

function FAQItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: (typeof FAQ_ITEMS)[0]
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
            FAQ
          </span>

          <h2 className="mt-6 font-mono text-3xl font-bold uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Questions?{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Answers</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-duck-yellow -z-0 sm:h-4"
                style={{ borderRadius: "2px" }}
              />
            </span>
          </h2>

          <p className="mt-6 font-mono text-base leading-relaxed text-charcoal/70 sm:text-lg">
            Everything you need to know about sending letters through time.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-2xl space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
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
            Still have questions?{" "}
            <a
              href="mailto:hello@capsulenote.com"
              className="font-bold text-charcoal hover:text-teal-primary transition-colors underline underline-offset-2"
            >
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
