import { Supermemory } from 'supermemory';

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY || 'sm_qbNVQAPYRRVB7wtu8zNK6H_dCaAHtLeSPWTkqrUXiosjXAWICRoCKvRqrynRHSlsAKPLNpFiYMLUYjLOeWqwEeG',
});

const USER_TAG = 'user_demo_123';

const demoMemories = [
  // Study memories
  {
    content: 'Studied k-means clustering algorithm. Key points: iterative algorithm, minimizes within-cluster variance, sensitive to initial centroids. Need to review Lloyd\'s algorithm implementation.',
    metadata: {
      type: 'study',
      subject: 'Machine Learning',
      priority: 'high',
      reviewed: false,
      deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    }
  },
  {
    content: 'Database indexing lecture notes: B-trees provide O(log n) search time, B+ trees store data only in leaves, better for range queries. Covered clustered vs non-clustered indexes.',
    metadata: {
      type: 'study',
      subject: 'Database Systems',
      priority: 'medium',
      reviewed: true,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      retentionScore: 0.85,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'Neural networks backpropagation: chain rule application, gradient descent optimization, learning rate tuning. Practiced on MNIST dataset.',
    metadata: {
      type: 'study',
      subject: 'Machine Learning',
      priority: 'high',
      reviewed: true,
      lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      retentionScore: 0.92,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'React hooks deep dive: useState, useEffect, useCallback, useMemo. Understanding dependency arrays and avoiding infinite loops.',
    metadata: {
      type: 'study',
      subject: 'Web Development',
      priority: 'medium',
      reviewed: false,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  
  // Interview prep
  {
    content: 'Meta interview prep: System design - design Instagram feed. Discussed CDN, caching strategies, database sharding, real-time updates with WebSockets.',
    metadata: {
      type: 'interview',
      company: 'Meta',
      priority: 'high',
      reviewed: true,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'Google interview research: Company culture emphasizes innovation, 20% time policy, focus on scalability. Products: Search, Cloud, Android. Recent focus on AI/ML.',
    metadata: {
      type: 'interview',
      company: 'Google',
      priority: 'medium',
      reviewed: false,
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'Stripe API design interview prep: RESTful principles, idempotency keys, webhook design, rate limiting strategies. Reviewed their payment processing flow.',
    metadata: {
      type: 'interview',
      company: 'Stripe',
      priority: 'high',
      reviewed: false,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'Amazon leadership principles behavioral prep: Customer obsession story - Crisis Lens hackathon. Ownership - led team through technical challenges. Bias for action - rapid prototyping.',
    metadata: {
      type: 'interview',
      company: 'Amazon',
      priority: 'medium',
      reviewed: true,
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  
  // Meeting notes
  {
    content: 'Team sync with Sarah: Discussed MongoDB integration progress. Committed to finishing API documentation by Friday. Need to address deployment timeline concerns.',
    metadata: {
      type: 'meeting',
      priority: 'high',
      reviewed: false,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    content: 'Professor office hours: Clarified confusion about transaction isolation levels. ACID properties review. Discussed final project requirements.',
    metadata: {
      type: 'meeting',
      priority: 'medium',
      reviewed: true,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
  },
];

async function seedData() {
  console.log('🌱 Seeding demo data...\n');
  
  for (const memory of demoMemories) {
    try {
      const result = await client.memories.add({
        content: memory.content,
        containerTags: [USER_TAG],
        metadata: memory.metadata,
      });
      
      console.log(`✅ Added: ${memory.metadata.type} - ${memory.metadata.subject || memory.metadata.company || 'meeting'}`);
    } catch (error) {
      console.error(`❌ Failed to add memory:`, error.message);
    }
  }
  
  console.log('\n✨ Demo data seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${demoMemories.filter(m => m.metadata.type === 'study').length} study memories`);
  console.log(`- ${demoMemories.filter(m => m.metadata.type === 'interview').length} interview prep memories`);
  console.log(`- ${demoMemories.filter(m => m.metadata.type === 'meeting').length} meeting notes`);
  console.log('\n🚀 Visit http://localhost:3000/dashboard to see your dashboard!');
}

seedData().catch(console.error);
