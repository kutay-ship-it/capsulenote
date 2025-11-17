"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { TemplateModal } from "./TemplateModal"
import type { TemplateSelectorProps } from "../types"

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        Templates
      </label>

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        <FileText className="mr-2 h-4 w-4" />
        Browse Templates
      </Button>

      <TemplateModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(template) => {
          // Confirm before replacing content
          if (window.confirm('Replace current content with this template?')) {
            onSelect(template)
          }
        }}
      />
    </div>
  )
}
