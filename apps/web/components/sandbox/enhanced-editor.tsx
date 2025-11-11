"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  PenLine, ShieldCheck, X, Sparkles, Volume2, VolumeX,
  BookOpen, Heart, Target, MessageCircle, Smile, Meh, Frown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import { defaultDraft } from "@/components/sandbox/experience-context"
import type { LetterTemplate } from "@/components/sandbox/types"

const templates: LetterTemplate[] = [
  {
    id: "reflection",
    category: "reflection",
    title: "Year in Review",
    description: "Reflect on your biggest wins, lessons, and growth",
    promptText: "What were the three most defining moments of this year?",
    icon: "💭",
  },
  {
    id: "goal",
    category: "goal",
    title: "Future Goals",
    description: "Set intentions and commitments for your future self",
    promptText: "What do you want to accomplish in the next year?",
    icon: "🎯",
  },
  {
    id: "gratitude",
    category: "gratitude",
    title: "Gratitude Letter",
    description: "Capture what you're thankful for in this moment",
    promptText: "List five things you're grateful for right now.",
    icon: "🙏",
  },
  {
    id: "legacy",
    category: "legacy",
    title: "Legacy Note",
    description: "Write wisdom you want to pass down",
    promptText: "What lesson do you want your future self to never forget?",
    icon: "📜",
  },
]

const ambientTracks = [
  { id: "rain", label: "Rain sounds", icon: "🌧️" },
  { id: "cafe", label: "Coffee shop", icon: "☕" },
  { id: "forest", label: "Forest walk", icon: "🌲" },
  { id: "ocean", label: "Ocean waves", icon: "🌊" },
]

export function EnhancedEditor() {
  const {
    state: { heroDraft, letters },
    updateHeroDraft,
    resetHeroDraft,
    saveDraftAsLetter,
    updateStreak,
  } = useSandboxExperience()

  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [sidecarOpen, setSidecarOpen] = useState(false)
  const [authComplete, setAuthComplete] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  useEffect(() => {
    setAutosaveState("saving")
    const timeout = setTimeout(() => setAutosaveState("saved"), 350)
    return () => clearTimeout(timeout)
  }, [heroDraft])

  const wordCount = heroDraft.body.trim() ? heroDraft.body.trim().split(/\s+/).length : 0
  const isReady = heroDraft.body.trim().length >= 60

  const mood = useMemo(() => {
    if (wordCount === 0) return { label: "awaiting inspiration", icon: Meh, color: "text-gray-secondary" }
    if (wordCount < 50) return { label: "warming up", icon: Smile, color: "text-yellow-600" }
    if (wordCount < 150) return { label: "flow state", icon: Sparkles, color: "text-purple-600" }
    return { label: "deep reflection", icon: Heart, color: "text-coral" }
  }, [wordCount])

  const sentimentLabel = useMemo(() => {
    if (heroDraft.tone.sentiment < 35) return "Reflective"
    if (heroDraft.tone.sentiment > 65) return "Optimistic"
    return "Balanced"
  }, [heroDraft.tone.sentiment])

  const formalityLabel = useMemo(() => {
    if (heroDraft.tone.formality < 35) return "Casual"
    if (heroDraft.tone.formality > 65) return "Formal"
    return "Natural"
  }, [heroDraft.tone.formality])

  const handleMockAuth = () => {
    if (!isReady) return
    setSidecarOpen(true)
    setAuthComplete(false)
  }

  const handleAuthMethod = () => {
    const stored = saveDraftAsLetter()
    if (stored) {
      setAuthComplete(true)
      updateStreak()
      setTimeout(() => {
        setSidecarOpen(false)
        resetHeroDraft()
      }, 800)
    }
  }

  const handleApplyTemplate = (template: LetterTemplate) => {
    updateHeroDraft({
      title: template.title,
      prompt: template.promptText,
      templateId: template.id,
    })
    setTemplateModalOpen(false)
  }

  const MoodIcon = mood.icon

  return (
    <div id="hero-editor" className="space-y-6">
      <Card className="border-2 border-charcoal shadow-[var(--shadow,-10px_10px_0px_0px_rgba(56,56,56,0.9))]">
        <CardHeader className="space-y-3 border-b border-dashed border-charcoal pb-6">
          <CardTitle className="flex items-center justify-between font-mono text-base uppercase tracking-wide">
            Sanctuary Editor
            <span className={cn("flex items-center gap-1 text-xs font-normal", autosaveState === "saved" ? "text-green-600" : "text-gray-secondary")}>
              <ShieldCheck className="h-3 w-3" />
              {autosaveState === "saving" ? "Encrypting..." : autosaveState === "saved" ? "Saved locally" : "Idle"}
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-charcoal font-mono text-xs uppercase"
                onClick={() => setTemplateModalOpen(true)}
              >
                <BookOpen className="mr-1 h-3 w-3" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-charcoal font-mono text-xs uppercase"
                onClick={() => {
                  setAudioEnabled(!audioEnabled)
                  if (!audioEnabled) {
                    updateHeroDraft({ ambientAudio: "rain" })
                  } else {
                    updateHeroDraft({ ambientAudio: null })
                  }
                }}
              >
                {audioEnabled ? <Volume2 className="mr-1 h-3 w-3" /> : <VolumeX className="mr-1 h-3 w-3" />}
                Ambient
              </Button>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 border border-charcoal font-mono text-xs">
              <MoodIcon className={cn("h-3 w-3", mood.color)} />
              {mood.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4 rounded-sm border-2 border-charcoal bg-bg-purple-light/30 p-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono text-xs uppercase text-charcoal">Tone: {sentimentLabel}</label>
                <span className="font-mono text-xs text-gray-secondary">Reflective ← → Optimistic</span>
              </div>
              <Slider
                value={[heroDraft.tone.sentiment]}
                onValueChange={([value]) => updateHeroDraft({ tone: { ...heroDraft.tone, sentiment: value } })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-mono text-xs uppercase text-charcoal">Style: {formalityLabel}</label>
                <span className="font-mono text-xs text-gray-secondary">Casual ← → Formal</span>
              </div>
              <Slider
                value={[heroDraft.tone.formality]}
                onValueChange={([value]) => updateHeroDraft({ tone: { ...heroDraft.tone, formality: value } })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {audioEnabled && (
            <Card className="border-2 border-dashed border-charcoal bg-bg-blue-light/50">
              <CardContent className="flex items-center gap-3 p-4">
                <Volume2 className="h-4 w-4 text-charcoal" />
                <div className="flex flex-wrap gap-2">
                  {ambientTracks.map((track) => (
                    <Button
                      key={track.id}
                      variant={heroDraft.ambientAudio === track.id ? "default" : "outline"}
                      size="sm"
                      className="border-2 border-charcoal font-mono text-xs uppercase"
                      onClick={() => updateHeroDraft({ ambientAudio: track.id })}
                    >
                      {track.icon} {track.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <label className="font-mono text-xs uppercase text-charcoal">Letter title</label>
            <Input
              value={heroDraft.title}
              onChange={(event) => updateHeroDraft({ title: event.target.value })}
              className="border-2 border-charcoal font-mono text-sm uppercase"
              placeholder="Name this moment"
            />
          </div>

          <div className="relative space-y-2">
            <label className="font-mono text-xs uppercase text-charcoal">Your letter</label>
            <Textarea
              rows={10}
              value={heroDraft.body}
              onChange={(event) => updateHeroDraft({ body: event.target.value })}
              placeholder={heroDraft.prompt}
              className="border-2 border-charcoal font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs font-mono text-gray-secondary">
              <span>
                {wordCount} words · {sentimentLabel} · {formalityLabel}
              </span>
              <span>{isReady ? "✓ Ready" : `${Math.max(0, 60 - heroDraft.body.trim().length)} chars needed`}</span>
            </div>
          </div>

          <Button
            size="lg"
            disabled={!isReady}
            onClick={handleMockAuth}
            className="flex w-full items-center justify-center gap-2 border-2 border-charcoal text-lg uppercase"
          >
            <PenLine className="h-5 w-5" />
            Encrypt & Schedule Delivery
          </Button>

          {letters.length > 0 && (
            <Card className="border-2 border-dashed border-charcoal bg-duck-green/10">
              <CardContent className="flex items-center justify-between p-4">
                <p className="font-mono text-xs text-charcoal">
                  ✓ {letters.length} letter{letters.length > 1 ? "s" : ""} in vault
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  onClick={() => (window.location.href = "/sandbox/dashboard")}
                >
                  View all
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {templateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setTemplateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-sm border-4 border-charcoal bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-2xl uppercase text-charcoal">Letter Templates</h2>
                  <p className="font-mono text-sm text-gray-secondary">Start with proven prompts</p>
                </div>
                <Button variant="ghost" onClick={() => setTemplateModalOpen(false)} className="text-gray-secondary">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer border-2 border-charcoal transition-all hover:-translate-y-1"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="font-mono text-lg uppercase tracking-wide">{template.title}</CardTitle>
                          <CardDescription className="font-mono text-xs text-gray-secondary">
                            {template.description}
                          </CardDescription>
                        </div>
                        <span className="text-3xl">{template.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-3 font-mono text-xs italic text-charcoal">
                        "{template.promptText}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidecarOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l-4 border-charcoal bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-gray-secondary">Finish & encrypt</p>
                <h2 className="font-mono text-2xl text-charcoal">Save your letter</h2>
              </div>
              <Button variant="ghost" onClick={() => setSidecarOpen(false)} className="text-gray-secondary">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <Card className="border border-dashed border-charcoal bg-bg-yellow-pale">
                <CardContent className="space-y-2 p-4">
                  <p className="font-mono text-xs uppercase text-gray-secondary">Preview</p>
                  <p className="font-serif text-sm leading-relaxed text-charcoal">{heroDraft.body.slice(0, 140)}...</p>
                  <div className="flex gap-2 text-xs font-mono text-gray-secondary">
                    <Badge variant="outline" className="border-charcoal">{wordCount} words</Badge>
                    <Badge variant="outline" className="border-charcoal">{sentimentLabel}</Badge>
                    <Badge variant="outline" className="border-charcoal">{formalityLabel}</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {["Continue with Passkey", "Email magic link", "Sign in with Google"].map((action) => (
                  <Button
                    key={action}
                    className="w-full justify-start gap-2 border-2 border-charcoal"
                    onClick={handleAuthMethod}
                  >
                    <Sparkles className="h-4 w-4" />
                    {action}
                  </Button>
                ))}
              </div>

              <p className="text-xs font-mono text-gray-secondary">
                {authComplete
                  ? "✓ Letter encrypted and stored! Redirecting to scheduler..."
                  : "Your letter is encrypted (AES-256-GCM) and stored in your private vault. Only you can decrypt it."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
