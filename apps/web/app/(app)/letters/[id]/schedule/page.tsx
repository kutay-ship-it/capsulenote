"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { useToast } from "@/hooks/use-toast"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ScheduleDeliveryPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [channel, setChannel] = useState<"email" | "mail">("email")
  const [deliverAt, setDeliverAt] = useState("")
  const [deliverTime, setDeliverTime] = useState("09:00")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliverAt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a delivery date",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const dateTime = new Date(`${deliverAt}T${deliverTime}`)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      await scheduleDelivery({
        letterId: id,
        channel,
        deliverAt: dateTime,
        timezone,
      })

      toast({
        title: "Success",
        description: "Your delivery has been scheduled",
      })

      router.push(`/letters/${id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule delivery",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule Delivery</h1>
        <p className="text-muted-foreground">Choose when and how to deliver your letter</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Options</CardTitle>
            <CardDescription>Select your delivery method and schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={channel === "email" ? "default" : "outline"}
                  onClick={() => setChannel("email")}
                  className="flex-1"
                >
                  Email
                </Button>
                <Button
                  type="button"
                  variant={channel === "mail" ? "default" : "outline"}
                  onClick={() => setChannel("mail")}
                  className="flex-1"
                  disabled
                >
                  Physical Mail (Coming Soon)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliverAt">Delivery Date</Label>
              <Input
                id="deliverAt"
                type="date"
                value={deliverAt}
                onChange={(e) => setDeliverAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliverTime">Delivery Time</Label>
              <Input
                id="deliverTime"
                type="time"
                value={deliverTime}
                onChange={(e) => setDeliverTime(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Time in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Delivery"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
