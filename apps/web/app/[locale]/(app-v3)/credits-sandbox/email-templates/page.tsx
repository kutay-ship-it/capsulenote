"use client"

import { useState } from "react"
import { LetterCreatedEmails } from "./components/letter-created-emails"
import { DeliveryScheduledEmails } from "./components/delivery-scheduled-emails"
import { LetterDeliveryEmails } from "./components/letter-delivery-emails"
import { PaymentConfirmationEmails } from "./components/payment-confirmation-emails"
import { PaymentReceiptEmails } from "./components/payment-receipt-emails"
import { PaymentFailedEmails } from "./components/payment-failed-emails"
import { TrialEndingEmails } from "./components/trial-ending-emails"
import { SubscriptionCanceledEmails } from "./components/subscription-canceled-emails"
import { WelcomeEmails } from "./components/welcome-emails"

const EMAIL_TYPES = [
  { id: "letter-created", label: "Letter Created", component: LetterCreatedEmails },
  { id: "delivery-scheduled", label: "Delivery Scheduled", component: DeliveryScheduledEmails },
  { id: "letter-delivery", label: "Letter Delivery", component: LetterDeliveryEmails },
  { id: "payment-confirmation", label: "Payment Confirmation", component: PaymentConfirmationEmails },
  { id: "payment-receipt", label: "Payment Receipt", component: PaymentReceiptEmails },
  { id: "payment-failed", label: "Payment Failed", component: PaymentFailedEmails },
  { id: "trial-ending", label: "Trial Ending", component: TrialEndingEmails },
  { id: "subscription-canceled", label: "Subscription Canceled", component: SubscriptionCanceledEmails },
  { id: "welcome", label: "Welcome (New)", component: WelcomeEmails },
] as const

export default function EmailTemplatesPage() {
  const [selectedType, setSelectedType] = useState<string>("letter-created")
  const [selectedVariation, setSelectedVariation] = useState<"A" | "B" | "C">("A")

  const CurrentEmailComponent = EMAIL_TYPES.find(t => t.id === selectedType)?.component

  return (
    <div className="min-h-screen bg-cream p-8">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 bg-duck-yellow px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <span>📧</span>
          <span>Email Template Sandbox</span>
        </div>
        <h1 className="mt-4 font-mono text-4xl font-normal text-charcoal">
          V3 Email Templates
        </h1>
        <p className="mt-2 font-mono text-sm text-charcoal/60">
          Neo-brutalist email designs · 3 variations per email type · Click to compare
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Email Type Selector */}
        <div
          className="border-2 border-charcoal bg-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Email Type
          </div>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  border-2 border-charcoal px-3 py-2 font-mono text-xs uppercase tracking-wide
                  transition-all duration-150
                  ${selectedType === type.id
                    ? "bg-duck-blue text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal hover:bg-off-white"
                  }
                `}
                style={{ borderRadius: "2px" }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variation Selector */}
        <div
          className="border-2 border-charcoal bg-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Variation
          </div>
          <div className="flex gap-2">
            {(["A", "B", "C"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVariation(v)}
                className={`
                  h-12 w-12 border-2 border-charcoal font-mono text-lg font-bold
                  transition-all duration-150
                  ${selectedVariation === v
                    ? "bg-duck-yellow text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal hover:bg-off-white"
                  }
                `}
                style={{ borderRadius: "2px" }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          className="border-2 border-charcoal bg-off-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            Variation Styles
          </div>
          <div className="space-y-1 font-mono text-xs text-charcoal/80">
            <div><strong>A:</strong> Classic Brutalist — Bold shadows, maximum contrast</div>
            <div><strong>B:</strong> Soft Brutalist — Cream tones, lighter touch</div>
            <div><strong>C:</strong> Playful Status — Color-led, floating badges</div>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-charcoal/10 pb-4">
          <div className="font-mono text-sm text-charcoal/60">
            Preview: <strong className="text-charcoal">{EMAIL_TYPES.find(t => t.id === selectedType)?.label}</strong> — Variation {selectedVariation}
          </div>
          <div
            className="bg-teal-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white border-2 border-charcoal"
            style={{ borderRadius: "2px" }}
          >
            Email Width: 600px
          </div>
        </div>

        {/* Email Container - simulates email client */}
        <div className="mx-auto max-w-[640px] bg-[#f5f5f5] p-5">
          {CurrentEmailComponent && (
            <CurrentEmailComponent variation={selectedVariation} />
          )}
        </div>
      </div>

      {/* All Variations Side by Side */}
      <div className="mt-8">
        <h2 className="mb-4 font-mono text-xl font-normal text-charcoal">
          All Variations Comparison
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {(["A", "B", "C"] as const).map((v) => (
            <div
              key={v}
              className={`
                border-2 border-charcoal bg-white p-4
                ${selectedVariation === v ? "shadow-[4px_4px_0_theme(colors.charcoal)]" : ""}
              `}
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-charcoal">
                  Variation {v}
                </span>
                <button
                  onClick={() => setSelectedVariation(v)}
                  className="bg-duck-blue px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal hover:shadow-[2px_2px_0_theme(colors.charcoal)] transition-all"
                  style={{ borderRadius: "2px" }}
                >
                  Select
                </button>
              </div>
              <div className="scale-[0.4] origin-top-left h-[400px] overflow-hidden">
                <div className="w-[640px] bg-[#f5f5f5] p-5">
                  {CurrentEmailComponent && (
                    <CurrentEmailComponent variation={v} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
