'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  GmailPreferences,
  GoogleCalendarPreferences,
  OutlookPreferences,
  OutlookCalendarPreferences,
  ZoomPreferences,
  SlackPreferences,
  NotionPreferences,
  GitHubPreferences,
  CanvasPreferences,
  ProviderName,
  TimeRange,
} from '@/lib/integrations/preferences';

interface IntegrationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderName;
  providerDisplayName: string;
}

export default function IntegrationPreferencesModal({
  isOpen,
  onClose,
  provider,
  providerDisplayName,
}: IntegrationPreferencesModalProps) {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current preferences
  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen, provider]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/integrations/preferences/${provider}`);
      const data = await response.json();
      if (data.success) {
        setPreferences(data.preference);
      } else {
        setError('Failed to load preferences');
      }
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/integrations/preferences/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: preferences }),
      });
      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/integrations/preferences/${provider}/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setPreferences(data.preference);
      } else {
        setError('Failed to reset preferences');
      }
    } catch (err) {
      setError('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Configure {providerDisplayName}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading preferences...</div>
          ) : preferences ? (
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Enable sync</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enabled}
                    onChange={(e) =>
                      setPreferences({ ...preferences, enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {preferences.enabled && (
                <>
                  {/* Time Range */}
                  <div>
                    <label className="block text-white font-medium mb-2">Time Range</label>
                    <div className="flex gap-2">
                      {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
                        <button
                          key={range}
                          onClick={() =>
                            setPreferences({ ...preferences, timeRange: range })
                          }
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            preferences.timeRange === range
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Provider-specific filters */}
                  {renderProviderFilters(provider, preferences, setPreferences)}

                  {/* Max items (if applicable) */}
                  {('maxEmails' in preferences || 'maxMessages' in preferences || 'maxRepos' in preferences) && (
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Max items per sync
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={preferences.maxEmails || preferences.maxMessages || preferences.maxRepos}
                        onChange={(e) => {
                          const key = 'maxEmails' in preferences ? 'maxEmails' : 'maxMessages' in preferences ? 'maxMessages' : 'maxRepos';
                          setPreferences({
                            ...preferences,
                            [key]: parseInt(e.target.value) || 1,
                          });
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      />
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-red-400">Failed to load preferences</div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 flex gap-3">
          <button
            onClick={resetToDefaults}
            disabled={saving || loading}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderProviderFilters(
  provider: ProviderName,
  preferences: any,
  setPreferences: (prefs: any) => void
) {
  const updateFilter = (key: string, value: any) => {
    setPreferences({
      ...preferences,
      filters: { ...preferences.filters, [key]: value },
    });
  };

  const CheckboxFilter = ({ label, filterKey }: { label: string; filterKey: string }) => (
    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
      <input
        type="checkbox"
        checked={preferences.filters[filterKey]}
        onChange={(e) => updateFilter(filterKey, e.target.checked)}
        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
      />
      <span>{label}</span>
    </label>
  );

  switch (provider) {
    case 'gmail':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="⭐ Starred emails" filterKey="importStarred" />
            <CheckboxFilter label="🔴 Important emails" filterKey="importImportant" />
            <CheckboxFilter label="📧 Unread emails" filterKey="importUnread" />
            <CheckboxFilter label="🚫 Exclude promotional emails" filterKey="excludePromotions" />
            <CheckboxFilter label="🚫 Exclude social notifications" filterKey="excludeSocial" />
          </div>
        </div>
      );

    case 'google-calendar':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="🤝 Events with attendees" filterKey="importMeetings" />
            <CheckboxFilter label="👤 Solo events" filterKey="importPersonalEvents" />
            <CheckboxFilter label="🔄 Recurring events" filterKey="importRecurring" />
            <CheckboxFilter label="📅 All-day events" filterKey="importAllDayEvents" />
            <CheckboxFilter label="📝 Only events with descriptions" filterKey="onlyWithDescriptions" />
          </div>
        </div>
      );

    case 'outlook':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="🚩 Flagged emails" filterKey="importFlagged" />
            <CheckboxFilter label="❗ High importance" filterKey="importHighImportance" />
            <CheckboxFilter label="📧 Unread emails" filterKey="importUnread" />
          </div>
        </div>
      );

    case 'outlook-calendar':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="🤝 Events with attendees" filterKey="importMeetings" />
            <CheckboxFilter label="💼 Teams meetings only" filterKey="importTeamsMeetings" />
            <CheckboxFilter label="👤 Solo events" filterKey="importPersonalEvents" />
            <CheckboxFilter label="🔄 Recurring events" filterKey="importRecurring" />
            <CheckboxFilter label="📋 Only with agenda/description" filterKey="onlyWithAgenda" />
          </div>
        </div>
      );

    case 'zoom':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="📅 Scheduled meetings" filterKey="importScheduledMeetings" />
            <CheckboxFilter label="✅ Completed meetings" filterKey="importPastMeetings" />
            <CheckboxFilter label="🎥 Recording links" filterKey="importRecordings" />
            <CheckboxFilter label="📝 Only with agenda" filterKey="importWithAgenda" />
          </div>
        </div>
      );

    case 'slack':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="💬 Full threaded conversations" filterKey="importThreads" />
            <CheckboxFilter label="📩 Direct messages" filterKey="importDirectMessages" />
            <CheckboxFilter label="@ Mentions only" filterKey="importMentions" />
            <CheckboxFilter label="⭐ Starred messages" filterKey="importStarred" />
            <CheckboxFilter label="👍 Messages with reactions" filterKey="importReactions" />
          </div>
        </div>
      );

    case 'notion':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="📄 Full pages" filterKey="importPages" />
            <CheckboxFilter label="🗂️ Database entries" filterKey="importDatabases" />
            <CheckboxFilter label="👥 Shared pages only" filterKey="onlySharedPages" />
          </div>
        </div>
      );

    case 'github':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="📦 Repository info" filterKey="importRepos" />
            <CheckboxFilter label="🔀 Pull requests" filterKey="importPullRequests" />
            <CheckboxFilter label="🐛 Issues" filterKey="importIssues" />
            <CheckboxFilter label="💾 Recent commits" filterKey="importCommits" />
            <CheckboxFilter label="👤 Only repos you own" filterKey="onlyOwnedRepos" />
          </div>
        </div>
      );

    case 'canvas':
      return (
        <div>
          <label className="block text-white font-medium mb-3">Import Filters</label>
          <div className="space-y-2">
            <CheckboxFilter label="📝 Assignments" filterKey="importAssignments" />
            <CheckboxFilter label="📢 Announcements" filterKey="importAnnouncements" />
            <CheckboxFilter label="📊 Graded assignments" filterKey="importGrades" />
            <CheckboxFilter label="⏰ Only upcoming due dates" filterKey="onlyUpcoming" />
          </div>
        </div>
      );

    default:
      return null;
  }
}
