import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OgImage() {
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
          <span style={{ fontSize: 18 }}>Write to your future self</span>
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
            Letters that arrive when they matter most.
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
            Encrypt your thoughts, schedule the moment, and let Capsule Note deliver the promise.
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
          <span>Encrypted · Scheduled · Delivered</span>
          <span style={{ fontWeight: 700 }}>capsulenote.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
