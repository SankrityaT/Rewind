import { NextResponse } from 'next/server';
import { generateAIInsight } from '@/lib/groq';

export async function GET() {
  try {
    console.log('🚀 [AI Insight API] Starting insight generation...');
    const insight = await generateAIInsight();
    console.log('✅ [AI Insight API] Insight generated successfully:', insight);
    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('❌ [AI Insight API] Error generating AI insight:', error);
    console.error('❌ [AI Insight API] Error details:', error.message, error.stack);
    return NextResponse.json(
      { insight: '🧠 Keep up the great work with your learning!' },
      { status: 200 } // Return 200 with fallback message
    );
  }
}
