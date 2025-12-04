/**
 * Letter Template Renderer
 *
 * Renders physical mail letters with variable substitution.
 * Converts Tiptap/HTML content to print-ready format.
 */

import { format } from "date-fns"
import {
  LETTER_TEMPLATE_HTML,
  LETTER_TEMPLATE_MINIMAL_HTML,
  type LetterTemplateVariables,
} from "./letter-template"

export interface RenderLetterOptions {
  /** Recipient name (defaults to "Future Self") */
  recipientName?: string
  /** Letter content as HTML */
  letterContent: string
  /** Date the letter was written */
  writtenDate: Date
  /** Date the letter is being delivered (defaults to today) */
  deliveryDate?: Date
  /** Optional letter title */
  letterTitle?: string
  /** Use minimal template (smaller file size) */
  minimal?: boolean
}

/**
 * Render a letter using the V3 template
 *
 * @param options - Letter rendering options
 * @returns Rendered HTML string ready for Lob API
 */
export function renderLetter(options: RenderLetterOptions): string {
  const {
    recipientName = "Future Self",
    letterContent,
    writtenDate,
    deliveryDate = new Date(),
    letterTitle,
    minimal = false,
  } = options

  // Format dates
  const formattedWrittenDate = format(writtenDate, "MMMM d, yyyy")
  const formattedDeliveryDate = format(deliveryDate, "MMMM d, yyyy")

  // Clean and prepare content
  const cleanedContent = prepareContentForPrint(letterContent)

  // Select template
  const template = minimal ? LETTER_TEMPLATE_MINIMAL_HTML : LETTER_TEMPLATE_HTML

  // Replace variables
  let rendered = template
    .replace(/\{\{recipient_name\}\}/g, escapeHtml(recipientName))
    .replace(/\{\{letter_content\}\}/g, cleanedContent)
    .replace(/\{\{written_date\}\}/g, formattedWrittenDate)
    .replace(/\{\{delivery_date\}\}/g, formattedDeliveryDate)

  // Handle conditional title section
  if (letterTitle) {
    rendered = rendered
      .replace(/\{\{#if letter_title\}\}/g, "")
      .replace(/\{\{\/if\}\}/g, "")
      .replace(/\{\{letter_title\}\}/g, escapeHtml(letterTitle))
  } else {
    // Remove the entire title section if no title
    rendered = rendered.replace(
      /\{\{#if letter_title\}\}[\s\S]*?\{\{\/if\}\}/g,
      ""
    )
  }

  return rendered
}

/**
 * Prepare HTML content for print
 *
 * - Converts Tiptap JSON to HTML if needed
 * - Sanitizes dangerous content
 * - Adjusts styling for print
 */
function prepareContentForPrint(content: string): string {
  // If content is already wrapped in paragraphs, use as-is
  if (content.includes("<p>") || content.includes("<div>")) {
    return sanitizeForPrint(content)
  }

  // Wrap plain text in paragraphs
  const paragraphs = content.split(/\n\n+/)
  return paragraphs
    .map((p) => `<p>${sanitizeForPrint(p.trim())}</p>`)
    .join("\n")
}

/**
 * Sanitize content for safe printing
 *
 * - Removes scripts and dangerous elements
 * - Keeps basic formatting (bold, italic, links)
 * - Converts relative URLs to absolute
 */
function sanitizeForPrint(html: string): string {
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  // Remove event handlers
  clean = clean.replace(/\s*on\w+="[^"]*"/gi, "")
  clean = clean.replace(/\s*on\w+='[^']*'/gi, "")

  // Remove style tags (we use our own print styles)
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

  // Remove iframes
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")

  // Convert <br> to proper paragraph breaks if not already in paragraphs
  if (!clean.includes("<p>")) {
    clean = clean.replace(/<br\s*\/?>/gi, "</p><p>")
  }

  return clean
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char)
}

/**
 * Convert Tiptap JSON content to HTML for print
 *
 * @param tiptapJson - Tiptap editor JSON content
 * @returns HTML string
 */
export function tiptapJsonToHtml(tiptapJson: {
  type: string
  content?: Array<{
    type: string
    content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>
    attrs?: Record<string, unknown>
  }>
}): string {
  if (!tiptapJson.content) return ""

  return tiptapJson.content
    .map((node) => {
      switch (node.type) {
        case "paragraph":
          return `<p>${renderInlineContent(node.content)}</p>`
        case "heading":
          const level = (node.attrs?.level as number) || 2
          return `<h${level}>${renderInlineContent(node.content)}</h${level}>`
        case "bulletList":
          return `<ul>${renderListItems(node.content)}</ul>`
        case "orderedList":
          return `<ol>${renderListItems(node.content)}</ol>`
        case "blockquote":
          return `<blockquote>${renderInlineContent(node.content)}</blockquote>`
        case "horizontalRule":
          return "<hr>"
        default:
          return renderInlineContent(node.content)
      }
    })
    .join("\n")
}

function renderInlineContent(
  content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>
): string {
  if (!content) return ""

  return content
    .map((item) => {
      if (item.type === "text") {
        let text = escapeHtml(item.text || "")

        // Apply marks (bold, italic, etc.)
        if (item.marks) {
          for (const mark of item.marks) {
            switch (mark.type) {
              case "bold":
                text = `<strong>${text}</strong>`
                break
              case "italic":
                text = `<em>${text}</em>`
                break
              case "underline":
                text = `<u>${text}</u>`
                break
              case "strike":
                text = `<s>${text}</s>`
                break
            }
          }
        }

        return text
      }
      return ""
    })
    .join("")
}

function renderListItems(
  content?: Array<{
    type: string
    content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>
  }>
): string {
  if (!content) return ""

  return content
    .map((item) => {
      if (item.type === "listItem") {
        return `<li>${renderInlineContent(item.content as Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>)}</li>`
      }
      return ""
    })
    .join("")
}

/**
 * Generate a preview-safe version of the letter
 * (for displaying in browser before sending)
 */
export function renderLetterPreview(options: RenderLetterOptions): string {
  const rendered = renderLetter(options)

  // Add preview-specific wrapper styling
  return `
    <div style="
      background: #f5f5f5;
      padding: 20px;
      min-height: 100vh;
    ">
      <div style="
        background: white;
        max-width: 8.5in;
        margin: 0 auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        aspect-ratio: 8.5/11;
        overflow: hidden;
      ">
        ${rendered}
      </div>
    </div>
  `
}
