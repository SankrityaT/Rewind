import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import {
  resetPreference,
  isValidProvider,
  type ProviderName,
} from '@/lib/integrations/preferences';

// POST /api/integrations/preferences/[provider]/reset - Reset preference to default
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const userId = await getCurrentUserId();

    if (!isValidProvider(provider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    const defaultPreference = resetPreference(userId, provider as ProviderName);

    return NextResponse.json({
      success: true,
      provider,
      preference: defaultPreference,
      message: 'Preference reset to default',
    });
  } catch (error: any) {
    console.error('[Preferences API] Error resetting preference:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset preference' },
      { status: 500 }
    );
  }
}
