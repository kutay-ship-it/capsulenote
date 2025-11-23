"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { createAddOnCheckoutSession } from "@/server/actions/addons"
import { useToast } from "@/hooks/use-toast"

interface AddOnPurchaseProps {
  type: "email" | "physical"
  label: string
}

export function AddOnPurchase({ type, label }: AddOnPurchaseProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await createAddOnCheckoutSession({ type })
      if (result.success && result.data?.url) {
        window.location.href = result.data.url
      } else {
        toast({
          variant: "destructive",
          title: "Add-on purchase failed",
          description: result.error?.message || "Please try again.",
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
      {isPending ? "Redirecting..." : label}
    </Button>
  )
}
