"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Lock, EyeOff, Shield, Check } from "lucide-react"
import { useTranslations } from "next-intl"

interface TrustBadgesProps {
  className?: string
}

const BADGES = [
  {
    id: "encrypted",
    Icon: Lock,
    titleKey: "security.encrypted.title",
    descKey: "security.encrypted.description",
  },
  {
    id: "private",
    Icon: EyeOff,
    titleKey: "security.private.title",
    descKey: "security.private.description",
  },
  {
    id: "secure",
    Icon: Shield,
    titleKey: "security.secure.title",
    descKey: "security.secure.description",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Trust badges component for security step
 * Shows encryption, privacy, and security badges
 */
export function TrustBadges({ className }: TrustBadgesProps) {
  const t = useTranslations("onboarding.v3")

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}
    >
      {BADGES.map((badge) => {
        const { Icon } = badge
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
              {t(badge.titleKey)}
            </h4>

            {/* Description */}
            <p className="font-mono text-[10px] text-charcoal/50 leading-relaxed">
              {t(badge.descKey)}
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
