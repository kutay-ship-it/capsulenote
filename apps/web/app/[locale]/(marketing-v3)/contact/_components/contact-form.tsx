"use client"

import { useState, useTransition } from "react"
import { useTranslations, useLocale } from "next-intl"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { submitContactForm, type ContactFormInput } from "@/server/actions/contact"

type FormState = {
  status: "idle" | "submitting" | "success" | "error"
  errorMessage?: string
  fieldErrors?: Partial<Record<keyof ContactFormInput, string[]>>
}

/**
 * Contact form with V3 brutalist styling
 *
 * Uses React 19 transitions for optimistic UI
 */
export function ContactForm() {
  const t = useTranslations("legal.contact.form")
  const locale = useLocale()
  const uppercaseClass = locale === "tr" ? "" : "uppercase"

  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<FormState>({ status: "idle" })

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setFormState({ status: "submitting" })

      const input: ContactFormInput = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: formData.get("subject") as ContactFormInput["subject"],
        message: formData.get("message") as string,
      }

      const result = await submitContactForm(input)

      if (result.success) {
        setFormState({ status: "success" })
      } else {
        setFormState({
          status: "error",
          errorMessage: result.error.message,
          fieldErrors: result.error.details as FormState["fieldErrors"],
        })
      }
    })
  }

  // Success state
  if (formState.status === "success") {
    return (
      <div className="text-center py-12">
        <div
          className={cn(
            "inline-flex h-16 w-16 items-center justify-center mb-6",
            "border-2 border-charcoal bg-teal-primary"
          )}
          style={{ borderRadius: "2px" }}
        >
          <CheckCircle className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
        <h3 className={cn("font-mono text-xl text-charcoal mb-2", uppercaseClass)}>
          {t("success.title")}
        </h3>
        <p className="font-mono text-sm text-charcoal/70 max-w-sm mx-auto">
          {t("success.description")}
        </p>
        <button
          onClick={() => setFormState({ status: "idle" })}
          className={cn(
            "mt-6 inline-flex items-center px-4 py-2",
            "border-2 border-charcoal bg-white text-charcoal",
            "font-mono text-xs tracking-wide",
            "shadow-[2px_2px_0_theme(colors.charcoal)]",
            "transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
            uppercaseClass
          )}
          style={{ borderRadius: "2px" }}
        >
          {t("success.sendAnother")}
        </button>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Global Error */}
      {formState.status === "error" && !formState.fieldErrors && (
        <div
          className="flex items-start gap-3 p-4 border-2 border-coral bg-coral/10"
          style={{ borderRadius: "2px" }}
        >
          <AlertCircle className="h-5 w-5 text-coral flex-shrink-0" />
          <p className="font-mono text-sm text-charcoal">{formState.errorMessage}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className={cn("block font-mono text-xs text-charcoal tracking-wide", uppercaseClass)}
        >
          {t("name")} <span className="text-coral">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          placeholder={t("namePlaceholder")}
          disabled={isPending}
          className={cn(
            "w-full h-[50px] px-4 border-2 border-charcoal bg-white",
            "font-mono text-sm text-charcoal placeholder:text-charcoal/40",
            "focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            formState.fieldErrors?.name && "border-coral"
          )}
          style={{ borderRadius: "2px" }}
        />
        {formState.fieldErrors?.name && (
          <p className="font-mono text-xs text-coral">{formState.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className={cn("block font-mono text-xs text-charcoal tracking-wide", uppercaseClass)}
        >
          {t("email")} <span className="text-coral">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          disabled={isPending}
          className={cn(
            "w-full h-[50px] px-4 border-2 border-charcoal bg-white",
            "font-mono text-sm text-charcoal placeholder:text-charcoal/40",
            "focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            formState.fieldErrors?.email && "border-coral"
          )}
          style={{ borderRadius: "2px" }}
        />
        {formState.fieldErrors?.email && (
          <p className="font-mono text-xs text-coral">{formState.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <label
          htmlFor="subject"
          className={cn("block font-mono text-xs text-charcoal tracking-wide", uppercaseClass)}
        >
          {t("subject")} <span className="text-coral">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue=""
          disabled={isPending}
          className={cn(
            "w-full h-[50px] px-4 border-2 border-charcoal bg-white",
            "font-mono text-sm text-charcoal",
            "focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            formState.fieldErrors?.subject && "border-coral"
          )}
          style={{ borderRadius: "2px" }}
        >
          <option value="" disabled>
            {t("subjectPlaceholder")}
          </option>
          <option value="general">{t("subjects.general")}</option>
          <option value="support">{t("subjects.support")}</option>
          <option value="sales">{t("subjects.sales")}</option>
          <option value="press">{t("subjects.press")}</option>
          <option value="other">{t("subjects.other")}</option>
        </select>
        {formState.fieldErrors?.subject && (
          <p className="font-mono text-xs text-coral">{formState.fieldErrors.subject[0]}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <label
          htmlFor="message"
          className={cn("block font-mono text-xs text-charcoal tracking-wide", uppercaseClass)}
        >
          {t("message")} <span className="text-coral">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder={t("messagePlaceholder")}
          disabled={isPending}
          className={cn(
            "w-full px-4 py-3 border-2 border-charcoal bg-white resize-none",
            "font-mono text-sm text-charcoal placeholder:text-charcoal/40",
            "focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            formState.fieldErrors?.message && "border-coral"
          )}
          style={{ borderRadius: "2px" }}
        />
        {formState.fieldErrors?.message && (
          <p className="font-mono text-xs text-coral">{formState.fieldErrors.message[0]}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full h-[50px] flex items-center justify-center gap-2",
          "border-2 border-charcoal bg-duck-blue text-charcoal",
          "font-mono text-sm tracking-wide",
          "shadow-[3px_3px_0_theme(colors.charcoal)]",
          "transition-all",
          "hover:-translate-y-0.5 hover:shadow-[5px_5px_0_theme(colors.charcoal)]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
          uppercaseClass
        )}
        style={{ borderRadius: "2px" }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("sending")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  )
}
