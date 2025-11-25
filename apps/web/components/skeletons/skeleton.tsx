import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "pulse" | "shimmer"
}

export function Skeleton({ className, variant = "pulse" }: SkeletonProps) {
  return (
    <div
      className={cn(
        variant === "shimmer"
          ? "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
          : "bg-gray-200 animate-pulse",
        className
      )}
      style={{ borderRadius: "2px" }}
    />
  )
}
