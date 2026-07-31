# Vercel Deployment - Step by Step

## Prerequisites
1. GitHub account (with access to `gaurangjani/Microsoft-Exam-Sandbox`)
2. Vercel account (free at https://vercel.com)
3. OpenRouter API key and chosen model

## Part 1: Get API Credentials

### Step 1: Get OpenRouter API Key
1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Copy your API key (starts with `sk_`)
4. Choose a model from https://openrouter.ai/docs#models
   - **Recommended for free tier**: `openai/gpt-3.5-turbo`
   - **Better quality (paid)**: `openai/gpt-4-turbo`
   - **Balanced**: `anthropic/claude-3-sonnet`

**Save these two values:**
```
API_KEY = sk_...your-key...
MODEL = openai/gpt-3.5-turbo
```

---

## Part 2: Deploy to Vercel

### Step 1: Go to Vercel
- Open https://vercel.com
- Click "Sign in" (top right)
- Click "Continue with GitHub"
- Authorize Vercel to access your GitHub account

### Step 2: Create New Project
- Click "Add New..." (top left)
- Click "Project"
- You should see `gaurangjani/Microsoft-Exam-Sandbox` in the list
- Click on it to select

### Step 3: Import Project
- A form appears with repository details
- Leave all settings as default
- Scroll down to "Environment Variables"

### Step 4: Add Environment Variables
Click "+ Add" and enter:

**First variable:**
- **Name**: `OPENROUTER_API_KEY`
- **Value**: `sk_...` (paste your API key from Part 1)
- Click "Add"

**Second variable:**
- **Name**: `OPENROUTER_MODEL`
- **Value**: `openai/gpt-3.5-turbo` (or your chosen model)
- Click "Add"

### Step 5: Deploy
- Click the "Deploy" button (large blue button)
- Wait 2-3 minutes for deployment to complete
- You'll see: "Congratulations! Your project has been successfully deployed"
- Click the preview link to test

---

## Part 3: Test Your Deployment

1. **Open the preview URL** (e.g., `https://exam-simulator-abc123.vercel.app`)

2. **You should see:**
   - Title: "Microsoft Certification Exam Simulator"
   - Exam selector with 7 exams listed
   - Search box and category filters

3. **Test question generation:**
   - Click "Start Practice Exam" on any exam
   - Wait 2-5 seconds (LLM is generating questions)
   - You should see 10 questions loaded
   - Answer some questions and submit
   - You should see your score and detailed feedback

4. **If you see errors:**
   - Check browser console (F12 → Console tab)
   - Common error: "OPENROUTER_API_KEY is not configured"
     - Go to Vercel project settings
     - Verify both environment variables are set
     - Redeploy

---

## Part 4: Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings"
3. Click "Domains"
4. Enter your custom domain (e.g., `exams.example.com`)
5. Follow DNS instructions to connect your domain

---

## Part 5: Auto-Deploy on Git Push

Every push to `main` branch automatically deploys:

```bash
# Make changes locally
git add .
git commit -m "Your changes"

# Push to main
git push origin main

# Vercel automatically detects the push and deploys
# Check deployment status at https://vercel.com/dashboard
```

Feature branches create preview deployments (handy for testing).

---

## Vercel Environment Variables (Reference)

| Variable | Value | Required | Example |
|----------|-------|----------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ Yes | `sk_live_...` |
| `OPENROUTER_MODEL` | LLM model ID | ✅ Yes | `openai/gpt-3.5-turbo` |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL | ❌ No | `https://exam-sim.vercel.app` |

---

## Troubleshooting Vercel Deployment

### Deployment failed (red X)
1. Go to Vercel project dashboard
2. Click "Deployments" tab
3. Click on the failed deployment
4. Scroll to "Build Logs"
5. Look for error message
6. Common issues:
   - **Missing env vars**: Check "Settings" → "Environment Variables"
   - **Node version**: Should auto-detect (no action needed)
   - **Build error**: Run `npm run build` locally to debug

### App loads but questions fail to generate
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for error message
4. Most common: "OPENROUTER_API_KEY is not configured"
   - Fix: Add env vars in Vercel project settings
   - Redeploy (click "Deployments" → click latest → click "Redeploy")

### Preview URL is slow
- First load after deploy takes 1-2 min (Vercel cold start)
- Subsequent requests are fast (cached)
- LLM question generation takes 2-5 sec (expected)

---

## Monitoring Your Deployment

### View Deployment Status
- Go to https://vercel.com/dashboard
- Click on `Microsoft-Exam-Sandbox`
- Click "Deployments" tab
- See all push history and deployment status

### View Logs
- Click on a deployment
- Click "Logs" tab
- See real-time server logs, errors, API calls

### View Web Analytics (Optional)
- Click "Analytics" tab
- See visitor stats, page load times, etc.
- (Free tier shows basic metrics)

---

## Rollback Previous Deployment

If something breaks:
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find the last working deployment
4. Click "..." menu
5. Click "Promote to Production"
6. Done! App rolls back to previous version

---

## Next Steps After Deployment

### 1. Share the URL
Your app is live! Share the preview URL with others.

### 2. Set Custom Domain
Add a custom domain in Vercel settings (see Part 4 above).

### 3. Monitor Performance
- Check Vercel dashboard for errors
- Monitor API quota at https://openrouter.ai/account

### 4. Iterate and Improve
- Make changes locally
- Test with `npm run dev`
- Push to `main` to auto-deploy

---

## Cost Consideration

### OpenRouter Pricing
- **Free tier**: Limited requests
- **Pay-as-you-go**: $0.0005 per 1K tokens (gpt-3.5-turbo)
- **Budget control**: Set API key limits in OpenRouter dashboard

### Vercel Pricing
- **Free tier**: 100 deployments/month, 6000 minutes/month compute
- **Pro**: $20/month for unlimited
- This app fits comfortably in free tier

---

## Support & Issues

**Can't deploy?**
- Check your GitHub account has access to the repo
- Verify Vercel is authorized in GitHub settings

**Questions generating slowly?**
- Normal: LLM takes 2-5 seconds
- If >10 sec: Check OpenRouter API status
- Try a smaller/faster model

**Wrong answers in feedback?**
- LLM quality depends on model
- Try GPT-4 for better accuracy (higher cost)
- Adjust prompt in `lib/question-generator.js`

---

## Summary

✅ **You are now ready to deploy!**

1. **Go to https://vercel.com**
2. **Sign in with GitHub**
3. **Import `Microsoft-Exam-Sandbox`**
4. **Add 2 environment variables** (API key + model)
5. **Click Deploy**
6. **Wait 2-3 minutes**
7. **Test at preview URL**

That's it! Your Microsoft Cert Exam Simulator is live 🎉
