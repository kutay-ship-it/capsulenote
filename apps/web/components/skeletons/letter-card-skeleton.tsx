import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

export function LetterCardSkeleton() {
  return (
    <Card
      className="h-full border-2 border-gray-200 bg-gray-50"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 sm:h-7" />
          {/* Icon placeholder */}
          <Skeleton className="h-8 w-8 shrink-0" />
        </div>
        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32 sm:w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
        {/* Delivery count + badge row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        {/* Tags row */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-18" />
        </div>
      </CardContent>
    </Card>
  )
}
