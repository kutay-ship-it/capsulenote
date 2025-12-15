import type { MetadataRoute } from "next"

const content = {
  en: {
    name: "Capsule Note — Letters to Your Future Self",
    short_name: "Capsule Note",
    description:
      "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
  },
  tr: {
    name: "Capsule Note — Gelecekteki Kendine Mektuplar",
    short_name: "Capsule Note",
    description:
      "Gelecekteki kendine içten mektuplar yaz ve bunları e-posta ya da fiziksel posta ile planla.",
  },
}

export default async function manifest({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<MetadataRoute.Manifest> {
  const { locale } = await params
  const t = locale === "tr" ? content.tr : content.en

  return {
    name: t.name,
    short_name: t.short_name,
    description: t.description,
    start_url: locale === "en" ? "/" : `/${locale}`,
    scope: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    lang: locale,
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
