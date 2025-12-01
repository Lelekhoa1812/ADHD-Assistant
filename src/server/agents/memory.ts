import { getDb } from '../db'
import { nvidiaProvider } from '../providers/nvidia'
import type { Memory } from '@/types/db'

const EMBEDDING_MODEL = 'nvidia/nv-embedqa-e5-v5'
const RERANK_MODEL = 'nvidia/reranking-4b'

export async function storeMemory(
  userId: string,
  text: string,
  sourceType: Memory['sourceType'],
  sourceId: string
): Promise<void> {
  const db = await getDb()
  const memories = db.collection<Memory>('memories')

  // Generate embedding
  const embeddings = await nvidiaProvider.embed({
    model: EMBEDDING_MODEL,
    input: [text],
  })

  const embedding = embeddings[0]

  await memories.insertOne({
    userId,
    text,
    sourceType,
    sourceId,
    embedding,
    createdAt: new Date(),
  })
}

export async function retrieveMemories(
  userId: string,
  query: string,
  limit = 5
): Promise<Memory[]> {
  const db = await getDb()
  const memories = db.collection<Memory>('memories')

  // Embed the query
  const queryEmbeddings = await nvidiaProvider.embed({
    model: EMBEDDING_MODEL,
    input: [query],
  })

  const queryEmbedding = queryEmbeddings[0]

  // Get all memories for user (in production, use vector search)
  const allMemories = await memories
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20) // Limit for reranking
    .toArray()

  if (allMemories.length === 0) {
    return []
  }

  // Calculate cosine similarity (simple implementation)
  const scored = allMemories
    .filter(m => m.embedding)
    .map(memory => {
      const similarity = cosineSimilarity(queryEmbedding, memory.embedding!)
      return { memory, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit * 2) // Get more for reranking

  // Rerank with NVIDIA reranker
  if (scored.length > 0) {
    const passages = scored.map(s => s.memory.text)
    const rerankedIndices = await nvidiaProvider.rerank({
      model: RERANK_MODEL,
      query,
      passages,
    })

    return rerankedIndices.slice(0, limit).map(idx => scored[idx].memory)
  }

  return scored.slice(0, limit).map(s => s.memory)
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

