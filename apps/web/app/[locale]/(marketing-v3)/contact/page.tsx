import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Mail, Clock, MessageSquare, Twitter, Github } from "lucide-react"

import { cn } from "@/lib/utils"
import { LegalPageLayout } from "../_components/legal-page-layout"
import { LegalHero } from "../_components/legal-hero"
import { ContactForm } from "./_components/contact-form"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "legal.contact" })

  const canonicalPath = locale === "en" ? "/contact" : `/${locale}/contact`

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
        en: `${appUrl}/contact`,
        tr: `${appUrl}/tr/contact`,
        "x-default": `${appUrl}/contact`,
      },
    },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "legal.contact" })
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const contactMethods = [
    {
      icon: Mail,
      title: t("methods.email.title"),
      description: t("methods.email.description"),
      action: "support@capsulenote.com",
      href: "mailto:support@capsulenote.com",
    },
    {
      icon: Twitter,
      title: t("methods.twitter.title"),
      description: t("methods.twitter.description"),
      action: "@capsulenote",
      href: "https://twitter.com/capsulenote",
    },
  ]

  return (
    <LegalPageLayout>
      <LegalHero
        badge={t("hero.badge")}
        title={t("hero.title")}
        description={t("hero.description")}
        icon={MessageSquare}
        accentColor="blue"
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
        {/* Contact Form */}
        <div
          className={cn(
            "border-2 border-charcoal bg-white p-6 md:p-8",
            "shadow-[4px_4px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Form Header */}
          <div className="mb-6 pb-6 border-b-2 border-dashed border-charcoal/10">
            <h2 className={cn("font-mono text-lg text-charcoal mb-1", uppercaseClass)}>
              {t("formSection.title")}
            </h2>
            <p className="font-mono text-xs text-charcoal/60">
              {t("formSection.description")}
            </p>
          </div>

          <ContactForm />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contact Methods */}
          <div
            className="border-2 border-charcoal bg-off-white p-5"
            style={{ borderRadius: "2px" }}
          >
            <h3 className={cn("font-mono text-xs font-bold text-charcoal mb-4 tracking-wide", uppercaseClass)}>
              {t("sidebar.otherWays")}
            </h3>

            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-start gap-3 p-3 -mx-3",
                    "transition-colors hover:bg-white",
                    "group"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center flex-shrink-0",
                      "border-2 border-charcoal bg-duck-blue",
                      "transition-transform group-hover:-translate-y-0.5"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <method.icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
                  </div>
                  <div>
                    <p className={cn("font-mono text-xs text-charcoal/60", uppercaseClass)}>
                      {method.title}
                    </p>
                    <p className="font-mono text-sm text-charcoal font-medium group-hover:text-duck-blue transition-colors">
                      {method.action}
                    </p>
                    <p className="font-mono text-xs text-charcoal/50 mt-0.5">
                      {method.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Response Time */}
          <div
            className="border-2 border-charcoal bg-duck-yellow/20 p-5"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-charcoal flex-shrink-0" />
              <div>
                <h3 className={cn("font-mono text-xs font-bold text-charcoal mb-1", uppercaseClass)}>
                  {t("sidebar.responseTime.title")}
                </h3>
                <p className="font-mono text-sm text-charcoal/70">
                  {t("sidebar.responseTime.description")}
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/capsulenote"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 p-4",
              "border-2 border-charcoal bg-white",
              "shadow-[2px_2px_0_theme(colors.charcoal)]",
              "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Github className="h-5 w-5 text-charcoal" />
            <div>
              <p className={cn("font-mono text-xs text-charcoal/60", uppercaseClass)}>
                {t("sidebar.openSource.title")}
              </p>
              <p className="font-mono text-sm text-charcoal font-medium">
                {t("sidebar.openSource.action")}
              </p>
            </div>
          </a>
        </aside>
      </div>
    </LegalPageLayout>
  )
}
