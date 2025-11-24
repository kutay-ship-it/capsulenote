import type { Locale } from "@/i18n/routing"
import { auth } from "@clerk/nextjs/server"
import { CalendarDays, Clock, Mail, ShieldCheck, Sparkles, PenSquare } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { CinematicHero } from "@/components/sandbox/cinematic-hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { MiniDemoLoop } from "@/components/sandbox/mini-demo-loop"
import { Link } from "@/i18n/routing"
import { HeroLetterEditor } from "./_components/hero-letter-editor"

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)
  const t = await getTranslations({ locale, namespace: "marketing" })
  const tCommon = await getTranslations({ locale, namespace: "common" })
  const currentYear = new Date().getFullYear()

  const stats = t.raw("stats") as Array<{ value: string; label: string; description: string }>
  const features = t.raw("features") as Array<{ title: string; description: string }>
  const featureIcons = [PenSquare, Clock, ShieldCheck, Mail, CalendarDays, Sparkles]

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar isSignedIn={isSignedIn} />
      <main className="flex-1">
        {/* Hero Section - Cinematic */}
        <section className="container px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pt-32">
          <CinematicHero />
        </section>

        {/* Mini Demo Loop Section */}
        <section className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="space-y-8">
            <div className="text-center">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                {t("howItWorksSection.badge")}
              </Badge>
              <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">{t("howItWorksSection.title")}</h2>
            </div>
            <MiniDemoLoop />
          </div>
        </section>

        {/* Letter Editor Section */}
        <section id="hero-editor" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl space-y-8 sm:space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                {t("heroEditorSection.badge")}
              </Badge>
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
                {t("heroEditorSection.title")}
              </h2>
              <p className="font-mono text-sm leading-relaxed text-gray-secondary sm:text-base md:text-lg">
                {t("heroEditorSection.description")}
              </p>
            </div>

            {/* Letter Editor */}
            <HeroLetterEditor />
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-12 space-y-8 sm:px-6 sm:py-16 sm:space-y-12 md:py-20 md:space-y-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-2xl font-normal leading-tight text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
              {t("featuresIntro.title")}
            </h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-gray-secondary sm:mt-6 sm:text-base md:text-lg">
              {t("featuresIntro.description")}
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length]
              const bgColors = [
                "bg-bg-blue-light",
                "bg-bg-peach-light",
                "bg-bg-purple-light",
                "bg-bg-green-light",
                "bg-bg-yellow-pale",
                "bg-bg-pink-light",
              ]
              return (
                <Card
                  key={feature.title}
                  className={`h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColors[index % bgColors.length]}`}
                  style={{ borderRadius: "2px" }}
                >
                  <CardHeader className="space-y-2 p-5 sm:space-y-3 sm:p-6">
                    <Icon className="h-6 w-6 text-charcoal sm:h-8 sm:w-8" strokeWidth={2} />
                    <CardTitle className="font-mono text-base font-normal uppercase tracking-wide sm:text-lg md:text-xl">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs leading-relaxed text-charcoal sm:text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {/* Sign Up Prompt */}
          <div className="mx-auto max-w-3xl px-4 sm:px-0">
            <div
              className="bg-bg-yellow-pale border-2 border-charcoal p-6 text-center sm:p-8"
              style={{ borderRadius: "2px" }}
            >
              <p className="font-mono text-sm text-charcoal mb-3 sm:text-base sm:mb-4">
                <strong className="uppercase">{t("cta.title")}</strong>
              </p>
              <p className="font-mono text-xs text-gray-secondary mb-5 sm:text-sm sm:mb-6">
                {isSignedIn ? t("cta.signedInDescription") : t("cta.signedOutDescription")}
              </p>
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                    {t("cta.goToDashboard")}
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                    {t("cta.createAccount")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonial Section */}
        <section className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <Card className="mx-auto max-w-4xl border-2 border-charcoal shadow-lg" style={{ borderRadius: "2px" }}>
            <CardHeader className="text-center p-5 sm:p-6">
              <Sparkles className="mx-auto h-10 w-10 text-charcoal sm:h-12 sm:w-12" strokeWidth={2} />
              <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide sm:text-3xl md:text-4xl">
                {t("testimonial.title")}
              </CardTitle>
              <CardDescription className="font-mono text-sm leading-relaxed text-charcoal sm:text-base">
                {t("testimonial.quote")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center font-mono text-xs text-gray-secondary p-5 sm:text-sm sm:p-6">
              {t("testimonial.attribution")}
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 md:pb-20 md:pt-12">
          <Card className="mx-auto max-w-3xl border-2 border-charcoal bg-duck-blue shadow-lg" style={{ borderRadius: "2px" }}>
            <CardHeader className="space-y-4 text-center p-5 sm:space-y-6 sm:p-6">
              <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
                {t("ctaBottom.title")}
              </CardTitle>
              <CardDescription className="font-mono text-sm text-charcoal sm:text-base">
                {t("ctaBottom.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch gap-3 p-5 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:p-6">
              {isSignedIn ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                    {t("cta.goToDashboard")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                      {t("ctaBottom.primary")}
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-12 w-full border-2 border-charcoal bg-transparent text-base uppercase text-charcoal hover:bg-charcoal hover:text-white sm:h-auto sm:w-auto"
                      style={{ borderRadius: "2px" }}
                    >
                      {t("ctaBottom.secondary")}
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-charcoal bg-off-white py-6 sm:py-8">
        <div className="container px-4 flex flex-col items-center gap-3 text-center font-mono text-xs text-gray-secondary sm:gap-4 sm:text-sm md:flex-row md:justify-between md:text-left">
          <p className="max-w-md sm:max-w-none">
            {tCommon("footer.copyright", { year: currentYear })}
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="/privacy" className="uppercase tracking-wide hover:opacity-70 transition-opacity">
              {tCommon("footer.privacy")}
            </Link>
            <Link href="/terms" className="uppercase tracking-wide hover:opacity-70 transition-opacity">
              {tCommon("footer.terms")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
