// Validation utilities for integration preferences

import {
  type GmailPreferences,
  type GoogleCalendarPreferences,
  type OutlookPreferences,
  type OutlookCalendarPreferences,
  type ZoomPreferences,
  type SlackPreferences,
  type NotionPreferences,
  type GitHubPreferences,
  type CanvasPreferences,
  type TimeRange,
  type ProviderName,
} from './preferences';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidTimeRange(value: any): value is TimeRange {
  return ['7d', '30d', '90d'].includes(value);
}

function isValidNumber(value: any, min: number = 0, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  if (value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

function isValidStringArray(value: any): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function validateGmailPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importStarred !== 'boolean') {
      errors.push('filters.importStarred must be a boolean');
    }
    if (typeof config.filters.importImportant !== 'boolean') {
      errors.push('filters.importImportant must be a boolean');
    }
    if (typeof config.filters.importUnread !== 'boolean') {
      errors.push('filters.importUnread must be a boolean');
    }
    if (!isValidStringArray(config.filters.importFromContacts)) {
      errors.push('filters.importFromContacts must be an array of strings');
    }
    if (typeof config.filters.excludePromotions !== 'boolean') {
      errors.push('filters.excludePromotions must be a boolean');
    }
    if (typeof config.filters.excludeSocial !== 'boolean') {
      errors.push('filters.excludeSocial must be a boolean');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  if (!isValidNumber(config.maxEmails, 1, 100)) {
    errors.push('maxEmails must be a number between 1 and 100');
  }

  return { valid: errors.length === 0, errors };
}

export function validateGoogleCalendarPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importMeetings !== 'boolean') {
      errors.push('filters.importMeetings must be a boolean');
    }
    if (typeof config.filters.importPersonalEvents !== 'boolean') {
      errors.push('filters.importPersonalEvents must be a boolean');
    }
    if (typeof config.filters.importRecurring !== 'boolean') {
      errors.push('filters.importRecurring must be a boolean');
    }
    if (typeof config.filters.importAllDayEvents !== 'boolean') {
      errors.push('filters.importAllDayEvents must be a boolean');
    }
    if (typeof config.filters.onlyWithDescriptions !== 'boolean') {
      errors.push('filters.onlyWithDescriptions must be a boolean');
    }
    if (!isValidNumber(config.filters.minAttendeesCount, 0)) {
      errors.push('filters.minAttendeesCount must be a non-negative number');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  if (!isValidStringArray(config.calendars)) {
    errors.push('calendars must be an array of strings');
  }

  return { valid: errors.length === 0, errors };
}

export function validateOutlookPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importFlagged !== 'boolean') {
      errors.push('filters.importFlagged must be a boolean');
    }
    if (typeof config.filters.importHighImportance !== 'boolean') {
      errors.push('filters.importHighImportance must be a boolean');
    }
    if (typeof config.filters.importUnread !== 'boolean') {
      errors.push('filters.importUnread must be a boolean');
    }
    if (!isValidStringArray(config.filters.importFromContacts)) {
      errors.push('filters.importFromContacts must be an array of strings');
    }
    if (!isValidStringArray(config.filters.folders)) {
      errors.push('filters.folders must be an array of strings');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  if (!isValidNumber(config.maxEmails, 1, 100)) {
    errors.push('maxEmails must be a number between 1 and 100');
  }

  return { valid: errors.length === 0, errors };
}

export function validateOutlookCalendarPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importMeetings !== 'boolean') {
      errors.push('filters.importMeetings must be a boolean');
    }
    if (typeof config.filters.importTeamsMeetings !== 'boolean') {
      errors.push('filters.importTeamsMeetings must be a boolean');
    }
    if (typeof config.filters.importPersonalEvents !== 'boolean') {
      errors.push('filters.importPersonalEvents must be a boolean');
    }
    if (typeof config.filters.importRecurring !== 'boolean') {
      errors.push('filters.importRecurring must be a boolean');
    }
    if (typeof config.filters.onlyWithAgenda !== 'boolean') {
      errors.push('filters.onlyWithAgenda must be a boolean');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  return { valid: errors.length === 0, errors };
}

export function validateZoomPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importScheduledMeetings !== 'boolean') {
      errors.push('filters.importScheduledMeetings must be a boolean');
    }
    if (typeof config.filters.importPastMeetings !== 'boolean') {
      errors.push('filters.importPastMeetings must be a boolean');
    }
    if (typeof config.filters.importRecordings !== 'boolean') {
      errors.push('filters.importRecordings must be a boolean');
    }
    if (typeof config.filters.importWithAgenda !== 'boolean') {
      errors.push('filters.importWithAgenda must be a boolean');
    }
    if (!isValidNumber(config.filters.minDuration, 0)) {
      errors.push('filters.minDuration must be a non-negative number');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSlackPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importThreads !== 'boolean') {
      errors.push('filters.importThreads must be a boolean');
    }
    if (typeof config.filters.importDirectMessages !== 'boolean') {
      errors.push('filters.importDirectMessages must be a boolean');
    }
    if (typeof config.filters.importMentions !== 'boolean') {
      errors.push('filters.importMentions must be a boolean');
    }
    if (typeof config.filters.importStarred !== 'boolean') {
      errors.push('filters.importStarred must be a boolean');
    }
    if (typeof config.filters.importReactions !== 'boolean') {
      errors.push('filters.importReactions must be a boolean');
    }
    if (!isValidNumber(config.filters.minReplies, 0)) {
      errors.push('filters.minReplies must be a non-negative number');
    }
    if (!isValidStringArray(config.filters.channels)) {
      errors.push('filters.channels must be an array of strings');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  if (!isValidNumber(config.maxMessages, 1, 200)) {
    errors.push('maxMessages must be a number between 1 and 200');
  }

  return { valid: errors.length === 0, errors };
}

export function validateNotionPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importPages !== 'boolean') {
      errors.push('filters.importPages must be a boolean');
    }
    if (typeof config.filters.importDatabases !== 'boolean') {
      errors.push('filters.importDatabases must be a boolean');
    }
    if (typeof config.filters.onlySharedPages !== 'boolean') {
      errors.push('filters.onlySharedPages must be a boolean');
    }
    if (!isValidNumber(config.filters.minContentLength, 0)) {
      errors.push('filters.minContentLength must be a non-negative number');
    }
    if (!isValidStringArray(config.filters.databases)) {
      errors.push('filters.databases must be an array of strings');
    }
    if (!isValidStringArray(config.filters.workspaces)) {
      errors.push('filters.workspaces must be an array of strings');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  return { valid: errors.length === 0, errors };
}

export function validateGitHubPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importRepos !== 'boolean') {
      errors.push('filters.importRepos must be a boolean');
    }
    if (typeof config.filters.importPullRequests !== 'boolean') {
      errors.push('filters.importPullRequests must be a boolean');
    }
    if (typeof config.filters.importIssues !== 'boolean') {
      errors.push('filters.importIssues must be a boolean');
    }
    if (typeof config.filters.importCommits !== 'boolean') {
      errors.push('filters.importCommits must be a boolean');
    }
    if (typeof config.filters.onlyOwnedRepos !== 'boolean') {
      errors.push('filters.onlyOwnedRepos must be a boolean');
    }
    if (!['all', 'open', 'closed'].includes(config.filters.prStatus)) {
      errors.push('filters.prStatus must be one of: all, open, closed');
    }
    if (!['all', 'open', 'closed'].includes(config.filters.issueStatus)) {
      errors.push('filters.issueStatus must be one of: all, open, closed');
    }
    if (!isValidStringArray(config.filters.repos)) {
      errors.push('filters.repos must be an array of strings');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  if (!isValidNumber(config.maxRepos, 1, 50)) {
    errors.push('maxRepos must be a number between 1 and 50');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCanvasPreferences(config: any): ValidationResult {
  const errors: string[] = [];

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (config.apiToken !== undefined && typeof config.apiToken !== 'string') {
    errors.push('apiToken must be a string');
  }

  if (config.baseUrl !== undefined && typeof config.baseUrl !== 'string') {
    errors.push('baseUrl must be a string');
  }

  if (!config.filters || typeof config.filters !== 'object') {
    errors.push('filters must be an object');
  } else {
    if (typeof config.filters.importAssignments !== 'boolean') {
      errors.push('filters.importAssignments must be a boolean');
    }
    if (typeof config.filters.importAnnouncements !== 'boolean') {
      errors.push('filters.importAnnouncements must be a boolean');
    }
    if (typeof config.filters.importGrades !== 'boolean') {
      errors.push('filters.importGrades must be a boolean');
    }
    if (typeof config.filters.onlyUpcoming !== 'boolean') {
      errors.push('filters.onlyUpcoming must be a boolean');
    }
    if (!isValidStringArray(config.filters.courses)) {
      errors.push('filters.courses must be an array of strings');
    }
  }

  if (!isValidTimeRange(config.timeRange)) {
    errors.push('timeRange must be one of: 7d, 30d, 90d');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePreference(provider: ProviderName, config: any): ValidationResult {
  switch (provider) {
    case 'gmail':
      return validateGmailPreferences(config);
    case 'google-calendar':
      return validateGoogleCalendarPreferences(config);
    case 'outlook':
      return validateOutlookPreferences(config);
    case 'outlook-calendar':
      return validateOutlookCalendarPreferences(config);
    case 'zoom':
      return validateZoomPreferences(config);
    case 'slack':
      return validateSlackPreferences(config);
    case 'notion':
      return validateNotionPreferences(config);
    case 'github':
      return validateGitHubPreferences(config);
    case 'canvas':
      return validateCanvasPreferences(config);
    default:
      return {
        valid: false,
        errors: [`Unknown provider: ${provider}`],
      };
  }
}
