"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { PenLine, Mail, Clock, CheckCircle2 } from "lucide-react"

const demoSteps = [
  { icon: PenLine, label: "Write your letter", color: "bg-bg-yellow-pale" },
  { icon: Clock, label: "Choose delivery time", color: "bg-bg-blue-light" },
  { icon: Mail, label: "We hold it securely", color: "bg-bg-purple-light" },
  { icon: CheckCircle2, label: "Arrives exactly on time", color: "bg-duck-green/20" },
]

export function MiniDemoLoop() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-2 border-charcoal bg-white">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <p className="font-mono text-xs uppercase text-gray-secondary">Watch the flow</p>
            <h3 className="mt-1 font-mono text-lg uppercase tracking-wide text-charcoal">
              Four steps to future delivery
            </h3>
          </div>

          <div className="relative flex items-center justify-between">
            {demoSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isPast = index < currentStep

              return (
                <div key={index} className="relative flex flex-1 flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      opacity: isActive || isPast ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-charcoal ${
                      isActive ? step.color : "bg-white"
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${isActive || isPast ? "text-charcoal" : "text-gray-secondary"}`} />
                  </motion.div>

                  {index < demoSteps.length - 1 && (
                    <motion.div
                      className="absolute left-[50%] top-8 h-0.5 w-full bg-charcoal"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isPast ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}

                  <motion.p
                    animate={{ opacity: isActive ? 1 : 0.6 }}
                    className="mt-3 text-center font-mono text-xs uppercase text-charcoal"
                  >
                    {step.label}
                  </motion.p>
                </div>
              )
            })}
          </div>

          <div className="h-16 rounded-sm border-2 border-dashed border-charcoal bg-bg-yellow-pale/30 p-3">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-mono text-xs text-gray-secondary"
            >
              {currentStep === 0 && "Capture thoughts in our distraction-free editor"}
              {currentStep === 1 && "Pick a future milestone with timezone precision"}
              {currentStep === 2 && "AES-256 encryption keeps it private until delivery"}
              {currentStep === 3 && "Inngest ensures 99.97% on-time arrival"}
            </motion.p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
