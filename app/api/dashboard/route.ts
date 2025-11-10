import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient } from '@/lib/supermemory';
import { getUserContainerTag } from '@/lib/auth';
import { PatternDetector } from '@/lib/patterns';
import { Memory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const containerTag = await getUserContainerTag();
    // Fetch all memories for the user
    const response: any = await supermemoryClient.memories.list({
      containerTags: [containerTag],
      limit: 200,
    });

    // Handle different response formats
    let rawMemories = response?.results || response?.memories || response?.data || [];
    if (Array.isArray(response)) {
      rawMemories = response;
    }

    console.log('[Dashboard] Fetched memories:', rawMemories.length);
    if (rawMemories.length > 0) {
      console.log('[Dashboard] First memory:', rawMemories[0]);
    }

    // Transform to our Memory type
    const memories: Memory[] = rawMemories.map((m: any) => ({
      id: m.id,
      content: m.summary || m.content || '',
      metadata: m.metadata || {},
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: m.updatedAt || new Date().toISOString(),
    }));

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
