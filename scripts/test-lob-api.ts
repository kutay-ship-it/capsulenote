/**
 * Lob API Proof of Concept Test Script
 *
 * Tests Lob API integration for physical mail delivery in Capsule Note.
 * Uses the Test API key - no actual mail will be sent.
 *
 * Run with: pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-api.ts
 */

import Lob from "lob"

// Test configuration
const LOB_TEST_API_KEY = process.env.LOB_API_KEY

if (!LOB_TEST_API_KEY) {
  console.error("❌ LOB_API_KEY is not set in environment variables")
  process.exit(1)
}

console.log("🔑 Using Lob API Key:", LOB_TEST_API_KEY.substring(0, 10) + "...")

// Initialize Lob client
const lob = new Lob(LOB_TEST_API_KEY)

// Test addresses (using Lob's test addresses)
const testToAddress = {
  name: "Test Recipient",
  address_line1: "185 Berry Street",
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94107",
  address_country: "US",
}

const testFromAddress = {
  name: "Capsule Note",
  address_line1: "185 Berry Street",
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94107",
  address_country: "US",
}

// Simple HTML template for the letter
const letterHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 6.5in;
      margin: 0.5in auto;
      padding: 0.5in;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 2em;
      border-bottom: 2px solid #4F46E5;
      padding-bottom: 1em;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #4F46E5;
    }
    .date {
      text-align: right;
      color: #666;
      margin-bottom: 2em;
    }
    .greeting {
      margin-bottom: 1em;
    }
    .content {
      margin-bottom: 2em;
    }
    .signature {
      margin-top: 2em;
    }
    .footer {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Capsule Note</div>
    <div>A Letter to Your Future Self</div>
  </div>

  <div class="date">
    ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
  </div>

  <div class="greeting">
    Dear Future Self,
  </div>

  <div class="content">
    <p>This is a test letter from Capsule Note's Lob API integration.</p>

    <p>If you're reading this, it means our physical mail delivery system is working correctly!
    This letter was generated programmatically through the Lob Print & Mail API.</p>

    <p>Key features tested:</p>
    <ul>
      <li>Address verification</li>
      <li>Letter creation with HTML template</li>
      <li>Expected delivery date calculation</li>
      <li>Tracking capabilities</li>
    </ul>

    <p>Remember: every moment is a chance to write your own story.</p>
  </div>

  <div class="signature">
    <p>With hope for the future,</p>
    <p><strong>Capsule Note Team</strong></p>
  </div>

  <div class="footer">
    Capsule Note - Write to your future self<br>
    www.capsulenote.com
  </div>
</body>
</html>
`

async function testAddressVerification() {
  console.log("\n📍 Testing Address Verification...")

  try {
    const verification = await lob.usVerifications.verify({
      primary_line: testToAddress.address_line1,
      secondary_line: testToAddress.address_line2,
      city: testToAddress.address_city,
      state: testToAddress.address_state,
      zip_code: testToAddress.address_zip,
    })

    console.log("✅ Address Verification Result:")
    console.log("   - Deliverability:", verification.deliverability)
    console.log(
      "   - Primary Line:",
      verification.primary_line
    )
    console.log(
      "   - City/State/ZIP:",
      `${verification.components?.city}, ${verification.components?.state} ${verification.components?.zip_code}`
    )
    console.log("   - Delivery Point Barcode:", verification.deliverability_analysis?.dpv_confirmation || "N/A")

    return verification
  } catch (error) {
    console.error("❌ Address Verification Failed:", error)
    throw error
  }
}

async function testLetterCreation() {
  console.log("\n📬 Testing Letter Creation...")

  try {
    const letter = await lob.letters.create({
      description: "Capsule Note - Test Letter",
      to: testToAddress,
      from: testFromAddress,
      file: letterHtml,
      color: false,
      double_sided: false,
      address_placement: "top_first_page",
      mail_type: "usps_first_class",
      use_type: "operational", // Required: "marketing" or "operational" - letters to self are operational
    })

    console.log("✅ Letter Created Successfully!")
    console.log("   - Letter ID:", letter.id)
    console.log("   - Description:", letter.description)
    console.log("   - Expected Delivery:", letter.expected_delivery_date)
    console.log("   - Mail Type:", letter.mail_type)
    console.log("   - URL:", letter.url)
    console.log("   - Thumbnails:", letter.thumbnails?.length || 0, "generated")
    console.log("   - Carrier:", letter.carrier)
    console.log("   - Tracking Number:", letter.tracking_number || "Pending")

    return letter
  } catch (error) {
    console.error("❌ Letter Creation Failed:", error)
    throw error
  }
}

async function testPostcardCreation() {
  console.log("\n🖼️  Testing Postcard Creation...")

  try {
    const postcard = await lob.postcards.create({
      description: "Capsule Note - Test Postcard",
      to: testToAddress,
      from: testFromAddress,
      front: `
        <html>
        <body style="width: 6.25in; height: 4.25in; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: Georgia, serif;">
          <h1 style="font-size: 36px; margin: 0;">Capsule Note</h1>
          <p style="font-size: 18px; margin-top: 10px;">A message from your past self</p>
        </body>
        </html>
      `,
      back: `
        <html>
        <body style="width: 6.25in; height: 4.25in; padding: 0.5in; font-family: Georgia, serif; font-size: 14px;">
          <p>Dear Future Self,</p>
          <p>This is a test postcard from Capsule Note. If you're reading this, our physical mail system is working!</p>
          <p style="margin-top: 1em;">- Capsule Note Team</p>
        </body>
        </html>
      `,
      size: "4x6",
      use_type: "operational", // Required: "marketing" or "operational"
    })

    console.log("✅ Postcard Created Successfully!")
    console.log("   - Postcard ID:", postcard.id)
    console.log("   - Expected Delivery:", postcard.expected_delivery_date)
    console.log("   - Size:", postcard.size)
    console.log("   - URL:", postcard.url)

    return postcard
  } catch (error) {
    console.error("❌ Postcard Creation Failed:", error)
    throw error
  }
}

async function testListLetters() {
  console.log("\n📋 Testing List Letters...")

  try {
    const letters = await lob.letters.list({ limit: 5 })

    console.log("✅ Retrieved Letters:")
    console.log("   - Total Count:", letters.count)
    console.log("   - Showing:", letters.data?.length || 0, "letters")

    if (letters.data && letters.data.length > 0) {
      letters.data.forEach((letter: any, index: number) => {
        console.log(`   ${index + 1}. ${letter.id} - ${letter.description || "No description"} (${letter.expected_delivery_date})`)
      })
    }

    return letters
  } catch (error) {
    console.error("❌ List Letters Failed:", error)
    throw error
  }
}

async function testRetrieveLetter(letterId: string) {
  console.log("\n🔍 Testing Retrieve Letter...")

  try {
    const letter = await lob.letters.retrieve(letterId)

    console.log("✅ Letter Retrieved:")
    console.log("   - ID:", letter.id)
    console.log("   - Status:", letter.deleted ? "Deleted" : "Active")
    console.log("   - Tracking Events:", letter.tracking_events?.length || 0)

    if (letter.tracking_events && letter.tracking_events.length > 0) {
      console.log("   - Latest Event:", letter.tracking_events[0].name)
    }

    return letter
  } catch (error) {
    console.error("❌ Retrieve Letter Failed:", error)
    throw error
  }
}

async function runAllTests() {
  console.log("🚀 Starting Lob API Integration Tests")
  console.log("=" .repeat(50))

  const results: Record<string, boolean> = {}

  // Test 1: Address Verification
  try {
    await testAddressVerification()
    results["Address Verification"] = true
  } catch {
    results["Address Verification"] = false
  }

  // Test 2: Letter Creation
  let createdLetter: any = null
  try {
    createdLetter = await testLetterCreation()
    results["Letter Creation"] = true
  } catch {
    results["Letter Creation"] = false
  }

  // Test 3: Postcard Creation
  try {
    await testPostcardCreation()
    results["Postcard Creation"] = true
  } catch {
    results["Postcard Creation"] = false
  }

  // Test 4: List Letters
  try {
    await testListLetters()
    results["List Letters"] = true
  } catch {
    results["List Letters"] = false
  }

  // Test 5: Retrieve Letter (if letter was created)
  if (createdLetter) {
    try {
      await testRetrieveLetter(createdLetter.id)
      results["Retrieve Letter"] = true
    } catch {
      results["Retrieve Letter"] = false
    }
  }

  // Summary
  console.log("\n" + "=" .repeat(50))
  console.log("📊 Test Results Summary:")
  console.log("=" .repeat(50))

  let passed = 0
  let failed = 0

  Object.entries(results).forEach(([test, success]) => {
    const icon = success ? "✅" : "❌"
    console.log(`   ${icon} ${test}`)
    if (success) passed++
    else failed++
  })

  console.log("\n" + "-" .repeat(50))
  console.log(`   Total: ${passed} passed, ${failed} failed`)
  console.log("=" .repeat(50))

  // Important notes for production
  console.log("\n📝 Notes for Production Implementation:")
  console.log("   1. Set up webhooks for tracking events (letter.in_transit, letter.delivered, etc.)")
  console.log("   2. Configure proper sender address for Capsule Note")
  console.log("   3. Implement arrive-by date calculation using transit time estimates")
  console.log("   4. Store lob_job_id in MailDelivery model for tracking")
  console.log("   5. Consider using Lob's HTML template system for consistent branding")
  console.log("   6. Set up proper error handling for address validation failures")
  console.log("   7. Implement idempotency keys for duplicate prevention")
}

// Run tests
runAllTests()
  .then(() => {
    console.log("\n✨ All tests completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Test suite failed:", error)
    process.exit(1)
  })
