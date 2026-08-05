import { EXAMS } from './exams-config.js';

// Smart caching configuration
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours (refreshes 2x/day for changes)
const CACHE_KEY_PREFIX = 'microsoft_exam_outline_';
const CACHE_CATALOG_KEY = 'microsoft_exam_catalog_';
const CATALOG_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for exam catalog
const OUTLINE_CACHE = new Map(); // In-memory cache with TTL

/**
 * Cache entry format:
 * {
 *   data: {...outline data...},
 *   timestamp: Date.now(),
 *   source: 'microsoft_learn' | 'hardcoded' | 'generated'
 * }
 */

function getCacheKey(examCode) {
  return `${CACHE_KEY_PREFIX}${examCode}`;
}

/**
 * Fetches and caches all Microsoft certification exams dynamically using browser automation
 * Discovers new exams automatically without code changes
 * Uses Playwright to render JavaScript-heavy Microsoft Learn pages
 */
async function fetchAllExamsFromMicrosoftLearn() {
  let browser = null;
  try {
    // Try to use Playwright for browser-based scraping
    let chromium;
    try {
      ({ chromium } = require('playwright'));
    } catch (e) {
      console.warn('Playwright not available, falling back to regex parsing');
      return null;
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--single-process', '--no-sandbox'],
    });

    const context = await browser.createContext();
    const page = await context.newPage();

    // Set a timeout for the entire operation (15 seconds max)
    page.setDefaultTimeout(15000);

    console.log('🌐 Fetching Microsoft certifications page with browser...');

    // Navigate to certifications page
    await page.goto('https://learn.microsoft.com/en-us/certifications/', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });

    // Wait for certification cards to load
    await page.waitForSelector('[data-test-id*="cert"], .certification-card, [class*="certification"]', {
      timeout: 10000,
    }).catch(() => null); // Don't fail if selector not found

    // Extract all exam codes from the page
    const exams = await page.evaluate(() => {
      // Helper function (must be defined in browser context)
      function isValidCode(code) {
        const validPrefixes = /^(AZ|SC|MB|MS|MD|DP|AI|PL|DA|FA|AB|DE|ADS|OD|PD)(-\d{3,4})$/;
        return validPrefixes.test(code);
      }

      const exams = [];
      const seenCodes = new Set();

      // Strategy 1: Look for exam codes in visible text
      const bodyText = document.body.innerText;
      const codePattern = /\b([A-Z]{2}-\d{3,4})\b/g;
      const matches = bodyText.matchAll(codePattern);

      for (const match of matches) {
        const code = match[1];
        if (isValidCode(code) && !seenCodes.has(code)) {
          seenCodes.add(code);
          exams.push({ code });
        }
      }

      // Strategy 2: Look for links containing exam codes
      const links = document.querySelectorAll('a[href*="/certifications/"]');
      for (const link of links) {
        const href = link.getAttribute('href');
        const title = link.innerText || link.getAttribute('title') || '';

        // Try to extract code from URL or title
        const codeMatch = (href + ' ' + title).match(/\b([A-Z]{2}-\d{3,4})\b/);
        if (codeMatch && isValidCode(codeMatch[1]) && !seenCodes.has(codeMatch[1])) {
          seenCodes.add(codeMatch[1]);
          exams.push({
            code: codeMatch[1],
            title: title.trim() || 'Microsoft Certification',
            url: href,
          });
        }
      }

      // Strategy 3: Look for exam cards with data attributes
      const cards = document.querySelectorAll('[class*="card"], [class*="cert"], [role="article"]');
      for (const card of cards) {
        const text = card.innerText;
        const codeMatch = text.match(/\b([A-Z]{2}-\d{3,4})\b/);
        if (codeMatch && !seenCodes.has(codeMatch[1])) {
          seenCodes.add(codeMatch[1]);
          exams.push({
            code: codeMatch[1],
            title: text.split('\n')[0] || 'Microsoft Certification',
          });
        }
      }

      return exams;
    });

    await context.close();

    if (exams && exams.length > 0) {
      console.log(`✓ Browser discovered ${exams.length} Microsoft certifications`);

      // Convert to full exam objects
      const fullExams = exams.map(exam => ({
        code: exam.code,
        title: exam.title || getTitleForExamCode(exam.code),
        category: categorizeExamCode(exam.code),
        duration: getDefaultDuration(exam.code),
        passingScore: 700,
      }));

      return fullExams;
    }

    return null;
  } catch (error) {
    console.error('Error fetching exams with browser:', error.message);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Silently close
      }
    }
  }
}

/**
 * Parses certification page to extract all exam codes and metadata
 * Handles multiple page formats
 */
function parseAllExamsFromPage(html) {
  const exams = [];

  // Pattern 1: Look for exam code patterns like "AZ-900", "SC-500", "MB-910", etc.
  // These appear in links, titles, and metadata
  const examCodePattern = /\b([A-Z]{2}-\d{3,4})\b/g;
  const matches = html.matchAll(examCodePattern);
  const examCodes = new Set();

  for (const match of matches) {
    const code = match[1];
    // Filter to valid Microsoft exam codes (prefix check)
    if (isValidMicrosoftExamCode(code)) {
      examCodes.add(code);
    }
  }

  // Pattern 2: Look for certification links with exam codes
  // Format: href="/en-us/certifications/azure-fundamentals/" or similar
  const linkPattern = /href="\/[^"]*certifications\/[^"]*"/gi;
  const linkMatches = html.matchAll(linkPattern);

  for (const match of linkMatches) {
    const url = match[0].replace('href="', '').replace('"', '');
    // Try to extract exam info from the URL
    const examInfo = extractExamFromUrl(url);
    if (examInfo && examInfo.code && isValidMicrosoftExamCode(examInfo.code)) {
      examCodes.add(examInfo.code);
    }
  }

  // Convert to exam objects
  for (const code of examCodes) {
    const examData = {
      code,
      title: getTitleForExamCode(code),
      category: categorizeExamCode(code),
      duration: getDefaultDuration(code),
      passingScore: 700, // Microsoft standard
    };
    exams.push(examData);
  }

  // Sort by code for consistency
  exams.sort((a, b) => a.code.localeCompare(b.code));

  return exams.length > 0 ? exams : null;
}

/**
 * Validates if a code follows Microsoft exam code format
 */
function isValidMicrosoftExamCode(code) {
  // Valid prefixes: AZ, SC, MB, MS, MD, DP, AI, PL, DA, FA, AB, and others
  const validPrefixes = /^(AZ|SC|MB|MS|MD|DP|AI|PL|DA|FA|AB|DE|ADS|MS|OD|PD|MB|MD|MD|MS|SC|MS|MD|MS|MS|SC|MS|MD|MS|SC|MS|MD|MS|SC)(-\d{3,4})$/;
  return validPrefixes.test(code);
}

/**
 * Extracts exam code from URL pattern
 */
function extractExamFromUrl(url) {
  try {
    const parts = url.toLowerCase().split('/');
    const certIndex = parts.findIndex(p => p === 'certifications');
    if (certIndex !== -1 && certIndex < parts.length - 1) {
      const slug = parts[certIndex + 1];
      // Try to find exam code pattern in URL
      const match = slug.match(/([a-z]{2}-\d{3,4})/);
      if (match) {
        return { code: match[1].toUpperCase(), slug };
      }
    }
  } catch (e) {
    // Silently fail
  }
  return null;
}

/**
 * Gets a friendly title for exam code (will be overridden by actual data)
 */
function getTitleForExamCode(code) {
  const titleMap = {
    'AB-100': 'Agentic AI Business Solutions Architect',
    'AB-901': 'Agentic AI Business Solutions Fundamentals',
  };

  if (titleMap[code]) {
    return titleMap[code];
  }

  // Fallback: Generate from code
  const parts = code.split('-');
  const prefix = parts[0];
  const prefixMap = {
    'AZ': 'Azure',
    'SC': 'Security',
    'MB': 'Dynamics 365',
    'MS': 'Microsoft 365',
    'MD': 'Microsoft 365',
    'DP': 'Data & AI',
    'AI': 'Data & AI',
    'PL': 'Power Platform',
    'DA': 'Power BI',
    'FA': 'Fabric',
    'AB': 'Agentic AI',
  };

  return `Microsoft ${prefixMap[prefix] || 'Certification'} Exam ${code}`;
}

/**
 * Categorizes exam based on prefix
 */
function categorizeExamCode(code) {
  const categoryMap = {
    'AZ': 'Azure',
    'SC': 'Security',
    'MB': 'Dynamics 365',
    'MS': 'Microsoft 365',
    'MD': 'Microsoft 365',
    'DP': 'Data & AI',
    'AI': 'Data & AI',
    'PL': 'Power Platform & BI',
    'DA': 'Power Platform & BI',
    'FA': 'Power Platform & BI',
    'AB': 'Data & AI',
  };

  const prefix = code.split('-')[0];
  return categoryMap[prefix] || 'Other';
}

/**
 * Gets default duration based on exam code
 */
function getDefaultDuration(code) {
  // Fundamentals exams (usually -900 suffix) are 45-60 minutes
  if (code.endsWith('-900') || code.endsWith('-901')) {
    return 45;
  }
  // Most other exams are 120 minutes
  return 120;
}

function getCachedOutline(examCode) {
  const key = getCacheKey(examCode);
  const cached = OUTLINE_CACHE.get(key);

  if (!cached) return null;

  // Check if cache is still valid
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    OUTLINE_CACHE.delete(key); // Expire old cache
    return null;
  }

  return cached.data;
}

function getCachedCatalog() {
  const cached = OUTLINE_CACHE.get(CACHE_CATALOG_KEY);

  if (!cached) return null;

  // Check if cache is still valid (24 hours)
  const age = Date.now() - cached.timestamp;
  if (age > CATALOG_CACHE_DURATION) {
    OUTLINE_CACHE.delete(CACHE_CATALOG_KEY);
    return null;
  }

  return cached.data;
}

function setCachedCatalog(exams) {
  OUTLINE_CACHE.set(CACHE_CATALOG_KEY, {
    data: exams,
    timestamp: Date.now(),
    source: 'microsoft_learn_discovery',
  });
}

function setCachedOutline(examCode, outline, source = 'microsoft_learn') {
  const key = getCacheKey(examCode);
  OUTLINE_CACHE.set(key, {
    data: outline,
    timestamp: Date.now(),
    source: source,
  });
}

/**
 * Map of exam codes to Microsoft Learn URLs
 * Format: https://learn.microsoft.com/en-us/certifications/EXAM-CODE-SLUG
 * These are live, official Microsoft Learn certification pages.
 * Covers all 40 exams in the simulator.
 */
const EXAM_URLS = {
  // Azure (9 exams)
  'AZ-900': 'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/',
  'AZ-104': 'https://learn.microsoft.com/en-us/certifications/azure-administrator/',
  'AZ-305': 'https://learn.microsoft.com/en-us/certifications/azure-solutions-architect/',
  'AZ-400': 'https://learn.microsoft.com/en-us/certifications/azure-devops-engineer-expert/',
  'AZ-500': 'https://learn.microsoft.com/en-us/certifications/azure-security-engineer/',
  'AZ-700': 'https://learn.microsoft.com/en-us/certifications/azure-network-engineer-associate/',
  'AZ-720': 'https://learn.microsoft.com/en-us/certifications/azure-support-engineer-specialist/',
  'AZ-2002': 'https://learn.microsoft.com/en-us/certifications/microsoft-cloud-sustainability/',
  'AZ-140': 'https://learn.microsoft.com/en-us/certifications/windows-virtual-desktop-specialist/',

  // Microsoft 365 (6 exams)
  'MS-900': 'https://learn.microsoft.com/en-us/certifications/microsoft-365-fundamentals/',
  'MD-102': 'https://learn.microsoft.com/en-us/certifications/endpoint-administrator/',
  'MS-102': 'https://learn.microsoft.com/en-us/certifications/microsoft-365-enterprise-administrator/',
  'MS-100': 'https://learn.microsoft.com/en-us/certifications/microsoft-365-administrator/',
  'MS-101': 'https://learn.microsoft.com/en-us/certifications/microsoft-365-mobility-security/',
  'MD-100': 'https://learn.microsoft.com/en-us/certifications/windows-client/',

  // Security (4 exams)
  'SC-900': 'https://learn.microsoft.com/en-us/certifications/security-compliance-identity-fundamentals/',
  'SC-200': 'https://learn.microsoft.com/en-us/certifications/security-operations-analyst/',
  'SC-100': 'https://learn.microsoft.com/en-us/certifications/cybersecurity-architect-expert/',
  'SC-300': 'https://learn.microsoft.com/en-us/certifications/identity-access-administrator/',

  // Data & AI (5 exams)
  'DP-900': 'https://learn.microsoft.com/en-us/certifications/azure-data-fundamentals/',
  'DP-203': 'https://learn.microsoft.com/en-us/certifications/data-engineer/',
  'AI-900': 'https://learn.microsoft.com/en-us/certifications/azure-ai-fundamentals/',
  'AI-901': 'https://learn.microsoft.com/en-us/certifications/azure-ai-engineer/',
  'DP-600': 'https://learn.microsoft.com/en-us/certifications/data-analyst/',

  // Dynamics 365 (9 exams)
  'MB-910': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-fundamentals-eos/',
  'MB-920': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-fundamentals-finance-operations/',
  'MB-240': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-field-service-functional-consultant/',
  'MB-260': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-marketing-functional-consultant/',
  'MB-280': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-finance-functional-consultant/',
  'MB-300': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-core-finance-operations/',
  'MB-330': 'https://learn.microsoft.com/en-us/certifications/dynamics-365-supply-chain-management-functional-consultant/',
  'MB-810': 'https://learn.microsoft.com/en-us/certifications/business-central-functional-consultant/',
  'MB-820': 'https://learn.microsoft.com/en-us/certifications/business-central-developer/',

  // Power Platform & BI (7 exams)
  'PL-900': 'https://learn.microsoft.com/en-us/certifications/power-platform-fundamentals/',
  'PL-100': 'https://learn.microsoft.com/en-us/certifications/power-apps-maker/',
  'PL-200': 'https://learn.microsoft.com/en-us/certifications/power-platform-functional-consultant/',
  'PL-400': 'https://learn.microsoft.com/en-us/certifications/power-apps-developer/',
  'DA-100': 'https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst/',
  'DA-101': 'https://learn.microsoft.com/en-us/certifications/power-bi-data-engineer/',
  'PL-600': 'https://learn.microsoft.com/en-us/certifications/power-platform-solution-architect-expert/',
};

/**
 * Fetches and parses a Microsoft Learn exam page
 * Extracts skills measured, topics, and other metadata
 */
async function fetchExamFromMicrosoftLearn(examCode) {
  const url = EXAM_URLS[examCode];
  if (!url) {
    console.warn(`No Microsoft Learn URL mapped for exam ${examCode}`);
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ExamSimulator/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${examCode} from Microsoft Learn:`, response.status);
      return null;
    }

    const html = await response.text();
    return parseExamPage(examCode, html);
  } catch (error) {
    console.error(`Error fetching ${examCode} from Microsoft Learn:`, error);
    return null;
  }
}

/**
 * Parses Microsoft Learn exam page HTML to extract skills and topics
 * Handles multiple page format variations used by Microsoft Learn
 */
function parseExamPage(examCode, html, examMetadata = null) {
  const exam = examMetadata || EXAMS.find(e => e.code === examCode);
  if (!exam) return null;

  // Remove script and style tags to clean up HTML
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Look for skills section using multiple patterns
  // Pattern 1: h2/h3 with "skills" and "measured" (case insensitive)
  let skillsMatch = cleanHtml.match(/(?:<h[23][^>]*>|^)\s*skills[^<]*measured[^<]*<\/h[23]>([\s\S]*?)(?=<h[23]|$)/i);

  // Pattern 2: More flexible pattern for "Skills" section
  if (!skillsMatch) {
    skillsMatch = cleanHtml.match(/<h[23][^>]*>\s*skills[^<]*<\/h[23]>([\s\S]*?)(?=<h[23]|<div[^>]*class="[^"]*nav|$)/i);
  }

  if (!skillsMatch) {
    console.warn(`Could not find skills section for ${examCode}`);
    return null;
  }

  const skillsSection = skillsMatch[0];
  const skills = [];

  // Parse skills - handle multiple formats:
  // Format 1: "Skill Name (XX%)" with percentage
  // Format 2: "- Skill Name" in bullet list
  // Format 3: "**Skill Name**" in markdown
  // Format 4: <li>Skill Name</li> in HTML list

  // Remove HTML tags for easier parsing
  const cleanSkillsText = skillsSection
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Extract lines that likely contain skills
  const lines = cleanSkillsText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and common non-skill text
    if (
      trimmed.length < 5 ||
      trimmed.toLowerCase().includes('download') ||
      trimmed.toLowerCase().includes('exam') ||
      trimmed.toLowerCase().includes('measur') ||
      trimmed.toLowerCase().includes('see also')
    ) {
      continue;
    }

    // Try to extract skill name and weight
    // Pattern: "Skill Name (XX%)" or "- Skill Name (XX%)"
    const match = trimmed.match(/^[\s•\-*]*(.+?)\s*\(?(\d+)\s*%?\)??\s*$/);

    if (match) {
      const skillName = match[1].trim();
      const weight = match[2] ? parseInt(match[2]) : null;

      // Validate skill name
      if (skillName.length > 3 && skillName.length < 200) {
        skills.push({
          area: skillName,
          weight: weight || 25,
          topics: [
            `Understand ${skillName.toLowerCase()}`,
            `Apply ${skillName.toLowerCase()} in practice`,
            `Troubleshoot and optimize ${skillName.toLowerCase()}`,
          ],
        });
      }
    }
  }

  // If parsing found no skills, return null to trigger fallback
  if (skills.length === 0) {
    console.warn(`No skills extracted for ${examCode}, will use fallback`);
    return null;
  }

  // Remove duplicates
  const uniqueSkills = [];
  const seen = new Set();
  for (const skill of skills) {
    if (!seen.has(skill.area.toLowerCase())) {
      seen.add(skill.area.toLowerCase());
      uniqueSkills.push(skill);
    }
  }

  // Normalize weights if they don't add up to 100
  const totalWeight = uniqueSkills.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight > 0 && totalWeight !== 100) {
    const scale = 100 / totalWeight;
    uniqueSkills.forEach(s => (s.weight = Math.round(s.weight * scale)));
  }

  // Ensure we have at least 3 skills
  if (uniqueSkills.length < 3) {
    console.warn(`Only ${uniqueSkills.length} skills found for ${examCode}, using fallback`);
    return null;
  }

  return {
    code: examCode,
    title: exam.title,
    duration: exam.duration,
    passingScore: exam.passingScore,
    skills: uniqueSkills,
    source: 'microsoft_learn',
  };
}

export async function fetchExamCatalog() {
  // Dynamic exam discovery: Check cache → Fetch from Microsoft Learn → Fallback to hardcoded
  // This means new Microsoft exams are automatically discovered without code changes!

  // Step 1: Check cache (24-hour TTL for exam catalog)
  const cached = getCachedCatalog();
  if (cached) {
    console.log(`✓ Using cached exam catalog (${cached.length} exams)`);
    return cached;
  }

  // Step 2: Try to fetch all exams dynamically from Microsoft Learn
  const discovered = await fetchAllExamsFromMicrosoftLearn();
  if (discovered && discovered.length > 0) {
    console.log(`✓ Discovered ${discovered.length} exams from Microsoft Learn`);
    setCachedCatalog(discovered);
    return discovered;
  }

  // Step 3: Fallback to hardcoded exam list from exams-config.js
  console.log(`⚠ Using hardcoded exam list (${EXAMS.length} exams)`);
  setCachedCatalog(EXAMS);
  return EXAMS;
}

/**
 * Generates a generic outline for exams without specific data
 * This creates a realistic skills outline based on the exam code and category
 */
function generateGenericOutline(examCode, exam) {
  const categoryOutlines = {
    'Azure': [
      'Cloud concepts and services',
      'Architecture and design patterns',
      'Implementation and configuration',
      'Monitoring, troubleshooting, and optimization',
    ],
    'Dynamics 365': [
      'Core Dynamics 365 concepts',
      'Configuration and customization',
      'Implementation and deployment',
      'Administration and security',
    ],
    'Power Platform & BI': [
      'Power Platform overview',
      'Canvas and model-driven apps',
      'Automation and integrations',
      'Analytics and reporting',
    ],
    'Microsoft 365': [
      'Microsoft 365 services overview',
      'Cloud concepts and architecture',
      'Security and compliance',
      'Administration and deployment',
    ],
    'Security': [
      'Security concepts and principles',
      'Identity and access management',
      'Threat detection and response',
      'Compliance and governance',
    ],
    'Data & AI': [
      'Data fundamentals',
      'Data architecture and solutions',
      'Analytics and intelligence',
      'Machine learning and AI',
    ],
  };

  const skillAreas = categoryOutlines[exam.category] || categoryOutlines['Azure'];

  return {
    code: examCode,
    title: exam.title,
    duration: exam.duration,
    passingScore: exam.passingScore,
    skills: skillAreas.map((area, idx) => ({
      area,
      weight: 25,
      topics: [
        `Understand ${area.toLowerCase()}`,
        `Apply ${area.toLowerCase()} in practice`,
        `Troubleshoot and optimize related to ${area.toLowerCase()}`,
      ],
    })),
  };
}

export async function fetchExamOutline(examCode) {
  // Fetch the full "Skills measured" outline for a specific exam
  // Strategy: Check cache → Fetch from Microsoft Learn → Fallback to hardcoded → Auto-generate
  // Cache expires every 12 hours to catch Microsoft updates 2x/day

  // Get exam metadata from dynamic catalog or hardcoded list
  let exam = EXAMS.find(e => e.code === examCode);

  if (!exam) {
    // Try to get from dynamic catalog
    const catalog = await fetchExamCatalog();
    exam = catalog.find(e => e.code === examCode);
  }

  if (!exam) {
    return null;
  }

  // Step 1: Check in-memory cache (fast, avoids unnecessary requests)
  const cached = getCachedOutline(examCode);
  if (cached) {
    console.log(`✓ Using cached outline for ${examCode}`);
    return cached;
  }

  // Step 2: Try to fetch from Microsoft Learn documentation (live data)
  const liveOutline = await fetchExamFromMicrosoftLearn(examCode);
  if (liveOutline) {
    console.log(`✓ Fetched ${examCode} skills from Microsoft Learn`);
    setCachedOutline(examCode, liveOutline, 'microsoft_learn');
    return liveOutline;
  }

  // Step 2: Fallback to specific hardcoded outlines for major exams
  const outlines = {
    // AB exams - Agentic AI Business
    'AB-100': {
      code: 'AB-100',
      title: 'Agentic AI Business Solutions Architect',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Understand generative AI fundamentals and Copilot capabilities',
          weight: 25,
          topics: [
            'Generative AI concepts and capabilities',
            'Microsoft 365 Copilot overview',
            'How Copilot keeps information private and secure',
            'Understand context and how it affects responses',
          ],
        },
        {
          area: 'Design and implement AI-powered business solutions',
          weight: 35,
          topics: [
            'Assess business needs for AI implementation',
            'Design AI workflows and automation',
            'Implement Microsoft 365 Copilot in business processes',
            'Configure agents and custom copilot experiences',
          ],
        },
        {
          area: 'Manage responsible AI and data governance',
          weight: 20,
          topics: [
            'Identify responsible AI principles',
            'Manage data protection and compliance',
            'Mitigate AI risks (fabrication, prompt injection)',
            'Implement verification and human review processes',
          ],
        },
        {
          area: 'Optimize AI adoption and business outcomes',
          weight: 20,
          topics: [
            'Measure AI impact on productivity',
            'Drive AI adoption across organization',
            'Train users on effective AI usage',
            'Monitor and improve AI solution performance',
          ],
        },
      ],
    },
    'AB-730': {
      code: 'AB-730',
      title: 'AI Business Professional',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Understand generative AI fundamentals',
          weight: 25,
          topics: [
            'Generative AI concepts and capabilities',
            'How Copilot works and keeps data secure',
            'Difference between chat and agent experiences',
            'When to use Agent Store vs creating new agents',
          ],
        },
        {
          area: 'Manage prompts and conversations by using AI',
          weight: 40,
          topics: [
            'Create effective prompts in Microsoft 365 Copilot',
            'Select appropriate resources to reference',
            'Manage conversations and chat history',
            'Save, schedule, and share prompts',
            'Configure and use Microsoft 365 Copilot agents',
          ],
        },
        {
          area: 'Draft and analyze business content using AI',
          weight: 25,
          topics: [
            'Create documents from prompts using Copilot',
            'Generate management summaries and analyses',
            'Use Copilot Pages for team collaboration',
            'Leverage AI for meetings and note-taking',
          ],
        },
        {
          area: 'Identify responsible AI practices',
          weight: 10,
          topics: [
            'Recognize common AI risks',
            'Verify AI-generated content accuracy',
            'Protect sensitive data when using AI',
            'Understand data protection restrictions',
          ],
        },
      ],
    },
    'AB-901': {
      code: 'AB-901',
      title: 'Agentic AI Business Solutions Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Understand generative AI and Copilot basics',
          weight: 25,
          topics: [
            'What is generative AI and how it works',
            'Microsoft 365 Copilot overview',
            'How Copilot maintains data security and privacy',
            'Understand prompts, agents, and conversations',
          ],
        },
        {
          area: 'Use AI to improve business productivity',
          weight: 35,
          topics: [
            'Create effective prompts for Copilot',
            'Leverage Copilot in Microsoft 365 apps',
            'Generate business documents and communications',
            'Use AI for data analysis and insights',
          ],
        },
        {
          area: 'Implement responsible AI practices',
          weight: 25,
          topics: [
            'Identify responsible AI principles',
            'Recognize AI risks and limitations',
            'Verify AI-generated information',
            'Protect sensitive information in AI interactions',
          ],
        },
        {
          area: 'Understand AI implementation considerations',
          weight: 15,
          topics: [
            'Plan AI adoption in organizations',
            'Address common AI concerns',
            'Measure AI impact on business outcomes',
            'Support users in AI adoption',
          ],
        },
      ],
    },
    'AZ-900': {
      code: 'AZ-900',
      title: 'Microsoft Azure Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Describe cloud concepts',
          weight: 25,
          topics: [
            'Identify benefits and considerations of using cloud services',
            'Identify cloud service types',
          ],
        },
        {
          area: 'Describe Azure architecture and services',
          weight: 35,
          topics: [
            'Describe the core architectural components of Azure',
            'Describe Azure compute and networking services',
            'Describe Azure storage services',
            'Describe Azure identity, access, and security',
          ],
        },
        {
          area: 'Describe Azure management and governance',
          weight: 40,
          topics: [
            'Describe cost management in Azure',
            'Describe features and tools in Azure for governance and compliance',
            'Describe monitoring and reporting options in Azure',
          ],
        },
      ],
    },
    'AZ-104': {
      code: 'AZ-104',
      title: 'Microsoft Azure Administrator',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Manage Azure identities and governance',
          weight: 20,
          topics: ['Manage Azure AD users and groups', 'Manage Azure subscriptions and governance'],
        },
        {
          area: 'Implement and manage storage',
          weight: 15,
          topics: ['Configure Azure Storage accounts', 'Manage data in Azure Storage'],
        },
        {
          area: 'Deploy and manage Azure compute resources',
          weight: 35,
          topics: ['Configure VMs', 'Manage VMs', 'Configure Azure App Service'],
        },
        {
          area: 'Configure and manage virtual networking',
          weight: 30,
          topics: ['Configure virtual networks', 'Secure network access'],
        },
      ],
    },
    'MS-900': {
      code: 'MS-900',
      title: 'Microsoft 365 Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Understand cloud concepts',
          weight: 10,
          topics: ['Understanding cloud computing', 'Cloud deployment models'],
        },
        {
          area: 'Understand Microsoft 365 services',
          weight: 35,
          topics: ['Microsoft 365 productivity solutions', 'Microsoft 365 business management solutions'],
        },
        {
          area: 'Understand Microsoft 365 security and compliance',
          weight: 35,
          topics: ['Describe compliance and data protection', 'Describe security capabilities'],
        },
      ],
    },
    'SC-900': {
      code: 'SC-900',
      title: 'Microsoft Security, Compliance, and Identity Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Describe security and compliance concepts',
          weight: 30,
          topics: ['Security concepts', 'Compliance concepts'],
        },
        {
          area: 'Describe Microsoft security solutions',
          weight: 35,
          topics: ['Microsoft Entra ID', 'Microsoft Defender', 'Microsoft Sentinel'],
        },
        {
          area: 'Describe Microsoft compliance solutions',
          weight: 35,
          topics: ['Compliance management', 'Information protection and governance'],
        },
      ],
    },
    'DP-900': {
      code: 'DP-900',
      title: 'Microsoft Azure Data Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Describe core data concepts',
          weight: 25,
          topics: ['Explore data roles and services', 'Identify data formats'],
        },
        {
          area: 'Describe data analytics in Azure',
          weight: 25,
          topics: ['Analyze data in Azure', 'Visualize data in Power BI'],
        },
        {
          area: 'Describe relational data in Azure',
          weight: 25,
          topics: ['Explore Azure SQL', 'Explore Azure database services'],
        },
        {
          area: 'Describe non-relational data in Azure',
          weight: 25,
          topics: ['Explore Azure Cosmos DB', 'Explore Azure Table Storage'],
        },
      ],
    },
    'AI-900': {
      code: 'AI-900',
      title: 'Microsoft Azure AI Fundamentals',
      duration: 45,
      passingScore: 700,
      skills: [
        {
          area: 'Describe AI workloads and considerations',
          weight: 25,
          topics: ['Identify machine learning scenarios', 'Identify responsible AI principles'],
        },
        {
          area: 'Describe Azure Machine Learning',
          weight: 25,
          topics: ['Describe Azure Machine Learning capabilities', 'Describe features for AI engineers'],
        },
        {
          area: 'Describe Azure OpenAI Service',
          weight: 25,
          topics: ['Describe generative AI models', 'Describe capabilities of Azure OpenAI'],
        },
        {
          area: 'Describe Azure AI Services',
          weight: 25,
          topics: ['Vision services', 'Language services', 'Decision services'],
        },
      ],
    },
    'AI-901': {
      code: 'AI-901',
      title: 'Microsoft Azure AI Engineer',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Design and implement AI solutions',
          weight: 25,
          topics: ['Design AI solutions', 'Implement AI solutions'],
        },
        {
          area: 'Implement computer vision solutions',
          weight: 25,
          topics: ['Analyze images', 'Implement video analysis'],
        },
        {
          area: 'Implement natural language processing solutions',
          weight: 25,
          topics: ['Analyze text', 'Implement conversational AI'],
        },
        {
          area: 'Implement knowledge mining and document intelligence',
          weight: 25,
          topics: ['Implement search solutions', 'Implement document analysis'],
        },
      ],
    },
    'AZ-305': {
      code: 'AZ-305',
      title: 'Designing Microsoft Azure Infrastructure Solutions',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Design a compute solution',
          weight: 20,
          topics: ['Design for Azure virtual machines', 'Design for app service'],
        },
        {
          area: 'Design a network solution',
          weight: 20,
          topics: ['Design hybrid connectivity', 'Design secure access'],
        },
        {
          area: 'Design data storage solutions',
          weight: 20,
          topics: ['Design relational data solutions', 'Design non-relational data solutions'],
        },
        {
          area: 'Design business continuity solutions',
          weight: 20,
          topics: ['Design backup and recovery', 'Design high availability'],
        },
        {
          area: 'Design monitoring solutions',
          weight: 20,
          topics: ['Design logging and monitoring', 'Design alerting solutions'],
        },
      ],
    },
    'AZ-400': {
      code: 'AZ-400',
      title: 'Microsoft Azure DevOps Engineer Expert',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Configure processes and communications',
          weight: 10,
          topics: ['Configure team collaboration', 'Configure process templates'],
        },
        {
          area: 'Design and implement source control',
          weight: 20,
          topics: ['Design Git branching strategy', 'Implement pull request policies'],
        },
        {
          area: 'Develop a security and compliance plan',
          weight: 10,
          topics: ['Implement Azure security', 'Manage identity and permissions'],
        },
        {
          area: 'Manage build infrastructure',
          weight: 15,
          topics: ['Manage build agents', 'Design build pipelines'],
        },
        {
          area: 'Implement continuous deployment',
          weight: 20,
          topics: ['Design release pipelines', 'Implement deployment strategies'],
        },
        {
          area: 'Implement continuous feedback',
          weight: 15,
          topics: ['Implement monitoring and alerting', 'Analyze metrics and logs'],
        },
        {
          area: 'Design a DevOps toolchain',
          weight: 10,
          topics: ['Integrate tools', 'Design deployment gates'],
        },
      ],
    },
    'AZ-500': {
      code: 'AZ-500',
      title: 'Microsoft Azure Security Engineer',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Manage Azure subscriptions and governance',
          weight: 15,
          topics: ['Manage role-based access', 'Implement Azure policies'],
        },
        {
          area: 'Implement platform protection',
          weight: 20,
          topics: ['Implement Azure DDoS protection', 'Implement web application firewall'],
        },
        {
          area: 'Manage security operations',
          weight: 25,
          topics: ['Configure Azure Sentinel', 'Manage alerts and incidents'],
        },
        {
          area: 'Secure compute, storage, and databases',
          weight: 20,
          topics: ['Configure security for VMs', 'Secure storage accounts'],
        },
        {
          area: 'Implement application security',
          weight: 10,
          topics: ['Implement Key Vault', 'Implement application security'],
        },
        {
          area: 'Manage identity and access',
          weight: 10,
          topics: ['Manage Azure AD', 'Implement MFA and conditional access'],
        },
      ],
    },
    'AZ-700': {
      code: 'AZ-700',
      title: 'Designing and Implementing Microsoft Azure Networking Solutions',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Design and implement core networking infrastructure',
          weight: 20,
          topics: ['Design virtual networks', 'Design DNS solutions'],
        },
        {
          area: 'Design and implement hybrid networking',
          weight: 15,
          topics: ['Design VPN solutions', 'Design ExpressRoute solutions'],
        },
        {
          area: 'Design and implement Azure load balancing',
          weight: 15,
          topics: ['Design load balancing solutions', 'Implement traffic management'],
        },
        {
          area: 'Design and implement network security',
          weight: 25,
          topics: ['Implement firewalls', 'Design DDoS protection'],
        },
        {
          area: 'Design and implement private access to Azure services',
          weight: 15,
          topics: ['Design Private Link solutions', 'Implement service endpoints'],
        },
        {
          area: 'Implement application delivery network solutions',
          weight: 10,
          topics: ['Configure Azure CDN', 'Implement Front Door'],
        },
      ],
    },
    'SC-200': {
      code: 'SC-200',
      title: 'Microsoft Security Operations Analyst',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Mitigate threats using Microsoft Defender for Endpoint',
          weight: 25,
          topics: ['Analyze alerts', 'Investigate endpoints'],
        },
        {
          area: 'Mitigate threats using Microsoft Defender for Cloud',
          weight: 20,
          topics: ['Configure security policies', 'Respond to threats'],
        },
        {
          area: 'Mitigate threats using Microsoft Sentinel',
          weight: 35,
          topics: ['Investigate incidents', 'Create detection rules'],
        },
        {
          area: 'Manage security operations',
          weight: 20,
          topics: ['Configure threat intelligence', 'Manage security alerts'],
        },
      ],
    },
    'DP-203': {
      code: 'DP-203',
      title: 'Data Engineer',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Design and implement data storage',
          weight: 20,
          topics: ['Design data lakes', 'Implement data warehouses'],
        },
        {
          area: 'Design and develop data processing',
          weight: 40,
          topics: ['Develop batch solutions', 'Develop streaming solutions'],
        },
        {
          area: 'Secure data',
          weight: 15,
          topics: ['Implement data encryption', 'Implement row-level security'],
        },
        {
          area: 'Monitor and optimize data storage and processing',
          weight: 15,
          topics: ['Monitor data solutions', 'Optimize data operations'],
        },
        {
          area: 'Support data science and analytics workloads',
          weight: 10,
          topics: ['Support ML workloads', 'Support analytics workloads'],
        },
      ],
    },
    'MD-102': {
      code: 'MD-102',
      title: 'Endpoint Administrator',
      duration: 120,
      passingScore: 700,
      skills: [
        {
          area: 'Deploy and manage devices',
          weight: 20,
          topics: ['Enroll devices', 'Configure device profiles'],
        },
        {
          area: 'Manage apps and data',
          weight: 20,
          topics: ['Deploy applications', 'Manage data protection'],
        },
        {
          area: 'Manage identities and access',
          weight: 20,
          topics: ['Implement Azure AD', 'Manage conditional access'],
        },
        {
          area: 'Maintain security and compliance',
          weight: 20,
          topics: ['Implement security baselines', 'Manage compliance'],
        },
        {
          area: 'Deploy updates',
          weight: 10,
          topics: ['Manage Windows updates', 'Manage driver updates'],
        },
        {
          area: 'Monitor and troubleshoot devices',
          weight: 10,
          topics: ['Monitor device health', 'Troubleshoot device issues'],
        },
      ],
    },
  };

  // Step 3: Use specific hardcoded outline if available
  if (outlines[examCode]) {
    console.log(`✓ Using hardcoded outline for ${examCode}`);
    setCachedOutline(examCode, outlines[examCode], 'hardcoded');
    return outlines[examCode];
  }

  // Step 4: Auto-generate a realistic outline for any new exam
  // This means you can add exams to exams-config.js without touching this code!
  console.log(`⚠ Generating outline for ${examCode} (not on Microsoft Learn or hardcoded)`);
  const generated = generateGenericOutline(examCode, exam);
  if (generated) {
    setCachedOutline(examCode, generated, 'generated');
  }
  return generated;
}

/**
 * Clears cache for a specific exam or all exams
 * Useful for forcing a refresh if Microsoft Learn updates
 * Usage: Call this after Microsoft updates an exam
 */
export function clearExamCache(examCode = null) {
  if (examCode) {
    const key = getCacheKey(examCode);
    OUTLINE_CACHE.delete(key);
    console.log(`✓ Cleared cache for ${examCode}`);
  } else {
    OUTLINE_CACHE.clear();
    console.log(`✓ Cleared cache for all exams`);
  }
}
