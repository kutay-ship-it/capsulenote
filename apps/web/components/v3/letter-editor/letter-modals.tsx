"use client"

import { SealConfirmationV3 } from "@/components/v3/seal-confirmation-v3"
import { SealCelebrationV3 } from "@/components/v3/seal-celebration-v3"
import { PhysicalMailTrialModal } from "@/components/v3/physical-mail-trial-modal"
import { PhysicalMailUpgradeModal } from "@/components/v3/physical-mail-upgrade-modal"
import type { DeliveryEligibility } from "@/server/lib/entitlement-types"
import type { ShippingAddress } from "@/server/actions/addresses"
import type { PrintOptions } from "@/components/v3/print-options-v3"

type RecipientType = "myself" | "someone-else"
type DeliveryChannel = "email" | "physical"

interface LetterModalsProps {
  // Seal Confirmation Modal
  showSealConfirmation: boolean
  onSealConfirmationChange: (open: boolean) => void
  onConfirmSeal: () => void
  isSubmitting: boolean
  letterTitle: string
  recipientType: RecipientType
  recipientName: string
  recipientEmail: string
  deliveryChannels: DeliveryChannel[]
  deliveryDate: Date | undefined
  eligibility: DeliveryEligibility
  shippingAddress: ShippingAddress | null
  printOptions: PrintOptions | undefined

  // Seal Celebration Modal
  showCelebration: boolean
  onCelebrationChange: (open: boolean) => void
  onCelebrationComplete: () => void

  // Physical Mail Modals
  showTrialModal: boolean
  onTrialModalChange: (open: boolean) => void
  showUpgradeModal: boolean
  onUpgradeModalChange: (open: boolean) => void
}

/**
 * Container for all letter editor modals
 * Extracted to reduce letter-editor-v3.tsx complexity
 */
export function LetterModals({
  // Seal Confirmation
  showSealConfirmation,
  onSealConfirmationChange,
  onConfirmSeal,
  isSubmitting,
  letterTitle,
  recipientType,
  recipientName,
  recipientEmail,
  deliveryChannels,
  deliveryDate,
  eligibility,
  shippingAddress,
  printOptions,
  // Seal Celebration
  showCelebration,
  onCelebrationChange,
  onCelebrationComplete,
  // Physical Mail
  showTrialModal,
  onTrialModalChange,
  showUpgradeModal,
  onUpgradeModalChange,
}: LetterModalsProps) {
  const hasPhysicalSelected = deliveryChannels.includes("physical")

  return (
    <>
      {/* Seal Confirmation Modal */}
      {deliveryDate && (
        <SealConfirmationV3
          open={showSealConfirmation}
          onOpenChange={onSealConfirmationChange}
          onConfirm={onConfirmSeal}
          isSubmitting={isSubmitting}
          letterTitle={letterTitle}
          recipientType={recipientType}
          recipientName={recipientName}
          recipientEmail={recipientEmail}
          deliveryChannels={deliveryChannels}
          deliveryDate={deliveryDate}
          eligibility={eligibility}
          shippingAddress={shippingAddress}
          printOptions={hasPhysicalSelected ? printOptions : undefined}
        />
      )}

      {/* Seal Celebration Modal */}
      {deliveryDate && (
        <SealCelebrationV3
          open={showCelebration}
          onOpenChange={onCelebrationChange}
          letterTitle={letterTitle || "Untitled Letter"}
          deliveryDate={deliveryDate}
          recipientEmail={recipientEmail}
          onComplete={onCelebrationComplete}
        />
      )}

      {/* Physical Mail Trial Modal */}
      <PhysicalMailTrialModal
        open={showTrialModal}
        onOpenChange={onTrialModalChange}
      />

      {/* Physical Mail Upgrade Modal */}
      <PhysicalMailUpgradeModal
        open={showUpgradeModal}
        onOpenChange={onUpgradeModalChange}
      />
    </>
  )
}
