"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Lightbulb, PenLine } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { TemplateOption } from "./capsule-journey"

interface Phase2ReflectionProps {
  selectedTemplate: TemplateOption | null
  onComplete: (template: TemplateOption | null) => void
  onSkip: () => void
}

const templates: TemplateOption[] = [
  {
    id: "memory",
    icon: "📸",
    title: "A Moment to Remember",
    description: "Capture today's feelings, events, or small joys",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>Today, I want to remember...</p>
<p></p>
<p>The way I felt when...</p>
<p></p>
<p>The small joy that made me smile...</p>
<p></p>
<p>I hope when you read this, you remember how it felt to be here, in this moment.</p>`,
  },
  {
    id: "goals",
    icon: "🎯",
    title: "Dreams & Aspirations",
    description: "Share your goals and what you're working toward",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>Right now, I'm dreaming about...</p>
<p></p>
<p>The goals I'm working toward are...</p>
<p></p>
<p>I hope by the time you read this, you've...</p>
<p></p>
<p>Remember why this matters to you...</p>`,
  },
  {
    id: "gratitude",
    icon: "🙏",
    title: "Gratitude & Appreciation",
    description: "Reflect on what you're thankful for right now",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>Today, I'm grateful for...</p>
<p></p>
<p>The people who make my life better...</p>
<p></p>
<p>The simple things I don't want to take for granted...</p>
<p></p>
<p>May you always remember to appreciate these moments.</p>`,
  },
  {
    id: "advice",
    icon: "💭",
    title: "Wisdom for Tomorrow",
    description: "Share advice and lessons you've learned",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>Here's what I've learned lately...</p>
<p></p>
<p>If you're struggling, remember...</p>
<p></p>
<p>The advice I'd give you is...</p>
<p></p>
<p>Trust yourself. You've got this.</p>`,
  },
  {
    id: "checkpoint",
    icon: "📍",
    title: "Life Checkpoint",
    description: "Document where you are in your journey",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>Here's a snapshot of my life right now:</p>
<p></p>
<p><strong>Where I'm living:</strong> </p>
<p><strong>What I'm doing:</strong> </p>
<p><strong>Who I'm spending time with:</strong> </p>
<p><strong>What I'm excited about:</strong> </p>
<p><strong>What I'm worried about:</strong> </p>
<p></p>
<p>I wonder how much will have changed by the time you read this...</p>`,
  },
  {
    id: "encouragement",
    icon: "✨",
    title: "Words of Encouragement",
    description: "Send love and support to your future self",
    promptText: `<p>Dear Future Me,</p>
<p></p>
<p>I'm writing this because I want you to know...</p>
<p></p>
<p>No matter what you're going through right now, remember...</p>
<p></p>
<p>You are stronger than you think because...</p>
<p></p>
<p>I believe in you. Always have, always will.</p>`,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function Phase2Reflection({
  selectedTemplate,
  onComplete,
  onSkip,
}: Phase2ReflectionProps) {
  const [selected, setSelected] = useState<TemplateOption | null>(selectedTemplate)

  const handleSelect = (template: TemplateOption) => {
    setSelected(template)
  }

  const handleContinue = () => {
    onComplete(selected)
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-duck-yellow bg-duck-yellow/20">
            <Lightbulb className="h-8 w-8 text-charcoal" />
          </div>
          <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
            Need Inspiration?
          </h2>
          <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-gray-secondary">
            Choose a theme to guide your reflection, or skip ahead if you already
            know what you want to write.
          </p>
        </motion.div>

        {/* Template Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {templates.map((template) => (
            <motion.button
              key={template.id}
              variants={cardVariants}
              onClick={() => handleSelect(template)}
              className={cn(
                "group relative border-2 p-6 text-left transition-all duration-200",
                "hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]",
                selected?.id === template.id
                  ? "border-teal-primary bg-teal-primary/5 shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]"
                  : "border-charcoal bg-white hover:bg-bg-yellow-cream"
              )}
              style={{ borderRadius: "2px" }}
            >
              {/* Selected indicator */}
              {selected?.id === template.id && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-primary bg-teal-primary text-white">
                  <span className="text-xs">✓</span>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-3xl">{template.icon}</span>
                <h3 className="font-mono text-base font-semibold text-charcoal">
                  {template.title}
                </h3>
                <p className="font-mono text-xs leading-relaxed text-gray-secondary">
                  {template.description}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4 pt-4"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="min-w-[200px] gap-2 text-base uppercase"
            disabled={!selected}
          >
            Use This Template
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={onSkip}
            className="flex items-center gap-2 font-mono text-sm text-gray-secondary transition-colors hover:text-charcoal"
          >
            <PenLine className="h-4 w-4" />
            Skip — I know what to write
          </button>
        </motion.div>
      </div>
    </div>
  )
}
