/**
 * End-to-end test for Turkish Address Normalization
 *
 * This script tests the complete address normalization directly with the Lob API.
 * It implements the normalization logic inline to avoid import issues.
 *
 * Usage:
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-turkish-address-e2e.ts
 */

import Lob from "lob"

const LOB_API_KEY = process.env.LOB_API_KEY

if (!LOB_API_KEY) {
  console.error("LOB_API_KEY is not set")
  process.exit(1)
}

const isTestKey = LOB_API_KEY.startsWith("test_")
console.log("Using Lob " + (isTestKey ? "TEST" : "LIVE") + " API Key")
console.log()

const lob = new Lob(LOB_API_KEY)

// Turkish districts for Istanbul
const ISTANBUL_DISTRICTS = [
  "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
  "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
  "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
  "Eyüp", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy",
  "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe",
  "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli",
  "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"
]

interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim()
}

function normalizeAddress(address: Address): { address: Address; wasNormalized: boolean; changes: string[] } {
  const changes: string[] = []
  const normalized = { ...address }

  // Only normalize Turkish addresses
  if (address.country !== "TR") {
    return { address: normalized, wasNormalized: false, changes: [] }
  }

  // Detect the common problem: city === state (both are province)
  const cityEqualsState = normalizeString(address.city) === normalizeString(address.state)

  if (cityEqualsState && address.line2) {
    // Look for district in line2
    const foundDistrict = ISTANBUL_DISTRICTS.find(district =>
      normalizeString(address.line2!).includes(normalizeString(district))
    )

    if (foundDistrict) {
      // Extract neighborhood (remove district from line2)
      let neighborhood = address.line2
      const patterns = [
        new RegExp(",\\s*" + escapeRegex(foundDistrict) + "\\s*$", "i"),
        new RegExp("\\s*" + escapeRegex(foundDistrict) + "\\s*,", "i"),
        new RegExp("\\s*" + escapeRegex(foundDistrict) + "\\s*$", "i"),
      ]
      for (const pattern of patterns) {
        neighborhood = neighborhood.replace(pattern, "").trim()
      }

      normalized.city = foundDistrict
      normalized.line2 = neighborhood || undefined

      changes.push("Extracted district '" + foundDistrict + "' from line2 to city")
      changes.push("Updated line2 to '" + (neighborhood || "(empty)") + "'")
    }
  }

  return { address: normalized, wasNormalized: changes.length > 0, changes }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function main() {
  console.log("=".repeat(70))
  console.log("TURKISH ADDRESS NORMALIZATION E2E TEST")
  console.log("=".repeat(70))
  console.log()

  // Test case: the problematic Turkey address
  const originalAddress: Address = {
    name: "Kutay Sakallıoğlu",
    line1: "North Istanbul Sitesi E Blok Daire 8",
    line2: "Zekeriyaköy Mahallesi, Sarıyer",
    city: "İstanbul",
    state: "İstanbul",
    postalCode: "34450",
    country: "TR",
  }

  console.log("ORIGINAL ADDRESS (THE PROBLEM):")
  console.log("  name: " + JSON.stringify(originalAddress.name))
  console.log("  line1: " + JSON.stringify(originalAddress.line1))
  console.log("  line2: " + JSON.stringify(originalAddress.line2))
  console.log("  city: " + JSON.stringify(originalAddress.city))
  console.log("  state: " + JSON.stringify(originalAddress.state))
  console.log("  postalCode: " + JSON.stringify(originalAddress.postalCode))
  console.log()

  // Normalize the address
  const result = normalizeAddress(originalAddress)

  console.log("AFTER NORMALIZATION:")
  console.log("  name: " + JSON.stringify(result.address.name))
  console.log("  line1: " + JSON.stringify(result.address.line1))
  console.log("  line2: " + JSON.stringify(result.address.line2))
  console.log("  city: " + JSON.stringify(result.address.city))
  console.log("  state: " + JSON.stringify(result.address.state))
  console.log("  postalCode: " + JSON.stringify(result.address.postalCode))
  console.log()
  console.log("  wasNormalized: " + result.wasNormalized)
  console.log("  changes: " + (result.changes.length > 0 ? result.changes.join("; ") : "(none)"))
  console.log()

  // Verify normalization is correct
  const expectedLine2 = "Zekeriyaköy Mahallesi"
  const expectedCity = "Sarıyer"
  const expectedState = "İstanbul"

  const line2Ok = result.address.line2 === expectedLine2
  const cityOk = result.address.city === expectedCity
  const stateOk = result.address.state === expectedState

  console.log("-".repeat(70))
  console.log("LOCAL NORMALIZATION CHECK:")
  console.log("  line2: " + (line2Ok ? "PASS" : "FAIL") + " (expected: " + JSON.stringify(expectedLine2) + ")")
  console.log("  city: " + (cityOk ? "PASS" : "FAIL") + " (expected: " + JSON.stringify(expectedCity) + ")")
  console.log("  state: " + (stateOk ? "PASS" : "FAIL") + " (expected: " + JSON.stringify(expectedState) + ")")
  console.log("-".repeat(70))
  console.log()

  if (!line2Ok || !cityOk || !stateOk) {
    console.error("LOCAL NORMALIZATION FAILED!")
    process.exit(1)
  }

  // Now test with Lob API
  console.log("=".repeat(70))
  console.log("CREATING ADDRESS IN LOB API...")
  console.log("=".repeat(70))
  console.log()

  try {
    const lobAddress = await lob.addresses.create({
      name: result.address.name,
      address_line1: result.address.line1,
      address_line2: result.address.line2,
      address_city: result.address.city,
      address_state: result.address.state,
      address_zip: result.address.postalCode,
      address_country: result.address.country,
      description: "Turkish address normalization test",
    })

    console.log("Address created: " + lobAddress.id)
    console.log("Lob normalized the address to:")
    console.log("  line1: " + JSON.stringify(lobAddress.address_line1))
    console.log("  line2: " + JSON.stringify(lobAddress.address_line2))
    console.log("  city: " + JSON.stringify(lobAddress.address_city))
    console.log("  state: " + JSON.stringify(lobAddress.address_state))
    console.log()

    console.log("=".repeat(70))
    console.log("CREATING TEST LETTER...")
    console.log("=".repeat(70))
    console.log()

    const letterHtml = "<html><body><h1>Turkish Address Test</h1><p>Address normalization working!</p></body></html>"

    const letter = await lob.letters.create({
      to: lobAddress.id,
      from: {
        name: "Capsule Note",
        address_line1: "185 Berry Street",
        address_line2: "Suite 6100",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      file: letterHtml,
      color: false,
      use_type: "operational",
      description: "Turkish address normalization test",
    })

    console.log("Letter created: " + letter.id)
    console.log("Expected delivery: " + letter.expected_delivery_date)
    console.log()
    console.log("=".repeat(70))
    console.log("PDF PREVIEW URL:")
    console.log(letter.url)
    console.log("=".repeat(70))
    console.log()

    console.log("Address as it will appear on letter:")
    console.log("  " + letter.to.name)
    console.log("  " + letter.to.address_line1)
    if (letter.to.address_line2) {
      console.log("  " + letter.to.address_line2)
    }
    console.log("  " + letter.to.address_zip + " " + letter.to.address_city)
    console.log("  " + letter.to.address_state)
    console.log("  " + letter.to.address_country)
    console.log()

    // Cleanup
    console.log("Cancelling letter...")
    await lob.letters.delete(letter.id)
    console.log("Letter cancelled")

    console.log("Deleting address...")
    await lob.addresses.delete(lobAddress.id)
    console.log("Address deleted")
    console.log()

    console.log("=".repeat(70))
    console.log("TEST COMPLETE!")
    console.log()
    console.log("The PDF should show the address formatted correctly:")
    console.log()
    console.log("  KUTAY SAKALLIOGLU")
    console.log("  NORTH ISTANBUL SITESI E BLOK DAIRE 8")
    console.log("  ZEKERIYAKOY MAHALLESI")
    console.log("  34450 SARIYER")
    console.log("  ISTANBUL")
    console.log("  TURKEY")
    console.log()
    console.log("NOT the broken format:")
    console.log()
    console.log("  KUTAY SAKALLIOGLU")
    console.log("  NORTH ISTANBUL SITESI..., ZEKERIYAKOY, 34450 SARIYER/ISTANBUL...")
    console.log("  SARIYER, ISTANBUL 34450")
    console.log("=".repeat(70))
  } catch (error) {
    console.error("Lob API error:", error instanceof Error ? error.message : error)
    throw error
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error)
  process.exit(1)
})
