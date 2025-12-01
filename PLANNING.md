# ADHD Assistant - Step-by-Step Build Plan

## Project Overview
**Tech Stack**: Next.js 14+ (App Router), shadcn/ui, MongoDB, Gemini 2.5, NVIDIA NIM  
**Deployment**: Vercel (serverless)  
**Architecture**: Multi-agent system with round-robin API key rotation and vector search

---

## Phase 1: Project Foundation & Setup

### Step 1.1: Initialize Next.js Project
- [ ] Create Next.js app with TypeScript, Tailwind, App Router, ESLint
  ```bash
  pnpm create next-app@latest adhd-assistant --ts --tailwind --app --eslint
  ```
- [ ] Navigate to project directory
- [ ] Verify project structure

### Step 1.2: Install shadcn/ui
- [ ] Initialize shadcn/ui
  ```bash
  pnpm dlx shadcn@latest init
  ```
- [ ] Configure components.json
- [ ] Install initial components: Button, Card, Input, Form, Dialog, Stepper, Progress

### Step 1.3: Install Core Dependencies
- [ ] Install database & auth packages
  ```bash
  pnpm add mongodb bcryptjs zod jose
  pnpm add @tanstack/react-query
  pnpm add -D @types/bcryptjs
  ```
- [ ] Install AI SDK packages (if using official SDKs)
- [ ] Verify all dependencies installed

### Step 1.4: Environment Configuration
- [ ] Verify `.env.local` exists with all required variables:
  - `MONGO_URI`
  - `GEMINI_API_1` through `GEMINI_API_5`
  - `NVIDIA_API_1` through `NVIDIA_API_5`
- [ ] Create `.env.example` template (without secrets)
- [ ] Add environment variable validation schema

### Step 1.5: Project Structure Setup
- [ ] Create `src/` directory structure:
  ```
  src/
    server/
      db.ts
      auth/
        password.ts
        jwt.ts
      agents/
        registry.ts
        router.ts
        assessment.ts
        coach.ts
        memory.ts
      providers/
        gemini.ts
        nvidia.ts
        round-robin.ts
    lib/
      utils.ts
    components/
      ui/ (shadcn components)
  ```
- [ ] Move existing code to `src/` if needed
- [ ] Set up TypeScript path aliases in `tsconfig.json`

---

## Phase 2: Database & Core Infrastructure

### Step 2.1: MongoDB Connection
- [ ] Create `src/server/db.ts` with MongoDB client singleton
- [ ] Implement connection pooling for serverless
- [ ] Add connection error handling
- [ ] Test connection on app startup

### Step 2.2: Database Schema & Collections
- [ ] Design and document schema for:
  - `users` (email, passwordHash, createdAt)
  - `profiles` (userId, goals, preferences, struggles)
  - `assessments` (userId, type, answers, scores, interpretation)
  - `chats` (userId, threadId, messages)
  - `memories` (userId, text, sourceType, sourceId, embedding, createdAt)
  - `counters` (for round-robin: _id, value)
- [ ] Create TypeScript interfaces/types for each collection
- [ ] Set up MongoDB indexes (userId, createdAt, etc.)
- [ ] Plan for vector search index on `memories.embedding` (Atlas Vector Search)

### Step 2.3: Round-Robin API Key Rotation
- [ ] Create `src/server/providers/round-robin.ts`
- [ ] Implement `nextKey(provider: "gemini" | "nvidia")` function
- [ ] Use MongoDB atomic counter (`findOneAndUpdate` with `$inc`)
- [ ] Add retry logic for 429 rate limits (max 2-3 retries)
- [ ] Add logging (provider, model, latency, status - NO user text)
- [ ] Test round-robin distribution

---

## Phase 3: Authentication System

### Step 3.1: Password Utilities
- [ ] Create `src/server/auth/password.ts`
- [ ] Implement `hashPassword(password: string)` using bcrypt
- [ ] Implement `verifyPassword(password: string, hash: string)`
- [ ] Add unit tests for password functions

### Step 3.2: JWT Utilities
- [ ] Create `src/server/auth/jwt.ts`
- [ ] Implement `signToken(userId: string)` using jose
- [ ] Implement `verifyToken(token: string)` 
- [ ] Configure JWT expiration (e.g., 7 days)
- [ ] Add token refresh logic if needed

### Step 3.3: Auth API Routes
- [ ] Create `app/api/auth/register/route.ts`
  - Validate email/password with Zod
  - Check if user exists
  - Hash password
  - Create user in MongoDB
  - Generate JWT
  - Set httpOnly cookie
  - Return success
- [ ] Create `app/api/auth/login/route.ts`
  - Validate credentials
  - Verify password
  - Generate JWT
  - Set httpOnly cookie
  - Return user info (no password)
- [ ] Create `app/api/auth/logout/route.ts`
  - Clear httpOnly cookie
- [ ] Create `app/api/auth/me/route.ts`
  - Verify JWT from cookie
  - Return current user info

### Step 3.4: Route Protection Middleware
- [ ] Create `middleware.ts` in root
- [ ] Protect `/app/*` routes (require authentication)
- [ ] Redirect unauthenticated users to `/auth/login`
- [ ] Allow public routes: `/`, `/auth/*`
- [ ] Test middleware with protected routes

---

## Phase 4: AI Provider Wrappers

### Step 4.1: Gemini Provider
- [ ] Create `src/server/providers/gemini.ts`
- [ ] Implement unified `LlmProvider` interface
- [ ] Implement `chat()` method:
  - Use round-robin for API key selection
  - Support models: `gemini-2.5-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro`
  - Support JSON mode
  - Handle rate limits with retries
  - Return structured response
- [ ] Add error handling and logging
- [ ] Test with simple chat completion

### Step 4.2: NVIDIA NIM Provider
- [ ] Create `src/server/providers/nvidia.ts`
- [ ] Implement `chat()` method:
  - Use OpenAI-compatible endpoint: `POST https://integrate.api.nvidia.com/v1/chat/completions`
  - Round-robin API keys
  - Handle rate limits
- [ ] Implement `embed()` method:
  - Endpoint: `POST https://integrate.api.nvidia.com/v1/embeddings`
  - Model: `nvidia/nv-embedqa-e5-v5`
  - Return embeddings array
- [ ] Implement `rerank()` method:
  - Endpoint: `POST https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking`
  - Return ranked indices
- [ ] Add error handling and logging
- [ ] Test each endpoint

### Step 4.3: Provider Registry/Factory
- [ ] Create provider factory that returns appropriate provider
- [ ] Add configuration for model selection per use case
- [ ] Document which models to use for which tasks

---

## Phase 5: Agent System

### Step 5.1: Agent Registry Foundation
- [ ] Create `src/server/agents/registry.ts`
- [ ] Define agent types and interfaces
- [ ] Create base agent class/interface
- [ ] Set up agent selection logic

### Step 5.2: Router Agent
- [ ] Create `src/server/agents/router.ts`
- [ ] Use Gemini Flash-Lite for fast routing
- [ ] Input: user intent/message
- [ ] Output: JSON `{ route, confidence, needed_context }`
- [ ] Routes: "assessment", "planning", "career", "study", "history_lookup", "chat"
- [ ] Test routing accuracy

### Step 5.3: Assessment Agent
- [ ] Create `src/server/agents/assessment.ts`
- [ ] Use Gemini Flash/Pro for explanations
- [ ] Generate:
  - Friendly result explanations
  - Trait hypotheses (not diagnoses)
  - "Questions to ask a clinician" list
  - Personalized strategies
- [ ] Ensure safety disclaimers in output
- [ ] Test with sample ASRS results

### Step 5.4: Memory Agent
- [ ] Create `src/server/agents/memory.ts`
- [ ] Implement embedding storage:
  - Generate normalized summary
  - Embed with NVIDIA `nv-embedqa-e5-v5`
  - Store in `memories` collection
- [ ] Implement retrieval:
  - Embed user query
  - Vector search in MongoDB (or cosine similarity)
  - Rerank with NVIDIA reranker
  - Return top K relevant memories
- [ ] Test embedding and retrieval flow

### Step 5.5: Coach Agent
- [ ] Create `src/server/agents/coach.ts`
- [ ] Use Gemini Flash for daily coaching
- [ ] Ground responses with retrieved memories
- [ ] Generate:
  - Routines and habits
  - Accountability check-ins
  - Adaptive plans based on history
- [ ] Test coaching responses

### Step 5.6: Quiz Generator Agent (V1)
- [ ] Create `src/server/agents/quiz-generator.ts`
- [ ] Use Gemini Pro for complex generation
- [ ] Generate scenario-based quizzes from user context
- [ ] Output strict JSON schema for UI rendering
- [ ] Test JSON schema validation

---

## Phase 6: User Onboarding

### Step 6.1: Onboarding UI Structure
- [ ] Create `app/(app)/onboarding/page.tsx`
- [ ] Design multi-step form with shadcn Stepper
- [ ] Steps:
  1. Consent & disclaimers (screening, not diagnosis)
  2. Goals selection (study/career/life)
  3. Self-reported struggles
  4. Communication style preferences
- [ ] Add "Save & continue later" functionality

### Step 6.2: Onboarding API
- [ ] Create `app/api/onboarding/route.ts`
- [ ] Save profile data to `profiles` collection
- [ ] Link to `userId`
- [ ] Validate input with Zod
- [ ] Return success/error

### Step 6.3: Onboarding Flow Integration
- [ ] Redirect new users to onboarding
- [ ] Skip onboarding for returning users
- [ ] Store onboarding completion status
- [ ] Test full onboarding flow

---

## Phase 7: ADHD Screening (ASRS)

### Step 7.1: ASRS 6Q Implementation
- [ ] Research and document ASRS v1.1 6Q questions
- [ ] Create `app/(app)/assessment/page.tsx`
- [ ] Build question UI with:
  - Progress indicator
  - Clear question text
  - Radio buttons (Never, Rarely, Sometimes, Often, Very Often)
  - Navigation (Previous/Next)
- [ ] Add consent/disclaimer before starting
- [ ] Implement scoring logic (ASRS v1.1 scoring rules)
- [ ] Store answers in state

### Step 7.2: ASRS 18 Extended (Optional)
- [ ] Add option to continue with extended 18Q after 6Q
- [ ] Implement 18Q flow
- [ ] Update scoring logic
- [ ] Add impairment questions

### Step 7.3: Assessment Results Page
- [ ] Create `app/(app)/assessment/results/page.tsx`
- [ ] Display:
  - Score interpretation (low/medium/high likelihood)
  - Most affected areas (organization, attention, impulsivity, emotional)
  - "What to try this week" (3 small experiments)
  - Safety disclaimer (not a diagnosis)
  - Suggestion to seek professional evaluation if indicated
- [ ] Use AssessmentAgent to generate personalized explanations
- [ ] Design supportive, non-judgmental UI

### Step 7.4: Assessment API & Storage
- [ ] Create `app/api/assessment/submit/route.ts`
- [ ] Validate answers
- [ ] Calculate scores
- [ ] Call AssessmentAgent for interpretation
- [ ] Save to `assessments` collection
- [ ] Generate memory summary and embed (MemoryAgent)
- [ ] Return results
- [ ] Test end-to-end assessment flow

---

## Phase 8: Coach Chat Interface

### Step 8.1: Chat UI
- [ ] Create `app/(app)/chat/page.tsx`
- [ ] Build chat interface with:
  - Message list (user/assistant)
  - Input field
  - Send button
  - Loading states
  - Error handling
- [ ] Use shadcn components (Card, ScrollArea)
- [ ] Add "reduce overwhelm mode" toggle

### Step 8.2: Chat API
- [ ] Create `app/api/chat/route.ts`
- [ ] Verify authentication
- [ ] Load user profile and relevant memories (MemoryAgent)
- [ ] Use RouterAgent to determine intent
- [ ] Route to appropriate agent (CoachAgent, etc.)
- [ ] Ground response with retrieved memories
- [ ] Save chat messages to `chats` collection
- [ ] Generate memory summary and embed
- [ ] Stream or return response
- [ ] Test chat flow

### Step 8.3: Chat History
- [ ] Display chat history on page load
- [ ] Load previous conversations
- [ ] Add thread management (if multi-thread)
- [ ] Test history retrieval

---

## Phase 9: Personalized Planning

### Step 9.1: Strength & Strategy Plan
- [ ] Create `app/(app)/plan/page.tsx`
- [ ] Generate personalized plan using AssessmentAgent/CoachAgent
- [ ] Display:
  - Study/work strategies
  - Routine suggestions
  - Accommodation ideas
  - Based on user profile + assessment results
- [ ] Save plan to database
- [ ] Allow plan updates

### Step 9.2: Task Planner (V1)
- [ ] Create `app/(app)/planner/page.tsx`
- [ ] Build task breakdown interface
- [ ] Implement timeboxing
- [ ] Add reminders/checklists
- [ ] "Start now" micro-steps feature
- [ ] ADHD-friendly UI (short blocks, clear actions)
- [ ] Save tasks to database

### Step 9.3: Progress Insights (V1)
- [ ] Create `app/(app)/insights/page.tsx`
- [ ] Analyze user history:
  - Triggers identified
  - Best working hours
  - What actually helped
- [ ] Use MemoryAgent to retrieve relevant past sessions
- [ ] Generate insights with AI
- [ ] Display visualizations (charts, trends)

---

## Phase 10: History & Knowledge Retrieval

### Step 10.1: History Page
- [ ] Create `app/(app)/history/page.tsx`
- [ ] Display:
  - Past assessments (with dates, scores)
  - Saved plans
  - Chat summaries
- [ ] Add filters (date, type)
- [ ] Link to detailed views

### Step 10.2: Knowledge Search
- [ ] Add search functionality to history page
- [ ] Use MemoryAgent for semantic search
- [ ] Display "What worked last time?" results
- [ ] Show relevant past sessions, plans, chats
- [ ] Test search accuracy

---

## Phase 11: Safety & Crisis Detection

### Step 11.1: Crisis Detection
- [ ] Add safety check in chat/assessment flows
- [ ] Detect self-harm/hopelessness keywords
- [ ] Create crisis-safe flow:
  - Switch to supportive resources
  - Encourage professional help
  - Provide crisis hotline numbers
  - Do not continue with normal flow
- [ ] Test crisis detection

### Step 11.2: Safety Disclaimers
- [ ] Add disclaimers to:
  - Landing page
  - Before assessment results
  - In chat interface
- [ ] Clear messaging: "Screening tool, not diagnosis"
- [ ] Professional help encouragement

---

## Phase 12: UI/UX Polish

### Step 12.1: Marketing Landing Page
- [ ] Create `app/(marketing)/page.tsx`
- [ ] Design welcoming landing page
- [ ] Include:
  - Value proposition
  - Safety disclaimers
  - Call-to-action
  - Features overview
- [ ] Use shadcn components
- [ ] Ensure ADHD-friendly design (short text, clear sections)

### Step 12.2: Dashboard
- [ ] Create `app/(app)/dashboard/page.tsx`
- [ ] Show:
  - Quick stats
  - Recent activity
  - Quick actions (new assessment, chat, planner)
  - Progress overview
- [ ] Design clean, uncluttered layout

### Step 12.3: Settings Page
- [ ] Create `app/(app)/settings/page.tsx`
- [ ] Add:
  - Profile editing
  - Privacy settings
  - "Export my data" (JSON download)
  - "Delete my data" (with confirmation)
  - "Reduce overwhelm mode" toggle
- [ ] Implement export/delete APIs

### Step 12.4: Responsive Design
- [ ] Test on mobile devices
- [ ] Ensure touch-friendly interactions
- [ ] Optimize for smaller screens
- [ ] Test "reduce overwhelm mode"

---

## Phase 13: Security & Privacy Hardening

### Step 13.1: Security Audit
- [ ] Verify no API keys exposed client-side
- [ ] Ensure JWT cookies are httpOnly and secure
- [ ] Add CSRF protection
- [ ] Validate all inputs with Zod
- [ ] Sanitize outputs
- [ ] Review error messages (no sensitive data)

### Step 13.2: Privacy Features
- [ ] Implement "Export my data" API
  - Export all user data as JSON
  - Include: profile, assessments, chats, plans
- [ ] Implement "Delete my data" API
  - Delete all user data
  - Cascade delete related records
  - Confirm deletion
- [ ] Add privacy policy page
- [ ] Add data retention policy

### Step 13.3: Logging & Monitoring
- [ ] Set up structured logging
- [ ] Log: provider, model, latency, status (NO user text)
- [ ] Add error tracking
- [ ] Monitor API usage and rate limits
- [ ] Set up alerts for errors

---

## Phase 14: Testing

### Step 14.1: Unit Tests
- [ ] Test password hashing/verification
- [ ] Test JWT sign/verify
- [ ] Test round-robin key rotation
- [ ] Test provider wrappers (mocked)
- [ ] Test scoring logic

### Step 14.2: Integration Tests
- [ ] Test auth flow (register → login → protected route)
- [ ] Test assessment submission → storage → retrieval
- [ ] Test chat → memory retrieval → response
- [ ] Test embedding and vector search

### Step 14.3: E2E Tests (Playwright)
- [ ] Test: register → onboarding → assessment → results → chat
- [ ] Test: login → chat → history search
- [ ] Test: crisis detection flow
- [ ] Test: data export/delete

### Step 14.4: Load Testing
- [ ] Test concurrent API calls
- [ ] Test rate limit handling
- [ ] Test MongoDB connection pooling
- [ ] Monitor performance

---

## Phase 15: Deployment Preparation

### Step 15.1: Vercel Configuration
- [ ] Create `vercel.json` if needed
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up build settings
- [ ] Configure domain (if custom)

### Step 15.2: MongoDB Atlas Setup
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure IP allowlist (Vercel IPs or 0.0.0.0/0 for serverless)
- [ ] Create database user
- [ ] Set up Vector Search index on `memories.embedding` (if using Atlas)
- [ ] Test connection from Vercel

### Step 15.3: Rate Limiting
- [ ] Implement rate limiting (MongoDB-based per user/day)
- [ ] Add rate limit headers
- [ ] Test rate limit enforcement

### Step 15.4: Pre-Deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] MongoDB connection tested
- [ ] API keys validated
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Security review completed

---

## Phase 16: Deployment & Launch

### Step 16.1: Deploy to Vercel
- [ ] Connect GitHub repository (if using)
- [ ] Deploy to Vercel
- [ ] Verify deployment success
- [ ] Test production URLs

### Step 16.2: Post-Deployment Testing
- [ ] Test all flows in production
- [ ] Verify MongoDB connection
- [ ] Test API key rotation
- [ ] Test authentication
- [ ] Test AI providers
- [ ] Monitor logs for errors

### Step 16.3: Documentation
- [ ] Update README with setup instructions
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Add deployment guide

---

## Phase 17: V1 Features (Post-MVP)

### Step 17.1: Enhanced Planner
- [ ] Add task dependencies
- [ ] Add recurring tasks
- [ ] Add time tracking
- [ ] Add productivity insights

### Step 17.2: Advanced Insights
- [ ] Add trend analysis
- [ ] Add pattern recognition
- [ ] Add personalized recommendations
- [ ] Add progress tracking

### Step 17.3: Knowledge Base
- [ ] Enhance search with better reranking
- [ ] Add topic clustering
- [ ] Add "related insights" feature
- [ ] Improve memory retrieval accuracy

---

## Priority Order Summary

**MVP (Must Have for Launch):**
1. Phases 1-4: Foundation, DB, Auth, Providers
2. Phases 5.1-5.4: Core Agents (Router, Assessment, Memory, Coach)
3. Phase 6: Onboarding
4. Phase 7: ASRS Screening
5. Phase 8: Basic Chat
6. Phase 9.1: Strength & Strategy Plan
7. Phase 11: Safety & Crisis Detection
8. Phase 12.1-12.2: Landing & Dashboard
9. Phase 13: Security Basics
10. Phase 15-16: Deployment

**V1 (Post-Launch Enhancements):**
- Phase 9.2-9.3: Advanced Planner & Insights
- Phase 5.6: Quiz Generator
- Phase 10: Enhanced History & Search
- Phase 12.3-12.4: Settings & Polish
- Phase 14: Comprehensive Testing
- Phase 17: Advanced Features

---

## Notes

- **Environment Variables**: Already configured in `.env` (per user note)
- **Deployment**: Vercel (serverless-friendly)
- **Safety First**: Always include disclaimers and crisis detection
- **Privacy**: Never log user content, implement export/delete
- **Performance**: Use round-robin for API keys, implement retries for rate limits
- **UX**: Keep ADHD-friendly (short text, clear actions, reduce overwhelm mode)

