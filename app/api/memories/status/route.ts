import { NextResponse } from 'next/server';
import { supermemoryClient, USER_CONTAINER_TAG } from '@/lib/supermemory';

export async function GET() {
  try {
    // Fetch all memories to check their status
    const response: any = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 200,
    });

    const memories = response?.results || response?.memories || [];

    // Count by status
    const statusCounts = memories.reduce((acc: any, memory: any) => {
      const status = memory.status || 'completed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate totals
    const total = memories.length;
    const completed = statusCounts.completed || 0;
    const queued = statusCounts.queued || 0;
    const extracting = statusCounts.extracting || 0;
    const chunking = statusCounts.chunking || 0;
    const embedding = statusCounts.embedding || 0;
    const indexing = statusCounts.indexing || 0;
    const failed = statusCounts.failed || 0;

    return NextResponse.json({
      total,
      completed,
      queued,
      extracting,
      chunking,
      embedding,
      indexing,
      failed,
      statusCounts,
    });
  } catch (error: any) {
    console.error('Error fetching memory status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
