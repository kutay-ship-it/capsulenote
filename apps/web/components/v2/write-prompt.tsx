"use client"

import { useState, useEffect } from "react"
import { ArrowRight, PenLine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Link } from "@/i18n/routing"

const prompts = [
    "What does future-you need to hear right now?",
    "What would you tell yourself in 5 years?",
    "What moment do you want to remember forever?",
    "What are you proud of today?",
    "What advice would help you next year?",
    "What dreams are you chasing right now?",
    "What lesson would you share with your future self?",
]

export function WritePrompt() {
    const [promptIndex, setPromptIndex] = useState(0)

    useEffect(() => {
        // Rotate prompt every 10 seconds? Or just random on mount?
        // Let's do random on mount for now to avoid distraction
        setPromptIndex(Math.floor(Math.random() * prompts.length))
    }, [])

    return (
        <div className="w-full bg-charcoal text-[#FDFBF7] rounded-2xl p-8 md:p-12 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-medium uppercase tracking-wider">
                        <PenLine className="w-4 h-4" />
                        <span>New Entry</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.h3
                            key={promptIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="font-serif text-2xl md:text-3xl leading-tight"
                        >
                            &ldquo;{prompts[promptIndex]}&rdquo;
                        </motion.h3>
                    </AnimatePresence>

                    <p className="text-stone-400 text-sm">
                        Capture this thought before it fades. Your future self is waiting.
                    </p>
                </div>

                <Link href="/letters-v2/new">
                    <button className="flex items-center gap-3 px-8 py-4 bg-[#FDFBF7] text-charcoal rounded-full font-medium transition-transform transform group-hover:scale-105 hover:bg-white shadow-lg">
                        <span>Start Writing</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    )
}
