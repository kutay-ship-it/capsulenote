import { CalendarDays, PenSquare, Send, HeartHandshake } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function HowItWorks() {
  const t = await getTranslations("marketing.howItWorks")

  const journey = [
    {
      title: t("journey.setMoment.title"),
      description: t("journey.setMoment.description"),
      detail: t("journey.setMoment.detail"),
      icon: CalendarDays,
    },
    {
      title: t("journey.write.title"),
      description: t("journey.write.description"),
      detail: t("journey.write.detail"),
      icon: PenSquare,
    },
    {
      title: t("journey.deliver.title"),
      description: t("journey.deliver.description"),
      detail: t("journey.deliver.detail"),
      icon: Send,
    },
  ]

  const scenarios = [
    {
      title: t("scenarios.personal.title"),
      points: t.raw("scenarios.personal.points") as string[],
    },
    {
      title: t("scenarios.team.title"),
      points: t.raw("scenarios.team.points") as string[],
    },
    {
      title: t("scenarios.legacy.title"),
      points: t.raw("scenarios.legacy.points") as string[],
    },
  ]

  return (
    <section id="how-it-works" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <Card className="h-full border-2 border-charcoal bg-duck-blue shadow-lg" style={{ borderRadius: "2px" }}>
          <CardHeader className="p-5 sm:p-6">
            <Badge variant="secondary" className="w-fit uppercase tracking-wide text-xs">
              {t("badge")}
            </Badge>
            <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide sm:text-3xl md:text-4xl">
              {t("title")}
            </CardTitle>
            <CardDescription className="font-mono text-sm leading-relaxed text-charcoal sm:text-base">
              {t("description")}
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
              {t("scenarios.title")}
            </CardTitle>
            <CardDescription className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm">
              {t("scenarios.description")}
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
