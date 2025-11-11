"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CalendarIcon, Check, Clock, Loader2, Sparkles } from "lucide-react"
import { useSandboxExperience } from "@/components/sandbox/experience-context"

type StepStatus = "todo" | "in-progress" | "done"

export function DashboardChecklistCoachPrototype() {
  const {
    state: { letters, deliveries, recipientsVerified, heroDraft },
    setRecipientsVerified,
  } = useSandboxExperience()

  const latestLetter = letters[0]
  const hasDraft = heroDraft.body.trim().length > 0
  const firstDelivery = deliveries[0]

  const steps = [
    {
      id: 1,
      title: "Capture your first letter",
      description: latestLetter
        ? `Saved ${formatDistanceToNow(new Date(latestLetter.createdAt), { addSuffix: true })}`
        : "Finish a draft in the Brutalist editor.",
      status: latestLetter ? "done" : hasDraft ? "in-progress" : "todo",
      actionLabel: latestLetter ? "View letter" : "Open editor",
    },
    {
      id: 2,
      title: "Schedule your first delivery",
      description: firstDelivery
        ? `Arrives ${formatDistanceToNow(new Date(firstDelivery.deliverAt), { addSuffix: true })}`
        : "Pick a milestone + channel.",
      status: firstDelivery ? "done" : latestLetter ? "in-progress" : "todo",
      actionLabel: firstDelivery ? "View timeline" : "Open scheduler",
    },
    {
      id: 3,
      title: "Verify recipients & timezone",
      description: recipientsVerified ? "Preferences locked in" : "Confirm recipient email/address.",
      status: recipientsVerified ? "done" : firstDelivery ? "in-progress" : "todo",
      actionLabel: recipientsVerified ? "Update prefs" : "Verify now",
    },
  ] as const

  const coachMessages: Record<StepStatus, string> = {
    todo: "Let's capture that first letter. Need a prompt? I've got plenty.",
    "in-progress": "Nice momentum. Ready to lock in the delivery time?",
    done: "You did it. Want to schedule a gratitude ritual next?",
  }

  const activeStep = steps.find((step) => step.status !== "done")
  const coachMood: StepStatus = activeStep ? activeStep.status : "done"

  const progress = Math.round((steps.filter((step) => step.status === "done").length / steps.length) * 100)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-2 border-charcoal">
        <CardHeader className="border-b border-dashed border-charcoal">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-lg uppercase tracking-wide">Onboarding checklist</CardTitle>
              <CardDescription className="font-mono text-sm text-gray-secondary">Guiding you to first delivery.</CardDescription>
            </div>
            <Badge variant="secondary" className="border border-charcoal font-mono text-xs uppercase">
              {progress}% complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "rounded-sm border-2 border-charcoal bg-white p-4 transition-all",
                step.status === "done" ? "bg-bg-green-light" : step.status === "in-progress" ? "bg-bg-yellow-pale" : ""
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase text-gray-secondary">Step {step.id}</p>
                  <h4 className="font-mono text-base uppercase text-charcoal">{step.title}</h4>
                  <p className="font-mono text-xs text-gray-secondary">{step.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 border-2 border-charcoal font-mono text-[10px] uppercase",
                    step.status === "done" && "bg-duck-green text-white"
                  )}
                >
                  {step.status === "done" ? (
                    <>
                      <Check className="h-3 w-3" /> Done
                    </>
                  ) : step.status === "in-progress" ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> In progress
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Todo
                    </>
                  )}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant={step.status === "done" ? "outline" : "default"} className="border-2 border-charcoal font-mono text-xs uppercase">
                  {step.actionLabel}
                </Button>
                {step.id === 2 && (
                  <Badge className="border border-charcoal bg-white font-mono text-[10px] uppercase">Reminder 24h before send</Badge>
                )}
                {step.id === 3 && step.status !== "done" && (
                  <Button
                    variant="secondary"
                    className="border-2 border-charcoal font-mono text-[10px] uppercase"
                    onClick={() => setRecipientsVerified(true)}
                  >
                    Mark verified
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-charcoal bg-bg-purple-light">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-lg uppercase tracking-wide">Coach companion</CardTitle>
              <CardDescription className="font-mono text-sm text-gray-secondary">
                Adaptive assistant from <span className="font-semibold">sandbox/dashboard_checklist_coach.md</span>.
              </CardDescription>
            </div>
            <Badge className="flex items-center gap-1 border-2 border-charcoal bg-white font-mono text-[10px] uppercase text-charcoal">
              <CalendarIcon className="h-3 w-3" /> Daily brief
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 rounded-sm border-2 border-charcoal bg-white/80 p-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-2 border-charcoal text-xl",
                coachMood === "done"
                  ? "bg-duck-yellow"
                  : coachMood === "in-progress"
                    ? "bg-bg-yellow-pale"
                    : "bg-bg-pink-light"
              )}
            >
              <Sparkles className="h-6 w-6 text-charcoal" />
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-gray-secondary">Coach message</p>
              <p className="font-mono text-sm leading-relaxed text-charcoal">{coachMessages[coachMood]}</p>
              <Button className="border-2 border-charcoal font-mono text-xs uppercase">View Ritual Suggestions</Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="border-2 border-charcoal bg-white">
              <CardContent className="space-y-1 p-4">
                <p className="font-mono text-xs uppercase text-gray-secondary">Trust byte</p>
                <p className="font-mono text-sm text-charcoal">
                  Yesterday’s on-time delivery rate: <span className="font-bold">99.97%</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-charcoal bg-white">
              <CardContent className="space-y-1 p-4">
                <p className="font-mono text-xs uppercase text-gray-secondary">Upcoming</p>
                {firstDelivery ? (
                  <p className="font-mono text-sm text-charcoal">
                    “{firstDelivery.letterTitle}” arrives {formatDistanceToNow(new Date(firstDelivery.deliverAt), { addSuffix: true })}.
                  </p>
                ) : (
                  <p className="font-mono text-sm text-gray-secondary">No deliveries yet—schedule one to unlock insights.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
