"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"

interface AddOnPurchaseProps {
  type: "email" | "physical"
  label: string
}

export function AddOnPurchase({ type, label }: AddOnPurchaseProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("billing.addons.toast")

  const handleClick = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({ type })
      if (result.success && result.data?.url) {
        window.location.href = result.data.url
      } else {
        toast({
          variant: "destructive",
          title: t("failedTitle"),
          description: result.error?.message || t("failedDescription"),
        })
      }
    })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="border-2 border-charcoal font-mono"
      style={{ borderRadius: "2px" }}
    >
      {isPending ? t("redirect") : label}
    </Button>
  )
}
