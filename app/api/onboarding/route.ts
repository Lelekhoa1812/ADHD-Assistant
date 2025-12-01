import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'
import { getDb } from '@/server/db'
import type { Profile } from '@/types/db'

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
    const { goals, struggles, communicationStyle, reduceOverwhelm } = body

    const db = await getDb()
    const profiles = db.collection<Profile>('profiles')

    await profiles.updateOne(
      { userId: payload.userId },
      {
        $set: {
          goals: goals || [],
          struggles: struggles ? [struggles] : [],
          preferences: {
            communicationStyle: communicationStyle || 'standard',
            reduceOverwhelm: reduceOverwhelm || false,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: payload.userId,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

