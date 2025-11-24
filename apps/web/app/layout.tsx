import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"

import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://calsulenote.com"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Capsule Note — Letters to Your Future Self",
    template: "%s | Capsule Note",
  },
  description:
    "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
  openGraph: {
    title: "Capsule Note — Letters to Your Future Self",
    description:
      "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
    url: "/",
    siteName: "Capsule Note",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capsule Note — Letters to Your Future Self",
    description:
      "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0f172a",
  keywords: ["future self", "time capsule", "letters", "journaling", "reflection"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-mono">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
