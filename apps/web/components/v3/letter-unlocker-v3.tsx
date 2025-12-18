"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { markLetterAsOpened } from "@/server/actions/letters"
import { UnlockSealedV3 } from "./unlock-sealed-v3"
import { UnlockAnimationV3 } from "./unlock-animation-v3"
import { UnlockRevealedV3 } from "./unlock-revealed-v3"

type UnlockState = "sealed" | "unlocking" | "revealed"

interface LetterUnlockerV3Props {
  letterId: string
  letterTitle: string
  letterContent: string
  writtenDate: Date
  deliveryDate: Date
  firstOpenedAt: Date | null
  isReplay: boolean
}

export function LetterUnlockerV3({
  letterId,
  letterTitle,
  letterContent,
  writtenDate,
  deliveryDate,
  firstOpenedAt,
  isReplay,
}: LetterUnlockerV3Props) {
  // Determine initial state based on firstOpenedAt and isReplay
  const getInitialState = (): UnlockState => {
    if (isReplay) return "sealed"
    if (firstOpenedAt) return "revealed"
    return "sealed"
  }

  const [state, setState] = useState<UnlockState>(getInitialState)
  const [openedAt, setOpenedAt] = useState<Date | null>(firstOpenedAt)

  // Handle unlock button click
  const handleUnlock = useCallback(async () => {
    setState("unlocking")

    // Mark as opened in database (if not already opened)
    if (!firstOpenedAt) {
      const result = await markLetterAsOpened(letterId)
      if (result.success) {
        setOpenedAt(result.data.firstOpenedAt)
      }
    }

    // Animation runs for ~2 seconds, then transition to revealed
    setTimeout(() => {
      setState("revealed")
    }, 2000)
  }, [letterId, firstOpenedAt])

  // Handle replay
  const handleReplay = useCallback(() => {
    setState("sealed")
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {state === "sealed" && (
          <UnlockSealedV3
            key="sealed"
            letterTitle={letterTitle}
            writtenDate={writtenDate}
            deliveryDate={deliveryDate}
            onUnlock={handleUnlock}
          />
        )}

        {state === "unlocking" && (
          <UnlockAnimationV3 key="unlocking" />
        )}

        {state === "revealed" && (
          <UnlockRevealedV3
            key="revealed"
            letterId={letterId}
            letterTitle={letterTitle}
            letterContent={letterContent}
            writtenDate={writtenDate}
            firstOpenedAt={openedAt || firstOpenedAt}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
