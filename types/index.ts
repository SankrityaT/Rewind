export type MemoryType = 'study' | 'interview' | 'meeting' | 'personal';

export interface MemoryMetadata {
  type: MemoryType;
  subject?: string;
  company?: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  reviewed: boolean;
  lastReviewed?: string;
  retentionScore?: number;
  deadline?: string;
  tags?: string[];
}

export interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  createdAt: string;
  updatedAt: string;
  similarity?: number;
}

export interface Alert {
  id: string;
  type: 'urgent' | 'attention' | 'ontrack';
  title: string;
  description: string;
  action?: string;
  actionLink?: string;
  memoryId?: string;
}

export interface Pattern {
  type: 'time' | 'gap' | 'consistency' | 'performance';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export interface DashboardStats {
  alerts: Alert[];
  patterns: Pattern[];
  weeklyInsights: {
    bestStudyTime?: string;
    activityTrend?: string;
    retentionRate?: number;
  };
}
