/**
 * HTML Sanitization Utilities
 *
 * Uses isomorphic-dompurify for SSR-safe HTML sanitization to prevent XSS attacks.
 * This module provides consistent sanitization across Server and Client Components.
 */
import DOMPurify, { type Config } from "isomorphic-dompurify"

/**
 * Allowed HTML tags for letter content
 * Restrictive allowlist to prevent XSS while preserving formatting
 */
const LETTER_CONTENT_CONFIG: Config = {
  ALLOWED_TAGS: [
    // Text formatting
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    // Headings
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // Lists
    "ul",
    "ol",
    "li",
    // Block elements
    "blockquote",
    "pre",
    "code",
    "hr",
    // Inline elements
    "span",
    "a",
  ],
  ALLOWED_ATTR: [
    "class",
    "href", // for links
    "target", // for links
    "rel", // for links
  ],
  // Ensure links open safely
  ADD_ATTR: ["target", "rel"],
  // Force all links to open in new tab with security attributes
  FORBID_ATTR: ["style", "onclick", "onerror", "onload"],
}

/**
 * Configuration for template content (more restrictive)
 */
const TEMPLATE_CONTENT_CONFIG: Config = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote"],
  ALLOWED_ATTR: ["class"],
}

/**
 * Sanitize letter HTML content for safe rendering
 * Use this for user-generated letter content (bodyHtml)
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 *
 * @example
 * // In Server Component
 * <div dangerouslySetInnerHTML={{ __html: sanitizeLetterHtml(letter.bodyHtml) }} />
 */
export function sanitizeLetterHtml(html: string | null | undefined): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, LETTER_CONTENT_CONFIG) as string
}

/**
 * Sanitize template content (more restrictive than letter content)
 * Use this for template promptText which should have minimal formatting
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeTemplateHtml(html: string | null | undefined): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, TEMPLATE_CONTENT_CONFIG) as string
}

/**
 * Generic sanitize function with full DOMPurify config access
 * Use only when you need custom configuration
 *
 * @param html - Raw HTML string to sanitize
 * @param config - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string | null | undefined,
  config?: Config
): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, config) as string
}
