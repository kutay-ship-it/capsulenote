import { Skeleton } from "@/components/skeletons"
import { LetterGridSkeleton } from "@/components/redesign/letter-grid"

export default function RedesignLettersLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-full sm:h-12 sm:w-40" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-6 sm:gap-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Hero Skeleton */}
      <div
        className="border-2 border-charcoal bg-bg-yellow-cream p-6 sm:p-8 md:p-12"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col items-center">
          <Skeleton className="mb-6 h-6 w-48" />
          <Skeleton className="mb-6 h-16 w-24" />
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="mb-6 h-4 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="relative h-20 overflow-x-auto">
          <div className="mt-8">
            <Skeleton className="h-0.5 w-full" />
          </div>
        </div>
      </div>

      {/* Letter Grid Skeleton */}
      <LetterGridSkeleton />
    </div>
  )
}
