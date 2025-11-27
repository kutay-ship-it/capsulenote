import type { ReactNode } from "react"
import { UserButton } from "@clerk/nextjs"
import { FileText, Home, Mail, Settings } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { EmailLockGuard } from "@/components/auth/email-lock-guard"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PushNotificationProvider } from "@/components/providers/push-notification-provider"
import { Link } from "@/i18n/routing"
import type { Locale } from "@/i18n/routing"

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "app" })

  return (
    <EmailLockGuard>
      <div className="flex min-h-screen flex-col">
        {/* Navigation - MotherDuck brutalist style */}
        <header
          className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-off-white/70 backdrop-blur-md"
          style={{ height: "90px" }}
        >
          <div className="container flex h-full items-center">
            <div className="mr-8 flex">
              <Link href="/dashboard" className="mr-8 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
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
              {/* Desktop Navigation - Hidden on mobile */}
              <nav className="hidden md:flex items-center space-x-8 font-mono text-base font-normal uppercase tracking-wide">
                <Link href="/dashboard" className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70">
                  <Home className="h-5 w-5" />
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/letters"
                  className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70"
                >
                  <FileText className="h-5 w-5" />
                  {t("nav.letters")}
                </Link>
                <Link href="/settings" className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70">
                  <Settings className="h-5 w-5" />
                  {t("nav.settings")}
                </Link>
              </nav>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <LanguageSwitcher className="hidden sm:flex" />
              <UserButton afterSignOutUrl="/" />
              {/* Mobile Navigation */}
              <MobileNavigation
                translations={{
                  brand: t("nav.brand"),
                  dashboard: t("nav.dashboard"),
                  letters: t("nav.letters"),
                  settings: t("nav.settings"),
                  openMenu: t("nav.openMenu"),
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container py-12">
            <PushNotificationProvider>{children}</PushNotificationProvider>
          </div>
        </main>
      </div>
    </EmailLockGuard>
  )
}
