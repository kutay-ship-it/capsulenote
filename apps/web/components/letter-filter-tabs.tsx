'use client'

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
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

export function LetterFilterTabs({ counts, currentFilter }: LetterFilterTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const t = useTranslations("letters.filters")
  const [isPending, startTransition] = useTransition()

  const handleFilterChange = (filter: LetterFilter) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (filter === "all") {
        params.delete("filter")
      } else {
        params.set("filter", filter)
      }
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const filters: LetterFilter[] = ["all", "drafts", "scheduled", "delivered"]

  return (
    <div className={cn("flex flex-wrap gap-2 sm:gap-3", isPending && "opacity-70")}>
      {filters.map((filter) => {
        const isActive = currentFilter === filter
        const count = counts[filter]

        return (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 border-2 border-charcoal px-4 py-2 font-mono text-sm uppercase transition-all duration-fast",
              "hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
              "disabled:cursor-wait disabled:opacity-50",
              isActive
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal hover:bg-bg-blue-light"
            )}
            style={{ borderRadius: "2px" }}
          >
            <span>{t(filter)}</span>
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
