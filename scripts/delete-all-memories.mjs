import { Supermemory } from 'supermemory';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from parent directory
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = new Supermemory(process.env.SUPERMEMORY_API_KEY);
// NEXT_PUBLIC_USER_ID already has "user_" prefix, don't add another "user-"
const USER_CONTAINER_TAG = process.env.NEXT_PUBLIC_USER_ID;

async function deleteAllMemories() {
  console.log(`🗑️  Deleting all memories for ${USER_CONTAINER_TAG}...\n`);

  try {
    // Fetch all memories
    const response = await client.memories.list({
      containerTags: [USER_CONTAINER_TAG],
      limit: 500,
    });

    const memories = response?.results || response?.memories || response?.data || [];
    
    if (memories.length === 0) {
      console.log('✅ No memories to delete!');
      return;
    }

    console.log(`Found ${memories.length} memories to delete...\n`);

    // Delete each memory
    for (const memory of memories) {
      try {
        await client.memories.delete(memory.id);
        console.log(`✅ Deleted: ${memory.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${memory.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Deleted ${memories.length} memories!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteAllMemories();
