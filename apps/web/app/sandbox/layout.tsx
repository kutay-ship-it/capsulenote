import type { ReactNode } from "react"
import { SandboxExperienceProvider } from "@/components/sandbox/experience-context"
import { SandboxNav } from "@/components/sandbox/sandbox-nav"

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return (
    <SandboxExperienceProvider>
      <div className="min-h-screen bg-cream text-charcoal">
        <SandboxNav />
        <main className="container space-y-10 py-10">{children}</main>
      </div>
    </SandboxExperienceProvider>
  )
}
