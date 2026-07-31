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
   - You should see the exam selector screen with 7 exams

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
- Fetches 7 Microsoft certifications with metadata
- Cached for 24 hours (localStorage on client)
- Ready for Microsoft Learn MCP integration (placeholder data now)

### ✅ Searchable Exam Selector
- **File**: `app/components/ExamSelector.js`
- Search by code or title
- Filter by category (Azure, Microsoft 365, Security, Data & AI)
- Card-based UI matching Microsoft design

### ✅ Question Generation Engine
- **File**: `lib/question-generator.js`
- Uses OpenRouter API to call LLM (gpt-3.5-turbo by default)
- Generates 10 original questions per exam
- Question types: single-select MCQ, multi-select, true/false, scenario
- Structured JSON with explanation, skill area, source URL

### ✅ Exam Session
- **File**: `app/components/ExamSession.js`
- Timed countdown (exam duration e.g., 45 or 120 minutes)
- Question navigation (jump to any question)
- Mark for review (flag questions to revisit)
- Auto-submit on time expiry
- Progress bar and question grid view

### ✅ Scoring & Feedback Report
- Pass/fail status (70% = passing)
- Correct count and percentage
- Per-question review with:
  - Your answer vs. correct answer
  - Explanation (why the answer is correct)
  - Link to source Learn doc
- Color-coded results (green = correct, red = incorrect)

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
Request:
```json
{
  "examCode": "AZ-900"
}
```

Response:
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
  "passingScore": 700
}
```

Requires: `OPENROUTER_API_KEY` environment variable.

---

## Next Steps / Future Integration

### Microsoft Learn MCP Integration
When MCP is available, replace seed data in `fetchExamCatalog()` and `fetchExamOutline()` with live API calls:

```javascript
// TODO: Replace with actual MCP integration
const exams = await fetchFromMicrosoftLearnMCP();
const outline = await fetchFromMicrosoftLearnMCP(examCode);
```

### More Question Types
- Scenario-based (multi-part case studies)
- Ordering/sequencing (drag-and-drop)
- Matching (pair concepts to definitions)

### Performance Optimization
- Lazy load questions (fetch one at a time)
- Compress API responses
- Add response caching headers

### Error Recovery
- Retry LLM generation if it fails
- Fallback to generic question template
- User-friendly error messages with retry buttons

---

## Troubleshooting

### "Failed to generate questions" error
**Cause**: `OPENROUTER_API_KEY` is missing or invalid

**Fix**:
1. Get key from https://openrouter.ai/keys
2. Add to Vercel project environment variables
3. Redeploy

### Build fails on Vercel
**Cause**: Missing dependencies or config

**Fix**:
```bash
npm install
npm run build  # Test locally first
git push       # Push to Vercel
```

### Questions look wrong/generic
**Cause**: LLM prompt tuning needed

**Fix**: Edit prompt in `lib/question-generator.js` under `buildPrompt()` function.

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
