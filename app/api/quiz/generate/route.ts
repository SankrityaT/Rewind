import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { subject, count = 5 } = await req.json();

    // Fetch memories
    const { supermemoryClient, USER_CONTAINER_TAG } = await import('@/lib/supermemory');
    
    const response: any = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 100,
    });

    let memories = response?.results || response?.memories || response?.data || [];
    if (Array.isArray(response)) {
      memories = response;
    }

    // Filter by subject if specified
    if (subject && subject !== 'all') {
      memories = memories.filter((m: any) => m.metadata?.subject === subject);
    }

    // Map to include content from summary field
    memories = memories.map((m: any) => ({
      ...m,
      content: m.summary || m.content || '',
    }));

    if (memories.length === 0) {
      return NextResponse.json({ error: 'No memories found for this subject' }, { status: 404 });
    }

    // Generate quiz questions using AI
    const questions = await generateQuizQuestions(memories, count);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}

async function generateQuizQuestions(memories: any[], count: number) {
  // Select random memories for quiz
  const selectedMemories = memories
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, memories.length));

  const questions = [];

  for (const memory of selectedMemories) {
    const prompt = `Based on this learning note, create ONE quiz question that tests understanding:

CONTENT: ${memory.content}

Generate a question and answer in this EXACT format:
Q: [Your question here]
A: [Your answer here]

Make the question specific and test actual understanding, not just memorization. Keep both question and answer concise.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse Q: and A: format
      const qMatch = response.match(/Q:\s*([\s\S]+?)(?=A:|$)/);
      const aMatch = response.match(/A:\s*([\s\S]+?)$/);

      if (qMatch && aMatch) {
        questions.push({
          id: `q-${memory.id}`,
          question: qMatch[1].trim(),
          answer: aMatch[1].trim(),
          memoryId: memory.id,
          subject: memory.metadata?.subject,
          type: memory.metadata?.type,
        });
      }
    } catch (error) {
      console.error('Error generating question for memory:', memory.id, error);
      // Fallback question
      questions.push({
        id: `q-${memory.id}`,
        question: `What did you learn about ${memory.metadata?.subject || 'this topic'}?`,
        answer: memory.content.substring(0, 200),
        memoryId: memory.id,
        subject: memory.metadata?.subject,
        type: memory.metadata?.type,
      });
    }
  }

  return questions;
}
