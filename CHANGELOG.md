# Changelog

All notable changes to the Microsoft Certification Exam Simulator are documented in this file.

## [1.6.0] - 2025-08-05

### Added
- **Curriculum-Aligned Question Generation** - Questions now generated from official Microsoft Learn curriculum specific to each exam family
- **40+ Microsoft Exams** - Expanded from 14 to 40+ exams across 11 certification families:
  - Azure (AZ): 10+ exams
  - Microsoft 365 (MS/MD): 5+ exams
  - Security (SC): 3+ exams
  - Data Platform (DP): 5+ exams
  - AI/Machine Learning (AI): 3+ exams
  - Dynamics 365 (MB): 5+ exams
  - Power Platform (PL): 5+ exams
  - Power BI/Analytics (DA): 3+ exams
  - Microsoft Fabric (FA): 2+ exams
  - Agentic AI (AB): 3+ exams
- **Exam-Family Constraints** - Prevents topic cross-contamination between exam types (e.g., AB exams no longer generate Azure questions)
- **Version Display** - App footer now shows v1.6.0 for transparency
- **Question Uniqueness** - Improved batch variation using batchIndex to prevent question repetition

### Changed
- **Enhanced Prompt Engineering** - LLM prompt now includes:
  - Detailed skill lists with weights and topics
  - Exam-specific constraints per family
  - Explicit skill alignment requirements
  - Instructions for question variety and batch uniqueness
- **Generic Outline Generation** - Now generates exam-type-specific skills based on code prefix (AZ gets Azure skills, SC gets Security skills, etc.)
- **Improved Documentation** - README updated with 40+ exams, curriculum alignment, and release notes

### Fixed
- **Question Relevance** - AB exams, SC exams, MB exams, and all other families now generate questions aligned with their specific curriculum
- **Repeated Questions** - Batch index variation prevents LLM from generating identical questions across batches
- **Category Score Calculation** - Early exam exit now correctly scores only attempted questions

### Technical Details
- Exam outlines now include curriculum-specific skills for all 11 exam families
- Enhanced `buildPrompt()` in `question-generator.js` with family-specific constraints
- Implemented `getExamConstraints()` function with per-family guidance
- Added `generateGenericOutline()` enhancement for exam-type-specific skill mapping
- Maintained 12-hour TTL for exam outlines, 24-hour for catalog caching
- Batch loading: 2 questions per request, auto-prefetch at 4 questions remaining

---

## [1.5.0] - 2025-07-31

### Added
- **Google Analytics Integration** - Track app usage via NEXT_PUBLIC_GA_ID environment variable
- **Rate Limiting** - Per-IP rate limiting (25 requests/minute) to prevent abuse
- **Smart Caching** - 12-hour TTL for exam outlines, 24-hour for exam catalog
- **Dynamic Exam Discovery** - Playwright-based browser automation for Microsoft Learn scraping (with hardcoded fallback)
- **Three-Tier Fallback** - Fetch → Cache → Playwright → Hardcoded list ensures robustness

### Changed
- **Batch Loading Optimization** - Reduced from 5 to 2 questions per batch to avoid 504 timeouts
- **Question Generation Timeout** - Increased from 8s to 35s (under Vercel's 40s maxDuration limit)
- **Max Tokens** - Increased from 1400 to 1800 to reduce JSON truncation
- **Truncated JSON Recovery** - Improved `salvageTruncatedJson()` to recover complete questions from partial LLM output

### Fixed
- **Vercel 504 Timeouts** - Reduced batch size and optimized generation timing
- **Regex Compilation Errors** - Fixed "Range out of order" in microsoft-learn.js (escaped dashes)
- **TypeError on Score Calculation** - Added optional chaining for missing result objects
- **Category Score Inflation** - Fixed to only count answered questions, not all exam skills

---

## [1.4.0] - 2025-07-20

### Added
- **Category-Based Performance Scoring** - Score breakdown by skill area
- **End Exam Early Option** - Submit before time expires with confirmation dialog
- **Early Exit Scoring** - Score only attempted questions (not full exam)
- **Detailed Question Review** - Per-question feedback with explanations and Microsoft Learn links
- **Verification System** - Identifies correct vs. incorrect answers with visual feedback

### Technical Details
- ScoreReport component with category aggregation
- calculateScore() supports partial exam completion
- Optional chaining prevents errors on missing data

---

## [1.3.0] - 2025-07-15

### Added
- **Dark/Light Theme Support** - Toggle via sun/moon icon in header
- **Theme Persistence** - Browser localStorage maintains user preference
- **System Preference Detection** - Auto-detects prefers-color-scheme (light/dark)
- **Theme Script** - Inline head script prevents flash of unstyled content (FOUC)

### Changed
- **CSS Custom Properties** - Color scheme uses CSS variables for theme consistency
- **Responsive Theme Colors** - All components support both light and dark modes

---

## [1.2.0] - 2025-07-10

### Added
- **Progressive Batch Loading** - Questions load in batches as user progresses
- **Auto-Prefetch** - Automatically loads next batch when 4 questions from end
- **Reduced Latency** - Lower initial response time (2-5 seconds for first batch)
- **Scalable Questions** - 100+ questions per exam through batching

### Technical Details
- Batch size: 2 questions per request
- Auto-prefetch trigger: currentIndex ≥ questions.length - 4
- Timeout retry: 4-second delay with retryTick state

---

## [1.1.0] - 2025-07-05

### Added
- **Multiple Question Types** - Single-select MCQ, multi-select, true/false, scenario-based
- **Realistic Exam Formats** - Matches actual Microsoft certification exam structure
- **Question Validation** - Ensures all questions meet structural requirements
- **Detailed Explanations** - Each question includes explanation and source link

### Changed
- **Question Structure** - Enhanced with type, skillArea, sourceUrl fields
- **OpenRouter Integration** - Improved prompt engineering for better question quality

---

## [1.0.0] - 2025-06-30

### Added
- **Core Application** - Microsoft Certification Exam Simulator MVP
- **Exam Selector** - Searchable interface for selecting certification exams
- **Exam Session** - Timed practice exam with real Microsoft exam experience
- **LLM Question Generation** - AI-powered questions via OpenRouter API
- **Scoring System** - Pass/fail results with 70% threshold (Microsoft standard)
- **Vercel Deployment** - Production deployment with GitHub integration
- **API Endpoints**:
  - `GET /api/exams` - Returns exam catalog
  - `POST /api/generate-questions` - Generates question batches
  - `GET /api/exams/catalog` - Dynamic exam catalog endpoint

### Initial Features
- 14 Microsoft certifications (Azure, Microsoft 365, Security, Data & AI)
- 100+ questions per exam
- Timed sessions (45-120 minutes)
- Instant scoring and feedback
- Dark/light theme support
- Responsive UI

### Technical Stack
- Next.js 14 (App Router)
- React 18
- OpenRouter LLM API
- Vercel serverless deployment
- localStorage for persistence

---

## Format

This file follows the [Keep a Changelog](https://keepachangelog.com/) format.

### Sections
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Fixed** - Bug fixes
- **Removed** - Removed features
- **Deprecated** - Soon-to-be removed features
- **Security** - Security improvements

---

**Latest Version:** v1.6.0  
**Release Date:** August 5, 2025  
**Status:** Production Ready
