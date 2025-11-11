"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, Server, Clock, Mail, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react"

const workflowSteps = [
  {
    id: "encrypt",
    icon: Lock,
    title: "Encryption",
    description: "AES-256-GCM applied to letter content",
    detail: "Your letter is encrypted with a unique nonce before storage. Database breach = unreadable ciphertext.",
    timing: "Instant",
    color: "bg-duck-yellow",
  },
  {
    id: "store",
    icon: Server,
    title: "Secure Storage",
    description: "Encrypted payload stored in Neon Postgres",
    detail: "bodyCiphertext, bodyNonce, and keyVersion stored separately. Zero plaintext in database.",
    timing: "< 100ms",
    color: "bg-bg-blue-light",
  },
  {
    id: "schedule",
    icon: Clock,
    title: "Inngest Scheduling",
    description: "Durable workflow with sleep-until pattern",
    detail: "Job sleeps until deliverAt timestamp. Survives server restarts. Backstop reconciler catches stuck jobs.",
    timing: "Scheduled",
    color: "bg-bg-purple-light",
  },
  {
    id: "decrypt",
    icon: Lock,
    title: "Pre-Delivery Decrypt",
    description: "Content decrypted only when sending",
    detail: "Inngest worker decrypts using nonce + key version. Plaintext exists only in memory during send.",
    timing: "At delivery",
    color: "bg-bg-yellow-pale",
  },
  {
    id: "send",
    icon: Mail,
    title: "Delivery",
    description: "Email/mail sent with idempotency keys",
    detail: "Resend/Lob API call with delivery-{uuid}-attempt-{n} key. Retries never duplicate sends.",
    timing: "99.97% on-time",
    color: "bg-duck-green/20",
  },
  {
    id: "confirm",
    icon: CheckCircle2,
    title: "Confirmation",
    description: "Status updated, user notified",
    detail: "Delivery marked as 'sent'. Storytelling notification triggered. Reflection prompt unlocked.",
    timing: "Within 60s",
    color: "bg-duck-green",
  },
]

export function TrustVisualization() {
  const [simulationStep, setSimulationStep] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  const startSimulation = () => {
    setIsSimulating(true)
    setSimulationStep(0)
    const interval = setInterval(() => {
      setSimulationStep((prev) => {
        if (prev >= workflowSteps.length - 1) {
          clearInterval(interval)
          setIsSimulating(false)
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  return (
    <Card className="border-2 border-charcoal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-mono text-2xl uppercase tracking-tight text-charcoal">
              Trust & Transparency
            </CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              Watch your letter's journey from encryption to delivery
            </CardDescription>
          </div>
          <Button
            onClick={startSimulation}
            disabled={isSimulating}
            className="border-2 border-charcoal font-mono text-xs uppercase"
          >
            <PlayCircle className="mr-1 h-4 w-4" />
            {isSimulating ? "Simulating..." : "Simulate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-2 border-dashed border-charcoal bg-bg-yellow-pale/30">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-charcoal" />
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase text-charcoal">Why this matters</p>
              <p className="font-mono text-xs text-gray-secondary">
                We show you exactly what happens between "Save" and "Delivered" so you trust the system completely. No
                black boxes.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = isSimulating && index === simulationStep
            const isPast = isSimulating && index < simulationStep
            const isUpcoming = isSimulating && index > simulationStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.7 : isUpcoming ? 0.4 : 1,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Card
                  className={`border-2 border-charcoal transition-all ${
                    isActive ? "shadow-[0_0_0_4px_rgba(56,56,56,0.2)]" : ""
                  }`}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-charcoal ${
                        isActive || (!isSimulating && index === 0) ? step.color : "bg-white"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isActive || (!isSimulating && index === 0) ? "text-charcoal" : "text-gray-secondary"
                        }`}
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-mono text-base uppercase text-charcoal">{step.title}</h3>
                          <p className="font-mono text-xs text-gray-secondary">{step.description}</p>
                        </div>
                        <Badge variant="outline" className="border-2 border-charcoal font-mono text-xs">
                          {step.timing}
                        </Badge>
                      </div>

                      <p className="rounded-sm border border-dashed border-charcoal bg-white/50 p-3 font-mono text-xs text-charcoal">
                        {step.detail}
                      </p>

                      {isActive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5 }}
                          className="h-1 rounded-full bg-charcoal"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {index < workflowSteps.length - 1 && (
                  <div className="ml-7 h-8 w-0.5 bg-charcoal" />
                )}
              </motion.div>
            )
          })}
        </div>

        <Card className="border-2 border-charcoal bg-duck-green/10">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-charcoal" />
              <h4 className="font-mono text-base uppercase text-charcoal">SLO Guarantees</h4>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-sm border border-charcoal bg-white p-3">
                <p className="font-mono text-xs uppercase text-gray-secondary">On-time delivery</p>
                <p className="font-mono text-2xl text-charcoal">99.97%</p>
              </div>
              <div className="rounded-sm border border-charcoal bg-white p-3">
                <p className="font-mono text-xs uppercase text-gray-secondary">Backstop reconciliation</p>
                <p className="font-mono text-2xl text-charcoal">&lt; 0.1%</p>
              </div>
              <div className="rounded-sm border border-charcoal bg-white p-3">
                <p className="font-mono text-xs uppercase text-gray-secondary">Encryption overhead</p>
                <p className="font-mono text-2xl text-charcoal">&lt; 100ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
