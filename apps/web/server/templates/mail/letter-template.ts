/**
 * Capsule Note Physical Letter Template
 *
 * V3 Neo-Brutalist design adapted for print.
 * - Monospace typography
 * - Clean geometric design
 * - Capsule Note branding
 *
 * Template Variables:
 * - {{recipient_name}} - Name of the recipient (Future Self)
 * - {{letter_content}} - The letter body content (HTML)
 * - {{written_date}} - Date the letter was written
 * - {{delivery_date}} - Date the letter is being delivered
 * - {{letter_title}} - Title of the letter (optional)
 *
 * Print Specifications:
 * - US Letter size: 8.5" x 11"
 * - Safe margins: 0.5" all sides
 * - Printable area: 7.5" x 10"
 */

export interface LetterTemplateVariables {
  recipientName: string
  letterContent: string
  writtenDate: string
  deliveryDate?: string
  letterTitle?: string
}

/**
 * V3 Neo-Brutalist Letter Template (3-Page Format for Double-Sided Printing)
 *
 * Page 1: Cover page with branding (recipient address added by Lob at top)
 * Page 2: Intentionally blank (so letter content starts on separate sheet when double-sided)
 * Page 3: Actual letter content
 *
 * This ensures letter content is on a separate physical sheet from the envelope/cover.
 *
 * Design:
 * - Monospace fonts (Courier New for print compatibility)
 * - Charcoal (#383838) primary text
 * - B&W safe design (prints well without color)
 * - Clean borders and geometric shapes
 */
export const LETTER_TEMPLATE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Capsule Note Letter</title>
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Page setup - US Letter 8.5" x 11" with 0.5" margins */
    @page {
      size: letter;
      margin: 0.5in;
    }

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

    /* ================================
       PAGE 1: COVER PAGE
       ================================ */
    .cover-page {
      min-height: 9in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }

    .cover-brand {
      margin-top: 2in; /* Space for Lob's address block at top */
    }

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

    /* ================================
       PAGE 2: LETTER CONTENT
       ================================ */
    .letter-page {
      page-break-before: always;
    }

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

    .letter-date-label {
      font-size: 8pt;
      color: #666666;
    }

    /* Title section */
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

    /* Greeting */
    .greeting {
      margin-bottom: 20px;
      font-size: 12pt;
    }

    /* Letter content */
    .content {
      margin-bottom: 32px;
      text-align: justify;
    }

    .content p {
      margin-bottom: 16px;
    }

    .content p:last-child {
      margin-bottom: 0;
    }

    .content ul, .content ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    .content li {
      margin-bottom: 8px;
    }

    /* Signature section */
    .signature {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px dashed #383838;
    }

    .signature-text {
      font-style: italic;
      margin-bottom: 8px;
    }

    .signature-name {
      font-weight: bold;
      font-size: 11pt;
    }

    .signature-date {
      font-size: 9pt;
      color: #555555;
      margin-top: 4px;
    }

    /* Letter footer */
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
      background: #383838;
      margin-right: 4px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <!-- ================================
       PAGE 1: COVER PAGE
       ================================ -->
  <div class="cover-page">
    <!-- Lob adds recipient address at top of this page -->

    <div class="cover-brand">
      <div class="cover-logo">C</div>
      <div class="cover-title">Capsule Note</div>
      <div class="cover-tagline">A Letter from Past</div>
    </div>

    <div class="cover-divider"></div>

    <div class="cover-message">This message was sent to you from</div>
    <div class="cover-recipient">{{recipient_name}}</div>
    <div class="cover-date">Sent on {{written_date}}</div>

    <div class="cover-thanks">Thank you for sharing such a special moment with us.</div>

    <div class="cover-footer">
      <span class="footer-icon"></span>
      capsulenote.com
    </div>
  </div>

  <!-- ================================
       PAGE 2: BLANK PAGE
       (Ensures letter content starts on separate sheet for double-sided)
       ================================ -->
  <div class="blank-page" style="page-break-after: always; min-height: 9in;">
    <!-- Intentionally blank for double-sided printing -->
  </div>

  <!-- ================================
       PAGE 3: LETTER CONTENT
       ================================ -->
  <div class="letter-page">
    <header class="letter-header">
      <div class="letter-brand">{{#if letter_title}}{{letter_title}}{{else}}Capsule Note{{/if}}</div>
      <div class="letter-date">
        <div class="letter-date-label">Written</div>
        <div>{{written_date}}</div>
      </div>
    </header>

    <div class="content">
      {{letter_content}}
    </div>

    <footer class="letter-footer">
      <span class="footer-icon"></span>
      Capsule Note &mdash; capsulenote.com
    </footer>
  </div>
</body>
</html>
`

/**
 * Minimal letter template for testing/preview (3-Page Format for Double-Sided)
 * Smaller file size, fewer decorative elements
 * B&W safe design
 *
 * Page 1: Simple cover page
 * Page 2: Blank (for double-sided printing)
 * Page 3: Letter content
 */
export const LETTER_TEMPLATE_MINIMAL_HTML = `
<!DOCTYPE html>
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

    /* PAGE 1: COVER */
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

    /* PAGE 2: LETTER */
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
  <!-- PAGE 1: COVER -->
  <div class="cover-page">
    <div class="cover-brand">
      <div class="cover-logo">C</div>
      <div class="cover-title">Capsule Note</div>
      <div class="cover-tagline">A Letter from Past</div>
    </div>
    <div class="cover-divider"></div>
    <div class="cover-message">This message was sent to you from</div>
    <div class="cover-recipient">{{recipient_name}}</div>
    <div class="cover-date">Sent on {{written_date}}</div>
    <div class="cover-thanks">Thank you for sharing such a special moment with us.</div>
    <div class="cover-footer">capsulenote.com</div>
  </div>

  <!-- PAGE 2: BLANK (for double-sided) -->
  <div style="page-break-after: always; min-height: 9in;"></div>

  <!-- PAGE 3: LETTER -->
  <div class="letter-page">
    <header class="header">
      <div class="brand">{{#if letter_title}}{{letter_title}}{{else}}Capsule Note{{/if}}</div>
      <div class="date-info">Written {{written_date}}</div>
    </header>
    <div class="content">{{letter_content}}</div>
    <footer class="footer"><span class="footer-icon"></span>Capsule Note &mdash; capsulenote.com</footer>
  </div>
</body>
</html>
`
