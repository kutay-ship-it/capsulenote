"use client"

import { useState, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

interface FloatingWriteButtonProps {
  heroRef?: React.RefObject<HTMLDivElement>
}

/**
 * Custom hook to detect mobile viewport
 */
function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Check on mount
    checkMobile()

    // Check on resize
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}

/**
 * Floating action button for writing new letters
 *
 * - Only visible on mobile (<768px)
 * - Appears when hero section scrolls out of view
 */
export function FloatingWriteButton({ heroRef }: FloatingWriteButtonProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Don't observe on desktop
    if (!isMobile) {
      setIsVisible(false)
      return
    }

    // If no hero ref provided, show button after scrolling a bit
    if (!heroRef?.current) {
      const handleScroll = () => {
        setIsVisible(window.scrollY > 200)
      }

      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }

    // Use IntersectionObserver for hero visibility
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Show button when hero is NOT visible
        if (entry) setIsVisible(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px", // Trigger when hero is mostly out of view
      }
    )

    observerRef.current.observe(heroRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [isMobile, heroRef])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  const handleClick = () => {
    router.push("/letters/new")
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center",
        "border-2 border-charcoal bg-duck-blue shadow-sm",
        "transition-all duration-200",
        "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-duck-blue focus:ring-offset-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      style={{ borderRadius: "2px" }}
      aria-label="Write a letter"
    >
      <Plus className="h-6 w-6 text-charcoal" strokeWidth={2.5} />
    </button>
  )
}
