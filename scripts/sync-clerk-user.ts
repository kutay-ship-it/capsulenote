import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "../apps/web/server/lib/db"

/**
 * One-time script to sync existing Clerk users to database
 *
 * Run with:
 * pnpm dotenv -e apps/web/.env.local -- tsx scripts/sync-clerk-user.ts
 *
 * This script will:
 * 1. Fetch all users from Clerk
 * 2. Check if each user exists in the database
 * 3. Create missing user records with default profile (timezone: UTC)
 */
async function syncClerkUsers() {
  try {
    console.log("🔄 Fetching Clerk users...")

    const users = await clerkClient.users.getUserList()

    console.log(`📋 Found ${users.data.length} Clerk users`)

    for (const clerkUser of users.data) {
      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress

      if (!email) {
        console.log(`⚠️  Skipping user ${clerkUser.id} - no email`)
        continue
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id }
      })

      if (existingUser) {
        console.log(`✅ User already synced: ${email}`)
        continue
      }

      // Create user with profile
      await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: email,
          profile: {
            create: {
              timezone: "UTC", // User can update in settings
            }
          }
        }
      })

      console.log(`✅ Synced user: ${email}`)
    }

    console.log("🎉 Sync complete!")
  } catch (error) {
    console.error("❌ Sync failed:", error)
    process.exit(1)
  }
}

syncClerkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
