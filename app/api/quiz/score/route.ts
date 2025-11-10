import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { memoryId, correct } = await req.json();

    if (!memoryId) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    // Fetch the memory
    const { supermemoryClient } = await import('@/lib/supermemory');
    const { getUserContainerTag } = await import('@/lib/auth');

    const containerTag = await getUserContainerTag();

    const response: any = await supermemoryClient.memories.list({
      containerTags: [containerTag],
      limit: 200,
    });

    let memories = response?.results || response?.memories || response?.data || [];
    if (Array.isArray(response)) {
      memories = response;
    }

    const memory = memories.find((m: any) => m.id === memoryId);

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Calculate new retention score
    const currentScore = memory.metadata?.retentionScore || 0;
    const attempts = memory.metadata?.quizAttempts || 0;
    const correctAttempts = memory.metadata?.correctAttempts || 0;

    const newCorrectAttempts = correct ? correctAttempts + 1 : correctAttempts;
    const newAttempts = attempts + 1;
    const newRetentionScore = newCorrectAttempts / newAttempts;

    // Update memory with new score
    await supermemoryClient.memories.update(memoryId, {
      metadata: {
        ...memory.metadata,
        retentionScore: newRetentionScore,
        quizAttempts: newAttempts,
        correctAttempts: newCorrectAttempts,
        lastQuizzed: new Date().toISOString(),
        reviewed: true, // Mark as reviewed when quizzed
        lastReviewed: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      retentionScore: newRetentionScore,
      attempts: newAttempts,
    });
  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}
