'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<string[]>([])
  const [struggles, setStruggles] = useState('')
  const [communicationStyle, setCommunicationStyle] = useState('')
  const [loading, setLoading] = useState(false)

  const goalOptions = ['Study/Academics', 'Career/Work', 'Daily Life', 'Relationships', 'Health & Wellness']

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          struggles,
          communicationStyle,
          reduceOverwhelm: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save onboarding')
      }

      router.push('/app/dashboard')
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Welcome! Let&apos;s Get Started</CardTitle>
          <CardDescription>
            Step {step} of 3 - Help us personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>What are your main goals? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {goalOptions.map((goal) => (
                    <Button
                      key={goal}
                      type="button"
                      variant={goals.includes(goal) ? 'default' : 'outline'}
                      onClick={() => toggleGoal(goal)}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setStep(2)} disabled={goals.length === 0}>
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="struggles">What challenges are you facing?</Label>
                <Textarea
                  id="struggles"
                  value={struggles}
                  onChange={(e) => setStruggles(e.target.value)}
                  placeholder="E.g., difficulty focusing, time management, organization..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="communication">Preferred Communication Style</Label>
                <Input
                  id="communication"
                  value={communicationStyle}
                  onChange={(e) => setCommunicationStyle(e.target.value)}
                  placeholder="E.g., Direct and concise, Detailed explanations..."
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

