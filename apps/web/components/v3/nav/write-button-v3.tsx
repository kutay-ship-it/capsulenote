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

  // Hide button on letters pages (list and new letter)
  const isLettersPage = pathname?.includes("/letters")

  if (isLettersPage) {
    return null
  }

  return (
    <Link href="/letters/new">
      <Button size="sm" className="gap-2">
        <PenLine className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </Link>
  )
}
