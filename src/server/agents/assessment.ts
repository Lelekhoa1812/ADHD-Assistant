import { geminiProvider } from '../providers/gemini'
import type { Assessment } from '@/types/db'

export interface AssessmentExplanation {
  interpretation: string
  traits: string[]
  questionsForClinician: string[]
  strategies: string[]
  disclaimer: string
}

export async function generateAssessmentExplanation(
  assessment: Assessment,
  userProfile?: { goals?: string[]; struggles?: string[] }
): Promise<AssessmentExplanation> {
  const systemPrompt = `You are a supportive ADHD assessment interpreter. Generate helpful, non-diagnostic explanations.

IMPORTANT:
- This is a SCREENING tool, NOT a medical diagnosis
- Use supportive, non-judgmental language
- Focus on self-understanding and next steps
- Never claim to diagnose ADHD
- Always encourage professional evaluation if indicated

Generate:
1. A friendly interpretation of the scores
2. Common traits/patterns that might align (not diagnoses)
3. Questions the user might want to ask a clinician
4. Personalized strategies based on their profile
5. A clear disclaimer about screening vs diagnosis`

  const userPrompt = `Assessment Results:
Type: ${assessment.type}
Scores: ${JSON.stringify(assessment.scores)}
Answers: ${JSON.stringify(assessment.answers)}

User Profile:
Goals: ${userProfile?.goals?.join(', ') || 'Not specified'}
Struggles: ${userProfile?.struggles?.join(', ') || 'Not specified'}

Generate a supportive explanation with the requested format.`

  const result = await geminiProvider.chat({
    model: assessment.scores.total && assessment.scores.total > 12 ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    json: true,
    temperature: 0.7,
  })

  if (result.json) {
    return result.json as AssessmentExplanation
  }

  // Fallback: parse from text
  try {
    const parsed = JSON.parse(result.text)
    return parsed as AssessmentExplanation
  } catch {
    // Return safe defaults
    return {
      interpretation: 'Thank you for completing the screening. This tool helps with self-understanding and is not a medical diagnosis.',
      traits: [],
      questionsForClinician: [
        'What are the next steps for a formal evaluation?',
        'What resources are available in my area?',
      ],
      strategies: [
        'Consider keeping a journal of patterns you notice',
        'Explore accommodations that might help',
        'Connect with support communities',
      ],
      disclaimer: 'This screening tool is for self-understanding only and does not constitute a medical diagnosis. Please consult with a qualified healthcare professional for evaluation and treatment.',
    }
  }
}

