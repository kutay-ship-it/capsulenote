import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { CustomResetPasswordForm } from "@/components/auth/custom-reset-password"
import type { Locale } from "@/i18n/routing"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonicalPath = locale === "en" ? "/reset-password" : `/${locale}/reset-password`

  return {
    title: "Reset Password | Capsule Note",
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalPath },
  }
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.resetPasswordPage" })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <CustomResetPasswordForm />
      </div>
    </div>
  )
}
