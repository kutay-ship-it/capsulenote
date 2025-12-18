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

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAnonymousCheckout } from "../actions"
import { toast } from "sonner"

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
  /** Inline styles */
  style?: React.CSSProperties
  /** Custom children (overrides default button text) */
  children?: React.ReactNode
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
  style,
  children,
}: SubscribeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const prefix = locale === "en" ? "" : `/${locale}`
  const t = useTranslations("subscribe")

  function handleClick() {
    startTransition(async () => {
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
            toast.error(t("toast.alreadyPaid.title"), {
              description: t("toast.alreadyPaid.description"),
            })
            // Redirect to signup with email
            setTimeout(() => {
              window.location.href = `${prefix}/sign-up?email=${encodeURIComponent(email)}`
            }, 2000)
            break

          default:
            toast.error(t("toast.checkoutFailed.title"), {
              description: errorMessage || t("toast.checkoutFailed.description"),
            })
        }
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={variant}
      size={size}
      className={className}
      style={style}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("button.loading")}
        </>
      ) : children ? (
        children
      ) : (
        t("button.subscribe", { planName })
      )}
    </Button>
  )
}
