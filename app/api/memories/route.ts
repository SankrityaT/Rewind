import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient, USER_CONTAINER_TAG } from '@/lib/supermemory';

// GET - List all memories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch from Supermemory using list - it DOES return content
    const response: any = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit,
    });

    // Extract memories from search response
    let memories = response?.results || response?.memories || response?.data || [];
    
    // If response is directly an array
    if (Array.isArray(response)) {
      memories = response;
    }

    // Map Supermemory response - content is in 'summary' field
    memories = memories.map((m: any) => ({
      ...m,
      content: m.summary || m.content || '', // Use summary as content
    }));

    // Log to debug content issue
    console.log('[API/memories] Fetched', memories.length, 'memories');
    if (memories.length > 0) {
      console.log('[API/memories] First memory sample:', {
        id: memories[0].id,
        hasContent: Boolean(memories[0].content),
        contentLength: memories[0].content?.length ?? 0,
        status: memories[0].status,
        metadata: memories[0].metadata,
      });
    }

    // Client-side filtering by type if needed
    if (type) {
      memories = memories.filter((m: any) => m.metadata?.type === type);
    }

    return NextResponse.json({ memories });
  } catch (error: any) {
    console.error('Error fetching memories:', error);
    // Return empty array instead of error to prevent UI breaks
    return NextResponse.json({ memories: [] });
  }
}

// POST - Add new memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, metadata, customId } = body;

    console.log('Adding memory to Supermemory:', { content: content.substring(0, 50), metadata });

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const response = await supermemoryClient.memories.add({
      content,
      containerTags: [USER_CONTAINER_TAG],
      metadata: {
        ...metadata,
        date: metadata.date || new Date().toISOString(),
        reviewed: metadata.reviewed || false,
      },
      customId,
    });

    console.log('Supermemory response:', response);

    return NextResponse.json({ memory: response });
  } catch (error: any) {
    console.error('Error adding memory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add memory' },
      { status: 500 }
    );
  }
}

// PUT - Update memory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, metadata } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    const response = await supermemoryClient.memories.update(id, {
      content,
      metadata,
    });

    return NextResponse.json({ memory: response });
  } catch (error: any) {
    console.error('Error updating memory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update memory' },
      { status: 500 }
    );
  }
}

// DELETE - Delete memory
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    await supermemoryClient.memories.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting memory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
