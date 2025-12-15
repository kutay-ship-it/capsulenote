"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PenLine } from "lucide-react"

interface CustomSignInFormProps {
  prefillEmail?: string
}

// Clerk error codes for "user not found"
const USER_NOT_FOUND_CODES = [
  "form_identifier_not_found",
  "identifier_not_found",
  "form_param_nil",
]

export function CustomSignInForm({ prefillEmail }: CustomSignInFormProps) {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const t = useTranslations("auth.signIn")

  const [email, setEmail] = useState(prefillEmail || "")
  const [password, setPassword] = useState("")
  const [secondFactorCode, setSecondFactorCode] = useState("")
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNoAccountCta, setShowNoAccountCta] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setShowNoAccountCta(false)
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
        setError(t("errors.additionalVerification"))
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code
      if (USER_NOT_FOUND_CODES.includes(errorCode)) {
        setShowNoAccountCta(true)
        setError(null)
      } else {
        setError(err?.errors?.[0]?.message || t("errors.failed"))
      }
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
        setError(t("errors.invalidCode"))
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || t("errors.secondFactorFailed"))
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
      {showNoAccountCta && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-semibold">{t("noAccount.title")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noAccount.message")}
          </p>
          <Button asChild className="mt-4 w-full" size="lg">
            <a href="/#try-demo">
              <PenLine className="mr-2 h-4 w-4" />
              {t("noAccount.cta")}
            </a>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link href="/sign-up" className="text-primary underline hover:no-underline">
              {t("noAccount.signUpLink")}
            </Link>
          </p>
        </div>
      )}
      {needsSecondFactor ? (
        <form onSubmit={handleSecondFactor} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("twoFactor.label")}</Label>
            <Input
              type="text"
              value={secondFactorCode}
              onChange={(e) => setSecondFactorCode(e.target.value)}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <p className="text-xs text-muted-foreground">
              {t("twoFactor.helper")}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? t("twoFactor.verifying") : t("twoFactor.verify")}
          </Button>
        </form>
      ) : (
        <>
          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label>{t("password.label")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Link href="/reset-password" className="underline hover:text-primary">
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
