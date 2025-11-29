"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import {
  Mail,
  Calendar,
  Clock,
  AtSign,
  Trash2,
  PenLine,
  Settings,
  User,
  Users,
  Sparkles,
  Truck,
  Stamp,
  MapPin,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"

import { cn } from "@/lib/utils"
import { useCreditsUpdateListener } from "@/hooks/use-credits-broadcast"
import {
  saveLetterAutosave,
  getLetterAutosave,
  clearLetterAutosave,
  formatLastSaved,
  getAnonymousDraft,
  clearAnonymousDraft,
} from "@/lib/localStorage-letter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LetterEditor } from "@/components/letter-editor"
import { DatePicker } from "@/components/ui/date-picker"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { getUserTimezone } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TemplateSelectorV3 } from "@/components/v3/template-selector-v3"
import { DeliveryTypeV3, type DeliveryChannel } from "@/components/v3/delivery-type-v3"
import { SealConfirmationV3 } from "@/components/v3/seal-confirmation-v3"
import { SealCelebrationV3 } from "@/components/v3/seal-celebration-v3"
import { CreditWarningBanner } from "@/components/v3/credit-warning-banner"
import { AddressSelectorV3 } from "@/components/v3/address-selector-v3"
import { PrintOptionsV3, type PrintOptions } from "@/components/v3/print-options-v3"
import type { LetterTemplate } from "@/server/actions/templates"
import type { DeliveryEligibility } from "@/server/actions/entitlements"
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
  { label: "6 Months", months: 6, key: "6mo" },
  { label: "1 Year", months: 12, key: "1yr" },
  { label: "3 Years", months: 36, key: "3yr" },
  { label: "5 Years", months: 60, key: "5yr" },
  { label: "10 Years", months: 120, key: "10yr" },
]

interface LetterEditorV3Props {
  eligibility: DeliveryEligibility
  onRefreshEligibility?: () => Promise<void>
}

export function LetterEditorV3({ eligibility, onRefreshEligibility }: LetterEditorV3Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timezone = getUserTimezone()
  const [currentEligibility, setCurrentEligibility] = React.useState(eligibility)

  // Form state
  const [title, setTitle] = React.useState("")
  const [bodyRich, setBodyRich] = React.useState<Record<string, unknown> | null>(null)
  const [bodyHtml, setBodyHtml] = React.useState("")
  const [recipientType, setRecipientType] = React.useState<RecipientType>("myself")
  const [recipientName, setRecipientName] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [deliveryChannels, setDeliveryChannels] = React.useState<DeliveryChannel[]>(["email"])
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  // Physical mail state
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = React.useState<ShippingAddress | null>(null)
  const [printOptions, setPrintOptions] = React.useState<PrintOptions>({ color: false, doubleSided: false })
  const [showCustomDate, setShowCustomDate] = React.useState(false)
  const [showSealConfirmation, setShowSealConfirmation] = React.useState(false)
  const [showCelebration, setShowCelebration] = React.useState(false)
  const [sealedLetterId, setSealedLetterId] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Partial<Record<keyof LetterFormData, string>>>({})
  const [restoredFromDraft, setRestoredFromDraft] = React.useState(false)

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
          toast.success("Credits added!", {
            description: "Your credits have been refreshed. You can now schedule your letter.",
          })
        })
        .catch(() => {
          toast.error("Failed to refresh credits", {
            description: "Please refresh the page manually.",
          })
        })
    }
  }, [searchParams, onRefreshEligibility])

  // Update currentEligibility when prop changes (after refresh)
  React.useEffect(() => {
    setCurrentEligibility(eligibility)
  }, [eligibility])

  // Listen for credit updates from other tabs (e.g., after Stripe checkout in new tab)
  useCreditsUpdateListener(
    React.useCallback(() => {
      onRefreshEligibility?.()
        .then(() => {
          toast.success("Credits updated!", {
            description: "Your purchase was successful. You can now schedule your letter.",
          })
        })
        .catch(() => {
          // Silent fail - user can manually refresh if needed
        })
    }, [onRefreshEligibility])
  )

  // Load autosaved draft on mount (only for new letters)
  // Priority: Anonymous draft (from homepage before signup) > Authenticated draft
  React.useEffect(() => {
    // First, check for anonymous draft from homepage (pre-signup flow)
    const anonymousDraft = getAnonymousDraft()
    if (anonymousDraft) {
      // Restore fields from anonymous draft (simpler structure)
      setTitle(anonymousDraft.title || "")
      setBodyHtml(anonymousDraft.body || "")
      setBodyRich(null) // Anonymous drafts don't have rich content
      setRecipientType(anonymousDraft.recipientType === "other" ? "someone-else" : "myself")
      setRecipientName(anonymousDraft.recipientName || "")
      setRecipientEmail(anonymousDraft.recipientEmail || "")
      setDeliveryChannels(
        anonymousDraft.deliveryType === "physical" ? ["physical"] : ["email"]
      )
      if (anonymousDraft.deliveryDate) {
        setDeliveryDate(new Date(anonymousDraft.deliveryDate))
      }
      if (anonymousDraft.selectedPreset) {
        setSelectedPreset(anonymousDraft.selectedPreset)
      }
      setRestoredFromDraft(true)

      // Show toast for anonymous draft recovery
      toast.success("Welcome! Your letter draft has been restored", {
        description: `Continue writing from where you left off (${anonymousDraft.wordCount} words)`,
        action: {
          label: "Clear",
          onClick: () => {
            clearAnonymousDraft()
            // Clear the form
            setTitle("")
            setBodyRich(null)
            setBodyHtml("")
            setRecipientType("myself")
            setRecipientName("")
            setRecipientEmail("")
            setDeliveryChannels(["email"])
            setDeliveryDate(undefined)
            setSelectedPreset(null)
            setSelectedAddressId(null)
            setPrintOptions({ color: false, doubleSided: false })
            setRestoredFromDraft(false)
            toast.success("Draft cleared")
          },
        },
      })

      // Clear anonymous draft after loading (migrate to authenticated flow)
      // The autosave will now save as authenticated user format
      clearAnonymousDraft()
      return
    }

    // Fall back to authenticated user draft
    const savedDraft = getLetterAutosave()
    if (savedDraft) {
      // Restore all fields from the saved draft
      setTitle(savedDraft.title)
      setBodyRich(savedDraft.bodyRich as Record<string, unknown> | null)
      setBodyHtml(savedDraft.bodyHtml)
      setRecipientType(savedDraft.recipientType === "self" ? "myself" : "someone-else")
      setRecipientName(savedDraft.recipientName)
      setRecipientEmail(savedDraft.recipientEmail)
      setDeliveryChannels(savedDraft.deliveryChannels)
      if (savedDraft.deliveryDate) {
        setDeliveryDate(new Date(savedDraft.deliveryDate))
      }
      setSelectedPreset(savedDraft.selectedPreset)
      setSelectedAddressId(savedDraft.selectedAddressId)
      if (savedDraft.printOptions) {
        setPrintOptions(savedDraft.printOptions)
      }
      setRestoredFromDraft(true)

      // Show toast with last saved time
      toast.info("Draft restored", {
        description: `Last saved ${formatLastSaved(savedDraft.lastSaved)}`,
        action: {
          label: "Clear",
          onClick: () => {
            clearLetterAutosave()
            // Clear the form
            setTitle("")
            setBodyRich(null)
            setBodyHtml("")
            setRecipientType("myself")
            setRecipientName("")
            setRecipientEmail("")
            setDeliveryChannels(["email"])
            setDeliveryDate(undefined)
            setSelectedPreset(null)
            setSelectedAddressId(null)
            setPrintOptions({ color: false, doubleSided: false })
            setRestoredFromDraft(false)
            toast.success("Draft cleared")
          },
        },
      })
    }
  }, []) // Run once on mount

  // Auto-save draft every 30 seconds when there are unsaved changes
  React.useEffect(() => {
    if (!hasUnsavedChanges || showCelebration) return

    const saveToLocalStorage = () => {
      saveLetterAutosave({
        title,
        bodyRich,
        bodyHtml,
        recipientType: recipientType === "myself" ? "self" : "other",
        recipientName,
        recipientEmail,
        deliveryChannels,
        deliveryDate: deliveryDate?.toISOString() ?? null,
        selectedPreset,
        selectedAddressId,
        printOptions,
      })
    }

    // Save immediately on first change, then every 30 seconds
    saveToLocalStorage()

    const interval = setInterval(saveToLocalStorage, 30000)
    return () => clearInterval(interval)
  }, [
    hasUnsavedChanges,
    showCelebration,
    title,
    bodyRich,
    bodyHtml,
    recipientType,
    recipientName,
    recipientEmail,
    deliveryChannels,
    deliveryDate,
    selectedPreset,
    selectedAddressId,
    printOptions,
  ])

  // Save current draft immediately (used before checkout)
  const saveCurrentDraft = React.useCallback(() => {
    saveLetterAutosave({
      title,
      bodyRich,
      bodyHtml,
      recipientType: recipientType === "myself" ? "self" : "other",
      recipientName,
      recipientEmail,
      deliveryChannels,
      deliveryDate: deliveryDate?.toISOString() ?? null,
      selectedPreset,
      selectedAddressId,
      printOptions,
    })
  }, [
    title,
    bodyRich,
    bodyHtml,
    recipientType,
    recipientName,
    recipientEmail,
    deliveryChannels,
    deliveryDate,
    selectedPreset,
    selectedAddressId,
    printOptions,
  ])

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
    setDeliveryDate(futureDate)
    setSelectedPreset(key)
    setShowCustomDate(false)
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setSelectedPreset(null)
    if (errors.deliveryDate) {
      setErrors({ ...errors, deliveryDate: undefined })
    }
  }

  const handleRecipientTypeChange = (type: RecipientType) => {
    setRecipientType(type)
    // Clear recipient fields when switching
    if (type === "myself") {
      setRecipientName("")
    }
    setRecipientEmail("")
    setErrors({ ...errors, recipientName: undefined, recipientEmail: undefined })
  }

  const handleClearForm = () => {
    setTitle("")
    setBodyRich(null)
    setBodyHtml("")
    setRecipientType("myself")
    setRecipientName("")
    setRecipientEmail("")
    setDeliveryChannels(["email"])
    setDeliveryDate(undefined)
    setSelectedPreset(null)
    setShowCustomDate(false)
    // Reset physical mail state
    setSelectedAddressId(null)
    setSelectedAddress(null)
    setPrintOptions({ color: false, doubleSided: false })
    setErrors({})
  }

  const handleAddressChange = (addressId: string | null, address?: ShippingAddress) => {
    setSelectedAddressId(addressId)
    setSelectedAddress(address || null)
  }

  const handleTemplateSelect = (template: LetterTemplate) => {
    // Apply template content to the editor
    setBodyHtml(template.promptText)
    setBodyRich(null) // Clear rich content, editor will parse HTML
    // Set title if empty
    if (!title.trim()) {
      setTitle(template.title)
    }
    // Clear any content errors
    if (errors.bodyHtml) {
      setErrors({ ...errors, bodyHtml: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LetterFormData, string>> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!plainText) {
      newErrors.bodyHtml = "Letter content is required"
    }

    // Validate recipient name for "someone else"
    if (recipientType === "someone-else" && !recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required"
    }

    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = "Invalid email format"
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = "Delivery date is required"
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deliveryDate < today) {
        newErrors.deliveryDate = "Delivery date must be in the future"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Open confirmation modal after validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !deliveryDate || isPending) return

    // Open confirmation modal instead of submitting directly
    setShowSealConfirmation(true)
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

          setShowSealConfirmation(false)

          if (failures.length === 0) {
            // All deliveries scheduled successfully - clear autosaved draft
            clearLetterAutosave()
            setSealedLetterId(letterId)
            setShowCelebration(true)
          } else if (successes.length > 0) {
            // Partial success - some deliveries failed but letter was saved
            clearLetterAutosave()
            const failedDetails = failures.map(({ channel, result }) => {
              const channelLabel = channel === "physical" ? "Physical mail" : "Email"
              const errorMsg = !result.success ? result.error.message : "Unknown error"
              return `${channelLabel}: ${errorMsg}`
            })
            toast.warning("Letter saved with partial delivery", {
              description: failedDetails.join(". ") + ". You can retry from the letter page.",
            })
            setSealedLetterId(letterId)
            setShowCelebration(true)
          } else {
            // All deliveries failed but letter was saved
            clearLetterAutosave()
            const firstError = failures[0]
            const errorMessage = !firstError.result.success
              ? firstError.result.error.message
              : "Unknown error"
            toast.error("Letter saved but delivery scheduling failed", {
              description: `${errorMessage}. You can schedule delivery from the letter page.`,
            })
            router.push(`/letters/${letterId}`)
          }
        } else {
          setShowSealConfirmation(false)
          if (result.error.code === "QUOTA_EXCEEDED") {
            toast.error("Quota exceeded", {
              description: result.error.message,
              action: {
                label: "Upgrade",
                onClick: () => router.push("/pricing"),
              },
            })
          } else {
            toast.error("Failed to create letter", {
              description: result.error.message,
            })
          }
        }
      } catch (error) {
        console.error("Letter creation error:", error)
        setShowSealConfirmation(false)
        toast.error("Something went wrong", {
          description: "Please try again later.",
        })
      }
    })
  }

  const handleCelebrationComplete = React.useCallback(() => {
    setShowCelebration(false)
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
            <span>New Letter</span>
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
                Letter Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: undefined })
                }}
                placeholder="A letter to my future self..."
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
                  Your Message
                </label>
                <div className="flex gap-3 font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                  <span>{wordCount} words</span>
                  <span>{characterCount} chars</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <LetterEditor
                  content={bodyRich || bodyHtml}
                  onChange={(json, html) => {
                    setBodyRich(json)
                    setBodyHtml(html)
                    if (errors.bodyHtml) setErrors({ ...errors, bodyHtml: undefined })
                  }}
                  placeholder="Dear future me..."
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
              <span>Settings</span>
            </div>

            <div className="space-y-5 mt-4">
              {/* Recipient Type Selection */}
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <User className="h-3.5 w-3.5" strokeWidth={2} />
                  Recipient
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
                    Myself
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
                    Someone Else
                  </button>
                </div>

                {/* Recipient Name - Only for "Someone Else" */}
                {recipientType === "someone-else" && (
                  <div className="space-y-2 pt-2">
                    <label
                      htmlFor="recipientName"
                      className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
                    >
                      Their Name
                    </label>
                    <Input
                      id="recipientName"
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value)
                        if (errors.recipientName) setErrors({ ...errors, recipientName: undefined })
                      }}
                      placeholder="John Doe"
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
                    {recipientType === "myself" ? "Your Email" : "Their Email"}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value)
                      if (errors.recipientEmail) setErrors({ ...errors, recipientEmail: undefined })
                    }}
                    placeholder={recipientType === "myself" ? "your@email.com" : "their@email.com"}
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
                  Delivery Method
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  How should we deliver your letter?
                </p>
                <DeliveryTypeV3
                  value={deliveryChannels}
                  onChange={setDeliveryChannels}
                  eligibility={currentEligibility}
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
                      Shipping Address
                    </label>
                    <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                      Where should we mail your letter?
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
                          Print Options
                        </label>
                        <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                          Customize how your letter is printed
                        </p>
                        <PrintOptionsV3
                          value={printOptions}
                          onChange={setPrintOptions}
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
                  When to Deliver
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
                        {preset.label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomDate(!showCustomDate)
                      if (!showCustomDate) setSelectedPreset(null)
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
                    Custom Date
                  </button>
                </div>

                {/* Custom Date Picker */}
                {showCustomDate && (
                  <div className="pt-2">
                    <DatePicker
                      date={deliveryDate}
                      onSelect={handleDateSelect}
                      placeholder="Pick a date"
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
                        Scheduled for
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
                  Templates
                </label>
                <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider -mt-1">
                  Need inspiration? Start with a prompt
                </p>
                <TemplateSelectorV3 onSelect={handleTemplateSelect} />
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div
            className="border-2 border-charcoal bg-duck-cream p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <div className="space-y-3">
              {/* Credit Warning Banner - shown when insufficient credits */}
              {hasInsufficientCredits && (
                <CreditWarningBanner
                  eligibility={currentEligibility}
                  selectedChannels={deliveryChannels}
                  onBeforeCheckout={saveCurrentDraft}
                />
              )}

              {/* Submit Button - Full width, disabled when no credits */}
              <Button
                type="submit"
                disabled={isPending || !canScheduleSelectedChannels}
                className={cn(
                  "w-full gap-2 h-12",
                  !canScheduleSelectedChannels && "opacity-50 cursor-not-allowed"
                )}
              >
                <Stamp className="h-4 w-4" strokeWidth={2} />
                {isPending ? "Sealing..." : "Seal & Schedule Letter"}
              </Button>

              {/* Helpful message when button is disabled */}
              {!canScheduleSelectedChannels && !hasInsufficientCredits && (
                <p className="font-mono text-[10px] text-center text-charcoal/50 uppercase tracking-wider">
                  {!currentEligibility.hasActiveSubscription
                    ? "Subscribe to schedule letters"
                    : "Select a delivery channel to continue"}
                </p>
              )}

              {/* Secondary actions row */}
              <div className="flex gap-2">
                {/* Clear Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-2 h-10 text-charcoal/60 hover:text-coral hover:bg-coral/5"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="border-2 border-charcoal bg-white font-mono"
                    style={{
                      borderRadius: "2px",
                      boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
                    }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
                        Clear Letter?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-sm text-charcoal/60">
                        This will clear all your progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel
                        className="border-2 border-charcoal bg-white hover:bg-off-white font-mono uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearForm}
                        className="border-2 border-charcoal bg-coral hover:bg-coral/90 text-white font-mono uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seal Confirmation Modal */}
      {deliveryDate && (
        <SealConfirmationV3
          open={showSealConfirmation}
          onOpenChange={setShowSealConfirmation}
          onConfirm={handleConfirmSeal}
          isSubmitting={isPending}
          letterTitle={title}
          recipientType={recipientType}
          recipientName={recipientName}
          recipientEmail={recipientEmail}
          deliveryChannels={deliveryChannels}
          deliveryDate={deliveryDate}
          eligibility={currentEligibility}
          shippingAddress={selectedAddress}
          printOptions={hasPhysicalSelected ? printOptions : undefined}
        />
      )}

      {/* Seal Celebration Modal */}
      {deliveryDate && (
        <SealCelebrationV3
          open={showCelebration}
          onOpenChange={setShowCelebration}
          letterTitle={title || "Untitled Letter"}
          deliveryDate={deliveryDate}
          recipientEmail={recipientEmail}
          onComplete={handleCelebrationComplete}
        />
      )}
    </form>
  )
}
