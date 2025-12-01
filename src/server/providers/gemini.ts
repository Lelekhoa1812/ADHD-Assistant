import { nextKey, retryWithNextKey } from './round-robin'

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmProvider {
  chat(opts: {
    model: string
    messages: LlmMessage[]
    json?: boolean
    temperature?: number
  }): Promise<{ text: string; json?: any }>
}

export class GeminiProvider implements LlmProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  async chat(opts: {
    model: string
    messages: LlmMessage[]
    json?: boolean
    temperature?: number
  }): Promise<{ text: string; json?: any }> {
    const { model, messages, json = false, temperature = 0.7 } = opts

    return retryWithNextKey('gemini', async (apiKey) => {
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`

      // Convert messages to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

      // Add system instruction if present
      const systemInstruction = messages.find(m => m.role === 'system')?.content

      const body: any = {
        contents,
        generationConfig: {
          temperature,
          ...(json && { responseMimeType: 'application/json' }),
        },
      }

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
        }
      }

      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        console.error(`Gemini API error (${response.status}):`, {
          provider: 'gemini',
          model,
          status: response.status,
          latency,
        })
        throw new Error(`Gemini API error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      // Log success (without user text)
      console.log('Gemini API success:', {
        provider: 'gemini',
        model,
        status: response.status,
        latency,
      })

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (json) {
        try {
          return { text, json: JSON.parse(text) }
        } catch {
          return { text, json: null }
        }
      }

      return { text }
    })
  }
}

export const geminiProvider = new GeminiProvider()

