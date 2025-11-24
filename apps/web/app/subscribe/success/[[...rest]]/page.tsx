/**
 * Subscribe Success Page
 *
 * Handles post-payment flow:
 * 1. Verify Stripe checkout session
 * 2. Check if user is authenticated
 * 3. If authenticated → Show success + redirect to dashboard
 * 4. If not authenticated → Show Clerk SignUp with locked email
 *
 * Server Component - verifies session server-side
 */

import * as React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { stripe } from "@/server/providers/stripe"
import { getCurrentUser } from "@/server/lib/auth"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"

import { CustomSignUpForm } from "@/components/auth/custom-sign-up"

export const metadata: Metadata = {
  title: "Payment Successful - Capsule Note",
  description: "Your payment was successful. Complete your signup to activate your subscription.",
}

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const { session_id } = params

  // Redirect to subscribe if no session ID
  if (!session_id) {
    redirect("/subscribe")
  }

  // Verify session with Stripe
  let session: any
  let email: string | null = null
  let planName: string = "Pro"

  try {
    session = await stripe.checkout.sessions.retrieve(session_id)

    // Get customer email
    if (session.customer_details?.email) {
      email = session.customer_details.email
    } else if (session.customer) {
      const customer = await stripe.customers.retrieve(session.customer as string)
      if ("email" in customer && customer.email) {
        email = customer.email
      }
    }

    // Get plan name from metadata or line items
    if (session.metadata?.plan) {
      planName = session.metadata.plan
    } else if (session.line_items?.data[0]) {
      planName = session.line_items.data[0].description || "Pro"
    }
  } catch (error) {
    console.error("[Success Page] Failed to retrieve session:", error)
    // Continue with fallback - webhook will handle linking
  }

  // Check if payment was successful
  const paymentSuccessful = session?.payment_status === "paid"

  if (!paymentSuccessful) {
    return (
      <div className="container px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Not Complete</AlertTitle>
            <AlertDescription>
              Your payment has not been completed yet. Please check your email for payment
              instructions or try again.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button asChild variant="secondary">
              <a href="/subscribe">Return to Pricing</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is already authenticated
  const user = await currentUser()

  if (user) {
    // Ensure local user is created and pending subscription is linked before redirect
    try {
      await getCurrentUser()
    } catch (error) {
      console.error("[Success Page] Failed to sync user post-checkout", error)
    }

    // User is authenticated - show success and redirect to dashboard
    // The webhook or dashboard mount will link the subscription
    return (
      <div className="container px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <Card className="border-4 border-charcoal bg-duck-blue shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-charcoal">
                <CheckCircle className="h-10 w-10 text-duck-blue" />
              </div>
              <CardTitle className="font-mono text-3xl uppercase tracking-wide">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="font-mono text-base leading-relaxed text-charcoal">
                Your subscription to <strong>{planName}</strong> has been activated.
                <br />
                You can now start writing letters to your future self.
              </p>

              <div className="rounded-lg border-2 border-charcoal bg-off-white p-4">
                <p className="font-mono text-sm text-charcoal">
                  <strong>What's Next:</strong>
                  <br />
                  Head to your dashboard to write your first letter.
                </p>
              </div>

              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>

              <p className="font-mono text-xs text-gray-secondary">
                Redirecting automatically in 5 seconds...
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Auto-redirect after 5 seconds */}
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(() => { window.location.href = '/dashboard'; }, 5000);`,
          }}
        />
      </div>
    )
  }

  // User not authenticated - show signup form with locked email
  if (!email) {
    return (
      <div className="container px-4 py-12 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Retrieve Email</AlertTitle>
          <AlertDescription>
            We couldn't retrieve your email from the payment session. Please contact support with
            session ID: {session_id}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Success Banner - Fixed at top */}
      <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-4">
          <Alert className="border-2 border-green-600 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Payment Successful!</AlertTitle>
            <AlertDescription className="text-green-800">
              Your payment for <strong>{planName}</strong> has been processed. Complete your signup
              below to activate your subscription.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Centered Signup Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Complete Your Signup</h1>
            <p className="mt-2 text-muted-foreground">
              Create your account to activate your subscription
            </p>
          </div>

          <Card className="border-2 border-charcoal shadow-lg">
            <CardContent className="pt-6">
              <CustomSignUpForm lockedEmail={email} />
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="rounded-lg border border-muted bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>🔒 Security:</strong> You must verify your email address before your
              subscription is activated. Check your inbox for a verification email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
