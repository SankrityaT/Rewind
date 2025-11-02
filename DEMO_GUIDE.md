# 🎯 Rewind - Hackathon Demo Guide

## 🚀 Quick Start (5 minutes)

### 1. Setup
```bash
cd memoryos
npm install
npm run dev
```

### 2. Seed Demo Data
```bash
npm run seed
```

This adds 10 sample memories:
- 4 study notes (ML, Database, Web Dev)
- 4 interview prep (Meta, Google, Stripe, Amazon)
- 2 meeting notes

### 3. Open App
- Landing: http://localhost:3000/landing
- Dashboard: http://localhost:3000/dashboard

---

## 🎬 Demo Script (2 minutes)

### **[0:00-0:20] Hook - The Problem**
> "I use Supermemory to store everything—class notes, interview prep, meeting notes. But it's **reactive**. I have to remember to ask the right questions."

*Show Supermemory chat interface (if available) or explain*

---

### **[0:20-0:50] Solution - Proactive Intelligence**
> "**Rewind** turns memory into a proactive operating system."

*Navigate to dashboard*

> "Without asking anything, it tells me:
> - ML quiz in 6 hours—I haven't reviewed
> - Interview with Meta in 3 days—here's my prep
> - I committed to finishing API docs for Sarah—it's due Friday"

*Point to each alert section*

---

### **[0:50-1:20] The Intelligence**
*Click into patterns section*

> "Here's the magic—it **learned** from my behavior:
> - I study best around 2-4 PM (based on my activity patterns)
> - I'm active 5/7 days this week (consistency tracking)
> - 85% retention rate on reviewed topics"

*Show the insights panel*

---

### **[1:20-1:50] The Difference**
*Show side-by-side comparison*

> "In Supermemory chat, I'd have to ask:
> - 'What interview do I have?'
> - 'What should I study?'
> - 'What did I commit to Sarah?'
>
> In Rewind, it **already knows** and ranked by urgency."

---

### **[1:50-2:00] Tech Stack**
> "Built on Supermemory API + pattern detection engine + Next.js. Proactive notifications, multi-context intelligence, timeline visualization."

---

## 🎨 Key Screens to Show

### 1. Landing Page (`/landing`)
- **Hero**: "Your Memory Never Forgets"
- **Stats**: 1M+ memories, 10K+ searches, 300ms recall
- **Features**: Smart alerts, pattern detection, context switching
- **Comparison**: Chat vs Dashboard

### 2. Dashboard (`/dashboard`)
- **Urgent Alerts** (red): ML quiz in 6 hours
- **Attention Alerts** (yellow): Unreviewed interview prep
- **On Track** (green): Study consistency strong
- **Insights Panel**: Best study time, activity trend, retention rate
- **Patterns**: Time-based, consistency, performance

### 3. Add Memory (Click + button)
- Show how easy it is to add new memories
- Metadata: type, subject/company, priority, deadline
- Instant categorization

---

## 💡 Talking Points

### Why This Wins

1. **Clear Differentiation**
   - "Supermemory stores memories. Rewind tells you what to do with them."
   - Infrastructure vs Application layer

2. **Proactive > Reactive**
   - No more "What should I do?" questions
   - Dashboard shows ranked priorities automatically

3. **Pattern Detection**
   - Learns your behavior without manual input
   - Surfaces insights you wouldn't discover yourself

4. **Multi-Context Intelligence**
   - Study mode, job search mode, meeting mode
   - Each optimized for specific use cases

5. **Production Ready**
   - Real Supermemory API integration
   - Scalable architecture
   - Beautiful, modern UI

---

## 🎯 Anticipated Questions

### Q: "Why not just add this to Supermemory?"
**A**: "Different use cases. Supermemory is infrastructure (like AWS). Rewind is an application (like Netflix). You can build many specialized apps on Supermemory—this is one for students and job seekers."

### Q: "How does pattern detection work?"
**A**: "Simple but effective rules. We analyze timestamps, quiz scores, review frequency. No complex ML needed—just smart logic that actually helps users."

### Q: "Is it limited to students?"
**A**: "MVP targets students, but the framework works for anyone juggling multiple contexts—founders (fundraising + product + hiring), consultants (multiple clients), etc."

### Q: "How do you handle privacy?"
**A**: "All data stored in Supermemory with user-specific container tags. We never see your content—just analyze patterns client-side."

---

## 📊 Demo Data Breakdown

After running `npm run seed`, you'll have:

**Study Memories:**
- ML: k-means clustering (due in 6 hours) ⚠️
- Database: B-trees (reviewed, 85% retention) ✅
- ML: Neural networks (reviewed, 92% retention) ✅
- Web Dev: React hooks (unreviewed) ⚠️

**Interview Prep:**
- Meta: System design (due in 3 days) 🔴
- Google: Company research (unreviewed) ⚠️
- Stripe: API design (due in 2 weeks) ⚠️
- Amazon: Leadership principles (reviewed) ✅

**Meeting Notes:**
- Team sync with Sarah (action due in 2 days) 🔴
- Professor office hours (reviewed) ✅

---

## 🎨 Visual Highlights

### Landing Page
- **Dark theme** with gradient effects
- **Glassmorphic cards** showing sample alerts
- **Animated gradient text** on hero
- **Mouse-follow spotlight** effect
- **Modern fonts**: Space Grotesk, Syne, Inter

### Dashboard
- **Color-coded alerts**: Red (urgent), Yellow (attention), Green (on track)
- **Gradient insights panel**: Blue-purple gradient
- **Pattern cards**: With confidence scores
- **Floating + button**: For adding memories
- **Clean, modern design**: Inspired by Linear, Vercel

---

## 🚀 Deployment (if time permits)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

---

## 📝 Pitch Deck Outline

**Slide 1: Hook**
- "Your memory is failing you"
- Show cluttered notes, missed deadlines

**Slide 2: Problem**
- Reactive tools require you to remember to ask
- Information overload without prioritization

**Slide 3: Solution**
- Rewind: Proactive memory intelligence
- "We tell you what you're forgetting"

**Slide 4: Demo**
- Live dashboard walkthrough
- Show pattern detection in action

**Slide 5: Differentiation**
- Supermemory vs Rewind comparison table
- Infrastructure vs Application

**Slide 6: Market**
- Students, job seekers, knowledge workers
- Anyone juggling multiple contexts

**Slide 7: Tech**
- Built on Supermemory API
- Pattern detection engine
- Scalable, production-ready

**Slide 8: Traction**
- (If you have usage data)
- User testimonials
- Growth metrics

**Slide 9: Ask**
- What you're looking for
- Next steps

---

## 🎯 Success Metrics

What makes this demo successful:

✅ **Judges understand the value in 30 seconds**
✅ **"Aha!" moment when they see proactive alerts**
✅ **Clear differentiation from Supermemory**
✅ **Technical depth without overengineering**
✅ **Beautiful, polished UI**
✅ **Solves real pain point**

---

## 🔥 Pro Tips

1. **Start with the dashboard, not the landing page**
   - Show value immediately
   - Landing page is for context

2. **Have demo data pre-loaded**
   - Don't waste time adding memories live
   - Focus on showing intelligence

3. **Practice the 2-minute version**
   - Hackathons are fast-paced
   - Hit the key points quickly

4. **Emphasize "proactive vs reactive"**
   - This is your core differentiator
   - Repeat it multiple times

5. **Show, don't tell**
   - Let the dashboard speak for itself
   - Point to specific alerts and patterns

---

Good luck! 🚀
