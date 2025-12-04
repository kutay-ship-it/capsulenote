/**
 * Test Lob Letter Template (Standalone)
 *
 * Sends a test letter using the new 2-page V3 template to Lob
 * and returns the PDF preview URL.
 *
 * Usage:
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-letter-template.ts
 *   pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-letter-template.ts --minimal
 */

import Lob from "lob"

// Template rendering (inline to avoid path alias issues)
function renderTemplate(options: {
  recipientName: string
  letterContent: string
  writtenDate: Date
  deliveryDate: Date
  letterTitle?: string
  minimal?: boolean
}): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const writtenDateStr = formatDate(options.writtenDate)

  if (options.minimal) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12pt;
      line-height: 1.6;
      color: #383838;
      max-width: 7.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: #ffffff;
    }
    .cover-page {
      min-height: 9in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-brand { margin-top: 2in; }
    .cover-logo {
      width: 60px;
      height: 60px;
      border: 3px solid #383838;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24pt;
      font-weight: bold;
    }
    .cover-title {
      font-size: 20pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }
    .cover-tagline {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555555;
      margin-bottom: 32px;
    }
    .cover-divider {
      width: 80px;
      height: 3px;
      background: #383838;
      margin: 0 auto 32px;
    }
    .cover-message {
      font-size: 11pt;
      font-style: italic;
      margin-bottom: 8px;
    }
    .cover-recipient {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 32px;
    }
    .cover-date {
      font-size: 9pt;
      text-transform: uppercase;
      color: #555555;
      margin-bottom: 24px;
    }
    .cover-thanks {
      font-size: 9pt;
      font-style: italic;
      color: #555555;
      margin-bottom: 32px;
    }
    .cover-footer {
      margin-top: auto;
      padding-top: 24px;
      font-size: 7pt;
      text-transform: uppercase;
      color: #666666;
    }
    .letter-page { page-break-before: always; }
    .header {
      border: 3px solid #383838;
      border-bottom: 5px solid #383838;
      padding: 12px 16px;
      margin-bottom: 20px;
      background: #ffffff;
    }
    .brand { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .date-info { font-size: 8pt; text-transform: uppercase; color: #666666; }
    .title-section {
      border: 2px solid #383838;
      padding: 10px 16px;
      margin-bottom: 20px;
      background: #f5f5f5;
    }
    .letter-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.02em; }
    .greeting { margin-bottom: 16px; }
    .content { margin-bottom: 24px; text-align: justify; }
    .content p { margin-bottom: 12px; }
    .signature { border-top: 2px dashed #383838; padding-top: 12px; margin-top: 24px; }
    .footer { margin-top: 32px; font-size: 8pt; text-transform: uppercase; color: #666666; text-align: center; }
    .footer-icon { display: inline-block; width: 6px; height: 6px; background: #666666; margin-right: 4px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-brand">
      <div class="cover-logo">C</div>
      <div class="cover-title">Capsule Note</div>
      <div class="cover-tagline">A Letter from Past</div>
    </div>
    <div class="cover-divider"></div>
    <div class="cover-message">This message was sent to you from</div>
    <div class="cover-recipient">${options.recipientName}</div>
    <div class="cover-date">Sent on ${writtenDateStr}</div>
    <div class="cover-thanks">Thank you for sharing such a special moment with us.</div>
    <div class="cover-footer">capsulenote.com</div>
  </div>
  <div class="letter-page">
    <header class="header">
      <div class="brand">${options.letterTitle || "Capsule Note"}</div>
      <div class="date-info">Written ${writtenDateStr}</div>
    </header>
    <div class="content">${options.letterContent}</div>
    <footer class="footer"><span class="footer-icon"></span>Capsule Note &mdash; capsulenote.com</footer>
  </div>
</body>
</html>`
  }

  // Full template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capsule Note Letter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 0.5in; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12pt;
      line-height: 1.6;
      color: #383838;
      max-width: 7.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: #ffffff;
    }
    .cover-page {
      min-height: 9in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-brand { margin-top: 2in; }
    .cover-logo {
      width: 80px;
      height: 80px;
      border: 4px solid #383838;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32pt;
      font-weight: bold;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    .cover-tagline {
      font-size: 11pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #555555;
      margin-bottom: 48px;
    }
    .cover-divider {
      width: 120px;
      height: 4px;
      background: #383838;
      margin: 0 auto 48px;
    }
    .cover-message {
      font-size: 14pt;
      font-style: italic;
      margin-bottom: 16px;
    }
    .cover-recipient {
      font-size: 18pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }
    .cover-date {
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555555;
      margin-bottom: 32px;
    }
    .cover-thanks {
      font-size: 10pt;
      font-style: italic;
      color: #555555;
      margin-bottom: 48px;
    }
    .cover-footer {
      margin-top: auto;
      padding-top: 32px;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666666;
    }
    .letter-page { page-break-before: always; }
    .letter-header {
      border: 3px solid #383838;
      border-bottom: 5px solid #383838;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .letter-brand {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .letter-date {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: right;
    }
    .letter-date-label { font-size: 8pt; color: #666666; }
    .title-section {
      border: 2px solid #383838;
      padding: 12px 20px;
      margin-bottom: 24px;
      background: #f5f5f5;
    }
    .letter-title {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .greeting { margin-bottom: 20px; font-size: 12pt; }
    .content { margin-bottom: 32px; text-align: justify; }
    .content p { margin-bottom: 16px; }
    .content p:last-child { margin-bottom: 0; }
    .content ul, .content ol { margin-bottom: 16px; padding-left: 24px; }
    .content li { margin-bottom: 8px; }
    .signature {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px dashed #383838;
    }
    .signature-text { font-style: italic; margin-bottom: 8px; }
    .signature-name { font-weight: bold; font-size: 11pt; }
    .signature-date { font-size: 9pt; color: #555555; margin-top: 4px; }
    .letter-footer {
      margin-top: 48px;
      padding-top: 12px;
      border-top: 2px solid #383838;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666666;
      text-align: center;
    }
    .footer-icon {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #666666;
      margin-right: 4px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-brand">
      <div class="cover-logo">C</div>
      <div class="cover-title">Capsule Note</div>
      <div class="cover-tagline">A Letter from Past</div>
    </div>
    <div class="cover-divider"></div>
    <div class="cover-message">This message was sent to you from</div>
    <div class="cover-recipient">${options.recipientName}</div>
    <div class="cover-date">Sent on ${writtenDateStr}</div>
    <div class="cover-thanks">Thank you for sharing such a special moment with us.</div>
    <div class="cover-footer"><span class="footer-icon"></span>capsulenote.com</div>
  </div>
  <div class="letter-page">
    <header class="letter-header">
      <div class="letter-brand">${options.letterTitle || "Capsule Note"}</div>
      <div class="letter-date">
        <div class="letter-date-label">Written</div>
        <div>${writtenDateStr}</div>
      </div>
    </header>
    <div class="content">${options.letterContent}</div>
    <footer class="letter-footer"><span class="footer-icon"></span>Capsule Note &mdash; capsulenote.com</footer>
  </div>
</body>
</html>`
}

async function main() {
  const useMinimal = process.argv.includes("--minimal")

  console.log("=".repeat(60))
  console.log("Lob Letter Template Test")
  console.log("=".repeat(60))
  console.log("")

  const lobApiKey = process.env.LOB_API_KEY
  if (!lobApiKey) {
    console.error("ERROR: LOB_API_KEY not found in environment")
    console.error("Make sure it's set in apps/web/.env.local")
    process.exit(1)
  }

  const isTestKey = lobApiKey.startsWith("test_")
  console.log(`API Key: ${isTestKey ? "Test (no real mail)" : "LIVE (real mail!)"}`)
  console.log(`Template: ${useMinimal ? "Minimal (2-page)" : "Full (2-page)"}`)
  console.log("")

  const lob = new Lob(lobApiKey)

  // Test address
  const testAddress = {
    name: "Future Self",
    address_line1: "185 Berry St",
    address_line2: "Suite 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  }

  // Sample letter content
  const letterContent = `<p>This is a test of the new 2-page Capsule Note letter template.</p>

<p>The first page is now a branded cover page with:</p>
<ul>
  <li>The Capsule Note logo</li>
  <li>A personalized greeting for the recipient</li>
  <li>The delivery date</li>
</ul>

<p>This second page contains the actual letter content, formatted in our neo-brutalist style with monospace typography.</p>

<p>Key features of this template:</p>
<ul>
  <li>Black & white safe design (prints well without color)</li>
  <li>US Letter size (8.5" x 11")</li>
  <li>Clean, professional appearance</li>
  <li>CSS page breaks for reliable 2-page layout</li>
</ul>

<p>If you're reading this, the template is working correctly!</p>`

  // Render HTML
  const html = renderTemplate({
    recipientName: "Future Self",
    letterContent,
    writtenDate: new Date(),
    deliveryDate: new Date(),
    letterTitle: "Template Test Letter",
    minimal: useMinimal,
  })

  console.log("Sending test letter to Lob...")
  console.log("")

  try {
    const letter = await lob.letters.create({
      description: `Template Test - ${useMinimal ? "Minimal" : "Full"} - ${new Date().toISOString()}`,
      to: testAddress,
      from: {
        name: "Capsule Note",
        address_line1: "185 Berry Street",
        address_line2: "Suite 6100",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      file: html,
      color: false,
      double_sided: false,
      address_placement: "top_first_page",
      mail_type: "usps_first_class",
      use_type: "operational",
    } as Parameters<typeof lob.letters.create>[0])

    console.log("SUCCESS! Letter created.")
    console.log("")
    console.log("Letter Details:")
    console.log("-".repeat(40))
    console.log(`  ID: ${letter.id}`)
    console.log(`  Carrier: ${letter.carrier}`)
    console.log(`  Expected Delivery: ${letter.expected_delivery_date}`)
    console.log("")
    console.log("PDF Preview URL:")
    console.log("-".repeat(40))
    console.log(`  ${letter.url}`)
    console.log("")

    const thumbnails = letter.thumbnails as unknown as { small: string; medium: string; large: string }[] | undefined
    if (thumbnails && thumbnails.length > 0) {
      console.log("Thumbnails:")
      console.log("-".repeat(40))
      thumbnails.forEach((thumb, i) => {
        console.log(`  Page ${i + 1}:`)
        console.log(`    Large: ${thumb.large}`)
      })
      console.log("")
    }

    console.log("=".repeat(60))
    console.log("Open the PDF URL above to preview the 2-page letter!")
    console.log(`${isTestKey ? "(Test mode - no actual mail sent)" : "WARNING: Real mail will be sent!"}`)
    console.log("=".repeat(60))
  } catch (error: unknown) {
    console.error("ERROR:", error)
    process.exit(1)
  }
}

main()
