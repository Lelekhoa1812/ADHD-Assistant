import { geminiProvider } from '../providers/gemini'
import { retrieveMemories } from './memory'
import type { Memory } from '@/types/db'

export async function generateCoachResponse(
  userId: string,
  userMessage: string,
  userProfile?: { goals?: string[]; struggles?: string[]; preferences?: any }
): Promise<string> {
  // Retrieve relevant memories
  const memories = await retrieveMemories(userId, userMessage, 5)

  // Build context from memories
  const memoryContext = memories.length > 0
    ? `\n\nRelevant past context:\n${memories.map(m => `- ${m.text}`).join('\n')}`
    : ''

  const systemPrompt = `You are a supportive ADHD coach. Provide helpful, personalized guidance.

Guidelines:
- Be empathetic and non-judgmental
- Use short, clear blocks of text
- Offer practical, actionable advice
- Reference past conversations when relevant
- Encourage self-compassion
- Never provide medical diagnosis or treatment advice
- If user expresses crisis/self-harm, switch to crisis resources

User Profile:
Goals: ${userProfile?.goals?.join(', ') || 'Not specified'}
Struggles: ${userProfile?.struggles?.join(', ') || 'Not specified'}
Communication Style: ${userProfile?.preferences?.communicationStyle || 'Standard'}`

  const userPrompt = `${userMessage}${memoryContext}`

  const result = await geminiProvider.chat({
    model: 'gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
  })

  return result.text
}

