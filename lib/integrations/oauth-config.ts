// OAuth Configuration for all integrations

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
  redirectUri: string;
}

export const getRedirectUri = (provider: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/integrations/oauth/callback/${provider}`;
};

// Google OAuth Configuration
export const googleOAuthConfig: OAuthProvider = {
  name: 'google',
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scope: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  redirectUri: getRedirectUri('google'),
};

// Microsoft OAuth Configuration
export const microsoftOAuthConfig: OAuthProvider = {
  name: 'microsoft',
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scope: [
    'User.Read',
    'Mail.Read',
    'Calendars.Read',
    'OnlineMeetings.Read',
    'offline_access',
  ],
  redirectUri: getRedirectUri('microsoft'),
};

// Zoom OAuth Configuration
export const zoomOAuthConfig: OAuthProvider = {
  name: 'zoom',
  clientId: process.env.ZOOM_CLIENT_ID || '',
  clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
  authUrl: 'https://zoom.us/oauth/authorize',
  tokenUrl: 'https://zoom.us/oauth/token',
  scope: ['meeting:read', 'recording:read', 'user:read'],
  redirectUri: getRedirectUri('zoom'),
};

// Slack OAuth Configuration
export const slackOAuthConfig: OAuthProvider = {
  name: 'slack',
  clientId: process.env.SLACK_CLIENT_ID || '',
  clientSecret: process.env.SLACK_CLIENT_SECRET || '',
  authUrl: 'https://slack.com/oauth/v2/authorize',
  tokenUrl: 'https://slack.com/api/oauth.v2.access',
  scope: [
    'channels:history',
    'channels:read',
    'users:read',
    'team:read',
  ],
  redirectUri: getRedirectUri('slack'),
};

// Notion OAuth Configuration
export const notionOAuthConfig: OAuthProvider = {
  name: 'notion',
  clientId: process.env.NOTION_CLIENT_ID || '',
  clientSecret: process.env.NOTION_CLIENT_SECRET || '',
  authUrl: 'https://api.notion.com/v1/oauth/authorize',
  tokenUrl: 'https://api.notion.com/v1/oauth/token',
  scope: [],
  redirectUri: getRedirectUri('notion'),
};

// GitHub OAuth Configuration
export const githubOAuthConfig: OAuthProvider = {
  name: 'github',
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  scope: ['repo', 'read:user', 'user:email'],
  redirectUri: getRedirectUri('github'),
};

// Canvas LMS Configuration (uses API token, not OAuth in most cases)
export const canvasConfig = {
  name: 'canvas',
  baseUrl: process.env.CANVAS_BASE_URL || 'https://canvas.instructure.com',
  // Canvas typically uses API tokens rather than OAuth
};

export const oauthProviders = {
  google: googleOAuthConfig,
  microsoft: microsoftOAuthConfig,
  zoom: zoomOAuthConfig,
  slack: slackOAuthConfig,
  notion: notionOAuthConfig,
  github: githubOAuthConfig,
};

export type ProviderName = keyof typeof oauthProviders;

export function getOAuthConfig(provider: ProviderName): OAuthProvider {
  return oauthProviders[provider];
}

// Generate OAuth authorization URL
export function generateAuthUrl(provider: ProviderName, state: string): string {
  const config = getOAuthConfig(provider);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state: state,
    access_type: 'offline', // For refresh tokens (Google)
    prompt: 'consent', // Force consent screen to get refresh token
  });

  if (config.scope.length > 0) {
    params.append('scope', config.scope.join(' '));
  }

  return `${config.authUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  provider: ProviderName,
  code: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}> {
  const config = getOAuthConfig(provider);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

// Refresh access token
export async function refreshAccessToken(
  provider: ProviderName,
  refreshToken: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const config = getOAuthConfig(provider);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return await response.json();
}
