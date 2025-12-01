# ADHD Assistant

A serverless Next.js application for ADHD screening and personalized coaching, built with Gemini 2.5 and NVIDIA NIM.

## Features

- **ADHD Screening**: ASRS v1.1 (6Q) screening tool for self-understanding
- **Personalized Coaching**: AI-powered chat with memory retrieval
- **Assessment Results**: Detailed explanations and personalized strategies
- **User History**: Track assessments and conversations
- **Privacy First**: Secure data storage with export/delete options

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: MongoDB
- **AI**: Gemini 2.5 (Flash, Flash-Lite, Pro) + NVIDIA NIM
- **Auth**: JWT with httpOnly cookies
- **Deployment**: Vercel (serverless)

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gemini API keys (5 keys recommended for round-robin)
- NVIDIA API keys (5 keys recommended for round-robin)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in all required variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A strong random string for JWT signing
     - `GEMINI_API_1` through `GEMINI_API_5`: Your Gemini API keys
     - `NVIDIA_API_1` through `NVIDIA_API_5`: Your NVIDIA API keys
     - `NEXT_PUBLIC_APP_URL`: Your app URL (http://localhost:3000 for dev)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── (app)/          # Protected app routes
│   │   ├── dashboard/
│   │   ├── assessment/
│   │   ├── chat/
│   │   ├── history/
│   │   └── onboarding/
│   ├── (marketing)/    # Public marketing pages
│   ├── api/            # API routes
│   └── auth/           # Auth pages
├── src/
│   ├── server/
│   │   ├── agents/     # AI agents (Router, Assessment, Coach, Memory)
│   │   ├── auth/       # Auth utilities (JWT, password)
│   │   ├── providers/  # AI providers (Gemini, NVIDIA)
│   │   └── db.ts       # MongoDB connection
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
└── components/
    └── ui/             # shadcn/ui components
```

## Key Features

### Round-Robin API Key Rotation

The app uses MongoDB atomic counters to implement round-robin rotation of API keys across serverless instances. This helps distribute load and handle rate limits.

### Multi-Agent System

- **RouterAgent**: Routes user intents to appropriate handlers
- **AssessmentAgent**: Generates personalized assessment explanations
- **CoachAgent**: Provides coaching with memory retrieval
- **MemoryAgent**: Handles embedding and retrieval of past conversations

### Safety Features

- Crisis detection in chat (detects self-harm keywords)
- Clear disclaimers about screening vs. diagnosis
- Privacy-first data handling

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Set up IP allowlist (0.0.0.0/0 for serverless or Vercel IPs)
3. Create database user
4. Get connection string and add to `.env.local`

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Important Notes

- **This is a screening tool, not a medical diagnosis**
- Always include disclaimers in UI
- Never log user content in server logs
- Implement proper error handling
- Test crisis detection flow

## License

MIT

