"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { renderLetterPreview } from "@/server/templates/mail"

/**
 * Letter Template Sandbox
 *
 * Interactive preview of the V3 Capsule Note physical mail letter template.
 * Test with different content, dates, and settings.
 */
export default function LetterTemplateSandboxPage() {
  const [recipientName, setRecipientName] = React.useState("Future Self")
  const [letterTitle, setLetterTitle] = React.useState("Reflections from the Past")
  const [letterContent, setLetterContent] = React.useState(`<p>I hope this letter finds you well and that life has been treating you kindly.</p>

<p>As I write this, I want you to remember the dreams we had and the goals we set. Some may have changed, and that's okay - growth means evolution.</p>

<p>Remember to:</p>
<ul>
  <li>Take time for yourself</li>
  <li>Stay curious and keep learning</li>
  <li>Cherish the people around you</li>
  <li>Celebrate small victories</li>
</ul>

<p>Whatever challenges you've faced since I wrote this, know that you've made it through them. You're stronger than you think.</p>

<p>With hope and anticipation for what the future holds,</p>`)
  const [writtenDate, setWrittenDate] = React.useState(
    format(new Date(), "yyyy-MM-dd")
  )
  const [deliveryDate, setDeliveryDate] = React.useState(
    format(new Date(), "yyyy-MM-dd")
  )
  const [useMinimal, setUseMinimal] = React.useState(false)
  const [showTitle, setShowTitle] = React.useState(true)

  // Generate preview HTML
  const previewHtml = React.useMemo(() => {
    return renderLetterPreview({
      recipientName,
      letterContent,
      writtenDate: new Date(writtenDate),
      deliveryDate: new Date(deliveryDate),
      letterTitle: showTitle ? letterTitle : undefined,
      minimal: useMinimal,
    })
  }, [recipientName, letterContent, writtenDate, deliveryDate, letterTitle, showTitle, useMinimal])

  return (
    <div className="container py-12 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
          Letter Template Sandbox
        </h1>
        <p className="font-mono text-sm text-charcoal/70">
          Preview the V3 branded physical mail letter template with live content editing.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Controls Panel */}
        <div
          className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)] h-fit"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-6">
            Template Settings
          </h2>

          <div className="space-y-5">
            {/* Recipient Name */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full h-[42px] px-3 border-2 border-charcoal bg-white font-mono text-sm focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none"
                style={{ borderRadius: "2px" }}
                placeholder="Future Self"
              />
            </div>

            {/* Letter Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Letter Title
                </label>
                <button
                  onClick={() => setShowTitle(!showTitle)}
                  className={cn(
                    "flex h-5 w-9 items-center border-2 border-charcoal p-0.5 transition-all",
                    showTitle ? "bg-teal-primary justify-end" : "bg-charcoal/20 justify-start"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className="h-3 w-3 bg-white border border-charcoal"
                    style={{ borderRadius: "2px" }}
                  />
                </button>
              </div>
              {showTitle && (
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  className="w-full h-[42px] px-3 border-2 border-charcoal bg-white font-mono text-sm focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none"
                  style={{ borderRadius: "2px" }}
                  placeholder="Optional title..."
                />
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Written Date
                </label>
                <input
                  type="date"
                  value={writtenDate}
                  onChange={(e) => setWrittenDate(e.target.value)}
                  className="w-full h-[42px] px-3 border-2 border-charcoal bg-white font-mono text-sm focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none"
                  style={{ borderRadius: "2px" }}
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full h-[42px] px-3 border-2 border-charcoal bg-white font-mono text-sm focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none"
                  style={{ borderRadius: "2px" }}
                />
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                Letter Content (HTML)
              </label>
              <textarea
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border-2 border-charcoal bg-white font-mono text-xs focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none resize-y"
                style={{ borderRadius: "2px" }}
                placeholder="<p>Your letter content...</p>"
              />
            </div>

            {/* Template Variant */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setUseMinimal(!useMinimal)}
                className={cn(
                  "flex h-6 w-10 items-center border-2 border-charcoal p-0.5 transition-all",
                  useMinimal ? "bg-duck-yellow justify-end" : "bg-charcoal/20 justify-start"
                )}
                style={{ borderRadius: "2px" }}
              >
                <div
                  className="h-4 w-4 bg-white border border-charcoal"
                  style={{ borderRadius: "2px" }}
                />
              </button>
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                Use Minimal Template
              </span>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Live Preview
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/40">
              8.5&quot; x 11&quot; US Letter
            </span>
          </div>

          {/* Preview Container */}
          <div
            className="border-2 border-charcoal bg-charcoal/5 p-4 overflow-auto max-h-[800px]"
            style={{ borderRadius: "2px" }}
          >
            <div
              className="bg-white shadow-lg mx-auto"
              style={{
                width: "100%",
                maxWidth: "8.5in",
                aspectRatio: "8.5/11",
                overflow: "hidden",
              }}
            >
              <iframe
                srcDoc={previewHtml}
                title="Letter Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
          Implementation Notes
        </h2>

        <div className="space-y-4 font-mono text-xs text-charcoal/70">
          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Template System</h3>
            <p>
              Templates are defined in <code className="bg-charcoal/10 px-1">server/templates/mail/</code>.
              Two variants: full (with decorations) and minimal (smaller file size).
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Usage</h3>
            <pre className="bg-charcoal/5 p-3 overflow-x-auto" style={{ borderRadius: "2px" }}>
{`import { sendTemplatedLetter } from "@/server/providers/lob"

await sendTemplatedLetter({
  to: { name, line1, city, state, postalCode, country },
  letterContent: "<p>Your letter...</p>",
  writtenDate: new Date("2024-01-01"),
  letterTitle: "Optional Title",
})`}
            </pre>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Print Specifications</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Size:</strong> US Letter (8.5&quot; x 11&quot;)</li>
              <li><strong>Margins:</strong> 0.5&quot; safe area</li>
              <li><strong>Font:</strong> Courier New (monospace for print reliability)</li>
              <li><strong>Colors:</strong> B&amp;W safe design, Charcoal text</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Envelope</h3>
            <p>
              Return address configured in <code className="bg-charcoal/10 px-1">envelope-template.ts</code>.
              Standard #10 envelope with address placement at top of first page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
