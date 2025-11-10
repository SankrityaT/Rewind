import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import {
  getPreference,
  setPreference,
  isValidProvider,
  type ProviderName,
  type IntegrationPreference,
} from '@/lib/integrations/preferences';
import { validatePreference } from '@/lib/integrations/validation';

// GET /api/integrations/preferences/[provider] - Get preference for a specific integration
export async function GET(
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

    const preference = getPreference(userId, provider as ProviderName);

    return NextResponse.json({
      success: true,
      provider,
      preference,
    });
  } catch (error: any) {
    console.error('[Preferences API] Error fetching preference:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preference' },
      { status: 500 }
    );
  }
}

// PUT /api/integrations/preferences/[provider] - Update preference for a specific integration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const userId = await getCurrentUserId();
    const body = await request.json();

    if (!isValidProvider(provider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    if (!body.config) {
      return NextResponse.json(
        { error: 'Config is required in request body' },
        { status: 400 }
      );
    }

    // Validate the config
    const validation = validatePreference(provider as ProviderName, body.config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    // Save the preference
    setPreference(userId, provider as ProviderName, body.config as IntegrationPreference);

    // Return the updated preference
    const updatedPreference = getPreference(userId, provider as ProviderName);

    return NextResponse.json({
      success: true,
      provider,
      preference: updatedPreference,
    });
  } catch (error: any) {
    console.error('[Preferences API] Error updating preference:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preference' },
      { status: 500 }
    );
  }
}
