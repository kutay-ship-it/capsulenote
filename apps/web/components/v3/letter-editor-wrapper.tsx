"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LetterEditorV3 } from "@/components/v3/letter-editor-v3"
import { getDeliveryEligibility, type DeliveryEligibility } from "@/server/actions/entitlements"

interface LetterEditorWrapperProps {
  initialEligibility: DeliveryEligibility
}

export function LetterEditorWrapper({ initialEligibility }: LetterEditorWrapperProps) {
  const router = useRouter()
  const [eligibility, setEligibility] = React.useState(initialEligibility)

  const handleRefreshEligibility = React.useCallback(async () => {
    try {
      const newEligibility = await getDeliveryEligibility()
      setEligibility(newEligibility)
    } catch (error) {
      console.error("Failed to refresh eligibility:", error)
      // Fallback: trigger a full page refresh
      router.refresh()
    }
  }, [router])

  return (
    <LetterEditorV3
      eligibility={eligibility}
      onRefreshEligibility={handleRefreshEligibility}
    />
  )
}
