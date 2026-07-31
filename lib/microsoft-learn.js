const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = 'microsoft_exams_cache';

export async function fetchExamCatalog() {
  // Check in-memory cache first (for this session)
  const cached = getCachedCatalog();
  if (cached) {
    return cached;
  }

  try {
    // Fetch from Microsoft Learn MCP or public endpoint
    // For now, return seed data; will integrate with MCP when available
    const exams = [
      {
        code: 'AZ-900',
        title: 'Microsoft Azure Fundamentals',
        category: 'Azure',
        duration: 45,
        passingScore: 700,
      },
      {
        code: 'AZ-104',
        title: 'Microsoft Azure Administrator',
        category: 'Azure',
        duration: 120,
        passingScore: 700,
      },
      {
        code: 'AZ-305',
        title: 'Designing Microsoft Azure Infrastructure Solutions',
        category: 'Azure',
        duration: 120,
        passingScore: 700,
      },
      {
        code: 'MS-900',
        title: 'Microsoft 365 Fundamentals',
        category: 'Microsoft 365',
        duration: 45,
        passingScore: 700,
      },
      {
        code: 'SC-900',
        title: 'Microsoft Security, Compliance, and Identity Fundamentals',
        category: 'Security',
        duration: 45,
        passingScore: 700,
      },
      {
        code: 'DP-900',
        title: 'Microsoft Azure Data Fundamentals',
        category: 'Data & AI',
        duration: 45,
        passingScore: 700,
      },
      {
        code: 'AI-900',
        title: 'Microsoft Azure AI Fundamentals',
        category: 'Data & AI',
        duration: 45,
        passingScore: 700,
      },
    ];

    // TODO: Replace with actual Microsoft Learn MCP integration
    // const exams = await fetchFromMicrosoftLearnMCP();

    setCachedCatalog(exams);
    return exams;
  } catch (error) {
    console.error('Error fetching exam catalog:', error);
    throw new Error('Failed to load exam catalog. Please try again.');
  }
}

function getCachedCatalog() {
  if (typeof window === 'undefined') return null; // Server-side, no localStorage

  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return data;
}

function setCachedCatalog(exams) {
  if (typeof window === 'undefined') return; // Server-side, skip caching

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data: exams,
      timestamp: Date.now(),
    })
  );
}

export async function fetchExamOutline(examCode) {
  // Fetch the full "Skills measured" outline for a specific exam
  // This is called only when the user selects an exam
  // TODO: Integrate with Microsoft Learn MCP to fetch live skills outline

  const outlines = {
    'AZ-900': {
      code: 'AZ-900',
      title: 'Microsoft Azure Fundamentals',
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
  };

  return outlines[examCode] || null;
}
