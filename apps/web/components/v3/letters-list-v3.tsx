"use client"

import { useState, useEffect } from "react"
import { FileEdit, Clock, Mail, Inbox, LayoutGrid, List } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { LetterCardV3, LetterCardV3Skeleton, type ViewMode } from "./letter-card-v3"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"

export type LetterFilter = "all" | "drafts" | "scheduled" | "delivered"

const VIEW_MODE_STORAGE_KEY = "letters-view-mode"

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

/**
 * Tab configuration with icons and labels
 */
const TAB_CONFIG: {
  value: LetterFilter
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: "all",
    label: "All",
    icon: <Inbox className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "drafts",
    label: "Drafts",
    icon: <FileEdit className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "scheduled",
    label: "Scheduled",
    icon: <Clock className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: <Mail className="h-4 w-4" strokeWidth={2} />,
  },
]

export function LettersListV3({
  lettersByFilter,
  counts,
  initialFilter,
}: LettersListV3Props) {
  // Local state for instant tab switching - no server roundtrip
  const [activeFilter, setActiveFilter] = useState<LetterFilter>(initialFilter)

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Load saved view preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (saved === "grid" || saved === "list") {
      setViewMode(saved)
    }
  }, [])

  const handleViewModeChange = (value: string) => {
    if (value === "grid" || value === "list") {
      setViewMode(value)
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, value)
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
      {/* Controls Row: Tabs + View Toggle */}
      <div className="flex items-stretch gap-0">
        {/* Brutalist Tab List */}
        <TabsList
          className="inline-flex h-auto flex-1 justify-start gap-0 rounded-none border-2 border-charcoal bg-white p-0"
          style={{ borderRadius: "2px 0 0 2px" }}
        >
        {TAB_CONFIG.map((tab, index) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex items-center gap-2 rounded-none px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all",
              "data-[state=active]:bg-charcoal data-[state=active]:text-white data-[state=active]:shadow-none",
              "data-[state=inactive]:bg-white data-[state=inactive]:text-charcoal data-[state=inactive]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0",
              // Add border between tabs
              index > 0 && "border-l-2 border-charcoal"
            )}
            style={{ borderRadius: "0" }}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {/* Count badge */}
            <span
              className={cn(
                "ml-1 flex h-5 min-w-5 items-center justify-center px-1 font-mono text-[10px] font-bold",
                "data-[state=active]:bg-white data-[state=active]:text-charcoal",
                "data-[state=inactive]:bg-charcoal data-[state=inactive]:text-white"
              )}
              style={{ borderRadius: "2px" }}
              data-state={activeFilter === tab.value ? "active" : "inactive"}
            >
              {counts[tab.value]}
            </span>
          </TabsTrigger>
        ))}
        </TabsList>

        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={handleViewModeChange}
          className="flex h-auto gap-0 rounded-none border-2 border-l-0 border-charcoal bg-white p-0"
          style={{ borderRadius: "0 2px 2px 0" }}
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            className={cn(
              "h-full rounded-none px-3 py-3 transition-all",
              "data-[state=on]:bg-charcoal data-[state=on]:text-white",
              "data-[state=off]:bg-white data-[state=off]:text-charcoal data-[state=off]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0"
            )}
            style={{ borderRadius: "0" }}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className={cn(
              "h-full rounded-none border-l-2 border-charcoal px-3 py-3 transition-all",
              "data-[state=on]:bg-charcoal data-[state=on]:text-white",
              "data-[state=off]:bg-white data-[state=off]:text-charcoal data-[state=off]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0"
            )}
            style={{ borderRadius: "0" }}
          >
            <List className="h-4 w-4" strokeWidth={2} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Tab Content - Each tab has its own prefetched data */}
      {TAB_CONFIG.map((tab) => {
        const letters = lettersByFilter[tab.value]
        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="mt-6 focus-visible:outline-none focus-visible:ring-0"
          >
            {letters.length === 0 ? (
              <EmptyStateV3 filter={tab.value} />
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

/**
 * Empty state component for filtered views
 */
function EmptyStateV3({ filter }: { filter: LetterFilter }) {
  const config: Record<
    LetterFilter,
    { icon: React.ReactNode; title: string; description: string }
  > = {
    all: {
      icon: <Inbox className="h-8 w-8 text-charcoal" strokeWidth={2} />,
      title: "No letters yet",
      description: "Start writing your first letter to your future self.",
    },
    drafts: {
      icon: <FileEdit className="h-8 w-8 text-charcoal" strokeWidth={2} />,
      title: "No drafts",
      description: "Letters you're still working on will appear here.",
    },
    scheduled: {
      icon: <Clock className="h-8 w-8 text-charcoal" strokeWidth={2} />,
      title: "No scheduled letters",
      description: "Letters waiting to be delivered will appear here.",
    },
    delivered: {
      icon: <Mail className="h-8 w-8 text-charcoal" strokeWidth={2} />,
      title: "No delivered letters",
      description: "Letters that have been delivered will appear here.",
    },
  }

  const { icon, title, description } = config[filter]

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed border-charcoal/30 bg-duck-cream/50 p-12 text-center"
      style={{ borderRadius: "2px" }}
    >
      {/* Icon */}
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
        {title}
      </h3>

      {/* Description */}
      <p className="font-mono text-sm text-charcoal/60">{description}</p>
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
