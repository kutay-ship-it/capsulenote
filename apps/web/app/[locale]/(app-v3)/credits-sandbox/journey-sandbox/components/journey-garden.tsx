"use client"

import { useMemo, useState } from "react"
import { format, differenceInDays, differenceInMonths } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { STATUS_CONFIG } from "./types"
import { EmptyState } from "./empty-state"
import {
  Leaf,
  Sprout,
  TreeDeciduous,
  Flower2,
  Sun,
  Droplets,
  ArrowRight,
} from "lucide-react"

interface JourneyGardenProps {
  letters: JourneyLetter[]
}

/**
 * JOURNEY GARDEN - "The Growth"
 *
 * A gamified visualization where letters grow like plants in a garden.
 * Delivered letters bloom above ground, sealed letters wait as bulbs below.
 *
 * Design Philosophy:
 * - Growth mindset, nurturing metaphor
 * - Plant height based on time since delivery (taller = older memories)
 * - Underground "bulbs" for future letters
 * - Progress indicators and visual achievements
 * - Brutalist pixel-art style plants
 */
export function JourneyGarden({ letters }: JourneyGardenProps) {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null)
  const now = new Date()

  // Process letters into garden elements
  const { plants, bulbs, stats } = useMemo(() => {
    const delivered: (JourneyLetter & { height: number; growthLevel: string })[] = []
    const waiting: JourneyLetter[] = []

    letters.forEach((letter) => {
      const deliverTime = new Date(letter.deliverAt).getTime()
      if (deliverTime <= now.getTime() && letter.status === "sent") {
        // Calculate growth based on time since delivery
        const monthsSinceDelivery = differenceInMonths(now, new Date(letter.deliverAt))
        const height = Math.min(100, 20 + monthsSinceDelivery * 10) // 20-100%

        let growthLevel = "seedling"
        if (height > 80) growthLevel = "tree"
        else if (height > 60) growthLevel = "flower"
        else if (height > 40) growthLevel = "sapling"

        delivered.push({
          ...letter,
          height,
          growthLevel,
        })
      } else {
        waiting.push(letter)
      }
    })

    // Sort by delivery date
    delivered.sort(
      (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )
    waiting.sort(
      (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )

    return {
      plants: delivered,
      bulbs: waiting,
      stats: {
        totalPlants: delivered.length,
        totalBulbs: waiting.length,
        avgHeight:
          delivered.length > 0
            ? Math.round(delivered.reduce((sum, p) => sum + p.height, 0) / delivered.length)
            : 0,
      },
    }
  }, [letters, now])

  if (letters.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <EmptyState variant="illustrated" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <Leaf className="h-5 w-5 text-teal-primary" strokeWidth={1.5} />
          <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
            Your Memory Garden
          </h2>
        </div>
        <p className="font-mono text-xs text-charcoal/50">
          Watch your letters bloom and grow over time
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <StatBadge
          icon={<Flower2 className="h-4 w-4" />}
          label="Blooming"
          value={stats.totalPlants}
          color="teal"
        />
        <StatBadge
          icon={<Sprout className="h-4 w-4" />}
          label="Planted"
          value={stats.totalBulbs}
          color="blue"
        />
        <StatBadge
          icon={<Sun className="h-4 w-4" />}
          label="Avg Growth"
          value={`${stats.avgHeight}%`}
          color="yellow"
        />
      </motion.div>

      {/* Garden Visualization */}
      <div
        className="relative border-4 border-charcoal bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden shadow-[6px_6px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px", minHeight: "500px" }}
      >
        {/* Sky Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Sun */}
          <motion.div
            className="absolute top-8 right-8"
            animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="w-16 h-16 bg-duck-yellow border-4 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] flex items-center justify-center"
              style={{ borderRadius: "2px" }}
            >
              <Sun className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Clouds */}
          <motion.div
            className="absolute top-12 left-[20%]"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cloud />
          </motion.div>
          <motion.div
            className="absolute top-20 left-[60%]"
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cloud size="sm" />
          </motion.div>
        </div>

        {/* Ground Level (NOW) */}
        <div
          className="absolute left-0 right-0 h-2 bg-charcoal"
          style={{ bottom: "40%" }}
        >
          {/* NOW Badge */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="relative">
              <div
                className="absolute top-1 left-1 w-full h-full bg-charcoal"
                style={{ borderRadius: "2px" }}
              />
              <div
                className="relative bg-teal-primary border-2 border-charcoal px-4 py-1.5"
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Ground Level
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Above Ground - Plants (Delivered Letters) */}
        <div
          className="absolute left-0 right-0 px-4 flex items-end justify-center gap-4 flex-wrap"
          style={{ bottom: "40%", paddingBottom: "12px" }}
        >
          {plants.map((plant, index) => (
            <GardenPlant
              key={plant.id}
              plant={plant}
              index={index}
              total={plants.length}
              isSelected={selectedPlant === plant.id}
              onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
            />
          ))}

          {plants.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="font-mono text-xs text-charcoal/50">
                Your first bloom awaits. Delivered letters will grow here.
              </p>
            </motion.div>
          )}
        </div>

        {/* Below Ground - Bulbs (Waiting Letters) */}
        <div
          className="absolute left-0 right-0 bg-gradient-to-b from-amber-100 to-amber-200"
          style={{ top: "60%", bottom: 0 }}
        >
          {/* Soil Texture */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-charcoal"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          {/* Bulbs */}
          <div className="relative px-4 pt-8 flex items-start justify-center gap-6 flex-wrap">
            {bulbs.map((bulb, index) => (
              <GardenBulb
                key={bulb.id}
                bulb={bulb}
                index={index}
                isSelected={selectedPlant === bulb.id}
                onClick={() => setSelectedPlant(selectedPlant === bulb.id ? null : bulb.id)}
              />
            ))}

            {bulbs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="font-mono text-xs text-charcoal/50">
                  No seeds waiting. Schedule a letter to plant your next memory.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Selected Plant Detail */}
        <AnimatePresence>
          {selectedPlant && (
            <PlantDetail
              letter={[...plants, ...bulbs].find((l) => l.id === selectedPlant)!}
              onClose={() => setSelectedPlant(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <div className="flex items-center gap-2 font-mono text-xs text-charcoal/60">
          <Sprout className="h-3 w-3 text-teal-primary" />
          <span>Seedling (0-3 months)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-charcoal/60">
          <Leaf className="h-3 w-3 text-teal-primary" />
          <span>Sapling (3-6 months)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-charcoal/60">
          <Flower2 className="h-3 w-3 text-teal-primary" />
          <span>Flower (6-12 months)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-charcoal/60">
          <TreeDeciduous className="h-3 w-3 text-teal-primary" />
          <span>Tree (12+ months)</span>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4 border-t-2 border-dashed border-charcoal/10"
      >
        <p className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Journey Garden - Growth Visualization
        </p>
      </motion.div>
    </div>
  )
}

// Stat Badge Component
function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: "teal" | "blue" | "yellow"
}) {
  const colors = {
    teal: "bg-teal-primary text-white",
    blue: "bg-duck-blue text-charcoal",
    yellow: "bg-duck-yellow text-charcoal",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-2 border-charcoal px-3 py-2 shadow-[2px_2px_0_theme(colors.charcoal)]",
        colors[color]
      )}
      style={{ borderRadius: "2px" }}
    >
      {icon}
      <span className="font-mono text-xs font-bold uppercase tracking-wider">{value}</span>
      <span className="font-mono text-[10px] opacity-70">{label}</span>
    </div>
  )
}

// Cloud Component
function Cloud({ size = "md" }: { size?: "sm" | "md" }) {
  const scale = size === "sm" ? 0.7 : 1

  return (
    <div style={{ transform: `scale(${scale})` }}>
      <div className="flex gap-0">
        <div
          className="w-8 h-6 bg-white border-2 border-charcoal"
          style={{ borderRadius: "2px" }}
        />
        <div
          className="w-10 h-8 bg-white border-2 border-charcoal -ml-2 -mt-2"
          style={{ borderRadius: "2px" }}
        />
        <div
          className="w-6 h-5 bg-white border-2 border-charcoal -ml-2 mt-1"
          style={{ borderRadius: "2px" }}
        />
      </div>
    </div>
  )
}

// Garden Plant Component (Above Ground)
function GardenPlant({
  plant,
  index,
  total,
  isSelected,
  onClick,
}: {
  plant: JourneyLetter & { height: number; growthLevel: string }
  index: number
  total: number
  isSelected: boolean
  onClick: () => void
}) {
  const stemHeight = 30 + plant.height * 0.7 // 30-100px

  const PlantIcon =
    plant.growthLevel === "tree"
      ? TreeDeciduous
      : plant.growthLevel === "flower"
        ? Flower2
        : plant.growthLevel === "sapling"
          ? Leaf
          : Sprout

  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0, originY: 1 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Plant Head */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          "border-2 border-charcoal p-2 transition-all",
          isSelected
            ? "bg-teal-primary text-white shadow-[4px_4px_0_theme(colors.charcoal)]"
            : "bg-teal-primary/80 text-white shadow-[2px_2px_0_theme(colors.charcoal)] group-hover:shadow-[3px_3px_0_theme(colors.charcoal)]"
        )}
        style={{ borderRadius: "2px" }}
      >
        <PlantIcon className="h-6 w-6" strokeWidth={1.5} />
      </motion.div>

      {/* Stem (Stacked Rectangles for Brutalist Effect) */}
      <div className="flex flex-col items-center" style={{ height: `${stemHeight}px` }}>
        {[...Array(Math.ceil(stemHeight / 10))].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2.5 bg-teal-primary/60 border border-charcoal/30 -mt-px"
            style={{ borderRadius: "1px" }}
          />
        ))}
      </div>

      {/* Title Tooltip on Hover */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : -5 }}
        className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <div
          className="bg-white border-2 border-charcoal px-2 py-1 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-[10px] font-bold text-charcoal line-clamp-1 max-w-[120px]">
            {plant.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Garden Bulb Component (Below Ground)
function GardenBulb({
  bulb,
  index,
  isSelected,
  onClick,
}: {
  bulb: JourneyLetter
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  const daysUntil = differenceInDays(new Date(bulb.deliverAt), new Date())

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Root Lines */}
      <div className="flex gap-1 mb-1">
        <div className="w-0.5 h-3 bg-charcoal/30 rotate-[-20deg]" />
        <div className="w-0.5 h-4 bg-charcoal/30" />
        <div className="w-0.5 h-3 bg-charcoal/30 rotate-[20deg]" />
      </div>

      {/* Bulb */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        animate={{
          boxShadow: isSelected
            ? "0 0 15px rgba(111, 194, 255, 0.5)"
            : "0 0 0 rgba(111, 194, 255, 0)",
        }}
        className={cn(
          "border-2 border-charcoal p-3 transition-all",
          isSelected
            ? "bg-duck-blue shadow-[3px_3px_0_theme(colors.charcoal)]"
            : "bg-duck-blue/70 shadow-[2px_2px_0_theme(colors.charcoal)] group-hover:bg-duck-blue"
        )}
        style={{ borderRadius: "2px" }}
      >
        <Droplets className="h-5 w-5 text-charcoal" strokeWidth={1.5} />
      </motion.div>

      {/* Days Until Badge */}
      <div className="mt-2">
        <span
          className="font-mono text-[9px] font-bold text-charcoal/70 bg-white/50 px-1.5 py-0.5 border border-charcoal/30"
          style={{ borderRadius: "2px" }}
        >
          {daysUntil <= 0 ? "Soon!" : `${daysUntil}d`}
        </span>
      </div>
    </motion.div>
  )
}

// Plant Detail Popup
function PlantDetail({
  letter,
  onClose,
}: {
  letter: JourneyLetter
  onClose: () => void
}) {
  const config = STATUS_CONFIG[letter.status]
  const isDelivered = letter.status === "sent"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-40"
    >
      <div
        className="bg-white border-4 border-charcoal p-4 shadow-[6px_6px_0_theme(colors.charcoal)] relative"
        style={{ borderRadius: "2px" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-coral border-2 border-charcoal text-white font-mono font-bold flex items-center justify-center hover:bg-coral/90 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          ×
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "p-2 border-2 border-charcoal flex-shrink-0",
              config.badgeBg
            )}
            style={{ borderRadius: "2px" }}
          >
            {isDelivered ? (
              <Flower2 className={cn("h-6 w-6", config.badgeText)} />
            ) : (
              <Droplets className={cn("h-6 w-6", config.badgeText)} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-mono text-sm font-bold text-charcoal line-clamp-1">
              {letter.title}
            </h4>
            {letter.preview && (
              <p className="font-mono text-[10px] text-charcoal/50 line-clamp-2 mt-1">
                {letter.preview}
              </p>
            )}
            <div className="mt-2 font-mono text-[10px] text-charcoal/60">
              {isDelivered ? "Delivered" : "Scheduled"}:{" "}
              {format(letter.deliverAt, "MMM d, yyyy")}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 text-charcoal/30 flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  )
}
