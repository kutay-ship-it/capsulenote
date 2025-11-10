"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[200px] w-full border-2 border-charcoal bg-white px-6 py-4 font-mono text-base text-charcoal transition-all duration-200 placeholder:text-gray-secondary focus-visible:border-duck-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue/20 disabled:cursor-not-allowed disabled:bg-off-white disabled:text-gray disabled:opacity-60 resize-y",
          // Lined paper effect
          "bg-[linear-gradient(transparent_0px,transparent_31px,rgba(56,56,56,0.1)_32px)] bg-[length:100%_32px] leading-[32px]",
          className
        )}
        style={{ borderRadius: "2px" }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
