"use client"

import { useState, useTransition } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<{ success: boolean }>
  placeholder?: string
  emptyText?: string
  successMessage?: string
  errorMessage?: string
}

export function EditableField({
  label,
  value,
  onSave,
  placeholder,
  emptyText = "Not set",
  successMessage = "Updated successfully",
  errorMessage = "Failed to update",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await onSave(editValue)
      if (result.success) {
        setIsEditing(false)
        toast.success(successMessage)
      } else {
        toast.error(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border-2 border-charcoal font-mono"
          style={{ borderRadius: "2px" }}
          disabled={isPending}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="border-2 border-charcoal bg-duck-yellow text-charcoal hover:bg-duck-yellow/80"
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="border-2 border-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p
        className={cn(
          "font-mono text-sm sm:text-base",
          value ? "text-charcoal" : "text-gray-secondary italic"
        )}
      >
        {value || emptyText}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="text-charcoal hover:bg-duck-yellow/20"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit {label}</span>
      </Button>
    </div>
  )
}
