import type { Metadata } from "next"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

/**
 * SEO Metadata Utility
 * Generates consistent, SEO-optimized metadata for all pages
 */

interface GenerateMetadataOptions {
  title: string
  description: string
  locale?: string
  path?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
  noIndex?: boolean
  image?: string
}

/**
 * Generate SEO-optimized metadata for a page
 */
export function generateSeoMetadata({
  title,
  description,
  locale = "en",
  path = "",
  type = "website",
  publishedTime,
  modifiedTime,
  keywords,
  noIndex = false,
  image,
}: GenerateMetadataOptions): Metadata {
  const url = `${appUrl}/${locale === "en" ? "" : locale + "/"}${path}`.replace(/\/$/, "")
  const canonicalUrl = `${appUrl}/${locale === "en" ? "" : locale + "/"}${path}`.replace(/\/$/, "")

  // Default OG image - use the Next.js generated opengraph-image route
  const ogImage = image || `${appUrl}/opengraph-image`

  const metadata: Metadata = {
    title,
    description,
    ...(keywords && { keywords }),
    ...(noIndex && { robots: "noindex, nofollow" }),

    openGraph: {
      title,
      description,
      type,
      url,
      siteName: "Capsule Note",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
      }),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },

    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${appUrl}/${path}`.replace(/\/$/, ""),
        tr: `${appUrl}/tr/${path}`.replace(/\/$/, ""),
        "x-default": `${appUrl}/${path}`.replace(/\/$/, ""),
      },
    },
  }

  return metadata
}

/**
 * Generate metadata for a hub page (templates, guides, prompts, blog)
 */
export function generateHubMetadata({
  hubName,
  locale = "en",
}: {
  hubName: "templates" | "guides" | "prompts" | "blog"
  locale?: string
}): Metadata {
  const hubData = {
    templates: {
      en: {
        title: "Letter Templates | Write to Your Future Self",
        description: "Free letter templates for writing to your future self. Templates for self-reflection, goal-setting, gratitude, relationships, and more.",
      },
      tr: {
        title: "Mektup Şablonları | Gelecekteki Kendine Yaz",
        description: "Gelecekteki kendine yazmak için ücretsiz mektup şablonları. Öz-düşünce, hedef belirleme, şükran, ilişkiler ve daha fazlası için şablonlar.",
      },
    },
    guides: {
      en: {
        title: "Guides | How to Write Letters to Your Future Self",
        description: "Expert guides on writing letters to your future self. Learn about time capsules, privacy, mental health benefits, and legacy letters.",
      },
      tr: {
        title: "Rehberler | Gelecekteki Kendine Mektup Nasıl Yazılır",
        description: "Gelecekteki kendine mektup yazma konusunda uzman rehberler. Zaman kapsülleri, gizlilik, ruh sağlığı faydaları ve miras mektupları hakkında bilgi edinin.",
      },
    },
    prompts: {
      en: {
        title: "Writing Prompts | Letters to Your Future Self",
        description: "Free writing prompts for letters to your future self. Explore themes like self-esteem, grief, graduation, sobriety, relationships, and more.",
      },
      tr: {
        title: "Yazma İpuçları | Gelecekteki Kendine Mektuplar",
        description: "Gelecekteki kendinize mektuplar için ücretsiz yazma ipuçları. Özsaygı, keder, mezuniyet, ayıklık, ilişkiler ve daha fazlası gibi temaları keşfedin.",
      },
    },
    blog: {
      en: {
        title: "Blog | Letters to Your Future Self",
        description: "Stories, tips, and inspiration for writing meaningful letters to your future self. Explore ideas for time capsule letters, legacy messages, and more.",
      },
      tr: {
        title: "Blog | Gelecekteki Kendine Mektuplar",
        description: "Gelecekteki kendinize anlamlı mektuplar yazmak için hikayeler, ipuçları ve ilham. Zaman kapsülü mektupları, miras mesajları ve daha fazlası için fikirler keşfedin.",
      },
    },
  }

  const data = hubData[hubName][locale === "tr" ? "tr" : "en"]

  return generateSeoMetadata({
    title: data.title,
    description: data.description,
    locale,
    path: hubName,
    type: "website",
  })
}

/**
 * Generate article metadata for blog posts and guides
 */
export function generateArticleMetadata({
  title,
  description,
  locale = "en",
  path,
  datePublished,
  dateModified,
  author = "Capsule Note Team",
}: {
  title: string
  description: string
  locale?: string
  path: string
  datePublished: string
  dateModified?: string
  author?: string
}): Metadata {
  return generateSeoMetadata({
    title: `${title} | Capsule Note`,
    description,
    locale,
    path,
    type: "article",
    publishedTime: datePublished,
    modifiedTime: dateModified,
  })
}

/**
 * Default SEO metadata for the app
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Capsule Note | Letters to Your Future Self",
    template: "%s | Capsule Note",
  },
  description: "Write heartfelt letters to your future self and schedule delivery via email or physical mail. Privacy-first, encrypted, and secure.",
  keywords: [
    "letter to future self",
    "time capsule letter",
    "email to future self",
    "FutureMe alternative",
    "self-reflection",
    "personal growth",
  ],
  authors: [{ name: "Capsule Note", url: appUrl }],
  creator: "Capsule Note",
  publisher: "Capsule Note",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Capsule Note",
    title: "Capsule Note | Letters to Your Future Self",
    description: "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
    images: [
      {
        url: `${appUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Capsule Note - Letters to Your Future Self",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capsule Note | Letters to Your Future Self",
    description: "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
    creator: "@capsulenote",
    images: [`${appUrl}/opengraph-image`],
  },
  alternates: {
    canonical: appUrl,
    languages: {
      en: appUrl,
      tr: `${appUrl}/tr`,
    },
  },
}
