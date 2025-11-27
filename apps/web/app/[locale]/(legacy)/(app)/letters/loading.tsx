import { LetterCardSkeleton, Skeleton } from "@/components/skeletons"

export default function LettersLoading() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Title */}
          <Skeleton className="h-10 w-48 sm:h-12 sm:w-56" />
          {/* Subtitle */}
          <Skeleton className="h-4 w-64 sm:h-5 sm:w-80" />
        </div>
        {/* New Letter Button */}
        <Skeleton className="h-12 w-full sm:h-10 sm:w-32" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-22" />
      </div>

      {/* Letters Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LetterCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
