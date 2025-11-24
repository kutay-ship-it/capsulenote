import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { routing } from "@/i18n/routing"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { locale } = (await request.json().catch(() => ({}))) as { locale?: string }
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return NextResponse.json({ ok: false, error: "invalid_locale" }, { status: 400 })
  }

  // Clerk v6: clerkClient() is async
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { preferredLocale: locale },
  })

  return NextResponse.json({ ok: true })
}
