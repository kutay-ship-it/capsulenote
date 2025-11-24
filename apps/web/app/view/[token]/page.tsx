import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/server/lib/db"
import { decryptLetter } from "@/server/lib/encryption"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

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

        <div className="flex justify-center">
          <motion.div
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-32 w-48 bg-off-white border-2 border-charcoal shadow-md"
            style={{ borderRadius: "4px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-bg-yellow-pale to-bg-blue-light opacity-80" />
            <div className="absolute inset-2 border-2 border-charcoal/60" />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute left-1/2 top-1/2 w-8 -translate-x-1/2 -translate-y-1/2 border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            />
          </motion.div>
        </div>

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
