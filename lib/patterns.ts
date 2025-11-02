import { Memory, Alert, Pattern } from '@/types';
import { differenceInDays, parseISO, format } from 'date-fns';

export class PatternDetector {
  private memories: Memory[];

  constructor(memories: Memory[]) {
    this.memories = memories;
  }

  // Detect urgent alerts
  detectUrgentAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    this.memories.forEach((memory) => {
      const metadata = memory.metadata;
      
      // Unreviewed items with approaching deadlines
      if (!metadata.reviewed && metadata.deadline) {
        const deadline = parseISO(metadata.deadline);
        const daysUntil = differenceInDays(deadline, now);
        
        if (daysUntil <= 1 && daysUntil >= 0) {
          alerts.push({
            id: `urgent-${memory.id}`,
            type: 'urgent',
            title: metadata.type === 'study' 
              ? `${metadata.subject} quiz due in ${daysUntil === 0 ? 'today' : '1 day'}`
              : `${metadata.company} interview in ${daysUntil === 0 ? 'today' : '1 day'}`,
            description: `You haven't reviewed this yet`,
            action: 'Review Now',
            actionLink: `/memory/${memory.id}`,
            memoryId: memory.id,
          });
        }
      }

      // Long unreviewed items
      const daysSinceUpdate = differenceInDays(now, parseISO(memory.updatedAt));
      if (!metadata.reviewed && daysSinceUpdate > 7 && metadata.priority === 'high') {
        alerts.push({
          id: `attention-${memory.id}`,
          type: 'attention',
          title: `${metadata.subject || metadata.company} needs review`,
          description: `Not reviewed for ${daysSinceUpdate} days`,
          action: 'Review',
          memoryId: memory.id,
        });
      }
    });

    return alerts;
  }

  // Detect attention-needed items
  detectAttentionAlerts(): Alert[] {
    const alerts: Alert[] = [];
    
    // Gap detection in study materials
    const studyMemories = this.memories.filter(m => m.metadata.type === 'study');
    const subjects = [...new Set(studyMemories.map(m => m.metadata.subject))];
    
    subjects.forEach(subject => {
      const subjectMemories = studyMemories.filter(m => m.metadata.subject === subject);
      const unreviewedCount = subjectMemories.filter(m => !m.metadata.reviewed).length;
      
      if (unreviewedCount > 3) {
        alerts.push({
          id: `gap-${subject}`,
          type: 'attention',
          title: `${subject}: ${unreviewedCount} unreviewed items`,
          description: 'Gap detected in your study materials',
          action: 'Review All',
        });
      }
    });

    // Interview prep imbalance
    const interviewMemories = this.memories.filter(m => m.metadata.type === 'interview');
    const companies = [...new Set(interviewMemories.map(m => m.metadata.company))];
    
    if (companies.length > 5) {
      const preparedCount = interviewMemories.filter(m => m.metadata.reviewed).length;
      const ratio = preparedCount / interviewMemories.length;
      
      if (ratio < 0.3) {
        alerts.push({
          id: 'interview-imbalance',
          type: 'attention',
          title: `Applied to ${companies.length} companies but only prepped for ${preparedCount}`,
          description: 'Focus your interview preparation',
          action: 'Prioritize',
        });
      }
    }

    return alerts;
  }

  // Detect positive patterns (on track)
  detectOnTrackAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();
    
    // Study consistency
    const recentStudy = this.memories.filter(m => {
      const daysSince = differenceInDays(now, parseISO(m.createdAt));
      return m.metadata.type === 'study' && daysSince <= 7;
    });
    
    if (recentStudy.length >= 4) {
      alerts.push({
        id: 'consistency-study',
        type: 'ontrack',
        title: 'Study consistency: Strong',
        description: `${recentStudy.length} study sessions this week`,
      });
    }

    // Interview prep momentum
    const recentInterview = this.memories.filter(m => {
      const daysSince = differenceInDays(now, parseISO(m.createdAt));
      return m.metadata.type === 'interview' && daysSince <= 7 && m.metadata.reviewed;
    });
    
    if (recentInterview.length >= 2) {
      alerts.push({
        id: 'momentum-interview',
        type: 'ontrack',
        title: 'Interview prep: Active',
        description: `${recentInterview.length} companies researched this week`,
      });
    }

    return alerts;
  }

  // Detect behavioral patterns
  detectPatterns(): Pattern[] {
    const patterns: Pattern[] = [];
    
    // Best study time detection
    const studyMemories = this.memories.filter(m => m.metadata.type === 'study');
    const timeDistribution: { [hour: number]: number } = {};
    
    studyMemories.forEach(m => {
      const hour = parseISO(m.createdAt).getHours();
      timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
    });
    
    const bestHour = Object.entries(timeDistribution)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (bestHour && studyMemories.length > 5) {
      patterns.push({
        type: 'time',
        title: 'Peak productivity time detected',
        description: `You study most frequently around ${bestHour[0]}:00`,
        confidence: Math.min(0.9, (bestHour[1] / studyMemories.length) * 2),
        data: { hour: bestHour[0], count: bestHour[1] },
      });
    }

    // Consistency pattern
    const last7Days = this.memories.filter(m => {
      const daysSince = differenceInDays(new Date(), parseISO(m.createdAt));
      return daysSince <= 7;
    });
    
    const activeDays = new Set(last7Days.map(m => 
      format(parseISO(m.createdAt), 'yyyy-MM-dd')
    )).size;
    
    patterns.push({
      type: 'consistency',
      title: 'Weekly activity',
      description: `Active ${activeDays}/7 days this week`,
      confidence: activeDays / 7,
      data: { activeDays, totalDays: 7 },
    });

    // Retention pattern (if retentionScore exists)
    const reviewedMemories = this.memories.filter(m => 
      m.metadata.reviewed && m.metadata.retentionScore
    );
    
    if (reviewedMemories.length > 0) {
      const avgRetention = reviewedMemories.reduce((sum, m) => 
        sum + (m.metadata.retentionScore || 0), 0
      ) / reviewedMemories.length;
      
      patterns.push({
        type: 'performance',
        title: 'Memory retention',
        description: `${Math.round(avgRetention * 100)}% average recall on reviewed topics`,
        confidence: Math.min(0.95, reviewedMemories.length / 10),
        data: { avgRetention, sampleSize: reviewedMemories.length },
      });
    }

    return patterns;
  }

  // Generate complete dashboard stats
  generateDashboardStats() {
    const urgentAlerts = this.detectUrgentAlerts();
    const attentionAlerts = this.detectAttentionAlerts();
    const onTrackAlerts = this.detectOnTrackAlerts();
    const patterns = this.detectPatterns();

    const timePattern = patterns.find(p => p.type === 'time');
    const consistencyPattern = patterns.find(p => p.type === 'consistency');
    const performancePattern = patterns.find(p => p.type === 'performance');

    return {
      alerts: [...urgentAlerts, ...attentionAlerts, ...onTrackAlerts],
      patterns,
      weeklyInsights: {
        bestStudyTime: timePattern?.data?.hour 
          ? `${timePattern.data.hour}:00 - ${timePattern.data.hour + 2}:00`
          : undefined,
        activityTrend: consistencyPattern?.data?.activeDays >= 5 
          ? 'Strong' 
          : consistencyPattern?.data?.activeDays >= 3 
          ? 'Moderate' 
          : 'Needs improvement',
        retentionRate: performancePattern?.data?.avgRetention,
      },
    };
  }
}
