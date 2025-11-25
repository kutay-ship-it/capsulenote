"use client"

import { differenceInWeeks, addYears } from "date-fns"
import { V2Card } from "@/components/v2/design-system"

interface LifeInWeeksProps {
    birthDate: Date
}

export function LifeInWeeks({ birthDate }: LifeInWeeksProps) {
    const lifeExpectancyYears = 80
    const totalWeeks = lifeExpectancyYears * 52
    const weeksLived = differenceInWeeks(new Date(), birthDate)

    // We'll render a simplified version to avoid rendering 4000+ DOM nodes which is heavy
    // We'll show "Years" as rows, and just a visual representation

    const percentageLived = Math.min(100, Math.max(0, (weeksLived / totalWeeks) * 100))

    return (
        <V2Card className="p-8 border-stone-100 overflow-hidden relative">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4 relative z-10">
                    <h3 className="font-serif text-2xl text-charcoal">Your Life in Weeks</h3>
                    <p className="text-stone-500 max-w-md">
                        Each dot represents one week of your life. The filled dots are your past.
                        The empty ones are your future.
                    </p>

                    <div className="flex items-center gap-8 pt-4">
                        <div>
                            <div className="text-3xl font-light text-charcoal">{weeksLived.toLocaleString()}</div>
                            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Weeks Passed</div>
                        </div>
                        <div className="h-8 w-px bg-stone-200" />
                        <div>
                            <div className="text-3xl font-light text-teal-600">{(totalWeeks - weeksLived).toLocaleString()}</div>
                            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Weeks Left</div>
                        </div>
                    </div>
                </div>

                {/* Visual Abstract Representation */}
                <div className="flex-1 w-full">
                    <div className="relative h-4 bg-stone-100 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-charcoal"
                            style={{ width: `${percentageLived}%` }}
                        />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-stone-400 font-mono">
                        <span>Birth</span>
                        <span>Now ({Math.round(percentageLived)}%)</span>
                        <span>80 Years</span>
                    </div>

                    {/* Dot Grid Pattern Background */}
                    <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(4px,1fr))] gap-1 opacity-20 mask-image-gradient">
                        {Array.from({ length: 400 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 h-1 rounded-full ${i < (percentageLived * 4) ? 'bg-charcoal' : 'bg-stone-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </V2Card>
    )
}
