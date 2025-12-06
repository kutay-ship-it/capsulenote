/**
 * Page Estimation Utilities for Lob Physical Mail
 *
 * Lob's Print & Mail API enforces a maximum of 6 pages per letter.
 * Our letter template uses:
 * - Page 1: Cover page (branding, recipient name, date)
 * - Page 2: Blank page (double-sided printing buffer)
 * - Pages 3-6: Available for letter content
 *
 * This leaves 4 pages maximum for actual letter content.
 *
 * Page estimation is based on:
 * - Page size: US Letter (8.5" × 11")
 * - Margins: 0.5" all sides → Printable: 7.5" × 10"
 * - Font: Courier New 12pt, line-height 1.5
 * - ~75 chars/line × ~40 lines/page = ~3000 chars/page
 * - Conservative estimate: ~2500 chars/page (accounts for formatting overhead)
 */

// =============================================================================
// Constants
// =============================================================================

/** Maximum pages allowed by Lob API */
export const LOB_MAX_PAGES = 6

/** Fixed pages in our letter template (cover + blank) */
export const FIXED_TEMPLATE_PAGES = 2

/** Maximum pages available for letter content */
export const CONTENT_PAGE_LIMIT = LOB_MAX_PAGES - FIXED_TEMPLATE_PAGES // 4

/** Conservative estimate of characters per page (accounts for formatting overhead) */
export const CHARS_PER_PAGE = 2500

/** Maximum plaintext characters allowed for letter content */
export const MAX_CONTENT_CHARS = CONTENT_PAGE_LIMIT * CHARS_PER_PAGE // 10,000

// =============================================================================
// Types
// =============================================================================

/** Page status for UI color coding */
export type PageStatus = "safe" | "warning" | "danger" | "exceeded"

/** Page estimation result with detailed information */
export interface PageEstimation {
  /** Estimated number of content pages */
  estimatedPages: number
  /** Total pages including fixed template pages */
  totalPages: number
  /** Status for UI display */
  status: PageStatus
  /** Plaintext character count */
  characterCount: number
  /** Characters over the limit (0 if within limit) */
  charactersOverLimit: number
  /** Pages over the limit (0 if within limit) */
  pagesOverLimit: number
}

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Strip HTML tags from a string to get plaintext
 * Used for accurate character counting
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ") // Replace tags with space
    .replace(/&nbsp;/g, " ") // Replace HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim()
}

/**
 * Estimate the number of content pages from plaintext character count
 *
 * @param text - Plaintext content (not HTML)
 * @returns Estimated number of pages (minimum 0)
 */
export function estimatePageCount(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0
  }

  const charCount = text.length
  const pages = Math.ceil(charCount / CHARS_PER_PAGE)

  return pages
}

/**
 * Get the page status for UI color coding
 *
 * @param pages - Estimated content pages
 * @returns Status indicating severity
 */
export function getPageStatus(pages: number): PageStatus {
  if (pages > CONTENT_PAGE_LIMIT) {
    return "exceeded" // Red - submission blocked
  }
  if (pages === CONTENT_PAGE_LIMIT) {
    return "danger" // Orange - at limit
  }
  if (pages >= CONTENT_PAGE_LIMIT - 1) {
    return "warning" // Yellow - approaching limit (3 pages)
  }
  return "safe" // Green - plenty of room (1-2 pages)
}

/**
 * Get a complete page estimation with all details
 *
 * @param text - Plaintext content (not HTML)
 * @returns Detailed page estimation
 */
export function getPageEstimation(text: string): PageEstimation {
  const characterCount = text?.length || 0
  const estimatedPages = estimatePageCount(text)
  const status = getPageStatus(estimatedPages)
  const totalPages = FIXED_TEMPLATE_PAGES + estimatedPages
  const charactersOverLimit = Math.max(0, characterCount - MAX_CONTENT_CHARS)
  const pagesOverLimit = Math.max(0, estimatedPages - CONTENT_PAGE_LIMIT)

  return {
    estimatedPages,
    totalPages,
    status,
    characterCount,
    charactersOverLimit,
    pagesOverLimit,
  }
}

/**
 * Get a user-friendly message about the page limit
 *
 * @param estimation - Page estimation result
 * @returns User-friendly message string
 */
export function getPageLimitMessage(estimation: PageEstimation): string {
  if (estimation.status === "exceeded") {
    const charsToRemove = estimation.charactersOverLimit
    const pagesToRemove = estimation.pagesOverLimit

    return (
      `Your letter is approximately ${estimation.estimatedPages} pages, ` +
      `but physical mail is limited to ${CONTENT_PAGE_LIMIT} pages of content. ` +
      `Please shorten your letter by removing about ${charsToRemove.toLocaleString()} characters ` +
      `(~${pagesToRemove} page${pagesToRemove === 1 ? "" : "s"}).`
    )
  }

  if (estimation.status === "danger") {
    return `Your letter is at the maximum length (${CONTENT_PAGE_LIMIT} pages). Any additional content may exceed the limit.`
  }

  if (estimation.status === "warning") {
    return `Your letter is approaching the page limit (${estimation.estimatedPages} of ${CONTENT_PAGE_LIMIT} pages).`
  }

  return ""
}

/**
 * Check if content exceeds the page limit
 *
 * @param text - Plaintext content (not HTML)
 * @returns true if content exceeds limit
 */
export function exceedsPageLimit(text: string): boolean {
  const pages = estimatePageCount(text)
  return pages > CONTENT_PAGE_LIMIT
}

/**
 * Get page estimation from HTML content
 *
 * @param html - HTML content
 * @returns Detailed page estimation
 */
export function getPageEstimationFromHtml(html: string): PageEstimation {
  const plainText = stripHtmlTags(html)
  return getPageEstimation(plainText)
}
