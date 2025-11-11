"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import {
  Calendar, Clock, Mail, MapPin, Edit, Trash2, Eye,
  Sparkles, Timer, CalendarDays, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function UpcomingPage() {
  const { state: { letters, deliveries } } = useSandboxExperience()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const scheduledDeliveries = deliveries.filter(d => d.status === "scheduled")
  const upcomingDeliveries = scheduledDeliveries
    .map(delivery => ({
      ...delivery,
      letter: letters.find(l => l.id === delivery.letterId)!,
      timeUntil: new Date(delivery.deliverAt).getTime() - currentTime.getTime()
    }))
    .sort((a, b) => a.timeUntil - b.timeUntil)

  const formatCountdown = (milliseconds: number) => {
    if (milliseconds < 0) return "Ready to deliver"

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y ${months % 12}mo`
    if (months > 0) return `${months}mo ${days % 30}d`
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getDeliveryStatus = (timeUntil: number) => {
    const days = timeUntil / (1000 * 60 * 60 * 24)
    if (days < 1) return { label: "Delivering soon", color: "bg-coral", icon: AlertCircle }
    if (days < 7) return { label: "This week", color: "bg-purple-600", icon: Clock }
    if (days < 30) return { label: "This month", color: "bg-duck-green", icon: CalendarDays }
    return { label: "Scheduled", color: "bg-charcoal", icon: Calendar }
  }

  return (
    <div className="container max-w-6xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Upcoming Deliveries
              </h1>
              <p className="mt-1 font-mono text-sm text-gray-secondary">
                {upcomingDeliveries.length} letters waiting to reach future you
              </p>
            </div>
            <Button
              className="border-2 border-charcoal font-mono text-xs uppercase"
              onClick={() => window.location.href = "/sandbox/editor"}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Write another
            </Button>
          </div>
        </div>

        <Separator className="border-2 border-dashed border-charcoal" />

        {upcomingDeliveries.length === 0 ? (
          <Card className="border-2 border-charcoal">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Timer className="h-16 w-16 text-gray-secondary" />
              <h2 className="mt-4 font-mono text-xl uppercase text-charcoal">
                No upcoming deliveries
              </h2>
              <p className="mt-2 max-w-md text-center font-mono text-sm text-gray-secondary">
                Schedule your first letter to see countdown timers and delivery tracking here
              </p>
              <Button
                className="mt-6 border-2 border-charcoal font-mono text-xs uppercase"
                onClick={() => window.location.href = "/sandbox/schedule"}
              >
                Schedule delivery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingDeliveries.map((delivery, index) => {
              const status = getDeliveryStatus(delivery.timeUntil)
              const StatusIcon = status.icon
              const deliveryDate = new Date(delivery.deliverAt)

              return (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-charcoal hover:shadow-lg transition-shadow">
                    <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="font-mono text-lg uppercase tracking-wide">
                              {delivery.letter.title}
                            </CardTitle>
                            <Badge className={cn("border-2 border-charcoal font-mono text-xs", status.color, "text-white")}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <CardDescription className="mt-2 font-mono text-xs text-gray-secondary">
                            Written on {new Date(delivery.letter.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-charcoal bg-bg-yellow-pale">
                              <Calendar className="h-6 w-6 text-charcoal" />
                            </div>
                            <div>
                              <p className="font-mono text-xs uppercase text-gray-secondary">Delivery date</p>
                              <p className="font-mono text-sm font-bold text-charcoal">
                                {deliveryDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="font-mono text-xs text-gray-secondary">
                                {deliveryDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-charcoal bg-bg-blue-light">
                              <Mail className="h-6 w-6 text-charcoal" />
                            </div>
                            <div>
                              <p className="font-mono text-xs uppercase text-gray-secondary">Delivery channel</p>
                              <p className="font-mono text-sm font-bold text-charcoal">
                                {delivery.channel === "email" ? "Email" : "Physical Mail"}
                              </p>
                              <p className="font-mono text-xs text-gray-secondary">
                                {delivery.channel === "email"
                                  ? delivery.recipientEmail
                                  : delivery.mailingAddress?.split('\n')[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-2 border-charcoal font-mono text-xs uppercase"
                              onClick={() => window.location.href = `/sandbox/letters/${delivery.letterId}`}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-2 border-charcoal font-mono text-xs uppercase"
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
                              Cancel
                            </Button>
                          </div>
                        </div>

                        <Separator orientation="vertical" className="hidden md:block border-l-2 border-dashed border-charcoal" />

                        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-charcoal bg-bg-yellow-pale p-6">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-charcoal" />
                            <p className="font-mono text-xs uppercase text-gray-secondary">Time until</p>
                          </div>
                          <div className="mt-4 text-center">
                            <p className="font-mono text-4xl font-bold text-charcoal">
                              {formatCountdown(delivery.timeUntil)}
                            </p>
                            <p className="mt-2 font-mono text-xs text-gray-secondary">remaining</p>
                          </div>

                          <div className="mt-6 w-full">
                            <div className="h-2 w-full rounded-full border-2 border-charcoal bg-white overflow-hidden">
                              <div
                                className="h-full bg-purple-600 transition-all duration-1000"
                                style={{
                                  width: `${Math.max(0, 100 - (delivery.timeUntil / (365 * 24 * 60 * 60 * 1000)) * 100)}%`
                                }}
                              />
                            </div>
                            <p className="mt-2 text-center font-mono text-xs text-gray-secondary">
                              Journey progress
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        <Card className="border-2 border-charcoal bg-duck-green/10">
          <CardContent className="flex items-center gap-4 p-6">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <p className="font-mono text-sm font-bold text-charcoal">
                Build anticipation for future you
              </p>
              <p className="mt-1 font-mono text-xs text-gray-secondary">
                Each scheduled letter is a gift waiting to arrive. Add memories while you wait.
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
