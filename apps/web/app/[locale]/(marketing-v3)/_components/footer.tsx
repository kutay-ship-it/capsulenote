"use client"

import { Mail, Github, Twitter } from "lucide-react"

import { Link } from "@/i18n/routing"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    product: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "#" },
    ],
  }

  return (
    <footer className="border-t-2 border-charcoal bg-cream">
      {/* Main Footer */}
      <div className="container px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                Capsule<span className="text-duck-blue">Note</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs font-mono text-sm leading-relaxed text-charcoal/70">
              Write letters to your future self. Encrypted, scheduled, delivered when you need them most.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Mail, label: "Email", href: "mailto:hello@capsulenote.com" },
                { icon: Twitter, label: "Twitter", href: "#" },
                { icon: Github, label: "GitHub", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                  style={{ borderRadius: "2px" }}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(links).map(([category, categoryLinks]) => (
            <div key={category}>
              <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                {category}
              </h4>
              <ul className="space-y-3">
                {categoryLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as any}
                      className="font-mono text-sm text-charcoal/70 transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-charcoal/10 bg-off-white py-6">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="font-mono text-xs text-charcoal/60">
              {currentYear} Capsule Note. All rights reserved.
            </p>
            <p className="font-mono text-xs text-charcoal/60">
              Made with care for future-you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
