import { nextKey, retryWithNextKey } from './round-robin'
import type { LlmMessage, LlmProvider } from './gemini'

export class NvidiaProvider implements LlmProvider {
  private chatBaseUrl = 'https://integrate.api.nvidia.com/v1'
  private embedBaseUrl = 'https://integrate.api.nvidia.com/v1'
  private rerankBaseUrl = 'https://ai.api.nvidia.com/v1'

  async chat(opts: {
    model: string
    messages: LlmMessage[]
    json?: boolean
    temperature?: number
  }): Promise<{ text: string; json?: any }> {
    const { model, messages, json = false, temperature = 0.7 } = opts

    return retryWithNextKey('nvidia', async (apiKey) => {
      const url = `${this.chatBaseUrl}/chat/completions`

      // Convert to OpenAI format
      const openaiMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const body = {
        model,
        messages: openaiMessages,
        temperature,
        ...(json && { response_format: { type: 'json_object' } }),
      }

      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        console.error(`NVIDIA API error (${response.status}):`, {
          provider: 'nvidia',
          model,
          status: response.status,
          latency,
        })
        throw new Error(`NVIDIA API error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      console.log('NVIDIA API success:', {
        provider: 'nvidia',
        model,
        status: response.status,
        latency,
      })

      const text = data.choices?.[0]?.message?.content || ''

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

  async embed(opts: {
    model: string
    input: string[]
  }): Promise<number[][]> {
    const { model, input } = opts

    return retryWithNextKey('nvidia', async (apiKey) => {
      const url = `${this.embedBaseUrl}/embeddings`

      const body = {
        model,
        input,
      }

      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        console.error(`NVIDIA Embeddings API error (${response.status}):`, {
          provider: 'nvidia',
          model,
          status: response.status,
          latency,
        })
        throw new Error(`NVIDIA Embeddings API error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      console.log('NVIDIA Embeddings API success:', {
        provider: 'nvidia',
        model,
        status: response.status,
        latency,
      })

      return data.data.map((item: any) => item.embedding)
    })
  }

  async rerank(opts: {
    model: string
    query: string
    passages: string[]
  }): Promise<number[]> {
    const { model, query, passages } = opts

    return retryWithNextKey('nvidia', async (apiKey) => {
      const url = `${this.rerankBaseUrl}/retrieval/nvidia/reranking`

      const body = {
        model,
        query,
        passages,
      }

      const startTime = Date.now()
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.text()
        console.error(`NVIDIA Rerank API error (${response.status}):`, {
          provider: 'nvidia',
          model,
          status: response.status,
          latency,
        })
        throw new Error(`NVIDIA Rerank API error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      console.log('NVIDIA Rerank API success:', {
        provider: 'nvidia',
        model,
        status: response.status,
        latency,
      })

      // Return ranked indices (assuming API returns scores, we'll sort by score)
      const results = data.results || []
      return results
        .map((r: any, idx: number) => ({ idx, score: r.score || 0 }))
        .sort((a: any, b: any) => b.score - a.score)
        .map((r: any) => r.idx)
    })
  }
}

export const nvidiaProvider = new NvidiaProvider()

