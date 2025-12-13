const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com"

/**
 * Helper to render JSON-LD script tag
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * WebSite schema for sitelinks search box and site info
 */
export function WebsiteSchema({ locale = "en" }: { locale?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Capsule Note",
    alternateName:
      locale === "tr"
        ? "Gelecekteki Kendine Mektuplar"
        : "Letters to Your Future Self",
    url: appUrl,
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    description:
      locale === "tr"
        ? "Gelecekteki kendine içten mektuplar yaz ve bunları e-posta ya da fiziksel posta ile planla."
        : "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
  }

  return <JsonLd data={data} />
}

/**
 * Organization schema for knowledge panel
 */
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Capsule Note",
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    sameAs: [
      "https://twitter.com/capsulenote",
      "https://github.com/capsulenote",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@capsulenote.com",
      availableLanguage: ["English", "Turkish"],
    },
  }

  return <JsonLd data={data} />
}

/**
 * FAQ schema for rich snippets
 */
export function FAQSchema({
  items,
}: {
  items: Array<{ question: string; answer: string }>
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return <JsonLd data={data} />
}

/**
 * BreadcrumbList schema for breadcrumb rich results
 */
export function BreadcrumbSchema({
  items,
  locale = "en",
}: {
  items: Array<{ name: string; href: string }>
  locale?: string
}) {
  const baseUrl = locale === "en" ? appUrl : `${appUrl}/${locale}`

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}`,
    })),
  }

  return <JsonLd data={data} />
}
