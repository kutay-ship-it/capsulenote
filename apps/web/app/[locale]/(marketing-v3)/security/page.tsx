import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  Shield,
  Lock,
  Server,
  Key,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Mail,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import {
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalHighlight,
} from "../_components/legal-section"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal.security" })

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

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "legal.security" })
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const securityPillars = [
    {
      icon: Lock,
      title: t("pillars.encryption.title"),
      description: t("pillars.encryption.description"),
      color: "bg-duck-blue/10 border-duck-blue",
    },
    {
      icon: Server,
      title: t("pillars.infrastructure.title"),
      description: t("pillars.infrastructure.description"),
      color: "bg-teal-primary/10 border-teal-primary",
    },
    {
      icon: Key,
      title: t("pillars.access.title"),
      description: t("pillars.access.description"),
      color: "bg-duck-yellow/20 border-duck-yellow",
    },
  ]

  return (
    <LegalPageLayout>
      <LegalHero
        badge={t("hero.badge")}
        title={t("hero.title")}
        description={t("hero.description")}
        icon={Shield}
        accentColor="blue"
      />

      {/* Security Pillars Overview */}
      <section className="mb-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {securityPillars.map((pillar, index) => (
            <div
              key={index}
              className={cn(
                "p-5 border-2",
                "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                pillar.color
              )}
              style={{ borderRadius: "2px" }}
            >
              <pillar.icon className="h-6 w-6 text-charcoal mb-3" strokeWidth={2} />
              <h3 className={cn("font-mono text-sm font-bold text-charcoal mb-2", uppercaseClass)}>
                {pillar.title}
              </h3>
              <p className="font-mono text-xs text-charcoal/70 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Overview Section */}
      <LegalSection id="overview" title={t("sections.overview.title")} number="01">
        <LegalParagraph>{t("sections.overview.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.overview.content.1")}</LegalParagraph>
      </LegalSection>

      {/* Encryption Section */}
      <LegalSection id="encryption" title={t("sections.encryption.title")} number="02">
        <LegalParagraph>{t("sections.encryption.intro")}</LegalParagraph>

        <LegalHighlight variant="success">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">{t("sections.encryption.highlight.title")}</p>
              <p>{t("sections.encryption.highlight.description")}</p>
            </div>
          </div>
        </LegalHighlight>

        {/* Technical Specs */}
        <div
          className="mt-6 p-4 border-2 border-charcoal bg-charcoal/5 font-mono text-xs"
          style={{ borderRadius: "2px" }}
        >
          <div className={cn("text-xs text-charcoal/50 mb-2", uppercaseClass)}>
            {t("sections.encryption.specs.title")}
          </div>
          <div className="space-y-1 text-charcoal/80">
            <div className="flex justify-between">
              <span>{t("sections.encryption.specs.algorithm")}</span>
              <span className="text-duck-blue">AES-256-GCM</span>
            </div>
            <div className="flex justify-between">
              <span>{t("sections.encryption.specs.keyDerivation")}</span>
              <span className="text-duck-blue">HKDF-SHA256</span>
            </div>
            <div className="flex justify-between">
              <span>{t("sections.encryption.specs.transport")}</span>
              <span className="text-duck-blue">TLS 1.3</span>
            </div>
            <div className="flex justify-between">
              <span>{t("sections.encryption.specs.nonce")}</span>
              <span className="text-duck-blue">96-bit unique per record</span>
            </div>
          </div>
        </div>

        <LegalParagraph>{t("sections.encryption.zeroKnowledge")}</LegalParagraph>
      </LegalSection>

      {/* Infrastructure Section */}
      <LegalSection id="infrastructure" title={t("sections.infrastructure.title")} number="03">
        <LegalParagraph>{t("sections.infrastructure.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.infrastructure.features") as string[]} />
      </LegalSection>

      {/* Access Control Section */}
      <LegalSection id="access" title={t("sections.access.title")} number="04">
        <LegalParagraph>{t("sections.access.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.access.features") as string[]} />
      </LegalSection>

      {/* Compliance Section */}
      <LegalSection id="compliance" title={t("sections.compliance.title")} number="05">
        <LegalParagraph>{t("sections.compliance.intro")}</LegalParagraph>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          {(t.raw("sections.compliance.certifications") as Array<{ name: string; description: string }>).map(
            (cert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border-2 border-charcoal/20 bg-white"
                style={{ borderRadius: "2px" }}
              >
                <CheckCircle className="h-5 w-5 text-teal-primary flex-shrink-0" />
                <div>
                  <p className={cn("font-mono text-sm font-bold text-charcoal", uppercaseClass)}>
                    {cert.name}
                  </p>
                  <p className="font-mono text-xs text-charcoal/70">{cert.description}</p>
                </div>
              </div>
            )
          )}
        </div>
      </LegalSection>

      {/* Vulnerability Reporting Section */}
      <LegalSection id="reporting" title={t("sections.reporting.title")} number="06">
        <LegalParagraph>{t("sections.reporting.intro")}</LegalParagraph>

        <LegalHighlight variant="warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">{t("sections.reporting.contact.title")}</p>
              <p className="mb-2">{t("sections.reporting.contact.description")}</p>
              <a
                href="mailto:security@capsulenote.com"
                className="inline-flex items-center gap-2 text-charcoal font-bold hover:text-duck-blue transition-colors"
              >
                <Mail className="h-4 w-4" />
                security@capsulenote.com
              </a>
            </div>
          </div>
        </LegalHighlight>

        <LegalParagraph>{t("sections.reporting.process")}</LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  )
}
