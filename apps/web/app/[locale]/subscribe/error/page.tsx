/**
 * Subscribe Error Page
 *
 * Handles checkout errors with specific messaging and recovery actions:
 * - payment_failed: Show retry button
 * - session_expired: Show start over button
 * - email_mismatch: Show sign in with correct email
 * - unknown: Generic error + support contact
 *
 * Server Component
 */

import * as React from "react"
import type { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, XCircle, Clock, Mail, HelpCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("subscribe")
  return {
    title: t("error.metadata.title"),
    description: t("error.metadata.description"),
    alternates: {
      canonical: "/subscribe/error",
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

interface ErrorPageProps {
  searchParams: Promise<{
    code?: string
    message?: string
    email?: string
  }>
}

type ErrorCode = "payment_failed" | "session_expired" | "email_mismatch" | "email_not_verified" | "pending_subscription_not_found" | "unknown"

const iconMap: Record<ErrorCode, React.ReactNode> = {
  payment_failed: <XCircle className="h-6 w-6 text-red-600" />,
  session_expired: <Clock className="h-6 w-6 text-yellow-600" />,
  email_mismatch: <Mail className="h-6 w-6 text-yellow-600" />,
  email_not_verified: <Mail className="h-6 w-6 text-yellow-600" />,
  pending_subscription_not_found: <HelpCircle className="h-6 w-6 text-yellow-600" />,
  unknown: <AlertCircle className="h-6 w-6 text-red-600" />,
}

function getActionHref(code: ErrorCode, email?: string): string {
  switch (code) {
    case "payment_failed":
      return email ? `/subscribe?email=${encodeURIComponent(email)}` : "/subscribe"
    case "session_expired":
      return "/subscribe"
    case "email_mismatch":
      return email ? `/sign-in?email=${encodeURIComponent(email)}` : "/sign-in"
    case "email_not_verified":
      return "/sign-in"
    case "pending_subscription_not_found":
      return "/settings/billing"
    case "unknown":
    default:
      return "/subscribe"
  }
}

function getSecondaryActionHref(code: ErrorCode): string | null {
  switch (code) {
    case "payment_failed":
    case "pending_subscription_not_found":
    case "unknown":
      return "mailto:support@capsulenote.com"
    case "email_mismatch":
      return "/subscribe"
    default:
      return null
  }
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams
  const { code = "unknown", message, email } = params
  const t = await getTranslations("subscribe")

  const errorCode = (["payment_failed", "session_expired", "email_mismatch", "email_not_verified", "pending_subscription_not_found"].includes(code) ? code : "unknown") as ErrorCode

  const title = t(`error.types.${errorCode}.title`)
  const description = message || t(`error.types.${errorCode}.description`)
  const actionLabel = t(`error.types.${errorCode}.action`)
  const secondaryActionLabel = t.has(`error.types.${errorCode}.secondaryAction`)
    ? t(`error.types.${errorCode}.secondaryAction`)
    : null

  const actionHref = getActionHref(errorCode, email)
  const secondaryActionHref = getSecondaryActionHref(errorCode)

  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Error Alert */}
        <Alert variant="destructive" className="border-4">
          {iconMap[errorCode]}
          <AlertTitle className="font-mono text-lg">{title}</AlertTitle>
          <AlertDescription className="font-mono text-sm">{description}</AlertDescription>
        </Alert>

        {/* Error Card with Actions */}
        <Card className="border-4 border-charcoal shadow-lg">
          <CardHeader>
            <CardTitle className="text-center font-mono text-2xl uppercase tracking-wide">
              {t("error.whatToDoNext")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Action */}
            <div className="space-y-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full"
              >
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>

              {/* Secondary Action */}
              {secondaryActionLabel && secondaryActionHref && (
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
                </Button>
              )}
            </div>

            {/* Support Info */}
            <div className="rounded-lg border-2 border-charcoal bg-off-white p-4">
              <p className="font-mono text-sm text-charcoal">
                <strong>{t("error.needHelp")}</strong>
                <br />
                {t("error.contactSupport")}{" "}
                <a
                  href="mailto:support@capsulenote.com"
                  className="underline hover:opacity-70"
                >
                  support@capsulenote.com
                </a>
                <br />
                {errorCode !== "unknown" && (
                  <>
                    {t("error.errorCode")} <code className="rounded bg-gray-200 px-1">{errorCode}</code>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return to Homepage */}
        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">{t("error.returnHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
