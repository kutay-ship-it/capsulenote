import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { FileText, Home, Mail, Settings } from "lucide-react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation - MotherDuck brutalist style */}
      <header
        className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-off-white/70 backdrop-blur-md"
        style={{ height: "90px" }}
      >
        <div className="container flex h-full items-center">
          <div className="mr-8 flex">
            <Link
              href="/dashboard"
              className="mr-8 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
              <span className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                Capsule Note
              </span>
            </Link>
            <nav className="flex items-center space-x-8 font-mono text-base font-normal uppercase tracking-wide">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/letters"
                className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70"
              >
                <FileText className="h-5 w-5" />
                Letters
              </Link>
              <Link
                href="/deliveries"
                className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70"
              >
                <Mail className="h-5 w-5" />
                Deliveries
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 text-charcoal transition-opacity hover:opacity-70"
              >
                <Settings className="h-5 w-5" />
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
        <div className="container py-12">{children}</div>
      </main>
    </div>
  )
}
