"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface ReferralShareV3Props {
  code: string
  link: string
}

/**
 * V3 Referral Code Share Component
 * Displays the referral code with copy functionality
 */
export function ReferralShareV3({ code, link }: ReferralShareV3Props) {
  const t = useTranslations("settings.referral.share")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success(t("copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error(t("copyFailed"))
    }
  }

  return (
    <div
      className="flex items-center gap-3 border-2 border-charcoal bg-off-white p-4"
      style={{ borderRadius: "2px" }}
    >
      <code className="flex-1 font-mono text-lg font-bold text-charcoal">
        {code}
      </code>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 border-2 border-charcoal bg-white px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal transition-all hover:-translate-y-0.5 hover:bg-duck-yellow hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            {t("copiedButton")}
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            {t("copyButton")}
          </>
        )}
      </button>
    </div>
  )
}
