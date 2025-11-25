"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Key, Sparkles, MailOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface LetterUnlockerProps {
    letterTitle: string
    letterContent: string
    deliveryDate: Date
    onUnlockComplete?: () => void
}

export function LetterUnlocker({
    letterTitle,
    letterContent,
    deliveryDate,
    onUnlockComplete,
}: LetterUnlockerProps) {
    const [status, setStatus] = useState<"locked" | "unlocking" | "revealed">("locked")
    const [dragProgress, setDragProgress] = useState(0)

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 150) {
            setStatus("unlocking")
            setTimeout(() => {
                setStatus("revealed")
                onUnlockComplete?.()
            }, 2000)
        } else {
            setDragProgress(0)
        }
    }

    const handleDrag = (_: any, info: any) => {
        setDragProgress(Math.min(Math.max(info.offset.x, 0), 200))
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {status === "locked" && (
                    <motion.div
                        key="locked"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="w-full max-w-md text-center space-y-12"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium uppercase tracking-wider">
                                <Lock className="w-3 h-3" />
                                <span>Secure Capsule</span>
                            </div>
                            <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
                                A message from your past has arrived.
                            </h1>
                            <p className="text-stone-500">
                                Sealed on {deliveryDate.toLocaleDateString()}
                            </p>
                        </div>

                        {/* The Envelope Artifact */}
                        <div className="relative w-64 h-48 mx-auto bg-[#FDFBF7] shadow-2xl rounded-lg border border-stone-200 flex items-center justify-center transform rotate-1">
                            <div className="absolute inset-0 border-2 border-stone-100 m-2 rounded" />
                            <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center shadow-lg z-10">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            {/* Wax Seal Effect */}
                            <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-red-800 rounded-full opacity-20 blur-xl" />
                        </div>

                        {/* The Key Slider */}
                        <div className="relative h-16 bg-white rounded-full border border-stone-200 shadow-sm p-2 flex items-center overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-medium text-stone-400 uppercase tracking-widest animate-pulse">
                                    Slide to Unlock
                                </span>
                            </div>

                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 200 }}
                                dragElastic={0.1}
                                onDrag={handleDrag}
                                onDragEnd={handleDragEnd}
                                className="relative z-10 w-12 h-12 bg-charcoal rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Key className="w-5 h-5 text-white" />
                            </motion.div>

                            {/* Progress Fill */}
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-teal-50/50 z-0"
                                style={{ width: dragProgress + 60 }}
                            />
                        </div>
                    </motion.div>
                )}

                {status === "unlocking" && (
                    <motion.div
                        key="unlocking"
                        className="flex flex-col items-center justify-center space-y-8"
                    >
                        <motion.div
                            initial={{ scale: 1, rotate: 0 }}
                            animate={{
                                scale: [1, 1.2, 0],
                                rotate: [0, -10, 10, 0],
                                opacity: [1, 1, 0]
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-24 h-24 bg-charcoal rounded-full flex items-center justify-center shadow-2xl"
                        >
                            <Lock className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-teal-600 font-serif text-xl flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 animate-spin" />
                            <span>Unsealing time capsule...</span>
                        </motion.div>
                    </motion.div>
                )}

                {status === "revealed" && (
                    <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-xl border border-stone-100 relative overflow-hidden"
                    >
                        {/* Paper Texture */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px)", backgroundSize: "100% 2rem", marginTop: "3rem" }}
                        />

                        {/* Stamp / Header */}
                        <div className="flex justify-between items-start mb-8 border-b border-stone-100 pb-6">
                            <div>
                                <h2 className="font-serif text-3xl text-charcoal mb-2">{letterTitle}</h2>
                                <p className="text-sm text-stone-500 font-mono">
                                    Written on {deliveryDate.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="w-16 h-16 border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center opacity-50 rotate-3">
                                <MailOpen className="w-6 h-6 text-stone-400" />
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            className="prose prose-lg font-serif text-charcoal leading-relaxed max-w-none"
                            dangerouslySetInnerHTML={{ __html: letterContent }}
                        />

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-stone-100 text-center">
                            <p className="text-stone-400 text-sm italic">
                                "The best time to write to your future self was yesterday. The second best time is now."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
