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

const STORAGE_KEY = 'dearme_anonymous_draft'
const DRAFT_EXPIRY_DAYS = 7 // Auto-delete after 7 days

/**
 * Save draft to localStorage with timestamp
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
): void {
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
    }
  } catch (error) {
    // Silently fail if localStorage unavailable (private browsing, quota exceeded)
    console.warn('Failed to save anonymous draft:', error)
  }
}

/**
 * Get draft from localStorage
 * Returns null if expired or not found
 */
export function getAnonymousDraft(): AnonymousDraft | null {
  try {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(STORAGE_KEY)
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
