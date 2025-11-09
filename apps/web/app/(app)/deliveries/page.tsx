import { getDeliveries } from "@/server/actions/deliveries"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"

export default async function DeliveriesPage() {
  const deliveries = await getDeliveries()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deliveries</h1>
        <p className="text-muted-foreground">All your scheduled and past deliveries</p>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No deliveries scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Link key={delivery.id} href={`/letters/${delivery.letterId}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{delivery.letter.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(delivery.deliverAt)} ({delivery.timezoneAtCreation})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      via {delivery.channel === "email" ? "Email" : "Physical Mail"}
                    </p>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
