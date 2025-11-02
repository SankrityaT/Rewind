import Groq from 'groq-sdk';
import { supermemoryClient, USER_CONTAINER_TAG } from './supermemory';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIInsight() {
  try {
    console.log('🔍 [AI Insight] Fetching memories for container:', USER_CONTAINER_TAG);
    
    // Fetch user memories from Supermemory
    const response = await supermemoryClient.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 50, // Get recent memories for context
    });

    console.log('📦 [AI Insight] Raw response:', JSON.stringify(response, null, 2));

    // Extract memories from response - same logic as memories API
    let memories = (response as any)?.results || (response as any)?.memories || (response as any)?.data || [];
    
    // If response is directly an array
    if (Array.isArray(response)) {
      memories = response;
    }
    
    console.log(`✅ [AI Insight] Found ${memories.length} memories`);
    
    if (memories.length > 0) {
      console.log('📋 [AI Insight] First memory sample:', {
        id: memories[0].id,
        summary: memories[0].summary,
        content: memories[0].content,
        metadata: memories[0].metadata,
      });
    }

    // If no memories yet, return encouraging message
    if (memories.length === 0) {
      console.log('⚠️ [AI Insight] No memories found, returning default message');
      return '🌟 Start adding memories to unlock personalized AI insights about your learning patterns!';
    }

    // Extract content from recent memories - use summary field like memories API
    const recentMemories = memories.slice(0, 10).map((m: any) => m.summary || m.content || '').filter(Boolean);
    console.log('📝 [AI Insight] Recent memories content:', recentMemories);
    
    const memoryTypes = memories.reduce((acc: any, m: any) => {
      const type = m.metadata?.type || 'note';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 [AI Insight] Memory types breakdown:', memoryTypes);

    const prompt = `You are an intelligent memory assistant analyzing a user's learning activity.

RECENT MEMORIES (last 10):
${recentMemories.join('\n') || 'No recent memories'}

MEMORY BREAKDOWN:
${Object.entries(memoryTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

TOTAL MEMORIES: ${memories.length}

Based on this profile, provide ONE actionable insight that:
- Identifies what they're neglecting or should focus on
- Suggests smart connections between their interests
- Gives specific, actionable advice
- Is personalized to their learning style

Keep it under 50 words, be specific and actionable. Start with an emoji that fits the insight.`;

    console.log('🤖 [AI Insight] Sending prompt to Groq:', prompt);

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    const insight = completion.choices[0]?.message?.content || 'Keep up the great work! 🎯';
    console.log('✨ [AI Insight] Generated insight:', insight);

    return insight;
  } catch (error) {
    console.error('❌ [AI Insight] Error occurred:', error);
    console.error('❌ [AI Insight] Error stack:', (error as Error).stack);
    // Return a smart fallback insight
    const fallbackInsights = [
      '🎯 You\'re studying consistently! Focus on reviewing older topics to maintain retention.',
      '💡 Your interview prep is strong. Consider practicing more system design scenarios.',
      '🔥 Great momentum! Review your ML algorithms before the quiz for best results.',
      '📚 You\'ve covered a lot of ground. Time to consolidate with spaced repetition.',
      '⚡ Peak performance detected at 9 PM. Schedule important reviews during this window.',
    ];
    const fallback = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)];
    console.log('🔄 [AI Insight] Using fallback insight:', fallback);
    return fallback;
  }
}
