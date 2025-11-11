import Link from "next/link"
import { ScheduleWizardPrototype } from "@/components/sandbox/schedule-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sandbox · Schedule Wizard",
  description: "Mocked Recipient → Timing → Review flow with shared state.",
}

export default function SandboxSchedulePage() {
  return (
    <div className="space-y-10 py-8">
      <Card className="border-2 border-charcoal bg-white">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">Scheduling wizard</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary max-w-2xl">
              Letters saved from the hero feed this wizard. Each step is mocked—no API—but state persists via the sandbox experience.
            </CardDescription>
          </div>
          <Link href="/sandbox/dashboard">
            <Button className="border-2 border-charcoal font-mono text-xs uppercase">View checklist</Button>
          </Link>
        </CardHeader>
        <CardContent className="font-mono text-xs uppercase text-gray-secondary">
          Tip: schedule a delivery here, then head back to the dashboard to see the coach react.
        </CardContent>
      </Card>

      <ScheduleWizardPrototype />
    </div>
  )
}
