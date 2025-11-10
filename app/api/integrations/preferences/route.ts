import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { getAllPreferences } from '@/lib/integrations/preferences';

// GET /api/integrations/preferences - Get all integration preferences for the user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const preferences = getAllPreferences(userId);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('[Preferences API] Error fetching preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
