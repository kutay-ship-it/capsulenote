"use client"

import { useState } from "react"
import { AlertCircle, RefreshCw, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { retryDelivery } from "@/server/actions/deliveries"
import {
  getErrorRecoveryInfo,
  parseDeliveryError,
  SUPPORT_INFO,
} from "@/lib/error-recovery"

interface DeliveryErrorCardProps {
  deliveryId: string
  lastError: string | null
  attemptCount: number
  letterTitle: string
}

/**
 * Delivery Error Card Component
 *
 * Shows error details for failed deliveries with recovery actions:
 * - User-friendly error message
 * - Retry button (if retryable)
 * - Support contact link
 * - Error categorization
 */
export function DeliveryErrorCard({
  deliveryId,
  lastError,
  attemptCount,
  letterTitle,
}: DeliveryErrorCardProps) {
  const { toast } = useToast()
  const t = useTranslations("components.deliveryError")
  const [isRetrying, setIsRetrying] = useState(false)

  // Parse error
  const { code, message } = parseDeliveryError(lastError)
  const errorInfo = getErrorRecoveryInfo(code, message)

  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true)

    try {
      const result = await retryDelivery(deliveryId)

      if (result.success) {
        toast({
          title: t("toasts.retryScheduled.title"),
          description: t("toasts.retryScheduled.description", { title: letterTitle }),
        })
      } else {
        toast({
          variant: "destructive",
          title: t("toasts.retryFailed.title"),
          description: result.error.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("toasts.error.title"),
        description: error instanceof Error ? error.message : t("toasts.error.description"),
      })
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card
      className="border-2 border-coral bg-coral-light"
      style={{ borderRadius: "2px" }}
    >
      <CardContent className="p-4 space-y-4">
        {/* Error Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-charcoal bg-coral"
            style={{ borderRadius: "2px" }}
          >
            <AlertCircle className="h-5 w-5 text-charcoal" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              {t("title")}
            </h4>
            <p className="mt-1 font-mono text-xs text-gray-secondary">
              {errorInfo.category === "retryable" && t("categories.retryable")}
              {errorInfo.category === "user_action_required" && t("categories.actionRequired")}
              {errorInfo.category === "permanent" && t("categories.permanent")}
            </p>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="font-mono text-sm text-charcoal">
            {errorInfo.userMessage}
          </p>
          {errorInfo.suggestedAction && (
            <p className="font-mono text-xs text-gray-secondary">
              💡 {errorInfo.suggestedAction}
            </p>
          )}
        </div>

        {/* Attempt Count */}
        {attemptCount > 1 && (
          <p className="font-mono text-xs text-gray-secondary">
            {t("attemptCount", { count: attemptCount })}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {errorInfo.canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="border-2 border-charcoal bg-duck-blue hover:bg-duck-blue-dark font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
              size="sm"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                strokeWidth={2}
              />
              {isRetrying ? t("actions.retrying") : t("actions.retryDelivery")}
            </Button>
          )}

          {errorInfo.supportContact && (
            <Button
              asChild
              variant="outline"
              className="border-2 border-charcoal font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
              size="sm"
            >
              <a
                href={`mailto:${SUPPORT_INFO.email}?subject=${encodeURIComponent(
                  SUPPORT_INFO.subject
                )}&body=${encodeURIComponent(
                  `Delivery ID: ${deliveryId}\nLetter: ${letterTitle}\nError: ${errorInfo.technicalMessage}\n\nPlease describe the issue:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="mr-2 h-4 w-4" strokeWidth={2} />
                {t("actions.contactSupport")}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
