/**
 * Envelope Template Configuration
 *
 * Lob envelope options and return address configuration.
 * Standard #10 envelope: 4.125" x 9.5"
 */

/**
 * Capsule Note return address configuration
 *
 * This is the sender address that appears on all physical mail.
 * Must be a valid US address for USPS mail.
 */
export const CAPSULE_NOTE_RETURN_ADDRESS = {
  /** Company name as it appears on envelope */
  name: "Capsule Note",
  /** Street address line 1 */
  address_line1: "185 Berry Street",
  /** Street address line 2 (optional) */
  address_line2: "Suite 6100",
  /** City */
  address_city: "San Francisco",
  /** State (2-letter code) */
  address_state: "CA",
  /** ZIP code */
  address_zip: "94107",
  /** Country (2-letter code) */
  address_country: "US",
} as const

/**
 * Envelope configuration for Lob
 *
 * These settings define how the envelope looks and handles.
 */
export const ENVELOPE_CONFIG = {
  /**
   * Address placement on letter
   * - "top_first_page": Address printed at top of first page (shows through window envelope)
   * - "insert_blank_page": Separate address page inserted
   */
  addressPlacement: "top_first_page" as const,

  /**
   * Return envelope included
   * For Capsule Note, we don't need return envelopes as users write to themselves
   */
  returnEnvelope: false,

  /**
   * Perforation for easy opening
   * Optional perforation line for tear-off
   */
  perforatedPage: null,

  /**
   * Extra service options
   */
  extraService: null as "certified" | "certified_return_receipt" | "registered" | null,
}

/**
 * Custom envelope branding options (Lob Premium Feature)
 *
 * If upgrading to Lob premium, these options enable custom envelope printing:
 * - Custom return address design
 * - Logo printing
 * - Color envelopes
 *
 * For now, we use standard Lob envelopes with the default return address.
 */
export const ENVELOPE_BRANDING = {
  /**
   * Whether to use custom branded envelopes (requires Lob premium)
   */
  useCustomEnvelope: false,

  /**
   * Custom envelope design HTML (if using custom)
   * The return address area on a #10 envelope is approximately:
   * - Position: Top-left corner
   * - Size: 3" x 1"
   */
  customReturnAddressHtml: `
    <div style="
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      line-height: 1.4;
      color: #383838;
    ">
      <div style="
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 2px;
      ">
        Capsule Note
      </div>
      <div>185 Berry Street, Suite 6100</div>
      <div>San Francisco, CA 94107</div>
    </div>
  `,

  /**
   * Envelope background color (if using custom)
   * Standard is white; could use cream (#F4EFE2) for brand alignment
   */
  backgroundColor: "#FFFFFF",

  /**
   * Accent color for any envelope markings
   * Duck yellow from V3 design system
   */
  accentColor: "#FFDE00",
}

/**
 * Get the Lob-compatible sender address object
 */
export function getSenderAddress() {
  return CAPSULE_NOTE_RETURN_ADDRESS
}

/**
 * Get envelope configuration for Lob API calls
 */
export function getEnvelopeConfig() {
  return {
    address_placement: ENVELOPE_CONFIG.addressPlacement,
    return_envelope: ENVELOPE_CONFIG.returnEnvelope,
    perforated_page: ENVELOPE_CONFIG.perforatedPage,
    extra_service: ENVELOPE_CONFIG.extraService,
  }
}

/**
 * Production sender address
 *
 * Override this in production with actual business address.
 * The default uses a placeholder San Francisco address.
 */
export function getProductionSenderAddress(): typeof CAPSULE_NOTE_RETURN_ADDRESS {
  // In production, this could read from environment variables
  // or a configuration service
  const override = {
    name: process.env.LOB_SENDER_NAME,
    address_line1: process.env.LOB_SENDER_LINE1,
    address_line2: process.env.LOB_SENDER_LINE2,
    address_city: process.env.LOB_SENDER_CITY,
    address_state: process.env.LOB_SENDER_STATE,
    address_zip: process.env.LOB_SENDER_ZIP,
    address_country: process.env.LOB_SENDER_COUNTRY || "US",
  }

  // Use override if all required fields are present
  if (
    override.name &&
    override.address_line1 &&
    override.address_city &&
    override.address_state &&
    override.address_zip
  ) {
    return override as typeof CAPSULE_NOTE_RETURN_ADDRESS
  }

  // Fall back to default
  return CAPSULE_NOTE_RETURN_ADDRESS
}
