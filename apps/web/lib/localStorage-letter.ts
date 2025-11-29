/**
 * LocalStorage utilities for anonymous letter drafts
 *
 * Implements progressive disclosure pattern:
 * 1. Allow anonymous writing with auto-save
 * 2. Prompt sign-up after 50+ words
 * 3. Migrate draft on account creation
 */

export interface AnonymousDraft {
  title: string
  body: string
  recipientEmail?: string
  deliveryDate?: string
  deliveryType?: "email" | "physical"
  timezone?: string
  recipientType?: "self" | "other"
  recipientName?: string
  wordCount: number
  lastSaved: string // ISO 8601 timestamp
  createdAt: string // ISO 8601 timestamp
}

const STORAGE_KEY = "capsulenote_anonymous_draft"
const LEGACY_STORAGE_KEY = "dearme_anonymous_draft"
const DRAFT_EXPIRY_DAYS = 7 // Auto-delete after 7 days

/**
 * Save draft to localStorage with timestamp
 * @returns true if save succeeded, false if failed (e.g., private browsing, quota exceeded)
 */
export function saveAnonymousDraft(
  title: string,
  body: string,
  recipientEmail?: string,
  deliveryDate?: string,
  deliveryType?: "email" | "physical",
  timezone?: string,
  recipientType?: "self" | "other",
  recipientName?: string
): boolean {
  try {
    const wordCount = countWords(body)
    const now = new Date().toISOString()

    const existing = getAnonymousDraft()
    const draft: AnonymousDraft = {
      title,
      body,
      recipientEmail,
      deliveryDate,
      deliveryType,
      timezone,
      recipientType,
      recipientName,
      wordCount,
      lastSaved: now,
      createdAt: existing?.createdAt || now,
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      return true
    }
    return false
  } catch (error) {
    // localStorage unavailable (private browsing, quota exceeded)
    console.warn('Failed to save anonymous draft:', error)
    return false
  }
}

/**
 * Get draft from localStorage
 * Returns null if expired or not found
 */
export function getAnonymousDraft(): AnonymousDraft | null {
  try {
    if (typeof window === 'undefined') return null

    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return null

    const draft = JSON.parse(stored) as AnonymousDraft

    // Check expiry
    const createdAt = new Date(draft.createdAt)
    const expiryDate = new Date(createdAt.getTime() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    if (new Date() > expiryDate) {
      // Draft expired, remove it
      clearAnonymousDraft()
      return null
    }

    // Migrate legacy key to the new brand key
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, stored)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }

    return draft
  } catch (error) {
    console.warn('Failed to load anonymous draft:', error)
    return null
  }
}

/**
 * Clear draft from localStorage
 */
export function clearAnonymousDraft(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  } catch (error) {
    console.warn('Failed to clear anonymous draft:', error)
  }
}

/**
 * Check if draft exists and has substantial content
 */
export function hasSubstantialDraft(): boolean {
  const draft = getAnonymousDraft()
  return draft !== null && draft.wordCount >= 10
}

/**
 * Check if user should see sign-up prompt (50+ words)
 */
export function shouldShowSignUpPrompt(): boolean {
  const draft = getAnonymousDraft()
  return draft !== null && draft.wordCount >= 50
}

/**
 * Count words in text (simple whitespace split)
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Format last saved time as relative string
 */
export function formatLastSaved(isoTimestamp: string): string {
  const now = new Date()
  const saved = new Date(isoTimestamp)
  const diffMs = now.getTime() - saved.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 10) return 'Just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// ============================================================================
// Authenticated User Letter Auto-Save
// ============================================================================

const AUTOSAVE_STORAGE_KEY = "capsule-letter-autosave"
const AUTOSAVE_EXPIRY_HOURS = 24 // Auto-delete after 24 hours

/**
 * Auto-save draft for authenticated users in the v3 letter editor.
 * Preserves letter state across page reloads and browser sessions.
 */
export interface LetterAutosave {
  title: string
  bodyRich: unknown | null // Tiptap JSONContent
  bodyHtml: string
  recipientType: "self" | "other"
  recipientName: string
  recipientEmail: string
  deliveryChannels: ("email" | "physical")[]
  deliveryDate: string | null
  selectedPreset: string | null
  selectedAddressId: string | null
  printOptions: {
    color: boolean
    doubleSided: boolean
  } | null
  lastSaved: string // ISO 8601 timestamp
  createdAt: string // ISO 8601 timestamp
}

/**
 * Save letter draft to localStorage for authenticated users
 * @returns true if save succeeded, false if failed (e.g., private browsing, quota exceeded)
 */
export function saveLetterAutosave(
  draft: Omit<LetterAutosave, "lastSaved" | "createdAt">
): boolean {
  try {
    if (typeof window === "undefined") return false

    const now = new Date().toISOString()
    const existing = getLetterAutosave()

    const autosave: LetterAutosave = {
      ...draft,
      lastSaved: now,
      createdAt: existing?.createdAt || now,
    }

    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(autosave))
    return true
  } catch (error) {
    // localStorage unavailable (private browsing, quota exceeded)
    console.warn("Failed to save letter autosave:", error)
    return false
  }
}

/**
 * Get letter autosave from localStorage
 * Returns null if expired or not found
 */
export function getLetterAutosave(): LetterAutosave | null {
  try {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(AUTOSAVE_STORAGE_KEY)
    if (!stored) return null

    const draft = JSON.parse(stored) as LetterAutosave

    // Check expiry (24 hours)
    const lastSaved = new Date(draft.lastSaved)
    const expiryDate = new Date(
      lastSaved.getTime() + AUTOSAVE_EXPIRY_HOURS * 60 * 60 * 1000
    )

    if (new Date() > expiryDate) {
      clearLetterAutosave()
      return null
    }

    return draft
  } catch (error) {
    console.warn("Failed to load letter autosave:", error)
    return null
  }
}

/**
 * Clear letter autosave from localStorage
 */
export function clearLetterAutosave(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY)
    }
  } catch (error) {
    console.warn("Failed to clear letter autosave:", error)
  }
}

/**
 * Check if a letter autosave exists with content
 */
export function hasLetterAutosave(): boolean {
  const draft = getLetterAutosave()
  return draft !== null && (draft.title.length > 0 || draft.bodyHtml.length > 0)
}
