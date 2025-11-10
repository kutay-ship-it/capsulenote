import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono text-base font-normal uppercase transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-duck-blue text-charcoal border-2 border-charcoal shadow-sm hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
        destructive:
          "bg-coral text-white border-2 border-charcoal shadow-sm hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "border-2 border-charcoal bg-white text-charcoal shadow-sm hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "bg-off-white text-charcoal border-2 border-charcoal shadow-sm hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
        ghost: "hover:bg-off-white hover:text-charcoal",
        link: "text-charcoal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[50px] px-6 py-4",
        sm: "h-[42px] px-5 py-3 text-sm",
        lg: "h-[58px] px-8 py-5 text-lg",
        icon: "h-[50px] w-[50px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ borderRadius: "2px" }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
