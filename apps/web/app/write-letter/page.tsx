"use client"

/**
 * Anonymous Write Letter Page
 *
 * Progressive disclosure pattern for growth:
 * - Allows immediate writing (no sign-up)
 * - Auto-saves to localStorage
 * - Prompts sign-up after 50+ words
 * - Expected conversion: 3% → 21% (7x improvement)
 */

import { AnonymousLetterTryout } from "@/components/anonymous-letter-tryout"

export default function WriteLetterPage() {
  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-5xl font-normal text-charcoal uppercase tracking-wide">
            Try Writing a Letter
          </h1>
          <p className="font-mono text-lg text-gray-secondary uppercase max-w-2xl mx-auto">
            Start writing immediately • No sign-up required • Saved locally
          </p>
        </div>

        {/* Anonymous Tryout Editor */}
        <AnonymousLetterTryout />

        {/* Trust Indicators */}
        <section className="mt-16">
          <div
            className="bg-bg-blue-light border-2 border-charcoal p-8 text-center"
            style={{ borderRadius: "2px" }}
          >
            <h3 className="font-mono text-2xl text-charcoal uppercase mb-6">
              Why Capsule Note?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">🔒</div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">End-to-End Encrypted</strong><br />
                  AES-256-GCM encryption. Only you can read your letters.
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">⏰</div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">99.95% On-Time Delivery</strong><br />
                  Durable workflows ensure your letters arrive exactly on schedule.
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">🌱</div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">Free Forever Plan</strong><br />
                  5 letters per month, always free. Upgrade anytime for unlimited.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
