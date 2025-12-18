/**
 * Email Capture Form Component
 *
 * Captures email for anonymous checkout if not provided in query params.
 * Client component with validation and error handling.
 */

"use client"

import { useState } from "react"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"

import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "@/i18n/routing"

interface EmailCaptureFormProps {
  /** Optional letter ID to pass along */
  letterId?: string
}

export function EmailCaptureForm({ letterId }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("subscribe.emailForm")

  const emailSchema = z.string().email(t("error.invalid"))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Validate email
    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid email")
      return
    }

    // Build query params
    const params = new URLSearchParams(searchParams.toString())
    params.set("email", email)
    if (letterId) {
      params.set("letterId", letterId)
    }

    // Redirect to same page with email in query
    router.push({ pathname: "/subscribe", query: Object.fromEntries(params.entries()) })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wide text-charcoal">
          {t("label")}
        </Label>
        <InputGroup>
          <InputGroupAddon position="start">
            <Mail className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            autoFocus
            autoComplete="email"
            required
          />
        </InputGroup>
        {error && (
          <p className="font-mono text-xs text-red-600">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        variant="secondary"
        className="w-full"
      >
        {t("submit")}
      </Button>

      <p className="font-mono text-xs text-center text-gray-secondary">
        {t("helper")}
      </p>
    </form>
  )
}
