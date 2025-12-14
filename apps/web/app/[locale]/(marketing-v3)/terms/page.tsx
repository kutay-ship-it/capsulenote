import { Metadata } from "next"
import { getTranslations, setRequestLocale, getFormatter } from "next-intl/server"
import { FileText, CheckCircle, XCircle, AlertTriangle, Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import {
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalHighlight,
} from "../_components/legal-section"
import { LegalToc, LegalTocMobile } from "../_components/legal-toc"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal.terms" })

  const canonicalPath = locale === "en" ? "/terms" : `/${locale}/terms`

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      url: `${appUrl}${canonicalPath}`,
    },
    alternates: {
      canonical: `${appUrl}${canonicalPath}`,
      languages: {
        en: `${appUrl}/terms`,
        tr: `${appUrl}/tr/terms`,
        "x-default": `${appUrl}/terms`,
      },
    },
  }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "legal.terms" })
  const format = await getFormatter({ locale })
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  // Last updated date
  const lastUpdated = format.dateTime(new Date("2024-12-01"), {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // TOC items
  const tocItems = [
    { id: "acceptance", title: t("sections.acceptance.title"), number: "01" },
    { id: "description", title: t("sections.description.title"), number: "02" },
    { id: "accounts", title: t("sections.accounts.title"), number: "03" },
    { id: "payments", title: t("sections.payments.title"), number: "04" },
    { id: "content", title: t("sections.content.title"), number: "05" },
    { id: "prohibited", title: t("sections.prohibited.title"), number: "06" },
    { id: "intellectual", title: t("sections.intellectual.title"), number: "07" },
    { id: "termination", title: t("sections.termination.title"), number: "08" },
    { id: "disclaimers", title: t("sections.disclaimers.title"), number: "09" },
    { id: "liability", title: t("sections.liability.title"), number: "10" },
    { id: "governing", title: t("sections.governing.title"), number: "11" },
    { id: "changes", title: t("sections.changes.title"), number: "12" },
  ]

  return (
    <LegalPageLayout
      showToc
      tocSlot={<LegalToc items={tocItems} title={t("common.tableOfContents")} />}
    >
      <LegalHero
        badge={t("hero.badge")}
        title={t("hero.title")}
        description={t("hero.description")}
        lastUpdated={lastUpdated}
        icon={FileText}
        accentColor="yellow"
      />

      {/* Mobile TOC */}
      <LegalTocMobile items={tocItems} title={t("common.jumpToSection")} />

      {/* Acceptance of Terms */}
      <LegalSection id="acceptance" title={t("sections.acceptance.title")} number="01">
        <LegalParagraph>{t("sections.acceptance.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.acceptance.content.1")}</LegalParagraph>

        <LegalHighlight variant="warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{t("sections.acceptance.warning")}</p>
          </div>
        </LegalHighlight>
      </LegalSection>

      {/* Service Description */}
      <LegalSection id="description" title={t("sections.description.title")} number="02">
        <LegalParagraph>{t("sections.description.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.description.features") as string[]} />
      </LegalSection>

      {/* User Accounts */}
      <LegalSection id="accounts" title={t("sections.accounts.title")} number="03">
        <LegalParagraph>{t("sections.accounts.intro")}</LegalParagraph>

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.accounts.requirements.title")}
        </h3>
        <LegalList items={t.raw("sections.accounts.requirements.items") as string[]} />

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.accounts.responsibilities.title")}
        </h3>
        <LegalList items={t.raw("sections.accounts.responsibilities.items") as string[]} />
      </LegalSection>

      {/* Payments & Billing */}
      <LegalSection id="payments" title={t("sections.payments.title")} number="04">
        <LegalParagraph>{t("sections.payments.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.payments.items") as string[]} />

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.payments.refunds.title")}
        </h3>
        <LegalParagraph>{t("sections.payments.refunds.content")}</LegalParagraph>
      </LegalSection>

      {/* User Content */}
      <LegalSection id="content" title={t("sections.content.title")} number="05">
        <LegalParagraph>{t("sections.content.ownership")}</LegalParagraph>
        <LegalParagraph>{t("sections.content.license")}</LegalParagraph>
        <LegalParagraph>{t("sections.content.encryption")}</LegalParagraph>
      </LegalSection>

      {/* Prohibited Uses */}
      <LegalSection id="prohibited" title={t("sections.prohibited.title")} number="06">
        <LegalParagraph>{t("sections.prohibited.intro")}</LegalParagraph>

        <div className="space-y-2 mt-4">
          {(t.raw("sections.prohibited.items") as string[]).map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <XCircle className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" />
              <span className="font-mono text-sm text-charcoal/80">{item}</span>
            </div>
          ))}
        </div>

        <LegalHighlight variant="warning">
          {t("sections.prohibited.warning")}
        </LegalHighlight>
      </LegalSection>

      {/* Intellectual Property */}
      <LegalSection id="intellectual" title={t("sections.intellectual.title")} number="07">
        <LegalParagraph>{t("sections.intellectual.ownership")}</LegalParagraph>
        <LegalParagraph>{t("sections.intellectual.restrictions")}</LegalParagraph>
      </LegalSection>

      {/* Termination */}
      <LegalSection id="termination" title={t("sections.termination.title")} number="08">
        <h3 className={cn("font-mono text-sm font-bold text-charcoal mb-3", uppercaseClass)}>
          {t("sections.termination.byUser.title")}
        </h3>
        <LegalParagraph>{t("sections.termination.byUser.content")}</LegalParagraph>

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.termination.byUs.title")}
        </h3>
        <LegalParagraph>{t("sections.termination.byUs.content")}</LegalParagraph>

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.termination.effects.title")}
        </h3>
        <LegalList items={t.raw("sections.termination.effects.items") as string[]} />
      </LegalSection>

      {/* Disclaimers */}
      <LegalSection id="disclaimers" title={t("sections.disclaimers.title")} number="09">
        <LegalParagraph>{t("sections.disclaimers.content.0")}</LegalParagraph>

        <LegalHighlight variant="info">
          {t("sections.disclaimers.highlight")}
        </LegalHighlight>

        <LegalParagraph>{t("sections.disclaimers.content.1")}</LegalParagraph>
      </LegalSection>

      {/* Limitation of Liability */}
      <LegalSection id="liability" title={t("sections.liability.title")} number="10">
        <LegalParagraph>{t("sections.liability.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.liability.content.1")}</LegalParagraph>

        <div
          className="mt-4 p-4 border-2 border-coral bg-coral/10"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-sm text-charcoal/80">
            <strong>{t("sections.liability.maxLiability.title")}</strong>{" "}
            {t("sections.liability.maxLiability.content")}
          </p>
        </div>
      </LegalSection>

      {/* Governing Law */}
      <LegalSection id="governing" title={t("sections.governing.title")} number="11">
        <LegalParagraph>{t("sections.governing.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.governing.content.1")}</LegalParagraph>
      </LegalSection>

      {/* Changes to Terms */}
      <LegalSection id="changes" title={t("sections.changes.title")} number="12">
        <LegalParagraph>{t("sections.changes.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.changes.content.1")}</LegalParagraph>

        {/* Contact */}
        <div
          className="flex items-center gap-3 p-4 mt-6 border-2 border-charcoal bg-duck-yellow/20"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-5 w-5 text-charcoal" />
          <div>
            <p className={cn("font-mono text-xs text-charcoal/60", uppercaseClass)}>
              {t("sections.changes.questions")}
            </p>
            <a
              href="mailto:legal@capsulenote.com"
              className="font-mono text-sm text-charcoal font-bold hover:text-duck-blue transition-colors"
            >
              legal@capsulenote.com
            </a>
          </div>
        </div>
      </LegalSection>
    </LegalPageLayout>
  )
}
