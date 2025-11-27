"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { STATUS_CONFIG } from "./types"
import { LetterNodeCompact } from "./letter-node"
import { EmptyState } from "./empty-state"
import { NowIndicator } from "./now-indicator"
import {
  Mail,
  Lock,
  Clock,
  AlertCircle,
  FileEdit,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
} from "lucide-react"

interface JourneyArchiveProps {
  letters: JourneyLetter[]
}

type FilterOption = "all" | "sent" | "scheduled" | "draft" | "failed"
type SortOption = "date-asc" | "date-desc" | "title"
type ViewMode = "grid" | "list"

const FILTER_OPTIONS: { id: FilterOption; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Grid3X3 className="h-3 w-3" /> },
  { id: "sent", label: "Delivered", icon: <Mail className="h-3 w-3" /> },
  { id: "scheduled", label: "Scheduled", icon: <Clock className="h-3 w-3" /> },
  { id: "draft", label: "Draft", icon: <FileEdit className="h-3 w-3" /> },
  { id: "failed", label: "Failed", icon: <AlertCircle className="h-3 w-3" /> },
]

/**
 * JOURNEY ARCHIVE - "The Filing Cabinet"
 *
 * Dense grid view showing all letters at once.
 * Filterable by status, sortable by date.
 * Compact cards with hover expansion.
 *
 * Design Philosophy:
 * - Power users who want overview and control
 * - Grid layout (3-4 columns on desktop, 1 on mobile)
 * - Filter bar with status buttons
 * - Sort toggle
 * - Hover to reveal preview
 */
export function JourneyArchive({ letters }: JourneyArchiveProps) {
  const [filter, setFilter] = useState<FilterOption>("all")
  const [sort, setSort] = useState<SortOption>("date-desc")
  const [view, setView] = useState<ViewMode>("grid")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const now = new Date()

  // Filter and sort letters
  const filteredLetters = useMemo(() => {
    let result = [...letters]

    // Apply filter
    if (filter !== "all") {
      result = result.filter((l) => l.status === filter)
    }

    // Apply sort
    switch (sort) {
      case "date-asc":
        result.sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime())
        break
      case "date-desc":
        result.sort((a, b) => new Date(b.deliverAt).getTime() - new Date(a.deliverAt).getTime())
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [letters, filter, sort])

  // Stats
  const stats = useMemo(() => {
    return {
      total: letters.length,
      sent: letters.filter((l) => l.status === "sent").length,
      scheduled: letters.filter((l) => l.status === "scheduled" || l.status === "processing").length,
      draft: letters.filter((l) => l.status === "draft").length,
      failed: letters.filter((l) => l.status === "failed").length,
    }
  }, [letters])

  if (letters.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <EmptyState variant="illustrated" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-charcoal/10"
      >
        <div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
            Letter Archive
          </h2>
          <p className="font-mono text-xs text-charcoal/50 mt-1">
            {stats.total} total • {stats.sent} delivered • {stats.scheduled} waiting
          </p>
        </div>

        {/* NOW Badge */}
        <NowIndicator variant="badge" />
      </motion.div>

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-charcoal/40" strokeWidth={2} />
          {FILTER_OPTIONS.map((option) => {
            const count =
              option.id === "all"
                ? stats.total
                : option.id === "scheduled"
                  ? stats.scheduled
                  : stats[option.id as keyof typeof stats] || 0

            return (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "flex items-center gap-1.5 border-2 border-charcoal px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                  filter === option.id
                    ? "bg-charcoal text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal shadow-[1px_1px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {option.icon}
                <span>{option.label}</span>
                <span
                  className={cn(
                    "px-1 py-0.5 text-[9px]",
                    filter === option.id ? "bg-white/20" : "bg-charcoal/10"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort & View Controls */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* Sort Toggle */}
          <button
            onClick={() =>
              setSort((s) =>
                s === "date-desc" ? "date-asc" : s === "date-asc" ? "title" : "date-desc"
              )
            }
            className={cn(
              "flex items-center gap-1.5 border-2 border-charcoal px-2 py-1 bg-white font-mono text-[10px] uppercase tracking-wider transition-all",
              "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
              "shadow-[1px_1px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {sort === "date-desc" ? (
              <SortDesc className="h-3 w-3" />
            ) : sort === "date-asc" ? (
              <SortAsc className="h-3 w-3" />
            ) : (
              <span className="font-bold">A-Z</span>
            )}
            <span>
              {sort === "date-desc" ? "Newest" : sort === "date-asc" ? "Oldest" : "Title"}
            </span>
          </button>

          {/* View Toggle */}
          <div className="flex border-2 border-charcoal overflow-hidden" style={{ borderRadius: "2px" }}>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 transition-colors",
                view === "grid" ? "bg-charcoal text-white" : "bg-white text-charcoal"
              )}
            >
              <Grid3X3 className="h-3 w-3" strokeWidth={2} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 transition-colors border-l-2 border-charcoal",
                view === "list" ? "bg-charcoal text-white" : "bg-white text-charcoal"
              )}
            >
              <List className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Letters Grid/List */}
      <LayoutGroup>
        <motion.div
          layout
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              : "flex flex-col gap-2"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredLetters.map((letter, index) => {
              const config = STATUS_CONFIG[letter.status]
              const isHovered = hoveredId === letter.id

              if (view === "list") {
                // List View - Horizontal Card
                return (
                  <motion.div
                    key={letter.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    onMouseEnter={() => setHoveredId(letter.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "relative border-2 bg-white p-3 transition-all duration-200 cursor-pointer",
                      "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                      "shadow-[2px_2px_0_theme(colors.charcoal)]",
                      config.borderColor
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Indicator */}
                      <div
                        className={cn("w-2 h-2 flex-shrink-0", config.dotColor)}
                        style={{ borderRadius: "50%" }}
                      />

                      {/* Title */}
                      <h5 className="font-mono text-sm font-bold text-charcoal flex-1 truncate">
                        {letter.title}
                      </h5>

                      {/* Date */}
                      <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider flex-shrink-0">
                        {format(letter.deliverAt, "MMM d, yyyy")}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={cn(
                          "px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider flex-shrink-0",
                          config.badgeBg,
                          config.badgeText
                        )}
                        style={{ borderRadius: "2px" }}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Preview on Hover */}
                    <AnimatePresence>
                      {isHovered && letter.preview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="font-mono text-xs text-charcoal/50 mt-2 pt-2 border-t border-dashed border-charcoal/10 line-clamp-2">
                            {letter.preview}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              }

              // Grid View - Compact Card
              return (
                <motion.div
                  key={letter.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  onMouseEnter={() => setHoveredId(letter.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "relative border-2 bg-white p-4 transition-all duration-200 cursor-pointer",
                    "hover:-translate-y-0.5 hover:shadow-[5px_5px_0_theme(colors.charcoal)]",
                    "shadow-[3px_3px_0_theme(colors.charcoal)]",
                    config.borderColor
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Status Badge */}
                  <div
                    className={cn(
                      "absolute -top-2 right-3 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                      config.badgeBg,
                      config.badgeText
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {config.label}
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <h5 className="font-mono text-sm font-bold text-charcoal line-clamp-2 mb-2 min-h-[2.5rem]">
                      {letter.title}
                    </h5>

                    <div className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                      {format(letter.deliverAt, "MMM d, yyyy")}
                    </div>

                    {/* Preview on Hover */}
                    <AnimatePresence>
                      {isHovered && letter.preview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-dashed border-charcoal/10 mt-2 pt-2">
                            <p className="font-mono text-[10px] text-charcoal/50 line-clamp-3">
                              {letter.preview}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Empty Filter State */}
      {filteredLetters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="font-mono text-sm text-charcoal/50">
            No letters match this filter
          </p>
          <button
            onClick={() => setFilter("all")}
            className="font-mono text-xs text-teal-primary uppercase tracking-wider mt-2 hover:underline"
          >
            Clear filter
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-4 border-t-2 border-dashed border-charcoal/10"
      >
        <p className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Journey Archive - Power User View
        </p>
      </motion.div>
    </div>
  )
}
