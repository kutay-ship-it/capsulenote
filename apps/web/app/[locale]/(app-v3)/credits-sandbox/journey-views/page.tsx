"use client"

import { useState, useMemo } from "react"
import { format, differenceInDays, addDays, subDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Orbit,
  Waves,
  Grid3X3,
  Columns,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

interface MockDelivery {
  id: string
  letterId: string
  title: string
  deliverAt: Date
  status: "scheduled" | "sent"
  createdAt: Date
}

type Variation = "orbit" | "river" | "calendar" | "split" | "chapter"
type LetterCount = 0 | 5 | 15 | 50

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockDeliveries(count: LetterCount): MockDelivery[] {
  if (count === 0) return []

  const now = new Date()
  const deliveries: MockDelivery[] = []
  const titles = [
    "Dear Future Me",
    "Reflections on Today",
    "A Year From Now",
    "Remember This Moment",
    "Goals & Dreams",
    "Letter to Myself",
    "Time Capsule",
    "Notes from the Past",
    "What I Learned",
    "Hopes for Tomorrow",
    "Gratitude List",
    "Life Update",
    "Birthday Wishes",
    "New Year Thoughts",
    "Quarter Review",
  ]

  // Generate a mix of past and future deliveries
  for (let i = 0; i < count; i++) {
    const isPast = i < count * 0.4 // 40% are delivered
    const daysOffset = isPast
      ? -Math.floor(Math.random() * 365 * 2) - 1 // 1-730 days ago
      : Math.floor(Math.random() * 365 * 3) + 1 // 1-1095 days ahead

    const deliverAt = isPast ? subDays(now, Math.abs(daysOffset)) : addDays(now, daysOffset)
    const createdAt = subDays(deliverAt, Math.floor(Math.random() * 180) + 30)

    deliveries.push({
      id: `delivery-${i}`,
      letterId: `letter-${i}`,
      title: titles[i % titles.length] ?? "Untitled",
      deliverAt,
      status: isPast ? "sent" : "scheduled",
      createdAt,
    })
  }

  return deliveries.sort((a, b) => a.deliverAt.getTime() - b.deliverAt.getTime())
}

// ============================================================================
// VARIATION 1: ORBIT CONSTELLATION VIEW
// ============================================================================

function OrbitConstellationView({ deliveries }: { deliveries: MockDelivery[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const now = new Date()

  // Calculate positions on concentric rings
  const positionedItems = useMemo(() => {
    return deliveries.map((d, i) => {
      const daysDiff = differenceInDays(d.deliverAt, now)
      const absDays = Math.abs(daysDiff)

      // Determine ring (distance from center)
      let ring: number
      if (absDays <= 7) ring = 1
      else if (absDays <= 30) ring = 2
      else if (absDays <= 90) ring = 3
      else if (absDays <= 365) ring = 4
      else ring = 5

      // Calculate angle (spread items around the ring)
      const ringItems = deliveries.filter((other) => {
        const otherDays = Math.abs(differenceInDays(other.deliverAt, now))
        const otherRing =
          otherDays <= 7 ? 1 : otherDays <= 30 ? 2 : otherDays <= 90 ? 3 : otherDays <= 365 ? 4 : 5
        return otherRing === ring
      })
      const indexInRing = ringItems.findIndex((r) => r.id === d.id)
      const angleStep = (2 * Math.PI) / Math.max(ringItems.length, 1)
      const angle = angleStep * indexInRing - Math.PI / 2 // Start from top

      // Past items on left half, future on right half
      const adjustedAngle = daysDiff < 0 ? Math.PI - angle : angle

      return {
        ...d,
        ring,
        angle: adjustedAngle,
        daysDiff,
      }
    })
  }, [deliveries])

  const ringRadii = [0, 60, 110, 160, 210, 260]
  const ringLabels = ["", "1 Week", "1 Month", "3 Months", "1 Year", "5+ Years"]

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <div
          className="flex h-20 w-20 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-6"
          style={{ borderRadius: "2px" }}
        >
          <Orbit className="h-10 w-10 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <h3 className="font-mono text-lg font-bold uppercase text-charcoal mb-2">
          Your Constellation Awaits
        </h3>
        <p className="font-mono text-sm text-charcoal/60 max-w-xs">
          Write your first letter to add a star to your journey
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
      {/* Concentric Rings */}
      {ringRadii.slice(1).map((radius, i) => (
        <div
          key={i}
          className="absolute border-2 border-dashed border-charcoal/10"
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: "50%",
          }}
        >
          {/* Ring Label */}
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cream px-2 font-mono text-[10px] uppercase tracking-wider text-charcoal/40"
          >
            {ringLabels[i + 1]}
          </span>
        </div>
      ))}

      {/* NOW Center */}
      <motion.div
        className="absolute z-20 flex flex-col items-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className="w-16 h-16 bg-teal-primary border-2 border-teal-primary flex items-center justify-center"
          style={{ borderRadius: "50%" }}
        >
          <span className="font-mono text-xs font-bold uppercase text-white">Now</span>
        </div>
      </motion.div>

      {/* Past/Future Labels */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2">
        <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40 writing-mode-vertical">
          ← Past
        </span>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40 writing-mode-vertical">
          Future →
        </span>
      </div>

      {/* Letter Nodes */}
      {positionedItems.map((item) => {
        const radius = ringRadii[item.ring] ?? 60
        const x = Math.cos(item.angle) * radius
        const y = Math.sin(item.angle) * radius
        const isSent = item.status === "sent"
        const isHovered = hoveredId === item.id

        return (
          <motion.div
            key={item.id}
            className="absolute z-10"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isHovered ? 1.2 : 1 }}
            transition={{ delay: Math.random() * 0.3 }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Connection Line to Center */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                width: 2,
                height: radius,
                transform: `rotate(${item.angle + Math.PI / 2}rad) translateX(-50%)`,
                transformOrigin: "top center",
              }}
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2={radius}
                stroke={isSent ? "rgba(56, 193, 176, 0.3)" : "rgba(56, 56, 56, 0.15)"}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Node */}
            <div
              className={cn(
                "w-10 h-10 border-2 flex items-center justify-center cursor-pointer transition-all",
                isSent
                  ? "border-teal-primary bg-teal-primary/10"
                  : "border-charcoal bg-white",
                isHovered && "shadow-[4px_4px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isSent ? (
                <Mail className="w-4 h-4 text-teal-primary" strokeWidth={2} />
              ) : (
                <Lock className="w-4 h-4 text-charcoal/50" strokeWidth={2} />
              )}
            </div>

            {/* Tooltip on Hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border-2 border-charcoal p-3 z-50"
                  style={{ borderRadius: "2px" }}
                >
                  <p className="font-mono text-xs font-bold text-charcoal line-clamp-1">
                    {item.title}
                  </p>
                  <p className="font-mono text-[10px] text-charcoal/60 mt-1">
                    {format(item.deliverAt, "MMM d, yyyy")}
                  </p>
                  <span
                    className={cn(
                      "inline-block mt-2 px-2 py-0.5 font-mono text-[9px] uppercase",
                      isSent ? "bg-teal-primary/10 text-teal-primary" : "bg-charcoal/10 text-charcoal"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {isSent ? "Delivered" : `${Math.abs(item.daysDiff)}d away`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================================================
// VARIATION 2: VERTICAL RIVER VIEW
// ============================================================================

function VerticalRiverView({ deliveries }: { deliveries: MockDelivery[] }) {
  const now = new Date()

  // Separate past and future
  const pastDeliveries = deliveries.filter((d) => d.status === "sent").reverse()
  const futureDeliveries = deliveries.filter((d) => d.status === "scheduled")

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-6"
          style={{ borderRadius: "2px" }}
        >
          <Waves className="h-10 w-10 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <h3 className="font-mono text-lg font-bold uppercase text-charcoal mb-2">
          Start Your River Journey
        </h3>
        <p className="font-mono text-sm text-charcoal/60 max-w-xs">
          Write your first letter to begin the flow
        </p>
      </div>
    )
  }

  return (
    <div className="relative py-8">
      {/* River Path Background */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-charcoal/10 -translate-x-1/2" />

      {/* Past Section */}
      {pastDeliveries.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-charcoal/20" />
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
              Delivered Letters
            </span>
            <div className="h-px flex-1 bg-charcoal/20" />
          </div>

          <div className="space-y-6">
            {pastDeliveries.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex items-center gap-4",
                  i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                )}
              >
                {/* Card */}
                <div
                  className="flex-1 max-w-xs border-2 border-teal-primary bg-white p-4 shadow-[2px_2px_0_theme(colors.charcoal)] cursor-pointer hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)] transition-all"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-teal-primary">
                      {format(d.deliverAt, "MMM d, yyyy")}
                    </span>
                    <Mail className="w-4 h-4 text-teal-primary" strokeWidth={2} />
                  </div>
                  <h4 className="font-mono text-sm font-bold text-charcoal line-clamp-2">
                    {d.title}
                  </h4>
                </div>

                {/* River Node */}
                <div
                  className="w-4 h-4 bg-teal-primary border-2 border-white flex-shrink-0"
                  style={{ borderRadius: "50%" }}
                />

                {/* Spacer */}
                <div className="flex-1 max-w-xs" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NOW Section */}
      <div className="relative py-12 my-8">
        <motion.div
          className="flex flex-col items-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Boat Shape */}
          <div
            className="relative bg-teal-primary border-2 border-teal-primary px-8 py-3"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              You Are Here
            </span>
            {/* Boat Bottom */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "20px solid transparent",
                borderRight: "20px solid transparent",
                borderTop: "8px solid rgb(56, 193, 176)",
              }}
            />
          </div>
          <span className="mt-4 font-mono text-xs text-charcoal/60">
            {format(now, "MMMM d, yyyy")}
          </span>
        </motion.div>
      </div>

      {/* Future Section */}
      {futureDeliveries.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-charcoal/20" />
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
              Letters In Transit
            </span>
            <div className="h-px flex-1 bg-charcoal/20" />
          </div>

          <div className="space-y-6">
            {futureDeliveries.map((d, i) => {
              const daysUntil = differenceInDays(d.deliverAt, now)
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "flex items-center gap-4",
                    i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Card */}
                  <div
                    className="flex-1 max-w-xs border-2 border-charcoal bg-white p-4 shadow-[2px_2px_0_theme(colors.charcoal)] cursor-pointer hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)] transition-all"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                        {format(d.deliverAt, "MMM d, yyyy")}
                      </span>
                      <Lock className="w-4 h-4 text-charcoal/40" strokeWidth={2} />
                    </div>
                    <h4 className="font-mono text-sm font-bold text-charcoal line-clamp-2">
                      {d.title}
                    </h4>
                    <span className="inline-block mt-2 font-mono text-[10px] text-charcoal/50">
                      {daysUntil} days away
                    </span>
                  </div>

                  {/* River Node */}
                  <div
                    className="w-4 h-4 bg-white border-2 border-charcoal flex-shrink-0"
                    style={{ borderRadius: "50%" }}
                  />

                  {/* Spacer */}
                  <div className="flex-1 max-w-xs" />
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VARIATION 3: CALENDAR HEAT MAP VIEW
// ============================================================================

function CalendarHeatMapView({ deliveries }: { deliveries: MockDelivery[] }) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Get unique years from deliveries
  const years = useMemo(() => {
    const allYears = deliveries.map((d) => d.deliverAt.getFullYear())
    const uniqueYears = [...new Set([...allYears, currentYear])].sort()
    return uniqueYears
  }, [deliveries, currentYear])

  // Group deliveries by month for selected year
  const monthData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDeliveries = deliveries.filter(
        (d) => d.deliverAt.getFullYear() === selectedYear && d.deliverAt.getMonth() === i
      )
      return {
        month: i,
        count: monthDeliveries.length,
        deliveries: monthDeliveries,
      }
    })
    return months
  }, [deliveries, selectedYear])

  const maxCount = Math.max(...monthData.map((m) => m.count), 1)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Stats
  const yearDeliveries = deliveries.filter((d) => d.deliverAt.getFullYear() === selectedYear)
  const deliveredCount = yearDeliveries.filter((d) => d.status === "sent").length
  const scheduledCount = yearDeliveries.filter((d) => d.status === "scheduled").length

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-6"
          style={{ borderRadius: "2px" }}
        >
          <Grid3X3 className="h-10 w-10 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <h3 className="font-mono text-lg font-bold uppercase text-charcoal mb-2">
          No Letters Yet
        </h3>
        <p className="font-mono text-sm text-charcoal/60 max-w-xs">
          Your calendar will fill up as you write letters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center justify-center gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={cn(
              "px-4 py-2 border-2 border-charcoal font-mono text-sm font-bold transition-all",
              selectedYear === year
                ? "bg-duck-yellow"
                : "bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-primary" style={{ borderRadius: "2px" }} />
          <span className="font-mono text-xs text-charcoal">
            {deliveredCount} Delivered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-duck-blue" style={{ borderRadius: "2px" }} />
          <span className="font-mono text-xs text-charcoal">
            {scheduledCount} Scheduled
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {monthData.map((month) => {
          const intensity = month.count / maxCount
          const isCurrentMonth =
            selectedYear === currentYear && month.month === now.getMonth()

          return (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: month.month * 0.05 }}
              className={cn(
                "relative border-2 p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                isCurrentMonth ? "border-teal-primary" : "border-charcoal",
                month.count > 0 ? "bg-white" : "bg-charcoal/5"
              )}
              style={{ borderRadius: "2px" }}
            >
              {/* Month Name */}
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                {monthNames[month.month]}
              </span>

              {/* Heat Indicator */}
              <div className="mt-3 h-2 w-full bg-charcoal/10" style={{ borderRadius: "2px" }}>
                <div
                  className={cn(
                    "h-full transition-all",
                    month.count > 0 ? "bg-teal-primary" : ""
                  )}
                  style={{
                    width: `${intensity * 100}%`,
                    borderRadius: "2px",
                  }}
                />
              </div>

              {/* Count */}
              <span className="block mt-2 font-mono text-lg font-bold text-charcoal">
                {month.count}
              </span>
              <span className="font-mono text-[10px] text-charcoal/50 uppercase">
                {month.count === 1 ? "letter" : "letters"}
              </span>

              {/* Current Month Indicator */}
              {isCurrentMonth && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-primary" style={{ borderRadius: "50%" }} />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 4: SPLIT PAST/FUTURE VIEW
// ============================================================================

function SplitPastFutureView({ deliveries }: { deliveries: MockDelivery[] }) {
  const now = new Date()
  const pastDeliveries = deliveries.filter((d) => d.status === "sent").reverse()
  const futureDeliveries = deliveries.filter((d) => d.status === "scheduled")

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-6"
          style={{ borderRadius: "2px" }}
        >
          <Columns className="h-10 w-10 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <h3 className="font-mono text-lg font-bold uppercase text-charcoal mb-2">
          Past & Future Awaiting
        </h3>
        <p className="font-mono text-sm text-charcoal/60 max-w-xs">
          Your timeline will grow on both sides
        </p>
      </div>
    )
  }

  const CompactCard = ({ delivery, variant }: { delivery: MockDelivery; variant: "past" | "future" }) => {
    const isSent = variant === "past"
    const daysAgo = variant === "past" ? differenceInDays(now, delivery.deliverAt) : differenceInDays(delivery.deliverAt, now)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border-2 bg-white p-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
          isSent ? "border-teal-primary" : "border-charcoal"
        )}
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              isSent ? "text-teal-primary" : "text-charcoal/60"
            )}>
              {format(delivery.deliverAt, "MMM d, yyyy")}
            </span>
            <h4 className="font-mono text-sm font-bold text-charcoal line-clamp-1 mt-1">
              {delivery.title}
            </h4>
          </div>
          {isSent ? (
            <Mail className="w-4 h-4 text-teal-primary flex-shrink-0" strokeWidth={2} />
          ) : (
            <Lock className="w-4 h-4 text-charcoal/40 flex-shrink-0" strokeWidth={2} />
          )}
        </div>
        <span className="font-mono text-[10px] text-charcoal/50 mt-2 block">
          {daysAgo} {variant === "past" ? "days ago" : "days away"}
        </span>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {/* Past Column */}
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 border-2 border-teal-primary bg-teal-primary/10 px-4 py-3"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="w-5 h-5 text-teal-primary" strokeWidth={2} />
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-teal-primary">
              Past
            </span>
            <span className="font-mono text-xs text-teal-primary/70 ml-2">
              {pastDeliveries.length} delivered
            </span>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {pastDeliveries.length === 0 ? (
            <p className="font-mono text-sm text-charcoal/50 text-center py-8">
              No letters delivered yet
            </p>
          ) : (
            pastDeliveries.map((d) => <CompactCard key={d.id} delivery={d} variant="past" />)
          )}
        </div>
      </div>

      {/* Center Divider with NOW */}
      <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center">
        <div className="flex-1 w-px bg-charcoal/20" />
        <div
          className="bg-duck-yellow border-2 border-charcoal px-3 py-2 my-4"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-xs font-bold uppercase">Now</span>
        </div>
        <div className="flex-1 w-px bg-charcoal/20" />
      </div>

      {/* Future Column */}
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 border-2 border-charcoal bg-charcoal/5 px-4 py-3"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="w-5 h-5 text-charcoal" strokeWidth={2} />
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Future
            </span>
            <span className="font-mono text-xs text-charcoal/70 ml-2">
              {futureDeliveries.length} scheduled
            </span>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {futureDeliveries.length === 0 ? (
            <p className="font-mono text-sm text-charcoal/50 text-center py-8">
              No letters scheduled
            </p>
          ) : (
            futureDeliveries.map((d) => <CompactCard key={d.id} delivery={d} variant="future" />)
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 5: CHAPTER BOOK VIEW
// ============================================================================

function ChapterBookView({ deliveries }: { deliveries: MockDelivery[] }) {
  // Group by year
  const chapters = useMemo(() => {
    const grouped: Record<number, MockDelivery[]> = {}
    deliveries.forEach((d) => {
      const year = d.deliverAt.getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(d)
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, items]) => ({
        year: Number(year),
        deliveries: items,
        delivered: items.filter((d) => d.status === "sent").length,
        scheduled: items.filter((d) => d.status === "scheduled").length,
      }))
  }, [deliveries])

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-6"
          style={{ borderRadius: "2px" }}
        >
          <BookOpen className="h-10 w-10 text-charcoal/30" strokeWidth={1.5} />
        </div>
        <h3 className="font-mono text-lg font-bold uppercase text-charcoal mb-2">
          Your Story Begins
        </h3>
        <p className="font-mono text-sm text-charcoal/60 max-w-xs">
          Write your first chapter by sending a letter
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {chapters.map((chapter, chapterIndex) => (
        <motion.div
          key={chapter.year}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: chapterIndex * 0.2 }}
        >
          {/* Chapter Header */}
          <div className="relative mb-6">
            <div className="flex items-end gap-4">
              <span className="font-mono text-6xl md:text-8xl font-black text-charcoal/10">
                {chapter.year}
              </span>
              <div className="pb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
                  Chapter {chapterIndex + 1}
                </span>
                <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                  The Year of {chapter.deliveries.length} {chapter.deliveries.length === 1 ? "Letter" : "Letters"}
                </h2>
              </div>
            </div>

            {/* Chapter Stats */}
            <div className="flex gap-4 mt-4">
              <div
                className="flex items-center gap-2 border-2 border-teal-primary bg-teal-primary/10 px-3 py-1"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="w-3 h-3 text-teal-primary" strokeWidth={2} />
                <span className="font-mono text-xs font-bold text-teal-primary">
                  {chapter.delivered} delivered
                </span>
              </div>
              <div
                className="flex items-center gap-2 border-2 border-charcoal bg-charcoal/5 px-3 py-1"
                style={{ borderRadius: "2px" }}
              >
                <Lock className="w-3 h-3 text-charcoal/60" strokeWidth={2} />
                <span className="font-mono text-xs font-bold text-charcoal">
                  {chapter.scheduled} scheduled
                </span>
              </div>
            </div>
          </div>

          {/* Chapter Letters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapter.deliveries.map((d, i) => {
              const isSent = d.status === "sent"
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: chapterIndex * 0.2 + i * 0.05 }}
                  className={cn(
                    "border-2 bg-white p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                    isSent ? "border-teal-primary" : "border-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Date Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 font-mono text-[10px] font-bold uppercase border-2",
                        isSent
                          ? "border-teal-primary text-teal-primary"
                          : "border-charcoal/30 text-charcoal/60"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      {format(d.deliverAt, "MMM d")}
                    </span>
                    {isSent ? (
                      <Mail className="w-4 h-4 text-teal-primary" strokeWidth={2} />
                    ) : (
                      <Lock className="w-4 h-4 text-charcoal/40" strokeWidth={2} />
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-mono text-sm font-bold text-charcoal line-clamp-2">
                    {d.title}
                  </h4>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-dashed border-charcoal/10">
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-wider",
                        isSent ? "text-teal-primary" : "text-charcoal/50"
                      )}
                    >
                      {isSent ? "Delivered" : "Waiting"}
                    </span>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4",
                        isSent ? "text-teal-primary" : "text-charcoal/40"
                      )}
                      strokeWidth={2}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Chapter Divider */}
          {chapterIndex < chapters.length - 1 && (
            <div className="flex items-center gap-4 mt-12">
              <div className="flex-1 h-px bg-charcoal/10" />
              <Sparkles className="w-5 h-5 text-charcoal/20" strokeWidth={1.5} />
              <div className="flex-1 h-px bg-charcoal/10" />
            </div>
          )}
        </motion.div>
      ))}

      {/* Write Next Chapter CTA */}
      <div
        className="border-2 border-dashed border-charcoal/30 p-8 text-center"
        style={{ borderRadius: "2px" }}
      >
        <p className="font-mono text-sm text-charcoal/60 mb-4">
          What will the next chapter hold?
        </p>
        <button
          className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          Write a New Letter
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const VARIATIONS: { id: Variation; label: string; icon: typeof Orbit; description: string }[] = [
  {
    id: "orbit",
    label: "Orbit",
    icon: Orbit,
    description: "Radial constellation with time as distance from center",
  },
  {
    id: "river",
    label: "River",
    icon: Waves,
    description: "Vertical flow with natural scroll, no hijacking",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Grid3X3,
    description: "Heat map grid showing letter density by month",
  },
  {
    id: "split",
    label: "Split",
    icon: Columns,
    description: "Two-column view: Past on left, Future on right",
  },
  {
    id: "chapter",
    label: "Chapters",
    icon: BookOpen,
    description: "Year-based chapters with stats and storytelling",
  },
]

const LETTER_COUNTS: LetterCount[] = [0, 5, 15, 50]

export default function JourneyViewsSandboxPage() {
  const [variation, setVariation] = useState<Variation>("orbit")
  const [letterCount, setLetterCount] = useState<LetterCount>(15)

  const deliveries = useMemo(() => generateMockDeliveries(letterCount), [letterCount])

  const currentVariation = VARIATIONS.find((v) => v.id === variation)!

  return (
    <div className="container py-12 space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <a
          href="/en/credits-sandbox"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sandbox
        </a>
        <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
          Journey View Variations
        </h1>
        <p className="font-mono text-sm text-charcoal/70 max-w-2xl">
          Design explorations for the journey timeline page. Each variation offers a different
          way to visualize your letter journey through time.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Variation Selector */}
        <div className="flex-1">
          <span className="block font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-3">
            Select Variation
          </span>
          <div className="flex flex-wrap gap-2">
            {VARIATIONS.map((v) => {
              const Icon = v.icon
              const isActive = variation === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setVariation(v.id)}
                  className={cn(
                    "flex items-center gap-2 border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-charcoal bg-duck-yellow text-charcoal"
                      : "border-charcoal bg-white text-charcoal hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {v.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Letter Count Selector */}
        <div>
          <span className="block font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-3">
            Letter Count
          </span>
          <div className="flex gap-2">
            {LETTER_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setLetterCount(count)}
                className={cn(
                  "w-12 h-10 border-2 border-charcoal font-mono text-sm font-bold transition-all",
                  letterCount === count
                    ? "bg-teal-primary text-white"
                    : "bg-white text-charcoal hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variation Description */}
      <div
        className="flex items-center gap-4 border-2 border-charcoal/20 bg-charcoal/5 px-4 py-3"
        style={{ borderRadius: "2px" }}
      >
        <currentVariation.icon className="w-5 h-5 text-charcoal/60" strokeWidth={2} />
        <div>
          <span className="font-mono text-sm font-bold text-charcoal">
            {currentVariation.label} View
          </span>
          <p className="font-mono text-xs text-charcoal/60">
            {currentVariation.description}
          </p>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className="border-2 border-charcoal bg-cream p-6 min-h-[600px]"
        style={{ borderRadius: "2px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${variation}-${letterCount}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {variation === "orbit" && <OrbitConstellationView deliveries={deliveries} />}
            {variation === "river" && <VerticalRiverView deliveries={deliveries} />}
            {variation === "calendar" && <CalendarHeatMapView deliveries={deliveries} />}
            {variation === "split" && <SplitPastFutureView deliveries={deliveries} />}
            {variation === "chapter" && <ChapterBookView deliveries={deliveries} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Best Practices */}
      <div
        className="border-2 border-charcoal bg-white p-6 space-y-6"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Design Rationale
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Orbit className="w-4 h-4 text-charcoal" strokeWidth={2} />
              <h3 className="font-mono text-sm font-bold uppercase text-charcoal">Orbit View</h3>
            </div>
            <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
              <strong>Best for:</strong> Visual thinkers, small collections<br />
              <strong>Strengths:</strong> Spatial awareness, time as distance metaphor<br />
              <strong>Trade-offs:</strong> Complex on mobile, overwhelming with many items
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-charcoal" strokeWidth={2} />
              <h3 className="font-mono text-sm font-bold uppercase text-charcoal">River View</h3>
            </div>
            <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
              <strong>Best for:</strong> Mobile users, relaxed browsing<br />
              <strong>Strengths:</strong> Natural scroll, journey metaphor, accessible<br />
              <strong>Trade-offs:</strong> Less compact, requires more scrolling
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-charcoal" strokeWidth={2} />
              <h3 className="font-mono text-sm font-bold uppercase text-charcoal">Calendar View</h3>
            </div>
            <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
              <strong>Best for:</strong> Data-oriented users, planning<br />
              <strong>Strengths:</strong> Pattern recognition, density at a glance<br />
              <strong>Trade-offs:</strong> Less emotional, abstract visualization
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Columns className="w-4 h-4 text-charcoal" strokeWidth={2} />
              <h3 className="font-mono text-sm font-bold uppercase text-charcoal">Split View</h3>
            </div>
            <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
              <strong>Best for:</strong> Clear mental model, task-oriented<br />
              <strong>Strengths:</strong> Simple, scannable, easy comparison<br />
              <strong>Trade-offs:</strong> Less visual interest, utilitarian
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-charcoal" strokeWidth={2} />
              <h3 className="font-mono text-sm font-bold uppercase text-charcoal">Chapter View</h3>
            </div>
            <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
              <strong>Best for:</strong> Long-term users, reflection<br />
              <strong>Strengths:</strong> Storytelling, emotional, organized<br />
              <strong>Trade-offs:</strong> Requires multiple years of data to shine
            </p>
          </div>

          <div
            className="border-2 border-dashed border-charcoal/20 p-4 flex items-center justify-center"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-xs text-charcoal/40 text-center">
              Recommendation: Offer users a toggle<br />to choose their preferred view
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
