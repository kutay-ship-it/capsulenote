import { DeliveryCardSkeleton, Skeleton } from "@/components/skeletons"

export default function DeliveriesLoading() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        {/* Title */}
        <Skeleton className="h-10 w-40 sm:h-12 sm:w-52 md:h-14 md:w-60" />
        {/* Subtitle */}
        <Skeleton className="h-4 w-64 sm:h-5 sm:w-80" />
      </div>

      {/* Deliveries List Skeleton */}
      <div className="space-y-4 sm:space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <DeliveryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
