import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

export function StatsCardSkeleton() {
  return (
    <Card
      className="border-2 border-gray-200 bg-gray-50"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="p-5 sm:p-6">
        {/* Title */}
        <Skeleton className="h-6 w-24 sm:h-7 sm:w-28" />
        {/* Description */}
        <Skeleton className="mt-1 h-4 w-32 sm:w-40" />
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        {/* Large number */}
        <Skeleton className="h-12 w-16 sm:h-14 sm:w-20" />
      </CardContent>
    </Card>
  )
}
