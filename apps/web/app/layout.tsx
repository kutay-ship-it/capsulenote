import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { enUS, trTR } from "@clerk/localizations"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"

import { Toaster } from "@/components/ui/sonner"
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/json-ld"
import "@/styles/globals.css"
import type { Locale } from "@/i18n/routing"
import { routing } from "@/i18n/routing"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"
const defaultKeywords = ["future self", "time capsule", "letters", "journaling", "reflection"]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  const keywords = (t.raw?.("keywords") as string[]) || defaultKeywords

  const languages = Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}`]))

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: t("title.default"),
      template: t("title.template"),
    },
    description: t("description"),
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: `/${locale}`,
      siteName: t("openGraph.siteName"),
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: ["/opengraph-image"],
    },
    robots: { index: true, follow: true },
    // Note: canonical and hreflang MUST be set per-page, not globally
    // Each page should define its own alternates.canonical and alternates.languages
    // to avoid all pages canonicalizing to /{locale}
    // Icons are auto-generated from app/icon.svg and app/apple-icon.svg
    manifest: "/manifest.json",
    keywords,
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const locale = await getLocale() as Locale
  const messages = await getMessages()
  const clerkLocalization = locale === "tr" ? trTR : enUS

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <WebsiteSchema locale={locale} />
          <OrganizationSchema />
        </head>
        <body className="font-mono">
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
