"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[54px] w-full border-2 border-charcoal bg-white px-6 py-4 font-mono text-base text-charcoal transition-all duration-200 file:border-0 file:bg-transparent file:font-mono file:text-sm file:font-normal placeholder:text-gray-secondary focus-visible:border-duck-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue/20 disabled:cursor-not-allowed disabled:bg-off-white disabled:text-gray disabled:opacity-60",
          className
        )}
        style={{ borderRadius: "2px" }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
