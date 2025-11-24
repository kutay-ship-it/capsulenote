# Next.js 15 SEO Action Plan – Capsule Note
Date: 2025-11-10  
Scope: apps/web (Next 15.5.6, React 19.2)

## Goals & Principles (Next 15+)
- Prefer static by default (marketing) with `dynamic = "force-static"`; keep dashboards dynamic via `revalidate = 0`.
- Use the Metadata API (no manual `<head>`) for titles, descriptions, OG/Twitter, canonical, robots, icons, manifest, and viewport/theme color.
- Provide crawl map and guardrails: `app/sitemap.ts` + `app/robots.ts` with allow/deny rules; mark sensitive flows `noindex, nofollow`.
- Serve strong previews: default OG/Twitter card (ImageResponse) and per-page overrides for key marketing pages.
- Add structured data (JSON-LD): Organization/Website on `/`, Product/Offer + FAQ on `/pricing`.
- Control duplication: canonical URLs on catch-alls (`[[...]]`) and auth/checkout variants.
- Ship performance-friendly assets: `next/font`, `next/image` with `priority` above the fold, icons/manifest, and caching headers for static assets.
- Keep URL and linting hygiene: pick a trailing-slash policy and stick to it; keep ESLint (core-web-vitals) and TypeScript checks on for production safety.

## Current Gaps Observed
- Root metadata is sparse/mismatched (title “DearMe”), no `metadataBase`, no canonical, robots, Twitter, or icons/manifest.
- No `app/sitemap.ts`, `app/robots.ts`, or default OG image route; social previews will fall back to plain text.
- Marketing home uses `auth()` server-side → forces dynamic rendering, blocking static caching of the homepage.
- Sensitive/transactional routes (`/subscribe/*`, `/checkout/*`, `/reset-password`, `/sso-callback`, `/welcome`, `/view/[token]`, `/sandbox/*`, `/admin/*`) are indexable today.
- No structured data on marketing/pricing; no `next/font` or `next/image` usage for hero assets.
- Catch-all success/error routes lack canonicalization; preview environments not guarded with `noindex`.
- Lint/type safety disabled in `next.config.js` (ignoreDuringBuilds/ignoreBuildErrors = true); trailing-slash policy unstated.

## Prioritized To-Do
0) **Platform hygiene**  
   - Trailing slash: keep current (no trailing slash) and avoid changing later.  
   - Re-enable ESLint (core-web-vitals) and TypeScript checks later; keep `ignoreDuringBuilds/ignoreBuildErrors` true for now until fixes are ready.  
1) **Global metadata in `app/layout.tsx`**  
   - Add `metadataBase` from `NEXT_PUBLIC_APP_URL`.  
   - Title template + default description; `robots` allow index; `alternates.canonical` root.  
   - Add OG/Twitter defaults (card image), `viewport`, `themeColor`, `icons`, `manifest`.
2) **Indexing guards**  
   - Set `metadata.robots = { index: false, follow: false }` on sensitive/transactional routes above.
3) **Crawl controls**  
   - `app/robots.ts`: allow marketing/auth; disallow `/api/*`, `/sandbox/*`, `/admin/*`, `/subscribe/*`, `/checkout/*`, `/view/*` (tokenized), `/welcome`, and any cron paths. Add preview/staging `noindex` when `VERCEL_ENV !== "production"`.
   - `app/sitemap.ts`: include marketing URLs (`/`, `/pricing`, `/write-letter`, `/demo-letter`, `/view` landing if exists); skip tokenized/private paths.
4) **OG image defaults**  
   - Add `app/opengraph-image.tsx` (and optionally `icon.tsx`) using `ImageResponse`; reference it in metadata defaults (generate the card).
5) **Per-page metadata (marketing)**  
   - Add `export const metadata` (or `generateMetadata`) for `/`, `/pricing`, `/write-letter`, `/demo-letter` with canonical + OG/Twitter.  
   - Make home static: move `auth()` to a tiny client component or prop to keep the page static.
6) **Structured data**  
   - Home: Organization + Website JSON-LD.  
   - Pricing: Product/Offer JSON-LD + FAQPage using existing FAQ content.
7) **Canonicals on catch-alls**  
   - `/subscribe/success/[[...rest]]`, `/subscribe/error`, `/sign-in/[[...]]`, `/sign-up/[[...]]`, `/view/[token]` → set base canonical; mark noindex where applicable.
8) **Assets & performance**  
   - Add icons (`icon.png`, `apple-touch-icon.png`) and `manifest.json` under `app/`.  
   - Switch fonts to `next/font` to avoid FOUT; use `next/image` for any hero/illustrations with `priority`.  
   - Optional: headers in `next.config.js` for long-lived static assets.
9) **Preview safety**  
   - If `VERCEL_ENV !== "production"`, return `noindex` via `robots.ts` or middleware header guard (we’ll implement).
10) **Analytics & verification**  
    - Add Search Console verification (metadata `verification` or HTML file) and ensure analytics (Vercel Analytics or GA4) are wired.  
    - Enable `experimental.webVitalsAttribution` if debugging CLS/LCP is needed.

## Implementation Notes (concise)
- **layout.tsx**:  
  ```ts
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://calsulenote.com"
  export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: { default: "Capsule Note — Letters to Your Future Self", template: "%s | Capsule Note" },
    description: "Write, encrypt, and schedule letters to your future self via email or premium mail.",
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
    openGraph: { title: "Capsule Note", description: "...", url: "/", siteName: "Capsule Note", type: "website" },
    twitter: { card: "summary_large_image", title: "Capsule Note", description: "..." },
    icons: { icon: "/icon.png", apple: "/apple-touch-icon.png" },
    manifest: "/manifest.json",
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#0f172a",
  }
  ```
- **robots.ts**: disallow `/api/*`, `/sandbox/*`, `/admin/*`, `/subscribe/*`, `/checkout/*`, `/view/*`, `/welcome`, `/sso-callback`, `/reset-password`, `/global-error`, `/error`, `/cron/*`; allow others; add `sitemap: ${metadataBase}/sitemap.xml`.
- **sitemap.ts**: return marketing URLs with `lastModified: new Date()`, set `priority` (e.g., `/` 1.0, `/pricing` 0.9, `/write-letter` 0.8, `/demo-letter` 0.6); skip tokenized/private paths.
- **OG image**: `app/opengraph-image.tsx` with `ImageResponse` (static branding). Optionally `app/icon.tsx` for vector favicon.
- **Route metadata**: For sensitive routes, include `robots: { index: false, follow: false }` and base canonical. For marketing, include descriptive titles + canonical per URL.
- **Structured data**: Use a small helper returning `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` inside the Server Component (or `generateMetadata` `other` field).
- **Static home**: remove `auth()` from `app/(marketing)/page.tsx` and read signed-in state via a client widget if needed for CTA; add `export const dynamic = "force-static"` and `revalidate = 3600` if desired.
- **Safety**: Escape `<` in JSON-LD (`replace(/</g, "\\u003c")`) to avoid script injection; keep canonical/OG URLs relative so `metadataBase` handles environments.

## Quick Route Checklist
- Marketing: `/`, `/pricing`, `/write-letter`, `/demo-letter` → full metadata, canonical, OG/Twitter, structured data (pricing/FAQ), static rendering.
- Auth: `/sign-in/[[...]]`, `/sign-up/[[...]]` → canonical to base; robots allow index (optional) or keep indexed depending on strategy.
- Transactional/Sensitive: `/subscribe/*`, `/checkout/*`, `/reset-password`, `/sso-callback`, `/welcome`, `/view/[token]`, `/sandbox/*`, `/admin/*` → `noindex, nofollow`.
- Dynamic dashboards: keep `revalidate = 0` as is; not in sitemap.

## Validation Steps
- Local smoke: `pnpm lint` (once ESLint is re-enabled) and `pnpm build` to ensure metadata files compile.  
- Manual: open `/robots.txt`, `/sitemap.xml`, `/api/og` (or `/opengraph-image`), and view page source to confirm canonical/OG/Twitter and JSON-LD presence.  
- Post-deploy: verify Search Console coverage, inspect live URL for homepage/pricing, check social share previews (Twitter/X, Facebook debugger), and run Lighthouse/PageSpeed on `/` + `/pricing`.

## Brand rename directive
- Replace all user-facing “DearMe” / “Dear Me” with “Capsule Note” (UI, metadata, emails, ICS/calendar strings, support/mail-from display names); keep internal package namespaces (`@dearme/*`) unchanged.
