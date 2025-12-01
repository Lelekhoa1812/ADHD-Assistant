'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

// ASRS v1.1 6Q questions
const ASRS_6Q = [
  {
    id: 'q1',
    text: 'How often do you have trouble wrapping up the final details of a project once the challenging parts have been done?',
  },
  {
    id: 'q2',
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
  },
  {
    id: 'q3',
    text: 'How often do you have problems remembering appointments or obligations?',
  },
  {
    id: 'q4',
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
  },
  {
    id: 'q5',
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
  },
  {
    id: 'q6',
    text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
  },
]

const OPTIONS = [
  { value: '0', label: 'Never' },
  { value: '1', label: 'Rarely' },
  { value: '2', label: 'Sometimes' },
  { value: '3', label: 'Often' },
  { value: '4', label: 'Very Often' },
]

export default function AssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [showConsent, setShowConsent] = useState(true)

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: parseInt(value) })
  }

  const handleNext = () => {
    if (currentStep < ASRS_6Q.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'asrs6',
          answers,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to submit assessment')
        return
      }

      router.push(`/app/assessment/results?id=${data.assessment.id}`)
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showConsent) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Important: Screening Tool Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              This is the <strong>ASRS v1.1 (Adult ADHD Self-Report Scale)</strong>, a screening
              tool designed to help with self-understanding. It is <strong>not a medical
              diagnosis</strong>.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Please understand:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>This tool helps identify patterns that might be worth discussing with a healthcare professional</li>
                <li>It does not diagnose ADHD or any other condition</li>
                <li>Only a qualified healthcare provider can provide a diagnosis</li>
                <li>Results are for informational purposes only</li>
              </ul>
            </div>
            <Button onClick={() => setShowConsent(false)} className="w-full">
              I Understand - Continue to Screening
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = ASRS_6Q[currentStep]
  const currentAnswer = answers[currentQuestion.id]?.toString()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ASRS v1.1 Screening</CardTitle>
          <CardDescription>
            Question {currentStep + 1} of {ASRS_6Q.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!currentAnswer || loading}
            >
              {currentStep === ASRS_6Q.length - 1
                ? loading
                  ? 'Submitting...'
                  : 'Submit'
                : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

