import { Mail, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

/**
 * Rotating prompts for new users
 */
const prompts = [
  "What would you tell yourself one year from now?",
  "What do you want to remember about today?",
  "What advice would help future-you?",
  "What are you grateful for right now?",
  "What dreams are you working toward?",
  "What lesson did you learn this week?",
  "What would make future-you proud?",
]

/**
 * Get a prompt that rotates based on day of year
 */
function getRotatingPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  return prompts[dayOfYear % prompts.length]!
}

export async function EmptyStateHero() {
  const t = await getTranslations("redesign.empty")
  const prompt = getRotatingPrompt()

  return (
    <div
      className="border-2 border-charcoal bg-white p-8 sm:p-12 md:p-16"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Envelope icon */}
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow sm:h-20 sm:w-20"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-8 w-8 text-charcoal sm:h-10 sm:w-10" strokeWidth={2} />
        </div>

        {/* Heading */}
        <h2 className="mb-3 font-mono text-xl font-semibold uppercase tracking-wide text-charcoal sm:text-2xl md:text-3xl">
          {t("title")}
        </h2>

        {/* Rotating prompt */}
        <p className="mb-8 max-w-md font-mono text-base italic text-gray-secondary sm:text-lg">
          {prompt}
        </p>

        {/* CTA Button */}
        <Link href="/letters/new">
          <Button size="lg" className="w-full uppercase sm:w-auto">
            {t("cta")}
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
