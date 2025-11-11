"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSandboxExperience } from "@/components/sandbox/experience-context"

const channels = [
  { id: "email", label: "Email", description: "Instant inbox drop", requiresPro: false },
  { id: "mail", label: "Premium mail", description: "Printed + tracked", requiresPro: true },
] as const

const timezones = ["America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"]

export function ScheduleWizardPrototype() {
  const {
    state: { letters, plan },
    scheduleDelivery,
  } = useSandboxExperience()
  const [step, setStep] = useState(1)
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(letters[0]?.id ?? null)
  const [channel, setChannel] = useState<(typeof channels)[number]["id"]>("email")
  const [deliverDate, setDeliverDate] = useState("")
  const [deliverTime, setDeliverTime] = useState("09:00")
  const [timezone, setTimezone] = useState("America/New_York")
  const [status, setStatus] = useState("")

  const canProceedLetter = Boolean(selectedLetterId)
  const canProceedTiming = Boolean(deliverDate)
  const selectedLetter = letters.find((letter) => letter.id === selectedLetterId)
  const requiresUpgrade = plan === "free" && channel === "mail"

  const reviewSummary = useMemo(() => {
    if (!selectedLetter || !deliverDate) return null
    const deliverAt = new Date(`${deliverDate}T${deliverTime}`)
    return {
      title: selectedLetter.title,
      channel,
      deliverAt,
      timezone,
    }
  }, [selectedLetter, deliverDate, deliverTime, channel, timezone])

  const handleSchedule = () => {
    if (!reviewSummary) return
    scheduleDelivery({
      letterTitle: reviewSummary.title,
      channel,
      deliverAt: reviewSummary.deliverAt.toISOString(),
      timezone,
      status: requiresUpgrade ? "failed" : "scheduled",
    })
    setStatus(
      requiresUpgrade
        ? "This would normally be blocked behind an upgrade. We still simulated a failed delivery for visibility."
        : "Mock success: delivery scheduled!"
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-2 border-charcoal">
        <CardHeader>
          <CardTitle className="font-mono text-lg uppercase tracking-wide">Scheduling wizard</CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">
            Guided flow from <span className="font-semibold">sandbox/UX_BEATS_PLAN.md</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-gray-secondary">
            <span className={cn("rounded-sm border border-charcoal px-2 py-1", step === 1 ? "bg-charcoal text-white" : "")}>1. Select letter</span>
            <span className={cn("rounded-sm border border-charcoal px-2 py-1", step === 2 ? "bg-charcoal text-white" : "")}>2. Channel</span>
            <span className={cn("rounded-sm border border-charcoal px-2 py-1", step === 3 ? "bg-charcoal text-white" : "")}>3. Timing</span>
            <span className={cn("rounded-sm border border-charcoal px-2 py-1", step === 4 ? "bg-charcoal text-white" : "")}>4. Review</span>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase text-gray-secondary">Choose a letter</p>
              {letters.length === 0 ? (
                <p className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-4 text-sm font-mono text-charcoal">
                  Save a letter on the landing page to unlock scheduling.
                </p>
              ) : (
                <div className="space-y-2">
                  {letters.map((letter) => (
                    <button
                      key={letter.id}
                      onClick={() => setSelectedLetterId(letter.id)}
                      className={cn(
                        "w-full rounded-sm border-2 border-charcoal p-4 text-left transition hover:-translate-y-0.5",
                        selectedLetterId === letter.id ? "bg-bg-green-light" : "bg-white"
                      )}
                    >
                      <p className="font-mono text-sm uppercase text-charcoal">{letter.title}</p>
                      <p className="font-mono text-xs text-gray-secondary">
                        Created {format(new Date(letter.createdAt), "MMM d, yyyy")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <Button className="border-2 border-charcoal font-mono text-xs uppercase" disabled={!canProceedLetter} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase text-gray-secondary">Delivery channel</p>
              <div className="grid gap-2 md:grid-cols-2">
                {channels.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setChannel(option.id)}
                    className={cn(
                      "rounded-sm border-2 border-charcoal p-4 text-left",
                      channel === option.id ? "bg-bg-green-light" : "bg-white"
                    )}
                  >
                    <p className="font-mono text-sm uppercase text-charcoal">{option.label}</p>
                    <p className="font-mono text-xs text-gray-secondary">{option.description}</p>
                    {option.requiresPro && plan === "free" && (
                      <Badge className="mt-2 border border-charcoal bg-white font-mono text-[10px] uppercase text-coral">Pro perk</Badge>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" className="border-2 border-charcoal font-mono text-xs uppercase" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="border-2 border-charcoal font-mono text-xs uppercase" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase text-charcoal">Delivery date</label>
                <Input
                  type="date"
                  value={deliverDate}
                  onChange={(event) => setDeliverDate(event.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="border-2 border-charcoal"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-charcoal">Time</label>
                <Input type="time" value={deliverTime} onChange={(event) => setDeliverTime(event.target.value)} className="border-2 border-charcoal" />
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-charcoal">Timezone</label>
                <div className="flex flex-wrap gap-2">
                  {timezones.map((tz) => (
                    <Button
                      key={tz}
                      variant={timezone === tz ? "default" : "outline"}
                      onClick={() => setTimezone(tz)}
                      className={cn(
                        "border-2 border-charcoal font-mono text-[10px] uppercase",
                        timezone === tz ? "" : "bg-white text-charcoal"
                      )}
                    >
                      {tz.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" className="border-2 border-charcoal font-mono text-xs uppercase" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="border-2 border-charcoal font-mono text-xs uppercase" disabled={!canProceedTiming} onClick={() => setStep(4)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && reviewSummary && (
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase text-gray-secondary">Review</p>
              <div className="space-y-2 rounded-sm border-2 border-charcoal bg-white p-4">
                <p className="font-mono text-sm uppercase text-charcoal">Letter</p>
                <p className="font-mono text-xs text-gray-secondary">{reviewSummary.title}</p>
                <p className="font-mono text-sm uppercase text-charcoal">Channel</p>
                <p className="font-mono text-xs text-gray-secondary">{channel === "mail" ? "Premium mail" : "Email"}</p>
                <p className="font-mono text-sm uppercase text-charcoal">Delivery time</p>
                <p className="font-mono text-xs text-gray-secondary">
                  {format(reviewSummary.deliverAt, "PPpp")} ({timezone})
                </p>
                {requiresUpgrade && (
                  <p className="text-xs font-mono text-coral">This would normally require an upgrade. Mock continues for demo.</p>
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" className="border-2 border-charcoal font-mono text-xs uppercase" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button className="border-2 border-charcoal font-mono text-xs uppercase" onClick={handleSchedule}>
                  Schedule delivery
                </Button>
              </div>
              {status && (
                <p className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-3 text-xs font-mono text-charcoal">{status}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-charcoal bg-bg-yellow-pale/70">
        <CardHeader>
          <CardTitle className="font-mono text-lg uppercase tracking-wide">Wizard notes</CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">All mocked; no network requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm font-mono text-charcoal">
          <p>• Letters feed from the hero editor context.</p>
          <p>• Scheduling pushes into mocked delivery timeline for dashboard/coach.</p>
          <p>• Upgrade paths mirror the entitlement prototype.</p>
          <p>• Try switching plan on the entitlement page to see different states.</p>
        </CardContent>
      </Card>
    </div>
  )
}
