/**
 * Centralized Exam Configuration
 * This file contains all Microsoft certification exams available in the simulator.
 * To add new exams: Add to the appropriate category array below.
 * No code changes needed—just update this config file!
 */

export const EXAM_CATEGORIES = {
  AZURE: 'Azure',
  MICROSOFT_365: 'Microsoft 365',
  SECURITY: 'Security',
  DATA_AI: 'Data & AI',
  DYNAMICS: 'Dynamics 365',
  POWER_BI: 'Power Platform & BI',
};

export const EXAMS = [
  // ========== AZURE (9 exams) ==========
  {
    code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals',
    category: EXAM_CATEGORIES.AZURE,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'AZ-104',
    title: 'Microsoft Azure Administrator',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-305',
    title: 'Designing Microsoft Azure Infrastructure Solutions',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-400',
    title: 'Microsoft Azure DevOps Engineer Expert',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-500',
    title: 'Microsoft Azure Security Engineer',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-700',
    title: 'Designing and Implementing Microsoft Azure Networking Solutions',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-720',
    title: 'Azure Support Engineer Specialist',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AZ-2002',
    title: 'Microsoft Cloud for Sustainability',
    category: EXAM_CATEGORIES.AZURE,
    duration: 90,
    passingScore: 700,
  },
  {
    code: 'AZ-140',
    title: 'Configuring and Operating Windows Virtual Desktop on Microsoft Azure',
    category: EXAM_CATEGORIES.AZURE,
    duration: 120,
    passingScore: 700,
  },

  // ========== MICROSOFT 365 (6 exams) ==========
  {
    code: 'MS-900',
    title: 'Microsoft 365 Fundamentals',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'MD-102',
    title: 'Endpoint Administrator',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MS-102',
    title: 'Microsoft 365 Administrator Expert',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MS-100',
    title: 'Microsoft 365 Administrator',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MS-101',
    title: 'Microsoft 365 Mobility and Security',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MD-100',
    title: 'Windows Client Administrator',
    category: EXAM_CATEGORIES.MICROSOFT_365,
    duration: 120,
    passingScore: 700,
  },

  // ========== SECURITY (4 exams) ==========
  {
    code: 'SC-900',
    title: 'Microsoft Security, Compliance, and Identity Fundamentals',
    category: EXAM_CATEGORIES.SECURITY,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'SC-200',
    title: 'Microsoft Security Operations Analyst',
    category: EXAM_CATEGORIES.SECURITY,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'SC-100',
    title: 'Microsoft Cybersecurity Architect Expert',
    category: EXAM_CATEGORIES.SECURITY,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'SC-300',
    title: 'Microsoft Identity and Access Administrator',
    category: EXAM_CATEGORIES.SECURITY,
    duration: 120,
    passingScore: 700,
  },

  // ========== DATA & AI (5 exams) ==========
  {
    code: 'DP-900',
    title: 'Microsoft Azure Data Fundamentals',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'DP-203',
    title: 'Data Engineer on Microsoft Azure',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AI-900',
    title: 'Microsoft Azure AI Fundamentals',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'AI-901',
    title: 'Microsoft Azure AI Engineer',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'DP-600',
    title: 'Implementing Analytics Solutions Using Microsoft Fabric',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 120,
    passingScore: 700,
  },

  // ========== DYNAMICS 365 (9 exams) ==========
  {
    code: 'MB-910',
    title: 'Microsoft Dynamics 365 Fundamentals',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 60,
    passingScore: 700,
  },
  {
    code: 'MB-920',
    title: 'Dynamics 365 Finance and Operations Apps Developer Associate',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-240',
    title: 'Dynamics 365 Field Service Functional Consultant',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-260',
    title: 'Dynamics 365 Marketing Functional Consultant',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-280',
    title: 'Dynamics 365 Finance Functional Consultant',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-300',
    title: 'Microsoft Dynamics 365 Core Finance and Operations',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-330',
    title: 'Dynamics 365 Supply Chain Management Functional Consultant',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-810',
    title: 'Dynamics 365 Business Central Business Analyst',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'MB-820',
    title: 'Dynamics 365 Business Central Developer',
    category: EXAM_CATEGORIES.DYNAMICS,
    duration: 120,
    passingScore: 700,
  },

  // ========== POWER PLATFORM & BI (7 exams) ==========
  {
    code: 'PL-900',
    title: 'Microsoft Power Platform Fundamentals',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 60,
    passingScore: 700,
  },
  {
    code: 'PL-100',
    title: 'Microsoft Power Platform App Creator Associate',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'PL-200',
    title: 'Microsoft Power Platform Functional Consultant Associate',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'PL-400',
    title: 'Microsoft Power Platform Developer Associate',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'DA-100',
    title: 'Analyzing Data with Power BI',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'DA-101',
    title: 'Designing and Implementing Semantic Models using Power BI',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'PL-600',
    title: 'Power Platform Solution Architect Expert',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'FA-100',
    title: 'Microsoft Fabric Analytics Engineer Associate',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'FA-200',
    title: 'Microsoft Fabric Data Engineer Associate',
    category: EXAM_CATEGORIES.POWER_BI,
    duration: 120,
    passingScore: 700,
  },

  // ========== DATA & AI - Additional (2 exams) ==========
  {
    code: 'AB-100',
    title: 'Microsoft Certified: Agentic AI Business Solutions Architect',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 120,
    passingScore: 700,
  },
  {
    code: 'AB-901',
    title: 'Microsoft Certified: Agentic AI Business Solutions Fundamentals',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'AB-730',
    title: 'AI Business Professional',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 45,
    passingScore: 700,
  },
  {
    code: 'AB-731',
    title: 'AI Business Solutions Analyst',
    category: EXAM_CATEGORIES.DATA_AI,
    duration: 120,
    passingScore: 700,
  },
];

export function getExamByCode(code) {
  return EXAMS.find(exam => exam.code === code);
}

export function getExamsByCategory(category) {
  return EXAMS.filter(exam => exam.category === category);
}

export function getAllCategories() {
  return Object.values(EXAM_CATEGORIES);
}

export function getExamStats() {
  const stats = {};
  Object.values(EXAM_CATEGORIES).forEach(category => {
    stats[category] = getExamsByCategory(category).length;
  });
  return stats;
}
