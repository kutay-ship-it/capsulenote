import type { ReactNode } from "react"
import { Mail, PenLine } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { EmailLockGuard } from "@/components/auth/email-lock-guard"
import { Button } from "@/components/ui/button"
import { SettingsDropdown } from "@/components/v3/settings-dropdown"
import { Link } from "@/i18n/routing"
import type { Locale } from "@/i18n/routing"
import { getCurrentUser } from "@/server/lib/auth"

export default async function AppV3Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })
  const tLetters = await getTranslations({ locale, namespace: "letters" })

  // Get user info for the settings dropdown
  const user = await getCurrentUser()
  const userName = user?.profile?.displayName || null
  const userEmail = user?.email || null

  return (
    <EmailLockGuard>
      <div className="flex min-h-screen flex-col bg-off-white">
        {/* Header - Simplified per spec: [Logo] Your Letters [+ Write] [Settings] */}
        <header
          className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-white"
          style={{ height: "72px" }}
        >
          <div className="container flex h-full items-center justify-between">
            {/* Left: Logo + Brand */}
            <Link
              href="/journey-v3"
              className="flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
              <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                {t("nav.brand")}
              </span>
            </Link>

            {/* Center: Navigation - hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/journey-v3"
                className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70 transition-opacity"
              >
                Journey
              </Link>
              <Link
                href="/letters-v3"
                className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70 transition-opacity"
              >
                {t("nav.letters")}
              </Link>
            </nav>

            {/* Right: Write CTA + Settings Dropdown */}
            <div className="flex items-center gap-3">
              {/* Write Button - always visible */}
              <Link href="/letters-v3/new">
                <Button size="sm" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  <span className="hidden sm:inline">{tLetters("drafts.writeNew")}</span>
                </Button>
              </Link>

              {/* Settings Dropdown */}
              <SettingsDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </header>

        {/* Main Content - No container wrapper to allow full-width sections */}
        <main className="flex-1">{children}</main>
      </div>
    </EmailLockGuard>
  )
}
