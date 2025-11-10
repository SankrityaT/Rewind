import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient } from '@/lib/supermemory';
import { getUserContainerTag } from '@/lib/auth';

// POST - Upload text/document content as memories
export async function POST(request: NextRequest) {
  try {
    const containerTag = await getUserContainerTag();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string || 'upload';
    const title = formData.get('title') as string || file?.name || 'Untitled';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // Split content into chunks if it's too large (>2000 chars)
    const chunks = splitIntoChunks(content, 2000);
    const memories = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const memoryTitle = chunks.length > 1
        ? `${title} (Part ${i + 1}/${chunks.length})`
        : title;

      const memory = await supermemoryClient.memories.add({
        content: chunk,
        metadata: {
          type: 'study',
          subject: extractSubject(title),
          priority: 'medium',
          reviewed: false,
          source: source,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileType: file.type,
          tags: [containerTag],
        },
      });

      memories.push(memory);
    }

    console.log(`[API] Uploaded ${memories.length} memory chunks from ${file.name}`);

    return NextResponse.json({
      success: true,
      memoriesCreated: memories.length,
      memories: memories
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Helper function to split content into manageable chunks
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Helper to extract subject from filename
function extractSubject(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Common subjects
  const subjects = ['math', 'physics', 'chemistry', 'biology', 'cs', 'history',
                    'english', 'programming', 'algorithms', 'database', 'machine learning'];

  const lowerName = nameWithoutExt.toLowerCase();
  for (const subject of subjects) {
    if (lowerName.includes(subject)) {
      return subject.charAt(0).toUpperCase() + subject.slice(1);
    }
  }

  return 'General';
}
