import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/server/db'
import { verifyPassword } from '@/server/auth/password'
import { signToken } from '@/server/auth/jwt'
import type { User } from '@/types/db'
import type { Db } from 'mongodb'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    let db: Db
    try {
      db = await getDb()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB configuration.' },
        { status: 500 }
      )
    }

    const users = db.collection<User>('users')

    // Find user
    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = await signToken(user._id!.toString())

    // Set httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id!.toString(),
          email: user.email,
        },
      },
      { status: 200 }
    )

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    // Log the full error for debugging
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Return a more helpful error message in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(isDevelopment && { details: errorMessage }),
      },
      { status: 500 }
    )
  }
}

