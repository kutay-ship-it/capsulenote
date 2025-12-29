# Next.js 15 App Router i18n SEO Best Practices

> Comprehensive research on internationalization patterns that avoid Google indexing issues.

**Research Date**: 2025-12-29
**Target**: Next.js 15+ with App Router + next-intl
**Focus**: SEO-friendly multilingual implementation

---

## Executive Summary

### Key Findings

1. **Disable automatic locale detection** in middleware to prevent redirect loops that block crawlers
2. **Use separate URLs** for each language version with proper hreflang annotations
3. **Include x-default hreflang** pointing to the default language version or a language selector
4. **Self-referencing hreflang tags** are mandatory - each page must include itself in alternates
5. **Static generation** (`generateStaticParams`) improves SEO significantly over dynamic rendering
6. **Never redirect Googlebot** based on Accept-Language headers or user-agent detection

### Critical Issues to Avoid

- Redirect chains/loops on the root "/" path
- User-agent based content differentiation (cloaking)
- Missing or incomplete hreflang tag sets
- Cookie-based locale detection for crawlers
- Inconsistent canonical URLs across locales

---

## Google's Official Requirements for Multilingual Sites

### Core Requirements (from Google Search Central)

1. **Separate URLs for Each Language**
   - Google recommends using different URLs for each language version
   - Do NOT use cookies or browser settings to adjust content language
   - URLs are shareable, bookmarkable, and crawlable independently

2. **Bidirectional hreflang Linking**
   - Each language version MUST list itself AND all other language versions
   - If page X links to page Y, page Y MUST link back to page X
   - Missing bidirectional links cause hreflang to be ignored

3. **Self-Referencing Tags**
   - Every page MUST include a hreflang tag referencing itself
   - Without self-reference, relationships are incomplete

4. **Fully-Qualified URLs**
   - All alternate URLs must be absolute, including the protocol (https://)
   - Alternate URLs do NOT need to be on the same domain

### x-default Implementation

```html
<!-- x-default points to the fallback page for unmatched languages -->
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="tr" href="https://example.com/tr" />
```

**When to use x-default:**
- Language selector pages
- Auto-redirecting homepages
- Default content version for unmatched languages

**Best Practice:** Point x-default to your default locale (e.g., English) or a language selector page.

### Google's Locale-Adaptive Pages Warning

From [Google Search Central](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages):

> "Googlebot's default IP addresses appear USA-based, potentially missing content served to other regions. The crawler does not set Accept-Language headers in requests."

**Key Recommendations:**
- Do NOT rely on Accept-Language detection for crawlers
- Provide consistent content based on URL path, not headers
- All locale versions should be accessible without redirects

---

## Next.js 15 App Router i18n with next-intl

### Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx       # Locale-specific layout with generateStaticParams
│   │   ├── page.tsx         # Home page
│   │   └── ...
├── i18n/
│   ├── routing.ts           # Routing configuration
│   └── request.ts           # Server-side message loading
├── messages/
│   ├── en.json
│   └── tr.json
├── middleware.ts            # Or proxy.ts for Next.js 16+
└── components/
    └── locale/
        └── locale-switcher.tsx
```

### Routing Configuration (`i18n/routing.ts`)

```typescript
import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["en", "tr"],
  defaultLocale: "en",

  // Options: "always" | "as-needed" | "never"
  // "as-needed" - default locale has no prefix, others do
  localePrefix: "as-needed",

  // Map internal paths to external URLs (optional)
  pathnames: {
    "/": "/",
    "/about": "/about",
    // Add localized paths if needed
  },
})

export type Locale = (typeof routing.locales)[number]

export const { Link, usePathname, useRouter, redirect, getPathname } = createNavigation(routing)
```

### Middleware Configuration (CRITICAL for SEO)

```typescript
// proxy.ts (Next.js 16+) or middleware.ts (Next.js 15)
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware({
  ...routing,

  // CRITICAL: Disable locale detection to prevent redirects
  // This ensures crawlers always receive the URL they request
  localeDetection: false,

  // Optional: Disable alternate links if managing separately
  // alternateLinks: false,
})

export default intlMiddleware

export const config = {
  // Exclude API routes, static files, and framework internals
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
```

**Why `localeDetection: false` is Critical:**

1. Google crawlers don't send Accept-Language headers
2. Automatic redirects create redirect chains that hurt SEO
3. Different crawl requests might get inconsistent responses
4. hreflang tags may be ignored if pages redirect

### Enabling Static Generation

```typescript
// app/[locale]/layout.tsx
import { routing } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"

// CRITICAL: Enable static rendering for all locale pages
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Enable static rendering for this request
  setRequestLocale(locale)

  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Metadata with hreflang (generateMetadata)

```typescript
// lib/seo/metadata.ts
import type { Metadata } from "next"

const appUrl = "https://example.com"
const locales = ["en", "tr"] as const
const defaultLocale = "en"

interface GenerateMetadataOptions {
  title: string
  description: string
  locale: string
  path: string
}

export function generateSeoMetadata({
  title,
  description,
  locale,
  path,
}: GenerateMetadataOptions): Metadata {
  // Build canonical URL (no locale prefix for default)
  const localePath = locale === defaultLocale ? path : `/${locale}${path}`
  const canonicalUrl = `${appUrl}${localePath}`.replace(/\/$/, "") || appUrl

  // Build alternates with all locales + x-default
  const alternateLanguages: Record<string, string> = {}

  for (const loc of locales) {
    const locPath = loc === defaultLocale ? path : `/${loc}${path}`
    alternateLanguages[loc] = `${appUrl}${locPath}`.replace(/\/$/, "") || appUrl
  }

  // x-default points to default locale version
  alternateLanguages["x-default"] = alternateLanguages[defaultLocale]

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: locale === "tr" ? "tr_TR" : "en_US",
    },
  }
}
```

**Usage in Page:**

```typescript
// app/[locale]/about/page.tsx
import { generateSeoMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }) {
  const { locale } = await params

  return generateSeoMetadata({
    title: locale === "tr" ? "Hakkımızda" : "About Us",
    description: locale === "tr" ? "Hakkımızda açıklama" : "About us description",
    locale,
    path: "/about",
  })
}
```

---

## Handling the Root "/" Path

### The Problem

When using `localePrefix: "as-needed"`:
- English (default): served at `/`
- Turkish: served at `/tr`

The challenge: ensuring `/` doesn't redirect, which would break SEO.

### Solution: Static Home Page

```typescript
// app/[locale]/page.tsx

// Force static generation
export const dynamic = "force-static"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "tr" }]
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return generateSeoMetadata({
    title: "Home",
    description: "...",
    locale,
    path: "", // Empty path for home
  })
}

export default async function HomePage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeContent locale={locale} />
}
```

### Correct hreflang Output

For the home page (`/` and `/tr`):

```html
<!-- On / (English) -->
<link rel="canonical" href="https://example.com" />
<link rel="alternate" hreflang="en" href="https://example.com" />
<link rel="alternate" hreflang="tr" href="https://example.com/tr" />
<link rel="alternate" hreflang="x-default" href="https://example.com" />

<!-- On /tr (Turkish) -->
<link rel="canonical" href="https://example.com/tr" />
<link rel="alternate" hreflang="en" href="https://example.com" />
<link rel="alternate" hreflang="tr" href="https://example.com/tr" />
<link rel="alternate" hreflang="x-default" href="https://example.com" />
```

---

## Sitemap with hreflang

### Next.js 15+ Built-in Support

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next"

const appUrl = "https://example.com"
const locales = ["en", "tr"]
const defaultLocale = "en"

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  // Static routes
  const staticRoutes = [
    { path: "", priority: 1.0 },
    { path: "/about", priority: 0.8 },
    { path: "/pricing", priority: 0.9 },
  ]

  for (const route of staticRoutes) {
    // Build alternates for all locales + x-default
    const alternateLanguages: Record<string, string> = {}

    for (const locale of locales) {
      const localePath = locale === defaultLocale
        ? route.path
        : `/${locale}${route.path}`
      alternateLanguages[locale] = `${appUrl}${localePath || "/"}`
    }
    alternateLanguages["x-default"] = alternateLanguages[defaultLocale]

    // Create entry for each locale
    for (const locale of locales) {
      const localePath = locale === defaultLocale
        ? route.path
        : `/${locale}${route.path}`

      entries.push({
        url: `${appUrl}${localePath || "/"}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route.priority,
        alternates: {
          languages: alternateLanguages,
        },
      })
    }
  }

  return entries
}
```

---

## Language Switcher Implementation

### Best Practices

1. **Use URL-based switching** - not cookies or localStorage alone
2. **Preserve the current path** when switching
3. **Use the navigation helper** from next-intl for proper routing
4. **Make it a Client Component** since it needs interactivity

### Implementation

```typescript
"use client"

import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import { routing } from "@/i18n/routing"

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  // Remove current locale prefix from pathname
  const getPathnameWithoutLocale = (path: string) => {
    for (const loc of routing.locales) {
      if (path === `/${loc}`) return "/"
      if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    }
    return path
  }

  const handleLocaleChange = (newLocale: string) => {
    const pathWithoutLocale = getPathnameWithoutLocale(pathname)

    // Navigate to the same path in the new locale
    router.replace(pathWithoutLocale, { locale: newLocale })
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={locale === loc ? "font-bold" : ""}
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "en" ? "English" : "Turkce"}
        </button>
      ))}
    </div>
  )
}
```

### Cookie vs URL-Based Storage

| Aspect | URL-Based (Recommended) | Cookie-Based |
|--------|------------------------|--------------|
| SEO | Excellent - each locale has unique URL | Poor - single URL for all |
| Shareability | Perfect - URLs include locale | Broken - shared links show wrong locale |
| Static Generation | Possible | Forces dynamic rendering |
| Crawlability | Each version indexed independently | Only one version indexed |
| User Experience | Bookmarkable, predictable | Automatic but confusing |

**Recommendation:** Always use URL-based locale routing for SEO.

---

## Common Pitfalls That Cause Google Indexing Issues

### 1. Redirect Loops on Root Path

**Problem:**
```
GET / -> 302 /en -> rewrite to / -> 302 /en ...
```

**Solution:**
- Use `localePrefix: "as-needed"` to serve default locale at `/`
- Set `localeDetection: false` to prevent Accept-Language redirects

### 2. User-Agent Based Redirects (Cloaking)

**Problem:** Showing different content to Googlebot vs users

**Google's Warning:**
> "Inserting text or keywords into a page only when the User-agent requesting the page is a search engine is known as cloaking and is against Google's Terms and Conditions."

**Solution:**
- Never check user-agent for locale decisions
- Serve the same content to all requests for a URL

### 3. Accept-Language Redirects

**Problem:** Redirecting users based on browser language

**Google's Guidance:**
> "Googlebot crawls from multiple geographic locations. The key principle: treat it like you would treat any other user from that country."

**Solution:**
- Disable `localeDetection` in middleware
- Let users manually switch languages via UI
- Use a client-side locale suggestion banner (like `LocaleDetector`)

### 4. Incomplete hreflang Tag Sets

**Problem:** Missing self-references or bidirectional links

**Example of WRONG implementation:**
```html
<!-- On /en page - MISSING self-reference -->
<link rel="alternate" hreflang="tr" href="/tr" />
```

**Example of CORRECT implementation:**
```html
<!-- On /en page -->
<link rel="alternate" hreflang="en" href="/en" />  <!-- Self-reference -->
<link rel="alternate" hreflang="tr" href="/tr" />
<link rel="alternate" hreflang="x-default" href="/en" />
```

### 5. Inconsistent Canonical URLs

**Problem:** Canonical points to different locale than current page

**Correct Pattern:**
- Each locale page should have a self-referencing canonical
- OR all locales point to one authoritative version (consolidating strategy)

**Self-Referencing (Recommended for unique content):**
```html
<!-- On /tr/about -->
<link rel="canonical" href="https://example.com/tr/about" />
```

### 6. Trailing Slash Inconsistency

**Problem:** Some URLs with trailing slash, others without

**Solution:** Use consistent URL format throughout:
```typescript
// Always remove trailing slashes
const url = path.replace(/\/$/, "") || "/"
```

---

## Validation Checklist

### Pre-Launch Checklist

- [ ] `localeDetection: false` in middleware
- [ ] All pages have `generateStaticParams` for locales
- [ ] All pages have proper hreflang in metadata
- [ ] x-default hreflang points to default locale
- [ ] Self-referencing hreflang on every page
- [ ] Sitemap includes alternates for all locales
- [ ] No redirect chains on any URL
- [ ] Root "/" serves content without redirect
- [ ] Language switcher works without full page reload
- [ ] Canonical URLs are self-referencing

### Testing Tools

1. **Google Search Console**
   - Check "International Targeting" report
   - Review hreflang errors

2. **Google Rich Results Test**
   - Verify hreflang tags are present

3. **Hreflang Testing Tools**
   - [hreflang.org](https://hreflang.org) - validates bidirectional tags
   - [Merkle hreflang Generator](https://technicalseo.com/tools/hreflang/)

4. **Manual Verification**
   ```bash
   # Check what Googlebot sees
   curl -H "User-agent: Googlebot" https://example.com/

   # Verify no redirects
   curl -I https://example.com/
   curl -I https://example.com/tr
   ```

---

## Sources & References

### Google Documentation
- [Localized Versions of your Pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [x-default hreflang for International Pages](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
- [How x-default Can Help You](https://developers.google.com/search/blog/2023/05/x-default)
- [Locale-Adaptive Pages Crawling](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)

### next-intl Documentation
- [App Router Getting Started](https://next-intl.dev/docs/getting-started/app-router)
- [Middleware Configuration](https://next-intl.dev/docs/routing/middleware)
- [Routing Configuration](https://next-intl.dev/docs/routing/configuration)
- [Static Rendering Setup](https://next-intl.dev/docs/routing/setup)

### Community Resources
- [Next.js i18n and SEO Considerations](https://github.com/vercel/next.js/discussions/51712)
- [Complete Guide to i18n in Next.js 15](https://dev.to/mukitaro/a-complete-guide-to-i18n-in-nextjs-15-app-router-with-next-intl-supporting-8-languages-1lgj)
- [Canonical Tags and hreflang in Next.js 15](https://www.buildwithmatija.com/blog/nextjs-advanced-seo-multilingual-canonical-tags)
- [Multilingual Sitemap with next-intl](https://dev.to/oikon/implementing-multilingual-sitemap-with-next-intl-in-nextjs-app-router-1354)

### Third-Party Tools
- [hreflang Testing Tool](https://hreflang.org)
- [next-sitemap Package](https://github.com/iamvishnusankar/next-sitemap)
- [Yoast hreflang Guide](https://yoast.com/hreflang-ultimate-guide/)

---

## Capsule Note Current Implementation Status

### What's Already Correct

1. **`localeDetection: false`** in `proxy.ts` - prevents redirect issues
2. **`localePrefix: "as-needed"`** - default locale (en) at `/`, Turkish at `/tr`
3. **`generateStaticParams`** in locale layout - enables static rendering
4. **x-default hreflang** in metadata - points to English version
5. **Self-referencing hreflang** in `generateSeoMetadata` utility
6. **Sitemap with alternates** including x-default
7. **Client-side LocaleDetector** - suggests locale without server redirects

### Documentation Comment in proxy.ts

The implementation includes excellent documentation explaining WHY locale detection is disabled:

```typescript
/**
 * CRITICAL: localeDetection is set to FALSE to prevent automatic redirects
 * based on Accept-Language headers. This ensures Google and other crawlers
 * always receive the URL they request without redirects.
 */
```

This is exactly the right approach for SEO-friendly i18n.
