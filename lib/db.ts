// Database connection pool
import { Pool, PoolClient } from 'pg';

// Lazy initialization - check DATABASE_URL when functions are called, not at import time
let pool: Pool | null = null;
let poolInitialized = false;

function getPool(): Pool | null {
  if (poolInitialized) {
    return pool;
  }

  poolInitialized = true;

  if (!process.env.DATABASE_URL) {
    console.warn('[Database] DATABASE_URL not set - using in-memory storage (development mode)');
    return null;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('[Database] Connection test failed:', err);
    } else {
      console.log('[Database] Connected successfully at', res.rows[0].now);
    }
  });

  return pool;
}

// Export pool getter for backwards compatibility
export { getPool as pool }

// Helper to execute queries
export async function query(text: string, params?: any[]) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database not configured - set DATABASE_URL environment variable');
  }

  const start = Date.now();
  try {
    const res = await currentPool.query(text, params);
    const duration = Date.now() - start;
    console.log('[Database] Query executed', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('[Database] Query error', { text, params, error });
    throw error;
  }
}

// Helper to get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database not configured - set DATABASE_URL environment variable');
  }
  return await currentPool.connect();
}

// Initialize database schema
export async function initializeDatabase() {
  const currentPool = getPool();
  if (!currentPool) {
    console.warn('[Database] Skipping initialization - no DATABASE_URL');
    return;
  }

  console.log('[Database] Initializing schema...');

  try {
    // Create oauth_tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at BIGINT,
        scope TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, provider)
      );
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user
      ON oauth_tokens(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_oauth_tokens_provider
      ON oauth_tokens(provider);
    `);

    // Create integration_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS integration_preferences (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, provider)
      );
    `);

    // Create indexes for preferences
    await query(`
      CREATE INDEX IF NOT EXISTS idx_integration_preferences_user
      ON integration_preferences(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_integration_preferences_provider
      ON integration_preferences(provider);
    `);

    console.log('[Database] Schema initialized successfully');
  } catch (error) {
    console.error('[Database] Schema initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase() {
  const currentPool = getPool();
  if (currentPool) {
    await currentPool.end();
    console.log('[Database] Connection pool closed');
  }
}

// Export types
export type { PoolClient };
