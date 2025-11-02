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

// First-person journal-style memories with realistic metadata
const memories = [
  // React memories - different times, some reviewed
  {
    content: "Studied React hooks today. useState is for simple state, useEffect runs after render. Need to remember: useEffect cleanup function prevents memory leaks. Also learned about dependency array - empty array means run once, no array means run every render.",
    metadata: {
      type: 'study',
      subject: 'React',
      priority: 'high',
      reviewed: true,
      retentionScore: 0.85,
      quizAttempts: 2,
      correctAttempts: 2,
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastQuizzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(), // 5 days ago, 10am
  },
  {
    content: "Learned about React Context API. It's for passing data through component tree without props drilling. Created a ThemeContext for dark mode. Key insight: Context is great for global state but can cause unnecessary re-renders if not careful. Use memo and useMemo to optimize.",
    metadata: {
      type: 'study',
      subject: 'React',
      priority: 'medium',
      reviewed: true,
      retentionScore: 0.75,
      quizAttempts: 3,
      correctAttempts: 2,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastQuizzed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 14 * 60 * 60 * 1000).toISOString(), // 4 days ago, 2pm
  },
  {
    content: "React performance optimization notes. Learned about React.memo for preventing unnecessary re-renders. Also useMemo for expensive calculations and useCallback for function references. Rule of thumb: profile first, optimize later. Don't premature optimize!",
    metadata: {
      type: 'study',
      subject: 'React',
      priority: 'medium',
      reviewed: false,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 21 * 60 * 60 * 1000).toISOString(), // 1 day ago, 9pm
  },

  // System Design memories
  {
    content: "Studied load balancing today. Round Robin is the simplest - just cycles through servers. Least Connections sends traffic to server with fewest active connections. IP Hash uses client IP to determine which server, good for session persistence. Need to remember: Round Robin = simple but can overload, Least Connections = better for varying loads.",
    metadata: {
      type: 'study',
      subject: 'System Design',
      priority: 'high',
      reviewed: true,
      retentionScore: 0.40,
      quizAttempts: 5,
      correctAttempts: 2,
      lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastQuizzed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000).toISOString(), // 6 days ago, 9am
  },
  {
    content: "Database sharding notes. Horizontal sharding splits data across multiple databases by rows. Vertical sharding splits by columns. Key challenge: cross-shard queries are expensive. Learned about consistent hashing for distributing data evenly. Need to review: how to handle shard rebalancing.",
    metadata: {
      type: 'study',
      subject: 'System Design',
      priority: 'high',
      reviewed: false,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 11 * 60 * 60 * 1000).toISOString(), // 3 days ago, 11am
  },
  {
    content: "Caching strategies I learned today. Write-through: write to cache and DB simultaneously (slower writes, consistent). Write-back: write to cache first, DB later (faster but risky). Cache invalidation is the hard part - Phil Karlton was right. TTL helps but not perfect.",
    metadata: {
      type: 'study',
      subject: 'System Design',
      priority: 'medium',
      reviewed: true,
      retentionScore: 0.65,
      quizAttempts: 2,
      correctAttempts: 1,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastQuizzed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 15 * 60 * 60 * 1000).toISOString(), // 2 days ago, 3pm
  },

  // Algorithms
  {
    content: "Solved Two Sum problem today. HashMap approach is O(n) time, O(n) space. Key insight: store complement in map as you iterate. Don't need to check every pair. This pattern works for many array problems - think about what you've seen so far vs what you need.",
    metadata: {
      type: 'study',
      subject: 'Algorithms',
      priority: 'medium',
      reviewed: true,
      retentionScore: 0.90,
      quizAttempts: 2,
      correctAttempts: 2,
      lastReviewed: new Date().toISOString(),
      lastQuizzed: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 20 * 60 * 60 * 1000).toISOString(), // 7 days ago, 8pm
  },
  {
    content: "Binary search practice. Key points: sorted array, O(log n) time. Tricky part is getting the boundaries right - use left <= right, not left < right. Also mid = left + (right - left) / 2 prevents overflow. Made mistake: forgot to update left/right pointers correctly.",
    metadata: {
      type: 'study',
      subject: 'Algorithms',
      priority: 'high',
      reviewed: false,
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 19 * 60 * 60 * 1000).toISOString(), // 4 days ago, 7pm
  },

  // Interview prep
  {
    content: "Google interview prep - they love system design. Need to review: distributed caching, load balancing, database sharding. Practice explaining trade-offs clearly. Remember to ask clarifying questions first. Also need to brush up on behavioral questions - STAR method.",
    metadata: {
      type: 'interview',
      company: 'Google',
      priority: 'high',
      reviewed: false,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    content: "Behavioral interview prep. Prepared stories: 1) Led migration to microservices (leadership), 2) Debugged production issue under pressure (problem-solving), 3) Disagreed with PM on feature priority (conflict resolution). Need to practice telling these concisely.",
    metadata: {
      type: 'interview',
      priority: 'medium',
      reviewed: true,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000).toISOString(),
  },

  // Meeting notes
  {
    content: "Sprint planning - committed to auth refactor and API optimization. Action items: 1) Review OAuth2 flow by Wed, 2) Benchmark current API performance, 3) Schedule design review with Sarah. Need to follow up on database migration timeline.",
    metadata: {
      type: 'meeting',
      meetingTitle: 'Sprint Planning',
      priority: 'high',
      reviewed: false,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    content: "1:1 with manager. Discussed career growth - want to move toward tech lead role. Manager suggested: 1) Lead next big project, 2) Mentor junior devs, 3) Present at team tech talks. Also talked about compensation review coming up in Q2.",
    metadata: {
      type: 'meeting',
      meetingTitle: '1:1 with Manager',
      priority: 'medium',
      reviewed: true,
      lastReviewed: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 14 * 60 * 60 * 1000).toISOString(),
  },

  // Docker (weak area for testing knowledge gaps)
  {
    content: "Docker basics. Container vs VM: containers share OS kernel, VMs have full OS. Dockerfile defines image, docker-compose for multi-container apps. Commands I keep forgetting: docker exec -it for interactive shell, docker logs -f for following logs.",
    metadata: {
      type: 'study',
      subject: 'Docker',
      priority: 'medium',
      reviewed: false,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 13 * 60 * 60 * 1000).toISOString(),
  },
  {
    content: "Docker networking confused me. Bridge network is default - containers can talk to each other. Host network shares host's network stack. Overlay for swarm mode. Still don't fully get how port mapping works with multiple containers.",
    metadata: {
      type: 'study',
      subject: 'Docker',
      priority: 'low',
      reviewed: false,
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 17 * 60 * 60 * 1000).toISOString(),
  },
];

async function seedMemories() {
  console.log('🌱 Seeding realistic memories...\n');

  for (const memory of memories) {
    try {
      const result = await client.memories.add({
        content: memory.content,
        metadata: memory.metadata,
        containerTags: [USER_CONTAINER_TAG],
      });
      
      console.log(`✅ Created: ${memory.metadata.subject || memory.metadata.type} - ${memory.content.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Failed to create memory:`, error.message);
    }
  }

  console.log(`\n🎉 Seeded ${memories.length} realistic memories!`);
  console.log('\n📊 What you should see now:');
  console.log('  - Peak productivity time (most memories at 9am-3pm)');
  console.log('  - Best retention time (high scores at certain hours)');
  console.log('  - 7-day activity streak');
  console.log('  - Knowledge gap: Docker (only 2 unreviewed memories)');
  console.log('  - Weak area: System Design (40% retention)');
  console.log('  - Strong area: Algorithms (90% retention)');
  console.log('  - Memory retention trend (improving/declining)');
}

seedMemories();
