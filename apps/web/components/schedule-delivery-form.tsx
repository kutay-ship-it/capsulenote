"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Mail as MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ScheduleDeliveryFormProps {
  letterId: string
  letterTitle: string
  letterPreview: string
  userEmail: string
}

export function ScheduleDeliveryForm({
  letterId,
  letterTitle,
  letterPreview,
  userEmail,
}: ScheduleDeliveryFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [channel, setChannel] = useState<"email" | "mail">("email")
  const [recipientEmail, setRecipientEmail] = useState(userEmail)
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [deliverTime, setDeliverTime] = useState("09:00")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date presets
  const datePresets = [
    { label: "6 Months", months: 6 },
    { label: "1 Year", months: 12 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 },
    { label: "10 Years", months: 120 },
  ]

  // Handle preset date selection
  const handlePresetDate = (months: number, label: string) => {
    const today = new Date()
    const futureDate = new Date(today)
    futureDate.setMonth(futureDate.getMonth() + months)
    setDeliveryDate(futureDate)
    setSelectedPreset(label)
    setShowCustomDate(false)
  }

  // Handle custom date selection
  const handleCustomDateClick = () => {
    setShowCustomDate(!showCustomDate)
    if (!showCustomDate) {
      setSelectedPreset(null)
    }
  }

  // Get preview text (first 100 chars)
  const getPreviewText = (): string => {
    // Strip HTML tags
    const text = letterPreview.replace(/<[^>]*>/g, ' ')
    const cleaned = text.replace(/\s+/g, ' ').trim()

    if (cleaned.length > 100) {
      return cleaned.substring(0, 100) + "..."
    }
    return cleaned
  }

  // Format delivery date/time for display
  const formatDeliveryTime = (): string | null => {
    if (!deliveryDate) return null

    const dateTime = new Date(deliveryDate)
    const [hours, minutes] = deliverTime.split(':')
    dateTime.setHours(parseInt(hours), parseInt(minutes))

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const formatted = dateTime.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    const timeFormatted = dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    // Get timezone abbreviation
    const timezoneParts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    }).formatToParts(dateTime)
    const timezoneName = timezoneParts.find(part => part.type === 'timeZoneName')?.value || timezone

    return `${formatted} at ${timeFormatted} ${timezoneName}`
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a delivery date",
      })
      return
    }

    if (!recipientEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a recipient email",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const dateTime = new Date(deliveryDate)
      const [hours, minutes] = deliverTime.split(':')
      dateTime.setHours(parseInt(hours), parseInt(minutes))

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      await scheduleDelivery({
        letterId,
        channel,
        deliverAt: dateTime,
        timezone,
        toEmail: recipientEmail,
      })

      toast({
        title: "✓ Delivery Scheduled",
        description: `Your letter will arrive on ${formatDeliveryTime()}`,
      })

      router.push(`/letters/${letterId}`)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Letter Preview Card */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-lavender-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
            Letter Preview
          </CardTitle>
          <CardDescription className="font-mono text-xs sm:text-sm">
            {letterTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0">
          <div className="rounded-sm border-2 border-charcoal bg-white p-4 font-mono text-sm text-charcoal">
            "{getPreviewText()}"
          </div>
        </CardContent>
      </Card>

      {/* Delivery Options Card */}
      <Card
        className="border-2 border-charcoal shadow-md bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
            Delivery Options
          </CardTitle>
          <CardDescription className="font-mono text-xs sm:text-sm">
            Choose when and how to deliver your letter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-6 pt-0">
          {/* Delivery Method */}
          <div className="space-y-3">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide">
              Delivery Method
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={channel === "email" ? "default" : "outline"}
                onClick={() => setChannel("email")}
                className={cn(
                  "border-2 border-charcoal font-mono h-auto py-4",
                  channel === "email" && "bg-charcoal text-cream hover:bg-gray-800"
                )}
                style={{ borderRadius: "2px" }}
              >
                <MailIcon className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="border-2 border-charcoal font-mono h-auto py-4 opacity-50"
                style={{ borderRadius: "2px" }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Physical Mail
                <Badge variant="outline" className="ml-2 text-xs">Soon</Badge>
              </Button>
            </div>
          </div>

          {/* Recipient Email (for email delivery) */}
          {channel === "email" && (
            <div className="space-y-2">
              <Label htmlFor="recipientEmail" className="font-mono text-sm font-normal uppercase tracking-wide">
                Send To
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              />
              <p className="font-mono text-xs text-gray-secondary">
                Your future self will receive this email
              </p>
            </div>
          )}

          {/* When to receive - Date Presets */}
          <div className="space-y-3">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide">
              When to Receive?
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {datePresets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant={selectedPreset === preset.label ? "default" : "outline"}
                  onClick={() => handlePresetDate(preset.months, preset.label)}
                  className={cn(
                    "border-2 border-charcoal font-mono text-xs sm:text-sm",
                    selectedPreset === preset.label && "bg-charcoal text-cream hover:bg-gray-800"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Button */}
            <Button
              type="button"
              variant={showCustomDate ? "default" : "outline"}
              onClick={handleCustomDateClick}
              className={cn(
                "w-full border-2 border-charcoal font-mono",
                showCustomDate && "bg-charcoal text-cream hover:bg-gray-800"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Custom Date
            </Button>

            {/* Custom Date Picker */}
            {showCustomDate && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customDate" className="font-mono text-xs">
                    Date
                  </Label>
                  <Input
                    id="customDate"
                    type="date"
                    value={deliveryDate ? deliveryDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDeliveryDate(new Date(e.target.value))
                        setSelectedPreset(null)
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-2 border-charcoal font-mono"
                    style={{ borderRadius: "2px" }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customTime" className="font-mono text-xs">
                    Time
                  </Label>
                  <Input
                    id="customTime"
                    type="time"
                    value={deliverTime}
                    onChange={(e) => setDeliverTime(e.target.value)}
                    className="border-2 border-charcoal font-mono"
                    style={{ borderRadius: "2px" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delivery Time Preview */}
          {deliveryDate && (
            <div className="rounded-sm border-2 border-charcoal bg-bg-green-light p-4">
              <p className="font-mono text-sm text-charcoal">
                <strong className="font-normal">Will arrive:</strong>
                <br />
                {formatDeliveryTime()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/letters/${letterId}`)}
          disabled={isSubmitting}
          className="border-2 border-charcoal font-mono"
          style={{ borderRadius: "2px" }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !deliveryDate}
          className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
          style={{ borderRadius: "2px" }}
        >
          {isSubmitting ? "Scheduling..." : "Schedule Delivery"}
          <MailIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
