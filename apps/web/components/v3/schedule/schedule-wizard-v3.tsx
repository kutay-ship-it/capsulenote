"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, setHours, setMinutes } from "date-fns"
import { fromZonedTime } from "date-fns-tz"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCreditsUpdateListener } from "@/hooks/use-credits-broadcast"
import { getDeliveryEligibility } from "@/server/actions/entitlements"
import { DateSelectorV3 } from "./date-selector-v3"
import { DeliveryCountdownV3 } from "./delivery-countdown-v3"
import { TimelineVisualizerV3 } from "./timeline-visualizer-v3"
import { TimePickerV3 } from "./time-picker-v3"
import { ChannelSelectorV3, type DeliveryChannel } from "./channel-selector-v3"
import { EmailConfigV3 } from "./email-config-v3"
import { MailConfigV3, type MailDeliveryMode, type PrintOptions } from "./mail-config-v3"
import { ScheduleSummaryV3 } from "./schedule-summary-v3"
import { SealAnimationV3 } from "./seal-animation-v3"
import { ExistingDeliveriesBannerV3 } from "./existing-deliveries-banner-v3"
import { PhysicalMailTrialModal } from "@/components/v3/physical-mail-trial-modal"
import { PhysicalMailUpgradeModal } from "@/components/v3/physical-mail-upgrade-modal"
import { scheduleDelivery } from "@/server/actions/deliveries"
import type { ShippingAddress } from "@/server/actions/addresses"
import type { DeliveryChannel as PrismaDeliveryChannel, DeliveryStatus } from "@prisma/client"

type WizardStep = 1 | 2 | 3

interface ExistingDelivery {
  id: string
  channel: PrismaDeliveryChannel
  status: DeliveryStatus
  deliverAt: Date
  emailDelivery?: {
    toEmail: string
    subject: string
  } | null
  mailDelivery?: {
    shippingAddressId: string
  } | null
}

interface ScheduleWizardV3Props {
  letterId: string
  letterTitle: string
  userEmail: string
  userTimezone: string
  userBirthday?: Date
  emailCredits: number
  physicalCredits: number
  isPhysicalLocked?: boolean
  canShowTrialOffer?: boolean
  // Eligibility flags for internal upsell modal logic
  isDigitalCapsule?: boolean
  canPurchasePhysicalTrial?: boolean
  hasUsedPhysicalTrial?: boolean
  existingDeliveries?: ExistingDelivery[]
}

interface WizardState {
  // Step 1: Date & Time
  deliveryDate: Date | undefined
  deliveryTime: string
  showTimeline: boolean
  // Step 2: Channel & Config
  channels: DeliveryChannel[]
  recipientType: "myself" | "someone-else"
  recipientEmail: string
  recipientName: string
  emailSubject: string
  mailDeliveryMode: MailDeliveryMode
  selectedAddressId: string | null
  selectedAddress: ShippingAddress | null
  printOptions: PrintOptions
}

const STEPS: { number: WizardStep; label: string }[] = [
  { number: 1, label: "Date & Time" },
  { number: 2, label: "Delivery" },
  { number: 3, label: "Confirm" },
]

export function ScheduleWizardV3({
  letterId,
  letterTitle,
  userEmail,
  userTimezone,
  userBirthday,
  emailCredits,
  physicalCredits,
  isPhysicalLocked = false,
  canShowTrialOffer = false,
  isDigitalCapsule = false,
  canPurchasePhysicalTrial = false,
  hasUsedPhysicalTrial = false,
  existingDeliveries = [],
}: ScheduleWizardV3Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial step from URL or default to 1
  const initialStep = (parseInt(searchParams.get("step") || "1", 10) as WizardStep) || 1
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(initialStep)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showCelebration, setShowCelebration] = React.useState(false)

  // Upsell modal state
  const [showTrialModal, setShowTrialModal] = React.useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)

  // Track if user was trying to select physical mail when upsell triggered
  const [pendingMailSelection, setPendingMailSelection] = React.useState(false)

  // Dynamic eligibility state that can be refreshed
  const [currentEligibility, setCurrentEligibility] = React.useState({
    physicalCredits,
    canPurchasePhysicalTrial,
    hasUsedPhysicalTrial,
    isDigitalCapsule,
  })

  // Wizard state (moved up so refreshEligibility can access it)
  const [state, setState] = React.useState<WizardState>({
    deliveryDate: undefined,
    deliveryTime: "09:00",
    showTimeline: false,
    channels: ["email"],
    recipientType: "myself",
    recipientEmail: userEmail,
    recipientName: "",
    emailSubject: "",
    mailDeliveryMode: "arrive_by",
    selectedAddressId: null,
    selectedAddress: null,
    printOptions: { color: false, doubleSided: true },
  })

  // Refresh eligibility data from server
  const refreshEligibility = React.useCallback(async () => {
    try {
      const freshEligibility = await getDeliveryEligibility()
      setCurrentEligibility({
        physicalCredits: freshEligibility.physicalCredits,
        canPurchasePhysicalTrial: freshEligibility.canPurchasePhysicalTrial,
        hasUsedPhysicalTrial: freshEligibility.hasUsedPhysicalTrial,
        isDigitalCapsule: freshEligibility.isDigitalCapsule,
      })

      // If user was trying to select mail and now has credits, auto-select mail
      if (pendingMailSelection && freshEligibility.physicalCredits > 0) {
        if (!state.channels.includes("mail")) {
          setState(prev => ({
            ...prev,
            channels: [...prev.channels, "mail"]
          }))
        }
        setPendingMailSelection(false)
        toast.success("Physical mail unlocked!", {
          description: "You can now configure your physical letter delivery.",
        })
      }
    } catch (error) {
      console.error("Failed to refresh eligibility:", error)
    }
  }, [pendingMailSelection, state.channels])

  // Listen for credit updates from other tabs (e.g., after Stripe checkout)
  useCreditsUpdateListener(refreshEligibility)

  // Derive current locked/trial states from dynamic eligibility
  const currentIsPhysicalLocked =
    currentEligibility.isDigitalCapsule &&
    currentEligibility.physicalCredits <= 0 &&
    !currentEligibility.canPurchasePhysicalTrial &&
    currentEligibility.hasUsedPhysicalTrial

  const currentCanShowTrialOffer =
    currentEligibility.isDigitalCapsule &&
    currentEligibility.physicalCredits <= 0 &&
    currentEligibility.canPurchasePhysicalTrial

  // Handler for when user clicks locked physical mail (triggers appropriate upsell modal)
  const handlePhysicalUpsellTriggered = React.useCallback(() => {
    // Mark that user wants to select physical mail
    setPendingMailSelection(true)

    // If user can purchase trial, show trial modal ($4.99)
    if (currentEligibility.canPurchasePhysicalTrial) {
      setShowTrialModal(true)
      return
    }
    // If user has used trial but no credits (needs upgrade), show upgrade modal
    if (currentEligibility.hasUsedPhysicalTrial && currentEligibility.physicalCredits <= 0) {
      setShowUpgradeModal(true)
      return
    }
    // Fallback: show upgrade modal
    setShowUpgradeModal(true)
  }, [currentEligibility])

  // Handle modal close - refresh eligibility to check if user now has credits
  const handleTrialModalClose = React.useCallback((open: boolean) => {
    setShowTrialModal(open)
    if (!open) {
      // Modal was closed - refresh eligibility in case user purchased
      refreshEligibility()
    }
  }, [refreshEligibility])

  const handleUpgradeModalClose = React.useCallback((open: boolean) => {
    setShowUpgradeModal(open)
    if (!open) {
      // Modal was closed - refresh eligibility in case user upgraded
      refreshEligibility()
    }
  }, [refreshEligibility])

  // Update URL when step changes
  React.useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("step", currentStep.toString())
    window.history.replaceState({}, "", url.toString())
  }, [currentStep])

  // Validation
  const canProceedStep1 = state.deliveryDate !== undefined
  const canProceedStep2 = (() => {
    if (state.channels.length === 0) return false
    if (state.channels.includes("email")) {
      if (!state.recipientEmail) return false
    }
    if (state.channels.includes("mail")) {
      if (!state.selectedAddressId) return false
    }
    return true
  })()

  // Navigation
  const goToStep = (step: WizardStep) => {
    if (step === 2 && !canProceedStep1) {
      toast.error("Please select a delivery date")
      return
    }
    if (step === 3 && !canProceedStep2) {
      toast.error("Please complete all delivery settings")
      return
    }
    setCurrentStep(step)
  }

  const handleNext = () => {
    if (currentStep < 3) {
      goToStep((currentStep + 1) as WizardStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as WizardStep)
    } else {
      // Go back to letter detail page
      router.push(`/letters/${letterId}`)
    }
  }

  // Build delivery date with time
  const getDeliveryDateTime = (): Date | undefined => {
    if (!state.deliveryDate) return undefined
    const parts = state.deliveryTime.split(":").map(Number)
    const hours = parts[0] ?? 9
    const minutes = parts[1] ?? 0
    let dateWithTime = setHours(state.deliveryDate, hours)
    dateWithTime = setMinutes(dateWithTime, minutes)
    // Convert to UTC using user's timezone
    return fromZonedTime(dateWithTime, userTimezone)
  }

  // Track which channels have been successfully scheduled (prevents double submission)
  const [scheduledChannels, setScheduledChannels] = React.useState<Set<DeliveryChannel>>(new Set())

  // Submit handler
  const handleConfirm = async () => {
    // Prevent double submission
    if (isSubmitting) {
      return
    }

    const deliverAt = getDeliveryDateTime()
    if (!deliverAt) {
      toast.error("Please select a delivery date")
      return
    }

    setIsSubmitting(true)

    try {
      // Schedule each channel that hasn't been scheduled yet
      const channelsToSchedule = state.channels.filter(
        (channel) => !scheduledChannels.has(channel)
      )

      for (const channel of channelsToSchedule) {
        const result = await scheduleDelivery({
          letterId,
          channel: channel === "email" ? "email" : "mail",
          deliverAt,
          timezone: userTimezone,
          // Email specific
          ...(channel === "email" && {
            recipientEmail: state.recipientEmail,
            recipientName: state.recipientType === "someone-else" ? state.recipientName : undefined,
            subject: state.emailSubject || undefined,
          }),
          // Mail specific
          ...(channel === "mail" && {
            shippingAddressId: state.selectedAddressId!,
            mailDeliveryMode: state.mailDeliveryMode,
            printOptions: state.printOptions,
          }),
        })

        if (!result.success) {
          // Check if it's a duplicate error (already scheduled)
          if (result.error?.code === "DUPLICATE_ENTRY") {
            // Mark as scheduled since it already exists
            setScheduledChannels((prev) => new Set([...prev, channel]))
            toast.info(`${channel === "email" ? "Email" : "Physical mail"} delivery already scheduled`)
            continue
          }

          toast.error(`Failed to schedule ${channel}`, {
            description: result.error?.message || "Unknown error",
          })
          setIsSubmitting(false)
          return
        }

        // Mark channel as successfully scheduled
        setScheduledChannels((prev) => new Set([...prev, channel]))
      }

      // Show celebration animation
      setShowCelebration(true)
    } catch (error) {
      console.error("Failed to schedule delivery:", error)
      toast.error("Failed to schedule delivery", {
        description: "Please try again",
      })
      setIsSubmitting(false)
    }
  }

  // Celebration complete handler
  const handleCelebrationComplete = () => {
    router.push(`/letters/${letterId}`)
  }

  // Update state helpers
  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const deliveryDateTime = getDeliveryDateTime()

  return (
    <>
      {/* Celebration Modal */}
      <SealAnimationV3
        open={showCelebration}
        onOpenChange={setShowCelebration}
        letterTitle={letterTitle}
        deliveryDate={deliveryDateTime || new Date()}
        recipientEmail={state.recipientEmail}
        onComplete={handleCelebrationComplete}
      />

      <div className="min-h-screen bg-duck-cream">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b-2 border-charcoal bg-white">
          <div className="mx-auto max-w-2xl px-4 py-4">
            {/* Back Button & Title */}
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white hover:bg-duck-cream transition-colors"
                style={{ borderRadius: "2px" }}
              >
                <ArrowLeft className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                  Schedule Delivery
                </p>
                <p className="font-mono text-sm font-bold text-charcoal truncate">
                  &ldquo;{letterTitle}&rdquo;
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.number}>
                  <button
                    type="button"
                    onClick={() => goToStep(step.number)}
                    disabled={
                      (step.number === 2 && !canProceedStep1) ||
                      (step.number === 3 && !canProceedStep2)
                    }
                    className="flex items-center gap-2 group"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center border-2 border-charcoal font-mono text-xs font-bold transition-colors",
                        currentStep === step.number
                          ? "bg-duck-blue text-charcoal"
                          : currentStep > step.number
                            ? "bg-teal-primary text-white"
                            : "bg-white text-charcoal/50 group-hover:bg-duck-cream group-disabled:opacity-50"
                      )}
                      style={{ borderRadius: "50%" }}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-4 w-4" strokeWidth={3} />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold uppercase tracking-wider hidden sm:block",
                        currentStep === step.number
                          ? "text-charcoal"
                          : "text-charcoal/50"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        currentStep > step.number ? "bg-teal-primary" : "bg-charcoal/20"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Existing Deliveries Banner */}
          {existingDeliveries.length > 0 && (
            <div className="mb-8">
              <ExistingDeliveriesBannerV3
                deliveries={existingDeliveries}
                letterId={letterId}
              />
            </div>
          )}

          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Date Selector */}
              <DateSelectorV3
                value={state.deliveryDate}
                onChange={(date) => updateState("deliveryDate", date)}
                userBirthday={userBirthday}
                minDate={new Date()}
              />

              {/* Time Picker (shown after date selected) */}
              {state.deliveryDate && (
                <>
                  <div className="border-t-2 border-dashed border-charcoal/20 pt-8">
                    <TimePickerV3
                      value={state.deliveryTime}
                      onChange={(time) => updateState("deliveryTime", time)}
                      timezone={userTimezone}
                    />
                  </div>

                  {/* Countdown Display */}
                  <div className="border-t-2 border-dashed border-charcoal/20 pt-8">
                    <DeliveryCountdownV3
                      deliveryDate={state.deliveryDate}
                      timezone={userTimezone}
                      showTimeline={state.showTimeline}
                      onToggleTimeline={() => updateState("showTimeline", !state.showTimeline)}
                    />
                  </div>

                  {/* Timeline Visualizer (expandable) */}
                  {state.showTimeline && (
                    <TimelineVisualizerV3
                      deliveryDate={state.deliveryDate}
                      channel={state.channels.includes("mail") ? "mail" : "email"}
                      mailDeliveryMode={state.mailDeliveryMode}
                    />
                  )}
                </>
              )}

              {/* Next Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="w-full gap-2 h-14 bg-duck-blue hover:bg-duck-blue/90 text-charcoal font-mono text-sm uppercase tracking-wider border-2 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] hover:shadow-[6px_6px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-[4px_4px_0_theme(colors.charcoal)] disabled:hover:translate-y-0"
                  style={{ borderRadius: "2px" }}
                >
                  Continue to Delivery
                  <ArrowRight className="h-5 w-5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Channel & Config */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Channel Selector */}
              <ChannelSelectorV3
                value={state.channels}
                onChange={(channels) => updateState("channels", channels)}
                emailCredits={emailCredits}
                physicalCredits={currentEligibility.physicalCredits}
                isPhysicalLocked={currentIsPhysicalLocked}
                canShowTrialOffer={currentCanShowTrialOffer}
                onPhysicalUpsellTriggered={handlePhysicalUpsellTriggered}
              />

              {/* Email Config */}
              {state.channels.includes("email") && (
                <div className="border-t-2 border-dashed border-charcoal/20 pt-8">
                  <EmailConfigV3
                    recipientType={state.recipientType}
                    onRecipientTypeChange={(type) => {
                      updateState("recipientType", type)
                      if (type === "myself") {
                        updateState("recipientEmail", userEmail)
                      }
                    }}
                    recipientEmail={state.recipientEmail}
                    onRecipientEmailChange={(email) => updateState("recipientEmail", email)}
                    recipientName={state.recipientName}
                    onRecipientNameChange={(name) => updateState("recipientName", name)}
                    userEmail={userEmail}
                    subject={state.emailSubject}
                    onSubjectChange={(subject) => updateState("emailSubject", subject)}
                  />
                </div>
              )}

              {/* Mail Config */}
              {state.channels.includes("mail") && state.deliveryDate && (
                <div className="border-t-2 border-dashed border-charcoal/20 pt-8">
                  <MailConfigV3
                    deliveryDate={state.deliveryDate}
                    deliveryMode={state.mailDeliveryMode}
                    onDeliveryModeChange={(mode) => updateState("mailDeliveryMode", mode)}
                    selectedAddressId={state.selectedAddressId}
                    onAddressChange={(id, address) => {
                      updateState("selectedAddressId", id)
                      updateState("selectedAddress", address || null)
                    }}
                    selectedAddress={state.selectedAddress}
                    printOptions={state.printOptions}
                    onPrintOptionsChange={(options) => updateState("printOptions", options)}
                  />
                </div>
              )}

              {/* Next Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="w-full gap-2 h-14 bg-duck-blue hover:bg-duck-blue/90 text-charcoal font-mono text-sm uppercase tracking-wider border-2 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] hover:shadow-[6px_6px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-[4px_4px_0_theme(colors.charcoal)] disabled:hover:translate-y-0"
                  style={{ borderRadius: "2px" }}
                >
                  Review & Confirm
                  <ArrowRight className="h-5 w-5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Summary & Confirm */}
          {currentStep === 3 && state.deliveryDate && (
            <ScheduleSummaryV3
              letterTitle={letterTitle}
              deliveryDate={state.deliveryDate}
              deliveryTime={state.deliveryTime}
              timezone={userTimezone}
              channels={state.channels}
              recipientType={state.recipientType}
              recipientEmail={state.recipientEmail}
              recipientName={state.recipientName}
              mailDeliveryMode={state.mailDeliveryMode}
              shippingAddress={state.selectedAddress}
              printOptions={state.printOptions}
              emailCredits={emailCredits}
              physicalCredits={physicalCredits}
              onConfirm={handleConfirm}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Physical Mail Upsell Modals */}
      <PhysicalMailTrialModal
        open={showTrialModal}
        onOpenChange={handleTrialModalClose}
      />
      <PhysicalMailUpgradeModal
        open={showUpgradeModal}
        onOpenChange={handleUpgradeModalClose}
      />
    </>
  )
}
