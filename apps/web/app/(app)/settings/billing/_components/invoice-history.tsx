import { prisma } from "@/server/lib/db"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, Download } from "lucide-react"
import Link from "next/link"
import type { Payment } from "@dearme/prisma"

interface InvoiceHistoryProps {
  userId: string
}

function getStatusBadge(status: Payment['status']) {
  switch (status) {
    case 'succeeded':
      return (
        <Badge
          className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Paid
        </Badge>
      )
    case 'pending':
      return (
        <Badge
          className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
          style={{ borderRadius: "2px" }}
        >
          Pending
        </Badge>
      )
    case 'failed':
      return (
        <Badge
          className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
          style={{ borderRadius: "2px" }}
        >
          Failed
        </Badge>
      )
    case 'refunded':
      return (
        <Badge
          className="border-2 border-charcoal bg-gray-200 font-mono text-xs uppercase text-gray-secondary"
          style={{ borderRadius: "2px" }}
        >
          Refunded
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

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export async function InvoiceHistory({ userId }: InvoiceHistoryProps) {
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
              Payment History
            </h3>
            <p className="font-mono text-xs text-gray-secondary">
              Recent invoices and payments
            </p>
          </div>
        </div>

        <div
          className="border-2 border-charcoal bg-bg-yellow-pale p-8 text-center"
          style={{ borderRadius: "2px" }}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-secondary mb-3" strokeWidth={1.5} />
          <p className="font-mono text-sm text-gray-secondary">
            No payment history yet
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
            Payment History
          </h3>
          <p className="font-mono text-xs text-gray-secondary">
            Last {payments.length} payment{payments.length !== 1 ? 's' : ''}
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
                  {getStatusBadge(payment.status)}
                </div>
                <p className="font-mono text-xs text-gray-secondary">
                  Payment ID: {payment.stripePaymentIntentId?.slice(0, 20)}...
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
                    Invoice
                    <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-gray-secondary text-center pt-2">
        View all invoices in the{" "}
        <span className="text-charcoal font-medium">Stripe Customer Portal</span>
      </p>
    </div>
  )
}
