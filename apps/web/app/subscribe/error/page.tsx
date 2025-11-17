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
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, XCircle, Clock, Mail, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Payment Error - Capsule Note",
  description: "There was an issue with your payment. Please try again or contact support.",
}

interface ErrorPageProps {
  searchParams: Promise<{
    code?: string
    message?: string
    email?: string
  }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams
  const { code = "unknown", message, email } = params

  // Error configurations
  const errorConfig: Record<
    string,
    {
      title: string
      description: string
      icon: React.ReactNode
      action: {
        label: string
        href: string
        variant?: "default" | "secondary" | "outline"
      }
      secondaryAction?: {
        label: string
        href: string
      }
    }
  > = {
    payment_failed: {
      title: "Payment Failed",
      description:
        "Your payment could not be processed. This could be due to insufficient funds, an expired card, or other payment issues. Please check your payment method and try again.",
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      action: {
        label: "Try Again",
        href: email ? `/subscribe?email=${encodeURIComponent(email)}` : "/subscribe",
        variant: "secondary",
      },
      secondaryAction: {
        label: "Contact Support",
        href: "mailto:support@capsulenote.com",
      },
    },
    session_expired: {
      title: "Checkout Session Expired",
      description:
        "Your checkout session has expired for security reasons. Sessions are valid for 24 hours. Please start a new checkout to subscribe.",
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      action: {
        label: "Start Over",
        href: "/subscribe",
        variant: "secondary",
      },
    },
    email_mismatch: {
      title: "Email Mismatch",
      description:
        "The email address in your checkout session doesn't match your account. For security, you must sign in with the same email used for payment.",
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      action: {
        label: "Sign In",
        href: `/sign-in${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        variant: "secondary",
      },
      secondaryAction: {
        label: "Start New Checkout",
        href: "/subscribe",
      },
    },
    email_not_verified: {
      title: "Email Not Verified",
      description:
        "You must verify your email address before your subscription can be activated. Check your inbox for a verification email from Capsule Note.",
      icon: <Mail className="h-6 w-6 text-yellow-600" />,
      action: {
        label: "Resend Verification Email",
        href: "/sign-in",
        variant: "secondary",
      },
    },
    pending_subscription_not_found: {
      title: "Subscription Not Found",
      description:
        "We couldn't find your pending subscription. This might mean it has expired or was already activated. Please contact support if you believe this is an error.",
      icon: <HelpCircle className="h-6 w-6 text-yellow-600" />,
      action: {
        label: "Check Billing",
        href: "/settings/billing",
        variant: "secondary",
      },
      secondaryAction: {
        label: "Contact Support",
        href: "mailto:support@capsulenote.com",
      },
    },
    unknown: {
      title: "Something Went Wrong",
      description:
        message ||
        "An unexpected error occurred during checkout. Please try again or contact support if the problem persists.",
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      action: {
        label: "Try Again",
        href: "/subscribe",
        variant: "secondary",
      },
      secondaryAction: {
        label: "Contact Support",
        href: "mailto:support@capsulenote.com",
      },
    },
  }

  const config = errorConfig[code] || errorConfig.unknown

  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Error Alert */}
        <Alert variant="destructive" className="border-4">
          {config.icon}
          <AlertTitle className="font-mono text-lg">{config.title}</AlertTitle>
          <AlertDescription className="font-mono text-sm">{config.description}</AlertDescription>
        </Alert>

        {/* Error Card with Actions */}
        <Card className="border-4 border-charcoal shadow-lg">
          <CardHeader>
            <CardTitle className="text-center font-mono text-2xl uppercase tracking-wide">
              What to Do Next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Action */}
            <div className="space-y-3">
              <Button
                asChild
                size="lg"
                variant={config.action.variant || "secondary"}
                className="w-full"
              >
                <Link href={config.action.href}>{config.action.label}</Link>
              </Button>

              {/* Secondary Action */}
              {config.secondaryAction && (
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href={config.secondaryAction.href}>{config.secondaryAction.label}</Link>
                </Button>
              )}
            </div>

            {/* Support Info */}
            <div className="rounded-lg border-2 border-charcoal bg-off-white p-4">
              <p className="font-mono text-sm text-charcoal">
                <strong>Need Help?</strong>
                <br />
                Contact our support team at{" "}
                <a
                  href="mailto:support@capsulenote.com"
                  className="underline hover:opacity-70"
                >
                  support@capsulenote.com
                </a>
                <br />
                {code !== "unknown" && (
                  <>
                    Error Code: <code className="rounded bg-gray-200 px-1">{code}</code>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return to Homepage */}
        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
