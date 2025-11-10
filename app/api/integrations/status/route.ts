import { NextRequest, NextResponse } from 'next/server';
import { getAllTokensForUser, deleteToken } from '@/lib/integrations/token-store';
import { getCurrentUserId } from '@/lib/auth';
import { ProviderName } from '@/lib/integrations/oauth-config';

// GET /api/integrations/status - Get all connected integrations
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const tokens = await getAllTokensForUser(userId);

    const connections = tokens.map((token) => ({
      provider: token.provider,
      connected: true,
      connectedAt: token.createdAt,
      hasRefreshToken: !!token.refreshToken,
    }));

    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error('[Integrations] Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/status - Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    await deleteToken(userId, provider as ProviderName);

    console.log(`[Integrations] Disconnected ${provider} for user ${userId}`);

    return NextResponse.json({
      success: true,
      provider: provider,
    });
  } catch (error: any) {
    console.error('[Integrations] Disconnect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
