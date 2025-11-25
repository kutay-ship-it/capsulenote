"use client"

import { motion } from "framer-motion"

export function Envelope3D({ recipientName }: { recipientName: string }) {
    return (
        <div className="relative w-64 h-40 mx-auto perspective-1000">
            <motion.div
                initial={{ rotateX: 20, rotateY: -20 }}
                animate={{ rotateX: 0, rotateY: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-full h-full bg-[#FDFBF7] shadow-xl rounded-sm border border-stone-200 transform-style-3d"
            >
                {/* Flap */}
                <div
                    className="absolute top-0 left-0 w-full h-1/2 bg-[#F7F5F0] origin-top z-20 border-b border-stone-300"
                    style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
                />

                {/* Wax Seal */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 z-30 w-12 h-12 bg-red-800 rounded-full shadow-md flex items-center justify-center border-2 border-red-900/50">
                    <div className="w-8 h-8 rounded-full border border-red-900/30 opacity-50" />
                </div>

                {/* Address */}
                <div className="absolute bottom-4 right-8 text-right z-10">
                    <div className="w-16 h-20 border border-stone-200 absolute -top-16 right-0 bg-stone-50 opacity-50" /> {/* Stamp placeholder */}
                    <p className="font-serif text-charcoal text-lg italic">{recipientName}</p>
                    <div className="h-px w-24 bg-stone-300 mt-1 ml-auto" />
                    <div className="h-px w-16 bg-stone-300 mt-2 ml-auto" />
                </div>
            </motion.div>
        </div>
    )
}
