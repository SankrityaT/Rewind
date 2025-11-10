import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
}

interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
}

interface SlackUser {
  id: string;
  name: string;
  real_name: string;
}

export async function syncSlack(userId: string, limit: number = 50): Promise<number> {
  const storedToken = await getToken(userId, 'slack');
  if (!storedToken) {
    throw new Error('Slack not connected');
  }

  let accessToken = storedToken.accessToken;
  // Note: Slack tokens typically don't expire, but we check anyway
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Slack] Refreshing expired token');
    const newTokens = await refreshAccessToken('slack', storedToken.refreshToken);
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

  // Fetch channels the user is a member of
  const channelsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&exclude_archived=true', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!channelsResponse.ok) {
    throw new Error('Failed to fetch Slack channels');
  }

  const channelsData = await channelsResponse.json();
  if (!channelsData.ok) {
    throw new Error(`Slack API error: ${channelsData.error}`);
  }

  const channels: SlackChannel[] = (channelsData.channels || []).filter((c: SlackChannel) => c.is_member);

  console.log(`[Slack] Found ${channels.length} channels`);

  // Fetch users for name resolution
  const usersResponse = await fetch('https://slack.com/api/users.list', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const usersData = await usersResponse.json();
  const users: Map<string, SlackUser> = new Map();
  if (usersData.ok && usersData.members) {
    usersData.members.forEach((user: SlackUser) => {
      users.set(user.id, user);
    });
  }

  let imported = 0;
  const cutoffTime = (Date.now() / 1000) - (30 * 24 * 60 * 60); // 30 days ago

  // Import important messages from each channel
  for (const channel of channels.slice(0, 10)) { // Limit to 10 channels to avoid rate limits
    try {
      const messagesResponse = await fetch(
        `https://slack.com/api/conversations.history?channel=${channel.id}&limit=20&oldest=${cutoffTime}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messagesData = await messagesResponse.json();
      if (!messagesData.ok) continue;

      const messages: SlackMessage[] = messagesData.messages || [];

      // Import threaded messages or messages with reactions
      for (const message of messages) {
        if (message.type !== 'message' || !message.text) continue;

        // Only import messages that are thread starters or have replies
        if (message.thread_ts && message.reply_count && message.reply_count > 0) {
          const user = users.get(message.user);
          const userName = user?.real_name || user?.name || 'Unknown User';
          const timestamp = new Date(parseFloat(message.ts) * 1000);

          const content = `
Slack Thread in #${channel.name}

From: ${userName}
Date: ${timestamp.toLocaleString()}
Replies: ${message.reply_count}

${message.text}
          `.trim();

          await supermemoryClient.memories.add({
            content: content,
            metadata: {
              type: 'personal',
              source: 'slack',
              channelId: channel.id,
              channelName: channel.name,
              messageTs: message.ts,
              priority: 'medium',
              reviewed: false,
              receivedAt: timestamp.toISOString(),
              importedAt: new Date().toISOString(),
              tags: [`user_${userId}`],
            },
          });

          imported++;
        }
      }
    } catch (error) {
      console.error(`[Slack] Failed to import from channel ${channel.name}:`, error);
    }
  }

  console.log(`[Slack] Imported ${imported} threaded messages`);
  return imported;
}

export async function triggerSlackSync(userId: string, limit?: number) {
  try {
    const imported = await syncSlack(userId, limit);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Slack] Sync error:', error);
    return { success: false, error: error.message };
  }
}
