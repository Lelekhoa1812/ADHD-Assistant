export const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end it all',
  'want to die',
  'hopeless',
  'no point',
  'self harm',
  'hurt myself',
]

export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

export const CRISIS_RESPONSE = `I'm concerned about what you're sharing. Your safety is important.

**Crisis Resources:**
- **988 Suicide & Crisis Lifeline**: Call or text 988 (available 24/7)
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 1-800-273-8255

**Please reach out to:**
- A mental health professional
- Your primary care doctor
- A trusted friend or family member
- Emergency services (911) if you're in immediate danger

This tool is for screening and self-understanding, not crisis support. Please connect with a qualified professional who can provide the support you need right now.

You're not alone, and there are people who want to help.`

