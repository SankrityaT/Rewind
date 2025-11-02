import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient } from '@/lib/supermemory';

// PATCH - Update specific memory (e.g., mark as reviewed)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    console.log(`[API] Updating memory ${id}:`, body);

    // Fetch current memory to merge metadata
    const currentMemory: any = await supermemoryClient.memories.get(id);
    
    const updatedMetadata = {
      ...currentMemory.metadata,
      ...body,
    };

    // If marking as reviewed, add timestamp
    if (body.reviewed === true) {
      updatedMetadata.lastReviewed = new Date().toISOString();
    }

    const response = await supermemoryClient.memories.update(id, {
      content: currentMemory.content || currentMemory.summary,
      metadata: updatedMetadata,
    });

    console.log(`[API] Memory ${id} updated successfully`);

    return NextResponse.json({ memory: response });
  } catch (error: any) {
    console.error('Error updating memory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update memory' },
      { status: 500 }
    );
  }
}
