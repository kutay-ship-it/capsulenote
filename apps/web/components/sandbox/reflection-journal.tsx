"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, ThumbsUp, Smile, BookHeart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import type { ReflectionEntry } from "@/components/sandbox/types"

const feelings = [
  { id: "moved", label: "Moved", icon: Heart, color: "bg-coral/20" },
  { id: "surprised", label: "Surprised", icon: Sparkles, color: "bg-bg-yellow-pale" },
  { id: "grateful", label: "Grateful", icon: ThumbsUp, color: "bg-duck-green/20" },
  { id: "nostalgic", label: "Nostalgic", icon: BookHeart, color: "bg-bg-purple-light" },
  { id: "motivated", label: "Motivated", icon: Smile, color: "bg-bg-blue-light" },
] as const

export function ReflectionJournal() {
  const {
    state: { deliveries, reflections },
    addReflection,
  } = useSandboxExperience()

  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState<ReflectionEntry["feeling"] | null>(null)
  const [notes, setNotes] = useState("")

  const sentDeliveries = deliveries.filter((d) => d.status === "sent")
  const selectedDeliveryData = sentDeliveries.find((d) => d.id === selectedDelivery)

  const handleSubmitReflection = () => {
    if (!selectedDelivery || !selectedFeeling) return
    addReflection(selectedDelivery, selectedFeeling, notes)
    setSelectedDelivery(null)
    setSelectedFeeling(null)
    setNotes("")
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-charcoal">
        <CardHeader>
          <CardTitle className="font-mono text-2xl uppercase tracking-tight text-charcoal">
            Reflection Journal
          </CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">
            Capture how your past words landed in your present moment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sentDeliveries.length === 0 ? (
            <Card className="border-2 border-dashed border-charcoal bg-bg-yellow-pale/30">
              <CardContent className="p-6 text-center">
                <p className="font-mono text-sm text-gray-secondary">
                  No delivered letters yet. Complete a delivery to unlock reflections.
                </p>
              </CardContent>
            </Card>
          ) : selectedDelivery ? (
            <div className="space-y-4">
              <Card className="border-2 border-charcoal bg-bg-purple-light/30">
                <CardContent className="space-y-2 p-4">
                  <p className="font-mono text-xs uppercase text-gray-secondary">Reflecting on</p>
                  <p className="font-mono text-base text-charcoal">{selectedDeliveryData?.letterTitle}</p>
                  <Badge variant="outline" className="border-charcoal font-mono text-xs">
                    Delivered {selectedDeliveryData && formatDistanceToNow(new Date(selectedDeliveryData.deliverAt), { addSuffix: true })}
                  </Badge>
                </CardContent>
              </Card>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase text-charcoal">How did it land?</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  {feelings.map((feeling) => {
                    const Icon = feeling.icon
                    const isSelected = selectedFeeling === feeling.id
                    return (
                      <button
                        key={feeling.id}
                        onClick={() => setSelectedFeeling(feeling.id)}
                        className={`flex flex-col items-center gap-2 rounded-sm border-2 border-charcoal p-4 transition-all ${
                          isSelected ? feeling.color : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-6 w-6 text-charcoal" />
                        <span className="font-mono text-xs uppercase text-charcoal">{feeling.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase text-charcoal">Journal entry (optional)</label>
                <Textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What surprised you? What will you do differently? What do you want to remember?"
                  className="border-2 border-charcoal font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReflection}
                  disabled={!selectedFeeling}
                  className="border-2 border-charcoal font-mono uppercase"
                >
                  Save Reflection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDelivery(null)
                    setSelectedFeeling(null)
                    setNotes("")
                  }}
                  className="border-2 border-charcoal font-mono uppercase"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase text-gray-secondary">Select a delivered letter</p>
              {sentDeliveries.map((delivery) => {
                const reflection = reflections.find((r) => r.deliveryId === delivery.id)
                return (
                  <Card
                    key={delivery.id}
                    className="cursor-pointer border-2 border-charcoal transition-all hover:-translate-y-0.5"
                    onClick={() => !reflection && setSelectedDelivery(delivery.id)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-mono text-sm uppercase text-charcoal">{delivery.letterTitle}</p>
                        <p className="font-mono text-xs text-gray-secondary">
                          Delivered {formatDistanceToNow(new Date(delivery.deliverAt), { addSuffix: true })}
                        </p>
                      </div>
                      {reflection ? (
                        <Badge className="border-2 border-charcoal bg-duck-green font-mono text-xs uppercase">
                          ✓ Reflected
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="border-2 border-charcoal font-mono text-xs uppercase">
                          Reflect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {reflections.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase text-gray-secondary">Past reflections ({reflections.length})</p>
              {reflections.slice(0, 3).map((reflection) => {
                const feeling = feelings.find((f) => f.id === reflection.feeling)
                const FeelingIcon = feeling?.icon
                return (
                  <Card key={reflection.id} className="border-2 border-dashed border-charcoal bg-white">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center gap-2">
                        {FeelingIcon && <FeelingIcon className="h-4 w-4 text-charcoal" />}
                        <Badge variant="outline" className="border-charcoal font-mono text-xs uppercase">
                          {feeling?.label}
                        </Badge>
                        <span className="font-mono text-xs text-gray-secondary">
                          {formatDistanceToNow(new Date(reflection.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {reflection.notes && (
                        <p className="font-mono text-xs text-gray-secondary">{reflection.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
