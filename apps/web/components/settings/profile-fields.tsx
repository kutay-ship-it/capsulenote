"use client"

import { EditableField } from "./editable-field"
import { TimezoneSelect } from "./timezone-select"
import { updateProfile } from "@/server/actions/profile"

interface ProfileFieldsProps {
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

export function ProfileFields({
  displayName,
  timezone,
  translations,
}: ProfileFieldsProps) {
  const handleDisplayNameSave = async (value: string) => {
    const result = await updateProfile({ displayName: value })
    return result
  }

  const handleTimezoneSave = async (value: string) => {
    const result = await updateProfile({ timezone: value })
    return result
  }

  return (
    <>
      <div className="space-y-2">
        <label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
          {translations.displayNameLabel}
        </label>
        <EditableField
          label={translations.displayNameLabel}
          value={displayName || ""}
          onSave={handleDisplayNameSave}
          placeholder={translations.displayNamePlaceholder}
          emptyText={translations.notSet}
          successMessage={translations.displayNameSuccess}
          errorMessage={translations.displayNameError}
        />
      </div>
      <div className="space-y-2">
        <label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
          {translations.timezoneLabel}
        </label>
        <TimezoneSelect
          value={timezone || "UTC"}
          onSave={handleTimezoneSave}
          emptyText={translations.notSet}
          successMessage={translations.timezoneSuccess}
          errorMessage={translations.timezoneError}
        />
      </div>
    </>
  )
}
