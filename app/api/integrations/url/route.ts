import { NextRequest, NextResponse } from 'next/server';
import { supermemoryClient } from '@/lib/supermemory';
import { getUserContainerTag } from '@/lib/auth';

// POST - Import content from URL
export async function POST(request: NextRequest) {
  try {
    const containerTag = await getUserContainerTag();
    const body = await request.json();
    const { url, title, source } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch content from URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RewindBot/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    let content = await response.text();

    // Basic HTML cleanup if it's an HTML page
    if (response.headers.get('content-type')?.includes('text/html')) {
      content = extractTextFromHTML(content);
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'No content found at URL' },
        { status: 400 }
      );
    }

    // Split into chunks if needed
    const chunks = splitIntoChunks(content, 2000);
    const memories = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const memoryTitle = title
        ? (chunks.length > 1 ? `${title} (Part ${i + 1}/${chunks.length})` : title)
        : `Web Content from ${new URL(url).hostname}`;

      const memory = await supermemoryClient.memories.add({
        content: chunk,
        metadata: {
          type: 'study',
          subject: 'General',
          priority: 'medium',
          reviewed: false,
          source: source || 'url',
          sourceUrl: url,
          importedAt: new Date().toISOString(),
          tags: [containerTag],
        },
      });

      memories.push(memory);
    }

    console.log(`[API] Imported ${memories.length} memory chunks from ${url}`);

    return NextResponse.json({
      success: true,
      memoriesCreated: memories.length,
      memories: memories,
    });
  } catch (error: any) {
    console.error('Error importing from URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import from URL' },
      { status: 500 }
    );
  }
}

// Helper to extract text from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Helper function to split content into manageable chunks
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
