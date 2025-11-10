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
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal">
            Dashboard
          </h1>
          <p className="font-mono text-base text-gray-secondary">
            Welcome back! Here's an overview of your letters.
          </p>
        </div>
        <Link href="/letters/new">
          <Button size="lg" className="uppercase">
            Write New Letter
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-blue-light">
          <CardHeader>
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide">
              Total Letters
            </CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              All letters you've written
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-5xl font-normal text-charcoal">0</div>
          </CardContent>
        </Card>

        <Card className="border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-yellow-pale">
          <CardHeader>
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide">
              Scheduled
            </CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              Waiting to be delivered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-5xl font-normal text-charcoal">0</div>
          </CardContent>
        </Card>

        <Card className="border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-green-light">
          <CardHeader>
            <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide">
              Delivered
            </CardTitle>
            <CardDescription className="font-mono text-sm text-gray-secondary">
              Successfully sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-5xl font-normal text-charcoal">0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-charcoal shadow-md">
        <CardHeader>
          <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide">
            Recent Letters
          </CardTitle>
          <CardDescription className="font-mono text-sm text-gray-secondary">
            Your most recently created letters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-6 font-mono text-sm text-gray-secondary">
              No letters yet. Create your first letter to get started!
            </p>
            <Link href="/letters/new">
              <Button variant="outline" size="lg" className="uppercase">
                Create First Letter
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
