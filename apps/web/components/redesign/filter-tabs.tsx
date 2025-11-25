"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

interface FilterTabsProps {
  counts: {
    all: number
    drafts: number
    scheduled: number
    delivered: number
  }
  activeFilter: "all" | "drafts" | "scheduled" | "delivered"
}

type FilterType = "all" | "drafts" | "scheduled" | "delivered"

const filters: { key: FilterType; showCount: boolean }[] = [
  { key: "all", showCount: false },
  { key: "drafts", showCount: true },
  { key: "scheduled", showCount: true },
  { key: "delivered", showCount: false },
]

export function FilterTabs({ counts, activeFilter }: FilterTabsProps) {
  const t = useTranslations("redesign.filters")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (filter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filter === "all") {
      params.delete("filter")
    } else {
      params.set("filter", filter)
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
      <div className="flex min-w-max gap-6 sm:gap-8">
        {filters.map(({ key, showCount }) => {
          const isActive = activeFilter === key
          const count = counts[key]

          return (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap pb-2 font-mono text-sm uppercase tracking-wide transition-colors",
                isActive
                  ? "font-bold text-charcoal"
                  : "text-gray-secondary hover:text-charcoal"
              )}
            >
              <span>{t(key)}</span>

              {/* Count badge - only for drafts and scheduled */}
              {showCount && count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 font-mono text-xs",
                    isActive
                      ? "bg-duck-yellow text-charcoal"
                      : "bg-off-white text-gray-secondary"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {count}
                </span>
              )}

              {/* Active indicator line */}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-duck-blue"
                  style={{ borderRadius: "1px" }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
