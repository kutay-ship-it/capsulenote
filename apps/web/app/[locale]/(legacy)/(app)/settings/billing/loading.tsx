import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/skeletons"

export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Back Link Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-28 sm:h-12 sm:w-36 md:h-14 md:w-44" />
        <Skeleton className="h-4 w-64 sm:h-5 sm:w-80" />
      </div>

      {/* Subscription Status Card */}
      <Card
        className="border-2 border-gray-200"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Usage Indicator Card */}
      <Card
        className="border-2 border-gray-200"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History Card */}
      <Card
        className="border-2 border-gray-200"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Portal Info Card */}
      <Card
        className="border-2 border-gray-200"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-52" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
