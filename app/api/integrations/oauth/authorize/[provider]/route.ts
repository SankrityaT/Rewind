import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl, ProviderName, oauthProviders } from '@/lib/integrations/oauth-config';
import { getCurrentUserId } from '@/lib/auth';

// GET /api/integrations/oauth/authorize/[provider]
// Redirects user to OAuth provider for authorization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    // Get authenticated user ID
    const userId = await getCurrentUserId();

    // Validate provider
    if (!oauthProviders[provider as ProviderName]) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = JSON.stringify({
      userId: userId,
      provider: provider,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    });

    // Encode state
    const encodedState = Buffer.from(state).toString('base64');

    // Generate authorization URL
    const authUrl = generateAuthUrl(provider as ProviderName, encodedState);

    console.log(`[OAuth] Redirecting to ${provider} authorization:`, authUrl);

    // Redirect to OAuth provider
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[OAuth] Authorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
