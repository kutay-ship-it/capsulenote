import Link from "next/link"
import { notFound } from "next/navigation"
import { getLetter } from "@/server/actions/letters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import { Mail, Calendar, ArrowLeft } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

export default async function LetterDetailPage({ params }: PageProps) {
  let letter
  try {
    letter = await getLetter(params.id)
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/letters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Letters
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{letter.title}</CardTitle>
              <CardDescription>Created {formatDateTime(letter.createdAt)}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/letters/${letter.id}/schedule`}>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Delivery
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
          />

          {letter.deliveries.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Scheduled Deliveries</h3>
              <div className="space-y-2">
                {letter.deliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {delivery.channel === "email" ? "Email" : "Physical Mail"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(delivery.deliverAt)} ({delivery.timezoneAtCreation})
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            delivery.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : delivery.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : delivery.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {delivery.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
