"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Lock, EyeOff, Shield, Check } from "lucide-react"

interface TrustBadgesProps {
  variant?: "cards" | "inline" | "compact"
  className?: string
}

const BADGES = [
  {
    id: "encrypted",
    icon: Lock,
    label: "End-to-End Encrypted",
    shortLabel: "Encrypted",
    description: "Your words are scrambled before leaving your device",
  },
  {
    id: "private",
    icon: EyeOff,
    label: "Completely Private",
    shortLabel: "Private",
    description: "Not even we can read your letters",
  },
  {
    id: "secure",
    icon: Shield,
    label: "Bank-Grade Security",
    shortLabel: "Secure",
    description: "AES-256 encryption, the same used by banks",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function TrustBadges({ variant = "cards", className }: TrustBadgesProps) {
  if (variant === "compact") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("flex flex-wrap gap-2", className)}
      >
        {BADGES.map((badge) => (
          <motion.div
            key={badge.id}
            variants={itemVariants}
            className="flex items-center gap-1.5 bg-teal-primary/10 border border-teal-primary/30 px-2 py-1"
            style={{ borderRadius: "2px" }}
          >
            <Check className="h-3 w-3 text-teal-primary" strokeWidth={2.5} />
            <span className="font-mono text-[10px] text-teal-primary uppercase tracking-wider">
              {badge.shortLabel}
            </span>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  if (variant === "inline") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "border-2 border-charcoal bg-white p-3 shadow-[2px_2px_0_theme(colors.charcoal)]",
          className
        )}
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {BADGES.map((badge, index) => (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              className="flex items-center gap-2"
            >
              <div
                className="flex items-center justify-center w-6 h-6 bg-teal-primary/10 border border-teal-primary/30"
                style={{ borderRadius: "2px" }}
              >
                <Check className="h-3.5 w-3.5 text-teal-primary" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-xs text-charcoal/70">
                {badge.label}
              </span>
              {index < BADGES.length - 1 && (
                <span className="w-1 h-1 bg-charcoal/20 ml-2" style={{ borderRadius: "50%" }} />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // Default: cards variant
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}
    >
      {BADGES.map((badge) => {
        const Icon = badge.icon
        return (
          <motion.div
            key={badge.id}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="relative border-2 border-charcoal bg-white p-4 shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[5px_5px_0_theme(colors.charcoal)] transition-shadow"
            style={{ borderRadius: "2px" }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 bg-teal-primary/10 border-2 border-teal-primary/30 flex items-center justify-center mb-3"
              style={{ borderRadius: "2px" }}
            >
              <Icon className="h-5 w-5 text-teal-primary" strokeWidth={2} />
            </div>

            {/* Label */}
            <h4 className="font-mono text-sm font-bold text-charcoal mb-1">
              {badge.label}
            </h4>

            {/* Description */}
            <p className="font-mono text-[10px] text-charcoal/50 leading-relaxed">
              {badge.description}
            </p>

            {/* Check mark badge */}
            <div
              className="absolute -top-2 -right-2 w-6 h-6 bg-teal-primary border-2 border-charcoal flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
