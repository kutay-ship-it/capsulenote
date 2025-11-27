"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Mail,
  Lock,
  Clock,
  Sparkles,
  Send,
  Heart,
  ChevronDown,
  ArrowRight,
  Check,
  Star,
  PenLine,
  Inbox,
  Shield,
  Zap,
  Quote,
  Play,
  Users,
  Globe,
  Trophy,
  Gift,
  Cake,
  PartyPopper,
  Baby,
  GraduationCap,
  Gem,
  Timer,
  TrendingUp,
  Eye,
  EyeOff,
  Award,
  ChevronRight,
  MapPin,
} from "lucide-react"
import {
  format,
  addMonths,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns"

// ============================================================================
// TYPES
// ============================================================================

type LandingVariation =
  | "product-led"
  | "story-driven"
  | "occasion"
  | "trust-first"
  | "social-proof"
  | "urgency"

// ============================================================================
// MOCK DATA
// ============================================================================

const STATS = {
  lettersDelivered: 10847,
  onTimeRate: 99.9,
  happyWriters: 4231,
  averageRating: 4.9,
  yearsRunning: 5,
}

const TESTIMONIALS = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    role: "5-year letter recipient",
    quote:
      "Reading my letter from 2019 brought me to tears. I had completely forgotten the dreams I'd written about - and realized I'd achieved most of them.",
    date: "Dec 2024",
    years: 5,
    rating: 5,
  },
  {
    id: "2",
    name: "Marcus Williams",
    avatar: "MW",
    role: "Anniversary tradition",
    quote:
      "Every year on our anniversary, my wife and I write letters to ourselves for next year. It's become our favorite tradition. The joy of opening them together is indescribable.",
    date: "Nov 2024",
    years: 3,
    rating: 5,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    avatar: "ER",
    role: "Physical mail lover",
    quote:
      "The feeling of receiving a physical letter from past me was indescribable. So much more meaningful than a digital reminder. I framed it.",
    date: "Oct 2024",
    years: 2,
    rating: 5,
  },
  {
    id: "4",
    name: "James Park",
    avatar: "JP",
    role: "New Year's tradition",
    quote:
      "Started this 4 years ago as a New Year's resolution tracker. Now it's become a deeply personal reflection practice that I look forward to every January.",
    date: "Jan 2024",
    years: 4,
    rating: 5,
  },
  {
    id: "5",
    name: "Priya Sharma",
    avatar: "PS",
    role: "Letter to daughter",
    quote:
      "I wrote a letter to my daughter on her 1st birthday, to be delivered on her 18th. Knowing it's safe and encrypted gives me peace of mind for the next 17 years.",
    date: "Sep 2024",
    years: 0,
    rating: 5,
  },
]

const OCCASIONS = [
  {
    id: "birthday",
    icon: Cake,
    label: "Birthday",
    color: "duck-yellow",
    count: 2341,
    template: "Dear future birthday me, today I turn [age] and I want you to know...",
  },
  {
    id: "anniversary",
    icon: Heart,
    label: "Anniversary",
    color: "coral",
    count: 1892,
    template: "On this day [X] years ago, we began our journey together...",
  },
  {
    id: "newyear",
    icon: PartyPopper,
    label: "New Year",
    color: "teal-primary",
    count: 3456,
    template: "Dear [year] me, as I write this at the end of [previous year]...",
  },
  {
    id: "graduation",
    icon: GraduationCap,
    label: "Graduation",
    color: "duck-blue",
    count: 876,
    template: "Future graduate, right now you're studying hard for...",
  },
  {
    id: "baby",
    icon: Baby,
    label: "Letter to Child",
    color: "duck-yellow",
    count: 1234,
    template: "My dearest [child's name], on the day you were born...",
  },
  {
    id: "any",
    icon: Sparkles,
    label: "Any Moment",
    color: "charcoal",
    count: 5048,
    template: "Dear future me, today is [date] and I wanted to tell you...",
  },
]

const LIVE_ACTIVITY = [
  { name: "Sarah", action: "sealed a letter", target: "2028", timeAgo: "2m" },
  { name: "Marcus", action: "received", target: "3-year letter", timeAgo: "5m", emoji: "🎉" },
  { name: "Elena", action: "scheduled", target: "anniversary letter", timeAgo: "8m" },
  { name: "James", action: "sealed a letter", target: "next New Year", timeAgo: "12m" },
  { name: "Priya", action: "received", target: "birthday letter", timeAgo: "15m", emoji: "🎂" },
]

const STORY_CHAPTERS = [
  {
    title: "The Blank Page",
    content:
      "Sarah sat down on her 25th birthday with a simple question: What do I want future me to know?",
    color: "duck-yellow",
  },
  {
    title: "The Writing",
    content:
      "She wrote about her fears, her dreams, and the person she hoped to become. No judgment. Just honesty.",
    color: "duck-blue",
  },
  {
    title: "The Seal",
    content:
      "With a click, the letter was sealed. Set to arrive on her 30th birthday. Then she forgot about it.",
    color: "teal-primary",
  },
  {
    title: "The Wait",
    content:
      "Five years passed. Jobs changed. Relationships evolved. Life happened. The letter waited patiently.",
    color: "charcoal",
  },
  {
    title: "The Arrival",
    content:
      "On her 30th birthday, a notification appeared. 'You have a letter from your past self.'",
    color: "coral",
  },
  {
    title: "The Read",
    content:
      "Tears. Laughter. Pride. Everything 25-year-old Sarah hoped for 30-year-old Sarah - she had become.",
    color: "duck-yellow",
  },
]

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function TrustBadges({ variant = "horizontal" }: { variant?: "horizontal" | "vertical" }) {
  const badges = [
    { icon: Lock, label: "AES-256 Encrypted" },
    { icon: Shield, label: "99.9% On-Time" },
    { icon: Star, label: "4.9★ Rating" },
  ]

  return (
    <div
      className={cn(
        "flex gap-3",
        variant === "vertical" ? "flex-col" : "flex-row flex-wrap justify-center"
      )}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 border-2 border-charcoal/20 bg-white px-3 py-1.5"
          style={{ borderRadius: "2px" }}
        >
          <badge.icon className="h-3.5 w-3.5 text-charcoal/60" strokeWidth={2} />
          <span className="font-mono text-xs text-charcoal/60">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}

function PrimaryButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_theme(colors.charcoal)]",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 border-2 border-charcoal bg-white px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {children}
    </button>
  )
}

function StatCard({
  value,
  label,
  highlight = false,
}: {
  value: string | number
  label: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "border-2 border-charcoal p-4 text-center",
        highlight ? "bg-duck-yellow" : "bg-white"
      )}
      style={{ borderRadius: "2px" }}
    >
      <div className="font-mono text-3xl font-bold text-charcoal">{value}</div>
      <div className="font-mono text-xs uppercase tracking-wider text-charcoal/60">{label}</div>
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: (typeof TESTIMONIALS)[0] }) {
  return (
    <div
      className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      <div className="mb-4 flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-duck-yellow font-mono text-sm font-bold"
          style={{ borderRadius: "2px" }}
        >
          {testimonial.avatar}
        </div>
        <div className="flex-1">
          <div className="font-mono text-sm font-bold text-charcoal">{testimonial.name}</div>
          <div className="font-mono text-xs text-charcoal/60">{testimonial.role}</div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-duck-yellow text-duck-yellow" />
          ))}
        </div>
      </div>
      <blockquote className="font-mono text-sm leading-relaxed text-charcoal/80">
        "{testimonial.quote}"
      </blockquote>
      <div className="mt-4 flex items-center gap-2 border-t-2 border-charcoal/10 pt-4">
        <Clock className="h-3.5 w-3.5 text-charcoal/40" strokeWidth={2} />
        <span className="font-mono text-xs text-charcoal/40">
          {testimonial.years > 0 ? `${testimonial.years}-year letter` : "Letter in progress"} •{" "}
          {testimonial.date}
        </span>
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: PenLine,
      title: "Write Your Heart Out",
      desc: "Pour your thoughts, dreams, and feelings into a letter. No judgment, just honesty.",
    },
    {
      number: 2,
      icon: Calendar,
      title: "Pick Your Date",
      desc: "Choose when future you should receive this. Tomorrow, next year, or decades from now.",
    },
    {
      number: 3,
      icon: Send,
      title: "We Remember, You Forget",
      desc: "Your letter is encrypted and scheduled. Live your life. We'll deliver it on time.",
    },
  ]

  return (
    <section className="bg-duck-blue py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-block border-2 border-charcoal bg-white px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-charcoal md:text-4xl">
            Three Steps to Your Future
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.number * 0.1 }}
              className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow font-mono text-xl font-bold"
                  style={{ borderRadius: "2px" }}
                >
                  {step.number}
                </div>
                <step.icon className="h-6 w-6 text-charcoal" strokeWidth={2} />
              </div>
              <h3 className="mb-2 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                {step.title}
              </h3>
              <p className="font-mono text-sm text-charcoal/70">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingPreviewSection() {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div
          className="mb-4 inline-block border-2 border-charcoal bg-teal-primary px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Simple Pricing
          </span>
        </div>
        <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal md:text-4xl">
          First Letter Free. Always.
        </h2>
        <p className="mx-auto mb-8 max-w-lg font-mono text-sm text-charcoal/70">
          No credit card required. Write your first letter right now and experience the magic.
          Upgrade later if you love it.
        </p>

        <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
          <div
            className="border-2 border-charcoal bg-white p-6"
            style={{ borderRadius: "2px" }}
          >
            <div className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
              Free Forever
            </div>
            <div className="mb-2 font-mono text-4xl font-bold text-charcoal">$0</div>
            <p className="mb-6 font-mono text-sm text-charcoal/60">1 letter, unlimited time</p>
            <SecondaryButton className="w-full">Start Free</SecondaryButton>
          </div>

          <div
            className="border-2 border-charcoal bg-duck-yellow p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <div className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
              Unlimited
            </div>
            <div className="mb-2 font-mono text-4xl font-bold text-charcoal">
              $5<span className="text-lg">/year</span>
            </div>
            <p className="mb-6 font-mono text-sm text-charcoal/80">
              Unlimited letters + physical mail
            </p>
            <PrimaryButton className="w-full bg-charcoal text-white">Get Unlimited</PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTASection({ variant = "default" }: { variant?: "default" | "urgency" }) {
  return (
    <section className="bg-charcoal py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
          {variant === "urgency"
            ? "Every Day You Wait..."
            : "Your Future Self Is Waiting"}
        </h2>
        <p className="mb-8 font-mono text-sm text-white/70">
          {variant === "urgency"
            ? "Is a day you'll never get back. Start writing now."
            : "Write something today that will make them smile, cry, or feel understood."}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton>
            <PenLine className="h-4 w-4" strokeWidth={2} />
            Write Your First Letter
          </PrimaryButton>
          <SecondaryButton>Learn More</SecondaryButton>
        </div>
        <div className="mt-8">
          <TrustBadges />
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// VARIATION 1: PRODUCT-LED GROWTH PAGE
// ============================================================================

function ProductLedPage() {
  const [letterText, setLetterText] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [isSealing, setIsSealing] = useState(false)
  const [isSealed, setIsSealed] = useState(false)

  const handleSeal = () => {
    if (letterText.length < 20 || !selectedDate) return
    setIsSealing(true)
    setTimeout(() => {
      setIsSealing(false)
      setIsSealed(true)
    }, 1500)
  }

  const dateOptions = [
    { value: "1m", label: "1 month", date: format(addMonths(new Date(), 1), "MMM d, yyyy") },
    { value: "6m", label: "6 months", date: format(addMonths(new Date(), 6), "MMM d, yyyy") },
    { value: "1y", label: "1 year", date: format(addYears(new Date(), 1), "MMM d, yyyy") },
    { value: "5y", label: "5 years", date: format(addYears(new Date(), 5), "MMM d, yyyy") },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero with Demo */}
      <section className="relative min-h-screen bg-cream px-4 py-20">
        <div className="mx-auto max-w-3xl">
          {/* Minimal header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Try It Now - No Signup Required
              </span>
            </motion.div>
            <h1 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-charcoal md:text-5xl">
              Write to Future You
            </h1>
            <p className="mx-auto max-w-md font-mono text-sm text-charcoal/70">
              Experience it right now. Write a letter, pick a date, and see what it feels like.
            </p>
          </div>

          {/* Interactive Demo */}
          <AnimatePresence mode="wait">
            {!isSealed ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  className="border-2 border-charcoal bg-white p-6 shadow-[6px_6px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  {/* Editor header */}
                  <div className="mb-4 flex items-center justify-between border-b-2 border-charcoal/20 pb-4">
                    <div className="flex items-center gap-2">
                      <PenLine className="h-4 w-4 text-charcoal" strokeWidth={2} />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                        New Letter
                      </span>
                    </div>
                    <div className="font-mono text-xs text-charcoal/50">
                      {letterText.length}/500
                    </div>
                  </div>

                  {/* Text input */}
                  <textarea
                    value={letterText}
                    onChange={(e) => setLetterText(e.target.value.slice(0, 500))}
                    placeholder="Dear Future Me,

Write something meaningful. Tell yourself about today. Share your hopes, fears, dreams. Be honest - only you will read this..."
                    className="min-h-[200px] w-full resize-none border-none bg-transparent font-mono text-base leading-relaxed text-charcoal placeholder:text-charcoal/40 focus:outline-none"
                    disabled={isSealing}
                  />

                  {/* Date picker and seal */}
                  <div className="mt-6 flex flex-col gap-4 border-t-2 border-charcoal/20 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/70">
                        <Calendar className="h-4 w-4" strokeWidth={2} />
                        Deliver On
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dateOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSelectedDate(option.value)}
                            className={cn(
                              "border-2 border-charcoal px-3 py-2 font-mono text-xs transition-all",
                              selectedDate === option.value
                                ? "bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                                : "bg-white hover:bg-cream"
                            )}
                            style={{ borderRadius: "2px" }}
                          >
                            <div className="font-bold">{option.label}</div>
                            <div className="text-charcoal/60">{option.date}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <PrimaryButton
                      onClick={handleSeal}
                      className={cn(
                        "min-w-[160px]",
                        (letterText.length < 20 || !selectedDate) &&
                          "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isSealing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Lock className="h-4 w-4" strokeWidth={2} />
                          </motion.div>
                          Sealing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" strokeWidth={2} />
                          Seal Letter
                        </>
                      )}
                    </PrimaryButton>
                  </div>

                  {letterText.length > 0 && letterText.length < 20 && (
                    <p className="mt-2 font-mono text-xs text-coral">
                      Write at least 20 characters to seal your letter
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sealed"
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <div
                  className="border-2 border-charcoal bg-teal-primary p-8 text-center shadow-[6px_6px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="mb-4 flex justify-center"
                  >
                    <div
                      className="flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-white"
                      style={{ borderRadius: "50%" }}
                    >
                      <Check className="h-10 w-10 text-teal-primary" strokeWidth={3} />
                    </div>
                  </motion.div>
                  <h3 className="mb-2 font-mono text-2xl font-bold uppercase text-charcoal">
                    Letter Sealed!
                  </h3>
                  <p className="mb-6 font-mono text-sm text-charcoal/80">
                    Your letter is encrypted and ready. Sign up to save it and receive it on{" "}
                    {dateOptions.find((d) => d.value === selectedDate)?.date || "your chosen date"}.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <PrimaryButton>
                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                      Save & Create Account
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setIsSealed(false)}>
                      Write Another
                    </SecondaryButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y-2 border-charcoal bg-white py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4">
          <StatCard value={STATS.lettersDelivered.toLocaleString()} label="Letters Delivered" />
          <StatCard value={`${STATS.onTimeRate}%`} label="On-Time Rate" highlight />
          <StatCard value={`${STATS.averageRating}★`} label="Average Rating" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              People Love Receiving Letters
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================================
// VARIATION 2: STORY-DRIVEN PAGE
// ============================================================================

function StoryDrivenPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  return (
    <div className="min-h-screen">
      {/* Story Scroll */}
      <div ref={containerRef} className="relative">
        {STORY_CHAPTERS.map((chapter, i) => (
          <section
            key={chapter.title}
            className="sticky top-0 flex min-h-screen items-center justify-center"
            style={{
              backgroundColor:
                chapter.color === "charcoal"
                  ? "#383838"
                  : chapter.color === "duck-yellow"
                    ? "#FFDE00"
                    : chapter.color === "duck-blue"
                      ? "#6FC2FF"
                      : chapter.color === "teal-primary"
                        ? "#38C1B0"
                        : "#FF7169",
              zIndex: i + 1,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl px-8 text-center"
            >
              <div
                className={cn(
                  "mb-4 inline-block border-2 px-4 py-1",
                  chapter.color === "charcoal"
                    ? "border-white bg-white/10 text-white"
                    : "border-charcoal bg-white text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Chapter {i + 1}
                </span>
              </div>

              <h2
                className={cn(
                  "mb-6 font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl",
                  chapter.color === "charcoal" ? "text-white" : "text-charcoal"
                )}
              >
                {chapter.title}
              </h2>

              <p
                className={cn(
                  "font-mono text-lg leading-relaxed md:text-xl",
                  chapter.color === "charcoal" ? "text-white/80" : "text-charcoal/80"
                )}
              >
                {chapter.content}
              </p>

              {i === STORY_CHAPTERS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <PrimaryButton>
                    <PenLine className="h-4 w-4" strokeWidth={2} />
                    Write Your Own Story
                  </PrimaryButton>
                </motion.div>
              )}
            </motion.div>

            {/* Progress indicator */}
            <div className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2">
              <div className="flex gap-2">
                {STORY_CHAPTERS.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-2 w-8 border-2 border-charcoal transition-all",
                      idx <= i ? "bg-duck-yellow" : "bg-white"
                    )}
                    style={{ borderRadius: "2px" }}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Post-Story Content */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal md:text-4xl">
              Thousands of Stories Like Sarah's
            </h2>
            <p className="mx-auto max-w-lg font-mono text-sm text-charcoal/70">
              Join {STATS.happyWriters.toLocaleString()} people who have written letters to their
              future selves.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.slice(0, 4).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================================
// VARIATION 3: OCCASION-DRIVEN PAGE
// ============================================================================

function OccasionDrivenPage() {
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      {/* Occasion Selector Hero */}
      <section className="bg-cream px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div
              className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Find Your Moment
              </span>
            </div>
            <h1 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-charcoal md:text-5xl">
              Send a Letter For...
            </h1>
            <p className="mx-auto max-w-lg font-mono text-sm text-charcoal/70">
              Every moment deserves to be captured. Choose your occasion and start writing.
            </p>
          </div>

          {/* Occasion Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OCCASIONS.map((occasion) => {
              const bgColor =
                occasion.color === "duck-yellow"
                  ? "#FFDE00"
                  : occasion.color === "duck-blue"
                    ? "#6FC2FF"
                    : occasion.color === "teal-primary"
                      ? "#38C1B0"
                      : occasion.color === "coral"
                        ? "#FF7169"
                        : "#383838"

              return (
                <motion.button
                  key={occasion.id}
                  onClick={() =>
                    setActiveOccasion(activeOccasion === occasion.id ? null : occasion.id)
                  }
                  whileHover={{ y: -4 }}
                  className={cn(
                    "border-2 border-charcoal p-6 text-left transition-all",
                    activeOccasion === occasion.id
                      ? "shadow-[6px_6px_0_theme(colors.charcoal)]"
                      : "shadow-[4px_4px_0_theme(colors.charcoal)]"
                  )}
                  style={{
                    borderRadius: "2px",
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <occasion.icon
                      className={cn(
                        "h-8 w-8",
                        occasion.color === "charcoal" ? "text-white" : "text-charcoal"
                      )}
                      strokeWidth={2}
                    />
                    <span
                      className={cn(
                        "font-mono text-xs",
                        occasion.color === "charcoal" ? "text-white/60" : "text-charcoal/60"
                      )}
                    >
                      {occasion.count.toLocaleString()} letters
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "mb-2 font-mono text-lg font-bold uppercase tracking-wider",
                      occasion.color === "charcoal" ? "text-white" : "text-charcoal"
                    )}
                  >
                    {occasion.label}
                  </h3>

                  <AnimatePresence>
                    {activeOccasion === occasion.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p
                          className={cn(
                            "mt-4 border-t-2 pt-4 font-mono text-sm italic",
                            occasion.color === "charcoal"
                              ? "border-white/20 text-white/80"
                              : "border-charcoal/20 text-charcoal/80"
                          )}
                        >
                          "{occasion.template}"
                        </p>
                        <div className="mt-4">
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider",
                              occasion.color === "charcoal"
                                ? "border-white bg-white text-charcoal"
                                : "border-charcoal bg-charcoal text-white"
                            )}
                            style={{ borderRadius: "2px" }}
                          >
                            Write {occasion.label} Letter
                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Testimonials by Occasion */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Every Occasion Has a Story
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================================
// VARIATION 4: TRUST-FIRST PAGE
// ============================================================================

function TrustFirstPage() {
  return (
    <div className="min-h-screen">
      {/* Trust Hero */}
      <section className="bg-charcoal px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <div
              className="flex h-24 w-24 items-center justify-center border-4 border-duck-yellow bg-charcoal"
              style={{ borderRadius: "50%" }}
            >
              <Shield className="h-12 w-12 text-duck-yellow" strokeWidth={2} />
            </div>
          </motion.div>

          <div
            className="mb-4 inline-block border-2 border-duck-yellow bg-duck-yellow/10 px-4 py-2"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
              Your Privacy, Guaranteed
            </span>
          </div>

          <h1 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
            Your Words.
            <br />
            Protected Forever.
          </h1>

          <p className="mx-auto mb-8 max-w-lg font-mono text-sm text-white/70">
            Bank-level AES-256 encryption. We can't read your letters even if we wanted to. Your
            private thoughts stay private.
          </p>

          <PrimaryButton>
            <Lock className="h-4 w-4" strokeWidth={2} />
            Start Writing Securely
          </PrimaryButton>
        </div>
      </section>

      {/* Security Deep-Dive */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              How We Protect Your Letters
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                  style={{ borderRadius: "2px" }}
                >
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  AES-256 Encryption
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70">
                The same encryption used by banks and governments. Your letter content is encrypted
                before it leaves your browser and stays encrypted until you open it.
              </p>
            </div>

            <div
              className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-teal-primary"
                  style={{ borderRadius: "2px" }}
                >
                  <EyeOff className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  Zero-Knowledge
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70">
                We literally cannot read your letters. Even our engineers with database access see
                only encrypted gibberish. Only you have the keys.
              </p>
            </div>

            <div
              className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-blue"
                  style={{ borderRadius: "2px" }}
                >
                  <Globe className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  3x Replication
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70">
                Your letters are stored across three continents. Even if a data center disappears,
                your letters are safe. We've never lost a single letter.
              </p>
            </div>

            <div
              className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-coral"
                  style={{ borderRadius: "2px" }}
                >
                  <Clock className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  99.9% On-Time
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70">
                Our delivery SLO is 99.9% on-time. We monitor every scheduled delivery and have
                redundant systems to ensure your letter arrives exactly when promised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Why Not Just Email Yourself?
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className="border-2 border-charcoal/30 bg-gray-50 p-6"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal/50">
                Email to Yourself
              </div>
              <ul className="space-y-3">
                {[
                  "Unencrypted - Google/Microsoft can read it",
                  "Might end up in spam",
                  "No guarantee of delivery",
                  "Easy to accidentally open early",
                  "Feels like a reminder, not a gift",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-mono text-sm text-charcoal/60">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 border border-charcoal/30 bg-charcoal/10" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="border-2 border-charcoal bg-duck-yellow p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                Capsule Note
              </div>
              <ul className="space-y-3">
                {[
                  "AES-256 encrypted end-to-end",
                  "Guaranteed inbox delivery",
                  "99.9% on-time SLO",
                  "Sealed until delivery date",
                  "Feels magical and meaningful",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-mono text-sm text-charcoal">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-primary" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Trust Angle */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Trusted With Life's Most Personal Moments
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================================
// VARIATION 5: SOCIAL PROOF PAGE
// ============================================================================

function SocialProofPage() {
  const [activityIndex, setActivityIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((i) => (i + 1) % LIVE_ACTIVITY.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Numbers Hero */}
      <section className="bg-cream px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div
            className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Join {STATS.happyWriters.toLocaleString()}+ Time Travelers
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <span className="font-mono text-7xl font-bold text-charcoal md:text-9xl">
              {STATS.lettersDelivered.toLocaleString()}
            </span>
          </motion.div>

          <h1 className="mb-4 font-mono text-2xl font-bold uppercase tracking-tight text-charcoal md:text-3xl">
            Letters Delivered to Future Selves
          </h1>

          <p className="mx-auto mb-8 max-w-lg font-mono text-sm text-charcoal/70">
            Join thousands who are writing to their future selves. Every letter is a gift waiting to
            be unwrapped.
          </p>

          <PrimaryButton>
            <Users className="h-4 w-4" strokeWidth={2} />
            Join the Community
          </PrimaryButton>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="border-y-2 border-charcoal bg-white py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-3 w-3 items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-teal-primary"
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activityIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-mono text-sm text-charcoal"
              >
                <span className="font-bold">{LIVE_ACTIVITY[activityIndex]?.name}</span>{" "}
                {LIVE_ACTIVITY[activityIndex]?.action}{" "}
                <span className="text-charcoal/60">{LIVE_ACTIVITY[activityIndex]?.target}</span>
                {LIVE_ACTIVITY[activityIndex]?.emoji && (
                  <span className="ml-1">{LIVE_ACTIVITY[activityIndex]?.emoji}</span>
                )}
                <span className="ml-2 text-charcoal/40">
                  {LIVE_ACTIVITY[activityIndex]?.timeAgo} ago
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="bg-duck-blue py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              value={`${STATS.onTimeRate}%`}
              label="On-Time Delivery"
              highlight
            />
            <StatCard value={`${STATS.averageRating}★`} label="Average Rating" />
            <StatCard value="0" label="Letters Lost (Ever)" />
            <StatCard value={`${STATS.yearsRunning}`} label="Years Running" />
          </div>
        </div>
      </section>

      {/* Testimonials Wall */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Stories From Our Community
            </h2>
            <p className="font-mono text-sm text-charcoal/60">
              500+ five-star reviews and counting
            </p>
          </div>

          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="mb-6 break-inside-avoid"
              >
                <TestimonialCard testimonial={t} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular Letter Types */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              What People Write About
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Personal Reflections", percent: 34, color: "duck-yellow" },
              { label: "Goal Setting", percent: 28, color: "teal-primary" },
              { label: "Anniversary Letters", percent: 18, color: "coral" },
              { label: "Birthday Letters", percent: 12, color: "duck-blue" },
              { label: "Letters to Children", percent: 8, color: "charcoal" },
            ].map((cat) => (
              <div
                key={cat.label}
                className="border-2 border-charcoal bg-white p-4"
                style={{ borderRadius: "2px" }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-charcoal">{cat.label}</span>
                  <span className="font-mono text-sm text-charcoal/60">{cat.percent}%</span>
                </div>
                <div className="h-3 w-full border-2 border-charcoal bg-cream" style={{ borderRadius: "2px" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor:
                        cat.color === "duck-yellow"
                          ? "#FFDE00"
                          : cat.color === "teal-primary"
                            ? "#38C1B0"
                            : cat.color === "coral"
                              ? "#FF7169"
                              : cat.color === "duck-blue"
                                ? "#6FC2FF"
                                : "#383838",
                      borderRadius: "1px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  )
}

// ============================================================================
// VARIATION 6: URGENCY PAGE
// ============================================================================

function UrgencyPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calculate time until next New Year (or another significant date)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const nextNewYear = new Date(now.getFullYear() + 1, 0, 1)
      const diff = nextNewYear.getTime() - now.getTime()

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])

  const upcomingDates = [
    {
      label: "New Year's Day",
      date: new Date(new Date().getFullYear() + 1, 0, 1),
      color: "duck-yellow",
    },
    {
      label: "Valentine's Day",
      date: new Date(new Date().getFullYear() + 1, 1, 14),
      color: "coral",
    },
    {
      label: "Your Next Birthday",
      date: addYears(new Date(), 1),
      color: "duck-blue",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Countdown Hero */}
      <section className="bg-charcoal px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="mb-4 inline-block border-2 border-coral bg-coral/10 px-4 py-2"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
              Time is Ticking
            </span>
          </div>

          <h1 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            New Year's Day is in...
          </h1>

          {/* Countdown Timer */}
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="border-2 border-duck-yellow bg-charcoal p-4"
                style={{ borderRadius: "2px" }}
              >
                <motion.div
                  key={unit.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-mono text-4xl font-bold text-duck-yellow md:text-5xl"
                >
                  {unit.value.toString().padStart(2, "0")}
                </motion.div>
                <div className="font-mono text-xs uppercase tracking-wider text-white/60">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mb-8 max-w-lg font-mono text-sm text-white/70">
            Will future you be ready? Write a letter now that arrives on New Year's Day. Capture
            your current hopes, fears, and dreams.
          </p>

          <PrimaryButton>
            <Timer className="h-4 w-4" strokeWidth={2} />
            Write Before Midnight
          </PrimaryButton>
        </div>
      </section>

      {/* Upcoming Occasions */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Upcoming Moments to Capture
            </h2>
            <p className="font-mono text-sm text-charcoal/70">
              Pick a date. Write a letter. Make future you smile.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {upcomingDates.map((occasion) => {
              const daysAway = differenceInDays(occasion.date, new Date())
              const bgColor =
                occasion.color === "duck-yellow"
                  ? "#FFDE00"
                  : occasion.color === "coral"
                    ? "#FF7169"
                    : "#6FC2FF"

              return (
                <motion.div
                  key={occasion.label}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer border-2 border-charcoal p-6 shadow-[4px_4px_0_theme(colors.charcoal)] transition-all"
                  style={{ borderRadius: "2px", backgroundColor: bgColor }}
                >
                  <div className="mb-2 font-mono text-4xl font-bold text-charcoal">
                    {daysAway}
                  </div>
                  <div className="mb-1 font-mono text-xs uppercase tracking-wider text-charcoal/60">
                    Days Until
                  </div>
                  <div className="mb-4 font-mono text-lg font-bold uppercase tracking-wider text-charcoal">
                    {occasion.label}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-charcoal/80">
                    <Calendar className="h-4 w-4" strokeWidth={2} />
                    {format(occasion.date, "MMMM d, yyyy")}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* "Last Chance" Stories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
              Don't Wait Until It's Too Late
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="border-2 border-charcoal bg-coral/10 p-6"
              style={{ borderRadius: "2px" }}
            >
              <Quote className="mb-4 h-8 w-8 text-coral" strokeWidth={2} />
              <blockquote className="mb-4 font-mono text-sm leading-relaxed text-charcoal">
                "I almost missed writing before my wedding. I wrote the letter the night before and
                scheduled it for our 10th anniversary. I'm so glad I didn't wait - that version of
                me had something special to say."
              </blockquote>
              <div className="font-mono text-xs text-charcoal/60">— A last-minute writer</div>
            </div>

            <div
              className="border-2 border-charcoal bg-duck-yellow/30 p-6"
              style={{ borderRadius: "2px" }}
            >
              <Quote className="mb-4 h-8 w-8 text-duck-yellow" strokeWidth={2} />
              <blockquote className="mb-4 font-mono text-sm leading-relaxed text-charcoal">
                "My grandmother was diagnosed with cancer. I wrote her a letter to be delivered on
                what would have been her next birthday. It became the most precious thing I own."
              </blockquote>
              <div className="font-mono text-xs text-charcoal/60">— Capturing important moments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="bg-teal-primary py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div
            className="mb-4 inline-block border-2 border-charcoal bg-white px-4 py-2"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              30-Second Start
            </span>
          </div>

          <h2 className="mb-4 font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
            It Takes Less Time Than Reading This
          </h2>

          <p className="mb-8 font-mono text-sm text-charcoal/80">
            Seriously. By the time you've read this sentence, you could have started writing. Don't
            overthink it. Just start.
          </p>

          <PrimaryButton>
            <Zap className="h-4 w-4" strokeWidth={2} />
            Start Your 30-Second Letter
          </PrimaryButton>
        </div>
      </section>

      <HowItWorksSection />
      <PricingPreviewSection />
      <FinalCTASection variant="urgency" />
    </div>
  )
}

// ============================================================================
// BEST PRACTICES GUIDE
// ============================================================================

function ConversionGuide({ variation }: { variation: LandingVariation }) {
  const guides = {
    "product-led": {
      title: "Product-Led Growth",
      description: "Let visitors experience the product before asking for signup.",
      conversionStrategy: "Remove friction. Let them write first, signup after.",
      bestFor: "SaaS-savvy visitors, skeptics who need to try before buying",
      keyMetrics: ["Time to first letter", "Demo completion rate", "Demo → Signup conversion"],
      strengths: [
        "Zero friction entry",
        "Investment bias after writing",
        "Shows value before commitment",
        "Higher quality signups",
      ],
      weaknesses: [
        "Some may not complete demo",
        "Mobile keyboard challenges",
        "Requires good demo UX",
        "May lose context of full offering",
      ],
    },
    "story-driven": {
      title: "Emotional Storytelling",
      description: "Use narrative to create emotional investment before CTA.",
      conversionStrategy: "Build emotional connection through relatable story.",
      bestFor: "Building brand affinity, emotional purchase decisions",
      keyMetrics: ["Story completion rate", "Time on page", "Scroll depth"],
      strengths: [
        "Creates strong emotional resonance",
        "Memorable brand experience",
        "Shows real use case end-to-end",
        "Built-in social proof",
      ],
      weaknesses: [
        "Longer time to reach CTA",
        "Scroll-jacking can frustrate",
        "Requires compelling storytelling",
        "May lose impatient visitors",
      ],
    },
    occasion: {
      title: "Occasion-Driven",
      description: "Meet visitors where they are with specific use cases.",
      conversionStrategy: "Segment by intent, reduce 'what to write' anxiety.",
      bestFor: "Visitors with specific occasions in mind",
      keyMetrics: ["Occasion selection rate", "Template usage", "Time to CTA by occasion"],
      strengths: [
        "Speaks to specific intent",
        "Templates reduce friction",
        "Social proof by category",
        "Seasonal marketing opportunities",
      ],
      weaknesses: [
        "May overwhelm with choices",
        "Requires maintenance of templates",
        "Less effective for general browsers",
        "Seasonal traffic dependency",
      ],
    },
    "trust-first": {
      title: "Trust-First",
      description: "Lead with security and reliability for privacy-conscious users.",
      conversionStrategy: "Address privacy objections before asking for content.",
      bestFor: "Privacy-conscious users, researcher types, enterprise",
      keyMetrics: ["Security page views", "Trust badge clicks", "FAQ engagement"],
      strengths: [
        "Addresses #1 objection upfront",
        "Builds credibility and expertise",
        "Differentiates from alternatives",
        "Good for word-of-mouth",
      ],
      weaknesses: [
        "May feel corporate/cold",
        "Less emotional appeal",
        "Technical details may confuse some",
        "Slower emotional connection",
      ],
    },
    "social-proof": {
      title: "Social Proof Wall",
      description: "Leverage FOMO and social validation as primary driver.",
      conversionStrategy: "Show momentum and community to trigger FOMO.",
      bestFor: "Social validation seekers, trend-followers",
      keyMetrics: ["Social proof engagement", "Testimonial clicks", "Community metrics"],
      strengths: [
        "Social proof is highly persuasive",
        "Live activity creates urgency",
        "Numbers build instant credibility",
        "Community aspect appeals broadly",
      ],
      weaknesses: [
        "Requires real data/testimonials",
        "Can feel manufactured if fake",
        "Less effective for privacy-focused",
        "May not address specific objections",
      ],
    },
    urgency: {
      title: "Urgency & Countdown",
      description: "Create time-based pressure for immediate action.",
      conversionStrategy: "Use countdown timers and occasion urgency.",
      bestFor: "Impulse decisions, occasion-based marketing, campaigns",
      keyMetrics: ["Urgency CTA clicks", "Same-session conversion", "Return visit rate"],
      strengths: [
        "Urgency drives action",
        "Time-based triggers feel personal",
        "Works well for campaigns",
        "Creates clear decision point",
      ],
      weaknesses: [
        "Can feel manipulative",
        "Countdown fatigue is real",
        "Less effective for considered purchases",
        "Requires timely content updates",
      ],
    },
  }

  const g = guides[variation]

  return (
    <div className="border-2 border-charcoal bg-white p-6" style={{ borderRadius: "2px" }}>
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <TrendingUp className="h-5 w-5 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            {g.title}
          </h2>
          <p className="font-mono text-xs text-charcoal/60">{g.description}</p>
        </div>
      </div>

      <div
        className="mb-6 border-2 border-duck-yellow bg-duck-yellow/10 p-4"
        style={{ borderRadius: "2px" }}
      >
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Conversion Strategy
        </h3>
        <p className="font-mono text-sm text-charcoal/80">{g.conversionStrategy}</p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Best For
        </h3>
        <p className="font-mono text-sm text-charcoal/70">{g.bestFor}</p>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Key Metrics to Track
        </h3>
        <div className="flex flex-wrap gap-2">
          {g.keyMetrics.map((metric) => (
            <span
              key={metric}
              className="border-2 border-charcoal/20 bg-cream px-2 py-1 font-mono text-xs text-charcoal/70"
              style={{ borderRadius: "2px" }}
            >
              {metric}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
            Strengths
          </h3>
          <ul className="space-y-2">
            {g.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-primary" strokeWidth={2} />
                <span className="font-mono text-sm text-charcoal/80">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-coral">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {g.weaknesses.map((w) => (
              <li key={w} className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 border border-coral bg-coral/20" />
                <span className="font-mono text-sm text-charcoal/80">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SANDBOX PAGE
// ============================================================================

export default function FullLandingViewsSandbox() {
  const [variation, setVariation] = useState<LandingVariation>("product-led")

  const variations: { id: LandingVariation; label: string; desc: string }[] = [
    { id: "product-led", label: "Product-Led", desc: "Try before signup" },
    { id: "story-driven", label: "Story", desc: "Emotional narrative" },
    { id: "occasion", label: "Occasion", desc: "Use-case driven" },
    { id: "trust-first", label: "Trust", desc: "Security focus" },
    { id: "social-proof", label: "Social", desc: "Numbers & proof" },
    { id: "urgency", label: "Urgency", desc: "Countdown timers" },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Fixed header */}
      <div className="sticky top-0 z-[200] border-b-2 border-charcoal bg-white p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Full Landing Pages
            </h1>
            <p className="font-mono text-xs text-charcoal/60">
              V3 Design Sandbox - High-Conversion Full Page Variations
            </p>
          </div>

          {/* Variation selector */}
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariation(v.id)}
                className={cn(
                  "flex flex-col items-start border-2 border-charcoal px-3 py-2 transition-all",
                  variation === v.id
                    ? "bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  {v.label}
                </span>
                <span className="font-mono text-[10px] text-charcoal/60">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page preview */}
      <div className="border-b-2 border-charcoal">
        {variation === "product-led" && <ProductLedPage />}
        {variation === "story-driven" && <StoryDrivenPage />}
        {variation === "occasion" && <OccasionDrivenPage />}
        {variation === "trust-first" && <TrustFirstPage />}
        {variation === "social-proof" && <SocialProofPage />}
        {variation === "urgency" && <UrgencyPage />}
      </div>

      {/* Conversion guide section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-teal-primary"
            style={{ borderRadius: "2px" }}
          >
            <Award className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Conversion Strategy Guide
          </h2>
        </div>

        <ConversionGuide variation={variation} />

        {/* Universal conversion principles */}
        <div
          className="mt-8 border-2 border-charcoal bg-charcoal p-6"
          style={{ borderRadius: "2px" }}
        >
          <h3 className="mb-4 font-mono text-lg font-bold uppercase tracking-wide text-white">
            Universal Conversion Principles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Above the Fold
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Clear value proposition in &lt;5 seconds</li>
                <li>• Single primary CTA visible</li>
                <li>• Trust signals near CTA</li>
                <li>• Mobile-first responsive</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Page Flow
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Hero → Social Proof → How It Works</li>
                <li>• Address objections before final CTA</li>
                <li>• Repeat CTA every 2-3 sections</li>
                <li>• End with strong final CTA + trust</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                V3 Design Rules
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Always 2px border-radius</li>
                <li>• Hard offset shadows only</li>
                <li>• Monospace typography throughout</li>
                <li>• Uppercase labels with tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Performance
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• LCP under 2.5 seconds</li>
                <li>• First input delay &lt;100ms</li>
                <li>• Cumulative layout shift &lt;0.1</li>
                <li>• Mobile performance critical</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
