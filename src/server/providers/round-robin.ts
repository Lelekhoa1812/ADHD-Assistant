import { getDb } from '../db'
import type { Counter } from '@/types/db'

type Provider = 'gemini' | 'nvidia'

const API_KEY_COUNT = 5

export async function nextKey(provider: Provider): Promise<string> {
  const db = await getDb()
  const counters = db.collection<Counter>('counters')

  // Atomic increment
  const result = await counters.findOneAndUpdate(
    { _id: provider as any },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: 'after' }
  )

  const value = result?.value || 0
  const idx = value % API_KEY_COUNT
  const envKey = `${provider.toUpperCase()}_API_${idx + 1}` as keyof NodeJS.ProcessEnv

  const apiKey = process.env[envKey]

  if (!apiKey) {
    throw new Error(`Missing ${envKey} in environment variables`)
  }

  return apiKey
}

export async function retryWithNextKey<T>(
  provider: Provider,
  fn: (apiKey: string) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = await nextKey(provider)
      return await fn(apiKey)
    } catch (error: any) {
      lastError = error

      // If it's a rate limit error (429), try next key
      if (error?.status === 429 || error?.response?.status === 429) {
        if (attempt < maxRetries - 1) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
      }

      // For other errors or max retries reached, throw
      throw error
    }
  }

  throw lastError || new Error('Failed after retries')
}

