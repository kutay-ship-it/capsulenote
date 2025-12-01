import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { routing } from "@/i18n/routing"
import { prisma } from "@/server/lib/db"

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { locale } = (await request.json().catch(() => ({}))) as { locale?: string }
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 })
  }

  // Update Clerk metadata for cross-device sync
  const client = await clerkClient()
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { preferredLocale: locale },
  })

  // Also persist to database Profile for server-side access (emails, etc.)
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    })

    if (user) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { locale },
        create: {
          userId: user.id,
          locale,
        },
      })
    }
  } catch (error) {
    // Log but don't fail the request - Clerk metadata is the fallback
    console.error("[API/locale] Failed to update Profile locale:", error)
  }

  return NextResponse.json({ ok: true })
}
