Short answer: yes – this is a very “by-the-book” way to add i18n to a Next.js App Router app with `next-intl`, and it lines up with the official docs. I’d ship this with a few small tweaks.

---

## 1. What you’re doing *right* (matches best practice)

**Foundations**

* Using **`next-intl` with the App Router** + plugin: this is exactly how the library is meant to be used now (plugin + `i18n/request.ts` or equivalent). ([next-intl.dev][1])
* **`app/[locale]/...` routing + `generateStaticParams`** for locales is the canonical pattern for locale segments. ([next-intl.dev][2])
* **Middleware that negotiates locale and rewrites `/` → `/<locale>`** while leaving API routes un-prefixed is exactly how `next-intl`’s middleware is designed to work. ([next-intl.dev][3])
* Wrapping **`app/[locale]/layout.tsx` in `NextIntlClientProvider`** and setting `<html lang={locale}>` is straight from the docs. ([next-intl.dev][1])

**Routing & navigation**

* A **locale-aware `Link`/navigation layer** (`LocalizedLink`, redirect helpers, etc.) is recommended; app router doesn’t automatically inject the locale into links, so a wrapper is normal. ([Reddit][4])
* **Language switcher that persists choice in a cookie** and (optionally) in Clerk user metadata lines up with how `NEXT_LOCALE`/`localeCookie` are meant to be used. ([next-intl.dev][5])

**Content & translations**

* **Per-namespace message packs** (`common`, `marketing`, `auth`, etc.) mirrored across `en`/`tr` is how people keep things manageable and enables code-splitting. ([Intlayer][6])
* Replacing copy with `useTranslations` / `getTranslations` and **localizing metadata via `generateMetadata`** is exactly what `next-intl`’s server helpers are for. ([next-intl.dev][7])
* Using **`Intl.DateTimeFormat` or `date-fns` with `tr` locale** is the right way to handle Turkish dates/numbers.

**Third-party surfaces**

* **Clerk + `@clerk/localizations` `trTR`** is the recommended way to localize Clerk UIs. ([Clerk][8])
* Localizing Zod errors, date pickers, and emails/notifications via shared message loaders is exactly the level of completeness you want.

**Testing & rollout**

* E2E flow that switches to Turkish + middleware / SEO smoke tests + a defined translation workflow is great. This is how people avoid i18n regressions.

So architecturally: ✅ yes, this is a “proper” approach.

---

## 2. Tweaks I’d make so it’s smoother

### 2.1. Align with the official `next-intl` config layout

Right now you mention `apps/web/i18n/config.ts`. The recommended setup is:

* **`i18n/routing.ts`** – routing config (locales, default locale, pathnames).
* **`i18n/request.ts`** – how to load messages per locale.
* **`next.config.mjs/ts`** – plugin that wires `request.ts` into Next. ([next-intl.dev][1])

You can *still* have a `config.ts` for shared constants, but I’d base it on this pattern.

Example (adapt paths for `apps/web`):

```ts
// apps/web/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';
import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    // add more as needed
  }
});

export type Locale = (typeof routing.locales)[number];

export const {
  Link, useRouter, usePathname, redirect
} = createLocalizedPathnamesNavigation(routing);
```

```ts
// apps/web/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  if (!routing.locales.includes(locale as any)) {
    // optional: notFound()
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

```ts
// apps/web/next.config.mjs (or at repo root if you don’t split apps)
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./apps/web/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your config…
};

export default withNextIntl(nextConfig);
```

That keeps everything very close to the docs and avoids “config file not found” errors. ([next-intl.dev][7])

---

### 2.2. Let `next-intl` handle locale detection in middleware

Instead of hand-rolling locale detection (Accept-Language + cookie), I’d lean on `createMiddleware` and tune it:

```ts
// apps/web/proxy.ts or middleware.ts (naming depends on Next.js version)
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

This already does:

1. Locale prefix detection.
2. Cookie-based preference (`NEXT_LOCALE`).
3. Accept-Language fallback.
4. Default locale as last resort. ([next-intl.dev][3])

You *still* implement your language switcher; it just needs to navigate to a locale-prefixed URL (or call `Link` with `locale="tr"`), and `next-intl` will set/update the cookie for you. ([next-intl.dev][3])

If you want a custom cookie name or attributes, configure `localeCookie` in your routing config. ([next-intl.dev][5])

---

### 2.3. Compose middleware correctly with Clerk

Your plan mentions “keep Clerk auth guards compatible with locale-prefixed paths”. That’s right, but the devil is in the middleware ordering.

The official `next-intl` docs now show a **Clerk integration** using `clerkMiddleware` + `createRouteMatcher` and then calling the `next-intl` middleware inside: ([next-intl.dev][3])

Roughly:

```ts
// apps/web/proxy.ts (or middleware.ts before Next 16)
import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const isProtectedRoute = createRouteMatcher(['/:locale/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // After auth, run i18n routing (handles / → /en, locale cookies, etc.)
  return handleI18nRouting(req);
});

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

Key points:

* Matcher excludes `/api` so Clerk + i18n don’t hijack your API routes. ([next-intl.dev][3])
* `/:locale/dashboard(.*)` keeps your dashboards protected across locales.
* You *don’t* need a second standalone `middleware.ts`; everything is composed here.

That aligns perfectly with your “keep Clerk auth guards compatible” bullet.

---

### 2.4. Reuse `next-intl`’s navigation helpers instead of custom wrappers

You mention:

> Add a locale-aware Link helper (LocalizedLink)
> Ensure next/navigation usage respects locale by using createTranslator/redirect wrappers.

That’s all good, but you can reduce glue code by using the **navigation helpers produced by `createLocalizedPathnamesNavigation`** (see the `routing.ts` example above). ([Medium][9])

Then:

* Use `Link` from `i18n/routing` instead of your own `LocalizedLink`.
* Use the exported `redirect`, `useRouter`, `usePathname` instead of writing wrappers.

You can still add tiny app-specific wrappers if you want, but it keeps things type-safe and consistent.

---

### 2.5. Layout & providers: reuse what `next-intl` gives you

In `app/[locale]/layout.tsx`:

* You *don’t* need to write your own `useLocale` – `next-intl` already exports it, and it gets the locale from the request config/middleware. ([This Dot Labs][10])
* The typical pattern is:

```tsx
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';

export default async function LocaleLayout({
  children,
  params: {locale},
}: {
  children: React.ReactNode;
  params: {locale: Locale};
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

That plays nicely with the plugin + middleware you’re already planning. ([next-intl.dev][7])

---

### 2.6. SEO details

You already mention `hreflang` & canonical. With App Router you can largely express this via `metadata`:

* Use `metadata.alternates.languages` for your language-specific URLs so Next.js emits the appropriate `<link rel="alternate" hreflang="…">` tags. ([Next.js][11])
* `next-intl`’s middleware can add alternate links too when correctly configured with routing. ([next-intl.dev][3])

Your `generateMetadata` plan + `getTranslations` per locale is the right way to get translated titles/descriptions.

---

### 2.7. Emails / workers

Your plan to have a **“server-safe messages loader”** for React Email + Inngest is exactly what I’d do:

* Put a `loadMessages(locale, namespace?)` helper next to your `i18n/request.ts` that just imports JSON and doesn’t touch `next/headers` or `NextRequest`.
* Use that in:

  * `i18n/request.ts` (for app).
  * Inngest functions / email render functions (for background jobs).

That keeps the source-of-truth for translations single and reuses the same JSON files.

---

## 3. So… would I approve this?

Yes. If I were reviewing this as a teammate / tech lead I’d mark it as **approved with minor adjustments**:

* Reuse `next-intl`’s **official routing + middleware** setup instead of re-implementing locale detection.
* Compose middleware with **Clerk** per the official example.
* Prefer `i18n/routing.ts` + `i18n/request.ts` + plugin as your core structure.
* Use `createLocalizedPathnamesNavigation` instead of hand-rolled router wrappers where possible.

If you want, I can help you sketch the exact file tree and minimal code for each file (`next.config`, `routing`, `request`, `middleware`, `[locale]/layout`) based on your project layout (`apps/web`).

[1]: https://next-intl.dev/docs/getting-started/app-router?utm_source=chatgpt.com "App Router - Internationalization (i18n) for Next.js"
[2]: https://next-intl.dev/docs/routing/setup?utm_source=chatgpt.com "Setup locale-based routing – Internationalization (i18n) for ..."
[3]: https://next-intl.dev/docs/routing/middleware "Proxy / middleware – Internationalization (i18n) for Next.js"
[4]: https://www.reddit.com/r/nextjs/comments/189ceji/resources_for_nexjs_14_internationalization_with/?utm_source=chatgpt.com "Resources for Nexjs 14 internationalization with next-intl"
[5]: https://next-intl.dev/docs/routing/configuration?utm_source=chatgpt.com "Routing configuration – Internationalization (i18n) for Next.js"
[6]: https://intlayer.org/en-GB/blog/nextjs-internationalization-using-next-intl?utm_source=chatgpt.com "How to internationalise your Next.js application using ..."
[7]: https://next-intl.dev/docs/usage/configuration?utm_source=chatgpt.com "Request configuration – Internationalization (i18n) for Next.js"
[8]: https://clerk.com/docs/guides/customizing-clerk/localization?utm_source=chatgpt.com "Customizing Clerk: Localization prop (experimental)"
[9]: https://medium.com/%40debaprasadworld/internationalization-in-next-js-14-using-next-intl-module-95bcd409f5c9?utm_source=chatgpt.com "Internationalization in Next.js 14 using next-intl Module"
[10]: https://www.thisdot.co/blog/internationalization-in-next-js-with-next-intl?utm_source=chatgpt.com "Internationalization in Next.js with next-intl"
[11]: https://nextjs.org/docs/app/guides/internationalization?utm_source=chatgpt.com "Guides: Internationalization"


Yes, these ideas are valid – you’re basically listing the “canonical” i18n best practices. Let me go through each one and call out any nuance:

---

### 1. URL-based routing & SEO

> **“URL-Based Routing is Mandatory for SEO… app/[locale]/...”**

* Using `/en/...`, `/tr/...` etc. in the URL is **absolutely the right approach**.
* It makes pages:

  * Shareable (the URL itself encodes language).
  * Crawlable and indexable as separate variants.

So: ✅ **Yes, this is correct and you’re already doing the right thing.**

> **“You must implement hreflang tags…”**

Also ✅. With App Router you typically:

* Use `alternates.languages` in `generateMetadata` to emit `hreflang` links.
* Or rely on a helper that wires your locale routing into `<link rel="alternate" hreflang="...">`.

As long as each localized URL declares its alternates, you’re good.

---

### 2. Storing the user’s language (DB vs cookie)

> **“So does it make sense that if user visits the Turkish website store it in the database and show it Turkish version of the app?”**

Short answer: **yes, but DB should be a *secondary* source; cookie + URL are primary.**

Reasonable pattern:

1. **URL decides** what they see *right now* (`/tr/...` → Turkish).
2. **Locale cookie** (`NEXT_LOCALE` or your own) remembers preference on that device.
3. **User profile / DB**:

   * For signed-in users, you can store `preferredLocale` or similar.
   * On login, if the URL has no locale or they come from `/`, you can:

     * Redirect to `/<preferredLocale>/...`, or
     * Use DB value as fallback for middleware’s negotiation.

What I’d *avoid*:

* Forcing DB preference to override the URL. If the user explicitly goes to `/en/...` while their profile says `tr`, respect the URL.
* Tightly coupling locale logic to DB so that anonymous users get a worse experience.

**Best combo:**
URL > explicit language switch > cookie > DB > Accept-Language > default.

---

### 3. ICU Message Format (via `next-intl`)

> **“Use ICU Message Format… Never concatenate strings.”**

✅ 100% correct.

* `next-intl` uses ICU by default, which handles:

  * Plurals: `"{count, plural, one {# item} other {# items}}"`
  * Select/gender: `"{gender, select, male {...} female {...} other {...}}"`.
* Concatenating strings like `"Hello " + name + "!"` is how you get untranslatable or awkward phrases in other languages.
* Instead, always use variables + ICU in your message files.

You’re on the right track here.

---

### 4. Localize *everything*, not just text

> **“Dates, Numbers, Time Zones, Currencies using Intl API.”**

✅ Yes.

* **Dates/times**: `new Intl.DateTimeFormat(locale, options)` or `date-fns` with locale packs.
* **Numbers**: `new Intl.NumberFormat(locale, { style: 'decimal' | 'currency', ... })`.
* **Currencies**: ideally tied to business rules (e.g., user’s country or org currency), but formatting should still be locale-aware.
* **Time zones**:

  * At least display them in a way that makes sense (e.g., user’s local TZ vs a fixed “system” TZ).
  * Make labels and abbreviations localized.

You’re thinking about the right things here.

---

### 5. Decouple text from code

> **“Store all translatable strings in external message files… JSON per namespace/locale.”**

✅ This is crucial, especially if you ever:

* Hire translators, or
* Plug into a TMS (Lokalise, Phrase, POEditor, etc.).

Good patterns:

* Namespaces like `common`, `marketing`, `auth`, `errors`, `emails`.
* One folder per locale: `messages/en/*.json`, `messages/tr/*.json`.
* No “hidden strings” in code (components should use `t('key.path')`, not hardcoded sentences).

Your plan already reflects this, so you’re aligned.

---

### 6. Always provide a language switcher

> **“It must be clearly visible and accessible, giving the user control to override any automated detection.”**

Yes. ✅

* Auto-detection (Accept-Language, geo, etc.) is never perfect.
* A **clear, predictable switcher** (header or account menu) lets them:

  * Override detection.
  * Fix mistakes.
  * Try other languages easily.

Also:

* Make sure it updates:

  * The URL (`/en/...` ↔ `/tr/...`).
  * The locale cookie.
  * Optionally, the user’s stored preference in the DB (if logged in).

Accessibility niceties:

* Use clear labels: “English”, “Türkçe” (don’t use just flags; flags ≠ languages).
* Ensure keyboard focus works, and it’s not hidden in some obscure submenu on critical pages like sign-in.

---

### TL;DR

* **Yes, all those bullets are valid best practices.**
* **Storing “Turkish choice” in the database makes sense**, but:

  * Treat URL + cookie as primary, DB as a helpful fallback/persistence layer.
  * Don’t override explicit URL intent with DB preference.

If you want, I can sketch a tiny flow diagram for “how we pick locale” that uses: URL → switcher → cookie → DB → Accept-Language → default.
