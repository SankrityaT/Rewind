// Use the Next.js API routes to clear and add data
const API_BASE = 'http://localhost:3000/api';

async function clearAndAddRealData() {
  console.log('🗑️  Fetching all memories to delete...');
  
  try {
    // Fetch all memories
    const response = await fetch(`${API_BASE}/memories?limit=200`);
    const data = await response.json();
    const memories = data.memories || [];
    
    console.log(`Found ${memories.length} memories to delete\n`);

    // Delete each memory
    for (const memory of memories) {
      try {
        await fetch(`${API_BASE}/memories?id=${memory.id}`, {
          method: 'DELETE',
        });
        console.log(`✅ Deleted: ${memory.content?.substring(0, 40)}...`);
      } catch (error) {
        console.log(`❌ Failed to delete ${memory.id}`);
      }
    }

    console.log('\n✨ All memories deleted!\n');
    console.log('📝 Now adding YOUR real data...\n');

    // Add real personal memories
    const realMemories = [
      // Quiz Mistakes
      {
        content: "Got this wrong on the ML quiz: K-means clustering needs you to specify K upfront. I thought it was automatic. Remember: K-means = you pick K, DBSCAN = automatic clusters.",
        metadata: {
          type: 'study',
          subject: 'Machine Learning',
          priority: 'high',
          reviewed: false,
        }
      },
      {
        content: "Messed up the difference between supervised and unsupervised learning. Supervised = labeled data (like classification), Unsupervised = no labels (like clustering). Need to drill this.",
        metadata: {
          type: 'study',
          subject: 'Machine Learning',
          priority: 'high',
          reviewed: false,
        }
      },

      // LeetCode Problems
      {
        content: "Two Sum - Keep forgetting the HashMap approach. Store complement in map as you iterate. O(n) time, O(n) space. Way better than nested loops O(n²).",
        metadata: {
          type: 'study',
          subject: 'LeetCode',
          priority: 'medium',
          reviewed: false,
        }
      },
      {
        content: "Valid Parentheses - Use a stack! Push opening brackets, pop and check on closing. I keep trying to use counters which doesn't work for nested cases like '([)]'.",
        metadata: {
          type: 'study',
          subject: 'LeetCode',
          priority: 'medium',
          reviewed: false,
        }
      },
      {
        content: "Binary Search - Keep messing up the while condition. It's while (left <= right), not while (left < right). The <= catches the case when they're equal.",
        metadata: {
          type: 'study',
          subject: 'LeetCode',
          priority: 'high',
          reviewed: false,
        }
      },

      // System Design
      {
        content: "Load balancing algorithms I always forget: Round Robin (simple, cycles through), Least Connections (smart, picks least busy), IP Hash (sticky sessions). Round Robin can overload slow servers.",
        metadata: {
          type: 'study',
          subject: 'System Design',
          priority: 'medium',
          reviewed: false,
        }
      },
      {
        content: "CAP theorem - can only pick 2 of 3: Consistency, Availability, Partition tolerance. In practice, partition tolerance is required, so it's really C vs A. MongoDB = CP, Cassandra = AP.",
        metadata: {
          type: 'study',
          subject: 'System Design',
          priority: 'high',
          reviewed: false,
        }
      },

      // Interview Prep with deadline
      {
        content: "Practice system design interview coming up. Need to review: design Instagram feed, design URL shortener, design chat system. Focus on scalability and trade-offs.",
        metadata: {
          type: 'interview',
          company: 'Practice',
          priority: 'high',
          reviewed: false,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        }
      },

      // Random useful things
      {
        content: "Git rebase vs merge - Rebase rewrites history (cleaner), merge preserves history (safer). Use rebase for local branches, merge for shared branches. Don't rebase public commits!",
        metadata: {
          type: 'personal',
          priority: 'low',
          reviewed: false,
        }
      },
      {
        content: "Docker commands I always forget: docker ps -a (show all containers), docker logs <container> (view logs), docker exec -it <container> bash (get shell). docker-compose up -d for detached mode.",
        metadata: {
          type: 'personal',
          priority: 'medium',
          reviewed: false,
        }
      },
    ];

    // Add each memory
    for (const memory of realMemories) {
      try {
        await fetch(`${API_BASE}/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memory),
        });
        console.log(`✅ Added: ${memory.content.substring(0, 50)}...`);
      } catch (error) {
        console.log(`❌ Failed to add memory`);
      }
    }

    console.log('\n🎉 Done! Added', realMemories.length, 'real memories!');
    console.log('\n💡 Refresh your dashboard to see your actual data!');

  } catch (error) {
    console.error('Error:', error);
  }
}

clearAndAddRealData();
