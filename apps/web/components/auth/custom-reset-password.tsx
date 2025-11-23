"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "request" | "reset"

export function CustomResetPasswordForm() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<Step>("request")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })

      if (result.status === "needs_first_factor") {
        setStep("reset")
      } else {
        setError("Unable to start reset. Please try again.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Failed to start reset.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Invalid code or password. Please try again.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Reset failed.")
    } finally {
      setIsSubmitting(false)
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

      {step === "request" ? (
        <form onSubmit={handleRequest} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? "Sending code..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
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
            <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {email}.</p>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </div>
  )
}

