"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/sandbox", label: "Home" },
  { href: "/sandbox/editor", label: "Editor" },
  { href: "/sandbox/dashboard", label: "Dashboard" },
  { href: "/sandbox/upcoming", label: "Upcoming" },
  { href: "/sandbox/inbox", label: "Inbox" },
  { href: "/sandbox/aftercare", label: "Aftercare" },
  { href: "/sandbox/retention", label: "Retention" },
  { href: "/sandbox/settings", label: "Settings" },
]

export function SandboxNav() {
  const pathname = usePathname()
  return (
    <header className="border-b-2 border-charcoal bg-white">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="font-mono text-xs uppercase text-gray-secondary">Sandbox</p>
          <h1 className="font-mono text-xl uppercase tracking-wide text-charcoal">Experience Lab</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "border-2 border-charcoal font-mono text-xs uppercase",
                    active ? "" : "bg-white text-charcoal"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
