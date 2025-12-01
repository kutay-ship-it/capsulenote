import type { ReactNode } from "react"
import { UserButton } from "@clerk/nextjs"
import { BookOpen, PenLine, Settings, Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { EmailLockGuard } from "@/components/auth/email-lock-guard"
import { Link } from "@/i18n/routing"
import { V2Background } from "@/components/v2/design-system"

export default async function AppV2Layout({
    children,
    params,
}: {
    children: ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "app" })

    return (
        <EmailLockGuard>
            <div className="min-h-screen bg-[#FDFBF7] text-charcoal font-sans selection:bg-teal-primary/20 relative isolate">
                <V2Background />
                {/* Navigation - Minimal & Centered */}
                <header className="sticky top-0 z-50 w-full bg-[#FDFBF7]/80 backdrop-blur-sm border-b border-stone-200/50">
                    <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">

                        {/* Brand - Subtle */}
                        <Link href="/dashboard-v2" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-charcoal text-[#FDFBF7] rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
                                <span className="font-serif font-bold text-lg">C</span>
                            </div>
                            <span className="font-serif text-lg font-medium tracking-tight group-hover:text-teal-primary transition-colors">
                                Capsule<span className="text-teal-primary">Note</span>
                            </span>
                        </Link>

                        {/* Center Nav - Focus on Actions */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link
                                href="/dashboard-v2"
                                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-charcoal transition-colors"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Journey</span>
                            </Link>
                            <Link
                                href="/letters-v2"
                                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-charcoal transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>Letters</span>
                            </Link>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <Link href="/letters-v2/new">
                                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-charcoal text-[#FDFBF7] rounded-full text-sm font-medium hover:bg-teal-primary transition-colors shadow-sm hover:shadow-md">
                                    <PenLine className="w-4 h-4" />
                                    <span>Write Letter</span>
                                </button>
                            </Link>
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8"
                                }
                            }} />
                        </div>
                    </div>
                </header>

                {/* Main Content - Centered & Focused */}
                <main className="container mx-auto max-w-5xl px-4 py-12 animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </EmailLockGuard>
    )
}
