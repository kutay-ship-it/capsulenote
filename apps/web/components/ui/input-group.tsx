"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// InputGroup - Container with focus-within styling
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-stretch w-full border-2 border-charcoal bg-white",
      "focus-within:border-duck-blue focus-within:ring-2 focus-within:ring-duck-blue/20",
      "transition-all duration-200",
      className
    )}
    style={{ borderRadius: "2px" }}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

// InputGroupInput - Input without border (container provides it)
const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 h-[54px] bg-transparent px-6 py-4",
      "font-mono text-base text-charcoal",
      "placeholder:text-gray-secondary",
      "focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

// InputGroupAddon - Prefix/Suffix slot
interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "start" | "end"
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, position = "start", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center px-4 bg-off-white",
        "font-mono text-sm text-gray-secondary select-none",
        position === "start" && "border-r-2 border-charcoal",
        position === "end" && "border-l-2 border-charcoal",
        className
      )}
      {...props}
    />
  )
)
InputGroupAddon.displayName = "InputGroupAddon"

export { InputGroup, InputGroupInput, InputGroupAddon }
