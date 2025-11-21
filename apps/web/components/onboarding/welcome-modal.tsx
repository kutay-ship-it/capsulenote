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

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const TOTAL_STEPS = 3

export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const router = useRouter()
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
            <span className="sr-only">Close</span>
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
            Step {currentStep} of {TOTAL_STEPS}
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
                  Welcome to DearMe! 👋
                </DialogTitle>
                <DialogDescription className="font-mono text-base text-gray-700 leading-relaxed max-w-lg mx-auto">
                  Write letters to your future self and receive them at the perfect moment.
                  Your thoughts are encrypted and delivered exactly when you need them.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Shield className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">Encrypted</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    AES-256-GCM encryption keeps your letters private
                  </p>
                </div>
              </Card>

              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Calendar className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">Timed</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    Delivered exactly when you schedule them
                  </p>
                </div>
              </Card>

              <Card className="p-4 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
                <div className="flex flex-col items-center text-center space-y-2">
                  <Mail className="w-6 h-6 text-charcoal" />
                  <h3 className="font-mono text-sm font-bold uppercase">Reliable</h3>
                  <p className="font-mono text-xs text-gray-secondary">
                    99.95% on-time delivery guarantee
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
                Next
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
                How It Works
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-gray-secondary">
                Three simple steps to send a letter to your future self
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
                      <h3 className="font-mono text-lg font-bold uppercase">Write Your Letter</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      Pour your heart out. We'll keep it safe with military-grade encryption.
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
                      <h3 className="font-mono text-lg font-bold uppercase">Choose When</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      6 months? 1 year? 10 years? You decide when you want to receive it.
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
                      <h3 className="font-mono text-lg font-bold uppercase">We Deliver</h3>
                    </div>
                    <p className="font-mono text-sm text-gray-700">
                      Securely delivered to your inbox at the perfect time. Exactly when you need it.
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
                ← Previous
              </Button>
              <Button
                onClick={handleNext}
                className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                Next
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
                Ready to Start?
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-gray-secondary">
                Here are some prompts to help you get started
              </DialogDescription>
            </div>

            {/* Writing Prompts */}
            <Card className="p-6 border-2 border-charcoal bg-white" style={{ borderRadius: "2px" }}>
              <h4 className="font-mono text-sm font-bold uppercase text-charcoal mb-4">
                Try writing about:
              </h4>
              <ul className="space-y-2 font-mono text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>What you're grateful for today</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>Goals you want to achieve this year</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>Advice for your future self</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>A moment you want to remember forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>Challenges you're facing right now</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-charcoal">•</span>
                  <span>What you hope your life looks like in the future</span>
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
                Explore Dashboard
              </Button>
              <Button
                onClick={handleStartWriting}
                className="flex-1 border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                style={{ borderRadius: "2px" }}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Start Writing
              </Button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handlePrevious}
                className="font-mono text-xs text-gray-secondary hover:text-charcoal underline"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
