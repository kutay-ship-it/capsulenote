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
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"
import { createCheckoutSession } from "@/server/actions/billing"

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
  const t = useTranslations("pricing.upgrade")

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
            toast.error(t("errors.alreadySubscribed.title"), {
              description: t("errors.alreadySubscribed.description"),
            })
            break

          case "INVALID_INPUT":
            toast.error(t("errors.invalidPlan.title"), {
              description: t("errors.invalidPlan.description"),
            })
            break

          case "UNAUTHORIZED":
            toast.error(t("errors.unauthorized.title"), {
              description: t("errors.unauthorized.description"),
            })
            break

          case "PAYMENT_PROVIDER_ERROR":
            toast.error(t("errors.payment.title"), {
              description: result.error.message || t("errors.payment.description"),
            })
            break

          default:
            toast.error(t("errors.generic.title"), {
              description: result.error.message || t("errors.generic.description"),
            })
        }

        setIsLoading(false)
      }
    } catch (error) {
      console.error("[UpgradeButton] Checkout error:", error)
      toast.error(t("errors.checkoutFailed.title"), {
        description: t("errors.checkoutFailed.description"),
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
          {t("loading")}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
