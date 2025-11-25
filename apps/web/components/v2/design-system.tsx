"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// --- V2 TOKENS ---
// We override the global brutalist theme with soft, emotional values.

const v2Shadows = {
    sm: "shadow-[0_2px_8px_-2px_rgba(45,55,72,0.05)]",
    md: "shadow-[0_4px_12px_-2px_rgba(45,55,72,0.08)]",
    lg: "shadow-[0_8px_24px_-4px_rgba(45,55,72,0.12)]",
    xl: "shadow-[0_20px_40px_-8px_rgba(45,55,72,0.15)]",
    inner: "shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]",
}

const v2Radius = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
}

// --- COMPONENTS ---

// 1. Background Texture
export function V2Background() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40 mix-blend-multiply">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    )
}

// 2. V2 Button
const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                primary:
                    "bg-charcoal text-white hover:bg-teal-900 hover:shadow-lg shadow-md border border-transparent",
                secondary:
                    "bg-white text-charcoal border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm",
                ghost: "hover:bg-stone-100 text-stone-600 hover:text-charcoal",
                link: "text-stone-500 underline-offset-4 hover:underline",
                emotional: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg font-serif tracking-wide",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
            radius: {
                default: "rounded-full",
                soft: "rounded-xl",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
            radius: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const V2Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, radius, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, radius, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
V2Button.displayName = "V2Button"

// 3. V2 Card
const cardVariants = cva(
    "bg-white border border-stone-100 transition-all duration-300",
    {
        variants: {
            elevation: {
                none: "",
                sm: v2Shadows.sm,
                md: v2Shadows.md,
                hover: `${v2Shadows.sm} hover:${v2Shadows.lg} hover:-translate-y-1`,
            },
            radius: {
                md: v2Radius.md,
                lg: v2Radius.lg,
            },
        },
        defaultVariants: {
            elevation: "sm",
            radius: "lg",
        },
    }
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> { }

const V2Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, elevation, radius, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(cardVariants({ elevation, radius, className }))}
                {...props}
            />
        )
    }
)
V2Card.displayName = "V2Card"

export { V2Button, V2Card, buttonVariants, cardVariants }
