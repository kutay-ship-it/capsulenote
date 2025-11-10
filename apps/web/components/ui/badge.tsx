import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 border-charcoal px-3 py-1 font-mono text-xs font-normal uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-duck-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-duck-blue text-charcoal",
        secondary: "bg-off-white text-charcoal",
        outline: "bg-white text-charcoal",
        destructive: "bg-coral text-white",
        success: "bg-teal-primary text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={{ borderRadius: "2px" }}
      {...props}
    />
  )
}
