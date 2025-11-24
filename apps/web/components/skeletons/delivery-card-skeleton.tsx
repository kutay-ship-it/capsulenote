import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

export function DeliveryCardSkeleton() {
  return (
    <Card
      className="border-2 border-gray-200"
      style={{ borderRadius: "2px" }}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side - Letter Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              {/* Status icon placeholder */}
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title */}
                <Skeleton className="h-5 w-3/4 sm:h-6" />
                {/* Date and channel info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40 sm:w-48" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Actions and Badge */}
          <div className="flex items-center gap-3">
            {/* Calendar button placeholder */}
            <Skeleton className="h-9 w-9" />
            {/* Status badge */}
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
