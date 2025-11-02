// Add meeting memories
const API_BASE = 'http://localhost:3000/api';

async function addMeetingMemories() {
  console.log('📝 Adding meeting memories...\n');
  
  const meetingMemories = [
    // Apple Interview Memory
    {
      content: "Apple interview - totally bombed the Swift coding question. They asked me to implement a custom collection type with protocol conformance. I forgot Swift uses 'mutating' keyword for value types and tried to modify self directly. Also messed up the generic constraints syntax. Need to review: protocols with associated types, value vs reference semantics, and Swift generics. The interviewer was nice but I could tell I lost them.",
      metadata: {
        type: 'interview',
        company: 'Apple',
        priority: 'high',
        reviewed: false,
      }
    },
    
    // Meeting Memories
    {
      content: "1-on-1 with manager today - discussed career growth. She suggested focusing on system design skills for senior role. Action item: complete 2 system design projects by end of quarter. Also mentioned potential team lead opportunity.",
      metadata: {
        type: 'meeting',
        priority: 'high',
        reviewed: false,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      }
    },
    {
      content: "Team standup - Sarah mentioned the API is slow on production. Need to investigate database queries. I volunteered to look into adding indexes. Follow up by Monday.",
      metadata: {
        type: 'meeting',
        priority: 'high',
        reviewed: false,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      }
    },
    {
      content: "Sprint planning - committed to 3 tickets: user authentication, payment integration, email notifications. Estimated 2 weeks. Team agreed on focusing on auth first since it's blocking other features.",
      metadata: {
        type: 'meeting',
        priority: 'medium',
        reviewed: false,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      }
    },
    {
      content: "Code review session - team pointed out I'm not handling edge cases in my validation logic. Need to add null checks and better error messages. Also learned about the new ESLint rules we're adopting.",
      metadata: {
        type: 'meeting',
        priority: 'medium',
        reviewed: false,
      }
    },
    {
      content: "All-hands meeting - company hitting 100k users milestone! CEO announced we're focusing on enterprise features next quarter. Might need to learn more about SSO and RBAC.",
      metadata: {
        type: 'meeting',
        priority: 'low',
        reviewed: false,
      }
    },
    {
      content: "Tech talk on microservices - learned about service mesh and Istio. Key takeaway: don't go microservices until you actually need it. Monolith first, then split when you have clear boundaries.",
      metadata: {
        type: 'meeting',
        priority: 'medium',
        reviewed: false,
      }
    },
  ];

  for (const memory of meetingMemories) {
    try {
      await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory),
      });
      console.log(`✅ Added: ${memory.content.substring(0, 60)}...`);
    } catch (error) {
      console.log(`❌ Failed to add memory`);
    }
  }

  console.log(`\n🎉 Done! Added ${meetingMemories.length} meeting memories!`);
  console.log('💡 Refresh your dashboard to see them!');
}

addMeetingMemories();
