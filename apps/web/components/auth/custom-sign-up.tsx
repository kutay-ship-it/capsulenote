"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomSignUpFormProps {
  lockedEmail?: string
}

type Step = "form" | "verify"

export function CustomSignUpForm({ lockedEmail }: CustomSignUpFormProps) {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()

  const [email, setEmail] = useState(lockedEmail || "")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<Step>("form")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (lockedEmail) {
      setEmail(lockedEmail)
    }
  }, [lockedEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    if (lockedEmail && email !== lockedEmail) {
      setError("Email must match the one used at checkout.")
      setIsSubmitting(false)
      return
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: lockedEmail ? { lockedEmail } : undefined,
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setStep("verify")
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Failed to start sign up.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Verification incomplete. Please try again.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid or expired code.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return
    setError(null)

    // Google OAuth doesn't support locked email flow - show error
    if (lockedEmail) {
      setError("Please use email/password signup to complete your checkout with this email.")
      return
    }

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Google sign up failed.")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "form" ? (
        <>
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!lockedEmail}
                className={lockedEmail ? "pointer-events-none opacity-70" : undefined}
              />
              {lockedEmail && (
                <p className="text-xs text-muted-foreground">
                  Email locked from checkout: {lockedEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {/* Clerk Smart CAPTCHA widget placeholder */}
            <div id="clerk-captcha" data-cl-theme="auto" data-cl-size="flexible" />

            <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? "Creating account..." : "Continue"}
            </Button>
          </form>

          {/* Show Google OAuth only if email is not locked */}
          {!lockedEmail && (
            <>
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={!isLoaded}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
        </>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to {email}.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>
      )}
    </div>
  )
}
