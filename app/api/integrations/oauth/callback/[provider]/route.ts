import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, ProviderName, oauthProviders } from '@/lib/integrations/oauth-config';
import { saveToken } from '@/lib/integrations/token-store';

// GET /api/integrations/oauth/callback/[provider]
// Handles OAuth callback from provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error(`[OAuth] Provider returned error:`, error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=oauth_denied&provider=${provider}`
      );
    }

    // Validate inputs
    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!oauthProviders[provider as ProviderName]) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider' },
        { status: 400 }
      );
    }

    // Decode and validate state
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      stateData = JSON.parse(decodedState);

      // Verify state matches provider
      if (stateData.provider !== provider) {
        throw new Error('State provider mismatch');
      }

      // Check timestamp (state should be less than 10 minutes old)
      const stateAge = Date.now() - stateData.timestamp;
      if (stateAge > 10 * 60 * 1000) {
        throw new Error('State expired');
      }
    } catch (error) {
      console.error('[OAuth] Invalid state:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=invalid_state&provider=${provider}`
      );
    }

    console.log(`[OAuth] Exchanging code for tokens (${provider})`);

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(provider as ProviderName, code);

    // Calculate expiration timestamp
    const expiresAt = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined;

    // Save tokens
    await saveToken({
      userId: stateData.userId,
      provider: provider as ProviderName,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: expiresAt,
      scope: tokens.scope,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`[OAuth] Successfully connected ${provider} for user ${stateData.userId}`);

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=true&provider=${provider}`
    );
  } catch (error: any) {
    console.error('[OAuth] Callback error:', error);
    const { provider } = await params;
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=connection_failed&provider=${provider}`
    );
  }
}
