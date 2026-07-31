# Microsoft Certification Exam Simulator

A web app that simulates the real Microsoft certification exam experience for practice and preparation. Content is sourced live from Microsoft Learn—fetched only on-demand, never pre-fetched in bulk.

## Features

- ✅ **Live Exam Catalog**: Fetch certification list (cached daily)
- ✅ **On-Demand Questions**: LLM-generated from live "Skills measured" outlines
- ✅ **Realistic Exam Format**: Single/multi-select MCQ, true/false, scenario-based
- ✅ **Timed Sessions**: Countdown timer, question navigation, mark for review
- ✅ **Scoring & Feedback**: Pass/fail result, per-question review with explanations & source links
- ⏳ **Microsoft Learn MCP Integration**: Ready for live content fetching (placeholder data currently)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) → Deployed on Vercel
- **Question Generation**: OpenRouter LLM (structured JSON)
- **Deployment**: Vercel (GitHub integration, auto-deploy on `main`)
- **No Database**: Stateless—all data generated on-demand

## Development Setup

### 1. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required:
- `OPENROUTER_API_KEY` – Get from [openrouter.ai/keys](https://openrouter.ai/keys) (free tier available)

### 3. Vercel Deployment (GitHub Integration)

**One-time setup:**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Select `gaurangjani/Microsoft-Exam-Sandbox`
3. Leave build settings as defaults (Next.js auto-detected)
4. Under "Environment Variables", add:
   - `OPENROUTER_API_KEY` = your key from openrouter.ai
5. Click "Deploy"

**After setup:** Every push to `main` auto-deploys. Feature branches create preview deployments.

---

## API & Integration Points

### Microsoft Learn MCP
- Lightweight exam catalog on page load (cached)
- Full skills outline fetched on exam selection

### LLM Integration (OpenRouter)
- Generate original questions grounded in fetched skills outline
- Structured JSON: question, options, correct answer(s), explanation, source URL

### Database (Postgres)
- Store exam attempts, user answers, timing
- Retrieve exam history and progress

---

## Development Status

- [x] Initial Next.js setup
- [x] Vercel deployment configuration
- [ ] Exam catalog (Microsoft Learn MCP integration)
- [ ] Exam selection UI (searchable list)
- [ ] Question engine (live fetch + LLM generation)
- [ ] Exam session (timer, navigation, marking)
- [ ] Scoring & feedback report
- [ ] Database persistence

---

## Contributing

Push to feature branches (`claude/*`), then open a PR for review before merging to `main`.

```bash
git checkout -b claude/feature-name
# ... make changes ...
git push -u origin claude/feature-name
```
