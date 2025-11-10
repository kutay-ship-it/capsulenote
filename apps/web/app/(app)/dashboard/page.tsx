import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLetterEditor } from "@/components/dashboard-letter-editor"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
            Dashboard
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            Welcome back! Here's an overview of your letters.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card
          className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-blue-light"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
              Total Letters
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              All letters you've written
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">0</div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-yellow-pale"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
              Scheduled
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              Waiting to be delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">0</div>
          </CardContent>
        </Card>

        <Card
          className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-green-light"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
              Delivered
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              Successfully sent
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Write New Letter Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Quick write
          </Badge>
          <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
            Write a New Letter
          </h2>
          <p className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm md:text-base">
            Create and schedule a letter to your future self from your dashboard.
          </p>
        </div>

        {/* Letter Editor */}
        <DashboardLetterEditor />
      </div>

      {/* Recent Letters Section */}
      <Card
        className="border-2 border-charcoal shadow-md"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
            Recent Letters
          </CardTitle>
          <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
            Your most recently created letters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
            <p className="mb-4 font-mono text-xs text-gray-secondary sm:mb-6 sm:text-sm">
              No letters yet. Use the editor above to create your first letter!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
