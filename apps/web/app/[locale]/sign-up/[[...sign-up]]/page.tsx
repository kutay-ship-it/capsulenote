import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { CustomSignUpForm } from "@/components/auth/custom-sign-up"
import type { Locale } from "@/i18n/routing"

export const metadata: Metadata = {
  title: "Sign Up",
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    email?: string
  }>
}

export default async function SignUpPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const prefix = locale === "en" ? "" : `/${locale}`

  // Redirect if already signed in
  const { userId } = await auth()
  if (userId) {
    redirect(`${prefix}/journey`)
  }

  const t = await getTranslations({ locale, namespace: "auth.signUpPage" })
  const resolvedSearchParams = await searchParams
  const lockedEmail = resolvedSearchParams.email

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        {lockedEmail && (
          <Card className="mb-6 border-2 border-charcoal">
            <CardContent className="p-4">
              <p className="font-mono text-xs text-charcoal">
                {t("lockedEmailNotice", { email: lockedEmail })}
              </p>
            </CardContent>
          </Card>
        )}
        <CustomSignUpForm lockedEmail={lockedEmail} />
      </div>
    </div>
  )
}
