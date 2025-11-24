import { Link } from "@/i18n/routing"
import { ReflectionJournal } from "@/components/sandbox/reflection-journal"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Aftercare & Reflections",
  description: "Capture how your past words landed in your present moment",
}

export default function SandboxAftercarePage() {
  return (
    <div className="space-y-10 py-8">
      <Card className="border-2 border-charcoal bg-white">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Delivery Aftercare
              </CardTitle>
              <Badge variant="outline" className="border-2 border-charcoal font-mono text-xs uppercase">
                Vision Demo
              </Badge>
            </div>
            <CardDescription className="mt-2 max-w-2xl font-mono text-sm text-gray-secondary">
              After a delivery arrives, reflect on how your past words land. This creates a complete loop: write →
              schedule → receive → reflect → write again.
            </CardDescription>
          </div>
          <Link href="/sandbox">
            <Button className="border-2 border-charcoal font-mono text-xs uppercase">Back to home</Button>
          </Link>
        </CardHeader>
      </Card>

      <ReflectionJournal />
    </div>
  )
}
