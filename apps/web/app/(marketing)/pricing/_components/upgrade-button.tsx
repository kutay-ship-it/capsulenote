/**
 * Upgrade Button Component
 *
 * Handles Pro subscription checkout flow with loading states and error handling.
 * Calls createCheckoutSession server action and redirects to Stripe Checkout.
 *
 * Client Component - requires onClick handler and state management.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/server/actions/billing"
import { toast } from "@/hooks/use-toast"

interface UpgradeButtonProps {
  /** Stripe price ID for the subscription */
  priceId: string
  /** Button label text */
  label?: string
  /** Button variant */
  variant?: "default" | "secondary" | "outline" | "ghost" | "link"
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon"
  /** Additional CSS classes */
  className?: string
}

export function UpgradeButton({
  priceId,
  label = "Start Free Trial",
  variant = "secondary",
  size = "lg",
  className,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setIsLoading(true)

    try {
      const result = await createCheckoutSession({ priceId })

      if (result.success) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url
      } else {
        // Handle specific error codes
        switch (result.error.code) {
          case "ALREADY_SUBSCRIBED":
            toast({
              variant: "destructive",
              title: "You already have an active subscription",
              description: "Manage your subscription in billing settings",
            })
            break

          case "INVALID_INPUT":
            toast({
              variant: "destructive",
              title: "Invalid plan selected",
              description: "Please refresh the page and try again",
            })
            break

          case "UNAUTHORIZED":
            toast({
              variant: "destructive",
              title: "Please sign in to continue",
              description: "You need an account to subscribe",
            })
            break

          case "PAYMENT_PROVIDER_ERROR":
            toast({
              variant: "destructive",
              title: "Payment system error",
              description: result.error.message || "Please try again in a moment",
            })
            break

          default:
            toast({
              variant: "destructive",
              title: "Something went wrong",
              description: result.error.message || "Please try again",
            })
        }

        setIsLoading(false)
      }
    } catch (error) {
      console.error("[UpgradeButton] Checkout error:", error)
      toast({
        variant: "destructive",
        title: "Failed to start checkout",
        description: "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
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
        label
      )}
    </Button>
  )
}
