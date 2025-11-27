import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/skeletons"

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-36 sm:h-12 sm:w-44 md:h-14 md:w-52" />
        <Skeleton className="h-4 w-64 sm:h-5 sm:w-80" />
      </div>

      {/* Settings Cards Skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="border-2 border-gray-200"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 sm:h-7 sm:w-40" />
                <Skeleton className="h-4 w-48 sm:w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
