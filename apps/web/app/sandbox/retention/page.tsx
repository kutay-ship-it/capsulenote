import Link from "next/link"
import { RetentionFeatures } from "@/components/sandbox/retention-features"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Retention & Engagement",
  description: "Streaks, seasonal campaigns, and collaborative capsules",
}

export default function SandboxRetentionPage() {
  return (
    <div className="space-y-10 py-8">
      <Card className="border-2 border-charcoal bg-white">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Retention Loops
              </CardTitle>
              <Badge variant="outline" className="border-2 border-charcoal font-mono text-xs uppercase">
                Vision Demo
              </Badge>
            </div>
            <CardDescription className="mt-2 max-w-2xl font-mono text-sm text-gray-secondary">
              Build writing habits with streaks, discover seasonal prompts, and create collaborative time capsules with
              friends and family.
            </CardDescription>
          </div>
          <Link href="/sandbox">
            <Button className="border-2 border-charcoal font-mono text-xs uppercase">Back to home</Button>
          </Link>
        </CardHeader>
      </Card>

      <RetentionFeatures />
    </div>
  )
}
