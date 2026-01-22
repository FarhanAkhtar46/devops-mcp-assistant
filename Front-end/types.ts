
export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'past' | 'current' | 'future';
}

export interface SprintInsights {
  velocity: number;
  capacity: number;
  progress: number;
  completedItems: number;
  totalItems: number;
  burndownData: { day: string; remaining: number; ideal: number }[];
  memberCapacity: { name: string; capacity: number; assigned: number }[];
}

export interface PRAnalytics {
  totalPRs: number;
  avgReviewTime: number;
  approvalRate: number;
  statusCounts: { approved: number; inReview: number; blocked: number };
  trends: { date: string; count: number; reviewTime: number }[];
  developerPatterns: { name: string; prs: number; avgComments: number }[];
}

export interface PlanningRecommendation {
  itemId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
  estimatedEffort: number;
}

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  trend: number;
  unit?: string;
}

export interface QueryResponse {
  answer: string;
  groundingLinks?: { title: string; url: string }[];
  timestamp: string;
}
