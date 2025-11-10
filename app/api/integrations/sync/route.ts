import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { triggerCalendarSync } from '@/lib/integrations/google-calendar';
import { triggerGmailSync } from '@/lib/integrations/gmail';
import { triggerOutlookSync } from '@/lib/integrations/outlook';
import { triggerOutlookCalendarSync } from '@/lib/integrations/outlook-calendar';
import { triggerZoomSync } from '@/lib/integrations/zoom';
import { triggerSlackSync } from '@/lib/integrations/slack';
import { triggerNotionSync } from '@/lib/integrations/notion';
import { triggerCanvasSync } from '@/lib/integrations/canvas';
import { triggerGitHubSync } from '@/lib/integrations/github';

// POST /api/integrations/sync - Trigger sync for a specific integration
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    console.log(`[Sync] Starting sync for ${provider} (user: ${userId})`);

    let result;

    switch (provider) {
      // Google
      case 'google-calendar':
        result = await triggerCalendarSync(userId);
        break;

      case 'gmail':
        result = await triggerGmailSync(userId);
        break;

      // Microsoft
      case 'outlook':
        result = await triggerOutlookSync(userId);
        break;

      case 'outlook-calendar':
        result = await triggerOutlookCalendarSync(userId);
        break;

      // Zoom
      case 'zoom':
        result = await triggerZoomSync(userId);
        break;

      // Slack
      case 'slack':
        result = await triggerSlackSync(userId);
        break;

      // Notion
      case 'notion':
        result = await triggerNotionSync(userId);
        break;

      // Canvas LMS
      case 'canvas':
        result = await triggerCanvasSync(userId);
        break;

      // GitHub
      case 'github':
        result = await triggerGitHubSync(userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown provider' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        provider: provider,
        imported: result.imported,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Sync failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
