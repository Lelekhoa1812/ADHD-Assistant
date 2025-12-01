import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'
import { getDb } from '@/server/db'
import { routeIntent } from '@/server/agents/router'
import { generateCoachResponse } from '@/server/agents/coach'
import { detectCrisis, CRISIS_RESPONSE } from '@/server/agents/crisis'
import { storeMemory } from '@/server/agents/memory'
import type { Chat, Profile } from '@/types/db'

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
    const { message, threadId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check for crisis
    if (detectCrisis(message)) {
      return NextResponse.json({
        response: CRISIS_RESPONSE,
        isCrisis: true,
      })
    }

    // Route intent
    const routing = await routeIntent(message)

    // Get user profile
    const db = await getDb()
    const profiles = db.collection<Profile>('profiles')
    const profile = await profiles.findOne({ userId: payload.userId })

    // Generate response based on route
    let response: string

    if (routing.route === 'crisis') {
      response = CRISIS_RESPONSE
    } else {
      response = await generateCoachResponse(
        payload.userId,
        message,
        {
          goals: profile?.goals,
          struggles: profile?.struggles,
          preferences: profile?.preferences,
        }
      )
    }

    // Save chat
    const chats = db.collection<Chat>('chats')
    const finalThreadId = threadId || `thread-${Date.now()}`

    await chats.updateOne(
      { userId: payload.userId, threadId: finalThreadId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message, createdAt: new Date() },
              { role: 'assistant', content: response, createdAt: new Date() },
            ],
          },
        },
        $setOnInsert: {
          userId: payload.userId,
          threadId: finalThreadId,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Store memory
    const memoryText = `Chat: ${message.substring(0, 100)}... Response: ${response.substring(0, 100)}...`
    await storeMemory(
      payload.userId,
      memoryText,
      'chat',
      finalThreadId
    )

    return NextResponse.json({
      response,
      threadId: finalThreadId,
      route: routing.route,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

