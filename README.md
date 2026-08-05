# Microsoft Certification Exam Simulator

> Practice Microsoft certification exams with AI-generated questions. Real exam formats, instant feedback, live content from Microsoft Learn.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- OpenRouter API key (free at [openrouter.ai/keys](https://openrouter.ai/keys))

### Get Running in 2 Minutes

```bash
# 1. Clone and install
git clone <repo>
cd Microsoft-Exam-Sandbox
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key and model

# 3. Run
npm run dev
# Open http://localhost:3000
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📚 **40+ Microsoft Exams** | Dynamic catalog covering Azure, Security, Data & AI, Dynamics 365, Power Platform, Microsoft 365, and Agentic AI |
| 🔍 **Searchable Selector** | Filter exams by code, title, or category |
| 🤖 **AI-Generated Questions** | 100+ progressive questions per exam via OpenRouter LLM (smart batch loading, curriculum-aligned) |
| 📖 **Curriculum-Aligned** | Questions generated from official Microsoft Learn curriculum per exam family |
| ⏱️ **Timed Sessions** | Realistic exam durations (45-120 minutes) per exam type |
| 📋 **Realistic Formats** | Single/multi-select MCQ, true/false, scenario-based questions |
| ✅ **Instant Scoring** | Pass/fail results (70% threshold, Microsoft standard) |
| 📊 **Performance by Category** | Score breakdown by skill area to identify strengths/weaknesses |
| 📖 **Detailed Feedback** | Per-question review with explanations and source links |
| 🌙 **Dark/Light Theme** | Toggle between light and dark modes with localStorage persistence |
| ⏹️ **End Exam Early** | Submit early and score only attempted questions |
| 🚀 **Auto-Deploy** | Push to `main` = live update in 2 minutes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│       React/Next.js Frontend            │
│    (Exam Selector + Exam Session)       │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───▼────┐      ┌────▼──────┐
    │ /api/  │      │ /api/      │
    │ exams  │      │ generate-  │
    │        │      │ questions  │
    └───┬────┘      └────┬───────┘
        │                │
    ┌───▼────┐      ┌────▼──────┐
    │ Exam   │      │ OpenRouter │
    │ Catalog│      │ LLM API    │
    └────────┘      └───────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, CSS |
| **Backend** | Next.js API Routes (serverless) |
| **LLM** | OpenRouter (gpt-3.5-turbo default) |
| **Hosting** | Vercel (GitHub integration) |
| **Database** | None (stateless) |

---

## 📦 Environment Variables

**Required for deployment:**

```bash
# OpenRouter API key (get free at openrouter.ai/keys)
OPENROUTER_API_KEY=sk_...your-key-here...

# LLM Model (options below)
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

**Model Options:**
- `openai/gpt-3.5-turbo` ⭐ (recommended: fast, cheap, reliable for batches)
- `openai/gpt-4o-mini` (better quality, reasonable cost)
- `openai/gpt-4-turbo` (highest quality, higher cost)
- `anthropic/claude-3-sonnet` (balanced performance)
- **Note:** Avoid free-tier models (`:free`) as they experience queuing delays on OpenRouter
- [See all models](https://openrouter.ai/docs#models)

---

## 🚢 Deployment

### Deploy to Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import `gaurangjani/Microsoft-Exam-Sandbox`
5. Add environment variables:
   - `OPENROUTER_API_KEY` (from openrouter.ai/account/tokens)
   - `OPENROUTER_MODEL` (e.g., `openai/gpt-3.5-turbo`)
6. Click "Deploy"

**Auto-Deploy:** Every push to `main` or `Dev` auto-deploys instantly via Vercel's GitHub integration. No extra setup needed.

📖 **For detailed instructions**, see [DEPLOY_NOW.md](./DEPLOY_NOW.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [CHANGELOG.md](./CHANGELOG.md) | Release notes and version history (v1.6.0 current) |
| [DEPLOY_NOW.md](./DEPLOY_NOW.md) | ⭐ **Start here** - Quick deployment guide |
| [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) | Step-by-step Vercel setup with troubleshooting |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | API endpoints and configuration |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Architecture and roadmap |

---

## 🎯 How It Works

### User Flow

```
1. User opens app
   ↓
2. Exam selector loads (40+ certifications across 11 families, searchable)
   ↓
3. User searches/filters and picks an exam
   ↓
4. Initial batch of questions generated (2-5 seconds)
   ↓
5. Timed exam session starts with first batch
   ↓
6. Additional questions load in background as user progresses
   ↓
7. User answers questions (100+ available)
   ↓
8. Submit or end exam early
   ↓
9. Instant scoring report with category breakdown
   ↓
10. Per-question review with explanations and sources
```

---

## 🎨 UI Features

### Dark/Light Theme
- **Toggle:** Click the sun/moon icon (top-right)
- **Persistence:** Your theme choice is saved in browser storage
- **Default:** Automatically detects system preference (prefers-color-scheme)
- **Responsive:** All components support both themes with optimized colors

### Exam Session Interface
- **Question Navigator:** Compact 1-2 row grid showing all question numbers
  - ✓ Answered (light blue)
  - 🚩 Marked for Review (yellow)
  - ✨ Current (bold outline, larger)
- **Timer:** Real-time countdown with danger color when < 5 minutes remain
- **Progress Bar:** Visual indicator of exam completion
- **Early Exit:** End Exam button to submit and score current progress

### Results Report
- **Overall Score:** Large pass/fail card with percentage and correct count
- **Performance by Category:** Breakdown by skill area showing:
  - Category name
  - Percentage score for that category
  - Count of correct/total questions in that category
- **Detailed Review:** Per-question feedback with:
  - Your answer vs. correct answer
  - Question explanation
  - Link to Microsoft Learn source material

---

## 📋 Supported Exams (40+ Total)

The app supports **40+ Microsoft certification exams** across 11 families:

| Family | Exam Count | Examples |
|--------|-----------|----------|
| **Azure (AZ)** | 10+ | AZ-900, AZ-104, AZ-305, AZ-400, AZ-500, AZ-700, AZ-720 |
| **Microsoft 365 (MS/MD)** | 5+ | MS-900, MD-102, MS-101, MS-102, MD-101 |
| **Security (SC)** | 3+ | SC-900, SC-200, SC-100 |
| **Data Platform (DP)** | 5+ | DP-900, DP-203, DP-100, DP-301, DP-500 |
| **AI (AI)** | 3+ | AI-900, AI-100, AI-102 |
| **Dynamics 365 (MB)** | 5+ | MB-300, MB-330, MB-500, MB-910, MB-920 |
| **Power Platform (PL)** | 5+ | PL-100, PL-200, PL-400, PL-900, PL-200 |
| **Power BI / Analytics (DA)** | 3+ | DA-100, DA-101 |
| **Microsoft Fabric (FA)** | 2+ | FA-100, FA-200 |
| **Agentic AI (AB)** | 3+ | AB-100, AB-730, AB-901 |
| **Security Eng. (SC)** | 2+ | SC-100, SC-200 |

**Curriculum-Aligned:** Questions are generated from official Microsoft Learn curriculum specific to each exam family, ensuring relevance and accuracy.

---

## 🧪 API Endpoints

### `GET /api/exams`
Returns available certifications (cached 24 hours).

**Response:**
```json
[
  {
    "code": "AZ-900",
    "title": "Microsoft Azure Fundamentals",
    "category": "Azure",
    "duration": 45,
    "passingScore": 700
  }
]
```

### `POST /api/generate-questions`
Generates a batch of exam questions via LLM (supports progressive loading).

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
  "questions": [ ... ],
  "duration": 45,
  "passingScore": 700,
  "batchSize": 2,
  "batchIndex": 0,
  "totalBatches": 50
}
```

**Batch Loading:**
- First call: `batchIndex` omitted or 0 (generates 2-5 initial questions)
- Subsequent calls: increment `batchIndex` to load next batch
- Total: Up to 100+ questions available (50 batches × 2 questions per batch)
- Auto-prefetch: Frontend automatically loads next batch when user is 4 questions from loaded end

---

## 🔄 Development Workflow

### Create a Feature Branch
```bash
git checkout -b Dev
# Make changes
git add .
git commit -m "Your changes"
git push -u origin Dev
```

### Merge to Main
```bash
git checkout main
git pull origin main
git merge Dev
git push origin main
# Vercel auto-deploys!
```

---

## 📊 Project Status

| Item | Status | Notes |
|------|--------|-------|
| Core features | ✅ Complete | 40+ exams, 100+ questions per exam |
| Dynamic exam catalog | ✅ Complete | 11 exam families, curriculum-aligned |
| Curriculum-aligned questions | ✅ Complete | Exam-family constraints prevent topic cross-contamination |
| Progressive loading | ✅ Complete | Auto-batch loading as user progresses |
| Dark/Light theme | ✅ Complete | Toggle + localStorage persistence |
| Performance by category | ✅ Complete | Score breakdown by skill area |
| Early exit option | ✅ Complete | End Exam button with confirmation |
| Build/deployment | ✅ Verified | Auto-deploy on push via Vercel |
| Documentation | ✅ Complete | README, API docs, deployment guides, CHANGELOG |
| Google Analytics | ✅ Integrated | Track usage metrics via NEXT_PUBLIC_GA_ID |
| Production ready | ✅ YES | Live on Vercel (v1.6.0) |
| Database | ❌ Not needed | Stateless architecture |
| Rate limiting | ✅ Implemented | 25 req/min per IP |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b Dev`
2. Make your changes
3. Test locally: `npm run dev`
4. Commit: `git add . && git commit -m "Your changes"`
5. Push: `git push -u origin Dev`
6. Merge to main when ready

---

## 📋 Build Verification

```bash
npm install        # Install dependencies
npm run build      # Production build
npm run dev        # Local development (http://localhost:3000)
```

**Build Status:**
- Size: ~120 kB (optimized, with batch loading)
- Routes: 5 (1 main page + 2 API routes)
- Errors: None ✅
- LightHouse Score: 90+ (performance, accessibility)
- Type Safety: Full TypeScript support via Next.js

**Testing:**
1. Local: `npm run dev` → test at `http://localhost:3000`
2. Production: Deploy to Vercel (see [DEPLOY_NOW.md](./DEPLOY_NOW.md))
3. Verify:
   - Exam selector loads all 14 exams
   - Questions generate within 5 seconds
   - Dark/light theme toggles and persists
   - End Exam button shows confirmation and scores correctly
   - Category breakdown appears in results

---

## 📝 License

MIT License - feel free to use and modify.

---

## 📞 Support

- **Deployment help?** → See [DEPLOY_NOW.md](./DEPLOY_NOW.md)
- **Questions?** → Check [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)
- **Architecture?** → Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

**Ready to deploy?** Start with [DEPLOY_NOW.md](./DEPLOY_NOW.md) 🚀
