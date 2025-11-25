"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "group flex items-center gap-4 w-full p-4",
            "bg-white border-2 border-charcoal font-mono text-charcoal shadow-sm",
          ].join(" "),
          title: "text-sm font-normal uppercase tracking-wide",
          description: "text-sm text-gray-secondary",
          actionButton: [
            "px-3 py-1 border-2 border-charcoal bg-duck-blue font-mono text-sm uppercase",
            "shadow-sm hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5",
            "transition-all duration-fast",
          ].join(" "),
          cancelButton:
            "px-3 py-1 border-2 border-charcoal bg-off-white font-mono text-sm",
          closeButton: "text-gray hover:text-charcoal transition-colors",
          success: "border-teal-primary bg-bg-green-light",
          error: "border-coral bg-bg-pink-light",
          warning: "border-mustard bg-bg-yellow-pale",
          info: "border-duck-blue bg-bg-blue-light",
        },
      }}
      style={{ "--toast-border-radius": "2px" } as React.CSSProperties}
    />
  )
}
