"use client"

import { motion } from "framer-motion"

export function AnimatedEnvelope() {
  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-32 w-48 bg-off-white border-2 border-charcoal shadow-md"
        style={{ borderRadius: "4px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-bg-yellow-pale to-bg-blue-light opacity-80" />
        <div className="absolute inset-2 border-2 border-charcoal/60" />
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute left-1/2 top-1/2 w-8 -translate-x-1/2 -translate-y-1/2 border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        />
      </motion.div>
    </div>
  )
}
