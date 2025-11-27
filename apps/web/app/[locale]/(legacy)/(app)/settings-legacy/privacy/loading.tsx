import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/skeletons"

export default function PrivacyLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Data Export Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-52" />
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-3 w-full max-w-md" />
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-52" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <div className="rounded-lg bg-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </CardContent>
      </Card>

      {/* Legal Links Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}
