import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { WebsiteSchema, OrganizationSchema } from "@/components/seo/json-ld"
import { GoogleAnalytics, PostHogProvider } from "@/components/analytics"
import "@/styles/globals.css"
import { type Locale } from "@/i18n/routing"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"
const defaultKeywords = ["future self", "time capsule", "letters", "journaling", "reflection"]

export async function generateMetadata(): Promise<Metadata> {
  // Use getLocale() to get locale from next-intl middleware context
  // This works correctly even though the root layout doesn't have [locale] segment
  const locale = (await getLocale()) as Locale
  const t = await getTranslations({ locale, namespace: "metadata" })
  const keywords = (t.raw?.("keywords") as string[]) || defaultKeywords

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
      url: locale === "en" ? "/" : `/${locale}`,
      siteName: t("openGraph.siteName"),
      type: "website",
      images: [`/${locale}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: [`/${locale}/opengraph-image`],
    },
    robots: { index: true, follow: true },
    // Note: canonical and hreflang MUST be set per-page, not globally
    // Each page should define its own alternates.canonical and alternates.languages
    // to avoid all pages canonicalizing to /{locale}
    // Icons are auto-generated from app/icon.svg and app/apple-icon.svg
    manifest: `/${locale}/manifest.webmanifest`,
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
  // Use getLocale() to get locale from next-intl middleware context
  // This is the correct way to get locale in root layout (above [locale] segment)
  const locale = (await getLocale()) as Locale

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <WebsiteSchema locale={locale} />
        <OrganizationSchema />
        <GoogleAnalytics />
      </head>
      <body className="font-mono">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
