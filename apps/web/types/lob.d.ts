/**
 * Type declarations for the lob package
 * @see https://docs.lob.com/
 */
declare module "lob" {
  interface LobConfig {
    apiVersion?: string
  }

  interface Address {
    name: string
    address_line1: string
    address_line2?: string
    address_city: string
    address_state: string
    address_zip: string
    address_country: string
  }

  interface AddressVerifyResult {
    id: string
    deliverability:
      | "deliverable"
      | "deliverable_unnecessary_unit"
      | "deliverable_incorrect_unit"
      | "deliverable_missing_unit"
      | "undeliverable"
      | "no_match"
    primary_line: string
    secondary_line?: string
    urbanization?: string
    last_line: string
    components: {
      primary_number?: string
      street_predirection?: string
      street_name?: string
      street_suffix?: string
      street_postdirection?: string
      secondary_designator?: string
      secondary_number?: string
      city?: string
      state?: string
      zip_code?: string
      zip_code_plus_4?: string
    }
  }

  /**
   * Parameters for creating a Lob address object
   * @see https://docs.lob.com/#tag/Addresses/operation/address_create
   */
  interface AddressCreateParams {
    /** Recipient or company name. Max 40 characters for US, 50 for international */
    name: string
    /** Primary address line. Max 64 characters */
    address_line1: string
    /** Secondary address line (apt, suite, etc). Max 64 characters */
    address_line2?: string
    /** City name */
    address_city: string
    /** State/province/region */
    address_state: string
    /** Postal/ZIP code */
    address_zip: string
    /** 2-letter ISO country code (e.g., "US", "TR") */
    address_country: string
    /** Optional description for the address */
    description?: string
    /** Company name if applicable */
    company?: string
    /** Email for notifications */
    email?: string
    /** Phone number */
    phone?: string
    /** Custom metadata (max 20 keys, 500 char values) */
    metadata?: Record<string, string>
  }

  /**
   * A Lob address object returned from the API
   * @see https://docs.lob.com/#tag/Addresses
   */
  interface LobAddressObject {
    /** Unique identifier starting with "adr_" */
    id: string
    /** Always "address" */
    object: "address"
    /** Description of the address */
    description?: string
    /** Recipient name */
    name: string
    /** Company name */
    company?: string
    /** Phone number */
    phone?: string
    /** Email address */
    email?: string
    /** Primary address line (normalized by Lob) */
    address_line1: string
    /** Secondary address line */
    address_line2?: string
    /** City (normalized) */
    address_city: string
    /** State (normalized) */
    address_state: string
    /** ZIP/postal code (normalized) */
    address_zip: string
    /** Country code */
    address_country: string
    /** Custom metadata */
    metadata?: Record<string, string>
    /** ISO 8601 timestamp of creation */
    date_created: string
    /** ISO 8601 timestamp of last modification */
    date_modified: string
    /** Whether the address has been deleted */
    deleted?: boolean
    /** Recipient type for compliance */
    recipient_moved?: boolean
  }

  interface LetterCreateParams {
    /** Recipient address - can be inline Address object OR Lob address ID (adr_xxx) */
    to: Address | string
    /** Sender address - can be inline Address object OR Lob address ID (adr_xxx) */
    from?: Address | string
    file?: string
    template_id?: string
    template_version_id?: string
    color?: boolean
    double_sided?: boolean
    description?: string
    use_type: "marketing" | "operational"
    mail_type?: "usps_first_class" | "usps_standard"
    merge_variables?: Record<string, unknown>
    metadata?: Record<string, string>
    return_envelope?: boolean
    /** Address placement on letter: top_first_page shows through window envelope */
    address_placement?: "top_first_page" | "insert_blank_page"
    /**
     * Date to send the letter (YYYY-MM-DD or ISO 8601 datetime)
     * Lob holds the letter until this date. Max 180 days in future.
     * Letters with send_date are cancellable until the send date.
     * @see https://docs.lob.com/#tag/Letters/operation/letter_create
     */
    send_date?: string
  }

  interface Letter {
    id: string
    description?: string
    expected_delivery_date: string
    /** Scheduled send date if letter was created with send_date param */
    send_date?: string
    date_created: string
    date_modified: string
    deleted?: boolean
    from: Address
    to: Address
    url: string
    carrier: string
    thumbnails: string[]
    mail_type: string
    use_type: string
    color: boolean
    double_sided: boolean
    tracking_events: Array<{
      type: string
      name: string
      time: string
      location?: string
    }>
  }

  interface Addresses {
    /** Verify a US address */
    verify(address: Partial<Address>): Promise<AddressVerifyResult>
    /** Create a new address object in Lob */
    create(params: AddressCreateParams): Promise<LobAddressObject>
    /** Retrieve an existing address by ID */
    retrieve(id: string): Promise<LobAddressObject>
    /** Delete an address (soft delete) */
    delete(id: string): Promise<{ id: string; deleted: boolean }>
    /** List all addresses with pagination */
    list(params?: {
      limit?: number
      offset?: number
      include?: string[]
      date_created?: { gt?: string; gte?: string; lt?: string; lte?: string }
      metadata?: Record<string, string>
    }): Promise<{
      data: LobAddressObject[]
      count: number
      object: "list"
    }>
  }

  interface UsVerificationParams {
    primary_line: string
    secondary_line?: string
    city: string
    state: string
    zip_code: string
  }

  interface UsVerifications {
    verify(params: UsVerificationParams): Promise<AddressVerifyResult>
  }

  interface IntlVerificationParams {
    primary_line: string
    secondary_line?: string
    city: string
    state?: string
    postal_code?: string
    country: string
  }

  interface IntlAddressVerifyResult {
    id: string
    recipient?: string
    primary_line: string
    secondary_line?: string
    last_line: string
    country: string
    deliverability: "deliverable" | "deliverable_missing_info" | "undeliverable" | "no_match"
    components: {
      primary_number?: string
      street_name?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
      country_short?: string
    }
  }

  interface IntlVerifications {
    verify(params: IntlVerificationParams): Promise<IntlAddressVerifyResult>
  }

  interface Letters {
    create(params: LetterCreateParams, headers?: Record<string, string>): Promise<Letter>
    retrieve(id: string): Promise<Letter>
    delete(id: string): Promise<{ id: string; deleted: boolean }>
    list(params?: { limit?: number; offset?: number }): Promise<{
      data: Letter[]
      count: number
    }>
  }

  class Lob {
    constructor(apiKey: string, config?: LobConfig)
    addresses: Addresses
    letters: Letters
    usVerifications: UsVerifications
    intlVerifications: IntlVerifications
  }

  export = Lob
}
