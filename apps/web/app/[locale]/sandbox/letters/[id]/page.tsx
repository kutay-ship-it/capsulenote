"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import {
  ArrowLeft, Calendar, Mail, MapPin, Edit, Trash2, CheckCircle2,
  Clock, Heart, Sparkles, Download, Share2, MessageCircle,
  ShieldCheck, Tag, User, Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { state: { letters, deliveries, reflections } } = useSandboxExperience()

  const letter = letters.find(l => l.id === resolvedParams.id)
  const delivery = deliveries.find(d => d.letterId === resolvedParams.id)
  const reflection = reflections.find(r => r.deliveryId === delivery?.id)

  if (!letter) {
    return (
      <div className="container max-w-4xl py-20">
        <Card className="border-2 border-charcoal">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Mail className="h-16 w-16 text-gray-secondary" />
            <h2 className="mt-4 font-mono text-xl uppercase text-charcoal">Letter not found</h2>
            <p className="mt-2 font-mono text-sm text-gray-secondary">This letter doesn't exist or has been deleted</p>
            <Button
              className="mt-6 border-2 border-charcoal font-mono text-xs uppercase"
              onClick={() => window.location.href = "/sandbox/dashboard"}
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const wordCount = letter.body.trim().split(/\s+/).length
  const isDelivered = delivery?.status === "sent"
  const isScheduled = delivery?.status === "scheduled"

  return (
    <div className="container max-w-4xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-2 border-charcoal font-mono text-xs uppercase"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-charcoal font-mono text-xs uppercase"
            >
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-charcoal font-mono text-xs uppercase"
            >
              <Share2 className="mr-1 h-3 w-3" />
              Share
            </Button>
          </div>
        </div>

        <Card className="border-2 border-charcoal shadow-lg">
          <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="font-mono text-2xl uppercase tracking-wide text-charcoal">
                  {letter.title}
                </CardTitle>
                <CardDescription className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-gray-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Written {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {wordCount} words
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    AES-256 encrypted
                  </span>
                </CardDescription>
              </div>
              {isDelivered && (
                <Badge className="bg-duck-green border-2 border-charcoal font-mono text-xs text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Delivered
                </Badge>
              )}
              {isScheduled && (
                <Badge className="bg-purple-600 border-2 border-charcoal font-mono text-xs text-white">
                  <Clock className="mr-1 h-3 w-3" />
                  Scheduled
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            <div className="prose prose-sm max-w-none">
              <div className="rounded-sm border-2 border-charcoal bg-bg-yellow-pale/30 p-6">
                <p className="font-serif text-base leading-relaxed text-charcoal whitespace-pre-wrap">
                  {letter.body}
                </p>
              </div>
            </div>

            {letter.tags && letter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-xs uppercase text-gray-secondary">Tags:</span>
                {letter.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-charcoal font-mono text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="border-dashed border-charcoal" />

            {delivery && (
              <Card className="border-2 border-charcoal bg-bg-blue-light/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-mono text-base uppercase tracking-wide">
                    <Mail className="h-4 w-4" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs uppercase text-gray-secondary">Delivery date</p>
                      <p className="mt-1 font-mono text-sm font-bold text-charcoal">
                        {new Date(delivery.deliverAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="font-mono text-xs text-gray-secondary">
                        {new Date(delivery.deliverAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-xs uppercase text-gray-secondary">Channel</p>
                      <p className="mt-1 font-mono text-sm font-bold text-charcoal">
                        {delivery.channel === "email" ? "Email" : "Physical Mail"}
                      </p>
                      <p className="font-mono text-xs text-gray-secondary">
                        {delivery.channel === "email"
                          ? delivery.recipientEmail
                          : delivery.mailingAddress?.split('\n')[0]}
                      </p>
                    </div>
                  </div>

                  {isScheduled && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-charcoal font-mono text-xs uppercase"
                        onClick={() => window.location.href = "/sandbox/schedule"}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-charcoal font-mono text-xs uppercase text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Cancel delivery
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {reflection && (
              <Card className="border-2 border-charcoal bg-coral/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-mono text-base uppercase tracking-wide">
                    <Heart className="h-4 w-4 text-coral" />
                    Your Reflection
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-gray-secondary">
                    Added {new Date(reflection.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="border-2 border-charcoal bg-white font-mono text-xs capitalize">
                      {reflection.feeling}
                    </Badge>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-charcoal">
                    {reflection.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {isDelivered && !reflection && (
              <Card className="border-2 border-charcoal bg-bg-yellow-pale/30">
                <CardContent className="flex items-center gap-4 p-6">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-mono text-sm font-bold text-charcoal">
                      Add your reflection
                    </p>
                    <p className="mt-1 font-mono text-xs text-gray-secondary">
                      How did this letter make you feel? What changed since you wrote it?
                    </p>
                  </div>
                  <Button
                    className="border-2 border-charcoal font-mono text-xs uppercase"
                    onClick={() => window.location.href = "/sandbox/aftercare"}
                  >
                    Reflect now
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal bg-duck-green/10">
          <CardContent className="flex items-center gap-4 p-6">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <p className="font-mono text-sm font-bold text-charcoal">
                Keep writing to future you
              </p>
              <p className="mt-1 font-mono text-xs text-gray-secondary">
                Each letter is a gift to your future self. Continue the journey.
              </p>
            </div>
            <Button
              className="border-2 border-charcoal font-mono text-xs uppercase"
              onClick={() => window.location.href = "/sandbox/editor"}
            >
              Write another letter
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
