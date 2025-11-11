"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PenLine, ShieldCheck, Sparkles, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import { defaultDraft } from "@/components/sandbox/experience-context"

const prompts = [
  "Tell future you what you're proud of right now.",
  "Describe the moment you're hoping to relive.",
  "Write about someone you never want to forget.",
]

const presets = [
  { label: "6 months", value: "6m" },
  { label: "1 year", value: "1y" },
  { label: "3 years", value: "3y" },
  { label: "5 years", value: "5y" },
]

export function HeroEditorPrototype() {
  const {
    state: { heroDraft, letters },
    updateHeroDraft,
    resetHeroDraft,
    saveDraftAsLetter,
  } = useSandboxExperience()
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [sidecarOpen, setSidecarOpen] = useState(false)
  const [authComplete, setAuthComplete] = useState(false)

  useEffect(() => {
    setAutosaveState("saving")
    const timeout = setTimeout(() => setAutosaveState("saved"), 350)
    return () => clearTimeout(timeout)
  }, [heroDraft])

  const wordCount = heroDraft.body.trim() ? heroDraft.body.trim().split(/\s+/).length : 0
  const isReady = heroDraft.body.trim().length >= 60

  const mood = useMemo(() => {
    if (wordCount === 0) return "awaiting inspiration"
    if (wordCount < 50) return "warming up"
    if (wordCount < 150) return "thoughtful"
    return "flow state"
  }, [wordCount])

  const handleMockAuth = () => {
    if (!isReady) return
    setSidecarOpen(true)
    setAuthComplete(false)
  }

  const handleAuthMethod = () => {
    const stored = saveDraftAsLetter()
    if (stored) {
      setAuthComplete(true)
      setTimeout(() => {
        setSidecarOpen(false)
        resetHeroDraft()
      }, 800)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
      <div className="space-y-6">
        <Badge variant="outline" className="uppercase tracking-wide">
          Prototype
        </Badge>
        <div className="space-y-4">
          <h1 className="font-mono text-4xl font-normal uppercase tracking-tight text-charcoal">Write without signing in</h1>
          <p className="max-w-xl font-mono text-base text-gray-secondary">
            This hero mirrors <code>sandbox/landing_editor_prototype.md</code>. Drafts stay local via the sandbox experience provider.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {["Guided prompts", "Time presets", "Autosave", "Passkey-ready"].map((feature) => (
            <Badge key={feature} className="border-2 border-charcoal bg-white font-mono text-xs uppercase">
              {feature}
            </Badge>
          ))}
        </div>
        <Card className="border-2 border-dashed border-charcoal bg-bg-blue-light/60">
          <CardHeader>
            <CardTitle className="font-mono text-lg uppercase tracking-wide">How it works</CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              Letters saved here feed the rest of the sandbox pages for a consistent journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-charcoal">
            <p>1. Draft auto-saves and updates the shared context.</p>
            <p>2. Auth sidecar writes the draft into the sandbox letter list.</p>
            <p>3. Dashboard + scheduling pages consume that state.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-charcoal shadow-[var(--shadow, -10px_10px_0px_0px_rgba(56,56,56,0.9))]">
        <CardHeader className="space-y-3 border-b border-dashed border-charcoal pb-6">
          <CardTitle className="flex items-center justify-between font-mono text-base uppercase tracking-wide">
            Live hero editor
            <span className={cn("text-xs font-normal", autosaveState === "saved" ? "text-green-600" : "text-gray-secondary")}>
              {autosaveState === "saving" ? "Saving..." : autosaveState === "saved" ? "Saved locally" : "Idle"}
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant={heroDraft.prompt === prompt ? "default" : "outline"}
                className={cn("border-2 border-charcoal text-xs", heroDraft.prompt === prompt ? "" : "bg-white text-charcoal")}
                onClick={() => updateHeroDraft({ prompt })}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase text-charcoal">Letter title</label>
            <Input
              value={heroDraft.title}
              onChange={(event) => updateHeroDraft({ title: event.target.value })}
              className="border-2 border-charcoal font-mono text-sm uppercase"
            />
          </div>

          <div className="space-y-3">
            <label className="font-mono text-xs uppercase text-charcoal">Arrive in</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={heroDraft.preset === preset.value ? "default" : "outline"}
                  onClick={() => updateHeroDraft({ preset: preset.value })}
                  className={cn(
                    "flex-1 border-2 border-charcoal text-xs uppercase",
                    heroDraft.preset === preset.value ? "" : "bg-white text-charcoal"
                  )}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="border-2 border-charcoal text-xs uppercase"
                onClick={() => updateHeroDraft(defaultDraft)}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="relative space-y-2">
            <label className="font-mono text-xs uppercase text-charcoal">Message</label>
            <Textarea
              rows={7}
              value={heroDraft.body}
              onChange={(event) => updateHeroDraft({ body: event.target.value })}
              placeholder={heroDraft.prompt}
              className="border-2 border-charcoal font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs font-mono text-gray-secondary">
              <span>
                {wordCount} words · mood: <span className="text-charcoal">{mood}</span>
              </span>
              <span>{isReady ? "Ready to deliver" : "Add ~60 words to unlock delivery"}</span>
            </div>
          </div>

          <Button
            size="lg"
            disabled={!isReady}
            onClick={handleMockAuth}
            className="flex w-full items-center justify-center gap-2 border-2 border-charcoal text-lg uppercase"
          >
            <PenLine className="h-4 w-4" />
            Send this to my future self
          </Button>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-secondary">
            <ShieldCheck className="h-4 w-4 text-charcoal" />
            Local draft · encrypted once you finish signup
          </div>
          {letters.length > 0 && (
            <p className="text-xs font-mono text-green-700">Saved letters in sandbox: {letters.length}</p>
          )}
        </CardContent>
      </Card>

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
                <p className="font-mono text-xs uppercase text-gray-secondary">Mock auth sidecar</p>
                <h2 className="font-mono text-2xl text-charcoal">Finish storing your letter</h2>
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
                </CardContent>
              </Card>
              <div className="space-y-2">
                {["Continue with Passkey", "Email me a magic link", "Sign in with Google"].map((action) => (
                  <Button key={action} className="w-full justify-start gap-2 border-2 border-charcoal" onClick={handleAuthMethod}>
                    <Sparkles className="h-4 w-4" />
                    {action}
                  </Button>
                ))}
              </div>
              <p className="text-xs font-mono text-gray-secondary">
                {authComplete
                  ? "Letter stored! We’ll pull it into your dashboard and scheduler."
                  : "Mock copy: “We store your vault encrypted (AES-256-GCM). Verification powered by Clerk.”"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
