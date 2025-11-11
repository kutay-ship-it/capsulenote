import { DashboardChecklistCoachPrototype } from "@/components/sandbox/dashboard-checklist-coach"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Sandbox · Dashboard",
  description: "Checklist and coach prototype with shared sandbox state.",
}

export default function SandboxDashboardPage() {
  return (
    <div className="space-y-10 py-8">
      <Card className="border-2 border-charcoal bg-white">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">Dashboard prototype</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary max-w-2xl">
              This page consumes the letter/delivery state created on the home page. Use it to experience the guided onboarding + coach
              combo described in the sandbox documents.
            </CardDescription>
          </div>
          <Link href="/sandbox">
            <Button className="border-2 border-charcoal font-mono text-xs uppercase">Back to hero</Button>
          </Link>
        </CardHeader>
      </Card>

      <DashboardChecklistCoachPrototype />
    </div>
  )
}
