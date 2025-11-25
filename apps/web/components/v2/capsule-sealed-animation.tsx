"use client"

import { motion } from "framer-motion"
import { Check, Send, Sparkles } from "lucide-react"
import { useEffect } from "react"

interface CapsuleSealedAnimationProps {
    onComplete: () => void
}

export function CapsuleSealedAnimation({ onComplete }: CapsuleSealedAnimationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete()
        }, 3500) // Animation duration
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]">
            <div className="relative flex flex-col items-center justify-center text-center p-8">

                {/* Circle Burst */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-64 h-64 bg-teal-100 rounded-full"
                />

                {/* Icon Container */}
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="relative z-10 w-24 h-24 bg-charcoal rounded-full flex items-center justify-center shadow-xl mb-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Send className="w-10 h-10 text-white ml-1 mt-1" />
                    </motion.div>
                </motion.div>

                {/* Text Animations */}
                <div className="space-y-2 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="font-serif text-3xl text-charcoal"
                    >
                        Capsule Sealed
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="text-stone-500 font-medium"
                    >
                        Traveling to the future...
                    </motion.p>
                </div>

                {/* Sparkles */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 0.6, duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                >
                    <Sparkles className="absolute top-0 right-10 w-6 h-6 text-teal-400" />
                    <Sparkles className="absolute bottom-10 left-10 w-4 h-4 text-yellow-400" />
                </motion.div>

            </div>
        </div>
    )
}
