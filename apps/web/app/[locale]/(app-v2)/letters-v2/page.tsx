import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { PenLine } from "lucide-react"

import { Link } from "@/i18n/routing"
import { requireUser } from "@/server/lib/auth"
import { getLettersWithPreview } from "@/server/actions/redesign-dashboard"
import { LetterGridV2 } from "@/components/v2/letter-grid-v2"
import { Skeleton } from "@/components/skeletons"

// Force dynamic rendering
export const revalidate = 0

export default async function LettersV2Page() {
    const user = await requireUser()
    const t = await getTranslations("redesign.dashboard")

    const letters = await getLettersWithPreview("all")

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl text-charcoal mb-2">Your Letters</h1>
                    <p className="text-stone-500 font-sans">
                        Every message you've sent to your future self.
                    </p>
                </div>
                <Link href="/letters-v2/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-charcoal text-[#FDFBF7] rounded-full text-sm font-medium hover:bg-teal-primary transition-colors shadow-sm">
                        <PenLine className="w-4 h-4" />
                        <span>Write New</span>
                    </button>
                </Link>
            </div>

            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-stone-100 rounded-xl animate-pulse" />
                ))}
            </div>}>
                {letters.length > 0 ? (
                    <LetterGridV2 letters={letters} />
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-stone-100">
                        <h3 className="font-serif text-xl text-charcoal mb-2">No letters yet</h3>
                        <p className="text-stone-500 mb-6">Your future self is waiting to hear from you.</p>
                        <Link href="/letters-v2/new">
                            <button className="px-6 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors">
                                Write your first letter
                            </button>
                        </Link>
                    </div>
                )}
            </Suspense>
        </div>
    )
}
