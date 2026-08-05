# Changelog

All notable changes to the Microsoft Certification Exam Simulator are documented in this file.

## [1.6.0] - 2025-08-05

### Initial Release

This is the first production release of the Microsoft Certification Exam Simulator.

### Features
- **40+ Microsoft Certification Exams** - Support for all major Microsoft exam families:
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

- **Curriculum-Aligned Question Generation** - AI-generated questions using OpenRouter LLM, aligned with official Microsoft Learn curriculum for each exam family

- **Exam-Family Constraints** - Question generation respects exam-family boundaries to prevent topic cross-contamination (e.g., AB exams only generate Agentic AI questions, not Azure)

- **Progressive Question Batching** - 100+ questions per exam loaded in batches (2 questions per request) with auto-prefetch as user progresses

- **Realistic Exam Experience**:
  - Timed sessions (45-120 minutes per exam type)
  - Multiple question formats: single-select MCQ, multi-select, true/false, scenario-based
  - Pass/fail scoring with 70% threshold (Microsoft standard)
  - Category breakdown by skill area
  - Detailed review with explanations and Microsoft Learn source links
  - End Exam Early option with early exit scoring

- **Dark/Light Theme Support** - Toggle with localStorage persistence, auto-detects system preference

- **Smart Caching** - 12-hour TTL for exam outlines, 24-hour for exam catalog

- **Rate Limiting** - 25 requests/minute per IP to prevent abuse

- **Google Analytics Integration** - Track app usage and visitor metrics

- **Security**:
  - API keys use environment variables only (never hardcoded)
  - Input validation on all LLM output
  - URL validation (only microsoft.com links allowed)
  - No unauthenticated admin endpoints
  - Vercel HTTPS (automatic)

### Tech Stack
- **Frontend**: Next.js 14, React 18, CSS (responsive design)
- **Backend**: Next.js API Routes (serverless on Vercel)
- **LLM**: OpenRouter (configurable model, default gpt-3.5-turbo)
- **Hosting**: Vercel (auto-deploy on push)
- **Database**: None (stateless architecture)

### Known Limitations
- Correct answers visible in DevTools (acceptable for practice tool)
- No user authentication (can be added later if needed)
- LLM question quality depends on model selection and prompt tuning
- Session data not persisted (no database)

### Future Enhancements
- User accounts and progress tracking
- Custom question filters (by skill, difficulty)
- Leaderboards and performance analytics
- Offline mode with cached questions
- Mobile app (React Native)
- CAPTCHA for rate limit protection
- Answer encryption for high-stakes use cases

---

**Status**: Production Ready ✅  
**Latest Version**: v1.6.0  
**Release Date**: August 5, 2025  
**License**: MIT
