import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'
import { getDb } from '@/server/db'
import type { User } from '@/types/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const db = await getDb()
    const users = db.collection<User>('users')
    const user = await users.findOne({ _id: payload.userId as any })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

