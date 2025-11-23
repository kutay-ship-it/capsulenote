/**
 * Subscribe Button Component
 *
 * Handles anonymous checkout flow:
 * 1. Calls createAnonymousCheckout Server Action
 * 2. Redirects to Stripe Checkout with locked email
 * 3. Handles errors (already paid, invalid price, etc.)
 *
 * Client Component - requires useState and browser APIs.
 */

"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAnonymousCheckout } from "../actions"
import { toast } from "@/hooks/use-toast"

interface SubscribeButtonProps {
  /** User's email (locked in Stripe) */
  email: string
  /** Stripe price ID */
  priceId: string
  /** Plan name for display */
  planName: string
  /** Optional letter ID */
  letterId?: string
  /** Optional metadata to forward to checkout */
  metadata?: Record<string, unknown>
  /** Button variant */
  variant?: "default" | "secondary" | "outline" | "ghost" | "link"
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon"
  /** Additional CSS classes */
  className?: string
}

export function SubscribeButton({
  email,
  priceId,
  planName,
  letterId,
  metadata,
  variant = "secondary",
  size = "lg",
  className,
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)

    try {
      // Call anonymous checkout server action
      const result = await createAnonymousCheckout({
        email,
        priceId,
        letterId,
        metadata: {
          source: "subscribe_page",
          plan: planName,
          ...metadata,
        },
      })

      // Redirect to Stripe Checkout
      window.location.href = result.sessionUrl
    } catch (error) {
      console.error("[SubscribeButton] Checkout error:", error)

      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error)

      switch (errorMessage) {
        case "ALREADY_PAID":
          toast({
            variant: "destructive",
            title: "Payment already completed",
            description: "Please sign up to activate your subscription",
          })
          // Redirect to signup with email
          setTimeout(() => {
            window.location.href = `/sign-up?email=${encodeURIComponent(email)}`
          }, 2000)
          break

        default:
          toast({
            variant: "destructive",
            title: "Failed to start checkout",
            description: errorMessage || "An unexpected error occurred. Please try again.",
          })
          setIsLoading(false)
      }
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        `Subscribe to ${planName}`
      )}
    </Button>
  )
}
