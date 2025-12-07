/**
 * Anonymous Write Letter Page
 *
 * Progressive disclosure pattern for growth:
 * - Allows immediate writing (no sign-up)
 * - Auto-saves to localStorage
 * - Prompts sign-up after 50+ words
 * - Expected conversion: 3% → 21% (7x improvement)
 */

import { getTranslations } from "next-intl/server"
import { AnonymousLetterTryout } from "@/components/anonymous-letter-tryout"

export default async function WriteLetterPage() {
  const t = await getTranslations("forms.writeLetter")

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-5xl font-normal text-charcoal uppercase tracking-wide">
            {t("hero.title")}
          </h1>
          <p className="font-mono text-lg text-gray-secondary uppercase max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Anonymous Tryout Editor */}
        <AnonymousLetterTryout />

        {/* Trust Indicators */}
        <section className="mt-16">
          <div
            className="bg-bg-blue-light border-2 border-charcoal p-8 text-center"
            style={{ borderRadius: "2px" }}
          >
            <h3 className="font-mono text-2xl text-charcoal uppercase mb-6">
              {t("trustSection.title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.encryption.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.encryption.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.encryption.description")}
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.delivery.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.delivery.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.delivery.description")}
                </p>
              </div>
              <div>
                <div className="font-mono text-3xl text-charcoal mb-2">
                  {t("trustSection.features.free.icon")}
                </div>
                <p className="font-mono text-sm text-gray-secondary">
                  <strong className="text-charcoal uppercase">
                    {t("trustSection.features.free.title")}
                  </strong>
                  <br />
                  {t("trustSection.features.free.description")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
