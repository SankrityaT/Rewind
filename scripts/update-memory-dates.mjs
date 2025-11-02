// Update memory dates to be spread over the past few weeks
const API_BASE = 'http://localhost:3000/api';

async function updateMemoryDates() {
  console.log('📅 Updating memory dates...\n');
  
  try {
    // Fetch all memories
    const response = await fetch(`${API_BASE}/memories?limit=200`);
    const data = await response.json();
    const memories = data.memories || [];
    
    console.log(`Found ${memories.length} memories to update\n`);

    // Define realistic date spreads (days ago from today)
    const dateOffsets = [
      1,   // yesterday
      2,   // 2 days ago
      3,   // 3 days ago
      5,   // 5 days ago
      7,   // 1 week ago
      10,  // 10 days ago
      12,  // 12 days ago
      14,  // 2 weeks ago
      16,  // 16 days ago
      18,  // 18 days ago
      21,  // 3 weeks ago
      23,  // 23 days ago
      25,  // 25 days ago
      28,  // 4 weeks ago
      30,  // 30 days ago
      35,  // 5 weeks ago
      40,  // 40 days ago
    ];

    // Update each memory with a different date
    for (let i = 0; i < memories.length; i++) {
      const memory = memories[i];
      const daysAgo = dateOffsets[i % dateOffsets.length];
      const newDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      try {
        // Update via PUT endpoint
        await fetch(`${API_BASE}/memories`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: memory.id,
            content: memory.content,
            metadata: {
              ...memory.metadata,
              date: newDate.toISOString(),
            }
          }),
        });
        
        console.log(`✅ Updated: ${memory.content?.substring(0, 40)}... → ${daysAgo} days ago`);
      } catch (error) {
        console.log(`❌ Failed to update ${memory.id}`);
      }
    }

    console.log('\n🎉 Done! All memories now have realistic dates!');
    console.log('💡 Refresh your dashboard to see the updated timeline!');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateMemoryDates();
