#!/usr/bin/env tsx
// Script to set up the database schema
// Usage: npx tsx scripts/setup-database.ts

// Load environment variables from .env.local FIRST
import { config } from 'dotenv';
import { resolve } from 'path';

const result = config({ path: resolve(process.cwd(), '.env.local') });

if (result.error) {
  console.error('Failed to load .env.local:', result.error);
  process.exit(1);
}

console.log('✅ Loaded environment variables from .env.local');
console.log(`📦 DATABASE_URL is ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}\n`);

// Now import db after env is loaded
import { initializeDatabase, closeDatabase } from '../lib/db';

async function main() {
  console.log('🚀 Setting up database schema...\n');

  try {
    await initializeDatabase();
    console.log('\n✅ Database setup complete!');
    console.log('\nTables created:');
    console.log('  - oauth_tokens (for storing OAuth tokens)');
    console.log('  - integration_preferences (for storing user preferences)');
    console.log('\nNext steps:');
    console.log('  1. Update your imports to use token-store-db.ts instead of token-store.ts');
    console.log('  2. Restart your development server');
    console.log('  3. Test by connecting an integration and restarting the server');
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure DATABASE_URL is set in your .env.local file');
    console.error('  2. Check that PostgreSQL is running');
    console.error('  3. Verify database credentials are correct');
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

main();
