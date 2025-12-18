"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { sanitizeLetterHtml } from "@/lib/sanitize"
import { MailOpen, Calendar, RotateCcw, ArrowLeft, PenLine, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface UnlockRevealedV3Props {
  letterId: string
  letterTitle: string
  letterContent: string
  writtenDate: Date
  firstOpenedAt: Date | null
  onReplay: () => void
}

export function UnlockRevealedV3({
  letterTitle,
  letterContent,
  writtenDate,
  firstOpenedAt,
  onReplay,
}: UnlockRevealedV3Props) {
  const t = useTranslations("letters.revealed")
  const formattedWrittenDate = format(new Date(writtenDate), "MMMM d, yyyy")
  const formattedOpenedDate = firstOpenedAt
    ? format(new Date(firstOpenedAt), "MMMM d, yyyy 'at' h:mm a")
    : null

  // Sanitize HTML content for XSS protection (isomorphic - works on server and client)
  const sanitizedContent = useMemo(
    () => sanitizeLetterHtml(letterContent || ""),
    [letterContent]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      {/* Opened Badge - Outside card to prevent clipping */}
      {formattedOpenedDate && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 ml-4 mb-[-12px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-primary border-2 border-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <Clock className="h-3 w-3" strokeWidth={2.5} />
          {t("firstOpened")}
        </motion.div>
      )}

      {/* Letter Card */}
      <div
        className="relative border-3 sm:border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)] sm:shadow-[8px_8px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Paper texture lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 1.5rem",
            marginTop: "3rem",
          }}
        />

        {/* Header */}
        <div className="relative border-b-3 sm:border-b-4 border-charcoal bg-duck-yellow p-4 sm:p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
                {letterTitle}
              </h1>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-charcoal/60" strokeWidth={2} />
                <span className="font-mono text-xs text-charcoal/70 uppercase tracking-wider">
                  {t("writtenOn", { date: formattedWrittenDate })}
                </span>
              </div>
              {formattedOpenedDate && (
                <div className="flex items-center gap-2">
                  <MailOpen className="h-4 w-4 text-charcoal/60" strokeWidth={2} />
                  <span className="font-mono text-xs text-charcoal/70 uppercase tracking-wider">
                    {t("openedOn", { date: formattedOpenedDate })}
                  </span>
                </div>
              )}
            </div>

            {/* Stamp decoration */}
            <div
              className="hidden md:flex w-16 h-16 border-2 border-dashed border-charcoal/30 items-center justify-center rotate-6"
              style={{ borderRadius: "2px" }}
            >
              <MailOpen className="h-8 w-8 text-charcoal/30" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Letter Content */}
        <div className="relative p-4 sm:p-6 md:p-8 md:px-12 min-h-[40vh] sm:min-h-[50vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none font-serif text-charcoal leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Footer */}
	        <div className="border-t-3 sm:border-t-4 border-dashed border-charcoal/20 bg-duck-cream p-4 sm:p-6 md:p-8">
	          <p className="font-mono text-xs text-charcoal/50 uppercase tracking-wider text-center italic">
	            &quot;{t("quote")}&quot;
	          </p>
	        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
      >
        <Button
          variant="outline"
          onClick={onReplay}
          className="w-full sm:w-auto gap-2 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
          style={{ borderRadius: "2px" }}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          {t("replayOpening")}
        </Button>

        <Link href="/letters" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full gap-2 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
            style={{ borderRadius: "2px" }}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t("backToLetters")}
          </Button>
        </Link>

        <Link href="/letters/new" className="w-full sm:w-auto">
          <Button
            className="w-full gap-2 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
            style={{ borderRadius: "2px" }}
          >
            <PenLine className="h-4 w-4" strokeWidth={2} />
            {t("writeNewLetter")}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )
}
