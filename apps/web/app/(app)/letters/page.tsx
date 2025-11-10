import Link from "next/link"
import { getLetters } from "@/server/actions/letters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export default async function LettersPage() {
  const letters = await getLetters()

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal">
            My Letters
          </h1>
          <p className="font-mono text-base text-gray-secondary">
            All your letters to your future self
          </p>
        </div>
        <Link href="/letters/new">
          <Button size="lg" className="uppercase">
            Write New Letter
          </Button>
        </Link>
      </div>

      {letters.length === 0 ? (
        <Card className="border-charcoal shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <p className="mb-6 font-mono text-base text-gray-secondary">No letters yet</p>
            <Link href="/letters/new">
              <Button size="lg" className="uppercase">
                Create Your First Letter
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter) => (
            <Link key={letter.id} href={`/letters/${letter.id}`}>
              <Card className="h-full border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5">
                <CardHeader>
                  <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide line-clamp-1">
                    {letter.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-sm text-gray-secondary">
                    {formatDate(letter.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between font-mono text-sm text-gray-secondary">
                    <span>
                      {letter._count.deliveries}{" "}
                      {letter._count.deliveries === 1 ? "delivery" : "deliveries"}
                    </span>
                    {letter.tags.length > 0 && (
                      <div className="flex gap-1">
                        {letter.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
