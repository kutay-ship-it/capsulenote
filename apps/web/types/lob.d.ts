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
    deliverability: "deliverable" | "deliverable_incorrect_unit" | "undeliverable" | "no_match"
    primary_line: string
    secondary_line?: string
    urbanization?: string
    last_line: string
    components: {
      primary_number: string
      street_predirection: string
      street_name: string
      street_suffix: string
      street_postdirection: string
      secondary_designator: string
      secondary_number: string
      city: string
      state: string
      zip_code: string
      zip_code_plus_4: string
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
  }

  interface Letter {
    id: string
    description?: string
    expected_delivery_date: string
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
  }

  export = Lob
}
