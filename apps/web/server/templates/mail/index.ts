/**
 * Mail Templates
 *
 * Export all mail template utilities for physical letter delivery.
 */

// Letter template HTML and types
export {
  LETTER_TEMPLATE_HTML,
  LETTER_TEMPLATE_MINIMAL_HTML,
  type LetterTemplateVariables,
} from "./letter-template"

// Letter rendering utilities
export {
  renderLetter,
  renderLetterPreview,
  tiptapJsonToHtml,
  type RenderLetterOptions,
} from "./render-letter"

// Envelope configuration
export {
  CAPSULE_NOTE_RETURN_ADDRESS,
  ENVELOPE_CONFIG,
  ENVELOPE_BRANDING,
  getSenderAddress,
  getEnvelopeConfig,
  getProductionSenderAddress,
} from "./envelope-template"
