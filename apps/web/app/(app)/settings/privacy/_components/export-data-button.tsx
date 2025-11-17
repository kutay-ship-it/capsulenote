/**
 * Export Data Button Component
 *
 * Client component for initiating GDPR data export.
 * Downloads comprehensive JSON export of all user data.
 */

"use client"

import { useState } from "react"
import { exportUserData } from "@/server/actions/gdpr"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const result = await exportUserData()

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: result.error.message,
        })
        return
      }

      // Trigger download
      const link = document.createElement("a")
      link.href = result.data.downloadUrl
      link.download = result.data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Data Export Complete",
        description: `Your data has been exported successfully to ${result.data.filename}`,
      })
    } catch (error) {
      console.error("[Export Data] Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download My Data
        </>
      )}
    </Button>
  )
}
