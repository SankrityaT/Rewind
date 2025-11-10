import { getToken, isTokenExpired, saveToken } from './token-store';
import { refreshAccessToken } from './oauth-config';
import { supermemoryClient } from '@/lib/supermemory';


interface ZoomMeeting {
  uuid: string;
  id: number;
  topic: string;
  start_time: string;
  duration: number;
  agenda: string;
  recording_count: number;
}

interface ZoomRecording {
  id: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_size: number;
  play_url: string;
  download_url: string;
}

export async function syncZoom(userId: string): Promise<number> {
  const storedToken = await getToken(userId, 'zoom');
  if (!storedToken) {
    throw new Error('Zoom not connected');
  }

  let accessToken = storedToken.accessToken;
  if (await isTokenExpired(storedToken)) {
    if (!storedToken.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[Zoom] Refreshing expired token');
    const newTokens = await refreshAccessToken('zoom', storedToken.refreshToken);
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

  // Fetch meetings from last 30 days
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const toDate = new Date().toISOString().split('T')[0];

  const meetingsUrl = `https://api.zoom.us/v2/users/me/meetings?` +
    `type=previous&` +
    `page_size=50&` +
    `from=${fromDate}&` +
    `to=${toDate}`;

  const meetingsResponse = await fetch(meetingsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!meetingsResponse.ok) {
    const error = await meetingsResponse.text();
    throw new Error(`Failed to fetch Zoom meetings: ${error}`);
  }

  const meetingsData = await meetingsResponse.json();
  const meetings: ZoomMeeting[] = meetingsData.meetings || [];

  console.log(`[Zoom] Found ${meetings.length} meetings`);

  let imported = 0;

  for (const meeting of meetings) {
    try {
      // Try to fetch recording info
      let recordingInfo = '';
      if (meeting.recording_count > 0) {
        try {
          const recordingUrl = `https://api.zoom.us/v2/meetings/${meeting.id}/recordings`;
          const recordingResponse = await fetch(recordingUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (recordingResponse.ok) {
            const recordingData = await recordingResponse.json();
            const recordings: ZoomRecording[] = recordingData.recording_files || [];
            if (recordings.length > 0) {
              recordingInfo = `\n\nRecordings:\n${recordings.map(r =>
                `- ${r.file_type}: ${r.play_url}`
              ).join('\n')}`;
            }
          }
        } catch (err) {
          console.log(`[Zoom] Could not fetch recordings for meeting ${meeting.id}`);
        }
      }

      const startTime = new Date(meeting.start_time);
      const content = `
Zoom Meeting: ${meeting.topic}

Date: ${startTime.toLocaleDateString()}
Time: ${startTime.toLocaleTimeString()}
Duration: ${meeting.duration} minutes
Meeting ID: ${meeting.id}

${meeting.agenda || 'No agenda'}${recordingInfo}
      `.trim();

      await supermemoryClient.memories.add({
        content: content,
        metadata: {
          type: 'meeting',
          source: 'zoom',
          meetingId: meeting.id.toString(),
          meetingUuid: meeting.uuid,
          priority: 'medium',
          reviewed: false,
          eventDate: meeting.start_time,
          hasRecording: meeting.recording_count > 0,
          importedAt: new Date().toISOString(),
          tags: [`user_${userId}`],
        },
      });

      imported++;
    } catch (error) {
      console.error(`[Zoom] Failed to import meeting ${meeting.id}:`, error);
    }
  }

  console.log(`[Zoom] Imported ${imported}/${meetings.length} meetings`);
  return imported;
}

export async function triggerZoomSync(userId: string) {
  try {
    const imported = await syncZoom(userId);
    return { success: true, imported };
  } catch (error: any) {
    console.error('[Zoom] Sync error:', error);
    return { success: false, error: error.message };
  }
}
