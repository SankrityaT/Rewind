// Simple script to add test data via the API
// Run with: node scripts/add-test-data.mjs

const API_BASE = 'http://localhost:3000/api';

const demoMemories = [
  // Computer Science - Algorithms & Data Structures (15 memories)
  {
    content: 'Binary search trees: In-order traversal gives sorted order. Balance factor determines if tree needs rebalancing. AVL trees maintain O(log n) operations.',
    metadata: { type: 'study', subject: 'Algorithms', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Dynamic programming: Memoization vs tabulation. Solved coin change problem - build up from base cases. Time complexity O(n*amount).',
    metadata: { type: 'study', subject: 'Algorithms', priority: 'high', reviewed: true, retentionScore: 0.88 }
  },
  {
    content: 'Graph algorithms: BFS for shortest path in unweighted graphs. DFS for cycle detection. Dijkstra for weighted shortest paths.',
    metadata: { type: 'study', subject: 'Algorithms', priority: 'medium', reviewed: false }
  },
  {
    content: 'Hash tables: Collision resolution with chaining vs open addressing. Load factor affects performance. Python dict uses open addressing.',
    metadata: { type: 'study', subject: 'Data Structures', priority: 'medium', reviewed: true, retentionScore: 0.92 }
  },
  {
    content: 'Sorting algorithms comparison: QuickSort O(n log n) average, O(n²) worst. MergeSort stable, guaranteed O(n log n). HeapSort in-place.',
    metadata: { type: 'study', subject: 'Algorithms', priority: 'low', reviewed: true, retentionScore: 0.95 }
  },
  
  // Machine Learning & AI (12 memories)
  {
    content: 'Neural network architectures: CNNs for images (convolution + pooling), RNNs for sequences, Transformers for attention mechanisms.',
    metadata: { type: 'study', subject: 'Machine Learning', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Gradient descent variants: SGD with momentum, Adam optimizer (adaptive learning rates), learning rate scheduling strategies.',
    metadata: { type: 'study', subject: 'Machine Learning', priority: 'high', reviewed: true, retentionScore: 0.85 }
  },
  {
    content: 'Overfitting prevention: Dropout layers, L1/L2 regularization, early stopping, data augmentation techniques.',
    metadata: { type: 'study', subject: 'Machine Learning', priority: 'medium', reviewed: false }
  },
  {
    content: 'K-means clustering: Initialize centroids randomly, assign points to nearest centroid, update centroids. Sensitive to initialization.',
    metadata: { type: 'study', subject: 'Machine Learning', priority: 'medium', reviewed: true, retentionScore: 0.78 }
  },
  {
    content: 'Decision trees and random forests: Entropy and information gain for splits. Random forests reduce overfitting through ensemble.',
    metadata: { type: 'study', subject: 'Machine Learning', priority: 'low', reviewed: true, retentionScore: 0.90 }
  },
  
  // Web Development (10 memories)
  {
    content: 'React Server Components: Render on server, reduce bundle size, fetch data directly. Use "use client" for interactivity.',
    metadata: { type: 'study', subject: 'Web Development', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Next.js App Router: File-based routing, layouts, loading states, error boundaries. Server actions for mutations.',
    metadata: { type: 'study', subject: 'Web Development', priority: 'high', reviewed: true, retentionScore: 0.87 }
  },
  {
    content: 'TypeScript advanced types: Conditional types, mapped types, template literals. Utility types: Partial, Pick, Omit, Record.',
    metadata: { type: 'study', subject: 'Web Development', priority: 'medium', reviewed: false }
  },
  {
    content: 'CSS Grid vs Flexbox: Grid for 2D layouts, Flexbox for 1D. Grid template areas for complex layouts.',
    metadata: { type: 'study', subject: 'Web Development', priority: 'low', reviewed: true, retentionScore: 0.93 }
  },
  {
    content: 'API design best practices: RESTful conventions, versioning strategies, pagination, rate limiting, error handling.',
    metadata: { type: 'study', subject: 'Web Development', priority: 'medium', reviewed: true, retentionScore: 0.82 }
  },
  
  // Database Systems (8 memories)
  {
    content: 'Database normalization: 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies). Denormalize for performance.',
    metadata: { type: 'study', subject: 'Databases', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'SQL vs NoSQL: SQL for ACID transactions, NoSQL for horizontal scaling. MongoDB for documents, Redis for caching.',
    metadata: { type: 'study', subject: 'Databases', priority: 'medium', reviewed: true, retentionScore: 0.89 }
  },
  {
    content: 'Database indexing: B-tree indexes for range queries, Hash indexes for equality. Covering indexes include all query columns.',
    metadata: { type: 'study', subject: 'Databases', priority: 'high', reviewed: true, retentionScore: 0.91 }
  },
  {
    content: 'Transaction isolation levels: Read uncommitted, read committed, repeatable read, serializable. Trade-off between consistency and performance.',
    metadata: { type: 'study', subject: 'Databases', priority: 'medium', reviewed: false }
  },
  
  // System Design (7 memories)
  {
    content: 'Load balancing strategies: Round robin, least connections, IP hash. Layer 4 vs Layer 7 load balancers.',
    metadata: { type: 'study', subject: 'System Design', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Caching strategies: Cache-aside, write-through, write-back. CDN for static content, Redis for application cache.',
    metadata: { type: 'study', subject: 'System Design', priority: 'high', reviewed: true, retentionScore: 0.86 }
  },
  {
    content: 'Microservices architecture: Service discovery, API gateway, circuit breakers. Event-driven communication with message queues.',
    metadata: { type: 'study', subject: 'System Design', priority: 'medium', reviewed: false }
  },
  {
    content: 'Database sharding: Horizontal partitioning by key ranges or hash. Consistent hashing for even distribution.',
    metadata: { type: 'study', subject: 'System Design', priority: 'medium', reviewed: true, retentionScore: 0.84 }
  },
  
  // Interview Prep - FAANG Companies (15 memories)
  {
    content: 'Google interview: System design - YouTube video streaming. CDN architecture, adaptive bitrate streaming, recommendation engine.',
    metadata: { type: 'interview', company: 'Google', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Meta behavioral: Tell me about a time you failed. Used Crisis Lens project - learned importance of user testing early.',
    metadata: { type: 'interview', company: 'Meta', priority: 'high', reviewed: true }
  },
  {
    content: 'Amazon leadership principles: Ownership story - took responsibility for production bug, implemented monitoring, prevented future issues.',
    metadata: { type: 'interview', company: 'Amazon', priority: 'medium', reviewed: false }
  },
  {
    content: 'Netflix culture research: Freedom and responsibility, context not control, highly aligned loosely coupled teams.',
    metadata: { type: 'interview', company: 'Netflix', priority: 'medium', reviewed: true }
  },
  {
    content: 'Apple design philosophy: Focus on user experience, attention to detail, integration of hardware and software.',
    metadata: { type: 'interview', company: 'Apple', priority: 'low', reviewed: false }
  },
  {
    content: 'Microsoft Azure prep: Cloud services overview, serverless computing, container orchestration with AKS.',
    metadata: { type: 'interview', company: 'Microsoft', priority: 'medium', reviewed: true }
  },
  {
    content: 'Stripe payments deep dive: Payment intents, webhooks, idempotency, PCI compliance, fraud detection.',
    metadata: { type: 'interview', company: 'Stripe', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Airbnb coding challenge: Implement search with filters. Used trie for autocomplete, Elasticsearch for full-text search.',
    metadata: { type: 'interview', company: 'Airbnb', priority: 'high', reviewed: true }
  },
  {
    content: 'Uber system design: Real-time location tracking, surge pricing algorithm, driver-rider matching optimization.',
    metadata: { type: 'interview', company: 'Uber', priority: 'medium', reviewed: false }
  },
  {
    content: 'Salesforce CRM concepts: Lead management, opportunity tracking, custom objects, Apex programming.',
    metadata: { type: 'interview', company: 'Salesforce', priority: 'low', reviewed: false }
  },
  
  // Meeting Notes (8 memories)
  {
    content: 'Sprint planning: Committed to 3 features - user authentication, payment integration, email notifications. 2-week sprint.',
    metadata: { type: 'meeting', priority: 'high', reviewed: false, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() }
  },
  {
    content: 'Code review session: Discussed async/await best practices, error handling patterns, testing strategies.',
    metadata: { type: 'meeting', priority: 'medium', reviewed: true }
  },
  {
    content: 'Professor office hours: Clarified doubts on compiler design - lexical analysis, parsing techniques, code generation.',
    metadata: { type: 'meeting', priority: 'medium', reviewed: false }
  },
  {
    content: 'Team retrospective: What went well - faster deployments. What to improve - better documentation, more pair programming.',
    metadata: { type: 'meeting', priority: 'low', reviewed: true }
  },
  {
    content: '1-on-1 with manager: Career growth discussion, feedback on recent project, goals for next quarter.',
    metadata: { type: 'meeting', priority: 'medium', reviewed: false }
  },
  
  // Personal Projects & Ideas (5 memories)
  {
    content: 'Project idea: Build a habit tracker with streak visualization, reminders, and social accountability features.',
    metadata: { type: 'personal', priority: 'low', reviewed: false }
  },
  {
    content: 'Side project: Chrome extension for saving articles with tags and full-text search. Use IndexedDB for offline storage.',
    metadata: { type: 'personal', priority: 'medium', reviewed: false }
  },
  {
    content: 'Blog post idea: "Understanding React Reconciliation" - explain virtual DOM, fiber architecture, diffing algorithm.',
    metadata: { type: 'personal', priority: 'low', reviewed: false }
  },
  {
    content: 'Open source contribution: Fixed bug in popular npm package, submitted PR with tests and documentation.',
    metadata: { type: 'personal', priority: 'medium', reviewed: true }
  },
  {
    content: 'Learning goal: Master Rust programming - ownership, borrowing, lifetimes. Build a CLI tool for practice.',
    metadata: { type: 'personal', priority: 'low', reviewed: false }
  },
];

async function addMemory(memory, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      if (!response.ok) {
        const error = await response.text();
        
        // If 500 error and we have retries left, wait and retry
        if (response.status === 500 && attempt < retries) {
          console.log(`  ⚠️  Retry ${attempt}/${retries - 1} after rate limit...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
          continue;
        }
        
        throw new Error(`Failed to add memory: ${error}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (attempt === retries) {
        console.error('  Error adding memory:', error.message);
        throw error;
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting to add test data...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < demoMemories.length; i++) {
    const memory = demoMemories[i];
    try {
      console.log(`[${i + 1}/${demoMemories.length}] Adding ${memory.metadata.type} memory...`);
      await addMemory(memory);
      successCount++;
      console.log(`✅ Success!\n`);
      
      // Longer delay to avoid rate limiting (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      failCount++;
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n📚 Memory breakdown:`);
  console.log(`  - Algorithms & Data Structures: 5`);
  console.log(`  - Machine Learning: 5`);
  console.log(`  - Web Development: 5`);
  console.log(`  - Databases: 4`);
  console.log(`  - System Design: 4`);
  console.log(`  - Interview Prep (10 companies): 10`);
  console.log(`  - Meeting Notes: 5`);
  console.log(`  - Personal Projects: 5`);
  console.log(`\n🎉 Done! Visit http://localhost:3000/dashboard to see your data!`);
}

main().catch(console.error);
