"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { RichTextEditor } from "@/components/sandbox/rich-text-editor"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import {
  Save, Calendar, ShieldCheck, Sparkles, Volume2, VolumeX,
  BookOpen, Heart, Target, User, Mail
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditorPage() {
  const {
    state: { heroDraft },
    updateHeroDraft,
    saveDraftAsLetter,
  } = useSandboxExperience()

  const [letterContent, setLetterContent] = useState(heroDraft.body)
  const [letterTitle, setLetterTitle] = useState(heroDraft.title)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")

  const handleContentChange = (html: string, text: string) => {
    setLetterContent(html)
    updateHeroDraft({ body: text })

    setSaveState("saving")
    setTimeout(() => setSaveState("saved"), 500)
  }

  const handleSave = () => {
    updateHeroDraft({ title: letterTitle, body: letterContent })
    const saved = saveDraftAsLetter()
    if (saved) {
      setSaveState("saved")
      setTimeout(() => {
        window.location.href = "/sandbox/dashboard"
      }, 500)
    }
  }

  const wordCount = letterContent.replace(/<[^>]*>/g, '').trim() ?
    letterContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0

  const isReady = wordCount >= 10

  const ambientTracks = [
    { id: "rain", label: "Rain", icon: "🌧️" },
    { id: "cafe", label: "Café", icon: "☕" },
    { id: "forest", label: "Forest", icon: "🌲" },
    { id: "ocean", label: "Ocean", icon: "🌊" },
  ]

  return (
    <div className="container max-w-5xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Rich Text Editor
              </h1>
              <p className="mt-1 font-mono text-sm text-gray-secondary">
                Full formatting capabilities for your letters
              </p>
            </div>
            <Badge
              variant={saveState === "saved" ? "default" : "secondary"}
              className={cn(
                "flex items-center gap-1 border-2 border-charcoal font-mono text-xs uppercase",
                saveState === "saved" && "bg-duck-green text-white"
              )}
            >
              <ShieldCheck className="h-3 w-3" />
              {saveState === "saving" ? "Encrypting..." : saveState === "saved" ? "Saved" : "Ready"}
            </Badge>
          </div>
        </div>

        <Separator className="border-2 border-dashed border-charcoal" />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card className="border-2 border-charcoal">
              <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/20">
                <CardTitle className="font-mono text-lg uppercase tracking-wide">
                  Letter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-mono text-xs uppercase text-charcoal">
                    <Target className="h-3 w-3" />
                    Title
                  </label>
                  <Input
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    placeholder="Name this moment..."
                    className="border-2 border-charcoal font-mono text-sm uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-mono text-xs uppercase text-charcoal">
                    <User className="h-3 w-3" />
                    Recipient
                  </label>
                  <Input
                    value="Future me"
                    disabled
                    className="border-2 border-charcoal font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <RichTextEditor
              value={letterContent}
              onChange={handleContentChange}
              placeholder="Dear future me, today I want to tell you about..."
              minHeight={400}
              maxHeight={800}
            />

            <Card className="border-2 border-charcoal bg-bg-blue-light/30">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-mono text-sm font-bold uppercase text-charcoal">
                      {wordCount} words written
                    </p>
                    <p className="font-mono text-xs text-gray-secondary">
                      {isReady ? "✓ Ready to save" : "Keep writing..."}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={!isReady}
                  className="border-2 border-charcoal font-mono text-sm uppercase"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save & Encrypt
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-charcoal">
              <CardHeader className="border-b-2 border-charcoal bg-bg-yellow-pale">
                <CardTitle className="flex items-center gap-2 font-mono text-base uppercase tracking-wide">
                  <Volume2 className="h-4 w-4" />
                  Writing Ambience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-charcoal">
                    {audioEnabled ? "Playing" : "Paused"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="border-2 border-charcoal"
                  >
                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>

                {audioEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {ambientTracks.map((track) => (
                      <Button
                        key={track.id}
                        variant={heroDraft.ambientAudio === track.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateHeroDraft({ ambientAudio: track.id })}
                        className="border-2 border-charcoal font-mono text-xs"
                      >
                        {track.icon} {track.label}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-charcoal">
              <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/30">
                <CardTitle className="font-mono text-base uppercase tracking-wide">
                  Tone Controls
                </CardTitle>
                <CardDescription className="font-mono text-xs text-gray-secondary">
                  Adjust your writing style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs uppercase text-charcoal">Sentiment</label>
                    <Badge variant="outline" className="border-charcoal font-mono text-xs">
                      {heroDraft.tone.sentiment < 35 ? "Reflective" :
                       heroDraft.tone.sentiment > 65 ? "Optimistic" : "Balanced"}
                    </Badge>
                  </div>
                  <Slider
                    value={[heroDraft.tone.sentiment]}
                    onValueChange={(values) => updateHeroDraft({ tone: { ...heroDraft.tone, sentiment: values[0] ?? heroDraft.tone.sentiment } })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between font-mono text-xs text-gray-secondary">
                    <span>Reflective</span>
                    <span>Optimistic</span>
                  </div>
                </div>

                <Separator className="border-dashed border-charcoal" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs uppercase text-charcoal">Formality</label>
                    <Badge variant="outline" className="border-charcoal font-mono text-xs">
                      {heroDraft.tone.formality < 35 ? "Casual" :
                       heroDraft.tone.formality > 65 ? "Formal" : "Natural"}
                    </Badge>
                  </div>
                  <Slider
                    value={[heroDraft.tone.formality]}
                    onValueChange={(values) => updateHeroDraft({ tone: { ...heroDraft.tone, formality: values[0] ?? heroDraft.tone.formality } })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between font-mono text-xs text-gray-secondary">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-charcoal bg-duck-green/10">
              <CardContent className="space-y-3 p-4">
                <p className="font-mono text-xs uppercase text-charcoal">Quick Actions</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-2 border-charcoal font-mono text-xs"
                    onClick={() => window.location.href = "/sandbox/schedule"}
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    Schedule Delivery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-2 border-charcoal font-mono text-xs"
                    onClick={() => window.location.href = "/sandbox/dashboard"}
                  >
                    <BookOpen className="mr-2 h-3 w-3" />
                    View All Letters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
