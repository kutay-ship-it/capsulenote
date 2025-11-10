"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LetterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sealed" | "open" | "flat"
  accentColor?: "yellow" | "blue" | "teal" | "lavender" | "peach" | "lime"
  showStamp?: boolean
  showPostmark?: boolean
}

const Letter = React.forwardRef<HTMLDivElement, LetterProps>(
  ({
    className,
    variant = "flat",
    accentColor = "yellow",
    showStamp = true,
    showPostmark = false,
    children,
    ...props
  }, ref) => {
    const [isFlipped, setIsFlipped] = React.useState(false)

    const accentColors = {
      yellow: "bg-duck-yellow",
      blue: "bg-duck-blue",
      teal: "bg-teal-primary",
      lavender: "bg-lavender",
      peach: "bg-peach",
      lime: "bg-lime",
    }

    if (variant === "sealed") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-2xl mx-auto",
            className
          )}
          {...props}
        >
          {/* Envelope */}
          <div className="relative">
            {/* Envelope body */}
            <div
              className="bg-cream border-2 border-charcoal p-12 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1"
              style={{
                borderRadius: "2px",
                boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)"
              }}
            >
              {/* Envelope flap (top triangle) */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-24 border-b-2 border-charcoal",
                  accentColors[accentColor]
                )}
                style={{
                  clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                  borderRadius: "2px 2px 0 0"
                }}
              />

              {/* Address lines */}
              <div className="relative z-10 space-y-4 mt-16">
                <div className="h-3 bg-charcoal/20 w-3/4" style={{ borderRadius: "2px" }} />
                <div className="h-3 bg-charcoal/20 w-1/2" style={{ borderRadius: "2px" }} />
                <div className="h-3 bg-charcoal/20 w-2/3 mt-8" style={{ borderRadius: "2px" }} />
              </div>

              {/* Stamp */}
              {showStamp && (
                <div
                  className="absolute top-8 right-8 w-16 h-16 border-2 border-charcoal bg-duck-blue flex items-center justify-center"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="text-2xl">🦆</span>
                </div>
              )}

              {/* Postmark */}
              {showPostmark && (
                <div
                  className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 border-2 border-charcoal/30 rounded-full flex items-center justify-center"
                >
                  <span className="font-mono text-xs text-charcoal/50 rotate-12">SENT</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (variant === "open") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-2xl mx-auto perspective-1000",
            className
          )}
          {...props}
        >
          <div
            className="relative cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Envelope (flipped back when open) */}
            <div
              className={cn(
                "absolute inset-0 bg-cream border-2 border-charcoal transition-all duration-500",
                isFlipped ? "rotate-x-180 opacity-0" : "rotate-x-0 opacity-100"
              )}
              style={{
                borderRadius: "2px",
                transformStyle: "preserve-3d",
                boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)"
              }}
            >
              <div className={cn(
                "absolute -top-2 left-0 right-0 h-24 border-2 border-charcoal",
                accentColors[accentColor]
              )}
              style={{
                clipPath: "polygon(0 50%, 50% 0%, 100% 50%, 50% 100%)",
                borderRadius: "2px"
              }} />
            </div>

            {/* Letter content */}
            <div
              className={cn(
                "bg-white border-2 border-charcoal p-12 transition-all duration-500 hover:-translate-x-1 hover:-translate-y-1",
                isFlipped ? "rotate-x-0 opacity-100" : "rotate-x-180 opacity-0"
              )}
              style={{
                borderRadius: "2px",
                transformStyle: "preserve-3d",
                boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)"
              }}
            >
              {children}
            </div>
          </div>
        </div>
      )
    }

    // Flat variant (default)
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-2xl mx-auto",
          className
        )}
        {...props}
      >
        <div
          className="bg-white border-2 border-charcoal p-12 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1"
          style={{
            borderRadius: "2px",
            boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
            backgroundImage: `linear-gradient(transparent 0px, transparent 31px, rgba(56, 56, 56, 0.1) 32px)`,
            backgroundSize: "100% 32px",
            lineHeight: "32px"
          }}
        >
          {/* Letter header accent */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-2",
              accentColors[accentColor]
            )}
            style={{ borderRadius: "2px 2px 0 0" }}
          />

          {/* Decorative stamp corner */}
          {showStamp && (
            <div
              className="absolute -top-3 -right-3 w-12 h-12 border-2 border-charcoal bg-duck-blue flex items-center justify-center rotate-12 transition-transform duration-300 hover:rotate-0"
              style={{ borderRadius: "2px" }}
            >
              <span className="text-xl">🦆</span>
            </div>
          )}

          {/* Letter content */}
          <div className="relative z-10 font-mono text-charcoal">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Letter.displayName = "Letter"

const LetterHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-8 pb-6 border-b-2 border-charcoal/20", className)}
    {...props}
  />
))
LetterHeader.displayName = "LetterHeader"

const LetterTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "font-mono text-3xl font-normal text-charcoal uppercase tracking-wide mb-2",
      className
    )}
    {...props}
  />
))
LetterTitle.displayName = "LetterTitle"

const LetterDate = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("font-mono text-sm text-gray-secondary uppercase tracking-wide", className)}
    {...props}
  />
))
LetterDate.displayName = "LetterDate"

const LetterContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-mono text-base leading-8 text-charcoal space-y-4", className)}
    {...props}
  />
))
LetterContent.displayName = "LetterContent"

const LetterFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-8 pt-6 border-t-2 border-charcoal/20 font-mono text-sm", className)}
    {...props}
  />
))
LetterFooter.displayName = "LetterFooter"

export {
  Letter,
  LetterHeader,
  LetterTitle,
  LetterDate,
  LetterContent,
  LetterFooter
}
