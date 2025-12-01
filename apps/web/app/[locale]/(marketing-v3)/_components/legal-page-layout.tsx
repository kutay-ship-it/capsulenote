import { NavbarV3 } from "./navbar-v3"
import { Footer } from "./footer"

interface LegalPageLayoutProps {
  children: React.ReactNode
  showToc?: boolean
  tocSlot?: React.ReactNode
}

/**
 * Shared layout wrapper for all legal/info pages
 * Provides consistent navigation, footer, and content container
 *
 * V3 Design: Neo-brutalist with cream background
 */
export function LegalPageLayout({
  children,
  showToc = false,
  tocSlot,
}: LegalPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <NavbarV3 />

      <main className="flex-1 pt-6 pb-16 md:pt-10 md:pb-24">
        {showToc ? (
          // Two-column layout with TOC sidebar
          <div className="container grid lg:grid-cols-[280px_1fr] gap-8 px-4 sm:px-6">
            <aside className="hidden lg:block">
              <div className="sticky top-24">{tocSlot}</div>
            </aside>
            <article className="max-w-3xl">{children}</article>
          </div>
        ) : (
          // Single column layout
          <div className="container max-w-4xl px-4 sm:px-6">
            {children}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
