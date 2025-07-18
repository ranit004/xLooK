"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Result {
  id: string
  title: string
  description: string
}

interface ResultSectionProps {
  results: Result[]
}

export function ResultSection({ results }: ResultSectionProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold mb-10">Results</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <CardTitle>{result.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{result.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
