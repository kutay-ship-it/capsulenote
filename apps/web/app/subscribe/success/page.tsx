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
import { prisma } from "@/server/lib/db"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { SuccessSignupForm } from "../_components/success-signup-form"

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
    <div className="container px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Success Banner */}
        <Alert className="border-4 border-charcoal bg-duck-blue">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="font-mono text-lg">Payment Successful!</AlertTitle>
          <AlertDescription className="font-mono">
            Your payment for <strong>{planName}</strong> has been processed.
            <br />
            Complete your signup below to activate your subscription.
          </AlertDescription>
        </Alert>

        {/* Signup Card */}
        <Card className="border-4 border-charcoal shadow-lg">
          <CardHeader>
            <CardTitle className="text-center font-mono text-2xl uppercase tracking-wide">
              Complete Your Signup
            </CardTitle>
            <p className="text-center font-mono text-sm text-gray-secondary">
              Create your account to activate your subscription
            </p>
          </CardHeader>
          <CardContent>
            <SuccessSignupForm email={email} />
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="rounded-lg border-2 border-charcoal bg-off-white p-4">
          <p className="font-mono text-sm text-charcoal">
            <strong>🔒 Security Notice:</strong>
            <br />
            You must verify your email address before your subscription is activated. Check your
            inbox for a verification email from Capsule Note.
          </p>
        </div>
      </div>
    </div>
  )
}
