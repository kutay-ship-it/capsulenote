"use client"

import { useState, useEffect } from "react"
import { FileEdit, Clock, Mail, Inbox, LayoutGrid, List, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { LetterCardV3, LetterCardV3Skeleton, type ViewMode } from "./letter-card-v3"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"

export type LetterFilter = "all" | "drafts" | "scheduled" | "delivered"

const VIEW_MODE_STORAGE_KEY = "letters-view-mode"

// Icon configuration for tabs
const TAB_ICONS: Record<LetterFilter, LucideIcon> = {
  all: Inbox,
  drafts: FileEdit,
  scheduled: Clock,
  delivered: Mail,
}

/**
 * All letters grouped by filter - prefetched on server for instant tab switching
 */
export interface LettersByFilter {
  all: LetterWithPreview[]
  drafts: LetterWithPreview[]
  scheduled: LetterWithPreview[]
  delivered: LetterWithPreview[]
}

interface LettersListV3Props {
  lettersByFilter: LettersByFilter
  counts: {
    all: number
    drafts: number
    scheduled: number
    delivered: number
  }
  initialFilter: LetterFilter
}

// Filter values for iteration
const FILTER_VALUES: LetterFilter[] = ["all", "drafts", "scheduled", "delivered"]

export function LettersListV3({
  lettersByFilter,
  counts,
  initialFilter,
}: LettersListV3Props) {
  const t = useTranslations("letters")

  // Local state for instant tab switching - no server roundtrip
  const [activeFilter, setActiveFilter] = useState<LetterFilter>(initialFilter)

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Load saved view preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      if (saved === "grid" || saved === "list") {
        setViewMode(saved)
      }
    } catch {
      // localStorage not available (private browsing, SSR, etc.)
      // Default to grid view - no action needed
    }
  }, [])

  const handleViewModeChange = (value: string) => {
    if (value === "grid" || value === "list") {
      setViewMode(value)
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, value)
      } catch {
        // localStorage not available - preference won't persist
        // but UI will still work for this session
      }
    }
  }

  const handleFilterChange = (filter: string) => {
    const newFilter = filter as LetterFilter
    setActiveFilter(newFilter)

    // Update URL without navigation for shareability
    // Uses replaceState to avoid polluting browser history
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (newFilter === "all") {
        url.searchParams.delete("filter")
      } else {
        url.searchParams.set("filter", newFilter)
      }
      window.history.replaceState({}, "", url.toString())
    }
  }

  // Get letters for the active filter
  const activeLetters = lettersByFilter[activeFilter]

  return (
    <Tabs
      value={activeFilter}
      onValueChange={handleFilterChange}
      className="w-full"
    >
      {/* Controls Row: Tabs + View Toggle - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
        {/* Brutalist Tab List - Horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-1">
          <TabsList
            className="inline-flex h-auto w-max sm:w-full justify-start gap-0 rounded-none border-2 border-charcoal bg-white p-0"
            style={{ borderRadius: "2px" }}
          >
            {FILTER_VALUES.map((filterValue, index) => {
              const Icon = TAB_ICONS[filterValue]
              return (
                <TabsTrigger
                  key={filterValue}
                  value={filterValue}
                  className={cn(
                    "relative flex items-center gap-1.5 sm:gap-2 rounded-none px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                    "data-[state=active]:bg-charcoal data-[state=active]:text-white data-[state=active]:shadow-none",
                    "data-[state=inactive]:bg-white data-[state=inactive]:text-charcoal data-[state=inactive]:hover:bg-off-white",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0",
                    // Add border between tabs
                    index > 0 && "border-l-2 border-charcoal"
                  )}
                  style={{ borderRadius: "0" }}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="hidden sm:inline">{t(`tabs.${filterValue}`)}</span>
                  {/* Count badge */}
                  <span
                    className={cn(
                      "ml-0.5 sm:ml-1 flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[10px] font-bold",
                      "data-[state=active]:bg-white data-[state=active]:text-charcoal",
                      "data-[state=inactive]:bg-charcoal data-[state=inactive]:text-white"
                    )}
                    style={{ borderRadius: "2px" }}
                    data-state={activeFilter === filterValue ? "active" : "inactive"}
                  >
                    {counts[filterValue]}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* View Mode Toggle - Full width on mobile, auto on desktop */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={handleViewModeChange}
          className="flex h-auto gap-0 rounded-none border-2 sm:border-l-0 border-t-0 sm:border-t-2 border-charcoal bg-white p-0 justify-center sm:justify-start"
          style={{ borderRadius: "0 0 2px 2px" }}
        >
          <ToggleGroupItem
            value="grid"
            aria-label={t("accessibility.gridView")}
            className={cn(
              "h-full rounded-none px-4 sm:px-3 py-2.5 sm:py-3 transition-all flex-1 sm:flex-none",
              "data-[state=on]:bg-charcoal data-[state=on]:text-white",
              "data-[state=off]:bg-white data-[state=off]:text-charcoal data-[state=off]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0"
            )}
            style={{ borderRadius: "0" }}
          >
            <LayoutGrid className="h-4 w-4 mx-auto sm:mx-0" strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label={t("accessibility.listView")}
            className={cn(
              "h-full rounded-none border-l-2 border-charcoal px-4 sm:px-3 py-2.5 sm:py-3 transition-all flex-1 sm:flex-none",
              "data-[state=on]:bg-charcoal data-[state=on]:text-white",
              "data-[state=off]:bg-white data-[state=off]:text-charcoal data-[state=off]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0"
            )}
            style={{ borderRadius: "0" }}
          >
            <List className="h-4 w-4 mx-auto sm:mx-0" strokeWidth={2} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Tab Content - Each tab has its own prefetched data */}
      {FILTER_VALUES.map((filterValue) => {
        const letters = lettersByFilter[filterValue]
        return (
          <TabsContent
            key={filterValue}
            value={filterValue}
            className="mt-6 focus-visible:outline-none focus-visible:ring-0"
          >
            {letters.length === 0 ? (
              <EmptyStateV3
                filter={filterValue}
                title={t(`emptyStates.${filterValue}.title`)}
                description={t(`emptyStates.${filterValue}.description`)}
              />
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-3"
                )}
              >
                {letters.map((letter) => (
                  <LetterCardV3 key={letter.id} letter={letter} viewMode={viewMode} />
                ))}
              </div>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

// Icons for empty states
const EMPTY_STATE_ICONS: Record<LetterFilter, LucideIcon> = {
  all: Inbox,
  drafts: FileEdit,
  scheduled: Clock,
  delivered: Mail,
}

/**
 * Empty state component for filtered views
 */
function EmptyStateV3({
  filter,
  title,
  description,
}: {
  filter: LetterFilter
  title: string
  description: string
}) {
  const Icon = EMPTY_STATE_ICONS[filter]

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed border-charcoal/30 bg-duck-cream/50 p-6 sm:p-12 text-center"
      style={{ borderRadius: "2px" }}
    >
      {/* Icon */}
      <div
        className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-charcoal" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="mb-1.5 sm:mb-2 font-mono text-base sm:text-lg font-bold uppercase tracking-wide text-charcoal">
        {title}
      </h3>

      {/* Description */}
      <p className="font-mono text-xs sm:text-sm text-charcoal/60 max-w-[280px] sm:max-w-none">{description}</p>
    </div>
  )
}

/**
 * Skeleton loader for the entire letters list
 */
export function LettersListV3Skeleton() {
  return (
    <div className="w-full">
      {/* Tabs skeleton */}
      <div
        className="flex h-12 w-full border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 animate-pulse bg-charcoal/5",
              i > 0 && "border-l-2 border-charcoal"
            )}
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <LetterCardV3Skeleton key={i} />
        ))}
      </div>
    </div>
  )
}
