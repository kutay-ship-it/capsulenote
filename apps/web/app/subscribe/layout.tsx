/**
 * Subscribe Page Layout
 *
 * Minimal layout for anonymous checkout flow:
 * - No header/footer as per requirements
 * - Just logo at top
 * - Clean background
 */

import * as React from "react"
import Link from "next/link"

interface SubscribeLayoutProps {
  children: React.ReactNode
}

export default function SubscribeLayout({ children }: SubscribeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Logo Header */}
      <header className="border-b-2 border-charcoal bg-off-white py-6">
        <div className="container px-4 sm:px-6">
          <Link href="/" className="inline-block">
            <h1 className="font-mono text-2xl font-normal uppercase tracking-wider text-charcoal hover:opacity-70 transition-opacity">
              Capsule Note
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="border-t-2 border-charcoal bg-off-white py-4">
        <div className="container px-4 flex justify-center gap-6 font-mono text-xs text-gray-secondary sm:px-6">
          <Link
            href="/privacy"
            className="uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            Terms
          </Link>
          <a
            href="mailto:support@capsulenote.com"
            className="uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  )
}
