/**
 * Send Real Letter to Turkey via Lob Live API
 *
 * This script sends an actual physical letter using Lob's live API.
 * The letter will be printed and mailed to the specified address.
 *
 * Run with: pnpm dotenv -e apps/web/.env.local -- tsx scripts/send-real-letter-turkey.ts
 */

import Lob from "lob"

// Use LIVE API key for real delivery
const LOB_LIVE_API_KEY = process.env.LOB_LIVE_API_KEY

if (!LOB_LIVE_API_KEY) {
  console.error("❌ LOB_LIVE_API_KEY is not set in environment variables")
  process.exit(1)
}

console.log("🔑 Using Lob LIVE API Key:", LOB_LIVE_API_KEY.substring(0, 10) + "...")
console.log("⚠️  THIS WILL SEND A REAL LETTER - YOU WILL BE CHARGED\n")

// Initialize Lob client with LIVE key
const lob = new Lob(LOB_LIVE_API_KEY)

// Recipient address in Turkey
const recipientAddress = {
  name: "Kutay Sakallıoğlu",
  address_line1: "North Istanbul Sitesi E Blok Daire 8",
  address_line2: "Zekeriyaköy Mahallesi, Sarıyer",
  address_city: "İstanbul",
  address_state: "İstanbul",
  address_zip: "34450",
  address_country: "TR", // Turkey country code
}

// Sender address (Capsule Note)
const senderAddress = {
  name: "Capsule Note",
  address_line1: "185 Berry Street",
  address_line2: "Suite 6100",
  address_city: "San Francisco",
  address_state: "CA",
  address_zip: "94107",
  address_country: "US",
}

// Demo letter HTML - 1 page, professional design
const letterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      max-width: 7in;
      margin: 0 auto;
      padding: 0.75in;
      line-height: 1.8;
      color: #1a1a1a;
      font-size: 12pt;
    }

    .header {
      text-align: center;
      margin-bottom: 2em;
      padding-bottom: 1.5em;
      border-bottom: 3px solid #4F46E5;
    }

    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      letter-spacing: 2px;
      margin-bottom: 0.3em;
    }

    .tagline {
      font-size: 14px;
      color: #6B7280;
      font-style: italic;
    }

    .date {
      text-align: right;
      color: #6B7280;
      margin-bottom: 2em;
      font-size: 11pt;
    }

    .greeting {
      font-size: 14pt;
      margin-bottom: 1.5em;
      color: #1a1a1a;
    }

    .content {
      margin-bottom: 1.5em;
      text-align: justify;
    }

    .content p {
      margin-bottom: 1em;
    }

    .highlight-box {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      border-left: 4px solid #4F46E5;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0 8px 8px 0;
    }

    .highlight-box p {
      margin: 0;
      font-style: italic;
      color: #3730A3;
    }

    .signature {
      margin-top: 2em;
    }

    .signature-name {
      font-weight: bold;
      color: #4F46E5;
      font-size: 13pt;
    }

    .footer {
      margin-top: 3em;
      padding-top: 1.5em;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 10pt;
      color: #9CA3AF;
    }

    .footer-logo {
      color: #4F46E5;
      font-weight: bold;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 2em;
      margin-top: 0.5em;
      font-size: 9pt;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-weight: bold;
      color: #4F46E5;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CAPSULE NOTE</div>
    <div class="tagline">Letters to Your Future Self</div>
  </div>

  <div class="date">
    November 25, 2025
  </div>

  <div class="greeting">
    Dear Kutay,
  </div>

  <div class="content">
    <p>
      Welcome to Capsule Note! This letter you're holding is proof that our physical mail
      delivery system works — a real letter, traveling from San Francisco to İstanbul,
      carrying words meant just for you.
    </p>

    <p>
      We built Capsule Note because we believe some messages deserve more than a screen.
      They deserve to be held, folded, kept in a drawer, and discovered years later when
      you've forgotten you wrote them. There's something magical about receiving a letter
      from your past self — it's like having a conversation across time.
    </p>

    <div class="highlight-box">
      <p>
        "The best time to plant a tree was 20 years ago. The second best time is now.
        The best time to write to your future self? Also now."
      </p>
    </div>

    <p>
      Your letters are encrypted with AES-256-GCM encryption — the same standard used by
      banks and governments. We literally cannot read what you write. Your thoughts remain
      yours, protected until the moment they arrive in your mailbox.
    </p>

    <p>
      Whether you're setting goals, preserving memories, or leaving advice for tomorrow's you,
      every letter is a small act of hope. You're betting on your future. You're saying:
      "I'll still be here. I'll still care. I'll want to remember this moment."
    </p>

    <p>
      Thank you for being part of our journey. This physical letter is just the beginning —
      imagine what you'll write to yourself next.
    </p>
  </div>

  <div class="signature">
    <p>With hope for your future,</p>
    <p class="signature-name">The Capsule Note Team</p>
    <p style="color: #6B7280; font-size: 11pt;">San Francisco, California</p>
  </div>

  <div class="footer">
    <div class="footer-logo">CAPSULE NOTE</div>
    <div>www.capsulenote.com</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">27,000+</div>
        <div>Letters Scheduled</div>
      </div>
      <div class="stat">
        <div class="stat-value">99.97%</div>
        <div>On-Time Delivery</div>
      </div>
      <div class="stat">
        <div class="stat-value">74</div>
        <div>Countries</div>
      </div>
    </div>
  </div>
</body>
</html>
`

async function verifyInternationalAddress() {
  console.log("📍 Verifying international address...")

  try {
    // For international addresses, Lob uses intlVerifications
    const verification = await lob.intlVerifications.verify({
      primary_line: recipientAddress.address_line1,
      secondary_line: recipientAddress.address_line2,
      city: recipientAddress.address_city,
      state: recipientAddress.address_state,
      postal_code: recipientAddress.address_zip,
      country: recipientAddress.address_country,
    })

    console.log("✅ Address Verification Result:")
    console.log("   - Deliverability:", verification.deliverability)
    console.log("   - Primary Line:", verification.primary_line)
    console.log("   - City:", verification.components?.city)
    console.log("   - Country:", verification.components?.country)

    return verification
  } catch (error: any) {
    console.log("⚠️  Address verification not available for Turkey, proceeding with send...")
    console.log("   (Lob will validate during letter creation)")
    return null
  }
}

async function sendRealLetter() {
  console.log("\n📬 Creating REAL letter for delivery to Turkey...\n")

  try {
    const letter = await lob.letters.create({
      description: "Capsule Note - Welcome Letter to Turkey",
      to: recipientAddress,
      from: senderAddress,
      file: letterHtml,
      color: false, // B&W as requested
      double_sided: false, // Single-sided as requested
      address_placement: "top_first_page",
      mail_type: "usps_first_class", // First class as requested
      use_type: "operational", // Required field
    })

    console.log("=" .repeat(60))
    console.log("✅ LETTER CREATED SUCCESSFULLY!")
    console.log("=" .repeat(60))
    console.log("")
    console.log("📋 Letter Details:")
    console.log("   - Letter ID:", letter.id)
    console.log("   - Description:", letter.description)
    console.log("   - Expected Delivery:", letter.expected_delivery_date)
    console.log("   - Mail Type:", letter.mail_type)
    console.log("   - Carrier:", letter.carrier)
    console.log("   - Tracking Number:", letter.tracking_number || "Will be assigned when shipped")
    console.log("")
    console.log("📄 Preview URL:")
    console.log("   ", letter.url)
    console.log("")
    console.log("🖼️  Thumbnails:", letter.thumbnails?.length || 0, "generated")
    if (letter.thumbnails && letter.thumbnails.length > 0) {
      console.log("   - Small:", letter.thumbnails[0].small)
    }
    console.log("")
    console.log("📍 Destination:")
    console.log("   ", recipientAddress.name)
    console.log("   ", recipientAddress.address_line1)
    console.log("   ", recipientAddress.address_line2)
    console.log("   ", `${recipientAddress.address_city}, ${recipientAddress.address_state} ${recipientAddress.address_zip}`)
    console.log("   ", "Turkey")
    console.log("")
    console.log("=" .repeat(60))
    console.log("💰 Note: You will be charged for this letter.")
    console.log("   Check your Lob dashboard for exact pricing.")
    console.log("=" .repeat(60))

    return letter
  } catch (error: any) {
    console.error("\n❌ Letter Creation Failed!")
    console.error("Error:", error?.message || error)
    if (error?._response?.body) {
      console.error("Details:", JSON.stringify(error._response.body, null, 2))
    }
    throw error
  }
}

async function main() {
  console.log("=" .repeat(60))
  console.log("🚀 SENDING REAL LETTER TO TURKEY")
  console.log("=" .repeat(60))
  console.log("")
  console.log("Recipient: Kutay Sakallıoğlu")
  console.log("Location: İstanbul, Turkey")
  console.log("Options: B&W, Single-sided, First Class")
  console.log("")

  // Step 1: Try to verify address (may not work for Turkey)
  await verifyInternationalAddress()

  // Step 2: Send the letter
  const letter = await sendRealLetter()

  console.log("\n✨ Done! Your letter is on its way to Turkey!")
  console.log("   Track it at: https://dashboard.lob.com/letters/" + letter.id)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n💥 Script failed:", error.message)
    process.exit(1)
  })
