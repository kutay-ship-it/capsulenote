"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Award, Calendar, Snowflake, Sun, Leaf, Flower, Gift, Users } from "lucide-react"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import type { CampaignCard } from "@/components/sandbox/types"

const campaigns: CampaignCard[] = [
  {
    id: "new-year",
    title: "New Year Reflection",
    description: "Write to yourself about 2025 resolutions",
    season: "new-year",
    promptSuggestion: "What do you want to accomplish before next New Year?",
  },
  {
    id: "birthday",
    title: "Birthday Wisdom",
    description: "Capture lessons from this year of life",
    season: "birthday",
    promptSuggestion: "What did this year teach you that you'll never forget?",
  },
  {
    id: "summer",
    title: "Summer Adventures",
    description: "Document your summer memories",
    season: "summer",
    promptSuggestion: "Which summer moment do you want to relive in 5 years?",
  },
  {
    id: "gratitude",
    title: "Gratitude Season",
    description: "Write about what you're thankful for",
    season: "fall",
    promptSuggestion: "List 10 things you're grateful for right now.",
  },
]

const seasonIcons = {
  "new-year": Gift,
  birthday: Gift,
  summer: Sun,
  fall: Leaf,
  spring: Flower,
  winter: Snowflake,
}

export function RetentionFeatures() {
  const {
    state: { streak, letters, deliveries },
  } = useSandboxExperience()

  const currentStreak = streak.currentStreak
  const longestStreak = streak.longestStreak

  return (
    <div className="space-y-6">
      <Card className="border-2 border-charcoal bg-gradient-to-br from-duck-yellow to-coral">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-2xl uppercase tracking-tight text-charcoal">
                Your Writing Streak
              </CardTitle>
              <CardDescription className="font-mono text-sm text-charcoal/70">
                Keep the momentum going · Build the habit
              </CardDescription>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-charcoal bg-white">
              <Flame className="h-8 w-8 text-coral" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-charcoal bg-white">
              <CardContent className="p-6 text-center">
                <div className="font-mono text-5xl font-bold text-charcoal">{currentStreak}</div>
                <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">
                  Current streak
                </div>
                <div className="mt-1 font-mono text-xs text-gray-secondary">
                  {currentStreak === 0 ? "Start writing to begin" : currentStreak === 1 ? "Keep it up!" : "On fire! 🔥"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-charcoal bg-white">
              <CardContent className="p-6 text-center">
                <div className="font-mono text-5xl font-bold text-charcoal">{longestStreak}</div>
                <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">
                  Longest streak
                </div>
                <div className="mt-1 font-mono text-xs text-gray-secondary">
                  {longestStreak === 0 ? "Your record awaits" : "Personal best"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-dashed border-charcoal bg-white/80">
            <CardContent className="flex items-center gap-3 p-4">
              <Award className="h-5 w-5 text-charcoal" />
              <div className="flex-1">
                <p className="font-mono text-xs uppercase text-charcoal">Milestone Progress</p>
                <p className="font-mono text-xs text-gray-secondary">
                  {letters.length}/10 letters written · {deliveries.length}/5 deliveries scheduled
                </p>
              </div>
              <Badge variant="outline" className="border-2 border-charcoal font-mono text-xs">
                {Math.round(((letters.length + deliveries.length) / 15) * 100)}%
              </Badge>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="border-2 border-charcoal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-xl uppercase tracking-tight text-charcoal">
                Seasonal Campaigns
              </CardTitle>
              <CardDescription className="font-mono text-sm text-gray-secondary">
                Curated writing prompts for life's milestones
              </CardDescription>
            </div>
            <Calendar className="h-6 w-6 text-charcoal" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.map((campaign) => {
            const SeasonIcon = seasonIcons[campaign.season]
            return (
              <Card
                key={campaign.id}
                className="cursor-pointer border-2 border-charcoal transition-all hover:-translate-y-1"
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-charcoal bg-bg-blue-light">
                    <SeasonIcon className="h-6 w-6 text-charcoal" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-mono text-sm uppercase text-charcoal">{campaign.title}</h4>
                      <p className="font-mono text-xs text-gray-secondary">{campaign.description}</p>
                    </div>
                    <div className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale p-2">
                      <p className="font-mono text-xs italic text-charcoal">"{campaign.promptSuggestion}"</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-2 border-charcoal font-mono text-xs uppercase">
                      Start this letter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-2 border-charcoal bg-bg-purple-light">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-xl uppercase tracking-tight text-charcoal">
                Collaborative Capsules
              </CardTitle>
              <CardDescription className="font-mono text-sm text-gray-secondary">
                Write together · Open together
              </CardDescription>
            </div>
            <Users className="h-6 w-6 text-charcoal" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-mono text-xs text-gray-secondary">
            Create group letters with friends, family, or teams. Everyone contributes, and you all receive it at the same
            future moment.
          </p>

          <Card className="border-2 border-dashed border-charcoal bg-white/60">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Badge className="border-2 border-charcoal bg-bg-yellow-pale font-mono text-xs uppercase text-charcoal">
                  Coming Soon
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-charcoal">Planned features:</p>
                <ul className="space-y-1 font-mono text-xs text-gray-secondary">
                  <li>• Invite up to 10 collaborators</li>
                  <li>• Each person adds their perspective</li>
                  <li>• Delivered to everyone simultaneously</li>
                  <li>• Perfect for teams, families, or friend groups</li>
                </ul>
              </div>
              <Button disabled className="w-full border-2 border-charcoal font-mono text-xs uppercase">
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
