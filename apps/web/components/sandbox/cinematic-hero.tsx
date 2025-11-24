"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

export function CinematicHero() {
  const t = useTranslations("marketing.hero")

  return (
    <div className="relative space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="mx-auto text-xs uppercase tracking-wide">
            {t("badge")}
          </Badge>
          <h1 className="font-mono text-5xl uppercase tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-lg text-gray-secondary sm:text-xl">
            {t("description")}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="#hero-editor">
            <Button size="lg" className="h-14 border-2 border-charcoal px-8 font-mono text-base uppercase">
              {t("primaryCta")}
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="h-14 border-2 border-charcoal px-8 font-mono text-base uppercase"
            >
              <ChevronDown className="mr-2 h-5 w-5" />
              {t("secondaryCta")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
