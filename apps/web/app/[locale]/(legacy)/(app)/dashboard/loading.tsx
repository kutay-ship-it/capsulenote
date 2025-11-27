import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatsCardSkeleton, Skeleton } from "@/components/skeletons"

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Title */}
          <Skeleton className="h-10 w-40 sm:h-12 sm:w-48" />
          {/* Welcome text */}
          <Skeleton className="h-4 w-56 sm:h-5 sm:w-72" />
        </div>
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Write New Letter Section Skeleton */}
      <div className="space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Skeleton className="mx-auto h-5 w-24" />
          <Skeleton className="mx-auto h-8 w-64 sm:h-10 sm:w-80" />
          <Skeleton className="mx-auto h-4 w-80 sm:w-96" />
        </div>

        {/* Letter Editor Skeleton */}
        <Card
          className="border-2 border-gray-200"
          style={{ borderRadius: "2px" }}
        >
          <CardContent className="p-5 sm:p-6 space-y-4">
            {/* Title input */}
            <Skeleton className="h-10 w-full" />
            {/* Editor area */}
            <Skeleton className="h-48 w-full" />
            {/* Submit button */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Letters Section Skeleton */}
      <Card
        className="border-2 border-gray-200"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
          <Skeleton className="mt-1 h-4 w-56 sm:w-64" />
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm border-2 border-gray-200 p-4"
                style={{ borderRadius: "2px" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
