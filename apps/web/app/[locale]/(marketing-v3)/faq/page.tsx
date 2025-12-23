/**
 * FAQ Page - Dedicated FAQ with structured data
 *
 * SEO: FAQSchema + BreadcrumbSchema for rich snippets
 * Content: 8 FAQs about Capsule Note (bilingual EN/TR)
 */

import * as React from "react"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/routing"

import { FAQSchema, BreadcrumbSchema } from "@/components/seo/json-ld"
import { LegalPageLayout } from "../_components/legal-page-layout"
import type { Locale } from "@/i18n/routing"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

// FAQ data with bilingual content
const faqData = {
  en: {
    seoTitle: "FAQ - Frequently Asked Questions | Capsule Note",
    seoDescription:
      "Get answers to common questions about Capsule Note. Learn about letter delivery, encryption, physical mail, scheduling, and more.",
    pageTitle: "Frequently Asked Questions",
    pageDescription:
      "Everything you need to know about sending letters to your future self. Find answers about delivery, security, scheduling, and more.",
    contactCta: "Still have questions?",
    contactLink: "Contact us",
    items: [
      {
        question: "What happens if I forget my account?",
        answer:
          "Your letters are tied to your email address. If you forget your password, you can reset it anytime. Your letters will still be delivered to the email address you specified, even if you never log in again. We also send reminder emails before delivery.",
      },
      {
        question: "How do you guarantee delivery?",
        answer:
          "We use multiple redundant systems to ensure 99.9% on-time delivery. Letters are stored with military-grade encryption and backed up across multiple data centers. We also have a reconciliation system that catches any delayed deliveries and expedites them.",
      },
      {
        question: "Can anyone else read my letters?",
        answer:
          "No. Your letters are encrypted using AES-256-GCM encryption the moment you write them. We use a zero-knowledge architecture, meaning not even our team can read your letters. Only you can decrypt them when they're delivered.",
      },
      {
        question: "What if I change my email address?",
        answer:
          "You can update your delivery email address anytime before the delivery date. Simply log in, find the letter, and update the recipient email. The letter will be delivered to your new address.",
      },
      {
        question: "Can I cancel or edit a scheduled letter?",
        answer:
          "Yes! You can edit or cancel any letter up until its delivery date. However, once a letter is delivered, it cannot be undelivered. For physical mail, cancellation must be done at least 7 days before the delivery date.",
      },
      {
        question: "How does physical mail work?",
        answer:
          "With our physical mail option, we print your letter on high-quality paper and mail it to any address worldwide. You can choose 'send on date' (mailed on a specific date) or 'arrive by date' (we calculate transit time to ensure arrival). Physical letters are printed from our secure facility and your content is never stored in plain text.",
      },
      {
        question: "Is there a refund policy?",
        answer:
          "Yes. If you're not satisfied within 30 days of purchase, we'll refund you in full - no questions asked. For annual subscriptions, you can cancel anytime and keep access until the end of your billing period.",
      },
      {
        question: "How far in the future can I schedule?",
        answer:
          "Scheduling limits depend on your account. You can schedule letters years ahead — up to 50 years. Yes, you can write a letter to yourself 50 years from now. We're committed to being around to deliver it.",
      },
    ],
  },
  tr: {
    seoTitle: "SSS - Sıkça Sorulan Sorular | Capsule Note",
    seoDescription:
      "Capsule Note hakkında sık sorulan soruların yanıtlarını bulun. Mektup teslimatı, şifreleme, fiziksel posta ve planlama hakkında bilgi edinin.",
    pageTitle: "Sıkça Sorulan Sorular",
    pageDescription:
      "Gelecekteki kendinize mektup göndermek hakkında bilmeniz gereken her şey. Teslimat, güvenlik, planlama ve daha fazlası hakkında cevaplar.",
    contactCta: "Hâlâ soruların mı var?",
    contactLink: "Bize ulaş",
    items: [
      {
        question: "Hesabımı unutursam ne olur?",
        answer:
          "Mektupların e-posta adresine bağlı. Şifreni unutursan istediğin zaman sıfırlayabilirsin. Bir daha giriş yapmasan bile mektupların belirlediğin adrese teslim edilir. Üstelik teslimat öncesi hatırlatma e-postaları da gönderiyoruz.",
      },
      {
        question: "Teslimatı nasıl garanti ediyorsunuz?",
        answer:
          "%99,9 zamanında teslimat için çoklu yedekli sistemler kullanıyoruz. Mektuplar askeri düzeyde şifreleme ile saklanır ve farklı veri merkezlerinde yedeklenir. Geciken teslimatları yakalayıp hızlandıran özel bir mutabakat sistemimiz de var.",
      },
      {
        question: "Mektuplarımı başkası okuyabilir mi?",
        answer:
          "Kesinlikle hayır. Mektupların yazdığın anda AES-256-GCM ile şifrelenir. Sıfır bilgi mimarisi kullanıyoruz - ekibimiz bile mektuplarını okuyamaz. Şifreyi sadece sen, mektup teslim edildiğinde çözebilirsin.",
      },
      {
        question: "E-posta adresimi değiştirirsem ne olur?",
        answer:
          "Teslimat tarihinden önce istediğin zaman alıcı e-postasını güncelleyebilirsin. Giriş yap, mektubu bul, adresi güncelle - bu kadar basit. Mektup yeni adresine teslim edilir.",
      },
      {
        question: "Planlanmış bir mektubu iptal edebilir veya düzenleyebilir miyim?",
        answer:
          "Elbette! Teslimat tarihine kadar istediğin mektubu düzenleyebilir veya iptal edebilirsin. Ama dikkat: teslim edilen mektuplar geri alınamaz. Fiziksel posta için iptal en az 7 gün önceden yapılmalı.",
      },
      {
        question: "Fiziksel posta nasıl çalışıyor?",
        answer:
          "Fiziksel posta seçeneğiyle mektubunu yüksek kaliteli kağıda basıp dünyanın her yerine postalıyoruz. İki seçeneğin var: 'Belirli tarihte gönder' veya 'Belirli tarihte ulaşsın' (varış süresini biz hesaplarız). Mektuplar güvenli tesisimizde basılır ve içerik asla düz metin olarak saklanmaz.",
      },
      {
        question: "İade politikanız var mı?",
        answer:
          "Var! Satın alımdan sonraki 30 gün içinde memnun kalmazsan, soru sormadan tam iade yapıyoruz. Yıllık aboneliklerde istediğin zaman iptal edebilir, fatura dönemin sonuna kadar erişimini koruyabilirsin.",
      },
      {
        question: "Geleceğe ne kadar ileri planlayabilirim?",
        answer:
          "Planlama sınırları hesabına göre değişir. Mektupları yıllar sonrasına — 50 yıla kadar — planlayabilirsin. Evet, 50 yıl sonraki kendine mektup yazabilirsin! Ve biz o mektubu teslim etmek için burada olacağız.",
      },
    ],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const content = locale === "tr" ? faqData.tr : faqData.en

  const canonicalPath = "/faq"
  const canonicalUrl =
    locale === "en" ? `${appUrl}${canonicalPath}` : `${appUrl}/${locale}${canonicalPath}`

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${appUrl}${canonicalPath}`,
        tr: `${appUrl}/tr${canonicalPath}`,
        "x-default": `${appUrl}${canonicalPath}`,
      },
    },
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      url: canonicalUrl,
      type: "website",
    },
  }
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const content = locale === "tr" ? faqData.tr : faqData.en

  const breadcrumbs = [
    { name: locale === "tr" ? "Ana Sayfa" : "Home", href: "/" },
    { name: locale === "tr" ? "SSS" : "FAQ", href: "/faq" },
  ]

  return (
    <>
      {/* Structured Data */}
      <FAQSchema items={content.items} />
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />

      <LegalPageLayout>
        {/* Page Header */}
        <header className="mb-10">
          <h1 className="font-mono text-3xl md:text-4xl uppercase text-charcoal mb-4">
            {content.pageTitle}
          </h1>
          <p className="font-mono text-base text-charcoal/70 max-w-2xl">
            {content.pageDescription}
          </p>
        </header>

        <div className="space-y-6">
          {/* FAQ Items */}
          {content.items.map((item, index) => (
            <details
              key={index}
              className="group border-4 border-charcoal bg-off-white"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 font-mono text-base font-normal uppercase tracking-wide text-charcoal hover:bg-cream transition-colors">
                <span className="pr-4">{item.question}</span>
                <span className="flex-shrink-0 text-xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t-4 border-charcoal bg-cream p-6">
                <p className="font-mono text-sm leading-relaxed text-gray-secondary">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}

          {/* Contact CTA */}
          <div className="mt-12 border-4 border-charcoal bg-charcoal p-8 text-center">
            <p className="font-mono text-lg font-normal uppercase tracking-wide text-cream">
              {content.contactCta}
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block border-4 border-cream bg-cream px-8 py-3 font-mono text-sm font-normal uppercase tracking-wide text-charcoal transition-colors hover:bg-transparent hover:text-cream"
            >
              {content.contactLink}
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-8 border-t-4 border-charcoal pt-8">
            <p className="mb-4 font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              {locale === "tr" ? "Ayrıca Bakın" : "See Also"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="border-2 border-charcoal px-4 py-2 font-mono text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                {locale === "tr" ? "Planlar" : "Plans"}
              </Link>
              <Link
                href="/guides"
                className="border-2 border-charcoal px-4 py-2 font-mono text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                {locale === "tr" ? "Rehberler" : "Guides"}
              </Link>
              <Link
                href="/templates"
                className="border-2 border-charcoal px-4 py-2 font-mono text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                {locale === "tr" ? "Şablonlar" : "Templates"}
              </Link>
              <Link
                href="/security"
                className="border-2 border-charcoal px-4 py-2 font-mono text-xs uppercase tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                {locale === "tr" ? "Güvenlik" : "Security"}
              </Link>
            </div>
          </div>
        </div>
      </LegalPageLayout>
    </>
  )
}
