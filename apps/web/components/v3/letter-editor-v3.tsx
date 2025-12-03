"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import {
  Mail,
  Calendar,
  Clock,
  AtSign,
  PenLine,
  Settings,
  User,
  Users,
  Sparkles,
  Truck,
  MapPin,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"

import { cn } from "@/lib/utils"
import { useCreditsUpdateListener } from "@/hooks/use-credits-broadcast"
import { useLetterAutosave } from "@/hooks/use-letter-autosave"
import { useDraftRestoration, emptyFormState } from "@/hooks/use-draft-restoration"
import { clearLetterAutosave } from "@/lib/localStorage-letter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LetterEditor } from "@/components/letter-editor"
import { DatePicker } from "@/components/ui/date-picker"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { getUserTimezone } from "@/lib/utils"
import { TemplateSelectorV3 } from "@/components/v3/template-selector-v3"
import { DeliveryTypeV3, type DeliveryChannel } from "@/components/v3/delivery-type-v3"
import { AddressSelectorV3 } from "@/components/v3/address-selector-v3"
import { LetterModals, LetterFormActions } from "@/components/v3/letter-editor"
import { PrintOptionsV3, type PrintOptions } from "@/components/v3/print-options-v3"
import type { LetterTemplate } from "@/server/actions/templates"
import type { DeliveryEligibility } from "@/server/lib/entitlement-types"
import type { ShippingAddress } from "@/server/actions/addresses"

type RecipientType = "myself" | "someone-else"

interface LetterFormData {
  title: string
  bodyRich: Record<string, unknown> | null
  bodyHtml: string
  recipientType: RecipientType
  recipientName: string
  recipientEmail: string
  deliveryDate: Date | undefined
}

const DATE_PRESETS = [
  { months: 6, key: "6mo" },
  { months: 12, key: "1yr" },
  { months: 36, key: "3yr" },
  { months: 60, key: "5yr" },
  { months: 120, key: "10yr" },
] as const

// ============================================================================
// State Types & Reducers (TICKET-015: Reduce 21 useState to 4 useReducer)
// ============================================================================

interface FormState {
  title: string
  bodyRich: Record<string, unknown> | null
  bodyHtml: string
  recipientType: RecipientType
  recipientName: string
  recipientEmail: string
  deliveryChannels: DeliveryChannel[]
  deliveryDate: Date | undefined
  selectedPreset: string | null
}

interface PhysicalMailState {
  selectedAddressId: string | null
  selectedAddress: ShippingAddress | null
  printOptions: PrintOptions
}

interface ModalState {
  showCustomDate: boolean
  showSealConfirmation: boolean
  showCelebration: boolean
  showTrialModal: boolean
  showUpgradeModal: boolean
}

interface UIState {
  errors: Partial<Record<keyof LetterFormData, string>>
  restoredFromDraft: boolean
  sealedLetterId: string | null
}

type FormAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_BODY"; payload: { rich: Record<string, unknown> | null; html: string } }
  | { type: "SET_RECIPIENT_TYPE"; payload: RecipientType }
  | { type: "SET_RECIPIENT_NAME"; payload: string }
  | { type: "SET_RECIPIENT_EMAIL"; payload: string }
  | { type: "SET_DELIVERY_CHANNELS"; payload: DeliveryChannel[] }
  | { type: "SET_DELIVERY_DATE"; payload: { date: Date | undefined; preset: string | null } }
  | { type: "RESTORE_DRAFT"; payload: Partial<FormState> }
  | { type: "CLEAR_FORM" }

type PhysicalMailAction =
  | { type: "SET_ADDRESS"; payload: { id: string | null; address: ShippingAddress | null } }
  | { type: "SET_PRINT_OPTIONS"; payload: PrintOptions }
  | { type: "CLEAR" }

type ModalAction =
  | { type: "SET_CUSTOM_DATE"; payload: boolean }
  | { type: "SET_SEAL_CONFIRMATION"; payload: boolean }
  | { type: "SET_CELEBRATION"; payload: boolean }
  | { type: "SET_TRIAL_MODAL"; payload: boolean }
  | { type: "SET_UPGRADE_MODAL"; payload: boolean }

type UIAction =
  | { type: "SET_ERROR"; payload: { field: keyof LetterFormData; message: string | undefined } }
  | { type: "SET_ERRORS"; payload: Partial<Record<keyof LetterFormData, string>> }
  | { type: "SET_RESTORED"; payload: boolean }
  | { type: "SET_SEALED_LETTER_ID"; payload: string | null }
  | { type: "CLEAR_ERRORS" }

const initialFormState: FormState = {
  title: "",
  bodyRich: null,
  bodyHtml: "",
  recipientType: "myself",
  recipientName: "",
  recipientEmail: "",
  deliveryChannels: ["email"],
  deliveryDate: undefined,
  selectedPreset: null,
}

const initialPhysicalMailState: PhysicalMailState = {
  selectedAddressId: null,
  selectedAddress: null,
  printOptions: { color: false, doubleSided: false },
}

const initialModalState: ModalState = {
  showCustomDate: false,
  showSealConfirmation: false,
  showCelebration: false,
  showTrialModal: false,
  showUpgradeModal: false,
}

const initialUIState: UIState = {
  errors: {},
  restoredFromDraft: false,
  sealedLetterId: null,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload }
    case "SET_BODY":
      return { ...state, bodyRich: action.payload.rich, bodyHtml: action.payload.html }
    case "SET_RECIPIENT_TYPE":
      return { ...state, recipientType: action.payload }
    case "SET_RECIPIENT_NAME":
      return { ...state, recipientName: action.payload }
    case "SET_RECIPIENT_EMAIL":
      return { ...state, recipientEmail: action.payload }
    case "SET_DELIVERY_CHANNELS":
      return { ...state, deliveryChannels: action.payload }
    case "SET_DELIVERY_DATE":
      return { ...state, deliveryDate: action.payload.date, selectedPreset: action.payload.preset }
    case "RESTORE_DRAFT":
      return { ...state, ...action.payload }
    case "CLEAR_FORM":
      return initialFormState
    default:
      return state
  }
}

function physicalMailReducer(state: PhysicalMailState, action: PhysicalMailAction): PhysicalMailState {
  switch (action.type) {
    case "SET_ADDRESS":
      return { ...state, selectedAddressId: action.payload.id, selectedAddress: action.payload.address }
    case "SET_PRINT_OPTIONS":
      return { ...state, printOptions: action.payload }
    case "CLEAR":
      return initialPhysicalMailState
    default:
      return state
  }
}

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "SET_CUSTOM_DATE":
      return { ...state, showCustomDate: action.payload }
    case "SET_SEAL_CONFIRMATION":
      return { ...state, showSealConfirmation: action.payload }
    case "SET_CELEBRATION":
      return { ...state, showCelebration: action.payload }
    case "SET_TRIAL_MODAL":
      return { ...state, showTrialModal: action.payload }
    case "SET_UPGRADE_MODAL":
      return { ...state, showUpgradeModal: action.payload }
    default:
      return state
  }
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.payload.field]: action.payload.message } }
    case "SET_ERRORS":
      return { ...state, errors: action.payload }
    case "SET_RESTORED":
      return { ...state, restoredFromDraft: action.payload }
    case "SET_SEALED_LETTER_ID":
      return { ...state, sealedLetterId: action.payload }
    case "CLEAR_ERRORS":
      return { ...state, errors: {} }
    default:
      return state
  }
}

// ============================================================================

interface LetterEditorV3Props {
  eligibility: DeliveryEligibility
  onRefreshEligibility?: () => Promise<void>
}

export function LetterEditorV3({ eligibility, onRefreshEligibility }: LetterEditorV3Props) {
  const t = useTranslations("letters.editor")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timezone = getUserTimezone()
  const [currentEligibility, setCurrentEligibility] = React.useState(eligibility)

  // Reducer-based state management (TICKET-015: 21 useState → 4 useReducer)
  const [formState, dispatchForm] = React.useReducer(formReducer, initialFormState)
  const [physicalMailState, dispatchPhysicalMail] = React.useReducer(physicalMailReducer, initialPhysicalMailState)
  const [modalState, dispatchModal] = React.useReducer(modalReducer, initialModalState)
  const [uiState, dispatchUI] = React.useReducer(uiReducer, initialUIState)

  // Destructure for convenient access (maintains API compatibility)
  const { title, bodyRich, bodyHtml, recipientType, recipientName, recipientEmail, deliveryChannels, deliveryDate, selectedPreset } = formState
  const { selectedAddressId, selectedAddress, printOptions } = physicalMailState
  const { showCustomDate, showSealConfirmation, showCelebration, showTrialModal, showUpgradeModal } = modalState
  const { errors, restoredFromDraft, sealedLetterId } = uiState

  // Draft restoration hook - handles loading drafts from localStorage
  const { draft, toastMessage, clearDraft } = useDraftRestoration()

  // Auto-save hook - saves form state to localStorage
  const { save: saveCurrentDraft, clear: clearAutosave } = useLetterAutosave(
    {
      title,
      bodyRich,
      bodyHtml,
      recipientType,
      recipientName,
      recipientEmail,
      deliveryChannels,
      deliveryDate: deliveryDate ?? null,
      selectedPreset,
      selectedAddressId,
      printOptions,
    },
    { enabled: !showCelebration }
  )

  // Apply restored draft to form state
  React.useEffect(() => {
    if (draft) {
      dispatchForm({
        type: "RESTORE_DRAFT",
        payload: {
          title: draft.title,
          bodyRich: draft.bodyRich as Record<string, unknown> | null,
          bodyHtml: draft.bodyHtml,
          recipientType: draft.recipientType,
          recipientName: draft.recipientName,
          recipientEmail: draft.recipientEmail,
          deliveryChannels: draft.deliveryChannels,
          deliveryDate: draft.deliveryDate ?? undefined,
          selectedPreset: draft.selectedPreset,
        },
      })
      dispatchPhysicalMail({ type: "SET_ADDRESS", payload: { id: draft.selectedAddressId, address: null } })
      dispatchPhysicalMail({ type: "SET_PRINT_OPTIONS", payload: draft.printOptions })
      dispatchUI({ type: "SET_RESTORED", payload: true })
    }
  }, [draft])

  // Show toast when draft is restored
  React.useEffect(() => {
    if (toastMessage) {
      toast.info(toastMessage.title, {
        description: toastMessage.description,
        action: {
          label: t("clearButton"),
          onClick: () => {
            clearDraft()
            clearAutosave()
            // Reset all state to initial values
            dispatchForm({ type: "CLEAR_FORM" })
            dispatchPhysicalMail({ type: "CLEAR" })
            dispatchUI({ type: "SET_RESTORED", payload: false })
            dispatchUI({ type: "CLEAR_ERRORS" })
            toast.success(t("toasts.draftCleared"))
          },
        },
      })
    }
  }, [toastMessage, clearDraft, clearAutosave, t])

  // Word/char count (moved up for dependency ordering)
  const plainText = bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  // Track if form has unsaved changes (for navigate-away warning)
  const hasUnsavedChanges = React.useMemo(() => {
    return title.trim() !== "" || plainText !== ""
  }, [title, plainText])

  // Navigate-away warning for unsaved content
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !showCelebration) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, showCelebration])

  // Handle credits_added query param after Stripe return
  React.useEffect(() => {
    const creditsAdded = searchParams.get("credits_added")
    if (creditsAdded === "true" && onRefreshEligibility) {
      // Clear the query param from URL without navigation
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("credits_added")
      window.history.replaceState({}, "", newUrl.toString())

      // Refresh eligibility data
      onRefreshEligibility()
        .then(() => {
          toast.success(t("toasts.creditsAdded"), {
            description: t("toasts.creditsRefreshed"),
          })
        })
        .catch(() => {
          toast.error(t("toasts.creditsRefreshFailed"), {
            description: t("toasts.pleaseRefreshPage"),
          })
        })
    }
  }, [searchParams, onRefreshEligibility, t])

  // Ref to track in-flight eligibility refresh requests (prevents race conditions)
  const refreshInFlightRef = React.useRef(false)

  // Update currentEligibility when prop changes (after refresh)
  // Only update if no refresh is in-flight to prevent stale data overwriting fresh data
  React.useEffect(() => {
    if (!refreshInFlightRef.current) {
      setCurrentEligibility(eligibility)
    }
  }, [eligibility])

  // Listen for credit updates from other tabs (e.g., after Stripe checkout in new tab)
  useCreditsUpdateListener(
    React.useCallback(() => {
      // Prevent overlapping refresh requests
      if (refreshInFlightRef.current) return

      refreshInFlightRef.current = true
      onRefreshEligibility?.()
        .then(() => {
          toast.success(t("toasts.creditsUpdated"), {
            description: t("toasts.purchaseSuccessful"),
          })
        })
        .catch((error) => {
          console.error("[LetterEditor] Failed to refresh eligibility", error)
        })
        .finally(() => {
          refreshInFlightRef.current = false
        })
    }, [onRefreshEligibility, t])
  )

  // Track if physical delivery is selected
  const hasPhysicalSelected = deliveryChannels.includes("physical")

  // Credit eligibility checks
  const canScheduleSelectedChannels = React.useMemo(() => {
    const needsEmail = deliveryChannels.includes("email")
    const needsPhysical = deliveryChannels.includes("physical")

    // Check if all selected channels can be scheduled
    if (needsEmail && !currentEligibility.canScheduleEmail) return false
    if (needsPhysical && !currentEligibility.canSchedulePhysical) return false

    // Physical mail requires an address to be selected
    if (needsPhysical && !selectedAddressId) return false

    // Must have at least one channel selected
    return deliveryChannels.length > 0
  }, [deliveryChannels, currentEligibility, selectedAddressId])

  // Compute if there are any credit shortages for selected channels
  const hasInsufficientCredits = React.useMemo(() => {
    const needsEmail = deliveryChannels.includes("email")
    const needsPhysical = deliveryChannels.includes("physical")

    return (
      (needsEmail && currentEligibility.emailCredits <= 0) ||
      (needsPhysical && currentEligibility.physicalCredits <= 0)
    )
  }, [deliveryChannels, currentEligibility])

  const handlePresetDate = (months: number, key: string) => {
    const today = new Date()
    const futureDate = new Date(today.setMonth(today.getMonth() + months))
    dispatchForm({ type: "SET_DELIVERY_DATE", payload: { date: futureDate, preset: key } })
    dispatchModal({ type: "SET_CUSTOM_DATE", payload: false })
    if (errors.deliveryDate) {
      dispatchUI({ type: "SET_ERROR", payload: { field: "deliveryDate", message: undefined } })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    dispatchForm({ type: "SET_DELIVERY_DATE", payload: { date, preset: null } })
    if (errors.deliveryDate) {
      dispatchUI({ type: "SET_ERROR", payload: { field: "deliveryDate", message: undefined } })
    }
  }

  const handleRecipientTypeChange = (type: RecipientType) => {
    dispatchForm({ type: "SET_RECIPIENT_TYPE", payload: type })
    // Clear recipient fields when switching
    if (type === "myself") {
      dispatchForm({ type: "SET_RECIPIENT_NAME", payload: "" })
    }
    dispatchForm({ type: "SET_RECIPIENT_EMAIL", payload: "" })
    dispatchUI({ type: "SET_ERRORS", payload: { ...errors, recipientName: undefined, recipientEmail: undefined } })
  }

  const handleClearForm = () => {
    dispatchForm({ type: "CLEAR_FORM" })
    dispatchModal({ type: "SET_CUSTOM_DATE", payload: false })
    dispatchPhysicalMail({ type: "CLEAR" })
    dispatchUI({ type: "CLEAR_ERRORS" })
  }

  const handleAddressChange = (addressId: string | null, address?: ShippingAddress) => {
    dispatchPhysicalMail({ type: "SET_ADDRESS", payload: { id: addressId, address: address || null } })
  }

  // Handler for physical mail upsell - decides which modal to show
  const handlePhysicalUpsellTriggered = React.useCallback(() => {
    // If user can purchase trial, show trial modal
    if (currentEligibility.canPurchasePhysicalTrial) {
      dispatchModal({ type: "SET_TRIAL_MODAL", payload: true })
      return
    }
    // If user has used trial but no credits (needs upgrade), show upgrade modal
    if (currentEligibility.hasUsedPhysicalTrial && currentEligibility.physicalCredits <= 0) {
      dispatchModal({ type: "SET_UPGRADE_MODAL", payload: true })
      return
    }
    // Fallback: show upgrade modal
    dispatchModal({ type: "SET_UPGRADE_MODAL", payload: true })
  }, [currentEligibility])

  const handleTemplateSelect = (template: LetterTemplate) => {
    // Apply template content to the editor
    dispatchForm({ type: "SET_BODY", payload: { rich: null, html: template.promptText } })
    // Set title if empty
    if (!title.trim()) {
      dispatchForm({ type: "SET_TITLE", payload: template.title })
    }
    // Clear any content errors
    if (errors.bodyHtml) {
      dispatchUI({ type: "SET_ERROR", payload: { field: "bodyHtml", message: undefined } })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LetterFormData, string>> = {}

    if (!title.trim()) {
      newErrors.title = t("validation.titleRequired")
    }

    if (!plainText) {
      newErrors.bodyHtml = t("validation.contentRequired")
    }

    // Validate recipient name for "someone else"
    if (recipientType === "someone-else" && !recipientName.trim()) {
      newErrors.recipientName = t("validation.recipientNameRequired")
    }

    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = t("validation.emailRequired")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = t("validation.emailInvalid")
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = t("validation.dateRequired")
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deliveryDate < today) {
        newErrors.deliveryDate = t("validation.dateMustBeFuture")
      }
    }

    dispatchUI({ type: "SET_ERRORS", payload: newErrors })
    return Object.keys(newErrors).length === 0
  }

  // Open confirmation modal after validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !deliveryDate || isPending) return

    // Open confirmation modal instead of submitting directly
    dispatchModal({ type: "SET_SEAL_CONFIRMATION", payload: true })
  }

  // Actual submission after user confirms
  const handleConfirmSeal = () => {
    if (!deliveryDate || isPending) return

    startTransition(async () => {
      try {
        const result = await createLetter({
          title,
          bodyRich: bodyRich ?? { type: "doc", content: [] },
          bodyHtml: bodyHtml || "",
          tags: [],
          visibility: "private" as const,
        })

        if (result.success) {
          const letterId = result.data.letterId

          // Create delivery time in user's local timezone (9:00 AM on selected date)
          // Using date parts to avoid timezone offset issues with toISOString()
          const year = deliveryDate.getFullYear()
          const month = String(deliveryDate.getMonth() + 1).padStart(2, "0")
          const day = String(deliveryDate.getDate()).padStart(2, "0")
          const deliverAt = fromZonedTime(`${year}-${month}-${day}T09:00:00`, timezone)

          // Schedule deliveries for each selected channel with proper ActionResult handling
          const deliveryResults = await Promise.all(
            deliveryChannels.map(async (channel) => {
              const result = await scheduleDelivery({
                letterId,
                channel: channel === "physical" ? "mail" : "email",
                deliverAt,
                timezone,
                toEmail: channel === "email" ? recipientEmail : undefined,
                shippingAddressId: channel === "physical" ? selectedAddressId ?? undefined : undefined,
                printOptions: channel === "physical" ? printOptions : undefined,
              })
              return { channel, result }
            })
          )

          // Now properly detect failures from ActionResult
          const failures = deliveryResults.filter(({ result }) => !result.success)
          const successes = deliveryResults.filter(({ result }) => result.success)

          dispatchModal({ type: "SET_SEAL_CONFIRMATION", payload: false })

          if (failures.length === 0) {
            // All deliveries scheduled successfully - clear autosaved draft
            clearLetterAutosave()
            dispatchUI({ type: "SET_SEALED_LETTER_ID", payload: letterId })
            dispatchModal({ type: "SET_CELEBRATION", payload: true })
          } else if (successes.length > 0) {
            // Partial success - some deliveries failed but letter was saved
            clearLetterAutosave()
            const failedDetails = failures.map(({ channel, result }) => {
              const channelLabel = channel === "physical" ? t("toasts.physicalMail") : t("toasts.email")
              const errorMsg = !result.success ? result.error.message : t("toasts.unknownError")
              return `${channelLabel}: ${errorMsg}`
            })
            toast.warning(t("toasts.partialDelivery"), {
              description: failedDetails.join(". ") + ". " + t("toasts.retryFromPage"),
            })
            dispatchUI({ type: "SET_SEALED_LETTER_ID", payload: letterId })
            dispatchModal({ type: "SET_CELEBRATION", payload: true })
          } else {
            // All deliveries failed but letter was saved
            clearLetterAutosave()
            const firstError = failures[0]!
            const errorMessage = !firstError.result.success
              ? firstError.result.error.message
              : t("toasts.unknownError")
            toast.error(t("toasts.deliveryFailed"), {
              description: `${errorMessage}. ${t("toasts.retryFromPage")}`,
            })
            router.push(`/letters/${letterId}`)
          }
        } else {
          dispatchModal({ type: "SET_SEAL_CONFIRMATION", payload: false })
          if (result.error.code === "QUOTA_EXCEEDED") {
            toast.error(t("toasts.quotaExceeded"), {
              description: result.error.message,
              action: {
                label: t("toasts.upgrade"),
                onClick: () => router.push("/pricing"),
              },
            })
          } else {
            toast.error(t("toasts.createFailed"), {
              description: result.error.message,
            })
          }
        }
      } catch (error) {
        console.error("Letter creation error:", error)
        dispatchModal({ type: "SET_SEAL_CONFIRMATION", payload: false })
        toast.error(t("toasts.somethingWentWrong"), {
          description: t("toasts.tryAgainLater"),
        })
      }
    })
  }

  const handleCelebrationComplete = React.useCallback(() => {
    dispatchModal({ type: "SET_CELEBRATION", payload: false })
    if (sealedLetterId) {
      router.push(`/letters/${sealedLetterId}`)
    }
  }, [sealedLetterId, router])

  return (
    <form onSubmit={handleSubmit}>
      {/* Grid Layout: Editor Left, Settings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 items-start">
        {/* Left Column - Letter Editor */}
        <div
          className="relative border-2 border-charcoal bg-white p-6 md:p-8 shadow-[2px_2px_0_theme(colors.charcoal)] min-h-[720px] flex flex-col"
          style={{ borderRadius: "2px" }}
        >
          {/* Floating badge */}
          <div
            className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          {/* Mail stamp */}
          <div
            className="absolute -top-4 -right-4 w-14 h-14 border-2 border-charcoal bg-duck-blue flex items-center justify-center rotate-12 transition-transform duration-300 hover:rotate-0"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-7 w-7 text-charcoal" strokeWidth={2} />
          </div>

          <div className="flex flex-col flex-1 mt-4">
            {/* Title Field */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
              >
                {t("titleLabel")}
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  dispatchForm({ type: "SET_TITLE", payload: e.target.value })
                  if (errors.title) dispatchUI({ type: "SET_ERROR", payload: { field: "title", message: undefined } })
                }}
                placeholder={t("titlePlaceholder")}
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
                maxLength={100}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="font-mono text-xs text-coral">{errors.title}</p>
              )}
            </div>

            {/* Dashed separator */}
            <div className="w-full border-t-2 border-dashed border-charcoal/10 my-6" />

            {/* Content Field - Fills remaining space */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  {t("messageLabel")}
                </label>
                <div className="flex gap-3 font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                  <span>{wordCount} {t("words")}</span>
                  <span>{characterCount} {t("chars")}</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <LetterEditor
                  content={bodyRich || bodyHtml}
                  onChange={(json, html) => {
                    dispatchForm({ type: "SET_BODY", payload: { rich: json, html } })
                    if (errors.bodyHtml) dispatchUI({ type: "SET_ERROR", payload: { field: "bodyHtml", message: undefined } })
                  }}
                  placeholder={t("messagePlaceholder")}
                  className="flex-1 flex flex-col min-h-0"
                />
              </div>
              {errors.bodyHtml && (
                <p className="font-mono text-xs text-coral mt-2 flex-shrink-0">{errors.bodyHtml}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings Sidebar */}
        <div className="space-y-6">
          {/* Delivery Settings Card */}
          <div
            className="relative border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            {/* Floating badge */}
            <div
              className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-duck-blue font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{t("settingsBadge")}</span>
            </div>

            <div className="space-y-5 mt-4">
              {/* Recipient Type Selection */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <User className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("recipientLabel")}
                </label>

                {/* Recipient Type Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange("myself")}
                    className={cn(
                      "flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                      recipientType === "myself"
                        ? "bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                        : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-yellow"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    {t("myself")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange("someone-else")}
                    className={cn(
                      "flex items-center justify-center gap-2 border-2 border-charcoal px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                      recipientType === "someone-else"
                        ? "bg-teal-primary text-white shadow-[3px_3px_0_theme(colors.charcoal)]"
                        : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-teal-primary/20"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <Users className="h-3.5 w-3.5" strokeWidth={2} />
                    {t("someoneElse")}
                  </button>
                </div>

                {/* Recipient Name - Only for "Someone Else" */}
                {recipientType === "someone-else" && (
                  <div className="space-y-2 pt-2">
                    <label
                      htmlFor="recipientName"
                      className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
                    >
                      {t("theirName")}
                    </label>
                    <Input
                      id="recipientName"
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        dispatchForm({ type: "SET_RECIPIENT_NAME", payload: e.target.value })
                        if (errors.recipientName) dispatchUI({ type: "SET_ERROR", payload: { field: "recipientName", message: undefined } })
                      }}
                      placeholder={t("namePlaceholder")}
                      className="border-2 border-charcoal font-mono text-sm"
                      style={{ borderRadius: "2px" }}
                      aria-invalid={!!errors.recipientName}
                    />
                    {errors.recipientName && (
                      <p className="font-mono text-xs text-coral">{errors.recipientName}</p>
                    )}
                  </div>
                )}

                {/* Recipient Email */}
                <div className="space-y-2 pt-1">
                  <label
                    htmlFor="email"
                    className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70 flex items-center gap-1.5"
                  >
                    <AtSign className="h-3 w-3" strokeWidth={2} />
                    {recipientType === "myself" ? t("yourEmail") : t("theirEmail")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => {
                      dispatchForm({ type: "SET_RECIPIENT_EMAIL", payload: e.target.value })
                      if (errors.recipientEmail) dispatchUI({ type: "SET_ERROR", payload: { field: "recipientEmail", message: undefined } })
                    }}
                    placeholder={recipientType === "myself" ? t("yourEmailPlaceholder") : t("theirEmailPlaceholder")}
                    className="border-2 border-charcoal font-mono text-sm"
                    style={{ borderRadius: "2px" }}
                    aria-invalid={!!errors.recipientEmail}
                  />
                  {errors.recipientEmail && (
                    <p className="font-mono text-xs text-coral">{errors.recipientEmail}</p>
                  )}
                </div>
              </div>

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Delivery Method */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("deliveryMethodLabel")}
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  {t("deliveryMethodHint")}
                </p>
                <DeliveryTypeV3
                  value={deliveryChannels}
                  onChange={(channels) => dispatchForm({ type: "SET_DELIVERY_CHANNELS", payload: channels })}
                  eligibility={currentEligibility}
                  onPhysicalUpsellTriggered={handlePhysicalUpsellTriggered}
                />
              </div>

              {/* Physical Mail Address Section - shown when physical delivery selected */}
              {hasPhysicalSelected && (
                <>
                  {/* Dashed separator */}
                  <div className="w-full border-t-2 border-dashed border-charcoal/10" />

                  {/* Shipping Address */}
                  <div className="space-y-3">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                      {t("shippingAddressLabel")}
                    </label>
                    <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                      {t("shippingAddressHint")}
                    </p>
                    <AddressSelectorV3
                      value={selectedAddressId}
                      onChange={handleAddressChange}
                      disabled={isPending}
                    />
                  </div>

                  {/* Print Options - only show when address is selected */}
                  {selectedAddressId && (
                    <>
                      {/* Dashed separator */}
                      <div className="w-full border-t-2 border-dashed border-charcoal/10" />

                      <div className="space-y-3">
                        <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                          <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                          {t("printOptionsLabel")}
                        </label>
                        <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                          {t("printOptionsHint")}
                        </p>
                        <PrintOptionsV3
                          value={printOptions}
                          onChange={(options) => dispatchPhysicalMail({ type: "SET_PRINT_OPTIONS", payload: options })}
                          disabled={isPending}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Delivery Date */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("whenToDeliver")}
                </label>

                {/* Date Preset Buttons - 2 column grid */}
                <div className="grid grid-cols-2 gap-2">
                  {DATE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.key
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handlePresetDate(preset.months, preset.key)}
                        className={cn(
                          "border-2 border-charcoal px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                          "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                          isSelected
                            ? "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                            : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-yellow"
                        )}
                        style={{ borderRadius: "2px" }}
                      >
                        {t(`datePresets.${preset.key}`)}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      dispatchModal({ type: "SET_CUSTOM_DATE", payload: !showCustomDate })
                      if (!showCustomDate) dispatchForm({ type: "SET_DELIVERY_DATE", payload: { date: deliveryDate, preset: null } })
                    }}
                    className={cn(
                      "col-span-2 border-2 border-charcoal px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                      showCustomDate
                        ? "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                        : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {t("customDate")}
                  </button>
                </div>

                {/* Custom Date Picker */}
                {showCustomDate && (
                  <div className="pt-2">
                    <DatePicker
                      date={deliveryDate}
                      onSelect={handleDateSelect}
                      placeholder={t("pickDate")}
                      minDate={new Date()}
                    />
                  </div>
                )}

                {/* Selected Date Display */}
                {deliveryDate && (
                  <div
                    className="flex items-center gap-3 p-3 border-2 border-duck-blue bg-duck-blue/10"
                    style={{ borderRadius: "2px" }}
                  >
                    <Clock className="h-4 w-4 text-duck-blue flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal">
                        {t("scheduledFor")}
                      </p>
                      <p className="font-mono text-xs text-charcoal truncate">
                        {deliveryDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {errors.deliveryDate && (
                  <p className="font-mono text-xs text-coral">{errors.deliveryDate}</p>
                )}
              </div>

              {/* Dashed separator */}
              <div className="w-full border-t-2 border-dashed border-charcoal/10" />

              {/* Templates Section */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("templatesLabel")}
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  {t("templatesHint")}
                </p>
                <TemplateSelectorV3 onSelect={handleTemplateSelect} />
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <LetterFormActions
            isPending={isPending}
            canScheduleSelectedChannels={canScheduleSelectedChannels}
            hasInsufficientCredits={hasInsufficientCredits}
            eligibility={currentEligibility}
            deliveryChannels={deliveryChannels}
            onSaveBeforeCheckout={saveCurrentDraft}
            onClear={handleClearForm}
          />
        </div>
      </div>

      {/* All Modals */}
      <LetterModals
        showSealConfirmation={showSealConfirmation}
        onSealConfirmationChange={(open) => dispatchModal({ type: "SET_SEAL_CONFIRMATION", payload: open })}
        onConfirmSeal={handleConfirmSeal}
        isSubmitting={isPending}
        letterTitle={title}
        recipientType={recipientType}
        recipientName={recipientName}
        recipientEmail={recipientEmail}
        deliveryChannels={deliveryChannels}
        deliveryDate={deliveryDate}
        eligibility={currentEligibility}
        shippingAddress={selectedAddress}
        printOptions={printOptions}
        showCelebration={showCelebration}
        onCelebrationChange={(open) => dispatchModal({ type: "SET_CELEBRATION", payload: open })}
        onCelebrationComplete={handleCelebrationComplete}
        showTrialModal={showTrialModal}
        onTrialModalChange={(open) => dispatchModal({ type: "SET_TRIAL_MODAL", payload: open })}
        showUpgradeModal={showUpgradeModal}
        onUpgradeModalChange={(open) => dispatchModal({ type: "SET_UPGRADE_MODAL", payload: open })}
      />
    </form>
  )
}
