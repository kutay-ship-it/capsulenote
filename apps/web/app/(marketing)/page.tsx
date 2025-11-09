import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-4 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl">
              Write Letters to Your Future Self
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              A privacy-first platform to schedule heartfelt messages to your future self. Delivered
              via email or physical mail, exactly when you need them.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-8 md:py-12">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Thoughtful Writing</CardTitle>
                <CardDescription>
                  Distraction-free editor with prompts and templates to inspire reflection.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Flexible Delivery</CardTitle>
                <CardDescription>
                  Choose email for convenience or physical mail for that extra special touch.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your letters are encrypted at rest. We take your privacy seriously.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reliable Delivery</CardTitle>
                <CardDescription>
                  Rock-solid scheduling ensures your letters arrive exactly on time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Time Zone Aware</CardTitle>
                <CardDescription>
                  Letters arrive at the right time in your local timezone, wherever you are.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Full Control</CardTitle>
                <CardDescription>
                  Edit, reschedule, or cancel any letter before it's sent.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-8 md:py-12">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Start Your Journey</CardTitle>
              <CardDescription className="text-base">
                Join thousands of people writing to their future selves.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/sign-up">
                <Button size="lg">Create Your First Letter</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DearMe. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
