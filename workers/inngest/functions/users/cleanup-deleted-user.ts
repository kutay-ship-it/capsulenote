import { inngest } from "../../client"
import { stripe } from "../../../../apps/web/server/providers/stripe/client"
import { prisma } from "../../../../apps/web/server/lib/db"

export const cleanupDeletedUser = inngest.createFunction(
    { id: "cleanup-deleted-user", name: "Cleanup Deleted User" },
    { event: "user/deleted" },
    async ({ event, step }) => {
        const { stripeCustomerId, userId } = event.data

        if (!stripeCustomerId) {
            return { message: "No Stripe customer ID provided, skipping Stripe cleanup" }
        }

        await step.run("cancel-subscriptions", async () => {
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
        })

        await step.run("delete-stripe-customer", async () => {
            await stripe.customers.del(stripeCustomerId)
        })

        return { message: "User cleanup completed" }
    }
)
