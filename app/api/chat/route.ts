import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Gemini with correct API version
const gemini = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], autoSave = true } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Step 1: Fetch all memories directly
    const { supermemoryClient } = await import('@/lib/supermemory');
    const { getUserContainerTag } = await import('@/lib/auth');

    const containerTag = await getUserContainerTag();

    const response: any = await supermemoryClient.memories.list({
      containerTags: [containerTag],
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

    // Check if user wants a quiz
    const messageLower = message.toLowerCase();
    const isQuizRequest = messageLower.includes('quiz') || 
                          messageLower.includes('test me') || 
                          messageLower.includes('review') && (messageLower.includes('quick') || messageLower.includes('let'));

    if (isQuizRequest) {
      // Generate quiz questions
      const quiz = await generateQuizFromMessage(message, memories);
      return NextResponse.json({
        response: quiz.intro,
        quiz: quiz.questions,
        isQuiz: true,
      });
    }

    // Step 2: Filter and rank memories based on relevance to the query AND conversation context
    const relevantMemories = await findRelevantMemories(message, memories, history);

    // Step 3: Generate AI response using Groq with conversation history
    const aiResponse = await generateAIResponse(message, relevantMemories, history);

    // Step 4: Auto-save conversation as memory if it contains learnings
    let savedMemory = null;
    if (autoSave) {
      savedMemory = await autoSaveConversation(message, aiResponse, supermemoryClient, containerTag);
    }

    return NextResponse.json({
      response: aiResponse,
      memories: relevantMemories.slice(0, 5), // Return top 5 most relevant memories
      savedMemory, // Return the saved memory if created
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

async function findRelevantMemories(query: string, memories: any[], history: any[] = []) {
  // Extract keywords from current query AND recent conversation context
  const queryLower = query.toLowerCase();
  
  // Get keywords from last 3 messages in history for context
  const contextKeywords = history
    .slice(-3)
    .map(msg => msg.content.toLowerCase())
    .join(' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Changed from 3 to 2 to catch "buy", etc.
  
  const keywords = [...new Set([
    ...queryLower.split(/\s+/).filter(word => word.length > 2), // Changed from 3 to 2
    ...contextKeywords
  ])];

  const scoredMemories = memories.map(memory => {
    let score = 0;
    const contentLower = (memory.content || '').toLowerCase();
    const subjectLower = (memory.metadata?.subject || '').toLowerCase();
    const companyLower = (memory.metadata?.company || '').toLowerCase();
    const typeLower = (memory.metadata?.type || '').toLowerCase();

    // Check for keyword matches with higher weight for content
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 10; // Increased from 3 to 10
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
    
    // Boost for grocery/shopping queries
    if ((queryLower.includes('grocery') || queryLower.includes('shopping') || queryLower.includes('buy')) && 
        (contentLower.includes('grocery') || contentLower.includes('shopping') || contentLower.includes('buy') || 
         contentLower.includes('coriander') || contentLower.includes('eggs') || contentLower.includes('purchase'))) {
      score += 20; // High boost for grocery matches
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
    
    // Boost memories with low retention scores (weak areas from quizzes)
    if (memory.metadata?.retentionScore !== undefined) {
      const retentionScore = memory.metadata.retentionScore;
      if (retentionScore < 0.5) {
        score += 8; // High priority - struggling with this
      } else if (retentionScore < 0.7) {
        score += 4; // Medium priority - needs work
      }
      
      // Extra boost if asking about weak areas
      if (queryLower.includes('weak') || queryLower.includes('struggle') || 
          queryLower.includes('difficult') || queryLower.includes('improve')) {
        score += 5;
      }
    }
    
    // Boost memories related to recent quiz context
    const recentContext = history.slice(-5).map(m => m.content.toLowerCase()).join(' ');
    if (recentContext.includes('quiz') && recentContext.includes(subjectLower)) {
      score += 10; // Strong boost for quiz-related memories
    }
    
    // If conversation mentions they struggled/failed, boost weak retention memories
    if (recentContext.includes('tough') || recentContext.includes('hard') || 
        recentContext.includes('difficult') || recentContext.includes('0%') ||
        recentContext.includes('failed')) {
      if (memory.metadata?.retentionScore && memory.metadata.retentionScore < 0.6) {
        score += 8; // Show weak areas when user is struggling
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

async function generateAIResponse(query: string, relevantMemories: any[], history: any[] = []) {
  if (relevantMemories.length === 0 && history.length === 0) {
    return "Hmm, I couldn't find anything in your memories about that. Maybe you haven't saved anything on this topic yet? Feel free to add some memories and ask me again!";
  }

  // Prepare context for AI
  const memoryContext = relevantMemories.slice(0, 5).map((memory, idx) => {
    let context = `Memory ${idx + 1}:
Type: ${memory.metadata?.type || 'unknown'}
${memory.metadata?.subject ? `Subject: ${memory.metadata.subject}` : ''}
${memory.metadata?.company ? `Company: ${memory.metadata.company}` : ''}
Priority: ${memory.metadata?.priority || 'medium'}
Reviewed: ${memory.metadata?.reviewed ? 'Yes' : 'No'}`;

    // Add quiz performance data if available
    if (memory.metadata?.retentionScore !== undefined) {
      const score = Math.round(memory.metadata.retentionScore * 100);
      context += `\nQuiz Performance: ${score}% retention (${memory.metadata.correctAttempts}/${memory.metadata.quizAttempts} correct)`;
      if (score < 50) {
        context += ` ⚠️ WEAK AREA`;
      } else if (score < 70) {
        context += ` ⚡ Needs practice`;
      }
    }

    context += `\nCreated: ${memory.createdAt}
Content: ${memory.content?.substring(0, 400)}...
`;
    return context;
  }).join('\n\n');

  const systemPrompt = `You are Recall, a personal AI assistant that helps users understand their saved memories. You're warm, conversational, and insightful - like talking to a smart friend who's also a personal coach.

CRITICAL RULES:
- 🚨 NEVER suggest reviewing memories that are already reviewed. Only suggest reviewing unreviewed memories.
- 🎯 PROACTIVELY point out weak areas based on quiz performance (< 70% retention)
- 💪 Suggest taking quizzes on topics they haven't been tested on yet
- NEVER say "I found X memories" or list counts
- NEVER list memories one by one
- Talk naturally like you're texting a friend
- Synthesize information - tell them what the memories mean together
- Point out patterns, trends, or gaps you notice
- Give specific, actionable advice when asked what to focus on
- Be encouraging but honest
- Keep it SHORT (2-3 sentences max)
- Start directly with insights, not preamble

QUIZ PERFORMANCE COACHING:
- If you see "⚠️ WEAK AREA" (< 50% retention), strongly recommend reviewing that topic AND suggest "Want a quick quiz on [topic]?"
- If you see "⚡ Needs practice" (50-70% retention), suggest "Let's do a quick review quiz on [topic]"
- If no quiz data exists for a topic, proactively suggest "Want to test yourself? Just say 'quiz me on [topic]'"
- Celebrate high retention scores (> 80%)
- Be conversational about quizzes: "Quick quiz?" or "Test time?" or "Want to see if you remember this?"

Examples of GOOD responses:
- "You've been crushing it on system design - load balancing, microservices, caching are all covered. Database sharding seems to be the missing piece though."
- "Your algorithm skills look solid, but I noticed you haven't touched behavioral prep yet. That's usually what trips people up in interviews."
- "Looks like you've got a strong foundation in databases and web dev. The unreviewed stuff is mostly system design - might be time to revisit those."
- "You're only at 40% retention on load balancing - that's a weak spot. Want to review that before your interview?"
- "Nice! 85% retention on React hooks. But microservices is sitting at 50% - maybe quiz yourself on that again?"

Examples of BAD responses (NEVER do this):
- "I found 40 notes about System Design and Databases. Looks like 22 haven't been reviewed yet - might want to check those out!"
- "Here are the relevant memories I found: [list]"
- "Based on your memories, you have studied: [list]"`;

  try {
    // Build messages array with conversation history
    const messages: any[] = [];
    
    // Add system prompt with memory context embedded
    const systemPromptWithContext = `${systemPrompt}

AVAILABLE MEMORIES FOR CONTEXT:
${memoryContext}

Use these memories to inform your responses, but maintain natural conversation flow. Reference them when relevant, but don't force them into every response.`;

    messages.push({ role: 'system', content: systemPromptWithContext });

    // Add conversation history (last 10 messages)
    if (history.length > 0) {
      history.slice(-10).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current query as a natural user message
    messages.push({ role: 'user', content: query });

    const completion = await groq.chat.completions.create({
      messages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // 30K TPM - 5x higher than llama-3.3-70b
      temperature: 0.9,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "Sorry, I'm having trouble thinking right now. Can you try asking again?";
  } catch (error: any) {
    console.error('Groq API error:', error);
    console.error('Error details:', error.message, error.response?.data);
    
    // Try Gemini as fallback
    if (gemini) {
      try {
        console.log('🔄 Falling back to Gemini...');
        // Use gemini-2.5-flash - latest stable, fast and cost-efficient
        const model = gemini.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.9,
          }
        });
        
        // Simple prompt with memory context
        const geminiPrompt = `You are Recall, a personal AI memory assistant. Be conversational and helpful.

Context: ${memoryContext}

User: ${query}

Respond naturally and helpfully.`;
        
        const result = await model.generateContent(geminiPrompt);
        const response = result.response.text();
        
        console.log('✅ Gemini fallback successful');
        return response;
      } catch (geminiError: any) {
        console.error('Gemini fallback also failed:', geminiError.message);
      }
    }
    
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

async function autoSaveConversation(userMessage: string, aiResponse: string, supermemoryClient: any, containerTag: string) {
  try {
    // Use AI to determine if this conversation should be saved as a memory
    const shouldSave = await shouldSaveAsMemory(userMessage, aiResponse);
    
    if (!shouldSave.save) {
      return null;
    }

    // Extract metadata from the conversation
    const metadata = await extractMemoryMetadata(userMessage, aiResponse);

    // Save just the user's message, not the Q&A format
    const memoryContent = userMessage;
    
    // Build metadata, excluding null/undefined values
    const memoryMetadata: any = {
      type: metadata.type || 'note',
      priority: metadata.priority || 'medium',
      reviewed: false,
      source: 'chat',
      createdViaChat: true,
    };
    
    // Only add subject if it exists
    if (metadata.subject) {
      memoryMetadata.subject = metadata.subject;
    }
    
    // Add any extra metadata
    if (metadata.extra && typeof metadata.extra === 'object') {
      Object.keys(metadata.extra).forEach(key => {
        const extraData = metadata.extra as Record<string, any>;
        if (extraData[key] !== null && extraData[key] !== undefined) {
          (memoryMetadata as Record<string, any>)[key] = extraData[key];
        }
      });
    }

    const memory = await supermemoryClient.memories.add({
      content: memoryContent,
      containerTags: [containerTag],
      metadata: memoryMetadata,
    });

    console.log('💾 Auto-saved chat as memory:', memory.id);
    return memory;
  } catch (error) {
    console.error('Error auto-saving conversation:', error);
    return null;
  }
}

async function generateQuizFromMessage(message: string, memories: any[]) {
  const messageLower = message.toLowerCase();
  
  // Extract subject from message
  let subject = 'all';
  const subjectMatch = message.match(/quiz (?:on|about) (.+)/i) || 
                       message.match(/test me on (.+)/i);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
  }
  
  // Filter memories by subject if specified
  let relevantMemories = memories;
  if (subject !== 'all') {
    relevantMemories = memories.filter(m => {
      const content = (m.content || '').toLowerCase();
      const subj = (m.metadata?.subject || '').toLowerCase();
      return content.includes(subject.toLowerCase()) || subj.includes(subject.toLowerCase());
    });
  }
  
  // Prioritize unreviewed or low retention memories
  relevantMemories = relevantMemories
    .sort((a, b) => {
      const scoreA = a.metadata?.retentionScore ?? 0.5;
      const scoreB = b.metadata?.retentionScore ?? 0.5;
      const reviewedA = a.metadata?.reviewed ? 1 : 0;
      const reviewedB = b.metadata?.reviewed ? 1 : 0;
      return (reviewedA - reviewedB) || (scoreA - scoreB);
    })
    .slice(0, 3); // Generate 3 questions
  
  if (relevantMemories.length === 0) {
    return {
      intro: subject === 'all' 
        ? `Hmm, looks like you don't have any memories saved yet. Want to tell me what you're learning about? I can help you capture it and quiz you later!`
        : `I don't see any notes about ${subject} in your memories. Want to talk about it first? Tell me what you're learning and I'll help you remember it. Then we can quiz!`,
      questions: [],
    };
  }
  
  // Generate questions using Groq
  const questions = [];
  for (const memory of relevantMemories) {
    const prompt = `Based on this learning note, create ONE quiz question that tests understanding:

CONTENT: ${memory.content}

Generate a question and answer in this EXACT format:
Q: [Your question here]
A: [Your answer here]

Make the question specific and test actual understanding, not just memorization.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Consistent model across app
        temperature: 0.7,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || '';
      const qMatch = response.match(/Q:\s*([\s\S]+?)(?=A:|$)/);
      const aMatch = response.match(/A:\s*([\s\S]+?)$/);

      if (qMatch && aMatch) {
        questions.push({
          id: `q-${memory.id}`,
          question: qMatch[1].trim(),
          answer: aMatch[1].trim(),
          memoryId: memory.id,
          subject: memory.metadata?.subject,
        });
      }
    } catch (error) {
      console.error('Error generating question:', error);
    }
  }
  
  const intro = subject === 'all'
    ? `Alright, let's do a quick quiz! I've got ${questions.length} questions for you. Ready?`
    : `Cool! Let's quiz you on ${subject}. ${questions.length} questions coming up!`;
  
  return { intro, questions };
}

async function shouldSaveAsMemory(userMessage: string, aiResponse: string) {
  const messageLower = userMessage.toLowerCase();
  
  // NEVER save simple queries, reactions, or quiz requests
  const excludePatterns = [
    'quiz me', 'test me',  // Quiz requests
    'thanks', 'ok', 'yeah', 'sure', 'yep', 'nope',  // Reactions
    'damn', 'yikes', 'oof', 'lol', 'haha'  // Reactions
  ];
  
  // Only exclude if it's JUST a query without learning content
  const isJustQuery = excludePatterns.some(pattern => messageLower.includes(pattern)) &&
    !messageLower.includes('learned') && 
    !messageLower.includes('studied') &&
    !messageLower.includes('notes');
  
  if (isJustQuery) {
    return { save: false, reason: 'excluded_pattern' };
  }
  
  // Short messages are usually not worth saving
  if (userMessage.length < 15) {
    return { save: false, reason: 'too_short' };
  }
  
  // Save if it's actionable content
  const actionablePatterns = [
    'remind me', 'reminder', 'todo', 'need to', 'don\'t forget',
    'buy', 'get', 'pick up', 'grocery', 'shopping list'
  ];
  
  const isActionable = actionablePatterns.some(pattern => messageLower.includes(pattern));
  
  // Save if it's learning content (expanded patterns)
  const learningIndicators = [
    'studied', 'learned', 'notes on', 'reading about', 'practicing',
    'working on', 'trying to understand', 'confused about',
    'here\'s what i learned', 'today i', 'just learned', 'taking notes',
    'i read', 'i watched', 'i discovered', 'key takeaway', 'important:',
    'remember that', 'concept:', 'definition:', 'algorithm:', 'pattern:'
  ];
  
  const isLearning = learningIndicators.some(indicator => messageLower.includes(indicator));

  return {
    save: isActionable || isLearning,
    reason: isActionable ? 'actionable_reminder' : 'learning_content'
  };
}

async function extractMemoryMetadata(userMessage: string, aiResponse: string) {
  const messageLower = userMessage.toLowerCase();
  
  // Detect type
  let type = 'note';
  if (messageLower.includes('interview')) type = 'interview';
  else if (messageLower.includes('study') || messageLower.includes('learn')) type = 'study';
  else if (messageLower.includes('meeting')) type = 'meeting';

  // Extract subject from common patterns (improved)
  let subject = null;
  const subjectPatterns = [
    /(?:about|on|regarding)\s+([\w\s-]+?)(?:[\?\.!,]|$)/i,  // "about system design"
    /(?:learn|study|studied|learned)\s+([\w\s-]+?)(?:[\?\.!,]|$)/i,  // "studied Docker"
    /([\w\s-]+?)\s+(?:interview|notes|concept|algorithm)/i,  // "Google interview"
    /(?:notes on|reading about|practicing)\s+([\w\s-]+?)(?:[\?\.!,]|$)/i,  // "notes on React"
    /(?:remind me|buy|get|pick up)\s+([\w\s-]+?)(?:[\?\.!,]|$)/i,  // "buy coriander"
  ];

  for (const pattern of subjectPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      subject = match[1].trim();
      // Clean up common words
      subject = subject.replace(/^(to|the|a|an)\s+/i, '');
      if (subject.length > 3) break;  // Valid subject found
    }
  }

  // Detect priority
  let priority = 'medium';
  if (messageLower.includes('urgent') || messageLower.includes('important')) {
    priority = 'high';
  }

  return {
    type,
    subject,
    priority,
    extra: {}
  };
}
