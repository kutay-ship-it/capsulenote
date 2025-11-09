import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your letters.</p>
        </div>
        <Link href="/letters/new">
          <Button>Write New Letter</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Letters</CardTitle>
            <CardDescription>All letters you've written</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled</CardTitle>
            <CardDescription>Waiting to be delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivered</CardTitle>
            <CardDescription>Successfully sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Letters</CardTitle>
          <CardDescription>Your most recently created letters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            No letters yet. Create your first letter to get started!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
