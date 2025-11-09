import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { FileText, Home, Mail, Settings } from "lucide-react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="text-xl font-bold">DearMe</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 transition-colors hover:text-foreground/80"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/letters"
                className="flex items-center gap-2 transition-colors hover:text-foreground/80"
              >
                <FileText className="h-4 w-4" />
                Letters
              </Link>
              <Link
                href="/deliveries"
                className="flex items-center gap-2 transition-colors hover:text-foreground/80"
              >
                <Mail className="h-4 w-4" />
                Deliveries
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 transition-colors hover:text-foreground/80"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}
