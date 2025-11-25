import { Skeleton } from "./skeleton"

export function LetterEditorSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Letter Paper Container */}
      <div
        className="relative bg-gray-50 border-2 border-gray-200 p-5 sm:p-8 md:p-12"
        style={{
          borderRadius: "2px",
          boxShadow: "-8px 8px 0px 0px rgba(200, 200, 200, 0.5)",
        }}
      >
        {/* Accent Bar Skeleton */}
        <Skeleton className="absolute top-0 left-0 right-0 h-2" />

        {/* Mail Stamp Skeleton */}
        <Skeleton className="absolute -top-3 -right-3 w-12 h-12" />

        <div className="space-y-6">
          {/* Template Selector Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Recipient Section Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>

          {/* Title Field Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10" />
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Editor Toolbar Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            {/* Toolbar */}
            <div
              className="border-2 border-gray-200 bg-gray-100 p-2"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
            </div>
            {/* Editor Area */}
            <div
              className="border-2 border-gray-200 bg-white p-4"
              style={{ borderRadius: "2px", minHeight: "280px" }}
            >
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>

          {/* Delivery Settings Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            {/* Delivery Type */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            {/* Email Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10" />
            </div>
            {/* Date Presets */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Buttons Skeleton */}
          <div className="flex gap-3 mt-8">
            <Skeleton className="flex-1 h-12" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
