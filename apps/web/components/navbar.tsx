import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  isSignedIn?: boolean
}

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-charcoal bg-white">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:-translate-y-0.5">
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

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#write-letter"
            className="font-mono text-sm uppercase tracking-wide text-charcoal transition-colors hover:text-duck-blue"
          >
            Try Editor
          </Link>
          <Link
            href="#how-it-works"
            className="font-mono text-sm uppercase tracking-wide text-charcoal transition-colors hover:text-duck-blue"
          >
            How It Works
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="font-mono uppercase tracking-wide"
                style={{
                  borderRadius: "2px",
                  boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                }}
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-charcoal font-mono uppercase tracking-wide"
                  style={{ borderRadius: "2px" }}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="font-mono uppercase tracking-wide"
                  style={{
                    borderRadius: "2px",
                    boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
