import { Skeleton } from "@/components/skeletons"

export default function NewLetterLoading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Progress bar skeleton */}
      <div className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/95">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                {i < 4 && <Skeleton className="h-0.5 w-10" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-12 text-center">
          <div className="space-y-4">
            <Skeleton className="mx-auto h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto h-10 w-80" />
            <Skeleton className="mx-auto h-6 w-96" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>

          <Skeleton className="mx-auto h-12 w-48" />
        </div>
      </div>
    </div>
  )
}
