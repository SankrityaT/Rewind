import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
  memoryIds?: string[];
  priority: number;
}

// Simple in-memory cache (5 minutes)
const alertCache = new Map<string, { alerts: Alert[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  let memories: any[] = [];
  
  try {
    const body = await req.json();
    memories = body.memories || [];

    if (!memories || !Array.isArray(memories)) {
      return NextResponse.json({ error: 'Invalid memories data' }, { status: 400 });
    }

    const now = Date.now();

    // Check cache first to avoid API calls
    const cacheKey = `alerts-${memories.length}-${memories[0]?.id || 'empty'}`;
    const cached = alertCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log('[Alerts] Returning cached alerts');
      return NextResponse.json({ alerts: cached.alerts });
    }

    // CRITICAL: Only send unreviewed memories to AI for coaching
    // Reviewed memories don't need alerts
    const unreviewedMemories = memories.filter(m => !m.metadata?.reviewed);
    const reviewedCount = memories.length - unreviewedMemories.length;
    
    console.log(`[Alerts] Total: ${memories.length}, Unreviewed: ${unreviewedMemories.length}, Reviewed: ${reviewedCount}`);

    // If all memories are reviewed, return success message
    if (unreviewedMemories.length === 0) {
      return NextResponse.json({ 
        alerts: [{
          id: 'all-reviewed',
          type: 'info',
          title: 'All caught up!',
          message: `You've reviewed all ${memories.length} memories. Great work! Keep it up.`,
          memoryIds: [],
          priority: 1,
        }]
      });
    }

    // Prepare memory context for AI - ONLY unreviewed memories
    const memoryContext = unreviewedMemories.map((memory: any, idx: number) => {
      const daysAgo = Math.floor((Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceReview = memory.metadata?.lastReviewed 
        ? Math.floor((Date.now() - new Date(memory.metadata.lastReviewed).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      let deadlineInfo = '';
      if (memory.metadata?.deadline) {
        const daysUntilDeadline = Math.floor((new Date(memory.metadata.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        deadlineInfo = `Deadline in ${daysUntilDeadline} days`;
      }

      return `Memory ${idx + 1}:
ID: ${memory.id}
Type: ${memory.metadata?.type || 'unknown'}
Subject: ${memory.metadata?.subject || 'N/A'}
Company: ${memory.metadata?.company || 'N/A'}
Priority: ${memory.metadata?.priority || 'medium'}
Created: ${daysAgo} days ago
Reviewed: ${memory.metadata?.reviewed ? `Yes (${daysSinceReview} days ago)` : 'No'}
${deadlineInfo}
Content Preview: ${memory.content?.substring(0, 200)}...
`;
    }).join('\n\n');

    const systemPrompt = `You are an AI MEMORY COACH, not just a reminder system. Your job is to COACH the user on what to do with their UNREVIEWED memories.

YOU ARE A COACH, NOT A SEARCH ENGINE.

IMPORTANT CONTEXT: You are ONLY seeing unreviewed memories. All the memories you see need attention. Focus on helping the user prioritize which ones to review first.

COACHING PRINCIPLES:
1. **Pattern Detection** - Find patterns in their behavior and warn them
   - "You always forget to review clustering - it came up in 3 past quizzes"
   - "Based on past interviews, you need 5+ days prep (you have 4)"
   - "You score 25% worse when you review <12 hours before tests"

2. **Performance Tracking** - Reference past performance
   - "Last time you studied this topic, you scored 60% - extra review needed"
   - "Similar tasks took you 4 hours on average - start now"
   - "You're behind your usual review pace this week"

3. **Specific Reasoning** - Always explain WHY
   - Not: "Review system design"
   - Yes: "Review system design - it came up in your Amazon rejection feedback"

4. **Deadline Intelligence** - Context about time
   - If deadline <1 day: "URGENT - Due TODAY"
   - If deadline <3 days AND progress low: "You're cutting it close"
   - If usual_prep_time > days_remaining: "You usually need X days for this"

5. **Action Items from Meetings** - Extract commitments
   - "You promised Sarah API docs by Oct 30 - now overdue"
   - "Team mentioned this twice - don't forget"

Alert Types:
1. URGENT (red) - DO THIS TODAY (deadline <1 day, critical overdue)
2. WARNING (yellow) - DO THIS SOON (deadline <7 days, pattern risk)
3. INFO (blue) - INSIGHTS (patterns, performance tips, recommendations)

CRITICAL: Every alert must include:
- Specific reasoning (why this matters)
- Pattern reference (if applicable)
- Past performance context (if applicable)
- Clear action to take

Examples of COACHING alerts:
✅ "ML Quiz in 6 hours - You haven't reviewed clustering in 3 days. Last quiz you scored 60% on this topic. Your pattern: You score 25% worse when reviewing <12 hours before. START NOW."

✅ "Amazon Interview in 4 days - System Design prep 40% complete. Based on past interviews, you need 5 days prep minimum. You're cutting it close. Focus on system design - it came up in your rejection feedback."

✅ "Action Item OVERDUE - Sarah's API documentation (promised Oct 30). Similar tasks took you 4 hours average. She mentioned this twice in meetings."

❌ "You have unreviewed memories" (not coaching)
❌ "Interview coming up" (no context or reasoning)

Return JSON with this structure - include reasoning and patterns in the message.`;

    const userPrompt = `Analyze these memories and generate 3-5 smart, actionable alerts:

${memoryContext}

Return JSON array of alerts with this structure:
[
  {
    "type": "urgent" | "warning" | "info",
    "title": "Short action-oriented title",
    "message": "2-3 sentence explanation",
    "memoryIds": ["id1", "id2"],
    "priority": 1-10
  }
]`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant', // Faster, uses 10x fewer tokens
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{"alerts": []}';
    
    let alertsData;
    try {
      alertsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Fallback to basic alerts
      return NextResponse.json({ alerts: generateFallbackAlerts(memories) });
    }

    // Extract alerts array (handle different response formats)
    const alerts = alertsData.alerts || alertsData || [];

    // Add IDs and ensure proper format
    const formattedAlerts = alerts.map((alert: any, idx: number) => ({
      id: `alert-${Date.now()}-${idx}`,
      type: alert.type || 'info',
      title: alert.title || 'Action needed',
      message: alert.message || '',
      memoryIds: alert.memoryIds || [],
      priority: alert.priority || 5,
    }));

    // Cache the results
    alertCache.set(cacheKey, { alerts: formattedAlerts, timestamp: now });

    return NextResponse.json({ alerts: formattedAlerts });
  } catch (error: any) {
    console.error('Alerts API error:', error);
    
    // If rate limited or API error, return fallback alerts
    const fallbackAlerts = generateFallbackAlerts(memories || []);
    return NextResponse.json({ alerts: fallbackAlerts });
  }
}

function generateFallbackAlerts(memories: any[]): Alert[] {
  const alerts: Alert[] = [];
  
  // Check for urgent deadlines (prioritize unreviewed)
  const urgentDeadlines = memories.filter(m => {
    if (!m.metadata?.deadline) return false;
    const daysUntil = Math.floor((new Date(m.metadata.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil >= 0;
  });

  const unreviewedUrgent = urgentDeadlines.filter(m => !m.metadata?.reviewed);

  if (unreviewedUrgent.length > 0) {
    alerts.push({
      id: 'urgent-deadline',
      type: 'urgent',
      title: `${unreviewedUrgent.length} unreviewed deadline${unreviewedUrgent.length > 1 ? 's' : ''} approaching`,
      message: `You have ${unreviewedUrgent.length} unreviewed ${unreviewedUrgent.length > 1 ? 'items' : 'item'} due in the next 3 days. Review and complete them now!`,
      memoryIds: unreviewedUrgent.map(m => m.id),
      priority: 10,
    });
  } else if (urgentDeadlines.length > 0) {
    // All urgent deadlines are reviewed
    alerts.push({
      id: 'urgent-deadline-reviewed',
      type: 'info',
      title: `${urgentDeadlines.length} deadline${urgentDeadlines.length > 1 ? 's' : ''} coming up`,
      message: `You've reviewed these items. Make sure to complete them before the deadline!`,
      memoryIds: urgentDeadlines.map(m => m.id),
      priority: 7,
    });
  }

  // Check for unreviewed high priority
  const unreviewed = memories.filter(m => 
    !m.metadata?.reviewed && m.metadata?.priority === 'high'
  );

  if (unreviewed.length > 0) {
    alerts.push({
      id: 'unreviewed-high',
      type: 'warning',
      title: `${unreviewed.length} high-priority items need review`,
      message: `These important memories haven't been reviewed yet. Quick refresh recommended!`,
      memoryIds: unreviewed.map(m => m.id),
      priority: 8,
    });
  }

  // Check for old unreviewed items
  const oldUnreviewed = memories.filter(m => {
    if (m.metadata?.reviewed) return false;
    const daysOld = Math.floor((Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysOld > 7;
  });

  if (oldUnreviewed.length >= 5) {
    alerts.push({
      id: 'old-unreviewed',
      type: 'info',
      title: `${oldUnreviewed.length} items collecting dust`,
      message: `You've got memories from over a week ago that haven't been reviewed. Worth a look?`,
      memoryIds: oldUnreviewed.slice(0, 5).map(m => m.id),
      priority: 5,
    });
  }

  return alerts.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
