import Lob from "lob"
import { env } from "@/env.mjs"

const lobApiKey = env.LOB_API_KEY

export const lob = lobApiKey ? new Lob(lobApiKey) : null

export interface MailingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface MailOptions {
  to: MailingAddress
  html: string
  color?: boolean
  doubleSided?: boolean
}

export async function sendLetter(options: MailOptions) {
  if (!lob) {
    throw new Error("Lob API key not configured")
  }

  try {
    const letter = await lob.letters.create({
      description: "Letter to Future Self",
      to: {
        name: options.to.name,
        address_line1: options.to.line1,
        address_line2: options.to.line2,
        address_city: options.to.city,
        address_state: options.to.state,
        address_zip: options.to.postalCode,
        address_country: options.to.country,
      },
      from: {
        name: "Capsule Note",
        address_line1: "123 Main St", // TODO: Configure sender address
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94102",
        address_country: "US",
      },
      file: options.html,
      color: options.color || false,
      double_sided: options.doubleSided || false,
    })

    return {
      id: letter.id,
      url: letter.url,
      expectedDeliveryDate: letter.expected_delivery_date,
    }
  } catch (error) {
    console.error("Lob API error:", error)
    throw new Error("Failed to send letter via Lob")
  }
}

export async function verifyAddress(address: Omit<MailingAddress, "name">) {
  if (!lob) {
    throw new Error("Lob API key not configured")
  }

  try {
    const verification = await lob.usVerifications.verify({
      primary_line: address.line1,
      secondary_line: address.line2,
      city: address.city,
      state: address.state,
      zip_code: address.postalCode,
    })

    return {
      isValid: verification.deliverability === "deliverable",
      suggestedAddress: verification.deliverability === "deliverable" ? verification : null,
      error: verification.deliverability !== "deliverable" ? verification.deliverability : null,
    }
  } catch (error) {
    console.error("Address verification error:", error)
    return {
      isValid: false,
      error: "Verification failed",
    }
  }
}
