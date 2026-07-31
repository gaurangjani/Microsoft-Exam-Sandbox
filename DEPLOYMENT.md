# Deployment Guide

## Quick Start to Vercel

### Prerequisites
- GitHub account with access to `gaurangjani/Microsoft-Exam-Sandbox`
- OpenRouter API key (free at https://openrouter.ai/keys)

### Steps

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Create Project**
   - Click "New Project"
   - Import `gaurangjani/Microsoft-Exam-Sandbox`
   - Click "Continue"

3. **Configure Environment**
   - In "Environment Variables", add:
     ```
     OPENROUTER_API_KEY=sk_...your-key-here...
     OPENROUTER_MODEL=openai/gpt-3.5-turbo
     ```
   - Model options: `openai/gpt-3.5-turbo`, `openai/gpt-4-turbo`, `anthropic/claude-3-sonnet`
   - See [full model list](https://openrouter.ai/docs#models)
   - Click "Deploy"

4. **Confirm Deploy**
   - Wait for deployment to complete (~2-3 min)
   - Click preview URL to test
   - You should see the exam selector screen with 14 exams
   - Try an exam to verify questions generate within 5 seconds

### Auto-Deploy on Push

Every push to `main` automatically deploys:
```bash
git push origin main
```

Feature branch pushes create preview deployments (handy for testing).

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local and add your keys

# Run dev server
npm run dev
# Open http://localhost:3000
```

### Environment Variables for Local Development

Edit `.env.local`:
```
OPENROUTER_API_KEY=sk_...your-key-from-openrouter.ai...
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

### Testing Question Generation

The question generation endpoint requires both `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.

Without them:
- Exam selector loads ✅
- Question generation returns error when starting exam ❌

Add both to `.env.local`:
```
OPENROUTER_API_KEY=sk_...
OPENROUTER_MODEL=openai/gpt-3.5-turbo
npm run dev
```

---

## Features Implemented

### ✅ Live Exam Catalog
- **File**: `lib/microsoft-learn.js`
- 14 Microsoft certifications (Azure, Microsoft 365, Security, Data & AI)
- Cached for 24 hours (localStorage on client)
- Ready for Microsoft Learn MCP integration

### ✅ Searchable Exam Selector
- **File**: `app/components/ExamSelector.js`
- Search by code or title
- Filter by category (Azure, Microsoft 365, Security, Data & AI)
- Card-based UI matching Microsoft design
- Dark/light theme support

### ✅ Progressive Question Generation
- **File**: `lib/question-generator.js`
- Uses OpenRouter API to call LLM (gpt-3.5-turbo by default)
- **Batch loading**: 2 questions per batch, up to 100+ total questions
- Auto-prefetch: Next batch loads when user is 4 questions from loaded end
- Automatic retry with 4-second backoff on batch failures
- Truncated JSON recovery: Salvages complete questions from cut-off LLM responses
- Question types: single-select MCQ, multi-select, true/false, scenario
- Structured JSON with explanation, skill area, source URL

### ✅ Exam Session
- **File**: `app/components/ExamSession.js`
- Timed countdown (exam-specific duration: 45-120 minutes)
- Question navigation with compact 1-2 row grid
- Answer tracking: Shows current, answered, and marked questions
- Mark for review (flag questions to revisit with yellow highlight)
- **Early exit**: End Exam button to submit and score only reached questions
- Auto-submit on time expiry
- Progress bar showing exam completion
- Batch loading indicator showing "⏳ Loading more..." when prefetching

### ✅ Scoring & Feedback Report
- Overall pass/fail status (70% = passing, Microsoft standard)
- Large score card with percentage and correct count
- **Performance by Category**:
  - Score breakdown by skill area
  - Shows percentage and count (X of Y correct) for each category
  - Sorted by performance (best first)
- Per-question review with:
  - Your answer vs. correct answer
  - Question explanation
  - Question type badge
  - Link to source Microsoft Learn doc
- Color-coded results (green = correct ✓, red = incorrect ✗)

### ✅ Theme Support
- **File**: `app/components/ThemeToggle.js`, `app/globals.css`
- Dark/light theme toggle (sun/moon icon, top-right)
- Automatic detection of system preference (prefers-color-scheme)
- localStorage persistence: Theme choice saved across sessions
- All components theme-aware with CSS custom properties
- No flash of unstyled content (FOUC) - theme applied before render
- Optimized color palettes for both themes (accessible contrast ratios)

### ✅ Rate Limiting
- Per-IP rate limiting: 25 requests/minute
- Prevents abuse of question generation endpoint
- In-memory store with automatic cleanup

---

## API Endpoints

### GET `/api/exams`
Returns array of available certifications.

```json
[
  {
    "code": "AZ-900",
    "title": "Microsoft Azure Fundamentals",
    "category": "Azure",
    "duration": 45,
    "passingScore": 700
  },
  ...
]
```

Cache: 24 hours (Vercel edge cache).

### POST `/api/generate-questions`
Generates a batch of questions for progressive loading.

**Request:**
```json
{
  "examCode": "AZ-900",
  "batchIndex": 0
}
```

**Response:**
```json
{
  "examCode": "AZ-900",
  "title": "Microsoft Azure Fundamentals",
  "questions": [
    {
      "type": "single-select",
      "question": "What is...",
      "options": ["A) ...", "B) ..."],
      "correctAnswers": [0],
      "explanation": "...",
      "skillArea": "Describe cloud concepts",
      "sourceUrl": "https://learn.microsoft.com/..."
    },
    ...
  ],
  "duration": 45,
  "passingScore": 700,
  "batchSize": 2,
  "batchIndex": 0,
  "totalBatches": 50
}
```

**Batch Loading Details:**
- First call: `batchIndex` omitted or 0 (initial 2-5 questions)
- Subsequent calls: Increment `batchIndex` to load next batch
- `batchSize`: Questions per batch (default 2, optimized for reliability)
- `totalBatches`: Maximum batches available (50, = 100+ questions total)
- Frontend auto-prefetch: Loads next batch when user 4 questions from end
- Auto-retry: Failed batches retry after 4 seconds
- Timeout: 35-second abort timeout per request (8-second buffer under 40s serverless limit)

**Error Handling:**
- If batch fails: Returns error with retry guidance
- Truncated JSON recovery: Extracts complete questions from cut-off responses
- Rate limiting: 25 requests/minute per IP

**Requires:** 
- `OPENROUTER_API_KEY` environment variable
- `OPENROUTER_MODEL` environment variable (e.g., `openai/gpt-3.5-turbo`)

---

## Next Steps / Future Integration

### ✅ Completed
- **Progressive batch loading** (100+ questions per exam)
- **Auto-retry with backoff** (failed batches auto-retry after 4s)
- **Truncated JSON recovery** (salvages complete questions from cut responses)
- **Dark/light theme** (toggle + localStorage persistence)
- **Category-based scoring** (performance breakdown by skill area)
- **Early exam exit** (End Exam button for quick submission)
- **Rate limiting** (25 req/min per IP)

### 🚀 Potential Enhancements

#### Microsoft Learn MCP Integration
When MCP is available, replace seed data in `lib/microsoft-learn.js`:

```javascript
// TODO: Replace with actual MCP integration
const exams = await fetchFromMicrosoftLearnMCP();
const outline = await fetchFromMicrosoftLearnMCP(examCode);
```

#### Advanced Question Types
- Scenario-based (multi-part case studies)
- Ordering/sequencing (drag-and-drop)
- Matching (pair concepts to definitions)
- Code snippet analysis (show code, ask what happens)

#### User Persistence
- User accounts with exam history
- Track scores over time by category
- Personalized recommendations based on weak areas
- Export results as PDF

#### Analytics & Reporting
- Vercel Web Analytics (free)
- PostHog or Mixpanel for behavior tracking
- Weekly performance reports
- Cohort analysis (which topics most students struggle with)

#### Performance Optimization
- Response caching with shorter TTL for question updates
- Image optimization for scenario diagrams
- Partial hydration for faster initial load
- Service Worker for offline support

#### Question Quality
- Implement LLM-based question review/filtering
- Track question difficulty and discrimination
- A/B test question phrasings
- Crowd-source corrections from users

#### Model Flexibility
- Allow users to choose LLM model per session
- Cost estimation based on model/batch count
- Model performance metrics (response time, quality)

---

## Troubleshooting

### "Failed to generate questions" error
**Cause**: `OPENROUTER_API_KEY` is missing or invalid

**Fix**:
1. Get key from https://openrouter.ai/keys
2. Add to Vercel project environment variables: `OPENROUTER_API_KEY`
3. Add model: `OPENROUTER_MODEL=openai/gpt-3.5-turbo`
4. Redeploy

### "Task timed out after 30 seconds" (504 error)
**Cause**: Free-tier LLM model is overloaded or timeout is too aggressive

**Fix**:
1. Switch model to `openai/gpt-3.5-turbo` (paid, but reliable)
2. Avoid free-tier models (`:free`) - they experience queuing delays
3. App uses batch loading (2 questions at a time) to prevent timeouts
4. Each batch has 35-second abort timeout with retry logic

### Questions are only loading 5-10 at a time
**This is expected!** The app uses intelligent batch loading:
1. Initial batch: 2-5 questions (loaded immediately)
2. Additional batches: Load automatically in background as you progress
3. Total: Up to 100+ questions available per exam
4. Check header for "⏳ Loading more..." indicator

### Theme not persisting
**Cause**: Browser localStorage is disabled

**Fix**:
1. Enable localStorage in browser settings
2. Clear cookies/cache and try again
3. Theme will fall back to system preference if localStorage unavailable

### Dark theme colors look off
**Cause**: CSS variables not loading correctly

**Fix**:
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache
3. Check DevTools → Application → Local Storage (should have `theme` key)

### Build fails on Vercel
**Cause**: Missing dependencies or config

**Fix**:
```bash
npm install
npm run build  # Test locally first
git push       # Push to Vercel
```

### Batch loading seems stuck
**Cause**: Failed batch didn't retry or network issues

**Fix**:
1. Check browser console for error messages
2. Wait 4+ seconds (auto-retry window)
3. Refresh page if stuck for > 10 seconds
4. Batches auto-retry with exponential backoff

### Early Exam submission shows error
**Cause**: Answer/result alignment mismatch

**Fix**:
1. Check browser console for detailed error
2. Refresh and try normal submission (Review & Submit) instead
3. Report error if persists

---

## Monitoring & Analytics

No built-in analytics. For tracking:
- Add Vercel Web Analytics (free)
- Add PostHog or Mixpanel for behavior tracking
- Check Vercel deploy logs: https://vercel.com/dashboard

---

## Support

For issues:
1. Check the README.md
2. Review error message in browser console
3. Check Vercel deploy logs
4. File issue on GitHub
