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

  interface LetterCreateParams {
    to: Address
    from?: Address
    file: string
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
    /** Idempotency key to prevent duplicate sends on retry */
    idempotency_key?: string
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
    verify(address: Partial<Address>): Promise<AddressVerifyResult>
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
    create(params: LetterCreateParams): Promise<Letter>
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
