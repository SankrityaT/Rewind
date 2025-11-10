import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string }>;
  location?: string;
  htmlLink: string;
}

export async function syncGoogleCalendar(userId: string): Promise<number> {
  // Get stored token
  const storedToken = await getToken(userId, 'google');
  if (!storedToken) {
    throw new Error('Google Calendar not connected');
  }

  // Check if token is expired and refresh if needed
  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Google Calendar] Refreshing expired token');
    const newTokens = await refreshAccessToken('google', storedToken.refreshToken);

    accessToken = newTokens.access_token;

    // Update stored token
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
  const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date().toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&` +
    `timeMax=${encodeURIComponent(timeMax)}&` +
    `singleEvents=true&` +
    `orderBy=startTime&` +
    `maxResults=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();
  const events: CalendarEvent[] = data.items || [];

  console.log(`[Google Calendar] Found ${events.length} events`);

  let imported = 0;

  // Import events as memories
  for (const event of events) {
    try {
      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end.dateTime || event.end.date;

      const content = `
Calendar Event: ${event.summary}

Date: ${new Date(startTime!).toLocaleDateString()}
Time: ${event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString() : 'All day'}
${event.location ? `Location: ${event.location}` : ''}
${event.attendees ? `Attendees: ${event.attendees.map(a => a.email).join(', ')}` : ''}

${event.description || 'No description'}

Link: ${event.htmlLink}
      `.trim();

      await supermemoryClient.memories.add({
        content: content,
        metadata: {
          type: 'meeting',
          source: 'google-calendar',
          eventId: event.id,
          priority: 'medium',
          reviewed: false,
          eventDate: startTime,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Google Calendar] Failed to import event ${event.id}:`, error);
    }
  }

  console.log(`[Google Calendar] Imported ${imported}/${events.length} events`);

  return imported;
}

// API endpoint to trigger sync
export async function triggerCalendarSync(userId: string) {
  try {
    const imported = await syncGoogleCalendar(userId);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Google Calendar] Sync error:', error);
    return { success: false, error: error.message };
  }
}
