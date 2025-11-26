"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { useLocale, useTranslations } from "next-intl"
import { usePathname as useNextPathname } from "next/navigation"
import { Settings, User, Globe, LogOut, ChevronRight, Check, Sparkles } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Link, routing } from "@/i18n/routing"

type PlanType = "DIGITAL_CAPSULE" | "PAPER_PIXELS" | null

interface SettingsDropdownProps {
  userName?: string | null
  userEmail?: string | null
  planType?: PlanType
}

const PLAN_LABELS: Record<string, string> = {
  DIGITAL_CAPSULE: "Digital Capsule",
  PAPER_PIXELS: "Paper & Pixels",
}

export function SettingsDropdown({ userName, userEmail, planType }: SettingsDropdownProps) {
  const { signOut, openUserProfile } = useClerk()
  const { user } = useUser()
  const currentLocale = useLocale()
  const pathname = useNextPathname()
  const t = useTranslations("common")

  // Display name priority: prop > Clerk user > email prefix
  const displayName = userName || user?.firstName || userEmail?.split("@")[0] || "User"
  const displayEmail = userEmail || user?.primaryEmailAddress?.emailAddress || ""
  const planLabel = planType ? PLAN_LABELS[planType] : "Free"

  // Get pathname without locale prefix for language switching
  const getPathnameWithoutLocale = (path: string): string => {
    for (const loc of routing.locales) {
      if (path === `/${loc}`) return "/"
      if (path.startsWith(`/${loc}/`)) return path.slice(loc.length + 1)
    }
    return path
  }

  const internalPathname = getPathnameWithoutLocale(pathname)

  // Persist locale preference to Clerk
  const persistPreference = (targetLocale: string) => {
    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: targetLocale }),
      keepalive: true,
    }).catch(() => {})
  }

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" })
  }

  const handleManageAccount = () => {
    openUserProfile()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white text-charcoal transition-all hover:bg-off-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)] focus:outline-none focus:ring-2 focus:ring-duck-blue focus:ring-offset-2"
          style={{ borderRadius: "2px" }}
          aria-label="Settings menu"
        >
          <Settings className="h-5 w-5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-2 border-charcoal bg-white p-0 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
        sideOffset={8}
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="px-3 py-3 border-b-2 border-charcoal bg-duck-cream">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal truncate">
                {displayName}
              </span>
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider bg-teal-primary text-white shrink-0"
                style={{ borderRadius: "2px" }}
              >
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                {planLabel}
              </span>
            </div>
            {displayEmail && (
              <span className="font-mono text-xs text-charcoal/60 truncate">
                {displayEmail}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        {/* Language Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className="px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-charcoal cursor-pointer hover:bg-off-white focus:bg-off-white data-[state=open]:bg-off-white"
            style={{ borderRadius: "0" }}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span>{t("language.label")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            className="border-2 border-charcoal bg-white p-0 shadow-[4px_4px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
            sideOffset={8}
          >
            {routing.locales.map((loc) => {
              const label = loc === "en" ? t("language.english") : t("language.turkish")
              const isActive = loc === currentLocale

              return (
                <DropdownMenuItem
                  key={loc}
                  asChild
                  className="px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-charcoal cursor-pointer hover:bg-off-white focus:bg-off-white"
                  style={{ borderRadius: "0" }}
                >
                  <Link
                    // @ts-expect-error -- Dynamic pathname from current route
                    href={internalPathname}
                    locale={loc}
                    onClick={() => persistPreference(loc)}
                    className="flex items-center justify-between w-full"
                  >
                    <span>{label}</span>
                    {isActive && <Check className="h-4 w-4 text-duck-blue" />}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Settings */}
        <DropdownMenuItem
          asChild
          className="px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-charcoal cursor-pointer hover:bg-off-white focus:bg-off-white"
          style={{ borderRadius: "0" }}
        >
          <Link href="/settings-v3" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Manage Account */}
        <DropdownMenuItem
          onClick={handleManageAccount}
          className="px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-charcoal cursor-pointer hover:bg-off-white focus:bg-off-white"
          style={{ borderRadius: "0" }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Manage Account</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-0 h-0.5 bg-charcoal" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-charcoal cursor-pointer hover:bg-coral/20 focus:bg-coral/20"
          style={{ borderRadius: "0" }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
