import { Link } from "@/i18n/routing"
import { EntitlementUpsellPrototype } from "@/components/sandbox/entitlement-upsell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sandbox · Entitlements",
  description: "Mock upgrade + scheduling guard experience.",
}

export default function SandboxEntitlementsPage() {
  return (
    <div className="space-y-10 py-8">
      <Card className="border-2 border-charcoal bg-white">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-mono text-3xl uppercase tracking-tight text-charcoal">Entitlement guard</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary max-w-2xl">
              Toggle plan states, attempt scheduling, and trigger the upgrade dialog—all without touching Stripe.
            </CardDescription>
          </div>
          <Link href="/sandbox/schedule">
            <Button className="border-2 border-charcoal font-mono text-xs uppercase">Try wizard</Button>
          </Link>
        </CardHeader>
        <CardContent className="font-mono text-xs uppercase text-gray-secondary">
          This mirrors <code>sandbox/entitlement_alignment.md</code>. Use it to preview copy and reliability fallbacks.
        </CardContent>
      </Card>

      <EntitlementUpsellPrototype />
    </div>
  )
}
