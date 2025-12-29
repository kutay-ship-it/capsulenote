import type { ReactNode } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { enUS, trTR } from "@clerk/localizations"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"

import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  // Next.js 16 route props are async in the type system
  const { locale: paramLocale } = await params
  const locale =
    paramLocale && hasLocale(routing.locales, paramLocale) ? paramLocale : routing.defaultLocale
  const messages = await getMessages({ locale })
  const clerkLocalization = locale === "tr" ? trTR : enUS

  return (
    <ClerkProvider localization={clerkLocalization}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
        <Toaster />
      </NextIntlClientProvider>
    </ClerkProvider>
  )
}
