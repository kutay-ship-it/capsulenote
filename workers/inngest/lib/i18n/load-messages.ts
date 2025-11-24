type Locale = "en" | "tr"

const locales: Locale[] = ["en", "tr"]
const defaultLocale: Locale = "en"

export async function loadMessages(locale: Locale = defaultLocale) {
  const normalized = locales.includes(locale) ? locale : defaultLocale
  return (await import(`../../../../apps/web/messages/${normalized}/index`)).default
}

export { locales, defaultLocale }
export type { Locale }
