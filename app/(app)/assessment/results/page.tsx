'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AssessmentResult {
  id: string
  type: string
  scores: {
    total: number
    inattention?: number
    hyperactivity?: number
  }
  interpretation: string
  traits: string[]
  recommendations: string[]
  questionsForClinician?: string[]
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (assessmentId) {
      fetch(`/api/assessment/${assessmentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.assessment) {
            setResult(data.assessment)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [assessmentId])

  if (loading) {
    return <div>Loading results...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            Your screening results and next steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Important Reminder:</p>
            <p className="text-sm">
              This is a <strong>screening tool for self-understanding</strong>, not a medical
              diagnosis. If your results suggest you might benefit from evaluation, please consult
              with a qualified healthcare professional.
            </p>
          </div>

          {result ? (
            <>
              <div>
                <h3 className="font-semibold mb-2">Your Score</h3>
                <p className="text-2xl font-bold">{result.scores.total}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.scores.total >= 4
                    ? 'This suggests you may want to discuss these patterns with a healthcare professional.'
                    : 'Your responses indicate fewer concerns, but this is not a diagnosis.'}
                </p>
              </div>

              {result.interpretation && (
                <div>
                  <h3 className="font-semibold mb-2">What This Means</h3>
                  <p className="text-sm">{result.interpretation}</p>
                </div>
              )}

              {result.traits && result.traits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Common Patterns</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.traits.map((trait, idx) => (
                      <li key={idx}>{trait}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">What to Try This Week</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.questionsForClinician && result.questionsForClinician.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Questions to Ask a Clinician</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.questionsForClinician.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                Results are being processed. Please check back in a moment.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Link href="/app/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href="/app/chat">
              <Button>Chat with Coach</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

