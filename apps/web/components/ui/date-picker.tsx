"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-mono uppercase tracking-wide h-[54px]",
            !date && "text-gray-secondary"
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-2 border-charcoal bg-white"
        style={{
          borderRadius: "2px",
          boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)"
        }}
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={(date) => {
            if (minDate) {
              return date < minDate
            }
            return false
          }}
          initialFocus
          className="font-mono"
        />
      </PopoverContent>
    </Popover>
  )
}
