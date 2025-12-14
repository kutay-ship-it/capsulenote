/**
 * Global 404 Not Found Page
 *
 * Catches all unmatched routes and displays a branded error page.
 * Server Component for SEO optimization.
 *
 * Design: Neo-brutalist style matching error.tsx pattern
 * - border-2 border-charcoal
 * - duck-yellow accent
 * - shadow-lg offset
 */

import type { Metadata } from "next"
import Link from "next/link"
import { Home, BookOpen, FileText, Mail, Lightbulb, PenLine } from "lucide-react"

export const metadata: Metadata = {
  title: "Page Not Found | Capsule Note",
  description:
    "The page you're looking for doesn't exist or has been moved. Find your way back to writing letters to your future self.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div
        className="w-full max-w-2xl border-2 border-charcoal bg-white p-8 shadow-lg"
        style={{
          borderRadius: "2px",
          boxShadow: "rgb(56, 56, 56) -6px 6px 0px 0px",
        }}
      >
        {/* 404 Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-4xl font-bold text-charcoal">404</span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mb-8 text-center font-mono text-sm text-gray-secondary md:text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </p>

        {/* Primary CTA */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-charcoal transition-all hover:bg-duck-blue hover:shadow-none"
            style={{
              borderRadius: "2px",
              boxShadow: "rgb(56, 56, 56) -4px 4px 0px 0px",
            }}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>

        {/* Helpful Links Section */}
        <div
          className="border-2 border-charcoal bg-off-white p-6"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="mb-4 text-center font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
            Helpful Links
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <HelpfulLink href="/templates" icon={FileText} label="Templates" />
            <HelpfulLink href="/guides" icon={BookOpen} label="Guides" />
            <HelpfulLink href="/prompts" icon={Lightbulb} label="Prompts" />
            <HelpfulLink href="/blog" icon={PenLine} label="Blog" />
            <HelpfulLink href="/write-letter" icon={Mail} label="Write Letter" />
            <HelpfulLink href="/contact" icon={Mail} label="Contact" />
          </div>
        </div>

        {/* Search Suggestion */}
        <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
          Looking for something specific?{" "}
          <Link href="/guides" className="font-bold text-charcoal underline hover:text-duck-blue">
            Browse our guides
          </Link>{" "}
          or{" "}
          <Link href="/templates" className="font-bold text-charcoal underline hover:text-duck-blue">
            explore templates
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function HelpfulLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Home
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 border-2 border-charcoal bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-charcoal transition-all hover:bg-duck-yellow"
      style={{ borderRadius: "2px" }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Link>
  )
}
