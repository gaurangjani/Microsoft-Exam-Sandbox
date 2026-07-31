# Microsoft Certification Exam Simulator

A web app that simulates the real Microsoft certification exam experience for practice and preparation. Content is sourced live from Microsoft Learn—fetched only on-demand, never pre-fetched in bulk.

## Features (In Development)

- **Live Exam Catalog**: Fetch certification list from Microsoft Learn (cached daily)
- **On-Demand Content**: Questions generated from live "Skills measured" outlines—fetched only when exam is selected
- **Realistic Exam Format**: Single/multi-select MCQ, case studies, scenario sets, ordering questions
- **Timed Sessions**: Countdown timer matching real exam duration
- **Scoring & Feedback**: Pass/fail results, section scores, per-question review with source links
- **Exam History**: Track attempts and progress with Postgres

## Tech Stack

- **Frontend**: Next.js 14 (App Router) → Deployed on Vercel
- **Live Content**: Microsoft Learn MCP (on-demand fetching)
- **Question Generation**: OpenRouter LLM (structured JSON output)
- **Database**: Vercel Postgres or Supabase
- **Deployment**: Vercel (GitHub integration, auto-deploy on `main`)

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

Required for features:
- `OPENROUTER_API_KEY` – LLM question generation
- `POSTGRES_PRISMA_URL` (or `DATABASE_URL`) – Exam attempt tracking

### 3. Vercel Deployment (GitHub Integration)

**One-time setup:**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Select `gaurangjani/Microsoft-Exam-Sandbox`
3. Leave build settings as defaults (Next.js auto-detected)
4. Under "Environment Variables", add:
   - `OPENROUTER_API_KEY` = (your OpenRouter key)
   - `POSTGRES_PRISMA_URL` = (your Vercel Postgres or Supabase connection string)
   - `NEXT_PUBLIC_APP_URL` = (your Vercel deployment URL, e.g., `https://exam-sim.vercel.app`)

5. Click "Deploy"

**After setup:** Every push to `main` auto-deploys. Feature branches are preview deployments.

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
