"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { createBillingPortalSession } from "@/server/actions/billing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface ManageSubscriptionButtonProps {
  hasSubscription: boolean
}

export function ManageSubscriptionButton({ hasSubscription }: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("billing")

  const handleClick = async () => {
    if (!hasSubscription) {
      // Redirect to pricing for users without subscription
      window.location.href = '/pricing'
      return
    }

    setIsLoading(true)

    try {
      const result = await createBillingPortalSession()

      if (!result.success) {
        toast.error(t("toasts.errorTitle"), {
          description: result.error.message || t("toasts.portalFailed"),
        })
        return
      }

      // Redirect to Stripe portal
      window.location.href = result.data.url
    } catch (error) {
      toast.error(t("toasts.errorTitle"), {
        description: t("toasts.portalUnexpected"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="border-2 border-charcoal bg-lavender font-mono text-sm uppercase tracking-wide hover:bg-lavender/90"
      style={{ borderRadius: "2px" }}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("manageButton.loading")}
        </>
      ) : hasSubscription ? (
        <>
          {t("manageButton.manage")}
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      ) : (
        t("manageButton.upgrade")
      )}
    </Button>
  )
}
