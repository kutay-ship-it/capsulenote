import { routing, type Locale } from "@/i18n/routing"

function normalizePathname(pathname: string): string {
  if (!pathname) return "/"
  return pathname.startsWith("/") ? pathname : `/${pathname}`
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname)

  for (const locale of routing.locales) {
    if (normalized === `/${locale}`) return "/"
    if (normalized.startsWith(`/${locale}/`)) return normalized.slice(locale.length + 1)
  }

  return normalized
}

export function buildLocalePath(pathname: string, locale: Locale): string {
  const basePath = stripLocalePrefix(pathname)
  if (locale === routing.defaultLocale) return basePath
  return basePath === "/" ? `/${locale}` : `/${locale}${basePath}`
}

/**
 * Build locale path preserving query string and hash
 * @param pathname - The pathname without locale prefix
 * @param locale - Target locale
 * @param search - Query string (e.g., "?utm_source=google")
 * @param hash - Hash fragment (e.g., "#section")
 */
export function buildLocalePathWithQuery(
  pathname: string,
  locale: Locale,
  search?: string,
  hash?: string
): string {
  const basePath = buildLocalePath(pathname, locale)
  const queryString = search || ""
  const hashString = hash || ""
  return `${basePath}${queryString}${hashString}`
}
