export interface User {
  _id?: string
  email: string
  passwordHash: string
  createdAt: Date
}

export interface Profile {
  _id?: string
  userId: string
  goals?: string[]
  preferences?: {
    communicationStyle?: string
    reduceOverwhelm?: boolean
  }
  workStudyContext?: string
  struggles?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface Assessment {
  _id?: string
  userId: string
  type: 'asrs6' | 'asrs18' | 'extended'
  answers: Record<string, number>
  scores: {
    total?: number
    inattention?: number
    hyperactivity?: number
  }
  interpretation?: string
  traits?: string[]
  recommendations?: string[]
  questionsForClinician?: string[]
  createdAt: Date
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface Chat {
  _id?: string
  userId: string
  threadId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface Memory {
  _id?: string
  userId: string
  text: string
  sourceType: 'assessment' | 'chat' | 'plan'
  sourceId: string
  embedding?: number[]
  createdAt: Date
}

export interface Counter {
  _id: string
  value: number
}

