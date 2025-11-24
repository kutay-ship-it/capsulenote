import { getRequestConfig } from "next-intl/server"

import { routing, type Locale } from "./routing"

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale

  return {
    locale: normalizedLocale,
    messages: (await import(`../messages/${normalizedLocale}`)).default,
  }
})
