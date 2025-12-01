import type { ReactNode } from "react"

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
  // Await params to satisfy Next.js 15 requirements (even if unused)
  await params
  return children
}
