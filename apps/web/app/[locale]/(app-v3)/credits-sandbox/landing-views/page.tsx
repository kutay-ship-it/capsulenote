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
} from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

type HeroVariation = "timeline" | "envelope" | "split" | "story" | "demo"

// ============================================================================
// MOCK DATA
// ============================================================================

const STATS = [
  { label: "Letters Written", value: "10,847" },
  { label: "Delivered On Time", value: "99.9%" },
  { label: "Happy Writers", value: "4,231" },
]

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Received letter after 5 years",
    quote: "Reading my letter from 2019 brought me to tears. I had completely forgotten the dreams I'd written about - and realized I'd achieved most of them.",
    avatar: "SC",
  },
  {
    name: "Marcus Williams",
    role: "Anniversary letter tradition",
    quote: "Every year on our anniversary, my wife and I write letters to ourselves for next year. It's become our favorite tradition.",
    avatar: "MW",
  },
  {
    name: "Elena Rodriguez",
    role: "New Year's reflections",
    quote: "The feeling of receiving a physical letter from past me was indescribable. So much more meaningful than a digital reminder.",
    avatar: "ER",
  },
]

const STORY_CHAPTERS = [
  {
    title: "The Blank Page",
    content: "Sarah sat down on her 25th birthday with a simple question: What do I want future me to know?",
    color: "duck-yellow",
  },
  {
    title: "The Writing",
    content: "She wrote about her fears, her dreams, and the person she hoped to become. No judgment. Just honesty.",
    color: "duck-blue",
  },
  {
    title: "The Seal",
    content: "With a click, the letter was sealed. Set to arrive on her 30th birthday. Then she forgot about it.",
    color: "teal-primary",
  },
  {
    title: "The Wait",
    content: "Five years passed. Jobs changed. Relationships evolved. Life happened. The letter waited patiently.",
    color: "charcoal",
  },
  {
    title: "The Arrival",
    content: "On her 30th birthday, a notification appeared. 'You have a letter from your past self.'",
    color: "coral",
  },
  {
    title: "The Read",
    content: "Tears. Laughter. Pride. Everything 25-year-old Sarah hoped for 30-year-old Sarah - she had become.",
    color: "duck-yellow",
  },
]

const FEATURES = [
  { icon: PenLine, title: "Rich Text Editor", desc: "Write beautifully" },
  { icon: Calendar, title: "Schedule Delivery", desc: "Any future date" },
  { icon: Lock, title: "Encrypted", desc: "Private always" },
  { icon: Mail, title: "Physical Mail", desc: "Real paper letters" },
  { icon: Shield, title: "99.9% Delivery", desc: "Always on time" },
  { icon: Heart, title: "Emotional", desc: "Meaningful moments" },
]

// ============================================================================
// VARIATION 1: IMMERSIVE TIMELINE HERO
// ============================================================================

function TimelineHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const futureOpacity = useTransform(scrollYProgress, [0.7, 1], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const timelineItems = [
    { date: "TODAY", label: "You write a letter", color: "duck-yellow" },
    { date: "1 MONTH", label: "Life continues...", color: "duck-blue" },
    { date: "6 MONTHS", label: "Time passes...", color: "teal-primary" },
    { date: "1 YEAR", label: "Memories fade...", color: "charcoal" },
    { date: "5 YEARS", label: "Everything changes...", color: "coral" },
    { date: "YOUR FUTURE", label: "Your letter arrives", color: "duck-yellow" },
  ]

  return (
    <div ref={containerRef} className="relative min-h-[400vh]">
      {/* Fixed hero content */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-cream">
        {/* TODAY section - fades out */}
        <motion.div
          style={{ opacity, scale }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div
            className="mb-8 border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Begin Your Journey
            </span>
          </div>
          <h1 className="mb-4 text-center font-mono text-5xl font-bold uppercase tracking-tight text-charcoal md:text-7xl">
            Write to
            <br />
            <span className="relative inline-block">
              Future You
              <div className="absolute -bottom-2 left-0 h-3 w-full bg-duck-yellow/50" />
            </span>
          </h1>
          <p className="mb-8 max-w-md text-center font-mono text-lg text-charcoal/70">
            Send letters through time. Receive them when you need them most.
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
              Scroll to travel through time
            </span>
            <ChevronDown className="h-6 w-6 text-charcoal/50" />
          </motion.div>
        </motion.div>

        {/* Timeline cards floating through */}
        <div className="pointer-events-none absolute inset-0">
          {timelineItems.map((item, i) => {
            const start = i * 0.15
            const end = start + 0.2
            const y = useTransform(
              scrollYProgress,
              [start, end],
              ["100vh", "-100vh"]
            )
            const itemOpacity = useTransform(
              scrollYProgress,
              [start, start + 0.05, end - 0.05, end],
              [0, 1, 1, 0]
            )

            return (
              <motion.div
                key={item.date}
                style={{ y, opacity: itemOpacity }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={cn(
                    "border-2 border-charcoal p-6 shadow-[4px_4px_0_theme(colors.charcoal)]",
                    `bg-${item.color}`
                  )}
                  style={{
                    borderRadius: "2px",
                    backgroundColor:
                      item.color === "charcoal"
                        ? "#383838"
                        : item.color === "duck-yellow"
                          ? "#FFDE00"
                          : item.color === "duck-blue"
                            ? "#6FC2FF"
                            : item.color === "teal-primary"
                              ? "#38C1B0"
                              : "#FF7169",
                  }}
                >
                  <div
                    className={cn(
                      "font-mono text-3xl font-bold uppercase",
                      item.color === "charcoal" ? "text-white" : "text-charcoal"
                    )}
                  >
                    {item.date}
                  </div>
                  <div
                    className={cn(
                      "mt-2 font-mono text-sm",
                      item.color === "charcoal"
                        ? "text-white/70"
                        : "text-charcoal/70"
                    )}
                  >
                    {item.label}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* YOUR FUTURE section - fades in */}
        <motion.div
          style={{ opacity: futureOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-teal-primary"
        >
          <div
            className="mb-8 border-2 border-charcoal bg-white px-4 py-2 shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Your Letter Has Arrived
            </span>
          </div>
          <h2 className="mb-6 text-center font-mono text-4xl font-bold uppercase text-charcoal md:text-6xl">
            Hello, Future You
          </h2>
          <p className="mb-8 max-w-md text-center font-mono text-lg text-charcoal/80">
            This is the moment. The letter you wrote years ago is finally here.
          </p>
          <button
            className="flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            Start Writing
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 2: ENVELOPE REVEAL HERO
// ============================================================================

function EnvelopeHero() {
  const [isOpened, setIsOpened] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const handleOpen = () => {
    setIsOpened(true)
    setTimeout(() => setIsRevealed(true), 800)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream px-4 py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              #383838,
              #383838 1px,
              transparent 1px,
              transparent 40px
            ),
            repeating-linear-gradient(
              90deg,
              #383838,
              #383838 1px,
              transparent 1px,
              transparent 40px
            )`,
          }}
        />
      </div>

      <div className="relative">
        {/* Envelope */}
        <motion.div
          animate={isOpened ? { scale: 0.8, y: -50 } : {}}
          transition={{ duration: 0.6 }}
          className="relative cursor-pointer"
          onClick={!isOpened ? handleOpen : undefined}
        >
          {/* Envelope body */}
          <div
            className="relative h-[280px] w-[400px] border-2 border-charcoal bg-duck-yellow shadow-[8px_8px_0_theme(colors.charcoal)] md:h-[320px] md:w-[480px]"
            style={{ borderRadius: "2px" }}
          >
            {/* Envelope flap */}
            <motion.div
              animate={isOpened ? { rotateX: 180 } : {}}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: "top center" }}
              className="absolute -top-[2px] left-0 right-0"
            >
              <svg
                viewBox="0 0 480 160"
                className="w-full"
                style={{ filter: "drop-shadow(0 2px 0 #383838)" }}
              >
                <polygon
                  points="0,0 240,140 480,0"
                  fill="#FFDE00"
                  stroke="#383838"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>

            {/* Wax seal */}
            {!isOpened && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-1/2 top-[60px] z-10 -translate-x-1/2"
              >
                <div
                  className="flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-coral shadow-[2px_2px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Lock className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
              </motion.div>
            )}

            {/* "From: Past You" label */}
            <div className="absolute bottom-6 left-6">
              <div className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                From:
              </div>
              <div className="font-mono text-lg font-bold text-charcoal">
                Past You
              </div>
            </div>

            {/* "To: Future You" label */}
            <div className="absolute bottom-6 right-6 text-right">
              <div className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                To:
              </div>
              <div className="font-mono text-lg font-bold text-charcoal">
                Future You
              </div>
            </div>

            {/* Stamp */}
            <div
              className="absolute right-6 top-6 rotate-6 border-2 border-charcoal bg-white p-3"
              style={{ borderRadius: "2px" }}
            >
              <Clock className="h-8 w-8 text-charcoal" strokeWidth={2} />
            </div>
          </div>

          {!isOpened && (
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-6 text-center"
            >
              <span className="font-mono text-sm text-charcoal/60">
                Click to open your letter
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Letter content that reveals */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div
                className="border-2 border-charcoal bg-white p-8 shadow-[6px_6px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <div className="mb-6 text-center">
                  <div
                    className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-3 py-1"
                    style={{ borderRadius: "2px" }}
                  >
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Your Letter Awaits
                    </span>
                  </div>
                  <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-charcoal">
                    Write to
                    <br />
                    Future You
                  </h2>
                </div>
                <p className="mb-6 text-center font-mono text-sm text-charcoal/70">
                  Send letters through time. Schedule delivery for any future
                  date. Receive them when you need them most.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    <PenLine className="h-4 w-4" strokeWidth={2} />
                    Write Letter
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-2 border-2 border-charcoal bg-white px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 3: SPLIT PAST/FUTURE HERO
// ============================================================================

function SplitHero() {
  const [hoveredSide, setHoveredSide] = useState<"past" | "future" | null>(null)

  return (
    <div className="relative flex min-h-screen">
      {/* LEFT: TODAY (Past) */}
      <motion.div
        animate={{
          flex: hoveredSide === "future" ? 0.3 : hoveredSide === "past" ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-center overflow-hidden bg-duck-yellow"
        onMouseEnter={() => setHoveredSide("past")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="relative z-10 px-8 py-20 text-center">
          <div
            className="mb-6 inline-block border-2 border-charcoal bg-white px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Today
            </span>
          </div>
          <h2 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-charcoal md:text-5xl">
            Write
            <br />
            Your
            <br />
            Letter
          </h2>
          <p className="mb-8 font-mono text-sm text-charcoal/70">
            Pour your heart out.
            <br />
            Share your dreams.
            <br />
            Capture this moment.
          </p>
          <button
            className="flex items-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-4 w-4" strokeWidth={2} />
            Start Writing
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10 font-mono text-8xl font-bold text-charcoal/10">
          NOW
        </div>
      </motion.div>

      {/* CENTER DIVIDER */}
      <div className="relative z-20 w-1 bg-charcoal">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-charcoal bg-white p-3"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>
      </div>

      {/* RIGHT: FUTURE */}
      <motion.div
        animate={{
          flex: hoveredSide === "past" ? 0.3 : hoveredSide === "future" ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-center overflow-hidden bg-teal-primary"
        onMouseEnter={() => setHoveredSide("future")}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="relative z-10 px-8 py-20 text-center">
          <div
            className="mb-6 inline-block border-2 border-charcoal bg-white px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Future
            </span>
          </div>
          <h2 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-charcoal md:text-5xl">
            Receive
            <br />
            Your
            <br />
            Message
          </h2>
          <p className="mb-8 font-mono text-sm text-charcoal/80">
            A gift from the past.
            <br />
            Delivered on time.
            <br />
            A moment of reflection.
          </p>
          <button
            className="flex items-center gap-2 border-2 border-charcoal bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Inbox className="h-4 w-4" strokeWidth={2} />
            See How It Works
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 right-10 font-mono text-8xl font-bold text-charcoal/10">
          THEN
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================================
// VARIATION 4: STORY-DRIVEN HERO
// ============================================================================

function StoryHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  })

  return (
    <div ref={containerRef} className="relative">
      {/* Story chapters */}
      {STORY_CHAPTERS.map((chapter, i) => {
        const chapterStart = i / STORY_CHAPTERS.length
        const chapterEnd = (i + 1) / STORY_CHAPTERS.length

        return (
          <div
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
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl px-8 text-center"
            >
              {/* Chapter number */}
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

              {/* Chapter title */}
              <h2
                className={cn(
                  "mb-6 font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl",
                  chapter.color === "charcoal" ? "text-white" : "text-charcoal"
                )}
              >
                {chapter.title}
              </h2>

              {/* Chapter content */}
              <p
                className={cn(
                  "font-mono text-lg leading-relaxed",
                  chapter.color === "charcoal"
                    ? "text-white/80"
                    : "text-charcoal/80"
                )}
              >
                {chapter.content}
              </p>

              {/* CTA on last chapter */}
              {i === STORY_CHAPTERS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <button
                    className="flex items-center gap-2 border-2 border-charcoal bg-charcoal px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    <PenLine className="h-4 w-4" strokeWidth={2} />
                    Write Your Own Story
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Story progress indicator */}
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
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
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// VARIATION 5: INTERACTIVE DEMO HERO
// ============================================================================

function DemoHero() {
  const [demoText, setDemoText] = useState("")
  const [isSealing, setIsSealing] = useState(false)
  const [isSealed, setIsSealed] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")

  const handleSeal = () => {
    if (demoText.length < 10) return
    setIsSealing(true)
    setTimeout(() => {
      setIsSealing(false)
      setIsSealed(true)
    }, 1500)
  }

  const reset = () => {
    setDemoText("")
    setIsSealed(false)
    setSelectedDate("")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream px-4 py-20">
      {/* Background decoration */}
      <div className="absolute left-10 top-10">
        <div
          className="h-32 w-32 border-2 border-charcoal/10 bg-duck-yellow/20"
          style={{ borderRadius: "2px" }}
        />
      </div>
      <div className="absolute bottom-20 right-10">
        <div
          className="h-24 w-24 border-2 border-charcoal/10 bg-teal-primary/20"
          style={{ borderRadius: "2px" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Try It Now
            </span>
          </div>
          <h1 className="mb-4 font-mono text-4xl font-bold uppercase tracking-tight text-charcoal md:text-5xl">
            Write to Future You
          </h1>
          <p className="font-mono text-sm text-charcoal/70">
            Experience what it feels like. Write one line to yourself.
          </p>
        </div>

        {/* Demo editor */}
        <AnimatePresence mode="wait">
          {!isSealed ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
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
                    {demoText.length}/200
                  </div>
                </div>

                {/* Text input */}
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value.slice(0, 200))}
                  placeholder="Dear Future Me..."
                  className="min-h-[120px] w-full resize-none border-none bg-transparent font-mono text-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none"
                  disabled={isSealing}
                />

                {/* Date picker */}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="h-4 w-4 text-charcoal"
                      strokeWidth={2}
                    />
                    <span className="font-mono text-xs text-charcoal/70">
                      Deliver on:
                    </span>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border-2 border-charcoal bg-white px-3 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-duck-yellow"
                      style={{ borderRadius: "2px" }}
                    >
                      <option value="">Select date...</option>
                      <option value="1m">1 month from now</option>
                      <option value="6m">6 months from now</option>
                      <option value="1y">1 year from now</option>
                      <option value="5y">5 years from now</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSeal}
                    disabled={demoText.length < 10 || !selectedDate || isSealing}
                    className={cn(
                      "flex items-center gap-2 border-2 border-charcoal px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                      demoText.length >= 10 && selectedDate
                        ? "bg-duck-yellow text-charcoal hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                        : "cursor-not-allowed bg-charcoal/10 text-charcoal/50"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {isSealing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
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
                  </button>
                </div>

                {demoText.length < 10 && demoText.length > 0 && (
                  <p className="mt-2 font-mono text-xs text-coral">
                    Write at least 10 characters to seal your letter
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
                className="border-2 border-charcoal bg-teal-primary p-8 text-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-4 flex justify-center"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-white"
                    style={{ borderRadius: "50%" }}
                  >
                    <Check className="h-8 w-8 text-teal-primary" strokeWidth={3} />
                  </div>
                </motion.div>
                <h3 className="mb-2 font-mono text-2xl font-bold uppercase text-charcoal">
                  Letter Sealed!
                </h3>
                <p className="mb-6 font-mono text-sm text-charcoal/80">
                  Your letter is locked and scheduled for delivery.
                  <br />
                  This is exactly what Capsule Note does.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 border-2 border-charcoal bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    Try Again
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                    Sign Up Free
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { icon: Lock, label: "Encrypted" },
            { icon: Mail, label: "Email or Paper" },
            { icon: Clock, label: "Always On Time" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 border-2 border-charcoal/20 bg-white px-3 py-1.5"
              style={{ borderRadius: "2px" }}
            >
              <feature.icon
                className="h-3.5 w-3.5 text-charcoal/60"
                strokeWidth={2}
              />
              <span className="font-mono text-xs text-charcoal/60">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BEST PRACTICES GUIDE
// ============================================================================

function BestPracticesGuide({ variation }: { variation: HeroVariation }) {
  const practices = {
    timeline: {
      title: "Immersive Timeline",
      description:
        "Full-screen scroll experience that takes visitors through time itself.",
      when: "When you want to create an emotional, memorable first impression that differentiates from typical SaaS landing pages.",
      strengths: [
        "Unique, memorable experience",
        "Creates emotional resonance with time concept",
        "Strong brand differentiation",
        "Interactive engagement increases time on page",
      ],
      weaknesses: [
        "Scroll-jacking can frustrate users",
        "Higher engineering complexity",
        "May confuse users looking for quick info",
        "Performance-sensitive implementation",
      ],
      bestFor: "Brand-focused marketing, product launches, emotional storytelling",
    },
    envelope: {
      title: "Envelope Reveal",
      description:
        "Interactive envelope that opens to reveal the value proposition.",
      when: "When you want to use a direct product metaphor that makes the concept immediately understandable.",
      strengths: [
        "Perfect product metaphor",
        "Delightful micro-interaction",
        "Creates anticipation and curiosity",
        "Easy to understand the concept",
      ],
      weaknesses: [
        "May feel gimmicky to some users",
        "Delays content access by one click",
        "Animation can feel slow on repeat visits",
        "Less scannable for returning visitors",
      ],
      bestFor: "First-time visitors, explaining the concept, playful brands",
    },
    split: {
      title: "Split Past/Future",
      description:
        "Dramatic split-screen showing the duality of writing today and receiving later.",
      when: "When you want to visually communicate the before/after transformation of the product experience.",
      strengths: [
        "Clear visual storytelling",
        "Strong use of brand colors",
        "Balanced presentation of both sides",
        "Interactive hover effect creates engagement",
      ],
      weaknesses: [
        "Can feel dated if poorly executed",
        "Less content space per section",
        "Mobile adaptation challenges",
        "May not be as memorable as other options",
      ],
      bestFor: "Feature comparison, transformation narrative, conversion focus",
    },
    story: {
      title: "Story-Driven",
      description:
        "Narrative scroll following one person's journey through the product.",
      when: "When you want to leverage the power of storytelling to create emotional connection and social proof.",
      strengths: [
        "Humans are wired for stories",
        "Creates strong emotional resonance",
        "Shows real use case from start to finish",
        "Built-in social proof through narrative",
      ],
      weaknesses: [
        "Longer time to reach CTA",
        "Less scannable for quick visitors",
        "Requires compelling storytelling",
        "May feel slow for impatient users",
      ],
      bestFor: "Building emotional connection, explaining complex value, retention",
    },
    demo: {
      title: "Interactive Demo",
      description:
        "Let visitors experience writing a mini-letter right in the hero.",
      when: "When you want to reduce friction to understanding by letting users experience the product immediately.",
      strengths: [
        "Immediate product experience",
        "Reduces explanation burden",
        "Creates micro-commitment",
        "Shows product value through doing",
      ],
      weaknesses: [
        "Higher engineering complexity",
        "Mobile input challenges",
        "May distract from conversion",
        "Privacy concerns with sample content",
      ],
      bestFor: "Product-led growth, reducing signup friction, showcasing simplicity",
    },
  }

  const p = practices[variation]

  return (
    <div
      className="border-2 border-charcoal bg-white p-6"
      style={{ borderRadius: "2px" }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Sparkles className="h-5 w-5 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            {p.title}
          </h2>
          <p className="font-mono text-xs text-charcoal/60">{p.description}</p>
        </div>
      </div>

      <div
        className="mb-6 border-2 border-duck-yellow bg-duck-yellow/10 p-4"
        style={{ borderRadius: "2px" }}
      >
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          When to Use
        </h3>
        <p className="font-mono text-sm text-charcoal/80">{p.when}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
            Strengths
          </h3>
          <ul className="space-y-2">
            {p.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-primary"
                  strokeWidth={2}
                />
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
            {p.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 border border-coral bg-coral/20" />
                <span className="font-mono text-sm text-charcoal/80">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t-2 border-charcoal/20 pt-4">
        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
          Best For
        </h3>
        <p className="font-mono text-sm text-charcoal/70">{p.bestFor}</p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN SANDBOX PAGE
// ============================================================================

export default function LandingViewsSandbox() {
  const [variation, setVariation] = useState<HeroVariation>("demo")

  const variations: { id: HeroVariation; label: string; desc: string }[] = [
    { id: "timeline", label: "Timeline", desc: "Scroll through time" },
    { id: "envelope", label: "Envelope", desc: "Open to reveal" },
    { id: "split", label: "Split", desc: "Past / Future" },
    { id: "story", label: "Story", desc: "Narrative scroll" },
    { id: "demo", label: "Demo", desc: "Try it now" },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Fixed header */}
      <div className="sticky top-0 z-50 border-b-2 border-charcoal bg-white p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Landing Page Heroes
            </h1>
            <p className="font-mono text-xs text-charcoal/60">
              V3 Design Sandbox - Hero Section Variations
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
                <span className="font-mono text-[10px] text-charcoal/60">
                  {v.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero preview */}
      <div className="border-b-2 border-charcoal">
        {variation === "timeline" && <TimelineHero />}
        {variation === "envelope" && <EnvelopeHero />}
        {variation === "split" && <SplitHero />}
        {variation === "story" && <StoryHero />}
        {variation === "demo" && <DemoHero />}
      </div>

      {/* Best practices section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-teal-primary"
            style={{ borderRadius: "2px" }}
          >
            <Quote className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Design Rationale
          </h2>
        </div>

        <BestPracticesGuide variation={variation} />

        {/* Common best practices */}
        <div
          className="mt-8 border-2 border-charcoal bg-charcoal p-6"
          style={{ borderRadius: "2px" }}
        >
          <h3 className="mb-4 font-mono text-lg font-bold uppercase tracking-wide text-white">
            Universal Landing Page Principles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                V3 Design Constraints
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Always 2px border-radius</li>
                <li>• Hard offset shadows only</li>
                <li>• Monospace typography</li>
                <li>• Uppercase labels with tracking</li>
                <li>• No gradients or blurs</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Conversion Optimization
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Clear value proposition above fold</li>
                <li>• Single primary CTA per section</li>
                <li>• Social proof near CTAs</li>
                <li>• Mobile-first responsive design</li>
                <li>• Performance under 3s LCP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
