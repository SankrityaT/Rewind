// Token storage system - Database-backed version
import { query, pool } from '@/lib/db';
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

// Fallback to in-memory storage if database not available
const inMemoryStore = new Map<string, StoredToken>();

function getKey(userId: string, provider: ProviderName): string {
  return `${userId}:${provider}`;
}

export async function saveToken(token: StoredToken): Promise<void> {
  // If no database, use in-memory
  const currentPool = pool();
  if (!currentPool) {
    const key = getKey(token.userId, token.provider);
    token.updatedAt = Date.now();
    inMemoryStore.set(key, token);
    console.log(`[TokenStore] (In-Memory) Saved token for ${token.userId}:${token.provider}`);
    return;
  }

  try {
    // Upsert into database
    await query(
      `
      INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at, scope, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7 / 1000.0), to_timestamp($8 / 1000.0))
      ON CONFLICT (user_id, provider)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = EXCLUDED.updated_at
      `,
      [
        token.userId,
        token.provider,
        token.accessToken,
        token.refreshToken || null,
        token.expiresAt || null,
        token.scope || null,
        token.createdAt || Date.now(),
        Date.now(),
      ]
    );

    console.log(`[TokenStore] (Database) Saved token for ${token.userId}:${token.provider}`);
  } catch (error) {
    console.error('[TokenStore] Failed to save token to database:', error);
    // Fallback to in-memory
    const key = getKey(token.userId, token.provider);
    token.updatedAt = Date.now();
    inMemoryStore.set(key, token);
    console.log(`[TokenStore] (Fallback In-Memory) Saved token for ${token.userId}:${token.provider}`);
  }
}

export async function getToken(
  userId: string,
  provider: ProviderName
): Promise<StoredToken | null> {
  // If no database, use in-memory
  const currentPool = pool();
  if (!currentPool) {
    const key = getKey(userId, provider);
    return inMemoryStore.get(key) || null;
  }

  try {
    const result = await query(
      `
      SELECT
        user_id,
        provider,
        access_token,
        refresh_token,
        expires_at,
        scope,
        EXTRACT(EPOCH FROM created_at) * 1000 as created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 as updated_at
      FROM oauth_tokens
      WHERE user_id = $1 AND provider = $2
      `,
      [userId, provider]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      userId: row.user_id,
      provider: row.provider as ProviderName,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      scope: row.scope,
      createdAt: Math.floor(row.created_at),
      updatedAt: Math.floor(row.updated_at),
    };
  } catch (error) {
    console.error('[TokenStore] Failed to get token from database:', error);
    // Fallback to in-memory
    const key = getKey(userId, provider);
    return inMemoryStore.get(key) || null;
  }
}

export async function deleteToken(
  userId: string,
  provider: ProviderName
): Promise<void> {
  // If no database, use in-memory
  const currentPool = pool();
  if (!currentPool) {
    const key = getKey(userId, provider);
    inMemoryStore.delete(key);
    console.log(`[TokenStore] (In-Memory) Deleted token for ${userId}:${provider}`);
    return;
  }

  try {
    await query(
      `
      DELETE FROM oauth_tokens
      WHERE user_id = $1 AND provider = $2
      `,
      [userId, provider]
    );

    console.log(`[TokenStore] (Database) Deleted token for ${userId}:${provider}`);
  } catch (error) {
    console.error('[TokenStore] Failed to delete token from database:', error);
    // Fallback to in-memory
    const key = getKey(userId, provider);
    inMemoryStore.delete(key);
  }
}

export async function getAllTokensForUser(
  userId: string
): Promise<StoredToken[]> {
  // If no database, use in-memory
  const currentPool = pool();
  if (!currentPool) {
    const tokens: StoredToken[] = [];
    for (const [key, token] of inMemoryStore.entries()) {
      if (token.userId === userId) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  try {
    const result = await query(
      `
      SELECT
        user_id,
        provider,
        access_token,
        refresh_token,
        expires_at,
        scope,
        EXTRACT(EPOCH FROM created_at) * 1000 as created_at,
        EXTRACT(EPOCH FROM updated_at) * 1000 as updated_at
      FROM oauth_tokens
      WHERE user_id = $1
      `,
      [userId]
    );

    return result.rows.map((row) => ({
      userId: row.user_id,
      provider: row.provider as ProviderName,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      scope: row.scope,
      createdAt: Math.floor(row.created_at),
      updatedAt: Math.floor(row.updated_at),
    }));
  } catch (error) {
    console.error('[TokenStore] Failed to get all tokens from database:', error);
    // Fallback to in-memory
    const tokens: StoredToken[] = [];
    for (const [key, token] of inMemoryStore.entries()) {
      if (token.userId === userId) {
        tokens.push(token);
      }
    }
    return tokens;
  }
}

export async function isTokenExpired(token: StoredToken): Promise<boolean> {
  if (!token.expiresAt) return false;
  return Date.now() > token.expiresAt;
}
