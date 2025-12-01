import { Metadata } from "next"
import { getTranslations, setRequestLocale, getFormatter } from "next-intl/server"
import { FileText, Mail, Download, Trash2 } from "lucide-react"

import { Link } from "@/i18n/routing"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal.privacy" })

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

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "legal.privacy" })
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
    { id: "introduction", title: t("sections.introduction.title"), number: "01" },
    { id: "collection", title: t("sections.collection.title"), number: "02" },
    { id: "usage", title: t("sections.usage.title"), number: "03" },
    { id: "storage", title: t("sections.storage.title"), number: "04" },
    { id: "sharing", title: t("sections.sharing.title"), number: "05" },
    { id: "cookies", title: t("sections.cookies.title"), number: "06" },
    { id: "rights", title: t("sections.rights.title"), number: "07" },
    { id: "gdpr", title: t("sections.gdpr.title"), number: "08" },
    { id: "contact", title: t("sections.contact.title"), number: "09" },
    { id: "changes", title: t("sections.changes.title"), number: "10" },
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
        accentColor="teal"
      />

      {/* Mobile TOC */}
      <LegalTocMobile items={tocItems} title={t("common.jumpToSection")} />

      {/* Introduction */}
      <LegalSection id="introduction" title={t("sections.introduction.title")} number="01">
        <LegalParagraph>{t("sections.introduction.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.introduction.content.1")}</LegalParagraph>
      </LegalSection>

      {/* Information We Collect */}
      <LegalSection id="collection" title={t("sections.collection.title")} number="02">
        <LegalParagraph>{t("sections.collection.intro")}</LegalParagraph>

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.collection.account.title")}
        </h3>
        <LegalList items={t.raw("sections.collection.account.items") as string[]} />

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.collection.content.title")}
        </h3>
        <LegalList items={t.raw("sections.collection.content.items") as string[]} />

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.collection.usage.title")}
        </h3>
        <LegalList items={t.raw("sections.collection.usage.items") as string[]} />
      </LegalSection>

      {/* How We Use Your Information */}
      <LegalSection id="usage" title={t("sections.usage.title")} number="03">
        <LegalParagraph>{t("sections.usage.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.usage.items") as string[]} />

        <LegalHighlight variant="info">
          {t("sections.usage.highlight")}
        </LegalHighlight>
      </LegalSection>

      {/* Data Storage & Security */}
      <LegalSection id="storage" title={t("sections.storage.title")} number="04">
        <LegalParagraph>{t("sections.storage.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.storage.items") as string[]} />
        <LegalParagraph>{t("sections.storage.retention")}</LegalParagraph>
      </LegalSection>

      {/* Information Sharing */}
      <LegalSection id="sharing" title={t("sections.sharing.title")} number="05">
        <LegalParagraph>{t("sections.sharing.intro")}</LegalParagraph>

        <h3 className={cn("font-mono text-sm font-bold text-charcoal mt-6 mb-3", uppercaseClass)}>
          {t("sections.sharing.providers.title")}
        </h3>

        {/* Service Providers Table */}
        <div
          className="overflow-x-auto border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-charcoal bg-charcoal/5">
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.sharing.providers.columns.service")}
                </th>
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.sharing.providers.columns.purpose")}
                </th>
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.sharing.providers.columns.data")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {(t.raw("sections.sharing.providers.list") as Array<{ service: string; purpose: string; data: string }>).map(
                (provider, index) => (
                  <tr key={index}>
                    <td className="p-3 text-charcoal">{provider.service}</td>
                    <td className="p-3 text-charcoal/70">{provider.purpose}</td>
                    <td className="p-3 text-charcoal/70">{provider.data}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <LegalParagraph>{t("sections.sharing.noSelling")}</LegalParagraph>
      </LegalSection>

      {/* Cookies & Tracking */}
      <LegalSection id="cookies" title={t("sections.cookies.title")} number="06">
        <LegalParagraph>{t("sections.cookies.intro")}</LegalParagraph>

        <div
          className="overflow-x-auto border-2 border-charcoal bg-white mt-4"
          style={{ borderRadius: "2px" }}
        >
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-charcoal bg-charcoal/5">
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.cookies.columns.name")}
                </th>
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.cookies.columns.purpose")}
                </th>
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.cookies.columns.duration")}
                </th>
                <th className={cn("p-3 text-left text-charcoal", uppercaseClass)}>
                  {t("sections.cookies.columns.required")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {(t.raw("sections.cookies.list") as Array<{ name: string; purpose: string; duration: string; required: boolean }>).map(
                (cookie, index) => (
                  <tr key={index}>
                    <td className="p-3 text-charcoal font-medium">{cookie.name}</td>
                    <td className="p-3 text-charcoal/70">{cookie.purpose}</td>
                    <td className="p-3 text-charcoal/70">{cookie.duration}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 text-[10px] font-bold",
                          cookie.required
                            ? "bg-teal-primary/20 text-teal-primary"
                            : "bg-charcoal/10 text-charcoal/60",
                          uppercaseClass
                        )}
                        style={{ borderRadius: "2px" }}
                      >
                        {cookie.required ? t("sections.cookies.required") : t("sections.cookies.optional")}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </LegalSection>

      {/* Your Rights */}
      <LegalSection id="rights" title={t("sections.rights.title")} number="07">
        <LegalParagraph>{t("sections.rights.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.rights.items") as string[]} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Link
            href="/settings"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "border-2 border-charcoal bg-duck-blue text-charcoal",
              "font-mono text-xs tracking-wide",
              "shadow-[2px_2px_0_theme(colors.charcoal)]",
              "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
              uppercaseClass
            )}
            style={{ borderRadius: "2px" }}
          >
            <Download className="h-4 w-4" />
            {t("sections.rights.exportButton")}
          </Link>
          <Link
            href="/settings"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "border-2 border-coral bg-coral/10 text-coral",
              "font-mono text-xs tracking-wide",
              "shadow-[2px_2px_0_theme(colors.coral)]",
              "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.coral)]",
              uppercaseClass
            )}
            style={{ borderRadius: "2px" }}
          >
            <Trash2 className="h-4 w-4" />
            {t("sections.rights.deleteButton")}
          </Link>
        </div>
      </LegalSection>

      {/* GDPR Compliance */}
      <LegalSection id="gdpr" title={t("sections.gdpr.title")} number="08">
        <LegalParagraph>{t("sections.gdpr.intro")}</LegalParagraph>
        <LegalList items={t.raw("sections.gdpr.items") as string[]} />
        <LegalParagraph>{t("sections.gdpr.legal")}</LegalParagraph>
      </LegalSection>

      {/* Contact Us */}
      <LegalSection id="contact" title={t("sections.contact.title")} number="09">
        <LegalParagraph>{t("sections.contact.intro")}</LegalParagraph>

        <div
          className="flex items-center gap-3 p-4 mt-4 border-2 border-charcoal bg-duck-yellow/20"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-5 w-5 text-charcoal" />
          <div>
            <p className={cn("font-mono text-xs text-charcoal/60", uppercaseClass)}>
              {t("sections.contact.dpo")}
            </p>
            <a
              href="mailto:privacy@capsulenote.com"
              className="font-mono text-sm text-charcoal font-bold hover:text-duck-blue transition-colors"
            >
              privacy@capsulenote.com
            </a>
          </div>
        </div>
      </LegalSection>

      {/* Changes to Policy */}
      <LegalSection id="changes" title={t("sections.changes.title")} number="10">
        <LegalParagraph>{t("sections.changes.content.0")}</LegalParagraph>
        <LegalParagraph>{t("sections.changes.content.1")}</LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  )
}
