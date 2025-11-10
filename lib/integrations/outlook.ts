import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface OutlookMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: { content: string; contentType: string };
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  importance: string;
  isRead: boolean;
}

export async function syncOutlook(userId: string, maxResults: number = 20): Promise<number> {
  const storedToken = await getToken(userId, 'microsoft');
  if (!storedToken) {
    throw new Error('Outlook not connected');
  }

  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Outlook] Refreshing expired token');
    const newTokens = await refreshAccessToken('microsoft', storedToken.refreshToken);
    accessToken = newTokens.access_token;

    await saveToken({
      ...storedToken,
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || storedToken.refreshToken,
      expiresAt: newTokens.expires_in
        ? Date.now() + newTokens.expires_in * 1000
        : storedToken.expiresAt,
    });
  }

  // Fetch important emails from inbox
  const url = `https://graph.microsoft.com/v1.0/me/messages?` +
    `$filter=importance eq 'high' or isRead eq false&` +
    `$top=${maxResults}&` +
    `$orderby=receivedDateTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Outlook messages: ${error}`);
  }

  const data = await response.json();
  const messages: OutlookMessage[] = data.value || [];

  console.log(`[Outlook] Found ${messages.length} messages`);

  let imported = 0;

  for (const message of messages) {
    try {
      const body = message.body.contentType === 'text'
        ? message.body.content
        : message.bodyPreview;

      const content = `
Email: ${message.subject || '(No subject)'}

From: ${message.from.emailAddress.name} <${message.from.emailAddress.address}>
Date: ${new Date(message.receivedDateTime).toLocaleString()}
Importance: ${message.importance}

${body}
      `.trim();

      await supermemoryClient.memories.add({
        content: content,
        metadata: {
          type: 'personal',
          source: 'outlook',
          messageId: message.id,
          priority: message.importance === 'high' ? 'high' : 'medium',
          reviewed: false,
          receivedAt: message.receivedDateTime,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Outlook] Failed to import message ${message.id}:`, error);
    }
  }

  console.log(`[Outlook] Imported ${imported}/${messages.length} messages`);
  return imported;
}

export async function triggerOutlookSync(userId: string, maxResults?: number) {
  try {
    const imported = await syncOutlook(userId, maxResults);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Outlook] Sync error:', error);
    return { success: false, error: error.message };
  }
}
