import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

const content = {
  en: {
    tagline: "Write to your future self",
    headline: "Letters that arrive when they matter most.",
    description:
      "Encrypt your thoughts, schedule the moment, and let Capsule Note deliver the promise.",
    features: "Encrypted · Scheduled · Delivered",
  },
  tr: {
    tagline: "Gelecekteki kendine yaz",
    headline: "En önemli anlarda ulaşan mektuplar.",
    description:
      "Düşüncelerini şifrele, anı planla ve Capsule Note'un sözünü tutmasına izin ver.",
    features: "Şifreli · Planlanmış · Teslim Edildi",
  },
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = locale === "tr" ? content.tr : content.en

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #fef3c7 0%, #e0f2fe 50%, #d1fae5 100%)",
          color: "#0f172a",
          border: "12px solid #0f172a",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            fontSize: 28,
            letterSpacing: 2,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          <span>Capsule Note</span>
          <span style={{ fontSize: 18 }}>{t.tagline}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
          <p
            style={{
              fontSize: 54,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.1,
              maxWidth: 760,
            }}
          >
            {t.headline}
          </p>
          <p
            style={{
              marginTop: 20,
              fontSize: 26,
              maxWidth: 720,
              color: "#334155",
              lineHeight: 1.35,
            }}
          >
            {t.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <span>{t.features}</span>
          <span style={{ fontWeight: 700 }}>capsulenote.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
