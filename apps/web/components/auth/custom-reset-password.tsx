"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "@/i18n/routing"

type Step = "request" | "reset"

function getClerkErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null
  const message = (error as { errors?: Array<{ message?: unknown }> }).errors?.[0]?.message
  return typeof message === "string" ? message : null
}

export function CustomResetPasswordForm() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const t = useTranslations("auth.resetPassword")

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
        setError(t("errors.unableToStart"))
      }
    } catch (error) {
      setError(getClerkErrorMessage(error) || t("errors.startFailed"))
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
        router.push("/journey")
      } else {
        setError(t("errors.invalidCodeOrPassword"))
      }
    } catch (error) {
      setError(getClerkErrorMessage(error) || t("errors.resetFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("email.label")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? t("sendingCode") : t("sendCode")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("verification.label")}</Label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">{t("verification.helper", { email })}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("newPassword.label")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? t("resetting") : t("reset")}
          </Button>
        </form>
      )}
    </div>
  )
}
