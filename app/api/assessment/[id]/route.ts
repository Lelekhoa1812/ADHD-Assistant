import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'
import { getDb } from '@/server/db'
import type { Assessment } from '@/types/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const db = await getDb()
    const assessments = db.collection<Assessment>('assessments')
    const assessment = await assessments.findOne({
      _id: params.id as any,
      userId: payload.userId,
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      assessment: {
        id: assessment._id!.toString(),
        type: assessment.type,
        scores: assessment.scores,
        interpretation: assessment.interpretation,
        traits: assessment.traits,
        recommendations: assessment.recommendations,
        questionsForClinician: assessment.questionsForClinician,
        createdAt: assessment.createdAt,
      },
    })
  } catch (error) {
    console.error('Assessment fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

