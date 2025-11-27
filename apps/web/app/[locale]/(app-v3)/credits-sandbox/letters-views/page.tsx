"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Mail,
  Clock,
  FileEdit,
  ArrowRight,
  Lock,
  Stamp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Inbox,
  Send,
  PenLine,
  LayoutGrid,
  Timer,
  Package,
} from "lucide-react"
import { format, addDays, subDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"

// ============================================================================
// TYPES
// ============================================================================

type LettersVariation = "envelope" | "timeline" | "kanban" | "magazine" | "calendar"
type LetterStatus = "draft" | "scheduled" | "delivered"
type LetterCount = "empty" | "few" | "many"

interface MockLetter {
  id: string
  title: string
  preview: string
  status: LetterStatus
  createdAt: Date
  deliverAt?: Date
  deliveredAt?: Date
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockLetters(count: LetterCount): MockLetter[] {
  const now = new Date()

  if (count === "empty") return []

  const titles = [
    "Dear Future Me",
    "New Year Reflections",
    "Birthday Wishes",
    "Life Update",
    "Goals for Next Year",
    "A Moment of Gratitude",
    "Lessons Learned",
    "Dreams and Hopes",
    "Anniversary Letter",
    "Quarter Review",
    "Summer Memories",
    "Winter Thoughts",
  ]

  const previews = [
    "I hope you're doing well. Right now, I'm sitting at my desk wondering what life will be like when you read this...",
    "Today was one of those days where everything felt possible. I want to remember this feeling...",
    "If you're reading this, it means we made it through another year. I'm proud of you for...",
    "I've been thinking about what matters most, and I realized that the small moments are...",
    "Remember when you thought you couldn't do it? Well, look at you now. You're stronger than...",
    "The sunset today was incredible. I took a photo but I know it won't capture the feeling...",
  ]

  const letterConfigs = count === "few" ? [
    { status: "draft" as LetterStatus, daysOffset: 0 },
    { status: "scheduled" as LetterStatus, daysOffset: 30 },
    { status: "scheduled" as LetterStatus, daysOffset: 90 },
    { status: "delivered" as LetterStatus, daysOffset: -60, deliveredDaysAgo: 5 },
    { status: "delivered" as LetterStatus, daysOffset: -180, deliveredDaysAgo: 30 },
  ] : [
    { status: "draft" as LetterStatus, daysOffset: 0 },
    { status: "draft" as LetterStatus, daysOffset: -1 },
    { status: "draft" as LetterStatus, daysOffset: -3 },
    { status: "scheduled" as LetterStatus, daysOffset: 7 },
    { status: "scheduled" as LetterStatus, daysOffset: 14 },
    { status: "scheduled" as LetterStatus, daysOffset: 30 },
    { status: "scheduled" as LetterStatus, daysOffset: 60 },
    { status: "scheduled" as LetterStatus, daysOffset: 180 },
    { status: "scheduled" as LetterStatus, daysOffset: 365 },
    { status: "delivered" as LetterStatus, daysOffset: -7, deliveredDaysAgo: 2 },
    { status: "delivered" as LetterStatus, daysOffset: -30, deliveredDaysAgo: 5 },
    { status: "delivered" as LetterStatus, daysOffset: -60, deliveredDaysAgo: 10 },
    { status: "delivered" as LetterStatus, daysOffset: -90, deliveredDaysAgo: 20 },
    { status: "delivered" as LetterStatus, daysOffset: -180, deliveredDaysAgo: 60 },
    { status: "delivered" as LetterStatus, daysOffset: -365, deliveredDaysAgo: 180 },
  ]

  return letterConfigs.map((config, i) => ({
    id: `letter-${i}`,
    title: titles[i % titles.length]!,
    preview: previews[i % previews.length]!,
    status: config.status,
    createdAt: subDays(now, Math.abs(config.daysOffset) + 10),
    deliverAt: config.status === "scheduled" ? addDays(now, config.daysOffset) :
               config.status === "delivered" ? subDays(now, config.deliveredDaysAgo || 0) : undefined,
    deliveredAt: config.status === "delivered" ? subDays(now, config.deliveredDaysAgo || 0) : undefined,
  }))
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

function getStatusConfig(status: LetterStatus) {
  switch (status) {
    case "draft":
      return {
        color: "duck-yellow",
        bgHex: "#FFDE00",
        borderColor: "border-duck-yellow",
        label: "Draft",
        icon: FileEdit,
      }
    case "scheduled":
      return {
        color: "duck-blue",
        bgHex: "#6FC2FF",
        borderColor: "border-duck-blue",
        label: "Scheduled",
        icon: Clock,
      }
    case "delivered":
      return {
        color: "teal-primary",
        bgHex: "#38C1B0",
        borderColor: "border-teal-primary",
        label: "Delivered",
        icon: Mail,
      }
  }
}

// ============================================================================
// VARIATION 1: ENVELOPE STACK
// ============================================================================

function EnvelopeStackView({ letters }: { letters: MockLetter[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (letters.length === 0) {
    return <EmptyState message="Your mailbox is empty. Start writing!" />
  }

  // Group by status
  const drafts = letters.filter(l => l.status === "draft")
  const scheduled = letters.filter(l => l.status === "scheduled")
  const delivered = letters.filter(l => l.status === "delivered")

  const EnvelopeCard = ({ letter, index }: { letter: MockLetter; index: number }) => {
    const config = getStatusConfig(letter.status)
    const isHovered = hoveredId === letter.id

    return (
      <motion.div
        key={letter.id}
        className="relative cursor-pointer"
        style={{
          marginTop: index === 0 ? 0 : -60,
          zIndex: isHovered ? 100 : letters.length - index,
        }}
        animate={{
          y: isHovered ? -20 : 0,
          rotate: isHovered ? 0 : (index % 2 === 0 ? -1 : 1),
        }}
        transition={{ type: "spring", stiffness: 300 }}
        onMouseEnter={() => setHoveredId(letter.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Envelope body */}
        <div
          className={cn(
            "relative h-32 w-52 border-2 border-charcoal",
            letter.status === "draft" ? "bg-white" : "bg-duck-yellow",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Envelope flap for sealed letters */}
          {letter.status === "scheduled" && (
            <div className="absolute -top-[2px] left-0 right-0">
              <svg viewBox="0 0 208 60" className="w-full">
                <polygon
                  points="0,0 104,50 208,0"
                  fill="#FFDE00"
                  stroke="#383838"
                  strokeWidth="2"
                />
              </svg>
              {/* Wax seal */}
              <div
                className="absolute left-1/2 top-6 -translate-x-1/2 flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-coral"
                style={{ borderRadius: "50%" }}
              >
                <Lock className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
            </div>
          )}

          {/* Letter sticking out for drafts */}
          {letter.status === "draft" && (
            <div
              className="absolute -top-8 left-4 right-4 h-12 border-2 border-b-0 border-charcoal bg-white px-3 pt-2"
              style={{ borderRadius: "2px 2px 0 0" }}
            >
              <div className="font-mono text-[10px] text-charcoal/60 line-clamp-1">
                {letter.title}
              </div>
            </div>
          )}

          {/* Opened envelope for delivered */}
          {letter.status === "delivered" && (
            <div className="absolute -top-[2px] left-0 right-0">
              <svg viewBox="0 0 208 40" className="w-full" style={{ transform: "rotateX(180deg)" }}>
                <polygon
                  points="0,40 104,0 208,40"
                  fill="#FFDE00"
                  stroke="#383838"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}

          {/* Status stamp */}
          <div
            className="absolute bottom-3 right-3 rotate-[-8deg] border-2 border-charcoal bg-white px-2 py-1"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-charcoal">
              {config.label}
            </span>
          </div>

          {/* Date postmark */}
          {letter.deliverAt && (
            <div className="absolute bottom-3 left-3 font-mono text-[8px] text-charcoal/50">
              {format(letter.deliverAt, "MMM d, yyyy")}
            </div>
          )}
        </div>

        {/* Hover preview card */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-full top-0 ml-4 z-50"
            >
              <div
                className="w-64 border-2 border-charcoal bg-white p-4 shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <h4 className="mb-2 font-mono text-sm font-bold text-charcoal">
                  {letter.title}
                </h4>
                <p className="font-mono text-xs text-charcoal/60 line-clamp-3">
                  {letter.preview}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-charcoal" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal">
                    Open Letter
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Section: Drafts */}
      {drafts.length > 0 && (
        <div>
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            On Your Desk ({drafts.length})
          </h3>
          <div className="flex flex-wrap gap-8">
            {drafts.map((letter, i) => (
              <EnvelopeCard key={letter.id} letter={letter} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Scheduled */}
      {scheduled.length > 0 && (
        <div>
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Sealed & Waiting ({scheduled.length})
          </h3>
          <div className="flex flex-wrap gap-8">
            {scheduled.map((letter, i) => (
              <EnvelopeCard key={letter.id} letter={letter} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Delivered */}
      {delivered.length > 0 && (
        <div>
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Opened & Read ({delivered.length})
          </h3>
          <div className="flex flex-wrap gap-8">
            {delivered.map((letter, i) => (
              <EnvelopeCard key={letter.id} letter={letter} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VARIATION 2: TIMELINE RIVER
// ============================================================================

function TimelineRiverView({ letters }: { letters: MockLetter[] }) {
  if (letters.length === 0) {
    return <EmptyState message="Your timeline is empty. Start your journey!" />
  }

  // Sort by deliver date (future first, then past)
  const scheduled = letters
    .filter(l => l.status === "scheduled")
    .sort((a, b) => (a.deliverAt?.getTime() || 0) - (b.deliverAt?.getTime() || 0))

  const drafts = letters.filter(l => l.status === "draft")

  const delivered = letters
    .filter(l => l.status === "delivered")
    .sort((a, b) => (b.deliveredAt?.getTime() || 0) - (a.deliveredAt?.getTime() || 0))

  const TimelineNode = ({ letter, side }: { letter: MockLetter; side: "left" | "right" }) => {
    const config = getStatusConfig(letter.status)

    return (
      <motion.div
        initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "relative flex items-start gap-4",
          side === "right" && "flex-row-reverse"
        )}
      >
        {/* Content card */}
        <div
          className={cn(
            "w-64 border-2 p-4 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_theme(colors.charcoal)]",
            config.borderColor,
            "bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Status badge */}
          <div
            className={cn(
              "mb-2 inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
              letter.status === "delivered" ? "text-white" : "text-charcoal"
            )}
            style={{ borderRadius: "2px", backgroundColor: config.bgHex }}
          >
            <config.icon className="h-3 w-3" strokeWidth={2} />
            {config.label}
          </div>

          <h4 className="mb-1 font-mono text-sm font-bold text-charcoal line-clamp-1">
            {letter.title}
          </h4>
          <p className="mb-3 font-mono text-xs text-charcoal/60 line-clamp-2">
            {letter.preview}
          </p>

          {letter.deliverAt && (
            <div className="font-mono text-[10px] text-charcoal/50">
              {letter.status === "scheduled"
                ? `Arrives ${format(letter.deliverAt, "MMM d, yyyy")}`
                : `Delivered ${format(letter.deliverAt, "MMM d, yyyy")}`
              }
            </div>
          )}
        </div>

        {/* Node connector */}
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center border-2 border-charcoal",
              letter.status === "scheduled" && "bg-duck-blue",
              letter.status === "draft" && "bg-duck-yellow",
              letter.status === "delivered" && "bg-teal-primary"
            )}
            style={{ borderRadius: "50%" }}
          >
            <config.icon className={cn(
              "h-5 w-5",
              letter.status === "delivered" ? "text-white" : "text-charcoal"
            )} strokeWidth={2} />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Central timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-charcoal/20" />

      {/* NOW marker */}
      <div className="relative mb-8 flex justify-center">
        <div
          className="z-10 border-2 border-charcoal bg-charcoal px-4 py-2 shadow-[2px_2px_0_theme(colors.duck-yellow)]"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            NOW
          </span>
        </div>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
              In Progress
            </span>
          </div>
          <div className="flex flex-col items-center gap-4">
            {drafts.map((letter, i) => (
              <TimelineNode key={letter.id} letter={letter} side={i % 2 === 0 ? "left" : "right"} />
            ))}
          </div>
        </div>
      )}

      {/* FUTURE marker */}
      {scheduled.length > 0 && (
        <>
          <div className="relative my-8 flex justify-center">
            <div
              className="z-10 border-2 border-charcoal bg-duck-blue px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                FUTURE
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {scheduled.map((letter, i) => (
              <div key={letter.id} className="flex justify-center">
                <TimelineNode letter={letter} side={i % 2 === 0 ? "left" : "right"} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* PAST marker */}
      {delivered.length > 0 && (
        <>
          <div className="relative my-8 flex justify-center">
            <div
              className="z-10 border-2 border-charcoal bg-teal-primary px-4 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                DELIVERED
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {delivered.map((letter, i) => (
              <div key={letter.id} className="flex justify-center">
                <TimelineNode letter={letter} side={i % 2 === 0 ? "left" : "right"} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// VARIATION 3: KANBAN LANES
// ============================================================================

function KanbanLanesView({ letters }: { letters: MockLetter[] }) {
  const drafts = letters.filter(l => l.status === "draft")
  const scheduled = letters.filter(l => l.status === "scheduled")
  const delivered = letters.filter(l => l.status === "delivered")

  const lanes = [
    { id: "writing", title: "Writing", color: "duck-yellow", bgHex: "#FFDE00", letters: drafts, icon: FileEdit },
    { id: "waiting", title: "Waiting", color: "duck-blue", bgHex: "#6FC2FF", letters: scheduled, icon: Clock },
    { id: "arrived", title: "Arrived", color: "teal-primary", bgHex: "#38C1B0", letters: delivered, icon: Mail },
  ]

  const KanbanCard = ({ letter }: { letter: MockLetter }) => {
    const config = getStatusConfig(letter.status)

    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          "border-2 border-charcoal bg-white p-3 cursor-pointer",
          "shadow-[2px_2px_0_theme(colors.charcoal)]",
          "transition-shadow hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
        )}
        style={{ borderRadius: "2px" }}
      >
        <h4 className="mb-1 font-mono text-xs font-bold text-charcoal line-clamp-1">
          {letter.title}
        </h4>
        <p className="mb-2 font-mono text-[10px] text-charcoal/60 line-clamp-2">
          {letter.preview}
        </p>
        {letter.deliverAt && (
          <div className="flex items-center gap-1 font-mono text-[10px] text-charcoal/50">
            <Timer className="h-3 w-3" />
            {format(letter.deliverAt, "MMM d")}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {lanes.map((lane) => (
        <div key={lane.id} className="flex flex-col">
          {/* Lane header */}
          <div
            className="mb-4 flex items-center justify-between border-2 border-charcoal p-3"
            style={{ borderRadius: "2px", backgroundColor: lane.bgHex }}
          >
            <div className="flex items-center gap-2">
              <lane.icon className={cn(
                "h-4 w-4",
                lane.id === "arrived" ? "text-white" : "text-charcoal"
              )} strokeWidth={2} />
              <span className={cn(
                "font-mono text-xs font-bold uppercase tracking-wider",
                lane.id === "arrived" ? "text-white" : "text-charcoal"
              )}>
                {lane.title}
              </span>
            </div>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center font-mono text-xs font-bold",
                lane.id === "arrived" ? "bg-white text-charcoal" : "bg-charcoal text-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              {lane.letters.length}
            </div>
          </div>

          {/* Lane content */}
          <div
            className="flex-1 space-y-3 border-2 border-dashed border-charcoal/20 p-3 min-h-[300px]"
            style={{ borderRadius: "2px" }}
          >
            {lane.letters.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <span className="font-mono text-xs text-charcoal/30">
                  No letters here
                </span>
              </div>
            ) : (
              lane.letters.map((letter) => (
                <KanbanCard key={letter.id} letter={letter} />
              ))
            )}
          </div>

          {/* Lane progress */}
          <div className="mt-3">
            <div className="h-2 w-full border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${letters.length > 0 ? (lane.letters.length / letters.length) * 100 : 0}%`,
                  backgroundColor: lane.bgHex,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// VARIATION 4: MAGAZINE SPREAD
// ============================================================================

function MagazineSpreadView({ letters }: { letters: MockLetter[] }) {
  if (letters.length === 0) {
    return <EmptyState message="Your magazine is waiting for stories!" />
  }

  // Featured letter is the most relevant (next scheduled or most recent draft)
  const scheduled = letters.filter(l => l.status === "scheduled").sort((a, b) =>
    (a.deliverAt?.getTime() || 0) - (b.deliverAt?.getTime() || 0)
  )
  const drafts = letters.filter(l => l.status === "draft")

  const featured = scheduled[0] || drafts[0] || letters[0]
  const otherLetters = letters.filter(l => l.id !== featured?.id)

  const ArticleCard = ({ letter, size = "small" }: { letter: MockLetter; size?: "small" | "medium" }) => {
    const config = getStatusConfig(letter.status)

    return (
      <motion.article
        whileHover={{ y: -4 }}
        className={cn(
          "border-2 border-charcoal bg-white overflow-hidden cursor-pointer",
          "shadow-[3px_3px_0_theme(colors.charcoal)]",
          "transition-shadow hover:shadow-[6px_6px_0_theme(colors.charcoal)]"
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Color bar top */}
        <div className="h-2" style={{ backgroundColor: config.bgHex }} />

        <div className={cn("p-4", size === "medium" && "p-5")}>
          {/* Category/Status */}
          <div className="mb-2 flex items-center gap-2">
            <config.icon className="h-3 w-3 text-charcoal/50" strokeWidth={2} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
              {config.label}
            </span>
          </div>

          {/* Headline */}
          <h3 className={cn(
            "mb-2 font-mono font-bold text-charcoal",
            size === "medium" ? "text-lg" : "text-sm"
          )}>
            {letter.title}
          </h3>

          {/* Lede */}
          <p className={cn(
            "font-mono text-charcoal/60",
            size === "medium" ? "text-sm line-clamp-3" : "text-xs line-clamp-2"
          )}>
            {letter.preview}
          </p>

          {/* Dateline */}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[10px] text-charcoal/40">
              {format(letter.createdAt, "MMM d, yyyy")}
            </span>
            <ArrowRight className="h-3 w-3 text-charcoal/40" />
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <div className="space-y-6">
      {/* Masthead */}
      <div className="flex items-center justify-between border-b-4 border-charcoal pb-4">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-charcoal">
          Your Letters
        </h2>
        <span className="font-mono text-xs text-charcoal/50">
          {format(new Date(), "MMMM yyyy")} Edition
        </span>
      </div>

      {/* Featured + Grid layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Featured article - spans 2 columns */}
        {featured && (
          <div className="md:col-span-2">
            <motion.article
              whileHover={{ y: -4 }}
              className="h-full border-2 border-charcoal bg-white overflow-hidden cursor-pointer shadow-[4px_4px_0_theme(colors.charcoal)] transition-shadow hover:shadow-[8px_8px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              {/* Color header */}
              <div
                className="h-3"
                style={{ backgroundColor: getStatusConfig(featured.status).bgHex }}
              />

              <div className="p-6">
                {/* Featured badge */}
                <div
                  className="mb-4 inline-block border-2 border-charcoal bg-duck-yellow px-3 py-1"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                    Featured
                  </span>
                </div>

                <h2 className="mb-3 font-mono text-2xl font-bold uppercase tracking-tight text-charcoal">
                  {featured.title}
                </h2>

                <p className="mb-4 font-mono text-sm text-charcoal/70 leading-relaxed">
                  {featured.preview}
                </p>

                <div className="flex items-center justify-between border-t-2 border-dashed border-charcoal/20 pt-4">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = getStatusConfig(featured.status)
                      return (
                        <>
                          <config.icon className="h-4 w-4 text-charcoal/50" />
                          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
                            {config.label}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                  <span className="font-mono text-xs text-charcoal/40">
                    {featured.deliverAt ? format(featured.deliverAt, "MMM d, yyyy") : format(featured.createdAt, "MMM d")}
                  </span>
                </div>
              </div>
            </motion.article>
          </div>
        )}

        {/* Sidebar articles */}
        <div className="space-y-4">
          {otherLetters.slice(0, 3).map((letter) => (
            <ArticleCard key={letter.id} letter={letter} size="small" />
          ))}
        </div>
      </div>

      {/* More articles grid */}
      {otherLetters.length > 3 && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-0.5 bg-charcoal/10" />
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40">
              More Letters
            </span>
            <div className="flex-1 h-0.5 bg-charcoal/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherLetters.slice(3).map((letter) => (
              <ArticleCard key={letter.id} letter={letter} size="small" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// VARIATION 5: CALENDAR MOSAIC
// ============================================================================

function CalendarMosaicView({ letters }: { letters: MockLetter[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get letters for each day
  const getLettersForDay = (day: Date) => {
    return letters.filter(letter => {
      const letterDate = letter.deliverAt || letter.createdAt
      return format(letterDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    })
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all hover:bg-charcoal hover:text-white"
          style={{ borderRadius: "2px" }}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>

        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all hover:bg-charcoal hover:text-white"
          style={{ borderRadius: "2px" }}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Calendar grid */}
      <div
        className="border-2 border-charcoal bg-white overflow-hidden"
        style={{ borderRadius: "2px" }}
      >
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b-2 border-charcoal bg-charcoal">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month start */}
          {[...Array(monthStart.getDay())].map((_, i) => (
            <div
              key={`empty-start-${i}`}
              className="min-h-[100px] border-b border-r border-charcoal/20 bg-charcoal/5 p-2"
            />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const dayLetters = getLettersForDay(day)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] border-b border-r border-charcoal/20 p-2 transition-colors",
                  isCurrentDay && "bg-duck-yellow/20",
                  !isSameMonth(day, currentMonth) && "bg-charcoal/5"
                )}
              >
                {/* Day number */}
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-sm font-bold",
                      isCurrentDay ? "text-charcoal" : "text-charcoal/60"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {isCurrentDay && (
                    <div
                      className="h-2 w-2 bg-coral"
                      style={{ borderRadius: "50%" }}
                    />
                  )}
                </div>

                {/* Letter indicators */}
                <div className="space-y-1">
                  {dayLetters.slice(0, 3).map((letter) => {
                    const config = getStatusConfig(letter.status)
                    return (
                      <div
                        key={letter.id}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 cursor-pointer transition-all hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
                        )}
                        style={{ borderRadius: "2px", backgroundColor: config.bgHex }}
                      >
                        <config.icon className={cn(
                          "h-2.5 w-2.5",
                          letter.status === "delivered" ? "text-white" : "text-charcoal"
                        )} strokeWidth={2} />
                        <span className={cn(
                          "font-mono text-[8px] font-bold uppercase truncate",
                          letter.status === "delivered" ? "text-white" : "text-charcoal"
                        )}>
                          {letter.title.slice(0, 12)}
                        </span>
                      </div>
                    )
                  })}
                  {dayLetters.length > 3 && (
                    <span className="font-mono text-[10px] text-charcoal/40">
                      +{dayLetters.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Empty cells for days after month end */}
          {[...Array(6 - monthEnd.getDay())].map((_, i) => (
            <div
              key={`empty-end-${i}`}
              className="min-h-[100px] border-b border-r border-charcoal/20 bg-charcoal/5 p-2"
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        {[
          { status: "draft", label: "Drafts" },
          { status: "scheduled", label: "Scheduled" },
          { status: "delivered", label: "Delivered" },
        ].map((item) => {
          const config = getStatusConfig(item.status as LetterStatus)
          return (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 border border-charcoal"
                style={{ backgroundColor: config.bgHex, borderRadius: "2px" }}
              />
              <span className="font-mono text-xs text-charcoal/60">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-charcoal/30 bg-duck-cream/50"
      style={{ borderRadius: "2px" }}
    >
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        <Inbox className="h-8 w-8 text-charcoal/40" strokeWidth={2} />
      </div>
      <p className="font-mono text-sm text-charcoal/60">{message}</p>
      <button
        className="mt-4 flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <PenLine className="h-4 w-4" strokeWidth={2} />
        Write Your First Letter
      </button>
    </div>
  )
}

// ============================================================================
// BEST PRACTICES GUIDE
// ============================================================================

function BestPracticesGuide({ variation }: { variation: LettersVariation }) {
  const practices = {
    envelope: {
      title: "Envelope Stack",
      description: "Physical mail metaphor with stacking envelopes and wax seals.",
      when: "When you want to create a nostalgic, tangible feeling that matches the product's letter-writing metaphor.",
      strengths: [
        "Perfect product metaphor (real mail)",
        "Visual status distinction (sealed vs open)",
        "Creates emotional connection",
        "Unique and memorable experience",
      ],
      weaknesses: [
        "Limited scalability (100+ letters unwieldy)",
        "Harder to scan quickly for specific letter",
        "More horizontal space needed",
        "Complex hover interactions on mobile",
      ],
      bestFor: "Users with fewer letters, emotional emphasis, first-time experience",
    },
    timeline: {
      title: "Timeline River",
      description: "Vertical timeline flowing from NOW through FUTURE to PAST.",
      when: "When time is the primary organizing dimension and you want to emphasize the journey aspect.",
      strengths: [
        "Time dimension is primary and visible",
        "Creates anticipation for scheduled letters",
        "Natural mental model (past → present → future)",
        "Shows gaps in letter writing practice",
      ],
      weaknesses: [
        "Long scrolling for many letters",
        "Less efficient for quick access",
        "Complex layout on narrow screens",
        "May feel sparse with few letters",
      ],
      bestFor: "Journey visualization, time-based thinking, building anticipation",
    },
    kanban: {
      title: "Kanban Lanes",
      description: "Three-column layout showing letter lifecycle stages.",
      when: "When users want to see their letter 'pipeline' and track progress across stages.",
      strengths: [
        "Clear lifecycle visibility at a glance",
        "Productivity-style organization",
        "Easy to see bottlenecks (too many drafts)",
        "Familiar pattern for power users",
      ],
      weaknesses: [
        "Less emotional, more transactional",
        "Horizontal scroll issues on mobile",
        "May feel like a task manager",
        "Not as personal/meaningful",
      ],
      bestFor: "Power users, productivity-focused, those building habits",
    },
    magazine: {
      title: "Magazine Spread",
      description: "Newspaper-style layout with featured letter and article grid.",
      when: "When you want to create a discovery experience with visual hierarchy.",
      strengths: [
        "Visual hierarchy guides attention",
        "Discovery mode (browsing vs searching)",
        "Personal magazine feel",
        "Makes letters feel like content",
      ],
      weaknesses: [
        "Unpredictable layout",
        "Harder to find specific letters",
        "More visual complexity",
        "Featured selection logic needed",
      ],
      bestFor: "Content discovery, casual browsing, highlighting recent activity",
    },
    calendar: {
      title: "Calendar Mosaic",
      description: "Monthly calendar view showing letter distribution over time.",
      when: "When time-based planning and habit tracking are priorities.",
      strengths: [
        "Time-based organization native",
        "Encourages consistent writing habit",
        "Easy to plan delivery dates",
        "Shows activity patterns",
      ],
      weaknesses: [
        "Sparse when few letters",
        "Rigid monthly structure",
        "May feel clinical/functional",
        "Less letter detail visible",
      ],
      bestFor: "Planners, habit builders, those with many scheduled letters",
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

export default function LettersViewsSandbox() {
  const [variation, setVariation] = useState<LettersVariation>("envelope")
  const [letterCount, setLetterCount] = useState<LetterCount>("few")
  const letters = generateMockLetters(letterCount)

  const variations: { id: LettersVariation; label: string; desc: string }[] = [
    { id: "envelope", label: "Envelope", desc: "Mail stack" },
    { id: "timeline", label: "Timeline", desc: "Time river" },
    { id: "kanban", label: "Kanban", desc: "Lifecycle lanes" },
    { id: "magazine", label: "Magazine", desc: "Article spread" },
    { id: "calendar", label: "Calendar", desc: "Monthly mosaic" },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Fixed header */}
      <div className="sticky top-0 z-50 border-b-2 border-charcoal bg-white p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              Letters List Views
            </h1>
            <p className="font-mono text-xs text-charcoal/60">
              V3 Design Sandbox - Letters Inbox Variations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Letter count toggle */}
            <div className="flex items-center gap-2">
              {(["empty", "few", "many"] as const).map((count) => (
                <button
                  key={count}
                  onClick={() => setLetterCount(count)}
                  className={cn(
                    "border-2 border-charcoal px-3 py-1 font-mono text-xs uppercase transition-all",
                    letterCount === count
                      ? "bg-teal-primary text-white"
                      : "bg-white text-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {count === "empty" ? "0" : count === "few" ? "5" : "15"}
                </button>
              ))}
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
      </div>

      {/* Letters preview */}
      <div className="border-b-2 border-charcoal px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {variation === "envelope" && <EnvelopeStackView letters={letters} />}
          {variation === "timeline" && <TimelineRiverView letters={letters} />}
          {variation === "kanban" && <KanbanLanesView letters={letters} />}
          {variation === "magazine" && <MagazineSpreadView letters={letters} />}
          {variation === "calendar" && <CalendarMosaicView letters={letters} />}
        </div>
      </div>

      {/* Best practices section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-teal-primary"
            style={{ borderRadius: "2px" }}
          >
            <LayoutGrid className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Design Rationale
          </h2>
        </div>

        <BestPracticesGuide variation={variation} />

        {/* Letters UX Tips */}
        <div
          className="mt-8 border-2 border-charcoal bg-charcoal p-6"
          style={{ borderRadius: "2px" }}
        >
          <h3 className="mb-4 font-mono text-lg font-bold uppercase tracking-wide text-white">
            Letters Inbox UX Principles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Emotional Considerations
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Letters are precious, not just data</li>
                <li>• Sealed letters build anticipation</li>
                <li>• Delivered letters are moments</li>
                <li>• Empty states should inspire writing</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-duck-yellow">
                Functional Requirements
              </h4>
              <ul className="space-y-1.5 font-mono text-sm text-white/80">
                <li>• Quick access to drafts</li>
                <li>• Clear status visibility</li>
                <li>• Delivery date prominent</li>
                <li>• Search/filter for many letters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
