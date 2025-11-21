"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type LetterFilter = "all" | "drafts" | "scheduled" | "delivered"

interface LetterFilterTabsProps {
  counts: {
    all: number
    drafts: number
    scheduled: number
    delivered: number
  }
  currentFilter: LetterFilter
}

const FILTER_LABELS: Record<LetterFilter, string> = {
  all: "All Letters",
  drafts: "Drafts",
  scheduled: "Scheduled",
  delivered: "Delivered",
}

export function LetterFilterTabs({ counts, currentFilter }: LetterFilterTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (filter: LetterFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filter === "all") {
      params.delete("filter")
    } else {
      params.set("filter", filter)
    }
    router.push(`/letters?${params.toString()}`)
  }

  const filters: LetterFilter[] = ["all", "drafts", "scheduled", "delivered"]

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {filters.map((filter) => {
        const isActive = currentFilter === filter
        const count = counts[filter]

        return (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={cn(
              "flex items-center gap-2 border-2 border-charcoal px-4 py-2 font-mono text-sm uppercase transition-all duration-fast",
              "hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
              isActive
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal hover:bg-bg-blue-light"
            )}
            style={{ borderRadius: "2px" }}
          >
            <span>{FILTER_LABELS[filter]}</span>
            <Badge
              variant="secondary"
              className={cn(
                "border-2 border-charcoal font-mono text-xs",
                isActive ? "bg-white text-charcoal" : "bg-charcoal text-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              {count}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
