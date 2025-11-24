# Turkish i18n rollout – task tracker

Scope: add Turkish (`tr`) alongside English (`en`) using `next-intl` with App Router, Clerk auth, and email/worker surfaces.

## Ticket-ready tasks (ordered)

[x] 1) **Add i18n infrastructure**
   - Install `next-intl` in `apps/web`.
   - Create `apps/web/i18n/routing.ts` with `locales = ["en","tr"]`, `defaultLocale = "en"`, `pathnames` map.
   - Create `apps/web/i18n/request.ts` using `getRequestConfig` to load messages by locale.
   - Wrap `apps/web/next.config.js` (or migrate to `.mjs`) with `next-intl` plugin pointing to `i18n/request.ts`.
   - Acceptance: Next dev/build succeeds; `/en` and `/tr` routes resolve.

[x] 2) **Compose middleware with Clerk**
   - Replace current `apps/web/middleware.ts` with `clerkMiddleware` + `createRouteMatcher` for protected routes under `/:locale`.
   - Call `next-intl` `createMiddleware(routing)` inside the Clerk middleware.
   - Matcher should exclude `/api|trpc|_next|_vercel|.*\\..*`.
   - Acceptance: Protected dashboard requires auth for both `/en/dashboard` and `/tr/dashboard`; public routes stay public; API unaffected.

[x] 3) **Locale-aware app layout**
   - Move to `app/[locale]/layout.tsx`, pulling `locale` from params.
   - Load messages via `getMessages`, wrap children in `NextIntlClientProvider`, set `<html lang={locale}>`.
   - Ensure global providers (ClerkProvider, Toaster) remain intact.
   - Acceptance: App renders with locale-specific messages; no provider regressions.

[x] 4) **Navigation + router helpers**
   - Export `Link`, `redirect`, `useRouter`, `usePathname` from `i18n/routing` via `createLocalizedPathnamesNavigation`.
   - Refactor navbar, footer, CTA buttons, and app shell links to use locale-aware navigation.
   - Acceptance: Internal links preserve locale prefix; manual switching between `/en` and `/tr` keeps nav consistent.

[x] 5) **Language switcher + preference persistence**
   - Add visible switcher in shared navbar/app shell; avoid flags, use “English”/“Türkçe”.
   - Switching should navigate to the locale-prefixed route and set the locale cookie; if signed in, persist to Clerk user metadata (non-blocking).
   - Acceptance: Switching updates URL, cookie, and (when signed in) stored preference; respects explicit URL if user manually types a locale.

[x] 6) **Message packs**
   - Create `apps/web/messages/en/*.json` namespaces: `common`, `marketing`, `app`, `auth`, `errors`, `dates`, `emails`.
   - Mirror `tr` files with initial Turkish translations; fill missing keys with English placeholders for now.
   - Add a server-safe `loadMessages(locale, namespace?)` utility shareable by app and workers.
   - Acceptance: Builds load messages without runtime import errors; missing-key fallback policy defined.

[x] 7) **Marketing pages localization**
   - Replace hardcoded strings in `(marketing)` routes with `useTranslations`/`getTranslations`.
   - Localize metadata via `generateMetadata` and set `alternates.languages`.
   - Acceptance: `/tr` marketing renders Turkish copy; view source shows hreflang alternates for en/tr.

[x] 8) **Authenticated surfaces localization**
   - Localize `(app)` layout labels (Dashboard, Letters, Deliveries, Settings) and dashboards/letters/deliveries/settings pages.
   - Ensure redirects/links use locale-aware helpers.
   - Acceptance: Signed-in flows render Turkish when on `/tr/...`; no broken navigation.

[x] 9) **Forms, validation, and toasts**
   - Localize Zod validation messages via `t()` maps.
   - Localize toast/alert copy; ensure date/time/currency formatting uses `Intl` with locale from context.
   - Acceptance: Validation errors and toasts show in Turkish; dates/numbers reflect locale.

[x] 10) **Clerk + auth localization**
    - Configure `ClerkProvider` with `tr-TR` localization package and pass current locale.
    - Ensure sign-in/up/reset flows at `/tr/...` show Turkish UI; URLs remain locale-prefixed.
    - Acceptance: Clerk widgets display Turkish strings when locale is `tr`.

[x] 11) **Emails and background jobs**
    - Load messages via server-safe helper in React Email templates and Inngest workers.
    - Localize subject lines, body copy, and dates/numbers.
    - Acceptance: Sample email renders in Turkish; workers can render localized content without Next runtime dependencies.

12) **Testing and QA**
    - Add unit tests for message loading and formatters.
    - Add e2e flow: switch to Turkish on landing, sign up/sign in, create/schedule a letter, verify locale persists.
    - Smoke-test middleware: direct hits to `/`, `/en/...`, `/tr/...`, and protected routes.
    - Acceptance: Tests pass locally/CI; no regressions in en locale.

13) **Docs and operational readiness**
    - Document locale-picking order (URL > explicit switch > cookie > DB preference > Accept-Language > default).
    - Add translator notes and a checklist for adding new locales.
    - Acceptance: README/DEVELOPMENT updated with i18n instructions.

## Open decisions / assumptions
- Keep `next.config.js` or migrate to `.mjs` to simplify plugin usage—decide before implementing task #1.
- Missing translations can fall back to English; confirm policy before production.
- Currency rules: assume UI-only formatting per locale; business currency stays as today unless stated otherwise.
