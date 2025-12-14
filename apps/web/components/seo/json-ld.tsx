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
 * SoftwareApplication schema for product entity in search
 */
export function SoftwareApplicationSchema({ locale = "en" }: { locale?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Capsule Note",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: locale === "tr"
        ? "Ücretsiz başlayın, premium özellikler için yükseltin"
        : "Start free, upgrade for premium features",
    },
    // Note: aggregateRating removed - only include when real verified ratings exist
    // Adding fake ratings can trigger Google structured data penalties
    description: locale === "tr"
      ? "Gelecekteki kendine mektuplar yaz ve e-posta veya fiziksel posta ile gönder."
      : "Write letters to your future self and deliver via email or physical mail.",
    url: appUrl,
    screenshot: `${appUrl}/og-image.png`,
    featureList: locale === "tr"
      ? ["Zamanlanmış e-posta teslimatı", "Fiziksel mektup gönderimi", "Uçtan uca şifreleme", "Çoklu dil desteği"]
      : ["Scheduled email delivery", "Physical letter delivery", "End-to-end encryption", "Multi-language support"],
  }

  return <JsonLd data={data} />
}

/**
 * Product schema for pricing page
 */
export function ProductSchema({
  locale = "en",
  plan,
}: {
  locale?: string
  plan: {
    name: string
    description: string
    price: string
    currency: string
    features: string[]
  }
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: plan.description,
    brand: {
      "@type": "Brand",
      name: "Capsule Note",
    },
    offers: {
      "@type": "Offer",
      price: plan.price,
      priceCurrency: plan.currency,
      availability: "https://schema.org/InStock",
      url: `${appUrl}/${locale === "en" ? "" : locale + "/"}pricing`,
    },
  }

  return <JsonLd data={data} />
}

/**
 * HowTo schema for template and guide pages
 */
export function HowToSchema({
  locale = "en",
  title,
  description,
  steps,
  totalTime,
}: {
  locale?: string
  title: string
  description: string
  steps: Array<{ name: string; text: string; image?: string }>
  totalTime?: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  }

  return <JsonLd data={data} />
}

/**
 * Article schema for blog posts
 */
export function ArticleSchema({
  locale = "en",
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  image,
  url,
}: {
  locale?: string
  title: string
  description: string
  datePublished: string
  dateModified?: string
  authorName: string
  image?: string
  url: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    datePublished,
    ...(dateModified && { dateModified }),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Capsule Note",
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/icon.png`,
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }

  return <JsonLd data={data} />
}

/**
 * ItemList schema for hub pages (templates, guides, prompts, blog)
 */
export function ItemListSchema({
  locale = "en",
  name,
  description,
  items,
}: {
  locale?: string
  name: string
  description: string
  items: Array<{ name: string; url: string; position: number }>
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }

  return <JsonLd data={data} />
}

/**
 * WebSite schema for sitelinks search box and site info
 */
export function WebsiteSchema({ locale = "en" }: { locale?: string }) {
  const baseUrl = locale === "en" ? appUrl : `${appUrl}/${locale}`

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
    // SearchAction for Google Sitelinks Search Box
    // Note: Requires site search functionality to be implemented
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return <JsonLd data={data} />
}

/**
 * Organization schema for knowledge panel
 * Note: sameAs links should only include verified social profiles that exist
 */
export function OrganizationSchema() {
  // Only include social profiles that actually exist and are verified
  // Update this array when social profiles are created
  const verifiedSocialProfiles: string[] = []

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Capsule Note",
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    ...(verifiedSocialProfiles.length > 0 && { sameAs: verifiedSocialProfiles }),
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
