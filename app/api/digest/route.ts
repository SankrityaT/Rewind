import { NextRequest, NextResponse } from 'next/server';
import { PatternDetector } from '@/lib/patterns';
import { differenceInDays, parseISO, format } from 'date-fns';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const { email, frequency = 'daily', sendEmail = true } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Fetch memories
    const { supermemoryClient } = await import('@/lib/supermemory');
    const { getUserContainerTag } = await import('@/lib/auth');

    const containerTag = await getUserContainerTag();

    const response: any = await supermemoryClient.memories.list({
      containerTags: [containerTag],
      limit: 200,
    });

    let memories = response?.results || response?.memories || response?.data || [];
    if (Array.isArray(response)) {
      memories = response;
    }

    // Map to include content from summary field
    memories = memories.map((m: any) => ({
      ...m,
      content: m.summary || m.content || '',
    }));

    // Generate digest content
    const digestContent = await generateDigestContent(memories, frequency);

    // Send email via SendGrid if API key is configured and sendEmail is true
    let emailSent = false;
    let emailError = null;

    if (sendEmail && process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rewind.app',
          subject: digestContent.subject,
          text: digestContent.text,
          html: digestContent.html,
        });
        
        emailSent = true;
        console.log('✅ Email sent successfully to:', email);
      } catch (error: any) {
        console.error('❌ SendGrid error:', error.response?.body || error.message);
        emailError = error.response?.body?.errors?.[0]?.message || error.message;
      }
    }

    return NextResponse.json({
      success: true,
      preview: digestContent,
      emailSent,
      emailError,
      message: emailSent 
        ? `✅ Email sent successfully to ${email}!`
        : emailError
        ? `⚠️ Email preview generated but sending failed: ${emailError}`
        : `📧 Email preview generated. ${!process.env.SENDGRID_API_KEY ? 'Add SENDGRID_API_KEY to .env.local to enable sending.' : ''}`,
    });
  } catch (error) {
    console.error('Digest generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 }
    );
  }
}

function getMemoryTitle(memory: any): string {
  // Try metadata fields first
  if (memory.metadata?.subject) return memory.metadata.subject;
  if (memory.metadata?.company) return memory.metadata.company;
  if (memory.metadata?.meetingTitle) return memory.metadata.meetingTitle;
  if (memory.metadata?.problemName) return memory.metadata.problemName;
  
  // Generate from content - take first sentence or first 50 chars
  if (memory.content) {
    const firstSentence = memory.content.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 0 && firstSentence.length <= 60) {
      return firstSentence;
    }
    // Fallback to first 50 chars
    return memory.content.substring(0, 50).trim() + (memory.content.length > 50 ? '...' : '');
  }
  
  return 'Memory Note';
}

async function generateDigestContent(memories: any[], frequency: 'daily' | 'weekly') {
  const detector = new PatternDetector(memories);
  const stats = detector.generateDashboardStats();

  const now = new Date();
  const daysToCheck = frequency === 'daily' ? 1 : 7;

  // Get unreviewed memories
  const unreviewed = memories.filter(m => !m.metadata?.reviewed);
  
  // Get urgent items (deadlines approaching)
  const urgent = memories.filter(m => {
    if (!m.metadata?.deadline) return false;
    const deadline = parseISO(m.metadata.deadline);
    const daysUntil = differenceInDays(deadline, now);
    return daysUntil >= 0 && daysUntil <= 3;
  }).sort((a, b) => {
    const daysA = differenceInDays(parseISO(a.metadata.deadline), now);
    const daysB = differenceInDays(parseISO(b.metadata.deadline), now);
    return daysA - daysB;
  });

  // Get recent activity
  const recentMemories = memories.filter(m => {
    const daysSince = differenceInDays(now, parseISO(m.createdAt));
    return daysSince <= daysToCheck;
  });

  // Build email content
  const subject = frequency === 'daily' 
    ? `📚 Daily Digest - ${urgent.length} urgent items`
    : `📊 Weekly Digest - ${recentMemories.length} new memories`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #667eea; font-size: 20px; }
    .urgent { background: #fff5f5; border-left: 4px solid #f56565; }
    .item { background: white; padding: 15px; border-radius: 6px; margin-bottom: 12px; }
    .item h3 { margin: 0 0 8px 0; font-size: 16px; color: #2d3748; }
    .item p { margin: 0; color: #718096; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px; }
    .badge-urgent { background: #fed7d7; color: #c53030; }
    .badge-study { background: #bee3f8; color: #2c5282; }
    .badge-interview { background: #d6bcfa; color: #553c9a; }
    .stats { display: flex; gap: 15px; margin-top: 20px; }
    .stat { flex: 1; background: white; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; }
    .cta { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; font-weight: 600; }
    .footer { text-align: center; color: #a0aec0; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 ${frequency === 'daily' ? 'Daily' : 'Weekly'} Memory Digest</h1>
    <p>${format(now, 'EEEE, MMMM d, yyyy')}</p>
  </div>

  ${urgent.length > 0 ? `
  <div class="section urgent">
    <h2>🚨 Urgent - Action Required</h2>
    ${urgent.slice(0, 3).map(m => `
      <div class="item">
        <h3>
          <span class="badge badge-urgent">
            ${differenceInDays(parseISO(m.metadata.deadline), now) === 0 ? 'TODAY' : 
              differenceInDays(parseISO(m.metadata.deadline), now) === 1 ? 'TOMORROW' :
              `${differenceInDays(parseISO(m.metadata.deadline), now)} DAYS`}
          </span>
          ${getMemoryTitle(m)}
        </h3>
        <p>${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${unreviewed.length > 0 ? `
  <div class="section">
    <h2>📝 Needs Review (${unreviewed.length} items)</h2>
    ${unreviewed.slice(0, 5).map(m => `
      <div class="item">
        <h3>
          <span class="badge badge-${m.metadata.type}">${m.metadata.type?.toUpperCase()}</span>
          ${getMemoryTitle(m)}
        </h3>
        <p>${m.content.substring(0, 120)}${m.content.length > 120 ? '...' : ''}</p>
      </div>
    `).join('')}
    ${unreviewed.length > 5 ? `<p style="color: #718096; font-size: 14px;">...and ${unreviewed.length - 5} more</p>` : ''}
  </div>
  ` : ''}

  ${stats.patterns.length > 0 ? `
  <div class="section">
    <h2>📊 Your Patterns</h2>
    ${stats.patterns.slice(0, 3).map(p => `
      <div class="item">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>📈 ${frequency === 'daily' ? 'Today' : 'This Week'} at a Glance</h2>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${memories.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat">
        <div class="stat-value">${unreviewed.length}</div>
        <div class="stat-label">Unreviewed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Math.round((memories.filter(m => m.metadata?.reviewed).length / memories.length) * 100) || 0}%</div>
        <div class="stat-label">Retention</div>
      </div>
    </div>
  </div>

  <div style="text-align: center;">
    <a href="http://localhost:3000/dashboard" class="cta">Open Dashboard</a>
  </div>

  <div class="footer">
    <p>You're receiving this because you enabled ${frequency} digests.</p>
    <p>Rewind • Your Memory Never Forgets</p>
  </div>
</body>
</html>
  `;

  return { subject, html, text: generatePlainText(urgent, unreviewed, stats) };
}

function generatePlainText(urgent: any[], unreviewed: any[], stats: any) {
  let text = '🧠 MEMORY DIGEST\n\n';
  
  if (urgent.length > 0) {
    text += '🚨 URGENT:\n';
    urgent.slice(0, 3).forEach(m => {
      text += `- ${m.metadata.subject || m.metadata.company}: ${m.content.substring(0, 100)}\n`;
    });
    text += '\n';
  }

  if (unreviewed.length > 0) {
    text += `📝 NEEDS REVIEW (${unreviewed.length} items):\n`;
    unreviewed.slice(0, 5).forEach(m => {
      text += `- ${m.metadata.subject || 'Untitled'}\n`;
    });
    text += '\n';
  }

  if (stats.patterns.length > 0) {
    text += '📊 PATTERNS:\n';
    stats.patterns.slice(0, 3).forEach((p: any) => {
      text += `- ${p.title}: ${p.description}\n`;
    });
  }

  return text;
}
