/**
 * HTML Sanitization Utilities
 *
 * Uses sanitize-html for SSR-safe HTML sanitization to prevent XSS attacks.
 * This module provides consistent sanitization across Server and Client Components.
 *
 * Note: We use sanitize-html instead of isomorphic-dompurify because jsdom
 * (required by isomorphic-dompurify) has ESM compatibility issues on Vercel's
 * serverless runtime with parse5@8.0.0.
 */
import sanitizeHtmlLib from "sanitize-html"

/**
 * Allowed HTML tags for letter content
 * Restrictive allowlist to prevent XSS while preserving formatting
 */
const LETTER_CONTENT_CONFIG: sanitizeHtmlLib.IOptions = {
  allowedTags: [
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
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    span: ["class"],
    p: ["class"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
    h5: ["class"],
    h6: ["class"],
    blockquote: ["class"],
    pre: ["class"],
    code: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
  },
  // Transform links to be safe
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
  // Don't allow any inline styles
  allowedStyles: {},
}

/**
 * Configuration for template content (more restrictive)
 */
const TEMPLATE_CONTENT_CONFIG: sanitizeHtmlLib.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote"],
  allowedAttributes: {
    p: ["class"],
    blockquote: ["class"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
  },
  allowedStyles: {},
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
  return sanitizeHtmlLib(html, LETTER_CONTENT_CONFIG)
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
  return sanitizeHtmlLib(html, TEMPLATE_CONTENT_CONFIG)
}

/**
 * Generic sanitize function with full sanitize-html config access
 * Use only when you need custom configuration
 *
 * @param html - Raw HTML string to sanitize
 * @param config - sanitize-html configuration options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string | null | undefined,
  config?: sanitizeHtmlLib.IOptions
): string {
  if (!html) return ""
  return sanitizeHtmlLib(html, config)
}
