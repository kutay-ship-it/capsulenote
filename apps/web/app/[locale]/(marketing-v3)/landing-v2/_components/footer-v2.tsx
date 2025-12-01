"use client"

import { Mail, Twitter, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { FooterLanguageButton } from "@/components/locale"

interface FooterLink {
  label: string
  href: string
}

export function FooterV2() {
  const t = useTranslations("marketing.footerV2")
  const productLinks = t.raw("productLinks") as FooterLink[]
  const legalLinks = t.raw("legalLinks") as FooterLink[]
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t-2 border-charcoal bg-cream">
      {/* Main Footer */}
      <div className="container px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                Capsule<span className="text-duck-blue">Note</span>
              </span>
            </div>
            <p className="mb-6 max-w-sm font-mono text-sm leading-relaxed text-charcoal/70">
              {t("tagline")}
            </p>

            {/* Social Links - Removed GitHub (B2C product) */}
            <div className="flex gap-3">
              <a
                href="mailto:hello@capsulenote.com"
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                style={{ borderRadius: "2px" }}
                aria-label="Email us"
              >
                <Mail className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="https://twitter.com/capsulenote"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white transition-all duration-fast hover:bg-charcoal hover:text-white"
                style={{ borderRadius: "2px" }}
                aria-label="Follow on Twitter"
              >
                <Twitter className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              {t("productTitle")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as any}
                    className="font-mono text-sm text-charcoal/70 transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              {t("legalTitle")}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href as any}
                    className="font-mono text-sm text-charcoal/70 transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-charcoal/10 bg-off-white py-6">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="font-mono text-xs text-charcoal/60">
              {t("copyright", { year: currentYear })}
            </p>
            <div className="flex items-center gap-4">
              <FooterLanguageButton />
              <p className="flex items-center gap-1.5 font-mono text-xs text-charcoal/60">
                {t.rich("madeWith", {
                  heart: () => <Heart className="h-3 w-3 text-coral fill-coral" />,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
