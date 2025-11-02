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
    
    // Best study time detection with performance correlation
    const studyMemories = this.memories.filter(m => m.metadata.type === 'study');
    const timeDistribution: { [hour: number]: { count: number; avgScore: number; scores: number[] } } = {};
    
    studyMemories.forEach(m => {
      const hour = parseISO(m.createdAt).getHours();
      if (!timeDistribution[hour]) {
        timeDistribution[hour] = { count: 0, avgScore: 0, scores: [] };
      }
      timeDistribution[hour].count += 1;
      if (m.metadata.retentionScore) {
        timeDistribution[hour].scores.push(m.metadata.retentionScore);
      }
    });

    // Calculate average scores for each hour
    Object.keys(timeDistribution).forEach(hour => {
      const data = timeDistribution[parseInt(hour)];
      if (data.scores.length > 0) {
        data.avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      }
    });
    
    // Find best hour by both frequency and performance
    const bestHourByFrequency = Object.entries(timeDistribution)
      .sort(([, a], [, b]) => b.count - a.count)[0];
    
    const bestHourByPerformance = Object.entries(timeDistribution)
      .filter(([, data]) => data.avgScore > 0)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)[0];
    
    if (bestHourByFrequency && studyMemories.length > 5) {
      const hour = parseInt(bestHourByFrequency[0]);
      const data = bestHourByFrequency[1];
      
      // Format time range properly (handle midnight wrap)
      const endHour = (hour + 2) % 24;
      const timeRange = endHour < hour 
        ? `${hour}:00-${endHour}:00 (next day)`
        : `${hour}:00-${endHour}:00`;
      
      let description = `You study most at ${timeRange}`;
      if (data.avgScore > 0) {
        description += ` with ${Math.round(data.avgScore * 100)}% retention`;
      }
      
      patterns.push({
        type: 'time',
        title: 'Peak productivity time',
        description,
        confidence: Math.min(0.9, (data.count / studyMemories.length) * 2),
        data: { hour, count: data.count, avgScore: data.avgScore },
      });
    }

    if (bestHourByPerformance && bestHourByPerformance[0] !== bestHourByFrequency?.[0]) {
      const hour = parseInt(bestHourByPerformance[0]);
      const data = bestHourByPerformance[1];
      
      // Format time range properly (handle midnight wrap)
      const endHour = (hour + 2) % 24;
      const timeRange = endHour < hour 
        ? `${hour}:00-${endHour}:00 (next day)`
        : `${hour}:00-${endHour}:00`;
      
      patterns.push({
        type: 'performance',
        title: 'Best retention time',
        description: `${Math.round(data.avgScore * 100)}% retention at ${timeRange}`,
        confidence: Math.min(0.85, data.scores.length / 5),
        data: { hour, avgScore: data.avgScore, sampleSize: data.scores.length },
      });
    }

    // Consistency pattern with streak detection
    const last7Days = this.memories.filter(m => {
      const daysSince = differenceInDays(new Date(), parseISO(m.createdAt));
      return daysSince <= 7;
    });
    
    const activeDays = new Set(last7Days.map(m => 
      format(parseISO(m.createdAt), 'yyyy-MM-dd')
    )).size;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    const memoryDates = new Set(this.memories.map(m => 
      format(parseISO(m.createdAt), 'yyyy-MM-dd')
    ));

    while (memoryDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
    
    let description = `Active ${activeDays}/7 days this week`;
    if (currentStreak > 1) {
      description += ` • ${currentStreak} day streak 🔥`;
    }
    
    patterns.push({
      type: 'consistency',
      title: 'Weekly activity',
      description,
      confidence: activeDays / 7,
      data: { activeDays, totalDays: 7, currentStreak },
    });

    // Knowledge gap detection
    const subjects = [...new Set(this.memories.map(m => m.metadata.subject).filter(Boolean))];
    const subjectStats = subjects.map(subject => {
      const subjectMemories = this.memories.filter(m => m.metadata.subject === subject);
      const reviewed = subjectMemories.filter(m => m.metadata.reviewed).length;
      const total = subjectMemories.length;
      const avgRetention = subjectMemories
        .filter(m => m.metadata.retentionScore)
        .reduce((sum, m) => sum + (m.metadata.retentionScore || 0), 0) / 
        (subjectMemories.filter(m => m.metadata.retentionScore).length || 1);
      
      return { subject, reviewed, total, reviewRate: reviewed / total, avgRetention };
    });

    // Find weakest subject
    const weakestSubject = subjectStats
      .filter(s => s.total >= 3)
      .sort((a, b) => {
        const scoreA = (a.reviewRate * 0.5) + (a.avgRetention * 0.5);
        const scoreB = (b.reviewRate * 0.5) + (b.avgRetention * 0.5);
        return scoreA - scoreB;
      })[0];

    if (weakestSubject && weakestSubject.reviewRate < 0.5) {
      patterns.push({
        type: 'gap',
        title: 'Knowledge gap detected',
        description: `${weakestSubject.subject}: only ${Math.round(weakestSubject.reviewRate * 100)}% reviewed`,
        confidence: 0.8,
        data: weakestSubject,
      });
    }

    // Overall retention pattern
    const reviewedMemories = this.memories.filter(m => 
      m.metadata.reviewed && m.metadata.retentionScore
    );
    
    if (reviewedMemories.length > 0) {
      const avgRetention = reviewedMemories.reduce((sum, m) => 
        sum + (m.metadata.retentionScore || 0), 0
      ) / reviewedMemories.length;
      
      const last30Days = reviewedMemories.filter(m => {
        const daysSince = differenceInDays(new Date(), parseISO(m.updatedAt));
        return daysSince <= 30;
      });

      const recentRetention = last30Days.length > 0
        ? last30Days.reduce((sum, m) => sum + (m.metadata.retentionScore || 0), 0) / last30Days.length
        : avgRetention;

      const trend = recentRetention > avgRetention ? 'improving' : 
                    recentRetention < avgRetention ? 'declining' : 'stable';
      
      patterns.push({
        type: 'performance',
        title: 'Memory retention',
        description: `${Math.round(avgRetention * 100)}% average • ${trend} trend`,
        confidence: Math.min(0.95, reviewedMemories.length / 10),
        data: { avgRetention, recentRetention, trend, sampleSize: reviewedMemories.length },
      });
    }

    // Review frequency pattern
    const reviewedLast7Days = this.memories.filter(m => {
      if (!m.metadata.lastReviewed) return false;
      const daysSince = differenceInDays(new Date(), parseISO(m.metadata.lastReviewed));
      return daysSince <= 7;
    }).length;

    if (reviewedLast7Days > 0) {
      patterns.push({
        type: 'habit',
        title: 'Review habit',
        description: `${reviewedLast7Days} items reviewed this week`,
        confidence: 0.7,
        data: { reviewedLast7Days },
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
