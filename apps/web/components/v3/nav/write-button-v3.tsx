"use client"

import { usePathname } from "next/navigation"
import { PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface WriteButtonV3Props {
  label: string
}

export function WriteButtonV3({ label }: WriteButtonV3Props) {
  const pathname = usePathname()

  // Hide button on letters-v3 pages (list and new letter)
  const isLettersV3Page = pathname?.includes("/letters-v3")

  if (isLettersV3Page) {
    return null
  }

  return (
    <Link href="/letters-v3/new">
      <Button size="sm" className="gap-2">
        <PenLine className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </Link>
  )
}
