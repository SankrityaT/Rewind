import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Step 1: Fetch all memories directly
    const { supermemoryClient, USER_CONTAINER_TAG } = await import('@/lib/supermemory');
    
    const response: any = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 100,
    });

    let memories = response?.results || response?.memories || response?.data || [];
    if (Array.isArray(response)) {
      memories = response;
    }

    // Map to include content from summary field
    memories = memories.map((m: any) => ({
      ...m,
      content: m.summary || m.content || '',
    }));

    // Step 2: Filter and rank memories based on relevance to the query
    const relevantMemories = await findRelevantMemories(message, memories);

    // Step 3: Generate AI response using Groq
    const aiResponse = await generateAIResponse(message, relevantMemories);

    return NextResponse.json({
      response: aiResponse,
      memories: relevantMemories.slice(0, 5), // Return top 5 most relevant memories
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function findRelevantMemories(query: string, memories: any[]) {
  // Simple keyword-based relevance scoring
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter(word => word.length > 3);

  const scoredMemories = memories.map(memory => {
    let score = 0;
    const contentLower = (memory.content || '').toLowerCase();
    const subjectLower = (memory.metadata?.subject || '').toLowerCase();
    const companyLower = (memory.metadata?.company || '').toLowerCase();
    const typeLower = (memory.metadata?.type || '').toLowerCase();

    // Check for keyword matches
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 3;
      if (subjectLower.includes(keyword)) score += 5;
      if (companyLower.includes(keyword)) score += 5;
      if (typeLower.includes(keyword)) score += 2;
    });

    // Boost for specific query patterns
    if (queryLower.includes('interview') && memory.metadata?.type === 'interview') {
      score += 10;
    }
    if (queryLower.includes('study') && memory.metadata?.type === 'study') {
      score += 10;
    }
    if (queryLower.includes('meeting') && memory.metadata?.type === 'meeting') {
      score += 10;
    }

    // Boost for high priority
    if (memory.metadata?.priority === 'high') {
      score += 2;
    }

    // Strongly boost unreviewed items - these need attention!
    if (!memory.metadata?.reviewed) {
      score += 5; // Always prioritize unreviewed
      
      // Extra boost if query is about what to focus on
      if (queryLower.includes('focus') || queryLower.includes('review') || 
          queryLower.includes('study') || queryLower.includes('prepare') ||
          queryLower.includes('what should')) {
        score += 5;
      }
    }
    
    // Penalize already reviewed items when user asks what to focus on
    if (memory.metadata?.reviewed && 
        (queryLower.includes('focus') || queryLower.includes('review') || 
         queryLower.includes('what should'))) {
      score -= 3;
    }

    return { ...memory, relevanceScore: score };
  });

  // Sort by relevance score and return top matches
  return scoredMemories
    .filter(m => m.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function generateAIResponse(query: string, relevantMemories: any[]) {
  if (relevantMemories.length === 0) {
    return "Hmm, I couldn't find anything in your memories about that. Maybe you haven't saved anything on this topic yet? Feel free to add some memories and ask me again!";
  }

  // Prepare context for AI
  const memoryContext = relevantMemories.slice(0, 5).map((memory, idx) => {
    return `Memory ${idx + 1}:
Type: ${memory.metadata?.type || 'unknown'}
${memory.metadata?.subject ? `Subject: ${memory.metadata.subject}` : ''}
${memory.metadata?.company ? `Company: ${memory.metadata.company}` : ''}
Priority: ${memory.metadata?.priority || 'medium'}
Reviewed: ${memory.metadata?.reviewed ? 'Yes' : 'No'}
Created: ${memory.createdAt}
Content: ${memory.content?.substring(0, 400)}...
`;
  }).join('\n\n');

  const systemPrompt = `You are Recall, a personal AI assistant that helps users understand their saved memories. You're warm, conversational, and insightful - like talking to a smart friend.

CRITICAL RULES:
- 🚨 NEVER suggest reviewing memories that are already reviewed. Only suggest reviewing unreviewed memories. This is the most important rule.
- NEVER say "I found X memories" or list counts
- NEVER list memories one by one
- Talk naturally like you're texting a friend
- Synthesize information - tell them what the memories mean together
- Point out patterns, trends, or gaps you notice
- Give specific, actionable advice when asked what to focus on
- Be encouraging but honest
- Keep it SHORT (2-3 sentences max)
- Start directly with insights, not preamble

Examples of GOOD responses:
- "You've been crushing it on system design - load balancing, microservices, caching are all covered. Database sharding seems to be the missing piece though."
- "Your algorithm skills look solid, but I noticed you haven't touched behavioral prep yet. That's usually what trips people up in interviews."
- "Looks like you've got a strong foundation in databases and web dev. The unreviewed stuff is mostly system design - might be time to revisit those."

Examples of BAD responses (NEVER do this):
- "I found 40 notes about System Design and Databases. Looks like 22 haven't been reviewed yet - might want to check those out!"
- "Here are the relevant memories I found: [list]"
- "Based on your memories, you have studied: [list]"`;

  const userPrompt = `User Question: ${query}

Their Memories:
${memoryContext}

Give a natural, conversational response that synthesizes these memories. Talk like a friend, not a search engine. Be direct and insightful.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "Sorry, I'm having trouble thinking right now. Can you try asking again?";
  } catch (error) {
    console.error('Groq API error:', error);
    
    // Better fallback response
    const memoryCount = relevantMemories.length;
    const subjects = [...new Set(relevantMemories.map(m => m.metadata?.subject))].filter(Boolean);
    const unreviewed = relevantMemories.filter(m => !m.metadata?.reviewed).length;
    
    if (subjects.length > 0) {
      let response = `I found ${memoryCount} ${memoryCount === 1 ? 'note' : 'notes'} about ${subjects.slice(0, 2).join(' and ')}`;
      if (unreviewed > 0) {
        response += `. Looks like ${unreviewed} ${unreviewed === 1 ? 'hasn\'t' : 'haven\'t'} been reviewed yet - might want to check those out!`;
      } else {
        response += `. You've reviewed all of these, nice work!`;
      }
      return response;
    }
    
    return `Found ${memoryCount} relevant ${memoryCount === 1 ? 'memory' : 'memories'} for you. Check them out below!`;
  }
}
