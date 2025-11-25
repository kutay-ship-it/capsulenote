import { format } from "date-fns"
import { Lock, Mail, ArrowUpRight } from "lucide-react"

import { Link } from "@/i18n/routing"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"
import { V2Card } from "@/components/v2/design-system"

interface LetterGridV2Props {
    letters: LetterWithPreview[]
}

export function LetterGridV2({ letters }: LetterGridV2Props) {
    if (letters.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.map((letter) => {
                const isDelivered = letter.delivery?.status === 'sent'

                return (


                    <Link
                        key={letter.id}
                        href={`/letters-v2/${letter.id}` as any}
                        className="group block"
                    >
                        <V2Card
                            elevation="hover"
                            className="h-full p-6 border-stone-100"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${isDelivered ? 'bg-teal-50 text-teal-600' : 'bg-stone-50 text-stone-400'}`}>
                                    {isDelivered ? <Mail className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-mono text-stone-400">
                                    {format(new Date(letter.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>

                            <h3 className="font-serif text-lg font-medium text-charcoal mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                {letter.title || "Untitled Letter"}
                            </h3>

                            <p className="text-sm text-stone-500 line-clamp-3 mb-6 font-serif leading-relaxed">
                                {letter.bodyPreview || "No preview available..."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDelivered ? 'text-teal-600' : 'text-stone-400'}`}>
                                    {isDelivered ? 'Delivered' : 'Scheduled'}
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-charcoal transition-colors" />
                            </div>
                        </V2Card>
                    </Link>
                )
            })}
        </div>
    )
}
