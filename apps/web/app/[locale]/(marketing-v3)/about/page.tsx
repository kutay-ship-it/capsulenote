import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Building2, Shield, Clock, Heart, ArrowRight } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { LegalSection, LegalParagraph, LegalHighlight } from "../_components/legal-section"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal.about" })

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "legal.about" })
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const values = [
    {
      icon: Shield,
      title: t("values.privacy.title"),
      description: t("values.privacy.description"),
      color: "bg-teal-primary/10 border-teal-primary",
    },
    {
      icon: Clock,
      title: t("values.time.title"),
      description: t("values.time.description"),
      color: "bg-duck-blue/10 border-duck-blue",
    },
    {
      icon: Heart,
      title: t("values.words.title"),
      description: t("values.words.description"),
      color: "bg-duck-yellow/20 border-duck-yellow",
    },
  ]

  return (
    <LegalPageLayout>
      <LegalHero
        badge={t("hero.badge")}
        title={t("hero.title")}
        description={t("hero.description")}
        icon={Building2}
        accentColor="yellow"
      />

      {/* Mission Section */}
      <LegalSection id="mission" title={t("sections.mission.title")} number="01">
        <LegalParagraph>{t("sections.mission.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.mission.content.1")}</LegalParagraph>
        <LegalHighlight variant="info">
          {t("sections.mission.highlight")}
        </LegalHighlight>
      </LegalSection>

      {/* Story Section */}
      <LegalSection id="story" title={t("sections.story.title")} number="02">
        <LegalParagraph>{t("sections.story.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.story.content.1")}</LegalParagraph>
        <LegalParagraph>{t("sections.story.content.2")}</LegalParagraph>
      </LegalSection>

      {/* Values Section */}
      <LegalSection id="values" title={t("sections.values.title")} number="03">
        <LegalParagraph>{t("sections.values.intro")}</LegalParagraph>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          {values.map((value, index) => (
            <div
              key={index}
              className={cn(
                "p-5 border-2",
                "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                value.color
              )}
              style={{ borderRadius: "2px" }}
            >
              <value.icon className="h-6 w-6 text-charcoal mb-3" strokeWidth={2} />
              <h3 className={cn("font-mono text-sm font-bold text-charcoal mb-2", uppercaseClass)}>
                {value.title}
              </h3>
              <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </LegalSection>

      {/* CTA Section */}
      <section className="mt-12 pt-10 border-t-2 border-charcoal/10">
        <div
          className={cn(
            "relative p-8 md:p-10 border-2 border-charcoal bg-duck-yellow",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <h2 className={cn("font-mono text-2xl md:text-3xl text-charcoal mb-4", uppercaseClass)}>
            {t("cta.title")}
          </h2>
          <p className="font-mono text-sm md:text-base text-charcoal/80 mb-6 max-w-xl">
            {t("cta.description")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/letters/new"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3",
                "border-2 border-charcoal bg-charcoal text-white",
                "font-mono text-sm tracking-wide",
                "shadow-[2px_2px_0_theme(colors.charcoal)]",
                "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                uppercaseClass
              )}
              style={{ borderRadius: "2px" }}
            >
              {t("cta.primaryButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3",
                "border-2 border-charcoal bg-white text-charcoal",
                "font-mono text-sm tracking-wide",
                "shadow-[2px_2px_0_theme(colors.charcoal)]",
                "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                uppercaseClass
              )}
              style={{ borderRadius: "2px" }}
            >
              {t("cta.secondaryButton")}
            </Link>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  )
}
