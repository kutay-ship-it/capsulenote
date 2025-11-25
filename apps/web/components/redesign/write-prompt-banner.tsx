import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

/**
 * Rotating prompts to inspire writing
 */
const prompts = [
  "What does future-you need to hear right now?",
  "What would you tell yourself in 5 years?",
  "What moment do you want to remember forever?",
  "What are you proud of today?",
  "What advice would help you next year?",
  "What dreams are you chasing right now?",
  "What lesson would you share with your future self?",
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

export async function WritePromptBanner() {
  const t = await getTranslations("redesign.banner")
  const prompt = getRotatingPrompt()

  return (
    <div
      className="mt-8 border-t-2 border-charcoal bg-bg-yellow-cream p-8 sm:mt-12 sm:p-12"
      style={{ borderRadius: "0 0 2px 2px" }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Prompt text */}
        <p className="mb-6 max-w-lg font-mono text-lg italic text-charcoal sm:text-xl">
          &ldquo;{prompt}&rdquo;
        </p>

        {/* CTA Button */}
        <Link href="/letters/new">
          <Button size="lg" className="uppercase">
            {t("cta")}
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
