'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import IntegrationPreferencesModal from '@/components/integration-preferences-modal';
import Image from 'next/image';
import { Settings, Loader2 } from 'lucide-react';
import type { ProviderName } from '@/lib/integrations/preferences';

interface OAuthButtonProps {
  provider: string;
  displayName: string;
  iconPath: string;
  syncProvider?: string;
  description: string;
}

function OAuthButton({ provider, displayName, iconPath, syncProvider, description }: OAuthButtonProps) {
  const [status, setStatus] = useState<'disconnected' | 'connected' | 'loading'>('loading');
  const [syncing, setSyncing] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [provider]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      const data = await response.json();

      // Map provider to OAuth provider name
      const oauthProvider = provider === 'gmail' ? 'google' : provider;

      if (data.tokens && data.tokens[oauthProvider]) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus('disconnected');
    }
  };

  const handleConnect = () => {
    window.location.href = `/api/integrations/oauth/authorize/${provider}`;
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`/api/integrations/status?provider=${provider}`, {
        method: 'DELETE',
      });
      setStatus('disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: syncProvider || provider }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully imported ${data.imported} items from ${displayName}!`);
      } else {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
        <div className="flex items-start gap-4">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={iconPath}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">{displayName}</h3>
            <p className="text-sm text-zinc-400 mb-4">{description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {status === 'loading' ? (
                <div className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Checking...</span>
                </div>
              ) : status === 'disconnected' ? (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Connect
                </button>
              ) : (
                <>
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-400">Connected</span>
                  </div>

                  <button
                    onClick={() => setConfigModalOpen(true)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>

                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      'Sync Now'
                    )}
                  </button>

                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 text-zinc-400 rounded-lg transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <IntegrationPreferencesModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        provider={(syncProvider || provider) as ProviderName}
        providerDisplayName={displayName}
      />
    </>
  );
}

export default function IntegrationsPage() {
  return (
    <DarkBackground>
      <Navigation />

      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-syne">Integrations</h1>
            <p className="text-xl text-zinc-400">
              Connect your tools to automatically import memories from your daily workflow
            </p>
          </div>

          {/* Google Integrations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-syne">Google Workspace</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OAuthButton
                provider="google"
                displayName="Gmail"
                iconPath="/gmail.png"
                syncProvider="gmail"
                description="Import important and starred emails as memories"
              />
              <OAuthButton
                provider="google"
                displayName="Google Calendar"
                iconPath="/google-calendar.png"
                syncProvider="google-calendar"
                description="Capture events, meetings, and calendar notes"
              />
            </div>
          </div>

          {/* Microsoft Integrations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-syne">Microsoft 365</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OAuthButton
                provider="outlook"
                displayName="Outlook Email"
                iconPath="/outlook.png"
                description="Import flagged and important emails"
              />
              <OAuthButton
                provider="outlook-calendar"
                displayName="Outlook Calendar"
                iconPath="/outlook-calendar.png"
                description="Sync meetings and Teams events"
              />
            </div>
          </div>

          {/* Communication Tools */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-syne">Communication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OAuthButton
                provider="zoom"
                displayName="Zoom"
                iconPath="/zoom.png"
                description="Save meeting summaries and recordings"
              />
              <OAuthButton
                provider="slack"
                displayName="Slack"
                iconPath="/slack.png"
                description="Capture important threads and conversations"
              />
            </div>
          </div>

          {/* Productivity Tools */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-syne">Productivity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OAuthButton
                provider="notion"
                displayName="Notion"
                iconPath="/notion.png"
                description="Sync pages and databases from your workspace"
              />
              <OAuthButton
                provider="github"
                displayName="GitHub"
                iconPath="/github.png"
                description="Import repos, PRs, issues, and commits"
              />
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 font-syne">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OAuthButton
                provider="canvas"
                displayName="Canvas LMS"
                iconPath="/canvas.png"
                description="Track assignments, announcements, and grades"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Privacy & Control</h3>
            <p className="text-sm text-blue-200">
              You have full control over what data gets imported. Click <strong>Configure</strong> on any connected integration to customize exactly what types of content become memories. Your OAuth tokens are stored securely and you can disconnect at any time.
            </p>
          </div>
        </div>
      </div>
    </DarkBackground>
  );
}
