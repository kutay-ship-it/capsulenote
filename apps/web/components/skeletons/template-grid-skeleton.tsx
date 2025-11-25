import { Skeleton } from "./skeleton"

interface TemplateGridSkeletonProps {
  count?: number
}

export function TemplateGridSkeleton({ count = 4 }: TemplateGridSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-2 border-gray-200 bg-gray-50 p-4"
          style={{
            borderRadius: "2px",
            boxShadow: "-4px 4px 0px 0px rgba(200, 200, 200, 0.5)",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <Skeleton className="h-10 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              {/* Title */}
              <Skeleton className="h-4 w-3/4" />
              {/* Description */}
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          {/* Preview content */}
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          {/* Use template link */}
          <div className="mt-3 flex justify-end">
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
