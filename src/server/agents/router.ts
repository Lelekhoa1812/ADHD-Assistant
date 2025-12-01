import { geminiProvider } from '../providers/gemini'

export interface RouterResult {
  route: 'assessment' | 'planning' | 'career' | 'study' | 'history_lookup' | 'chat' | 'crisis'
  confidence: number
  needed_context: string[]
}

export async function routeIntent(userMessage: string): Promise<RouterResult> {
  const systemPrompt = `You are a routing agent for an ADHD assistant app. Analyze user messages and determine the intent.

Routes:
- "assessment": User wants to take or retake ADHD screening
- "planning": User wants help with planning, tasks, or strategies
- "career": User wants career-related ADHD support
- "study": User wants study/academic support
- "history_lookup": User wants to see past assessments, plans, or chat history
- "chat": General coaching or Q&A
- "crisis": User expresses self-harm, hopelessness, or crisis - prioritize this

Return JSON with: { route, confidence (0-1), needed_context: [] }`

  const result = await geminiProvider.chat({
    model: 'gemini-2.5-flash-lite',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    json: true,
    temperature: 0.3,
  })

  if (result.json) {
    return result.json as RouterResult
  }

  // Fallback parsing
  try {
    const parsed = JSON.parse(result.text)
    return parsed as RouterResult
  } catch {
    // Default to chat if parsing fails
    return {
      route: 'chat',
      confidence: 0.5,
      needed_context: [],
    }
  }
}

