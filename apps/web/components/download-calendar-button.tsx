"use client"

import { Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateDeliveryCalendarEvent, createICSBlob } from "@/lib/calendar"
import { useToast } from "@/hooks/use-toast"

interface DownloadCalendarButtonProps {
  letterTitle: string
  deliveryDate: Date | string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

/**
 * Download Calendar Button Component
 *
 * Generates and downloads a .ics calendar file for a delivery reminder.
 * Works with all major calendar apps (Google Calendar, Apple Calendar, Outlook, etc.)
 */
export function DownloadCalendarButton({
  letterTitle,
  deliveryDate,
  deliveryMethod,
  recipientEmail,
  className = "",
  variant = "outline",
  size = "sm",
}: DownloadCalendarButtonProps) {
  const { toast } = useToast()

  const handleDownload = (e: React.MouseEvent) => {
    // Prevent event propagation to parent Link
    e.preventDefault()
    e.stopPropagation()

    try {
      // Convert string to Date if needed
      const date = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate

      // Generate .ics file content
      const icsContent = generateDeliveryCalendarEvent(
        letterTitle,
        date,
        deliveryMethod,
        recipientEmail
      )

      // Create blob and download
      const blob = createICSBlob(icsContent)
      const url = URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `dearme-delivery-${letterTitle.toLowerCase().replace(/\s+/g, "-")}.ics`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "✓ Calendar Event Downloaded",
        description: "Add this to your calendar to remember when your letter arrives!",
      })
    } catch (error) {
      console.error("Failed to download calendar file:", error)

      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to create calendar file. Please try again.",
      })
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={className}
    >
      <Calendar className="mr-2 h-4 w-4" strokeWidth={2} />
      Add to Calendar
      <Download className="ml-1 h-3 w-3" strokeWidth={2} />
    </Button>
  )
}
