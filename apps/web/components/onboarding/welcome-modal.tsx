"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, ArrowRight, Mail, Calendar, Shield, Sparkles, Edit3, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const TOTAL_STEPS = 3

export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const router = useRouter()
  const t = useTranslations("onboarding.modal")
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStartWriting = () => {
    onComplete()
    router.push("/letters/new")
  }

  const handleExploreDashboard = () => {
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-2xl border-2 border-charcoal bg-bg-yellow-pale p-0 overflow-hidden" style={{ borderRadius: "2px" }}>
        {/* Header with close button */}
        <div className="relative p-6 pb-4 border-b-2 border-charcoal">
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-5 w-5 text-charcoal" />
            <span className="sr-only">{t("close")}</span>
          </button>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-2 w-12 border-2 border-charcoal transition-colors",
                  step === currentStep ? "bg-charcoal" : step < currentStep ? "bg-gray-400" : "bg-white"
                )}
                style={{ borderRadius: "2px" }}
              />
            ))}
          </div>

          <Badge variant="outline" className="mb-2 font-mono text-xs">
            {t("stepOf", { current: currentStep, total: TOTAL_STEPS })}
          </Badge>
        </div>

        {/* Step 1: Product Value */}
        {currentStep === 1 && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-charcoal bg-bg-lavender-light" style={{ borderRadius: "2px" }}>
                <Sparkles className="w-8 h-8 text-charcoal" />
              </div>

              <DialogHeader className="space-y-3">
                <DialogTitle className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
                  {t("step1.title")}
                </DialogTitle>
                <DialogDescription className="font-mono text-base text-gray-700 leading-relaxed max-w-lg mx-auto">
                  {t("step1.description")}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Shield className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">{t("step1.benefits.encrypted.title")}</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    {t("step1.benefits.encrypted.description")}
                  </p>
                </div>
              </Card>

              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Calendar className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">{t("step1.benefits.timed.title")}</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    {t("step1.benefits.timed.description")}
                  </p>
                </div>
              </Card>

              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Mail className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">{t("step1.benefits.reliable.title")}</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    {t("step1.benefits.reliable.description")}
                  </p>
                </div>
              </Card>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={handleNext}
                className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800 px-8"
                style={{ borderRadius: "2px" }}
              >
                {t("navigation.next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: How It Works */}
        {currentStep === 2 && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <DialogTitle className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
                {t("step2.title")}
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-gray-secondary">
                {t("step2.description")}
              </DialogDescription>
            </div>

            {/* Steps */}
            <div className="space-y-4 mt-8">
              <Card className="p-6 border-2 border-charcoal bg-bg-blue-light" style={{ borderRadius: "2px" }}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 border-2 border-charcoal bg-white font-mono text-xl font-bold" style={{ borderRadius: "2px" }}>
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit3 className="w-5 h-5 text-charcoal" />
                      <h3 className="font-mono text-lg font-bold uppercase">{t("step2.steps.write.title")}</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      {t("step2.steps.write.description")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-charcoal bg-bg-teal-light" style={{ borderRadius: "2px" }}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 border-2 border-charcoal bg-white font-mono text-xl font-bold" style={{ borderRadius: "2px" }}>
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-charcoal" />
                      <h3 className="font-mono text-lg font-bold uppercase">{t("step2.steps.schedule.title")}</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      {t("step2.steps.schedule.description")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-charcoal bg-bg-green-light" style={{ borderRadius: "2px" }}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 border-2 border-charcoal bg-white font-mono text-xl font-bold" style={{ borderRadius: "2px" }}>
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-charcoal" />
                      <h3 className="font-mono text-lg font-bold uppercase">{t("step2.steps.deliver.title")}</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      {t("step2.steps.deliver.description")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              >
                {t("navigation.previous")}
              </Button>
              <Button
                onClick={handleNext}
                className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                {t("navigation.next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Ready to Start */}
        {currentStep === 3 && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-charcoal bg-bg-peach-light" style={{ borderRadius: "2px" }}>
                <CheckCircle className="w-8 h-8 text-charcoal" />
              </div>

              <DialogTitle className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
                {t("step3.title")}
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-gray-secondary">
                {t("step3.description")}
              </DialogDescription>
            </div>

            {/* Writing Prompts */}
            <Card className="p-6 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
              <h4 className="font-mono text-sm font-bold uppercase text-charcoal mb-4">
                {t("step3.promptsTitle")}
              </h4>
              <ul className="space-y-2 font-mono text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.grateful")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.goals")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.advice")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.moment")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.challenges")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>{t("step3.prompts.future")}</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                onClick={handleExploreDashboard}
                variant="outline"
                className="flex-1 border-2 border-charcoal font-mono"
                style={{ borderRadius: "2px" }}
              >
                {t("step3.buttons.explore")}
              </Button>
              <Button
                onClick={handleStartWriting}
                className="flex-1 border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                {t("step3.buttons.start")}
              </Button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handlePrevious}
                className="font-mono text-xs text-gray-secondary hover:text-charcoal underline"
              >
                {t("navigation.back")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
