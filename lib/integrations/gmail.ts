import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';
import { getPreference, type GmailPreferences } from './preferences';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ mimeType: string; body?: { data?: string } }>;
  };
  internalDate: string;
}

function getHeader(message: GmailMessage, name: string): string | undefined {
  const header = message.payload.headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value;
}

function decodeBase64(data: string): string {
  // Gmail uses URL-safe base64
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function getMessageBody(message: GmailMessage): string {
  // Try to get plain text body
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
  }

  // Fallback to snippet
  return message.snippet;
}

export async function syncGmail(userId: string, maxResults?: number): Promise<number> {
  // Get user preferences
  const preferences = getPreference(userId, 'gmail') as GmailPreferences;

  if (!preferences.enabled) {
    console.log('[Gmail] Sync disabled by user preferences');
    return 0;
  }

  // Get stored token
  const storedToken = await getToken(userId, 'google');
  if (!storedToken) {
    throw new Error('Gmail not connected');
  }

  // Check if token is expired and refresh if needed
  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Gmail] Refreshing expired token');
    const newTokens = await refreshAccessToken('google', storedToken.refreshToken);

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

  // Build query based on preferences
  const queryParts: string[] = [];

  if (preferences.filters.importStarred) {
    queryParts.push('is:starred');
  }

  if (preferences.filters.importImportant) {
    queryParts.push('is:important');
  }

  if (preferences.filters.importUnread) {
    queryParts.push('is:unread');
  }

  if (preferences.filters.importFromContacts.length > 0) {
    const contactsQuery = preferences.filters.importFromContacts
      .map(email => `from:${email}`)
      .join(' OR ');
    queryParts.push(`(${contactsQuery})`);
  }

  if (preferences.filters.excludePromotions) {
    queryParts.push('-category:promotions');
  }

  if (preferences.filters.excludeSocial) {
    queryParts.push('-category:social');
  }

  if (queryParts.length === 0) {
    console.log('[Gmail] No filters enabled, skipping sync');
    return 0;
  }

  // Convert time range to days
  const timeRangeDays = preferences.timeRange === '7d' ? 7 : preferences.timeRange === '30d' ? 30 : 90;
  queryParts.push(`newer_than:${timeRangeDays}d`);

  const query = queryParts.join(' ');
  const maxResultsToFetch = maxResults || preferences.maxEmails;

  console.log(`[Gmail] Query: ${query}`);

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?` +
    `q=${encodeURIComponent(query)}&` +
    `maxResults=${maxResultsToFetch}`;

  const listResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Failed to fetch Gmail messages: ${error}`);
  }

  const listData = await listResponse.json();
  const messageIds: Array<{ id: string }> = listData.messages || [];

  console.log(`[Gmail] Found ${messageIds.length} important messages`);

  let imported = 0;

  // Fetch full message details and import
  for (const { id } of messageIds) {
    try {
      const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`;
      const messageResponse = await fetch(messageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!messageResponse.ok) continue;

      const message: GmailMessage = await messageResponse.json();

      const from = getHeader(message, 'from');
      const subject = getHeader(message, 'subject');
      const date = new Date(parseInt(message.internalDate)).toLocaleString();
      const body = getMessageBody(message);

      const content = `
Email: ${subject || '(No subject)'}

From: ${from || 'Unknown'}
Date: ${date}

${body}
      `.trim();

      await supermemoryClient.memories.add({
        content: content,
        metadata: {
          type: 'personal',
          source: 'gmail',
          messageId: message.id,
          threadId: message.threadId,
          priority: 'high',
          reviewed: false,
          receivedAt: message.internalDate,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Gmail] Failed to import message ${id}:`, error);
    }
  }

  console.log(`[Gmail] Imported ${imported}/${messageIds.length} messages`);

  return imported;
}

export async function triggerGmailSync(userId: string, maxResults?: number) {
  try {
    const imported = await syncGmail(userId, maxResults);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Gmail] Sync error:', error);
    return { success: false, error: error.message };
  }
}
