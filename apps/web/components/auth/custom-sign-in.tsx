"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomSignInFormProps {
  prefillEmail?: string
}

export function CustomSignInForm({ prefillEmail }: CustomSignInFormProps) {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [email, setEmail] = useState(prefillEmail || "")
  const [password, setPassword] = useState("")
  const [secondFactorCode, setSecondFactorCode] = useState("")
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else if (result.status === "needs_second_factor") {
        setNeedsSecondFactor(true)
        setError(null)
      } else {
        setError("Additional verification required. Please complete the next step.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign in failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSecondFactor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "totp",
        code: secondFactorCode,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Invalid code. Please try again.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Second factor failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    setError(null)

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Google sign in failed.")
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
      {needsSecondFactor ? (
        <form onSubmit={handleSecondFactor} className="space-y-4">
          <div className="space-y-2">
            <Label>Two-Factor Code</Label>
            <Input
              type="text"
              value={secondFactorCode}
              onChange={(e) => setSecondFactorCode(e.target.value)}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <p className="text-xs text-muted-foreground">
              Enter the code from your authenticator app.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>
      ) : (
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
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <a href="/reset-password" className="underline hover:text-primary">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

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
            onClick={handleGoogleSignIn}
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
    </div>
  )
}
