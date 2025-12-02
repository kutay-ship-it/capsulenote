import { inngest } from "../../client"
import { stripe } from "../../../../apps/web/server/providers/stripe/client"
import { prisma } from "../../../../apps/web/server/lib/db"

export const cleanupDeletedUser = inngest.createFunction(
    { id: "cleanup-deleted-user", name: "Cleanup Deleted User" },
    { event: "user/deleted" },
    async ({ event, step }) => {
        const { stripeCustomerId, userId } = event.data

        // Step 1: Cancel Stripe subscriptions (if customer exists)
        if (stripeCustomerId) {
            await step.run("cancel-subscriptions", async () => {
                try {
                    const subscriptions = await stripe.subscriptions.list({
                        customer: stripeCustomerId,
                        status: "all",
                    })

                    for (const sub of subscriptions.data) {
                        if (sub.status === "active" || sub.status === "trialing") {
                            await stripe.subscriptions.cancel(sub.id, {
                                prorate: true,
                            })
                        }
                    }
                } catch (error) {
                    // Log but don't fail - customer may already be deleted
                    console.warn("[User Cleanup] Failed to cancel subscriptions", {
                        userId,
                        stripeCustomerId,
                        error,
                    })
                }
            })

            await step.run("delete-stripe-customer", async () => {
                try {
                    await stripe.customers.del(stripeCustomerId)
                } catch (error) {
                    // Log but don't fail - customer may already be deleted
                    console.warn("[User Cleanup] Failed to delete Stripe customer", {
                        userId,
                        stripeCustomerId,
                        error,
                    })
                }
            })
        }

        // Step 2: Delete all user data from database
        await step.run("delete-user-data", async () => {
            await prisma.$transaction(async (tx) => {
                // Get all letter IDs for cascading deletes
                const letterIds = await tx.letter
                    .findMany({
                        where: { userId },
                        select: { id: true },
                    })
                    .then((letters) => letters.map((l) => l.id))

                // Delete in dependency order to respect foreign keys

                // Delete delivery attempts first (references letters directly)
                if (letterIds.length > 0) {
                    await tx.deliveryAttempt.deleteMany({
                        where: { letterId: { in: letterIds } },
                    })
                }

                // Delete email/mail delivery details (references deliveries)
                await tx.emailDelivery.deleteMany({
                    where: { delivery: { userId } },
                })
                await tx.mailDelivery.deleteMany({
                    where: { delivery: { userId } },
                })

                // Delete deliveries (references letters and users)
                await tx.delivery.deleteMany({ where: { userId } })

                // Delete letters
                await tx.letter.deleteMany({ where: { userId } })

                // Delete credit transactions
                await tx.creditTransaction.deleteMany({ where: { userId } })

                // Anonymize payments (keep for accounting/tax compliance)
                await tx.payment.updateMany({
                    where: { userId },
                    data: {
                        metadata: {
                            anonymized: true,
                            originalUserId: userId,
                            anonymizedAt: new Date().toISOString(),
                        },
                    },
                })

                // Delete subscriptions
                await tx.subscription.deleteMany({ where: { userId } })

                // Delete audit events
                await tx.auditEvent.deleteMany({ where: { userId } })

                // Delete shipping addresses
                await tx.shippingAddress.deleteMany({ where: { userId } })

                // Delete profile
                await tx.profile.deleteMany({ where: { userId } })

                // Finally, delete the user record
                await tx.user.delete({ where: { id: userId } })
            })

            console.log("[User Cleanup] All user data deleted from database", {
                userId,
            })
        })

        return {
            message: "User cleanup completed",
            userId,
            stripeCustomerDeleted: !!stripeCustomerId,
        }
    }
)
