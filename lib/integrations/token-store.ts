// Token storage system
// TODO: Replace with database storage (PostgreSQL, MongoDB, etc.)

import { ProviderName } from './oauth-config';

export interface StoredToken {
  userId: string;
  provider: ProviderName;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory storage (for development only - use database in production)
const tokenStore = new Map<string, StoredToken>();

function getKey(userId: string, provider: ProviderName): string {
  return `${userId}:${provider}`;
}

export async function saveToken(token: StoredToken): Promise<void> {
  const key = getKey(token.userId, token.provider);
  token.updatedAt = Date.now();
  tokenStore.set(key, token);

  // TODO: Save to database
  console.log(`[TokenStore] Saved token for ${token.userId}:${token.provider}`);
}

export async function getToken(
  userId: string,
  provider: ProviderName
): Promise<StoredToken | null> {
  const key = getKey(userId, provider);
  const token = tokenStore.get(key);

  // TODO: Fetch from database
  return token || null;
}

export async function deleteToken(
  userId: string,
  provider: ProviderName
): Promise<void> {
  const key = getKey(userId, provider);
  tokenStore.delete(key);

  // TODO: Delete from database
  console.log(`[TokenStore] Deleted token for ${userId}:${provider}`);
}

export async function getAllTokensForUser(
  userId: string
): Promise<StoredToken[]> {
  const tokens: StoredToken[] = [];

  for (const [key, token] of tokenStore.entries()) {
    if (token.userId === userId) {
      tokens.push(token);
    }
  }

  // TODO: Fetch from database
  return tokens;
}

export async function isTokenExpired(token: StoredToken): Promise<boolean> {
  if (!token.expiresAt) return false;
  return Date.now() > token.expiresAt;
}

// Database schema for production
/*
CREATE TABLE oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);
*/
