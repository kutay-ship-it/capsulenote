import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SandboxExperienceProvider } from "@/components/sandbox/experience-context"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return <SandboxExperienceProvider>{children}</SandboxExperienceProvider>
}
