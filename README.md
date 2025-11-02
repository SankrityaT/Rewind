# 🧠 Rewind - Your Memory Never Forgets

**Proactive memory intelligence that tells you what to do next.**

Rewind is built on top of [Supermemory API](https://supermemory.ai) to provide an intelligent layer that doesn't just store your memories—it tells you what to do with them.

## 🎯 The Problem

- **Supermemory Chat**: You ask → it answers (reactive)
- **Rewind**: It TELLS you what you're forgetting (proactive)

## ✨ Key Features

### 🔴 Smart Alerts
- "You have an interview in 3 days. Last time you prepped 5 days before. Start now?"
- Automatic deadline tracking with urgency ranking
- Unreviewed content detection
- **NEW:** Email digests with daily/weekly summaries

### 📊 Enhanced Pattern Detection
- Discovers your best study times correlated with quiz performance
- Identifies gaps in your knowledge automatically
- Tracks consistency with streak detection
- **NEW:** Retention trend analysis (improving/declining/stable)
- **NEW:** Knowledge gap detection per subject
- **NEW:** Review habit tracking

### 🧠 Quiz Mode
- **NEW:** AI-generated questions from your memories
- **NEW:** Retention score tracking per memory
- **NEW:** Subject-based quizzes
- **NEW:** Self-assessment with detailed results

### 💬 Chat Auto-Save
- **NEW:** Conversations automatically become memories
- **NEW:** Smart detection of learning content
- **NEW:** Metadata extraction (type, subject, priority)

### 📝 Memory Templates
- **NEW:** 6 pre-built templates (Study, Interview, Algorithm, Meeting, Concept, Tip)
- **NEW:** First-person writing style enforcement
- **NEW:** Structured metadata extraction

### 🎯 Context-Aware Modes
- **Study Mode**: Quiz tracking, spaced repetition, weak topic detection
- **Job Search Mode**: Interview pipeline, company research, prep tracking
- **Meeting Mode**: Action items, context from past meetings

### ⏱️ Timeline Intelligence
- Visual timeline of when you learned something
- When you last reviewed it
- When you should review it again

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Memory Engine**: Supermemory API
- **Fonts**: Space Grotesk, Syne, Inter
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Utils**: date-fns

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SUPERMEMORY_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 🎨 Project Structure

```
memoryos/
├── app/
│   ├── landing/          # Landing page
│   ├── dashboard/        # Main dashboard
│   ├── api/
│   │   ├── memories/     # Memory CRUD operations
│   │   ├── search/       # Search endpoint
│   │   └── dashboard/    # Dashboard stats & patterns
├── components/
│   └── dashboard/        # Dashboard UI components
├── lib/
│   ├── supermemory.ts    # Supermemory client
│   └── patterns.ts       # Pattern detection engine
└── types/
    └── index.ts          # TypeScript types
```

## 🧪 Pattern Detection Engine

The pattern detector analyzes your memories to provide:

1. **Urgent Alerts**: Approaching deadlines, unreviewed high-priority items
2. **Attention Alerts**: Knowledge gaps, interview prep imbalances
3. **On Track Alerts**: Consistency streaks, momentum indicators
4. **Behavioral Patterns**: Best study times, retention rates, activity trends

## 🔑 Environment Variables

```env
SUPERMEMORY_API_KEY=your_api_key_here
NEXT_PUBLIC_USER_ID=user_123
GROQ_API_KEY=your_groq_api_key_here  # For AI features (chat, quiz)

# Optional - for email sending
SENDGRID_API_KEY=your_sendgrid_key
# or
RESEND_API_KEY=your_resend_key
```

Get Groq API key (free): https://console.groq.com/

## 📝 Usage

### Adding Memories

```typescript
const memory = await fetch('/api/memories', {
  method: 'POST',
  body: JSON.stringify({
    content: "Studied k-means clustering algorithm",
    metadata: {
      type: 'study',
      subject: 'Machine Learning',
      priority: 'high',
      deadline: '2025-11-05T10:00:00Z'
    }
  })
});
```

### Searching

```typescript
const results = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'clustering algorithms',
    limit: 10
  })
});
```

## 🙏 Acknowledgments

Built with [Supermemory API](https://supermemory.ai) - the memory infrastructure for AI apps.
