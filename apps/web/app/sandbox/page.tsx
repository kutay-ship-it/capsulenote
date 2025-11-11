import Link from "next/link"
import { CinematicHero } from "@/components/sandbox/cinematic-hero"
import { MiniDemoLoop } from "@/components/sandbox/mini-demo-loop"
import { EnhancedEditor } from "@/components/sandbox/enhanced-editor"
import { TrustVisualization } from "@/components/sandbox/trust-visualization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "DearMe · Write to your future self",
  description: "Letters delivered exactly when they should arrive. Time capsule for the soul.",
}

const featurePillars = [
  {
    title: "Guided writing rituals",
    description: "Tone sliders, prompt packs, and mood cues keep words flowing.",
  },
  {
    title: "Trustworthy vault",
    description: "AES-256-GCM encryption, audit logging, and Clerk-powered auth.",
  },
  {
    title: "Dependable delivery",
    description: "Inngest timelines, retries, and premium mail concierge built in.",
  },
]

export default function SandboxPage() {
  return (
    <div className="space-y-20 pb-16 pt-10">
      <CinematicHero />

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            See it in action
          </Badge>
          <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">How it works</h2>
        </div>
        <MiniDemoLoop />
      </section>

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Try it now
          </Badge>
          <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">Start writing</h2>
          <p className="mx-auto mt-2 max-w-2xl font-mono text-sm text-gray-secondary">
            No signup required. Your draft stays encrypted on your device until you're ready.
          </p>
        </div>
        <EnhancedEditor />
      </section>

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="space-y-8">
        <TrustVisualization />
      </section>

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Core features
          </Badge>
          <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">Built for trust</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featurePillars.map((feature) => (
            <Card key={feature.title} className="border-2 border-charcoal bg-white">
              <CardHeader>
                <CardTitle className="font-mono text-lg uppercase tracking-wide">{feature.title}</CardTitle>
                <CardDescription className="font-mono text-sm text-gray-secondary">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-2 border-charcoal bg-bg-yellow-pale">
          <CardHeader>
            <Badge variant="secondary" className="w-fit uppercase tracking-wide text-xs">
              Billing
            </Badge>
            <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">Pay only when delivered</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              No upfront commitment. Billing happens only after your letter reaches you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-2 border-charcoal bg-white p-4">
                <p className="font-mono text-sm font-bold uppercase text-charcoal">Free tier</p>
                <p className="mt-1 font-mono text-xs text-gray-secondary">Draft locally, schedule one email delivery. Perfect for trying the experience.</p>
              </div>
              <div className="border-2 border-charcoal bg-white p-4">
                <p className="font-mono text-sm font-bold uppercase text-charcoal">Pro tier · $3/delivery</p>
                <p className="mt-1 font-mono text-xs text-gray-secondary">Unlimited scheduling, physical mail, priority support, workflow monitoring.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-charcoal bg-bg-purple-light">
          <CardHeader>
            <CardTitle className="font-mono text-lg uppercase tracking-wide">Explore features</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">All pages powered by local sandbox state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Dashboard & coach", href: "/sandbox/dashboard" },
              { title: "Scheduling wizard", href: "/sandbox/schedule" },
              { title: "Plans & billing", href: "/sandbox/entitlements" },
              { title: "Reflection journal", href: "/sandbox/aftercare" },
              { title: "Streaks & campaigns", href: "/sandbox/retention" },
            ].map((link) => (
              <div key={link.href} className="flex items-center justify-between border-2 border-charcoal bg-white p-3">
                <div>
                  <p className="font-mono text-sm uppercase text-charcoal">{link.title}</p>
                  <p className="font-mono text-xs text-gray-secondary">Try feature</p>
                </div>
                <Link href={link.href}>
                  <Button variant="outline" className="border-2 border-charcoal font-mono text-[10px] uppercase">
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Separator className="border-2 border-dashed border-charcoal" />

      <section className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Ready when you are
          </Badge>
          <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">Start your first letter</h2>
          <p className="mx-auto mt-2 max-w-2xl font-mono text-sm text-gray-secondary">
            No signup required. Draft stays encrypted on your device until you&apos;re ready to schedule.
          </p>
        </div>
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <Link href="/sandbox" className="w-full">
            <Button className="w-full border-2 border-charcoal font-mono text-xs uppercase">
              Continue writing in sanctuary
            </Button>
          </Link>
          <Link href="/sandbox/dashboard" className="w-full">
            <Button variant="outline" className="w-full border-2 border-charcoal font-mono text-xs uppercase">
              Explore dashboard
            </Button>
          </Link>
          <Link href="/sign-up" className="w-full">
            <Button variant="outline" className="w-full border-2 border-charcoal font-mono text-xs uppercase">
              Create encrypted vault
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
