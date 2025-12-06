#!/usr/bin/env npx tsx
/**
 * Verify Lob Template Exists
 *
 * Run with: pnpm dotenv -e apps/web/.env.local -- npx tsx scripts/verify-lob-template.ts
 */

import Lob from "lob"

const LOB_API_KEY = process.env.LOB_API_KEY
const LOB_TEMPLATE_ID = process.env.LOB_TEMPLATE_ID
const LOB_TEMPLATE_VERSION_ID = process.env.LOB_TEMPLATE_VERSION_ID

console.log("=== Lob Template Verification ===\n")
console.log("Environment:")
console.log(`  LOB_API_KEY: ${LOB_API_KEY ? LOB_API_KEY.substring(0, 15) + "..." : "(not set)"}`)
console.log(`  LOB_TEMPLATE_ID: ${LOB_TEMPLATE_ID || "(not set)"}`)
console.log(`  LOB_TEMPLATE_VERSION_ID: ${LOB_TEMPLATE_VERSION_ID || "(not set)"}`)
console.log(`  API Environment: ${LOB_API_KEY?.startsWith("test_") ? "TEST" : LOB_API_KEY?.startsWith("live_") ? "LIVE" : "UNKNOWN"}`)
console.log("")

if (!LOB_API_KEY) {
  console.error("ERROR: LOB_API_KEY not set")
  process.exit(1)
}

if (!LOB_TEMPLATE_ID) {
  console.error("ERROR: LOB_TEMPLATE_ID not set")
  process.exit(1)
}

const lob = new Lob(LOB_API_KEY)

async function verifyTemplate() {
  try {
    // Try to list templates to see what's available
    console.log("Attempting to list templates...")

    // The Lob SDK v6 doesn't have a direct templates.retrieve method
    // We need to use the REST API directly or check via a test letter

    // Let's try creating a test letter with the template to see if it works
    console.log("\nTesting template with a minimal request...")

    const testParams = {
      description: "Template verification test",
      to: {
        name: "Test Recipient",
        address_line1: "185 Berry St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      from: {
        name: "Capsule Note",
        address_line1: "185 Berry St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      template_id: LOB_TEMPLATE_ID,
      template_version_id: LOB_TEMPLATE_VERSION_ID,
      merge_variables: {
        recipient_name: "Test User",
        letter_content: "<p>Test content</p>",
        written_date: "January 1, 2024",
        delivery_date: "December 25, 2024",
        letter_title: "Test Letter",
      },
      color: false,
      use_type: "operational" as const,
    }

    console.log("\nRequest params:")
    console.log(JSON.stringify(testParams, null, 2))

    // @ts-ignore - template_id might not be in types but is valid API param
    const result = await lob.letters.create(testParams)

    console.log("\n✅ SUCCESS! Template is valid and accessible.")
    console.log(`  Letter ID: ${result.id}`)
    console.log(`  URL: ${result.url}`)
    console.log(`  Expected Delivery: ${result.expected_delivery_date}`)

    // Cancel the test letter if it's a test environment
    if (LOB_API_KEY.startsWith("test_")) {
      console.log("\nCancelling test letter...")
      await lob.letters.delete(result.id)
      console.log("  Test letter cancelled.")
    }

  } catch (error: any) {
    console.error("\n❌ TEMPLATE ERROR:")
    console.error(`  Status: ${error?.status_code || error?.statusCode || "unknown"}`)
    console.error(`  Message: ${error?.message || error}`)

    if (error?._response?.body?.error) {
      console.error(`  Lob Error: ${JSON.stringify(error._response.body.error, null, 2)}`)
    }

    console.log("\n🔍 TROUBLESHOOTING:")
    console.log("  1. Go to https://dashboard.lob.com/templates")
    console.log("  2. Check if template exists with ID:", LOB_TEMPLATE_ID)
    console.log("  3. Verify you're using the correct API key environment (test vs live)")
    console.log("  4. If template was created with LIVE key, it won't work with TEST key")
    console.log("")
    console.log("  To create a new template:")
    console.log("  1. Go to Lob Dashboard → Templates → Create Template")
    console.log("  2. Paste contents of: docs/lob-production-template.html")
    console.log("  3. Save and copy the new template_id and version_id")
    console.log("  4. Update .env.local with new values")
  }
}

verifyTemplate()
