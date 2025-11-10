// Integration Preferences Types and Default Configurations

export type TimeRange = '7d' | '30d' | '90d';

// ========== Gmail ==========
export interface GmailPreferences {
  enabled: boolean;
  filters: {
    importStarred: boolean;
    importImportant: boolean;
    importUnread: boolean;
    importFromContacts: string[];
    excludePromotions: boolean;
    excludeSocial: boolean;
  };
  timeRange: TimeRange;
  maxEmails: number;
}

export const DEFAULT_GMAIL_PREFERENCES: GmailPreferences = {
  enabled: true,
  filters: {
    importStarred: true,
    importImportant: true,
    importUnread: false,
    importFromContacts: [],
    excludePromotions: true,
    excludeSocial: true,
  },
  timeRange: '30d',
  maxEmails: 20,
};

// ========== Google Calendar ==========
export interface GoogleCalendarPreferences {
  enabled: boolean;
  filters: {
    importMeetings: boolean;
    importPersonalEvents: boolean;
    importRecurring: boolean;
    importAllDayEvents: boolean;
    onlyWithDescriptions: boolean;
    minAttendeesCount: number;
  };
  timeRange: TimeRange;
  calendars: string[];
}

export const DEFAULT_GOOGLE_CALENDAR_PREFERENCES: GoogleCalendarPreferences = {
  enabled: true,
  filters: {
    importMeetings: true,
    importPersonalEvents: true,
    importRecurring: false,
    importAllDayEvents: false,
    onlyWithDescriptions: false,
    minAttendeesCount: 0,
  },
  timeRange: '30d',
  calendars: [],
};

// ========== Outlook Email ==========
export interface OutlookPreferences {
  enabled: boolean;
  filters: {
    importFlagged: boolean;
    importHighImportance: boolean;
    importUnread: boolean;
    importFromContacts: string[];
    folders: string[];
  };
  timeRange: TimeRange;
  maxEmails: number;
}

export const DEFAULT_OUTLOOK_PREFERENCES: OutlookPreferences = {
  enabled: true,
  filters: {
    importFlagged: true,
    importHighImportance: true,
    importUnread: false,
    importFromContacts: [],
    folders: [],
  },
  timeRange: '30d',
  maxEmails: 20,
};

// ========== Outlook Calendar ==========
export interface OutlookCalendarPreferences {
  enabled: boolean;
  filters: {
    importMeetings: boolean;
    importTeamsMeetings: boolean;
    importPersonalEvents: boolean;
    importRecurring: boolean;
    onlyWithAgenda: boolean;
  };
  timeRange: TimeRange;
}

export const DEFAULT_OUTLOOK_CALENDAR_PREFERENCES: OutlookCalendarPreferences = {
  enabled: true,
  filters: {
    importMeetings: true,
    importTeamsMeetings: true,
    importPersonalEvents: true,
    importRecurring: false,
    onlyWithAgenda: false,
  },
  timeRange: '30d',
};

// ========== Zoom ==========
export interface ZoomPreferences {
  enabled: boolean;
  filters: {
    importScheduledMeetings: boolean;
    importPastMeetings: boolean;
    importRecordings: boolean;
    importWithAgenda: boolean;
    minDuration: number;
  };
  timeRange: TimeRange;
}

export const DEFAULT_ZOOM_PREFERENCES: ZoomPreferences = {
  enabled: true,
  filters: {
    importScheduledMeetings: true,
    importPastMeetings: true,
    importRecordings: true,
    importWithAgenda: false,
    minDuration: 0,
  },
  timeRange: '30d',
};

// ========== Slack ==========
export interface SlackPreferences {
  enabled: boolean;
  filters: {
    importThreads: boolean;
    importDirectMessages: boolean;
    importMentions: boolean;
    importStarred: boolean;
    importReactions: boolean;
    minReplies: number;
    channels: string[];
  };
  timeRange: TimeRange;
  maxMessages: number;
}

export const DEFAULT_SLACK_PREFERENCES: SlackPreferences = {
  enabled: true,
  filters: {
    importThreads: true,
    importDirectMessages: false,
    importMentions: true,
    importStarred: true,
    importReactions: false,
    minReplies: 0,
    channels: [],
  },
  timeRange: '30d',
  maxMessages: 50,
};

// ========== Notion ==========
export interface NotionPreferences {
  enabled: boolean;
  filters: {
    importPages: boolean;
    importDatabases: boolean;
    onlySharedPages: boolean;
    minContentLength: number;
    databases: string[];
    workspaces: string[];
  };
  timeRange: TimeRange;
}

export const DEFAULT_NOTION_PREFERENCES: NotionPreferences = {
  enabled: true,
  filters: {
    importPages: true,
    importDatabases: true,
    onlySharedPages: false,
    minContentLength: 0,
    databases: [],
    workspaces: [],
  },
  timeRange: '30d',
};

// ========== GitHub ==========
export interface GitHubPreferences {
  enabled: boolean;
  filters: {
    importRepos: boolean;
    importPullRequests: boolean;
    importIssues: boolean;
    importCommits: boolean;
    onlyOwnedRepos: boolean;
    prStatus: 'all' | 'open' | 'closed';
    issueStatus: 'all' | 'open' | 'closed';
    repos: string[];
  };
  timeRange: TimeRange;
  maxRepos: number;
}

export const DEFAULT_GITHUB_PREFERENCES: GitHubPreferences = {
  enabled: true,
  filters: {
    importRepos: true,
    importPullRequests: true,
    importIssues: true,
    importCommits: false,
    onlyOwnedRepos: false,
    prStatus: 'all',
    issueStatus: 'open',
    repos: [],
  },
  timeRange: '30d',
  maxRepos: 10,
};

// ========== Canvas LMS ==========
export interface CanvasPreferences {
  enabled: boolean;
  apiToken?: string;
  baseUrl?: string;
  filters: {
    importAssignments: boolean;
    importAnnouncements: boolean;
    importGrades: boolean;
    onlyUpcoming: boolean;
    courses: string[];
  };
  timeRange: TimeRange;
}

export const DEFAULT_CANVAS_PREFERENCES: CanvasPreferences = {
  enabled: true,
  filters: {
    importAssignments: true,
    importAnnouncements: true,
    importGrades: true,
    onlyUpcoming: true,
    courses: [],
  },
  timeRange: '30d',
};

// ========== Union Type ==========
export type IntegrationPreference =
  | GmailPreferences
  | GoogleCalendarPreferences
  | OutlookPreferences
  | OutlookCalendarPreferences
  | ZoomPreferences
  | SlackPreferences
  | NotionPreferences
  | GitHubPreferences
  | CanvasPreferences;

export type ProviderName =
  | 'gmail'
  | 'google-calendar'
  | 'outlook'
  | 'outlook-calendar'
  | 'zoom'
  | 'slack'
  | 'notion'
  | 'github'
  | 'canvas';

// ========== Helper Functions ==========
export function getDefaultPreferences(provider: ProviderName): IntegrationPreference {
  switch (provider) {
    case 'gmail':
      return DEFAULT_GMAIL_PREFERENCES;
    case 'google-calendar':
      return DEFAULT_GOOGLE_CALENDAR_PREFERENCES;
    case 'outlook':
      return DEFAULT_OUTLOOK_PREFERENCES;
    case 'outlook-calendar':
      return DEFAULT_OUTLOOK_CALENDAR_PREFERENCES;
    case 'zoom':
      return DEFAULT_ZOOM_PREFERENCES;
    case 'slack':
      return DEFAULT_SLACK_PREFERENCES;
    case 'notion':
      return DEFAULT_NOTION_PREFERENCES;
    case 'github':
      return DEFAULT_GITHUB_PREFERENCES;
    case 'canvas':
      return DEFAULT_CANVAS_PREFERENCES;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function isValidProvider(provider: string): provider is ProviderName {
  return [
    'gmail',
    'google-calendar',
    'outlook',
    'outlook-calendar',
    'zoom',
    'slack',
    'notion',
    'github',
    'canvas',
  ].includes(provider);
}

// ========== In-Memory Storage ==========
// Simple in-memory storage for preferences
// In production, this would be replaced with a database
const preferencesStore = new Map<string, Map<ProviderName, IntegrationPreference>>();

export function getUserPreferencesStore(userId: string): Map<ProviderName, IntegrationPreference> {
  if (!preferencesStore.has(userId)) {
    preferencesStore.set(userId, new Map());
  }
  return preferencesStore.get(userId)!;
}

export function getPreference(userId: string, provider: ProviderName): IntegrationPreference {
  const userStore = getUserPreferencesStore(userId);
  if (!userStore.has(provider)) {
    // Return default if not set
    return getDefaultPreferences(provider);
  }
  return userStore.get(provider)!;
}

export function setPreference(
  userId: string,
  provider: ProviderName,
  config: IntegrationPreference
): void {
  const userStore = getUserPreferencesStore(userId);
  userStore.set(provider, config);
}

export function resetPreference(userId: string, provider: ProviderName): IntegrationPreference {
  const userStore = getUserPreferencesStore(userId);
  const defaultConfig = getDefaultPreferences(provider);
  userStore.set(provider, defaultConfig);
  return defaultConfig;
}

export function getAllPreferences(userId: string): Record<ProviderName, IntegrationPreference> {
  const userStore = getUserPreferencesStore(userId);
  const allProviders: ProviderName[] = [
    'gmail',
    'google-calendar',
    'outlook',
    'outlook-calendar',
    'zoom',
    'slack',
    'notion',
    'github',
    'canvas',
  ];

  const result: Partial<Record<ProviderName, IntegrationPreference>> = {};

  for (const provider of allProviders) {
    result[provider] = getPreference(userId, provider);
  }

  return result as Record<ProviderName, IntegrationPreference>;
}
