# Vercel Deployment Guide

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
5. Add Environment Variables (see below)
6. Click "Deploy"

## Option 2: Deploy via CLI

### Step 1: Login
Run: `npx vercel login` and complete the browser authentication

### Step 2: Deploy
```bash
npx vercel --prod --scope lelekhoa1812s-projects
```

## Required Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
GEMINI_API_1=your-gemini-api-key-1
GEMINI_API_2=your-gemini-api-key-2
GEMINI_API_3=your-gemini-api-key-3
GEMINI_API_4=your-gemini-api-key-4
GEMINI_API_5=your-gemini-api-key-5
NVIDIA_API_1=your-nvidia-api-key-1
NVIDIA_API_2=your-nvidia-api-key-2
NVIDIA_API_3=your-nvidia-api-key-3
NVIDIA_API_4=your-nvidia-api-key-4
NVIDIA_API_5=your-nvidia-api-key-5
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**: Set these for **Production**, **Preview**, and **Development** environments.

## Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
2. Test all features:
   - Registration/Login
   - Assessment flow
   - Chat functionality
3. Check MongoDB connection from Vercel (may need to whitelist Vercel IPs)

