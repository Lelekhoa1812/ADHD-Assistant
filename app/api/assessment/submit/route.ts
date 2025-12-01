import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'
import { getDb } from '@/server/db'
import { generateAssessmentExplanation } from '@/server/agents/assessment'
import { storeMemory } from '@/server/agents/memory'
import type { Assessment, Profile } from '@/types/db'

// ASRS v1.1 scoring
function calculateASRSScore(answers: Record<string, number>, type: 'asrs6' | 'asrs18'): {
  total: number
  inattention?: number
  hyperactivity?: number
} {
  const values = Object.values(answers).map(v => (v >= 3 ? 1 : 0)) // 3 or 4 = positive
  const total = values.reduce((a: number, b: number) => a + b, 0)

  if (type === 'asrs6') {
    return { total }
  }

  // For ASRS 18, calculate subscales (first 9 = inattention, last 9 = hyperactivity)
  const inattentionItems = Object.values(answers).slice(0, 9).map(v => (v >= 3 ? 1 : 0))
  const hyperactivityItems = Object.values(answers).slice(9, 18).map(v => (v >= 3 ? 1 : 0))

  return {
    total,
    inattention: inattentionItems.reduce((a: number, b: number) => a + b, 0),
    hyperactivity: hyperactivityItems.reduce((a: number, b: number) => a + b, 0),
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { type, answers } = body

    if (!type || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid input: type and answers required' },
        { status: 400 }
      )
    }

    // Calculate scores
    const scores = calculateASRSScore(answers, type as 'asrs6' | 'asrs18')

    // Get user profile for personalization
    const db = await getDb()
    const profiles = db.collection<Profile>('profiles')
    const profile = await profiles.findOne({ userId: payload.userId })

    // Generate explanation
    const assessment: Assessment = {
      userId: payload.userId,
      type: type as 'asrs6' | 'asrs18' | 'extended',
      answers,
      scores,
      createdAt: new Date(),
    }

    const explanation = await generateAssessmentExplanation(assessment, {
      goals: profile?.goals,
      struggles: profile?.struggles,
    })

    assessment.interpretation = explanation.interpretation
    assessment.traits = explanation.traits
    assessment.recommendations = explanation.strategies
    assessment.questionsForClinician = explanation.questionsForClinician

    // Save assessment
    const assessments = db.collection<Assessment>('assessments')
    const result = await assessments.insertOne(assessment)

    // Store memory
    const memoryText = `Assessment (${type}): Score ${scores.total}. ${explanation.interpretation.substring(0, 200)}`
    await storeMemory(
      payload.userId,
      memoryText,
      'assessment',
      result.insertedId.toString()
    )

    return NextResponse.json({
      success: true,
      assessment: {
        id: result.insertedId.toString(),
        ...assessment,
        explanation,
      },
    })
  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

