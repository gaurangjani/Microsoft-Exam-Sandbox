const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = 'microsoft_exams_cache';

export async function fetchExamCatalog() {
  // Server-side seed data (cached via Vercel edge cache)
  // TODO: Replace with actual Microsoft Learn MCP integration when available
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
  return exams;
}

// Cache is handled server-side via Vercel edge cache (see /api/exams)
// No client-side caching needed

export async function fetchExamOutline(examCode) {
  // Fetch the full "Skills measured" outline for a specific exam
  // This is called only when the user selects an exam
  // TODO: Integrate with Microsoft Learn MCP to fetch live skills outline

  const outlines = {
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
  };

  return outlines[examCode] || null;
}
