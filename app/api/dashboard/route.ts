import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient, USER_CONTAINER_TAG } from '@/lib/supermemory';
import { PatternDetector } from '@/lib/patterns';
import { Memory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Fetch all memories for the user
    const response = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 200,
    });

    // Transform to our Memory type
    const memories: Memory[] = (response as any).results?.map((m: any) => ({
      id: m.id,
      content: m.content,
      metadata: m.metadata || {},
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: m.updatedAt || new Date().toISOString(),
    })) || [];

    // Run pattern detection
    const detector = new PatternDetector(memories);
    const dashboardStats = detector.generateDashboardStats();

    return NextResponse.json({
      ...dashboardStats,
      totalMemories: memories.length,
    } as any);
  } catch (error: any) {
    console.error('Error generating dashboard:', error);
    
    // Return empty dashboard instead of error to prevent UI break
    return NextResponse.json({
      alerts: [],
      patterns: [],
      weeklyInsights: {
        activityTrend: 'stable',
        retentionRate: 0,
        bestStudyTime: null,
      },
      totalMemories: 0,
    } as any);
  }
}
