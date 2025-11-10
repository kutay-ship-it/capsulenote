import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"

import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "DearMe — Letters to Your Future Self",
  description:
    "Write heartfelt letters to your future self and schedule delivery via email or physical mail.",
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
