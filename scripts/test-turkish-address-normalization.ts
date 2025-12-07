/**
 * Test script for Turkish Address Normalization
 *
 * This script tests the complete address normalization solution for Turkish addresses.
 *
 * Usage:
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-turkish-address-normalization.ts
 */

import Lob from "lob"
import { normalizeAddressForLob, createLobAddress, type MailingAddress } from "../apps/web/server/providers/lob"

const LOB_API_KEY = process.env.LOB_API_KEY

if (!LOB_API_KEY) {
  console.error("LOB_API_KEY is not set")
  process.exit(1)
}

const isTestKey = LOB_API_KEY.startsWith("test_")
console.log("Using Lob " + (isTestKey ? "TEST" : "LIVE") + " API Key")
console.log()

const lob = new Lob(LOB_API_KEY)

interface TestCase {
  name: string
  description: string
  input: MailingAddress
  expectedLine2: string | undefined
  expectedCity: string
  expectedState: string
}

const testCases: TestCase[] = [
  {
    name: "Turkey - Original Problem",
    description: "The exact address that was causing the duplication issue",
    input: {
      name: "Kutay Sakallıoğlu",
      line1: "North Istanbul Sitesi E Blok Daire 8",
      line2: "Zekeriyaköy Mahallesi, Sarıyer",
      city: "İstanbul",
      state: "İstanbul",
      postalCode: "34450",
      country: "TR",
    },
    expectedLine2: "Zekeriyaköy Mahallesi",
    expectedCity: "Sarıyer",
    expectedState: "İstanbul",
  },
  {
    name: "Turkey - District only in line2",
    description: "When line2 contains only the district name",
    input: {
      name: "Test User",
      line1: "Test Street 123",
      line2: "Kadıköy",
      city: "İstanbul",
      state: "İstanbul",
      postalCode: "34700",
      country: "TR",
    },
    expectedLine2: undefined,
    expectedCity: "Kadıköy",
    expectedState: "İstanbul",
  },
  {
    name: "US Address - No normalization",
    description: "US addresses should pass through unchanged",
    input: {
      name: "John Doe",
      line1: "185 Berry Street",
      line2: "Suite 6100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "US",
    },
    expectedLine2: "Suite 6100",
    expectedCity: "San Francisco",
    expectedState: "CA",
  },
]

async function runTests() {
  console.log("=".repeat(70))
  console.log("TURKISH ADDRESS NORMALIZATION TEST")
  console.log("=".repeat(70))
  console.log()

  let passed = 0
  let failed = 0

  console.log("-".repeat(70))
  console.log("PHASE 1: LOCAL NORMALIZATION TESTS")
  console.log("-".repeat(70))
  console.log()

  for (const testCase of testCases) {
    console.log("Testing: " + testCase.name)
    console.log("  " + testCase.description)
    console.log()

    const result = normalizeAddressForLob(testCase.input)

    console.log("  Input:")
    console.log("    line2: " + JSON.stringify(testCase.input.line2))
    console.log("    city: " + JSON.stringify(testCase.input.city))
    console.log("    state: " + JSON.stringify(testCase.input.state))
    console.log()

    console.log("  Output:")
    console.log("    line2: " + JSON.stringify(result.address.line2))
    console.log("    city: " + JSON.stringify(result.address.city))
    console.log("    state: " + JSON.stringify(result.address.state))
    console.log("    wasNormalized: " + result.wasNormalized)
    if (result.changes.length > 0) {
      console.log("    changes: " + result.changes.join("; "))
    }
    console.log()

    const line2Match = (result.address.line2 || undefined) === testCase.expectedLine2
    const cityMatch = result.address.city === testCase.expectedCity
    const stateMatch = result.address.state === testCase.expectedState

    if (line2Match && cityMatch && stateMatch) {
      console.log("  PASS")
      passed++
    } else {
      console.log("  FAIL")
      failed++
      console.log("  Expected:")
      console.log("    line2: " + JSON.stringify(testCase.expectedLine2))
      console.log("    city: " + JSON.stringify(testCase.expectedCity))
      console.log("    state: " + JSON.stringify(testCase.expectedState))
    }
    console.log()
  }

  console.log("-".repeat(70))
  console.log("LOCAL TESTS: " + passed + " passed, " + failed + " failed")
  console.log("-".repeat(70))
  console.log()

  // Phase 2: End-to-end test with Lob API
  console.log("-".repeat(70))
  console.log("PHASE 2: END-TO-END LOB API TEST")
  console.log("-".repeat(70))
  console.log()

  const problemAddress = testCases[0] // Turkey - Original Problem
  const normalization = normalizeAddressForLob(problemAddress.input)
  const normalizedAddress = normalization.address

  console.log("Normalized address to send to Lob:")
  console.log("  name: " + JSON.stringify(normalizedAddress.name))
  console.log("  line1: " + JSON.stringify(normalizedAddress.line1))
  console.log("  line2: " + JSON.stringify(normalizedAddress.line2))
  console.log("  city: " + JSON.stringify(normalizedAddress.city))
  console.log("  state: " + JSON.stringify(normalizedAddress.state))
  console.log("  postalCode: " + JSON.stringify(normalizedAddress.postalCode))
  console.log("  country: " + JSON.stringify(normalizedAddress.country))
  console.log()

  try {
    console.log("Step 1: Creating Lob address object...")
    const lobAddress = await createLobAddress(normalizedAddress, {
      description: "Turkish address normalization test",
    })

    console.log("  Address created: " + lobAddress.id)
    console.log("  Normalized by Lob:")
    console.log("    line1: " + JSON.stringify(lobAddress.normalized.line1))
    console.log("    line2: " + JSON.stringify(lobAddress.normalized.line2))
    console.log("    city: " + JSON.stringify(lobAddress.normalized.city))
    console.log("    state: " + JSON.stringify(lobAddress.normalized.state))
    console.log()

    console.log("Step 2: Creating test letter...")
    const letterHtml = "<html><body><h1>Turkish Address Normalization Test</h1><p>If you can read this, the address normalization is working correctly!</p></body></html>"

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

    console.log("  Letter created: " + letter.id)
    console.log("  Expected delivery: " + letter.expected_delivery_date)
    console.log()
    console.log("=".repeat(70))
    console.log("PDF PREVIEW URL (PLEASE CHECK THIS):")
    console.log(letter.url)
    console.log("=".repeat(70))
    console.log()

    console.log("Address in letter response:")
    console.log("  name: " + JSON.stringify(letter.to.name))
    console.log("  line1: " + JSON.stringify(letter.to.address_line1))
    console.log("  line2: " + JSON.stringify(letter.to.address_line2))
    console.log("  city: " + JSON.stringify(letter.to.address_city))
    console.log("  state: " + JSON.stringify(letter.to.address_state))
    console.log("  zip: " + JSON.stringify(letter.to.address_zip))
    console.log("  country: " + JSON.stringify(letter.to.address_country))
    console.log()

    console.log("Step 3: Cancelling test letter...")
    await lob.letters.delete(letter.id)
    console.log("  Letter cancelled")
    console.log()

    console.log("Step 4: Cleaning up address...")
    await lob.addresses.delete(lobAddress.id)
    console.log("  Address deleted")
    console.log()

    console.log("=".repeat(70))
    console.log("END-TO-END TEST COMPLETE")
    console.log()
    console.log("The PDF at the URL above should show the address formatted as:")
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
    console.log("  NORTH ISTANBUL SITESI E BLOK DAIRE 8, ZEKERIYAKOY, 34450 SARIYER/ISTANBUL, TURKIYE")
    console.log("  SARIYER, ISTANBUL 34450")
    console.log("=".repeat(70))
  } catch (error) {
    console.error("Lob API error:", error instanceof Error ? error.message : error)
    throw error
  }

  console.log()
  console.log("=".repeat(70))
  console.log("TEST SUMMARY")
  console.log("=".repeat(70))
  console.log("Local normalization tests: " + passed + "/" + testCases.length + " passed")
  console.log("End-to-end Lob API test: COMPLETED")
  console.log()
  console.log("IMPORTANT: Please verify the PDF output at the URL above!")
  console.log("=".repeat(70))
}

runTests().catch((error) => {
  console.error("Unhandled error:", error)
  process.exit(1)
})
