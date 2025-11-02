'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ProfileCard } from './ProfileCard';
import { CalendarView } from './CalendarView';
import { ReviewStreakCard } from './ReviewStreakCard';
import { MemoryTypesCard } from './MemoryTypesCard';
import { WeeklyProgressCard } from './WeeklyProgressCard';
import { AIInsight } from './AIInsight';
import { SmartAlerts } from './SmartAlerts';
import { TrendingUp, Users, Briefcase, Target, Brain, Zap } from 'lucide-react';

type FocusMode = 'study' | 'job' | 'meeting' | 'browse';

interface PremiumDashboardV3Props {
  focusMode: FocusMode;
}

export function PremiumDashboardV3({ focusMode }: PremiumDashboardV3Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturningUser] = useState(true); // Track if user has visited before
  const [realStats, setRealStats] = useState({ total: 0, reviewed: 0, retention: 0, study: 0, interview: 0 });
  const [allMemories, setAllMemories] = useState<any[]>([]);

  const fetchRealStats = async () => {
    try {
      const response = await fetch('/api/memories?limit=200');
      const data = await response.json();
      
      if (data.memories) {
        let memories = data.memories;
        
        // Store all memories for alerts
        setAllMemories(memories);
        
        // Filter by focus mode
        if (focusMode !== 'browse') {
          memories = memories.filter((m: any) => {
            if (focusMode === 'study') return m.metadata?.type === 'study';
            if (focusMode === 'job') return m.metadata?.type === 'interview';
            if (focusMode === 'meeting') return m.metadata?.type === 'meeting';
            return true;
          });
        }
        
        const total = memories.length;
        const reviewed = memories.filter((m: any) => m.metadata?.reviewed).length;
        const study = memories.filter((m: any) => m.metadata?.type === 'study').length;
        const interview = memories.filter((m: any) => m.metadata?.type === 'interview').length;
        
        // Calculate ACTUAL retention from quiz scores (same as pattern detector)
        const memoriesWithRetention = memories.filter((m: any) => 
          m.metadata?.retentionScore !== undefined && m.metadata?.retentionScore !== null
        );
        
        const avgRetention = memoriesWithRetention.length > 0
          ? memoriesWithRetention.reduce((sum: number, m: any) => 
              sum + (m.metadata.retentionScore || 0), 0
            ) / memoriesWithRetention.length
          : (reviewed / total); // Fallback to review rate if no quiz data
        
        setRealStats({
          total,
          reviewed,
          retention: Math.round(avgRetention * 100), // ACTUAL quiz retention, not just reviewed %
          study: total > 0 ? Math.round((study / total) * 100) : 0,
          interview: total > 0 ? Math.round((interview / total) * 100) : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching real stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchRealStats();
  }, [focusMode]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/dashboard', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data:', data);
        setStats(data);
      } else {
        throw new Error('Failed to fetch dashboard');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      // Set empty stats if API fails
      setStats({
        alerts: [],
        patterns: [],
        weeklyInsights: { activityTrend: 'stable', retentionRate: 0, bestStudyTime: null },
        totalMemories: 0,
      } as any);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (!stats) return null;

  const totalMemories = realStats.total;
  const reviewedCount = realStats.reviewed;
  const retentionRate = realStats.retention;
  const studyPercent = realStats.study;
  const interviewPercent = realStats.interview;
  const reviewedPercent = totalMemories > 0 ? Math.round((reviewedCount / totalMemories) * 100) : 0;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 font-syne">
            Welcome {isReturningUser ? 'back' : 'in'}, Sankritya 👋
          </h1>
          <p className="text-gray-400">Here's what you need to focus on today</p>
        </div>

        {/* Top Pills */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap">
            <span className="text-gray-400">Study:</span> <span className="ml-2">{studyPercent}%</span>
          </div>
          <div className="bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
            <span>Interview Prep:</span> <span className="ml-2">{interviewPercent}%</span>
          </div>
          <div className="bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg">
            <span>Reviewed:</span> <span className="ml-2">{reviewedPercent}%</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Memories</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalMemories}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Reviewed</span>
              </div>
              <div className="text-3xl font-bold text-white">{reviewedCount}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Retention</span>
              </div>
              <div className="text-3xl font-bold text-white">{retentionRate}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {reviewedPercent}% reviewed • Quiz avg
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Single Column Container */}
          <div className="flex flex-col gap-6 h-full">
            <ProfileCard />
            <MemoryTypesCard />
          </div>

          {/* Middle Content - 2 columns, matches left height */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Progress Card */}
            <WeeklyProgressCard />

            {/* Calendar - Fills remaining space */}
            <div className="flex-1">
              <CalendarView />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6 h-full">
            {/* Rewind Says - Smart Alerts - Fixed Height, Scrollable */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl flex flex-col max-h-[400px]">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <span className="text-lg">🎯</span>
                <h3 className="text-base font-bold text-white font-syne">Rewind says</h3>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <SmartAlerts memories={allMemories} />
              </div>
            </div>

            {/* Review Streak - Takes remaining space */}
            <div className="flex-1">
              <ReviewStreakCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
