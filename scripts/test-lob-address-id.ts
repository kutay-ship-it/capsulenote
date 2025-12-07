/**
 * Test script for Lob Address ID flow
 *
 * This script tests the fix for address line duplication issues that occur
 * with international addresses when using inline addresses.
 *
 * The fix creates a Lob Address object first (which has more generous character
 * limits), then uses the address ID in letter creation.
 *
 * Usage:
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-address-id.ts
 */

import Lob from "lob"

// Get API key from environment
const LOB_API_KEY = process.env.LOB_API_KEY

if (!LOB_API_KEY) {
  console.error("❌ LOB_API_KEY is not set in environment variables")
  process.exit(1)
}

const isTestKey = LOB_API_KEY.startsWith("test_")
console.log(`🔑 Using Lob ${isTestKey ? "TEST" : "LIVE"} API Key: ${LOB_API_KEY.substring(0, 10)}...`)
console.log()

// Initialize Lob client
const lob = new Lob(LOB_API_KEY)

// Character limits for Lob addresses
const LOB_ADDRESS_LIMITS = {
  NAME_US: 40,
  NAME_INTL: 50,
  ADDRESS_LINE1: 64,
  ADDRESS_LINE2: 64,
  CITY: 200,
  STATE: 200,
  POSTAL_CODE: 40,
  COMBINED_ADDRESS_LINES_LEGACY: 50,
}

// Test address interface
interface MailingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Test addresses - including the problematic Turkey address
const testAddresses: { name: string; address: MailingAddress; description: string }[] = [
  {
    name: "Turkey - Original Problem Address",
    description:
      "This is the original address that caused duplication (66 chars combined, exceeds 50 char legacy limit)",
    address: {
      name: "Kutay Sakallıoğlu",
      line1: "North Istanbul Sitesi E Blok Daire 8",
      line2: "Zekeriyaköy Mahallesi, Sarıyer",
      city: "İstanbul",
      state: "İstanbul",
      postalCode: "34450",
      country: "TR",
    },
  },
  {
    name: "US - Standard Address",
    description: "A normal US address within all limits",
    address: {
      name: "John Doe",
      line1: "185 Berry Street",
      line2: "Suite 6100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "US",
    },
  },
]

// Sender address
const senderAddress = {
  name: "Capsule Note",
  address_line1: "185 Berry Street",
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94107",
  address_country: "US",
}

// Validate address against limits
function validateAddress(address: MailingAddress): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const isUS = address.country === "US" || address.country === "USA"
  const nameLimit = isUS ? LOB_ADDRESS_LIMITS.NAME_US : LOB_ADDRESS_LIMITS.NAME_INTL

  if (address.name.length > nameLimit) {
    errors.push(`Name exceeds ${nameLimit} char limit (${address.name.length} chars)`)
  }
  if (address.line1.length > LOB_ADDRESS_LIMITS.ADDRESS_LINE1) {
    errors.push(`Line 1 exceeds ${LOB_ADDRESS_LIMITS.ADDRESS_LINE1} char limit (${address.line1.length} chars)`)
  }
  if (address.line2 && address.line2.length > LOB_ADDRESS_LIMITS.ADDRESS_LINE2) {
    errors.push(`Line 2 exceeds ${LOB_ADDRESS_LIMITS.ADDRESS_LINE2} char limit (${address.line2.length} chars)`)
  }

  const combinedLength = address.line1.length + (address.line2?.length || 0)
  if (combinedLength > LOB_ADDRESS_LIMITS.COMBINED_ADDRESS_LINES_LEGACY) {
    warnings.push(
      `Combined lines (${combinedLength} chars) exceed legacy 50-char inline limit. Using Address ID system.`
    )
  }

  return { valid: errors.length === 0, errors, warnings }
}

async function main() {
  console.log("=" .repeat(70))
  console.log("LOB ADDRESS ID FLOW TEST")
  console.log("=" .repeat(70))
  console.log()

  console.log("📏 Character Limits:")
  console.log(`   Name (US): ${LOB_ADDRESS_LIMITS.NAME_US} | Name (Intl): ${LOB_ADDRESS_LIMITS.NAME_INTL}`)
  console.log(`   Address Line 1/2: ${LOB_ADDRESS_LIMITS.ADDRESS_LINE1} each`)
  console.log(`   Legacy Combined: ${LOB_ADDRESS_LIMITS.COMBINED_ADDRESS_LINES_LEGACY} chars`)
  console.log()

  const createdAddressIds: string[] = []
  const createdLetterIds: string[] = []

  for (const testCase of testAddresses) {
    console.log("-".repeat(70))
    console.log(`📍 ${testCase.name}`)
    console.log(`   ${testCase.description}`)
    console.log()

    const { address } = testCase
    const combinedLength = address.line1.length + (address.line2?.length || 0)

    console.log("📊 Address Analysis:")
    console.log(`   Name: "${address.name}" (${address.name.length} chars)`)
    console.log(`   Line 1: "${address.line1}" (${address.line1.length} chars)`)
    console.log(`   Line 2: "${address.line2 || "(empty)"}" (${address.line2?.length || 0} chars)`)
    console.log(`   Combined: ${combinedLength} chars`)
    console.log(
      `   ${combinedLength > 50 ? "⚠️  EXCEEDS" : "✅ Within"} legacy 50-char inline limit`
    )
    console.log()

    // Validate
    const validation = validateAddress(address)
    console.log("1️⃣  Validation:")
    console.log(`   Valid: ${validation.valid ? "✅" : "❌"}`)
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((w) => console.log(`   ⚠️  ${w}`))
    }
    console.log()

    if (!validation.valid) {
      console.log("❌ Skipping due to validation errors:", validation.errors.join("; "))
      continue
    }

    // Step 2: Create Lob address
    console.log("2️⃣  Creating Lob Address object...")
    try {
      const lobAddress = await lob.addresses.create({
        name: address.name,
        address_line1: address.line1,
        address_line2: address.line2,
        address_city: address.city,
        address_state: address.state,
        address_zip: address.postalCode,
        address_country: address.country,
        description: `Test: ${testCase.name}`,
      })

      console.log(`   ✅ Created: ${lobAddress.id}`)
      console.log(`   Normalized: ${lobAddress.address_line1}`)
      if (lobAddress.address_line2) {
        console.log(`   Line 2: ${lobAddress.address_line2}`)
      }
      console.log()

      createdAddressIds.push(lobAddress.id)

      // Step 3: Create letter using address ID (only for Turkey test)
      if (testCase.name.includes("Turkey")) {
        console.log("3️⃣  Creating letter with address ID...")

        const letterHtml = `
<!DOCTYPE html>
<html>
<head><style>body{font-family:Georgia,serif;margin:0.75in;}</style></head>
<body>
<h1>Address ID Test</h1>
<p>This letter tests the Address ID system fix for international addresses.</p>
<p>The recipient address has ${combinedLength} combined characters, which exceeds the legacy 50-char inline limit.</p>
<p>By using a Lob Address ID (${lobAddress.id}), we avoid address formatting issues.</p>
<p style="margin-top:2em;">— Capsule Note Test Script</p>
</body>
</html>`

        try {
          const letter = await lob.letters.create({
            to: lobAddress.id, // <-- Using address ID instead of inline!
            from: senderAddress,
            file: letterHtml,
            color: false,
            use_type: "operational",
            description: `Address ID Test: ${address.name}`,
          })

          console.log(`   ✅ Letter created: ${letter.id}`)
          console.log(`   Expected delivery: ${letter.expected_delivery_date}`)
          console.log(`   Preview: ${letter.url}`)
          console.log()

          createdLetterIds.push(letter.id)

          // Step 4: Cancel the test letter
          console.log("4️⃣  Cancelling test letter...")
          const deleteResult = await lob.letters.delete(letter.id)
          console.log(`   ✅ Cancelled: ${deleteResult.deleted}`)
          console.log()
        } catch (error) {
          console.error(`   ❌ Letter creation failed:`, error instanceof Error ? error.message : error)
        }
      }
    } catch (error) {
      console.error(`   ❌ Address creation failed:`, error instanceof Error ? error.message : error)
    }
  }

  // Cleanup
  console.log("=" .repeat(70))
  console.log("🧹 CLEANUP")
  console.log("=" .repeat(70))

  for (const id of createdAddressIds) {
    try {
      await lob.addresses.delete(id)
      console.log(`   ✅ Deleted address: ${id}`)
    } catch (error) {
      console.log(`   ⚠️  Could not delete ${id}: ${error instanceof Error ? error.message : error}`)
    }
  }

  console.log()
  console.log("=" .repeat(70))
  console.log("✅ TEST COMPLETE")
  console.log("=" .repeat(70))
  console.log()
  console.log("Summary:")
  console.log(`   • Addresses created and tested: ${createdAddressIds.length}`)
  console.log(`   • Letters created (and cancelled): ${createdLetterIds.length}`)
  console.log()
  console.log("The Address ID system allows international addresses with combined")
  console.log("address lines >50 chars to be formatted correctly by Lob.")
}

main().catch((error) => {
  console.error("Unhandled error:", error)
  process.exit(1)
})
