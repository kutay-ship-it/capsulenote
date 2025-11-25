import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { LetterCard } from "./letter-card"
import { Skeleton } from "@/components/skeletons"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"

interface LetterGridProps {
  letters: LetterWithPreview[]
  locale: string
  isFiltered?: boolean // True when showing filtered results
}

/**
 * Skeleton card for loading state
 */
function LetterCardSkeleton() {
  return (
    <div
      className="border-2 border-charcoal bg-white p-5"
      style={{ borderRadius: "2px" }}
    >
      {/* Title skeleton */}
      <Skeleton className="mb-2 h-6 w-3/4" />

      {/* Preview skeleton - 2 lines */}
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />

      {/* Bottom row skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

/**
 * Loading state with skeleton cards
 */
export function LetterGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <LetterCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Empty state for filtered views
 */
async function FilteredEmptyState() {
  const t = await getTranslations("redesign.grid")

  return (
    <div
      className="border-2 border-charcoal bg-off-white p-8 text-center"
      style={{ borderRadius: "2px" }}
    >
      <p className="mb-4 font-mono text-base text-charcoal">
        {t("noMatchingLetters")}
      </p>
      <Link
        href="/letters"
        className="font-mono text-sm uppercase text-duck-blue underline underline-offset-4 hover:text-charcoal"
      >
        {t("clearFilter")}
      </Link>
    </div>
  )
}

export async function LetterGrid({ letters, locale, isFiltered = false }: LetterGridProps) {
  // Show filtered empty state if no letters match filter
  if (letters.length === 0 && isFiltered) {
    return <FilteredEmptyState />
  }

  // Main grid shouldn't show anything if no letters at all
  // (parent page handles EmptyStateHero in that case)
  if (letters.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {letters.map((letter) => (
        <LetterCard key={letter.id} letter={letter} locale={locale} />
      ))}
    </div>
  )
}
