import { routing, type Locale } from "@/i18n/routing"

export async function loadMessages(locale: Locale) {
  const normalizedLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale
  return (await import(`../../messages/${normalizedLocale}`)).default
}
