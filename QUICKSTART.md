# ⚡ Rewind - Quick Start

## 🎯 What is Rewind?

**Rewind** is a proactive memory intelligence dashboard built on Supermemory API.

**The Difference:**
- **Supermemory Chat**: You ask → it answers (reactive)
- **Rewind**: It tells you what you're forgetting (proactive)

---

## 🚀 Get Started in 3 Steps

### 1️⃣ Install & Run
```bash
npm install
npm run dev
```

### 2️⃣ Seed Demo Data
```bash
npm run seed
```

### 3️⃣ Open Dashboard
Visit: http://localhost:3000/dashboard

---

## 🎨 What You'll See

### Landing Page (`/landing`)
- Beautiful dark theme with gradient effects
- Hero section explaining the value prop
- Feature showcase
- Comparison with traditional chat

### Dashboard (`/dashboard`)
- **🔴 Urgent Alerts**: Deadlines approaching, high-priority items
- **⚠️ Attention Needed**: Knowledge gaps, unreviewed content
- **✅ On Track**: Consistency streaks, momentum indicators
- **📊 Insights**: Best study times, retention rates, activity trends
- **📈 Patterns**: Automatically detected behavioral patterns

---

## ➕ Add Your First Memory

1. Click the **+** button (bottom right)
2. Enter your content
3. Select type: Study / Interview / Meeting / Personal
4. Add metadata (subject, company, priority, deadline)
5. Click "Add Memory"

The dashboard will automatically:
- Categorize it
- Track deadlines
- Detect patterns
- Generate alerts

---

## 🧪 Pattern Detection

Rewind automatically analyzes your memories to find:

- **⏰ Best Study Times**: When you're most productive
- **📉 Knowledge Gaps**: Missing topics or chapters
- **🎯 Consistency**: How often you're active
- **🧠 Retention**: How well you remember reviewed content
- **⚡ Urgency**: What needs attention NOW

---

## 🎯 Use Cases

### For Students
- Track quiz deadlines
- Identify weak topics
- Optimize study schedule
- Spaced repetition reminders

### For Job Seekers
- Interview pipeline management
- Company research tracking
- Behavioral story bank
- Prep deadline alerts

### For Professionals
- Meeting action items
- Project commitments
- Knowledge base building
- Context switching

---

## 🔑 Environment Variables

Create `.env.local`:
```env
SUPERMEMORY_API_KEY=your_api_key_here
NEXT_PUBLIC_USER_ID=user_123
```

---

## 📚 Learn More

- **Full README**: See `README.md`
- **Demo Guide**: See `DEMO_GUIDE.md` for hackathon presentation
- **Supermemory Docs**: https://supermemory.ai/docs

---

## 🎬 2-Minute Demo

1. **Show Dashboard** (30s)
   - Urgent alerts already visible
   - No asking needed

2. **Add Memory** (30s)
   - Click +, add study note with deadline
   - Watch it categorize automatically

3. **Show Patterns** (30s)
   - Best study time detection
   - Consistency tracking
   - Retention rates

4. **Compare with Chat** (30s)
   - "In chat, you'd have to ask"
   - "In Rewind, it already knows"

---

## 🏆 Why Rewind Wins

✅ **Proactive** - Tells you what to do next
✅ **Intelligent** - Learns your patterns
✅ **Beautiful** - Modern, polished UI
✅ **Fast** - Sub-300ms recall
✅ **Scalable** - Built on Supermemory API

---

## 🆘 Troubleshooting

**Dashboard shows no data?**
- Run `npm run seed` to add demo data
- Or add memories manually with the + button

**API errors?**
- Check your `SUPERMEMORY_API_KEY` in `.env.local`
- Ensure you have available tokens/searches

**Fonts look wrong?**
- Clear browser cache
- Restart dev server

---

## 📞 Support

Built with ❤️ using Supermemory API

Questions? Check the docs or open an issue!

---

**Ready to never forget again?** 🧠✨
