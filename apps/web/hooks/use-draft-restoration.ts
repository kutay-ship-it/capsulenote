"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  getLetterAutosave,
  clearLetterAutosave,
  getAnonymousDraft,
  clearAnonymousDraft,
  formatLastSaved,
  type LetterAutosave,
  type AnonymousDraft,
} from "@/lib/localStorage-letter"

/**
 * Unified draft data structure for restoration
 * Normalizes both anonymous and authenticated draft formats
 */
export interface RestoredDraftData {
  title: string
  bodyRich: unknown | null
  bodyHtml: string
  recipientType: "myself" | "someone-else"
  recipientName: string
  recipientEmail: string
  deliveryChannels: ("email" | "physical")[]
  deliveryDate: Date | null
  selectedPreset: string | null
  selectedAddressId: string | null
  printOptions: { color: boolean; doubleSided: boolean }
}

export type DraftSource = "anonymous" | "authenticated" | null

interface UseDraftRestorationReturn {
  /** The restored draft data (null if no draft found) */
  draft: RestoredDraftData | null
  /** Where the draft came from */
  source: DraftSource
  /** Whether a draft was restored */
  restoredFromDraft: boolean
  /** Toast message for the restoration */
  toastMessage: { title: string; description: string } | null
  /** Time since last save (for authenticated drafts) */
  lastSavedText: string | null
  /** Clear the draft and mark as not restored */
  clearDraft: () => void
  /** Reset the restoration state (after user dismisses) */
  resetRestoration: () => void
}

/**
 * Helper to safely parse a date string
 */
function parseDateSafe(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return date
}

/**
 * Convert anonymous draft to unified format
 */
function normalizeAnonymousDraft(draft: AnonymousDraft): RestoredDraftData {
  return {
    title: draft.title || "",
    bodyRich: null, // Anonymous drafts don't have rich content
    bodyHtml: draft.body || "",
    recipientType: draft.recipientType === "other" ? "someone-else" : "myself",
    recipientName: draft.recipientName || "",
    recipientEmail: draft.recipientEmail || "",
    deliveryChannels: draft.deliveryType === "physical" ? ["physical"] : ["email"],
    deliveryDate: parseDateSafe(draft.deliveryDate),
    selectedPreset: draft.selectedPreset ?? null,
    selectedAddressId: null,
    printOptions: { color: false, doubleSided: false },
  }
}

/**
 * Convert authenticated draft to unified format
 */
function normalizeAuthenticatedDraft(draft: LetterAutosave): RestoredDraftData {
  return {
    title: draft.title,
    bodyRich: draft.bodyRich,
    bodyHtml: draft.bodyHtml,
    recipientType: draft.recipientType === "self" ? "myself" : "someone-else",
    recipientName: draft.recipientName,
    recipientEmail: draft.recipientEmail,
    deliveryChannels: draft.deliveryChannels,
    deliveryDate: parseDateSafe(draft.deliveryDate),
    selectedPreset: draft.selectedPreset,
    selectedAddressId: draft.selectedAddressId,
    printOptions: draft.printOptions ?? { color: false, doubleSided: false },
  }
}

/**
 * Hook for restoring letter drafts from localStorage
 *
 * Priority:
 * 1. Anonymous draft (from homepage before signup)
 * 2. Authenticated draft (from previous session)
 *
 * Features:
 * - Auto-loads draft on mount
 * - Normalizes both draft formats to unified structure
 * - Provides clear function to reset
 * - Provides toast message info for UI
 *
 * @example
 * ```tsx
 * const { draft, source, restoredFromDraft, clearDraft, toastMessage } = useDraftRestoration()
 *
 * useEffect(() => {
 *   if (draft) {
 *     setTitle(draft.title)
 *     setBodyHtml(draft.bodyHtml)
 *     // ... restore other fields
 *   }
 * }, [draft])
 *
 * useEffect(() => {
 *   if (toastMessage) {
 *     toast.info(toastMessage.title, { description: toastMessage.description })
 *   }
 * }, [toastMessage])
 * ```
 */
export function useDraftRestoration(): UseDraftRestorationReturn {
  const [draft, setDraft] = useState<RestoredDraftData | null>(null)
  const [source, setSource] = useState<DraftSource>(null)
  const [restoredFromDraft, setRestoredFromDraft] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string } | null>(null)
  const [lastSavedText, setLastSavedText] = useState<string | null>(null)

  // Prevent double execution in React Strict Mode
  const hasLoadedRef = useRef(false)

  // Load draft on mount
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    // Priority 1: Anonymous draft (from homepage before signup)
    const anonymousDraft = getAnonymousDraft()
    if (anonymousDraft) {
      const normalized = normalizeAnonymousDraft(anonymousDraft)
      setDraft(normalized)
      setSource("anonymous")
      setRestoredFromDraft(true)
      setToastMessage({
        title: "Welcome! Your draft is ready",
        description: `${anonymousDraft.wordCount} words restored from your homepage draft`,
      })

      // Clear anonymous draft after loading (migrate to authenticated flow)
      clearAnonymousDraft()
      return
    }

    // Priority 2: Authenticated user draft
    const savedDraft = getLetterAutosave()
    if (savedDraft) {
      const normalized = normalizeAuthenticatedDraft(savedDraft)
      setDraft(normalized)
      setSource("authenticated")
      setRestoredFromDraft(true)
      setLastSavedText(formatLastSaved(savedDraft.lastSaved))
      setToastMessage({
        title: "Draft restored",
        description: `Last saved ${formatLastSaved(savedDraft.lastSaved)}`,
      })
    }
  }, [])

  // Clear draft function
  const clearDraft = useCallback(() => {
    clearLetterAutosave()
    clearAnonymousDraft()
    setDraft(null)
    setSource(null)
    setRestoredFromDraft(false)
    setToastMessage(null)
    setLastSavedText(null)
  }, [])

  // Reset restoration state (without clearing localStorage)
  const resetRestoration = useCallback(() => {
    setRestoredFromDraft(false)
    setToastMessage(null)
  }, [])

  return {
    draft,
    source,
    restoredFromDraft,
    toastMessage,
    lastSavedText,
    clearDraft,
    resetRestoration,
  }
}

/**
 * Default empty form state for clearing
 */
export const emptyFormState: RestoredDraftData = {
  title: "",
  bodyRich: null,
  bodyHtml: "",
  recipientType: "myself",
  recipientName: "",
  recipientEmail: "",
  deliveryChannels: ["email"],
  deliveryDate: null,
  selectedPreset: null,
  selectedAddressId: null,
  printOptions: { color: false, doubleSided: false },
}
