/**
 * Timezone Consolidation Migration Script
 *
 * Migrates timezone data from User.timezone to Profile.timezone
 * for users where profile has default "America/New_York" timezone.
 *
 * Run with:
 * pnpm dotenv -e apps/web/.env.local -- tsx scripts/migrate-timezones.ts
 *
 * Options:
 * --dry-run    Show what would be changed without making changes
 * --verbose    Show detailed output for each user
 *
 * Migration Strategy:
 * 1. For profiles with non-default timezone: skip (already correct)
 * 2. For profiles with default "America/New_York":
 *    - If user.timezone is not "UTC", copy it to profile
 *    - If user.timezone is "UTC", leave profile as-is (will use UTC fallback)
 *
 * This ensures:
 * - Users who set their timezone keep it
 * - Users with browser-detected timezone (in legacy field) get it migrated
 * - No data loss - only additive changes
 */

import { prisma } from "../apps/web/server/lib/db"

// Parse command line arguments
const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const VERBOSE = args.includes("--verbose")

// Default profile timezones to check for migration
// (Users with these defaults may need timezone from legacy User.timezone field)
const DEFAULT_PROFILE_TIMEZONES = ["America/New_York", "UTC"]

interface MigrationStats {
  total: number
  updated: number
  skipped: number
  errors: number
  noProfile: number
}

async function migrateTimezones() {
  console.log("🕒 Timezone Consolidation Migration")
  console.log("===================================")
  console.log("")

  if (DRY_RUN) {
    console.log("🔍 DRY RUN MODE - No changes will be made")
    console.log("")
  }

  const stats: MigrationStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    noProfile: 0,
  }

  try {
    // Fetch all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    stats.total = users.length
    console.log(`📊 Found ${users.length} users to process`)
    console.log("")

    for (const user of users) {
      try {
        // Skip users without profile
        if (!user.profile) {
          stats.noProfile++
          if (VERBOSE) {
            console.log(`⚠️  User ${user.email} has no profile, skipping`)
          }
          continue
        }

        const currentProfileTz = user.profile.timezone
        const legacyUserTz = user.timezone

        // Case 1: Profile has non-default timezone - already correct
        if (!DEFAULT_PROFILE_TIMEZONES.includes(currentProfileTz)) {
          stats.skipped++
          if (VERBOSE) {
            console.log(
              `✓ User ${user.email} already has custom timezone: ${currentProfileTz}`
            )
          }
          continue
        }

        // Case 2: Profile has default, check if legacy field has useful data
        if (!legacyUserTz || legacyUserTz === "UTC") {
          // Legacy field also has default/fallback - nothing useful to migrate
          stats.skipped++
          if (VERBOSE) {
            console.log(
              `⏭️  User ${user.email} has no custom timezone to migrate (both default)`
            )
          }
          continue
        }

        // Case 3: Legacy field has the same value as profile - skip
        if (legacyUserTz === currentProfileTz) {
          stats.skipped++
          if (VERBOSE) {
            console.log(
              `⏭️  User ${user.email} already synced: ${legacyUserTz}`
            )
          }
          continue
        }

        // Case 4: Legacy field has useful timezone - migrate it
        console.log(
          `📝 ${DRY_RUN ? "[DRY RUN] Would update" : "Updating"} ${user.email}: ` +
            `profile.timezone "${currentProfileTz}" → "${legacyUserTz}"`
        )

        if (!DRY_RUN) {
          await prisma.profile.update({
            where: { userId: user.id },
            data: {
              timezone: legacyUserTz,
            },
          })
        }

        stats.updated++
      } catch (error) {
        stats.errors++
        console.error(`❌ Error processing user ${user.email}:`, error)
      }
    }

    // Print summary
    console.log("")
    console.log("📊 Migration Summary")
    console.log("====================")
    console.log(`   📦 Total users:     ${stats.total}`)
    console.log(`   ✅ Updated:         ${stats.updated}`)
    console.log(`   ⏭️  Skipped:         ${stats.skipped}`)
    console.log(`   ⚠️  No profile:      ${stats.noProfile}`)
    console.log(`   ❌ Errors:          ${stats.errors}`)
    console.log("")

    if (DRY_RUN) {
      console.log("🔍 This was a dry run. Run without --dry-run to apply changes.")
    } else if (stats.errors === 0) {
      console.log("✨ Migration completed successfully!")
    } else {
      console.log("⚠️  Migration completed with errors. Review logs above.")
    }

    // Verification query
    console.log("")
    console.log("📋 Verification: Run this SQL to check timezone distribution:")
    console.log(`
SELECT
  p.timezone AS profile_timezone,
  COUNT(*) as count
FROM profiles p
GROUP BY p.timezone
ORDER BY count DESC;
`)

    return stats.errors === 0 ? 0 : 1
  } catch (error) {
    console.error("❌ Fatal migration error:", error)
    return 1
  }
}

// Run migration
migrateTimezones()
  .then((exitCode) => {
    prisma.$disconnect()
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error("Unexpected error:", error)
    prisma.$disconnect()
    process.exit(1)
  })
