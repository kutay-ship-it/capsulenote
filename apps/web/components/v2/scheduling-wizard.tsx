"use client"

import { useState } from "react"
import { addMonths, addYears, format, addDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar as CalendarIcon, Clock, ArrowRight, Check, Mail, User, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Envelope3D } from "@/components/v2/envelope-3d"

export interface RecipientInfo {
    type: "self" | "other"
    email: string
    name?: string
}

interface SchedulingWizardProps {
    isOpen: boolean
    onClose: () => void
    onComplete: (date: Date, recipient: RecipientInfo) => void
    isSubmitting?: boolean
    initialRecipientEmail?: string
}

export function SchedulingWizard({
    isOpen,
    onClose,
    onComplete,
    isSubmitting = false,
    initialRecipientEmail = "",
}: SchedulingWizardProps) {
    const [step, setStep] = useState<"recipient" | "date" | "confirm">("recipient")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [showCalendar, setShowCalendar] = useState(false)

    // Recipient State
    const [recipientType, setRecipientType] = useState<"self" | "other">("self")
    const [recipientEmail, setRecipientEmail] = useState("")
    const [recipientName, setRecipientName] = useState("")
    const [recipientError, setRecipientError] = useState("")

    const timePresets = [
        {
            id: "tomorrow",
            label: "Tomorrow",
            sub: "A quick note",
            getDate: () => addDays(new Date(), 1),
            icon: Clock
        },
        {
            id: "6-months",
            label: "6 Months",
            sub: "A nice surprise",
            getDate: () => addMonths(new Date(), 6),
            icon: CalendarIcon
        },
        {
            id: "1-year",
            label: "1 Year",
            sub: "The classic capsule",
            getDate: () => addYears(new Date(), 1),
            icon: CalendarIcon
        },
        {
            id: "5-years",
            label: "5 Years",
            sub: "Deep reflection",
            getDate: () => addYears(new Date(), 5),
            icon: CalendarIcon
        },
    ]

    const handleRecipientNext = () => {
        if (recipientType === "other") {
            if (!recipientEmail.trim()) {
                setRecipientError("Email is required")
                return
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
                setRecipientError("Please enter a valid email")
                return
            }
            if (!recipientName.trim()) {
                setRecipientError("Name is required")
                return
            }
        }
        setRecipientError("")
        setStep("date")
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setStep("confirm")
    }

    const handleConfirm = () => {
        if (selectedDate) {
            const finalEmail = recipientType === "self" ? initialRecipientEmail : recipientEmail
            onComplete(selectedDate, {
                type: recipientType,
                email: finalEmail,
                name: recipientName
            })
        }
    }

    const getStepTitle = () => {
        switch (step) {
            case "recipient": return "Who is this for?"
            case "date": return "When should this arrive?"
            case "confirm": return "Ready to seal?"
        }
    }

    const getStepDescription = () => {
        switch (step) {
            case "recipient": return "Choose who will receive this capsule."
            case "date": return "Choose a moment in the future."
            case "confirm": return `Delivering to ${recipientType === 'self' ? 'Future You' : recipientName || recipientEmail} on ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}`
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#FDFBF7] border-0 shadow-2xl">
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="font-serif text-2xl text-charcoal">
                            {getStepTitle()}
                        </h2>
                        <p className="text-stone-500 text-sm">
                            {getStepDescription()}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "recipient" && (
                            <motion.div
                                key="recipient-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setRecipientType("self")}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all",
                                            recipientType === "self"
                                                ? "border-teal-500 bg-teal-50/50 text-teal-700"
                                                : "border-stone-100 bg-white text-stone-500 hover:border-stone-200"
                                        )}
                                    >
                                        <User className="w-8 h-8 mb-3" />
                                        <span className="font-medium">Myself</span>
                                    </button>
                                    <button
                                        onClick={() => setRecipientType("other")}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all",
                                            recipientType === "other"
                                                ? "border-teal-500 bg-teal-50/50 text-teal-700"
                                                : "border-stone-100 bg-white text-stone-500 hover:border-stone-200"
                                        )}
                                    >
                                        <Users className="w-8 h-8 mb-3" />
                                        <span className="font-medium">Someone Else</span>
                                    </button>
                                </div>

                                {recipientType === "other" && (
                                    <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-100 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Recipient Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Alice"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Recipient Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="alice@example.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                            />
                                        </div>
                                        {recipientError && (
                                            <p className="text-xs text-red-500 font-medium">{recipientError}</p>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={handleRecipientNext}
                                    className="w-full bg-charcoal text-white hover:bg-teal-900"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        )}

                        {step === "date" && (
                            <motion.div
                                key="date-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                {!showCalendar ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            {timePresets.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => handleDateSelect(preset.getDate())}
                                                    className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/30 transition-all group"
                                                >
                                                    <preset.icon className="w-6 h-6 text-stone-400 group-hover:text-teal-600 mb-2" />
                                                    <span className="font-medium text-charcoal">{preset.label}</span>
                                                    <span className="text-xs text-stone-400">{preset.sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setStep("recipient")}
                                                className="flex-1 text-stone-500"
                                            >
                                                Back
                                            </Button>
                                            <button
                                                onClick={() => setShowCalendar(true)}
                                                className="flex-[2] p-2 text-sm text-stone-500 hover:text-charcoal underline decoration-stone-300 underline-offset-4 transition-colors"
                                            >
                                                Pick a specific date...
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center bg-white rounded-xl border border-stone-100 p-4 shadow-sm">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                if (date) handleDateSelect(date)
                                            }}
                                            disabled={{ before: new Date() }}
                                            className="rounded-md border-0"
                                            classNames={{
                                                day_selected: "bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white",
                                                day_today: "bg-stone-100 text-stone-900 font-bold",
                                            }}
                                        />
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="mt-4 text-sm text-stone-500 hover:text-charcoal"
                                        >
                                            Back to presets
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === "confirm" && (
                            <motion.div
                                key="confirm-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-center py-8">
                                    <Envelope3D recipientName={recipientType === 'self' ? 'Future You' : recipientName || recipientEmail} />
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-stone-100 text-center space-y-3">
                                    <div className="flex items-center justify-between text-sm border-b border-stone-50 pb-2">
                                        <span className="text-stone-400">To</span>
                                        <span className="font-medium text-charcoal">
                                            {recipientType === 'self' ? 'Future You' : recipientName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm border-b border-stone-50 pb-2">
                                        <span className="text-stone-400">Email</span>
                                        <span className="font-medium text-charcoal truncate max-w-[200px]">
                                            {recipientType === 'self' ? initialRecipientEmail : recipientEmail}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-stone-400">Arrives</span>
                                        <span className="font-medium text-charcoal">
                                            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep("date")}
                                        className="flex-1"
                                    >
                                        Change Date
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-charcoal text-white hover:bg-teal-900"
                                    >
                                        {isSubmitting ? "Sealing..." : "Confirm & Seal"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}
