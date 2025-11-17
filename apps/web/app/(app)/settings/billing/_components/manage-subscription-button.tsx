"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"
import { createBillingPortalSession } from "@/server/actions/billing"
import { useToast } from "@/hooks/use-toast"

interface ManageSubscriptionButtonProps {
  hasSubscription: boolean
}

export function ManageSubscriptionButton({ hasSubscription }: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
        toast({
          title: "Error",
          description: result.error.message || "Failed to open billing portal",
          variant: "destructive",
        })
        return
      }

      // Redirect to Stripe portal
      window.location.href = result.data.url
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
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
          Loading...
        </>
      ) : hasSubscription ? (
        <>
          Manage Subscription
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      ) : (
        "Upgrade to Pro"
      )}
    </Button>
  )
}
