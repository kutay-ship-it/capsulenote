import Link from "next/link"
import { getLetters } from "@/server/actions/letters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function LettersPage() {
  const letters = await getLetters()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Letters</h1>
          <p className="text-muted-foreground">All your letters to your future self</p>
        </div>
        <Link href="/letters/new">
          <Button>Write New Letter</Button>
        </Link>
      </div>

      {letters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No letters yet</p>
            <Link href="/letters/new">
              <Button>Create Your First Letter</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter) => (
            <Link key={letter.id} href={`/letters/${letter.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{letter.title}</CardTitle>
                  <CardDescription>{formatDate(letter.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {letter._count.deliveries}{" "}
                      {letter._count.deliveries === 1 ? "delivery" : "deliveries"}
                    </span>
                    {letter.tags.length > 0 && (
                      <span className="text-xs">{letter.tags.join(", ")}</span>
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
