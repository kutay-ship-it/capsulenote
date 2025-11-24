import { FileText, ExternalLink, Download } from "lucide-react"
import type { Payment } from "@dearme/prisma"
import { getTranslations } from "next-intl/server"

import { prisma } from "@/server/lib/db"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"

interface InvoiceHistoryProps {
  userId: string
  locale: string
}

function getStatusBadge(status: Payment["status"], t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (status) {
    case "succeeded":
      return (
        <Badge
          className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.active")}
        </Badge>
      )
    case "pending":
      return (
        <Badge
          className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.incomplete")}
        </Badge>
      )
    case "failed":
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.unpaid")}
        </Badge>
      )
    case "refunded":
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase text-gray-secondary"
          style={{ borderRadius: "2px" }}
        >
          {t("subscription.status.canceled")}
        </Badge>
      )
    default:
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          {status}
        </Badge>
      )
  }
}

export async function InvoiceHistory({ userId, locale }: InvoiceHistoryProps) {
  const t = await getTranslations("billing")
  const formatCurrency = (cents: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(date)

  // Get last 5 payments
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  if (payments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
            style={{ borderRadius: "2px" }}
          >
            <FileText className="h-6 w-6 text-charcoal" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
              {t("invoices.heading")}
            </h3>
            <p className="font-mono text-xs text-gray-secondary">
              {t("invoices.subtitle")}
            </p>
          </div>
        </div>

        <div
          className="border-2 border-charcoal bg-bg-yellow-pale p-8 text-center"
          style={{ borderRadius: "2px" }}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-secondary mb-3" strokeWidth={1.5} />
          <p className="font-mono text-sm text-gray-secondary">
            {t("invoices.empty")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <FileText className="h-6 w-6 text-charcoal" strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-mono text-lg font-normal uppercase tracking-wide text-charcoal">
            {t("invoices.heading")}
          </h3>
          <p className="font-mono text-xs text-gray-secondary">
            {t("invoices.count", { count: payments.length })}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="border-2 border-charcoal bg-white p-4"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium text-charcoal">
                    {formatDate(payment.createdAt)}
                  </p>
                  {getStatusBadge(payment.status, t)}
                </div>
                <p className="font-mono text-xs text-gray-secondary">
                  {t("invoices.paymentId", { id: `${payment.stripePaymentIntentId?.slice(0, 20)}...` })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-mono text-lg font-medium text-charcoal">
                  {formatCurrency(payment.amountCents, payment.currency)}
                </p>

                {payment.metadata && typeof payment.metadata === 'object' && 'invoiceUrl' in payment.metadata && typeof payment.metadata.invoiceUrl === 'string' && (
                  <Link
                    href={payment.metadata.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-charcoal hover:text-gray-secondary transition-colors"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    {t("invoices.invoice")}
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-gray-secondary text-center pt-2">
        {t("invoices.footer")}
      </p>
    </div>
  )
}
