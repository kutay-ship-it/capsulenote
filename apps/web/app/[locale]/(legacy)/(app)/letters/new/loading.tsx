import { LetterEditorSkeleton, Skeleton } from "@/components/skeletons"

export default function NewLetterLoading() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header Skeleton */}
      <div className="text-center space-y-2">
        {/* Title */}
        <Skeleton className="h-10 w-64 mx-auto sm:h-12 sm:w-80" />
        {/* Subtitle */}
        <Skeleton className="h-4 w-48 mx-auto sm:h-5 sm:w-64" />
      </div>

      {/* Letter Editor Skeleton */}
      <LetterEditorSkeleton />
    </div>
  )
}
