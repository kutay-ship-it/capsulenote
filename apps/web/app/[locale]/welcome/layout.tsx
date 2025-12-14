import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Welcome | Capsule Note",
  robots: {
    index: false,
    follow: false,
  },
}

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
