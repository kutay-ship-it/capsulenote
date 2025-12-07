"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { getIntlLocale } from "@/lib/date-formatting"
import { Eye, Monitor, Smartphone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmailPreviewModalProps {
  letterTitle: string
  letterContent: string // HTML content
  deliveryDate?: Date
  disabled?: boolean
}

export function EmailPreviewModal({
  letterTitle,
  letterContent,
  deliveryDate,
  disabled = false,
}: EmailPreviewModalProps) {
  const t = useTranslations("preview")
  const locale = useLocale()
  const intlLocale = getIntlLocale(locale)
  const [open, setOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  const formattedDate = deliveryDate
    ? deliveryDate.toLocaleDateString(intlLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("dateNotSet")

  // Generate a simple email preview HTML
  const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      padding: 32px 40px 24px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
    .intro {
      padding: 40px 40px 24px;
      text-align: center;
    }
    .intro h1 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .intro p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
    .letter-box {
      margin: 0 40px 32px;
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
    }
    .letter-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .letter-content {
      font-size: 15px;
      color: #374151;
      line-height: 1.7;
    }
    .letter-content h1, .letter-content h2, .letter-content h3 {
      color: #1a1a1a;
      margin-top: 0;
    }
    .letter-content ul, .letter-content ol {
      padding-left: 20px;
    }
    .letter-content li {
      margin-bottom: 8px;
    }
    .footer {
      padding: 24px 40px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div style="padding: 40px 20px; background-color: #f5f5f5;">
    <div class="container">
      <div class="header">
        <div class="logo">Capsule Note</div>
        <div class="tagline">Letters to Your Future Self</div>
      </div>
      <div class="intro">
        <h1>A Letter from Your Past Self</h1>
        <p>Delivered on ${formattedDate}</p>
      </div>
      <div class="letter-box">
        <div class="letter-title">${letterTitle || "Untitled Letter"}</div>
        <div class="letter-content">${letterContent || "<p>Your letter content will appear here...</p>"}</div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Capsule Note. Letters to your future self.
      </div>
    </div>
  </div>
</body>
</html>
  `

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="gap-2 border-2 border-charcoal font-mono text-sm"
          style={{ borderRadius: "2px" }}
        >
          <Eye className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogHeader className="border-b-2 border-charcoal p-4">
          <DialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
            {t("modalTitle")}
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-gray-secondary">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center gap-2 border-b border-charcoal/20 bg-off-white p-3">
          <Button
            type="button"
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
            className={cn(
              "gap-2 border-2 border-charcoal font-mono text-xs uppercase",
              viewMode === "desktop" && "bg-duck-blue text-charcoal"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Monitor className="h-4 w-4" />
            {t("desktop")}
          </Button>
          <Button
            type="button"
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
            className={cn(
              "gap-2 border-2 border-charcoal font-mono text-xs uppercase",
              viewMode === "mobile" && "bg-duck-blue text-charcoal"
            )}
            style={{ borderRadius: "2px" }}
          >
            <Smartphone className="h-4 w-4" />
            {t("mobile")}
          </Button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div
            className={cn(
              "mx-auto transition-all duration-300",
              viewMode === "desktop" ? "w-full max-w-[700px]" : "w-[375px]"
            )}
          >
            <div
              className="overflow-hidden border-2 border-charcoal bg-white"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <iframe
                srcDoc={previewHtml}
                className="w-full"
                style={{ height: viewMode === "desktop" ? "600px" : "700px" }}
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
