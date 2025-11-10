import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient } from '@/lib/supermemory';
import { getUserContainerTag } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const containerTag = await getUserContainerTag();
    const body = await request.json();
    const { query, limit = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [Search API] Query:', query, '| Limit:', limit);

    const response = await supermemoryClient.search.execute({
      q: query,
      containerTags: [containerTag],
      limit,
    });

    console.log('📦 [Search API] Raw results count:', response.results?.length || 0);
    
    // Transform search results to include proper IDs and content
    const results = (response.results || []).map((r: any) => {
      // Extract content from chunks
      const content = r.chunks?.[0]?.content || r.content || r.title || '';
      
      return {
        id: r.documentId, // Use documentId as the memory ID
        documentId: r.documentId,
        content,
        summary: content, // Use same content as summary
        title: r.title,
        metadata: r.metadata || {},
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        similarity: r.score || r.similarity || 0,
        score: r.score || r.similarity || 0,
      };
    });

    // Sort by similarity descending
    const sortedResults = [...results].sort((a: any, b: any) => {
      return (b.score || 0) - (a.score || 0);
    });

    console.log(`✅ [Search API] Returning ${sortedResults.length} results with documentIds as IDs`);
    if (sortedResults.length > 0) {
      console.log(`  First result: ID=${sortedResults[0].id}, score=${sortedResults[0].score}`);
    }

    return NextResponse.json({ results: sortedResults, totalFound: sortedResults.length });
  } catch (error: any) {
    console.error('❌ [Search API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search memories' },
      { status: 500 }
    );
  }
}
