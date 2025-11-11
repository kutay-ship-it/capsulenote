"use client"

import { useMemo, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ShieldCheck, Zap } from "lucide-react"
import { useSandboxExperience } from "@/components/sandbox/experience-context"

const channels = [
  { id: "email", label: "Email delivery", requiresPro: false },
  { id: "mail", label: "Premium mail", requiresPro: true },
  { id: "combo", label: "Email + Mail combo", requiresPro: true },
] as const

const planBenefits = ["Unlimited scheduling", "SLO-backed monitoring", "Premium mail concierge", "Priority support channel"]

export function EntitlementUpsellPrototype() {
  const {
    state: { plan, letters, heroDraft },
    setPlan,
    scheduleDelivery,
  } = useSandboxExperience()
  const [selectedChannel, setSelectedChannel] = useState<(typeof channels)[number]["id"]>("email")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const requiresUpgrade = useMemo(() => {
    const channel = channels.find((c) => c.id === selectedChannel)
    return plan === "free" && channel?.requiresPro
  }, [plan, selectedChannel])

  const handleAttemptSchedule = () => {
    if (requiresUpgrade) {
      setDialogOpen(true)
      setStatusMessage("Upgrade required to unlock premium mail routes.")
      return
    }

    const letterTitle = letters[0]?.title || heroDraft.title || "Untitled letter"
    scheduleDelivery({
      letterTitle,
      channel: selectedChannel,
      deliverAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      timezone: "America/New_York",
    })
    setStatusMessage(`Mock success: scheduled "${letterTitle}" via ${selectedChannel}.`)
  }

  const handleUpgrade = () => {
    setPlan("pro")
    setDialogOpen(false)
    setStatusMessage("Plan upgraded · premium channels unlocked.")
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-charcoal">
        <CardHeader>
          <CardTitle className="font-mono text-lg uppercase tracking-wide">Entitlement guard prototype</CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">
            Mirrors the alignment doc in <span className="font-semibold">sandbox/entitlement_alignment.md</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Badge className="border-2 border-charcoal bg-white font-mono text-xs uppercase">Current plan: {plan}</Badge>
            <Badge variant="secondary" className="border border-charcoal font-mono text-xs uppercase">
              Letters saved: {letters.length}
            </Badge>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs uppercase text-gray-secondary">Choose channel</p>
            <div className="grid gap-2 md:grid-cols-3">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={cn(
                    "rounded-sm border-2 border-charcoal p-4 text-left transition hover:-translate-y-0.5",
                    selectedChannel === channel.id ? "bg-bg-green-light" : "bg-white"
                  )}
                >
                  <p className="font-mono text-sm uppercase text-charcoal">{channel.label}</p>
                  {channel.requiresPro ? (
                    <span className="text-xs font-mono text-coral">Requires Pro</span>
                  ) : (
                    <span className="text-xs font-mono text-gray-secondary">Included</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleAttemptSchedule} className="w-full border-2 border-charcoal font-mono text-xs uppercase">
            Attempt to schedule
          </Button>
          {statusMessage && (
            <p className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-3 text-xs font-mono text-charcoal">
              {statusMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-charcoal bg-bg-blue-light/70">
        <CardHeader>
          <CardTitle className="font-mono text-lg uppercase tracking-wide">Pro upgrade modal</CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">
            Triggered when server action would throw <code>PAYMENT_REQUIRED</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {planBenefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 font-mono text-sm text-charcoal">
              <ShieldCheck className="h-4 w-4 text-charcoal" />
              {benefit}
            </div>
          ))}
          <Button className="border-2 border-charcoal font-mono text-xs uppercase" onClick={() => setPlan(plan === "pro" ? "free" : "pro")}>
            Toggle plan (for demo)
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="border-2 border-charcoal bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-lg uppercase text-charcoal">Upgrade to schedule</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm text-gray-secondary">
              Premium mail routes unlock with Pro. Upgrades are instant, and deliveries remain reliable even during billing blips.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-4">
            <div className="flex items-center gap-2 text-sm font-mono text-charcoal">
              <Zap className="h-4 w-4 text-coral" />
              Why upgrade?
            </div>
            <ul className="list-disc pl-6 text-xs font-mono text-gray-secondary">
              <li>SLO-backed monitoring + idempotent retries</li>
              <li>Premium mail concierge & arrival tracking</li>
              <li>Priority support with real-time alerts</li>
            </ul>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogAction className="border-2 border-charcoal" onClick={handleUpgrade}>
              Upgrade now (mock)
            </AlertDialogAction>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-2 border-charcoal">
              Later
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
