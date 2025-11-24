import type { Metadata } from "next"
import { Link } from "@/i18n/routing"
import { notFound } from "next/navigation"
import { prisma } from "@/server/lib/db"
import { decryptLetter } from "@/server/lib/encryption"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedEnvelope } from "@/components/animated-envelope"

export const metadata: Metadata = {
  title: "View Letter | Capsule Note",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/view",
  },
}

interface ViewLetterPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ViewLetterPage({ params }: ViewLetterPageProps) {
  const { token } = await params

  const letter = await prisma.letter.findFirst({
    where: {
      shareLinkToken: token,
      deletedAt: null,
    },
    include: {
      deliveries: true,
    },
  })

  if (!letter) {
    notFound()
  }

  const decrypted = await decryptLetter(letter.bodyCiphertext, letter.bodyNonce, letter.keyVersion)

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Capsule Note
          </Badge>
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
            Your Letter Has Arrived
          </h1>
          <p className="font-mono text-sm text-gray-secondary">
            This capsule was written in the past and scheduled for you today.
          </p>
        </div>

        <AnimatedEnvelope />

        <Card className="border-2 border-charcoal shadow-md bg-white">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
              {letter.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none font-sans text-charcoal" dangerouslySetInnerHTML={{ __html: decrypted.bodyHtml }} />
        </Card>

        <div className="text-center space-y-3">
          <p className="font-mono text-sm text-gray-secondary">
            Want to send your own letter to the future?
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Write a Letter
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
