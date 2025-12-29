# Capsule Note SEO Audit

Audit Date: 2025-12-23
Auditor: Codex (GPT-5)
Scope: apps/web marketing + app routes, i18n routing, metadata, robots/sitemap, structured data

## Executive Summary
Overall SEO Grade: B+
Capsule Note has a strong technical SEO foundation (sitemap, hreflang, structured data, noindex for private routes). The main gaps are crawl-control edge cases for locale-prefixed private paths, inconsistent x-default usage, and generic social metadata on content pages. These are not blockers, but addressing them will improve crawl hygiene and shareability.

## Key Findings (Highest Priority First)
- High: robots.txt disallow list does not include locale-prefixed private paths (e.g., /tr/letters), so crawl blocking relies entirely on noindex. See apps/web/app/robots.ts.
- High: AI crawler allowlist does not restrict scope as written; Allow is additive, not exclusive. If the intent is to limit AI to content pages only, the current rules do not enforce that. See apps/web/app/robots.ts.
- Medium: x-default hreflang is present on some marketing pages but missing on others, sending mixed signals. Standardize for consistency. See apps/web/app/[locale]/(marketing-v3)/*.
- Medium: Homepage uses auth() and headers(), forcing dynamic rendering and reducing cacheability; this can impact TTFB and CWV for your most important SEO entry point. See apps/web/app/[locale]/(marketing-v3)/page.tsx.
- Medium: Social metadata (OG/Twitter) stays generic on blog/guides/prompts; per-article cards would improve social CTR and indirect SEO signals. See apps/web/app/layout.tsx and apps/web/app/[locale]/opengraph-image.tsx.

## Coverage Matrix
| Area | Status | Evidence |
| --- | --- | --- |
| robots.txt | Pass with notes | apps/web/app/robots.ts |
| sitemap.xml | Pass | apps/web/app/sitemap.ts |
| noindex on private/auth routes | Pass | apps/web/app/[locale]/(app-v3)/layout.tsx, apps/web/app/[locale]/subscribe/page.tsx |
| canonical + hreflang | Pass with notes | apps/web/app/[locale]/(marketing-v3)/* |
| structured data | Pass | apps/web/components/seo/json-ld.tsx |
| Open Graph + Twitter | Partial | apps/web/app/layout.tsx |
| localization routing | Pass | apps/web/i18n/routing.ts, apps/web/proxy.ts |

## Recommendations
- Add locale-prefixed disallow entries (or wildcard patterns) for private app routes in robots.txt to reduce reliance on meta noindex.
- If AI crawl restriction is required, switch AI bot rules to Disallow: / with Allow exceptions for content routes.
- Standardize x-default alternates across all indexable marketing pages for consistent hreflang signaling.
- Move signed-in detection on the marketing homepage to the client or a smaller dynamic island to allow static caching.
- Add per-article OG/Twitter metadata (and optional dynamic og-image) for blog, guides, prompts, and templates.

## Production Readiness
Status: Ready with minor follow-ups. No blocking SEO issues were found, but the High priority items above should be addressed to tighten crawl control.

## Manual Verification Checklist (Not Run Here)
- Validate robots.txt and sitemap.xml on production with curl and ensure 200 responses.
- Check canonical and hreflang tags for /, /tr, and a few content pages.
- Run Google Rich Results Test on a blog post and the pricing page.
- Run Lighthouse on the homepage and one content page to confirm CWV targets.
