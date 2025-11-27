"use client"

import { useState, useTransition } from "react"
import { Check, Loader2, Pencil, User, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { updateProfile } from "@/server/actions/profile"
import { TimezoneSelectV3 } from "./timezone-select-v3"

// ============================================================================
// EDITABLE FIELD V3
// ============================================================================

interface EditableFieldV3Props {
  label: string
  value: string
  icon?: React.ReactNode
  onSave: (value: string) => Promise<{ success: boolean }>
  placeholder?: string
  emptyText?: string
  successMessage?: string
  errorMessage?: string
}

function EditableFieldV3({
  label,
  value,
  icon,
  onSave,
  placeholder = "Enter value...",
  emptyText = "Not set",
  successMessage = "Updated successfully",
  errorMessage = "Failed to update",
}: EditableFieldV3Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await onSave(editValue)
      if (result.success) {
        setIsEditing(false)
        toast.success(successMessage)
      } else {
        toast.error(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 font-mono text-sm text-charcoal placeholder:text-charcoal/40 bg-white border-2 border-charcoal focus:outline-none focus:border-duck-blue"
            style={{ borderRadius: "2px" }}
            disabled={isPending}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center justify-center h-11 w-11 border-2 border-charcoal bg-duck-yellow text-charcoal hover:shadow-[2px_2px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
            style={{ borderRadius: "2px" }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex items-center justify-center h-11 w-11 border-2 border-charcoal bg-white text-charcoal hover:bg-coral/20 transition-colors disabled:opacity-50"
            style={{ borderRadius: "2px" }}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={cn(
          "group w-full flex items-center gap-4 p-4 text-left",
          "border-2 border-charcoal bg-white transition-all",
          "hover:shadow-[2px_2px_0_theme(colors.charcoal)] hover:-translate-y-0.5"
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Icon */}
        {icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-duck-yellow border-2 border-charcoal"
            style={{ borderRadius: "2px" }}
          >
            {icon}
          </div>
        )}

        {/* Value */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "font-mono text-base",
              value ? "font-bold text-charcoal" : "text-charcoal/40 italic"
            )}
          >
            {value || emptyText}
          </span>
        </div>

        {/* Edit Icon */}
        <Pencil
          className="h-5 w-5 shrink-0 text-charcoal/40 group-hover:text-charcoal transition-colors"
          strokeWidth={2}
        />
      </button>
    </div>
  )
}

// ============================================================================
// PROFILE FIELDS V3
// ============================================================================

interface ProfileFieldsV3Props {
  displayName: string | null
  timezone: string | null
  translations: {
    displayNameLabel: string
    timezoneLabel: string
    notSet: string
    displayNamePlaceholder: string
    displayNameSuccess: string
    displayNameError: string
    timezoneSuccess: string
    timezoneError: string
  }
}

export function ProfileFieldsV3({
  displayName,
  timezone,
  translations,
}: ProfileFieldsV3Props) {
  const handleDisplayNameSave = async (value: string) => {
    const result = await updateProfile({ displayName: value })
    return result
  }

  const handleTimezoneSave = async (value: string) => {
    const result = await updateProfile({ timezone: value })
    return result
  }

  return (
    <div className="space-y-6">
      {/* Display Name */}
      <EditableFieldV3
        label={translations.displayNameLabel}
        value={displayName || ""}
        icon={<User className="h-5 w-5 text-charcoal" strokeWidth={2} />}
        onSave={handleDisplayNameSave}
        placeholder={translations.displayNamePlaceholder}
        emptyText={translations.notSet}
        successMessage={translations.displayNameSuccess}
        errorMessage={translations.displayNameError}
      />

      {/* Timezone */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {translations.timezoneLabel}
        </label>
        <TimezoneSelectV3
          value={timezone || "UTC"}
          onSave={handleTimezoneSave}
          successMessage={translations.timezoneSuccess}
          errorMessage={translations.timezoneError}
        />
      </div>
    </div>
  )
}
