import { CalendarDays, PenSquare, Send, HeartHandshake } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const journey = [
  {
    title: "Set the moment",
    description: "Pick a milestone or create your own ritual.",
    detail: "Timezone awareness makes global deliveries effortless.",
    icon: CalendarDays,
  },
  {
    title: "Pour your heart out",
    description: "Write once inside a calm, distraction-free editor.",
    detail: "Prompts nudge you past writer's block without stealing your voice.",
    icon: PenSquare,
  },
  {
    title: "Let us deliver",
    description: "Email, premium paper mail, or both.",
    detail: "We notify you when it's sent and when it's opened.",
    icon: Send,
  },
]

const scenarios = [
  {
    title: "Personal rituals",
    points: [
      "Future-self check-ins to keep promises visible.",
      "Birthday time capsules for kids, partners, or friends.",
      "Milestone reflections to anchor career or health goals.",
    ],
  },
  {
    title: "Team moments",
    points: [
      "Welcome letters scheduled for a new teammate's Day 1.",
      "Leadership notes that unlock during launches or raises.",
      "Culture touchpoints after retreats, offsites, or reviews.",
    ],
  },
  {
    title: "Legacy drops",
    points: [
      "Share stories with loved ones after big life events.",
      "Send reminders to your future self to celebrate progress.",
      "Deliver gratitude letters long after the moment passes.",
    ],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <Card className="h-full border-2 border-charcoal bg-duck-blue shadow-lg" style={{ borderRadius: "2px" }}>
          <CardHeader className="p-5 sm:p-6">
            <Badge variant="secondary" className="w-fit uppercase tracking-wide text-xs">
              How it works
            </Badge>
            <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide sm:text-3xl md:text-4xl">
              A calm ritual in three beats
            </CardTitle>
            <CardDescription className="font-mono text-sm leading-relaxed text-charcoal sm:text-base">
              Every Capsule Note letter follows the same dependable cadence so you can focus on the
              message, not the logistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 sm:space-y-6 sm:p-6">
            {journey.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-3 border-2 border-charcoal bg-white p-4 sm:gap-4 sm:p-6"
                style={{ borderRadius: "2px" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow font-mono text-xl font-normal text-charcoal sm:h-14 sm:w-14 sm:text-2xl">
                  {index + 1}
                </div>
                <div className="space-y-1 text-left sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-charcoal sm:h-6 sm:w-6" strokeWidth={2} />
                    <p className="font-mono text-xs font-normal uppercase tracking-wide text-charcoal sm:text-sm">
                      {step.title}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-gray-secondary sm:text-sm">{step.description}</p>
                  <p className="font-mono text-xs text-gray-secondary sm:text-sm">{step.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-full border-2 border-charcoal shadow-md" style={{ borderRadius: "2px" }}>
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl md:text-3xl">
              Moments our writers plan ahead
            </CardTitle>
            <CardDescription className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm">
              Capsule Note letters show up exactly when emotions are highest and attention is lowest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5 sm:space-y-6 sm:p-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.title}
                className="space-y-2 border-2 border-charcoal bg-off-white p-4 sm:space-y-3 sm:p-6"
                style={{ borderRadius: "2px" }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <HeartHandshake className="h-5 w-5 text-charcoal sm:h-6 sm:w-6" strokeWidth={2} />
                  <p className="font-mono text-xs font-normal uppercase tracking-wide text-charcoal sm:text-sm">
                    {scenario.title}
                  </p>
                </div>
                <ul className="space-y-1.5 font-mono text-xs text-gray-secondary sm:space-y-2 sm:text-sm">
                  {scenario.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 border-2 border-charcoal bg-charcoal sm:mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
