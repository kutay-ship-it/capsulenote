"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useSandboxExperience } from "@/components/sandbox/experience-context"
import {
  Mail, MailOpen, Calendar, Heart, Search, Filter,
  Sparkles, BookOpen, MessageCircle, Clock, Tag
} from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "all" | "unread" | "reflected" | "this-month"

export default function InboxPage() {
  const { state: { letters, deliveries, reflections } } = useSandboxExperience()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  const deliveredLetters = deliveries
    .filter(d => d.status === "sent")
    .map(delivery => ({
      ...delivery,
      letter: letters.find(l => l.id === delivery.letterId)!,
      reflection: reflections.find(r => r.deliveryId === delivery.id),
      isUnread: Math.random() > 0.5, // Mock unread status
      deliveredAt: new Date(delivery.deliverAt)
    }))
    .sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime())

  const filteredLetters = deliveredLetters.filter(item => {
    const matchesSearch = searchQuery === "" ||
      item.letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.letter.body.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && item.isUnread) ||
      (filter === "reflected" && item.reflection) ||
      (filter === "this-month" && item.deliveredAt.getMonth() === new Date().getMonth())

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: deliveredLetters.length,
    unread: deliveredLetters.filter(d => d.isUnread).length,
    reflected: deliveredLetters.filter(d => d.reflection).length,
    thisMonth: deliveredLetters.filter(d => d.deliveredAt.getMonth() === new Date().getMonth()).length
  }

  return (
    <div className="container max-w-7xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Inbox
              </h1>
              <p className="mt-1 font-mono text-sm text-gray-secondary">
                {stats.total} letters from your past self
              </p>
            </div>
            <Button
              className="border-2 border-charcoal font-mono text-xs uppercase"
              onClick={() => window.location.href = "/sandbox/upcoming"}
            >
              <Clock className="mr-2 h-4 w-4" />
              View upcoming
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-charcoal cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("all")}>
            <CardContent className="flex items-center gap-3 p-4">
              <Mail className="h-5 w-5 text-charcoal" />
              <div>
                <p className="font-mono text-2xl font-bold text-charcoal">{stats.total}</p>
                <p className="font-mono text-xs uppercase text-gray-secondary">Total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-charcoal cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("unread")}>
            <CardContent className="flex items-center gap-3 p-4">
              <MailOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-mono text-2xl font-bold text-purple-600">{stats.unread}</p>
                <p className="font-mono text-xs uppercase text-gray-secondary">Unread</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-charcoal cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("reflected")}>
            <CardContent className="flex items-center gap-3 p-4">
              <Heart className="h-5 w-5 text-coral" />
              <div>
                <p className="font-mono text-2xl font-bold text-coral">{stats.reflected}</p>
                <p className="font-mono text-xs uppercase text-gray-secondary">Reflected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-charcoal cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("this-month")}>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-duck-green" />
              <div>
                <p className="font-mono text-2xl font-bold text-duck-green">{stats.thisMonth}</p>
                <p className="font-mono text-xs uppercase text-gray-secondary">This month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-charcoal">
          <CardContent className="flex items-center gap-3 p-4">
            <Search className="h-5 w-5 text-gray-secondary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search letters by title or content..."
              className="flex-1 border-2 border-charcoal font-mono text-sm"
            />
            <div className="flex gap-2">
              {(["all", "unread", "reflected", "this-month"] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                >
                  {f.replace("-", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="border-2 border-dashed border-charcoal" />

        {filteredLetters.length === 0 ? (
          <Card className="border-2 border-charcoal">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Mail className="h-16 w-16 text-gray-secondary" />
              <h2 className="mt-4 font-mono text-xl uppercase text-charcoal">
                {deliveredLetters.length === 0 ? "No letters received yet" : "No letters match your filters"}
              </h2>
              <p className="mt-2 max-w-md text-center font-mono text-sm text-gray-secondary">
                {deliveredLetters.length === 0
                  ? "Your future letters will appear here when they're delivered"
                  : "Try adjusting your search or filters"}
              </p>
              {deliveredLetters.length === 0 && (
                <Button
                  className="mt-6 border-2 border-charcoal font-mono text-xs uppercase"
                  onClick={() => window.location.href = "/sandbox/editor"}
                >
                  Write your first letter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredLetters.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "border-2 border-charcoal cursor-pointer transition-all hover:shadow-lg",
                      item.isUnread && "bg-bg-yellow-pale/30"
                    )}
                    onClick={() => window.location.href = `/sandbox/letters/${item.letterId}`}
                  >
                    <CardHeader className="border-b-2 border-charcoal">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.isUnread ? (
                              <MailOpen className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Mail className="h-5 w-5 text-gray-secondary" />
                            )}
                            <CardTitle className="font-mono text-lg uppercase tracking-wide">
                              {item.letter.title}
                            </CardTitle>
                            {item.isUnread && (
                              <Badge className="bg-purple-600 border-2 border-charcoal font-mono text-xs text-white">
                                New
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-2 flex items-center gap-3 font-mono text-xs text-gray-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Delivered {item.deliveredAt.toLocaleDateString()}
                            </span>
                            {item.reflection && (
                              <span className="flex items-center gap-1 text-coral">
                                <Heart className="h-3 w-3" />
                                Reflected
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className="font-serif text-sm leading-relaxed text-charcoal line-clamp-3">
                          {item.letter.body.slice(0, 200)}...
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-charcoal font-mono text-xs">
                              {item.letter.body.trim().split(/\s+/).length} words
                            </Badge>
                            <Badge variant="outline" className="border-charcoal font-mono text-xs">
                              {item.channel === "email" ? "Email" : "Mail"}
                            </Badge>
                            {item.letter.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="border-charcoal font-mono text-xs">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-charcoal font-mono text-xs uppercase"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/sandbox/letters/${item.letterId}`
                            }}
                          >
                            <BookOpen className="mr-1 h-3 w-3" />
                            Read full letter
                          </Button>
                        </div>

                        {item.reflection && (
                          <Card className="border border-dashed border-charcoal bg-coral/5">
                            <CardContent className="flex items-center gap-3 p-3">
                              <MessageCircle className="h-4 w-4 text-coral" />
                              <div className="flex-1">
                                <p className="font-mono text-xs text-gray-secondary">Your reflection:</p>
                                <p className="mt-1 font-mono text-xs text-charcoal line-clamp-2">
                                  {item.reflection.notes}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Card className="border-2 border-charcoal bg-duck-green/10">
          <CardContent className="flex items-center gap-4 p-6">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <p className="font-mono text-sm font-bold text-charcoal">
                Keep the conversation going
              </p>
              <p className="mt-1 font-mono text-xs text-gray-secondary">
                Each delivered letter is a window to your past self. Add reflections to complete the journey.
              </p>
            </div>
            <Button
              className="border-2 border-charcoal font-mono text-xs uppercase"
              onClick={() => window.location.href = "/sandbox/aftercare"}
            >
              View reflections
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
