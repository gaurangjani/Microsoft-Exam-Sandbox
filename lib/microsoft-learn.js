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
      code: 'AZ-305',
      title: 'Designing Microsoft Azure Infrastructure Solutions',
      category: 'Azure',
      duration: 120,
      passingScore: 700,
    },
    {
      code: 'AZ-400',
      title: 'Microsoft Azure DevOps Engineer Expert',
      category: 'Azure',
      duration: 120,
      passingScore: 700,
    },
    {
      code: 'AZ-500',
      title: 'Microsoft Azure Security Engineer',
      category: 'Azure',
      duration: 120,
      passingScore: 700,
    },
    {
      code: 'AZ-700',
      title: 'Designing and Implementing Microsoft Azure Networking Solutions',
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
      code: 'MD-102',
      title: 'Endpoint Administrator',
      category: 'Microsoft 365',
      duration: 120,
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
      code: 'SC-200',
      title: 'Microsoft Security Operations Analyst',
      category: 'Security',
      duration: 120,
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
      code: 'DP-203',
      title: 'Data Engineer',
      category: 'Data & AI',
      duration: 120,
      passingScore: 700,
    },
    {
      code: 'AI-900',
      title: 'Microsoft Azure AI Fundamentals',
      category: 'Data & AI',
      duration: 45,
      passingScore: 700,
    },
    {
      code: 'AI-901',
      title: 'Microsoft Azure AI Engineer',
      category: 'Data & AI',
      duration: 120,
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

  return outlines[examCode] || null;
}
