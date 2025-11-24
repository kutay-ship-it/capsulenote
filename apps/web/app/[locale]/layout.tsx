import type { ReactNode } from "react"

import { routing, type Locale } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default function LocaleLayout({
  children,
}: {
  children: ReactNode
  params: { locale: Locale }
}) {
  return children
}
