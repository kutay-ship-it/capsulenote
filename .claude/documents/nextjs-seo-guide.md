Here’s a full **Next.js App Router SEO playbook** you can hand to an “agent” (human or AI) to plan and implement SEO across projects.

All examples assume **Next.js 15/16 with the `/app` router**, using the latest Metadata, robots, sitemap, and JSON-LD guides from the official docs. ([Next.js][1])

---

## 0. How to think about SEO in a Next.js project

Your agent should think about SEO in **four layers**:

1. **Rendering & architecture** – use static or cached HTML where possible (SSG/ISR), keep routes fast and stable. ([Next.js][2])
2. **Metadata & crawling** – control titles, descriptions, OG/Twitter tags, canonicals, robots meta, `robots.txt`, and sitemaps with the Metadata APIs and file conventions. ([Next.js][1])
3. **Content & structure** – semantic HTML, clean URLs, internal links, i18n, accessibility. ([Next.js][3])
4. **UX, performance & analytics** – optimize Core Web Vitals, use `next/image` & `next/font`, monitor with web-vitals & analytics. ([Next.js][4])

The rest of this guide is “how to do each layer in Next.js”.

---

## 1. Global project setup (once per project)

### 1.1 Project assumptions

For a new or modern codebase, the agent should:

* Use **App Router** with an `/app` directory (this is the focus of current docs). ([Next.js][5])
* Use **TypeScript** and **ESLint** with the `core-web-vitals` config to catch perf issues that hurt SEO. ([Next.js][6])
* Host somewhere that supports **edge caching / CDN** (e.g. Vercel), so SSG/ISR benefits actually reach users.

### 1.2 Minimal `next.config` for SEO-friendly behavior

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep URLs consistent (or flip to true, but choose ONE and stick to it)
  trailingSlash: false, // or true, but never change after launch :contentReference[oaicite:7]{index=7}
  // Make sure TypeScript errors don’t ship to prod
  typescript: {
    ignoreBuildErrors: false, :contentReference[oaicite:8]{index=8}
  },
  // Turn on good lint rules by default
  eslint: {
    // lint during builds; relies on eslint-config-next/core-web-vitals
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

**Agent checklist – global config**

* [ ] Decide **trailing slash** policy and keep it stable.
* [ ] Ensure ESLint with `eslint-config-next/core-web-vitals` is active. ([Next.js][7])
* [ ] Confirm deployment supports **HTTPS**, compression, and caching headers.

---

## 2. Metadata strategy with the Metadata API

Next.js has a built-in **Metadata API** for titles, descriptions, OG tags, Twitter cards, robots meta, alternates, etc. You define it as:

* Static `export const metadata: Metadata = {...}` or
* Dynamic `export async function generateMetadata(...)` returning a `Metadata` object. ([Next.js][1])

### 2.1 Site-wide defaults in `app/layout.tsx`

Create strong global defaults once and override per-page when needed.

```ts
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), // base for relative URLs :contentReference[oaicite:11]{index=11}
  title: {
    default: "Example SaaS",
    template: "%s | Example SaaS",
  },
  description: "Example SaaS helps teams ship better projects.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Example SaaS",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@example",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/", // default canonical for homepage
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Best practices**

* Define a **title template** like `"%s | Brand"` so every page gets consistent branding. ([Next.js][8])
* Set `metadataBase` and use **relative URLs** in page metadata – this prevents URL mistakes across environments. ([Next.js][8])
* Set `robots.index/follow` defaults to `true`; override only on pages that should be blocked.

### 2.2 Page-level static metadata

For simple static pages:

```ts
// app/pricing/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing for Example SaaS plans.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    type: "website",
  },
};

export default function PricingPage() {
  return <main>...</main>;
}
```

### 2.3 Dynamic metadata with `generateMetadata`

Use `generateMetadata` when title/description depend on data (blog posts, products, docs, etc.). ([Next.js][8])

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/posts";

type PageProps = { params: { slug: string } };

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }

  const url = `/blog/${post.slug}`;

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: post.ogTitle ?? post.title,
      description: post.ogDescription ?? post.excerpt,
      publishedTime: post.publishedAt,
      authors: post.authors,
      images: post.ogImage
        ? [{ url: post.ogImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitterTitle ?? post.title,
      description: post.twitterDescription ?? post.excerpt,
      images: post.twitterImage ? [post.twitterImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  // render or 404
}
```

**Agent checklist – per-page metadata**

For every new route, ensure:

* [ ] **Title** (unique, descriptive, < ~60 chars).
* [ ] **Description** (~110–160 chars, matches on-page content).
* [ ] **Canonical** (`alternates.canonical`) set correctly.
* [ ] **Open Graph & Twitter** filled for shareable pages (blog, marketing, product). ([Next.js][8])
* [ ] Use `robots: { index: false, follow: false }` for soft-404s, thank-you pages, or internal tools.

---

## 3. Crawling & indexing: robots meta, robots.txt, sitemap

Search engines need **clear signals** about what to crawl and index.

### 3.1 robots meta tags

Use the metadata `robots` field for page-level rules. ([Next.js][8])

Examples:

```ts
// app/admin/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};
```

For “noindex but follow links” pages:

```ts
robots: {
  index: false,
  follow: true,
}
```

### 3.2 `robots.txt` with file conventions

Next.js lets you define `robots.txt` as a static file or with code. ([Next.js][9])

**Static example (simple sites):**

```txt
// app/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

**Dynamic example (recommended for larger projects):**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin/", "/internal/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

You can also customize per-bot rules (e.g. stricter rules for certain crawlers). ([Next.js][9])

### 3.3 `sitemap.xml` for discoverability

Use the `sitemap.(xml|js|ts)` file convention under `/app` to generate sitemaps. ([Next.js][10])

**Programmatic sitemap example:**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPosts, getAllDocs } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://example.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/pricing",
    "/about",
    "/blog",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const posts = await getAllPosts();   // returns { slug, updatedAt }
  const docs = await getAllDocs();     // returns { slug, updatedAt }

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
    ...docs.map((doc) => ({
      url: `${baseUrl}/docs/${doc.slug}`,
      lastModified: doc.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
```

**Agent checklist – crawling**

* [ ] `robots.txt` exists and points to the main sitemap.
* [ ] All indexable routes are in at least one sitemap (or discoverable via links).
* [ ] Sensitive or junk routes are either **noindexed** or **disallowed**, but **don’t** block CSS/JS assets. ([Next.js][11])

---

## 4. URL structure & routing

Good URLs improve rankings and click-through rates and are easy in Next.js because of **file-system routing**. ([Next.js][3])

**Guidelines:**

* **Semantic**: prefer `/blog/how-to-use-nextjs-metadata` over `/blog/post-123`.
* **Consistent patterns**: group resources under folders:

  * `/blog/[slug]`
  * `/products/[category]/[slug]`
* **Avoid parameter-only URLs** in public navigation (`?id=123` links). It’s fine for filters/search, but not core pages. ([Next.js][3])
* **Stable**: avoid changing URL structures after indexing; if you must, use 301 redirects via `next.config`. ([Next.js][12])

Example App Router structure:

```txt
app/
  layout.tsx
  page.tsx               -> /
  pricing/
    page.tsx             -> /pricing
  blog/
    page.tsx             -> /blog
    [slug]/
      page.tsx           -> /blog/my-first-post
  products/
    [category]/
      [slug]/
        page.tsx         -> /products/analytics/starter
```

For internal navigation, always use `<Link>` so Next.js can prefetch & provide fast client transitions. ([Next.js][13])

```tsx
import Link from "next/link";

<Link href="/blog">View the blog</Link>
```

---

## 5. Internationalization (if multi-language)

If you have multiple locales, Next.js supports **internationalized routing** and you should pair it with alternates/hreflang in metadata and localized sitemaps. ([Next.js][14])

High-level:

* Configure locales in `next.config`.
* Use locale segments in routes, e.g. `/en/blog/...`, `/de/blog/...` or domain-based routing.
* Use `alternates.languages` in `metadata` to emit hreflang. ([Next.js][8])
* Generate locale-aware sitemaps with `MetadataRoute.Sitemap` and the `images`/`alternates` support if needed. ([Next.js][10])

Example (simplified):

```ts
// in a localized page
export const metadata: Metadata = {
  title: "Pricing",
  alternates: {
    canonical: "/en/pricing",
    languages: {
      "en": "/en/pricing",
      "de": "/de/preise",
    },
  },
};
```

---

## 6. Social sharing: OG & Twitter images

Next.js gives you **two ways** to handle OG/Twitter images: ([Next.js][1])

1. Via fields in `metadata.openGraph` and `metadata.twitter` (for external images).
2. Via **file-based metadata** `opengraph-image` / `twitter-image` (static or generated). ([Next.js][15])

### 6.1 Simple OG image via `metadata`

```ts
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: "https://example.com/og/home.png",
        width: 1200,
        height: 630,
        alt: "Example SaaS home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://example.com/og/home.png"],
  },
};
```

### 6.2 Static OG image file

Place an image file next to the route, and Next.js sets all the right `<meta>` tags. ([Next.js][15])

```txt
app/
  opengraph-image.png        -> default OG image
  blog/
    opengraph-image.png      -> OG image for /blog
```

### 6.3 Dynamic OG images per post

Use an `opengraph-image.tsx` route with `ImageResponse` for data-driven OG images. ([Next.js][1])

```ts
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#050816",
          color: "white",
          padding: "80px",
          alignItems: "flex-end",
          fontSize: 64,
        }}
      >
        {post?.title ?? "Blog"}
      </div>
    )
  );
}
```

---

## 7. Structured data (JSON-LD) for rich results

For structured data, Next.js recommends adding **JSON-LD via a `<script>` tag** in your page or layout. ([Next.js][16])

### 7.1 Product page JSON-LD example

```tsx
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/products";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  return {
    title: product.seoTitle ?? product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* ...rest of page... */}
    </main>
  );
}
```

**Security note:** sanitize any user-generated content in JSON-LD (at minimum, replace `<` as shown above). ([Next.js][16])

**Agent checklist – structured data**

For key page types, define JSON-LD templates:

* [ ] Articles / blog posts – `Article` or `BlogPosting`
* [ ] Product pages – `Product` + `Offer`
* [ ] Organization / homepage – `Organization`
* [ ] Events – `Event`
* [ ] FAQ pages – `FAQPage`

Validate with Google’s Rich Results Test or Schema Markup Validator. ([Next.js][16])

---

## 8. Performance & Core Web Vitals

SEO is increasingly tied to **performance & UX**. Next.js ships many optimizations by default (server components, code splitting, prefetching, static rendering). ([Next.js][4])

### 8.1 Use built-in optimized components

* `<Image>` for responsive, lazy-loaded images with proper sizes. ([Next.js][17])
* `<Link>` for client navigation & prefetching. ([Next.js][13])
* `<Script>` with `strategy="lazyOnload"` or `afterInteractive"` for 3rd-party scripts. ([Next.js][17])
* `next/font` for automatic font optimization. ([Next.js][6])

### 8.2 Choose the right rendering strategy

From the SEO course:

* **SSG / static rendering** is usually best for SEO and performance.
* **SSR / dynamic rendering** is fine when content truly changes per request. ([Next.js][2])

With App Router, this is controlled mostly by:

* Using `fetch` with good caching & revalidation settings.
* Avoiding Dynamic APIs (like `cookies`, `headers`) in static routes. ([Next.js][6])

### 8.3 Measure Core Web Vitals

Use either:

* **Vercel Speed Insights / Analytics**, or
* `useReportWebVitals` + custom analytics, and `webVitalsAttribution` for debugging. ([Next.js][18])

```ts
// app/_app.tsx (Pages router) or a client entry in App Router world
import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // send to your analytics
    console.log(metric);
  });
  return null;
}
```

And in `next.config`:

```ts
// Enable attribution to debug CLS/LCP sources :contentReference[oaicite:43]{index=43}
const nextConfig = {
  experimental: {
    webVitalsAttribution: ["LCP", "CLS"],
  },
};
```

**Agent checklist – performance**

* [ ] All images use `next/image` or an equivalent optimization.
* [ ] Large scripts (chat widgets, analytics, trackers) are **deferred** or lazily loaded.
* [ ] Run Lighthouse or PageSpeed Insights on key templates before launch. ([Next.js][19])

---

## 9. Analytics & search tools

For ongoing SEO work, the agent should ensure:

* [ ] **Google Search Console** is configured and verified (use `verification` metadata or HTML file). ([Next.js][8])
* [ ] Analytics solution is wired up (Vercel Analytics, GA4, etc.) using the Analytics or Scripts guide. ([Next.js][18])
* [ ] 404 and 500 pages are customized and return correct status codes (`notFound()`, error boundary). ([Next.js][19])

---

## 10. “Agent playbook” – checklists & workflows

Here’s a **practical set of routines** an agent can follow.

### 10.1 When designing a new section (e.g. Docs, Blog, Products)

1. **Define URL schema**

   * Decide folder structure in `/app` (e.g. `/docs/[slug]`, `/blog/[slug]`).
   * Decide canonical patterns (no trailing slash vs trailing slash, no random IDs).

2. **Define page types**

   * Index page (`/blog`, `/docs`) vs detail pages vs listing filters.
   * Which should be **indexable**, which should be **noindex** (e.g. internal search, filters).

3. **Add metadata strategy**

   * Global defaults in `app/layout.tsx`.
   * Route-specific `metadata` or `generateMetadata`.
   * OG/Twitter image strategy (static per section vs dynamic per item).

4. **Wire sitemaps**

   * Add new routes to `app/sitemap.ts`.
   * For large sets, consider splitting per section using `generateSitemaps` if you outgrow one file. ([Next.js][20])

5. **Plan structured data**

   * Choose schema type (`Article`, `FAQPage`, `Product`, etc.).
   * Implement JSON-LD templates per page type.

### 10.2 When creating **a new page** (micro-checklist)

For any new page (e.g. `/features/x`):

* [ ] Define `title`, `description`, `canonical`.
* [ ] Ensure H1 and main content match the intent of the target query.
* [ ] Add OG/Twitter image or ensure parent OG image applies.
* [ ] Add internal links **to** and **from** relevant pages.
* [ ] Decide if it’s indexable; if not, set `robots.index = false`.
* [ ] If important, add a JSON-LD block (FAQ, HowTo, Product, etc.).

### 10.3 Pre-launch checklist for a project

Borrowing from the production checklists & SEO course: ([Next.js][4])

* [ ] Metadata:

  * All key routes (home, pricing, top 50+ pages) have non-default metadata.
  * No placeholder content (`Lorem ipsum`, `My page title`).
* [ ] Crawling:

  * `robots.txt` exists; staging environment is blocked, production is not.
  * `sitemap.xml` resolves and contains key routes.
* [ ] URLs:

  * No duplicate content at multiple paths (use redirects or canonicals).
  * Trailing slash and casing conventions are consistent.
* [ ] Performance:

  * Core Web Vitals are green (LCP, CLS, INP where available).
  * Largest images and fonts are optimized.
* [ ] Analytics:

  * Search Console + analytics configured and receiving data.
* [ ] Accessibility:

  * Lighthouse accessibility score is acceptable (helps SEO and UX).

---

## 11. If you still have a legacy Pages Router

If part of the project still uses `/pages`:

* Use `<Head>` component for metadata, or migrate to the Metadata API via the App Router as recommended. ([Next.js][21])
* Rendering strategies (`getStaticProps`, `getServerSideProps`) still follow the same SEO principles: prefer static when you can. ([Next.js][2])
* Over time, plan to **migrate pages into `/app`** to use the newer SEO primitives (Metadata, special metadata files, JSON-LD guide, etc.).

---

If you tell me a bit about your specific project (SaaS, content site, e-commerce, multi-tenant, etc.), I can turn this into a **project-specific template** with concrete field lists and naming conventions for your agent to follow.

[1]: https://nextjs.org/docs/app/getting-started/metadata-and-og-images?utm_source=chatgpt.com "Getting Started: Metadata and OG images"
[2]: https://nextjs.org/learn/seo/rendering-strategies?utm_source=chatgpt.com "Rendering Strategies - SEO"
[3]: https://nextjs.org/learn/seo/url-structure?utm_source=chatgpt.com "SEO: URL Structure"
[4]: https://nextjs.org/docs/app/guides/production-checklist?utm_source=chatgpt.com "Guides: Production"
[5]: https://nextjs.org/docs/app/api-reference/config/next-config-js/appDir?utm_source=chatgpt.com "appDir - next.config.js"
[6]: https://nextjs.org/docs/llms-full.txt?utm_source=chatgpt.com "llms-full.txt"
[7]: https://nextjs.org/docs/pages/api-reference/config/eslint?utm_source=chatgpt.com "Configuration: ESLint"
[8]: https://nextjs.org/docs/app/api-reference/functions/generate-metadata "Functions: generateMetadata | Next.js"
[9]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots "Metadata Files: robots.txt | Next.js"
[10]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap "Metadata Files: sitemap.xml | Next.js"
[11]: https://nextjs.org/learn/seo/robots-txt?utm_source=chatgpt.com "SEO: What is a robots.txt File?"
[12]: https://nextjs.org/docs/pages/api-reference/config/next-config-js/rewrites?utm_source=chatgpt.com "next.config.js Options: rewrites"
[13]: https://nextjs.org/docs/app/getting-started/linking-and-navigating?utm_source=chatgpt.com "Getting Started: Linking and Navigating"
[14]: https://nextjs.org/docs/pages/guides/internationalization?utm_source=chatgpt.com "Guides: Internationalization"
[15]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image?utm_source=chatgpt.com "opengraph-image and twitter-image - Metadata Files"
[16]: https://nextjs.org/docs/app/guides/json-ld?utm_source=chatgpt.com "Guides: JSON-LD"
[17]: https://nextjs.org/docs/14/app/building-your-application/optimizing?utm_source=chatgpt.com "Building Your Application: Optimizing"
[18]: https://nextjs.org/docs/pages/guides/analytics?utm_source=chatgpt.com "Guides: Analytics"
[19]: https://nextjs.org/docs/13/pages/building-your-application/deploying/production-checklist?utm_source=chatgpt.com "Deploying: Going to Production"
[20]: https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps?utm_source=chatgpt.com "Functions: generateSitemaps"
[21]: https://nextjs.org/docs/app/guides/migrating/app-router-migration?utm_source=chatgpt.com "Migrating: App Router"
