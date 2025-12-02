"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, Check, Gift, Users, CreditCard, Sparkles, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createReferralInvite } from "@/server/actions/referrals"

interface ReferralSectionProps {
  referralCode: string
  referralLink: string
  stats: {
    clicks: number
    signups: number
    conversions: number
    creditsEarned: number
  }
  referrals: Array<{
    id: string
    status: string
    createdAt: Date
    signedUpAt: Date | null
    convertedAt: Date | null
    rewardedAt: Date | null
  }>
  locale?: string
}

export function ReferralSection({
  referralCode,
  referralLink,
  stats,
  referrals,
  locale = "en",
}: ReferralSectionProps) {
  const t = useTranslations("referral")
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Refs for timeout cleanup to prevent memory leaks
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inviteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      if (inviteTimeoutRef.current) clearTimeout(inviteTimeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    // Clear any existing timeout
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)

    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInvite = async () => {
    setInviteError(null)
    setInviteSuccess(false)

    // Clear any existing timeout
    if (inviteTimeoutRef.current) clearTimeout(inviteTimeoutRef.current)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setInviteError(t("invite.errors.invalid_email"))
      return
    }

    startTransition(async () => {
      const result = await createReferralInvite(inviteEmail)

      if (result.success) {
        setInviteSuccess(true)
        setInviteEmail("")
        inviteTimeoutRef.current = setTimeout(() => setInviteSuccess(false), 3000)
      } else {
        // Map error to translation key
        const errorKey = result.error?.includes("rate")
          ? "rate_limited"
          : result.error?.includes("domain")
            ? "same_domain"
            : result.error?.includes("duplicate")
              ? "duplicate"
              : result.error?.includes("yourself")
                ? "self_referral"
                : "invalid_email"
        setInviteError(t(`invite.errors.${errorKey}`))
      }
    })
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return ""
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(dateObj)
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-600 border-gray-300"
      case "signed_up":
        return "bg-duck-blue/20 text-duck-blue border-duck-blue"
      case "converted":
        return "bg-mustard/20 text-charcoal border-mustard"
      case "rewarded":
        return "bg-lime/20 text-charcoal border-lime"
      case "expired":
        return "bg-coral/20 text-coral border-coral"
      default:
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card
        className="border-2 border-charcoal bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Gift className="h-5 w-5 text-charcoal" />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide">
                {t("heading")}
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary">
                {t("description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Share Link */}
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-charcoal">
              {t("shareLink.label")}
            </label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 border-2 border-charcoal bg-white font-mono text-sm"
                style={{ borderRadius: "2px" }}
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className={cn(
                  "border-2 border-charcoal min-w-[100px]",
                  copied
                    ? "bg-lime text-charcoal"
                    : "bg-white hover:bg-duck-yellow/20"
                )}
                style={{ borderRadius: "2px" }}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("shareLink.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("shareLink.copyButton")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              className="border-2 border-charcoal bg-white p-3"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-center gap-2 text-gray-secondary">
                <Users className="h-4 w-4" />
                <span className="font-mono text-xs uppercase">
                  {t("stats.clicks")}
                </span>
              </div>
              <p className="mt-1 font-mono text-2xl text-charcoal">
                {stats.clicks}
              </p>
            </div>
            <div
              className="border-2 border-charcoal bg-white p-3"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-center gap-2 text-gray-secondary">
                <Users className="h-4 w-4" />
                <span className="font-mono text-xs uppercase">
                  {t("stats.signups")}
                </span>
              </div>
              <p className="mt-1 font-mono text-2xl text-charcoal">
                {stats.signups}
              </p>
            </div>
            <div
              className="border-2 border-charcoal bg-white p-3"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-center gap-2 text-gray-secondary">
                <CreditCard className="h-4 w-4" />
                <span className="font-mono text-xs uppercase">
                  {t("stats.conversions")}
                </span>
              </div>
              <p className="mt-1 font-mono text-2xl text-charcoal">
                {stats.conversions}
              </p>
            </div>
            <div
              className="border-2 border-charcoal bg-lime/20 p-3"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex items-center gap-2 text-gray-secondary">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-xs uppercase">
                  {t("stats.creditsEarned")}
                </span>
              </div>
              <p className="mt-1 font-mono text-2xl text-charcoal">
                {stats.creditsEarned}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card
        className="border-2 border-charcoal"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide">
            {t("howItWorks.heading")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-start gap-3 flex-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal bg-duck-blue font-mono text-sm"
                style={{ borderRadius: "2px" }}
              >
                1
              </div>
              <p className="font-mono text-sm text-charcoal">
                {t("howItWorks.step1")}
              </p>
            </div>
            <div className="flex items-start gap-3 flex-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal bg-mustard font-mono text-sm"
                style={{ borderRadius: "2px" }}
              >
                2
              </div>
              <p className="font-mono text-sm text-charcoal">
                {t("howItWorks.step2")}
              </p>
            </div>
            <div className="flex items-start gap-3 flex-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal bg-lime font-mono text-sm"
                style={{ borderRadius: "2px" }}
              >
                3
              </div>
              <p className="font-mono text-sm text-charcoal">
                {t("howItWorks.step3")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Invite */}
      <Card
        className="border-2 border-charcoal"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide">
            {t("invite.heading")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder={t("invite.placeholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-2 border-charcoal pl-10 font-mono text-sm"
                style={{ borderRadius: "2px" }}
                disabled={isPending}
              />
            </div>
            <Button
              onClick={handleInvite}
              disabled={isPending || !inviteEmail}
              className={cn(
                "border-2 border-charcoal min-w-[120px]",
                inviteSuccess
                  ? "bg-lime text-charcoal"
                  : "bg-duck-yellow text-charcoal hover:bg-duck-yellow/80"
              )}
              style={{ borderRadius: "2px" }}
            >
              {isPending
                ? t("invite.sending")
                : inviteSuccess
                  ? t("invite.success")
                  : t("invite.button")}
            </Button>
          </div>
          {inviteError && (
            <p className="mt-2 font-mono text-xs text-coral">{inviteError}</p>
          )}
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card
        className="border-2 border-charcoal"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide">
            {t("referrals.heading")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="font-mono text-sm text-gray-secondary">
              {t("referrals.empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between border-2 border-charcoal p-3"
                  style={{ borderRadius: "2px" }}
                >
                  <div>
                    <p className="font-mono text-xs text-gray-secondary">
                      {t("referrals.invited")} {formatDate(referral.createdAt)}
                    </p>
                    {referral.signedUpAt && (
                      <p className="font-mono text-xs text-duck-blue">
                        {t("referrals.signedUp", {
                          date: formatDate(referral.signedUpAt),
                        })}
                      </p>
                    )}
                    {referral.convertedAt && (
                      <p className="font-mono text-xs text-mustard">
                        {t("referrals.converted", {
                          date: formatDate(referral.convertedAt),
                        })}
                      </p>
                    )}
                    {referral.rewardedAt && (
                      <p className="font-mono text-xs text-lime">
                        {t("referrals.rewarded", {
                          date: formatDate(referral.rewardedAt),
                        })}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs uppercase",
                      getStatusBadgeStyle(referral.status)
                    )}
                  >
                    {t(`status.${referral.status}` as const)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="font-mono text-xs text-gray-secondary">
        <strong>{t("terms.heading")}:</strong> {t("terms.text")}
      </div>
    </div>
  )
}
