import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface OutlookEvent {
  id: string;
  subject: string;
  body: { content: string; contentType: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location: { displayName: string };
  attendees: Array<{ emailAddress: { name: string; address: string } }>;
  webLink: string;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
}

export async function syncOutlookCalendar(userId: string): Promise<number> {
  const storedToken = await getToken(userId, 'microsoft');
  if (!storedToken) {
    throw new Error('Outlook Calendar not connected');
  }

  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Outlook Calendar] Refreshing expired token');
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

  // Fetch calendar events from the last 30 days
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date().toISOString();

  const url = `https://graph.microsoft.com/v1.0/me/calendarview?` +
    `startDateTime=${startDate}&` +
    `endDateTime=${endDate}&` +
    `$top=50&` +
    `$orderby=start/dateTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      Prefer: 'outlook.timezone="UTC"',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();
  const events: OutlookEvent[] = data.value || [];

  console.log(`[Outlook Calendar] Found ${events.length} events`);

  let imported = 0;

  for (const event of events) {
    try {
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);

      const content = `
Calendar Event: ${event.subject}

Date: ${startTime.toLocaleDateString()}
Time: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}
${event.location?.displayName ? `Location: ${event.location.displayName}` : ''}
${event.isOnlineMeeting && event.onlineMeetingUrl ? `Online Meeting: ${event.onlineMeetingUrl}` : ''}
${event.attendees?.length ? `Attendees: ${event.attendees.map(a => a.emailAddress.name || a.emailAddress.address).join(', ')}` : ''}

${event.body.contentType === 'text' ? event.body.content : ''}

Link: ${event.webLink}
      `.trim();

      await supermemoryClient.memories.add({
        content: content,
        metadata: {
          type: 'meeting',
          source: 'outlook-calendar',
          eventId: event.id,
          priority: 'medium',
          reviewed: false,
          eventDate: event.start.dateTime,
          isOnlineMeeting: event.isOnlineMeeting,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Outlook Calendar] Failed to import event ${event.id}:`, error);
    }
  }

  console.log(`[Outlook Calendar] Imported ${imported}/${events.length} events`);
  return imported;
}

export async function triggerOutlookCalendarSync(userId: string) {
  try {
    const imported = await syncOutlookCalendar(userId);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Outlook Calendar] Sync error:', error);
    return { success: false, error: error.message };
  }
}
