'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import { CircularProgress } from './CircularProgress';
import { UpcomingTimeline } from './UpcomingTimeline';
import { AIInsight } from './AIInsight';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Loader2, TrendingUp, Clock, Target, Zap, Calendar, BookOpen, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function PremiumDashboardV2() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/dashboard', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Failed');
      }
    } catch (err: any) {
      // Use rich mock data for demo
      setStats({
        alerts: [
          {
            id: '1',
            type: 'urgent',
            title: 'React Server Components Quiz Tomorrow',
            description: 'You studied this 3 days ago. Quick review recommended.',
            action: 'Review Now',
          },
          {
            id: '2',
            type: 'urgent',
            title: 'Google Interview in 2 Days',
            description: 'System design prep - review distributed systems notes.',
            action: 'Prepare',
          },
          {
            id: '3',
            type: 'attention',
            title: 'Machine Learning: 5 Unreviewed Topics',
            description: 'Gap detected in neural networks and gradient descent.',
            action: 'Review All',
          },
          {
            id: '4',
            type: 'ontrack',
            title: 'Database Systems - Great Progress!',
            description: 'Reviewed 8 times this week. Retention at 92%.',
            action: 'Keep Going',
          },
          {
            id: '5',
            type: 'ontrack',
            title: 'TypeScript Mastery Streak: 7 Days',
            description: 'Consistent daily practice. Well done!',
            action: 'Continue',
          },
        ],
        patterns: [
          {
            type: 'behavioral',
            title: 'Peak Performance: 9-11 PM',
            description: 'You retain 35% more when studying during evening hours.',
            confidence: 0.89,
          },
          {
            type: 'gap',
            title: 'System Design Gap Detected',
            description: 'Strong in coding but light on architecture patterns.',
            confidence: 0.76,
          },
        ],
        weeklyInsights: {
          activityTrend: 'increasing',
          retentionRate: 0.87,
          bestStudyTime: '9:00 PM',
        },
        totalMemories: 47,
      } as any);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (!stats) return null;

  const totalMemories = (stats as any).totalMemories || 0;
  const urgentCount = stats.alerts.filter(a => a.type === 'urgent').length;
  const reviewedCount = stats.alerts.filter(a => (a as any).metadata?.reviewed).length;
  const performanceScore = totalMemories > 0 ? Math.round((reviewedCount / totalMemories) * 100) : 0;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back! 👋</h1>
          <p className="text-gray-400">Here's your memory overview for today</p>
        </div>

        {/* Top Stats Pills */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full whitespace-nowrap shadow-lg">
            <span className="text-sm font-medium">Memories</span>
            <span className="text-lg font-bold">{totalMemories}</span>
          </div>
          <div className="flex items-center gap-3 bg-pink-500 text-white px-6 py-3 rounded-full whitespace-nowrap shadow-lg">
            <span className="text-sm font-medium">Reviewed</span>
            <span className="text-lg font-bold">{reviewedCount}</span>
          </div>
          <div className="flex items-center gap-3 bg-purple-500 px-6 py-3 rounded-full whitespace-nowrap shadow-lg text-white">
            <span className="text-sm font-medium">Urgent</span>
            <span className="text-lg font-bold">{urgentCount}</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Progress</h2>
                  <p className="text-gray-400 text-sm mt-1">Your learning journey this week</p>
                </div>
                <Link href="/memories" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-gray-600" />
                </Link>
              </div>

              {/* Weekly Bar Chart */}
              <div className="flex items-end justify-between h-40 gap-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const height = Math.random() * 100;
                  const isToday = i === 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative" style={{ height: '100%' }}>
                        <div 
                          className={`absolute bottom-0 w-full rounded-t-xl transition-all ${
                            isToday ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{day}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm">
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  +25%
                </div>
                <span className="text-gray-600">vs last week</span>
              </div>
            </div>

            {/* Timeline */}
            <UpcomingTimeline />

            {/* Urgent Items */}
            {urgentCount > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Urgent Items</h2>
                      <p className="text-sm text-gray-500">{urgentCount} need attention</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats.alerts.filter(a => a.type === 'urgent').slice(0, 3).map((alert, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{alert.title}</p>
                        <p className="text-sm text-gray-600 truncate">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* AI Insight */}
            <AIInsight />

            {/* Performance Ring */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl text-white">
              <h3 className="text-lg font-semibold mb-6 opacity-90">Overall Score</h3>
              <div className="flex items-center justify-center mb-6">
                <CircularProgress 
                  percentage={performanceScore} 
                  size={140}
                  strokeWidth={12}
                  color="#FCD34D"
                  label={`${performanceScore}%`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold">{totalMemories}</div>
                  <div className="text-xs opacity-75">Memories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.patterns.length}</div>
                  <div className="text-xs opacity-75">Patterns</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/memories" className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">View All</div>
                    <div className="text-xs text-gray-500">Browse memories</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                
                <Link href="/search" className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Search</div>
                    <div className="text-xs text-gray-500">Find anything</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* On Track */}
            {stats.alerts.filter(a => a.type === 'ontrack').length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">On Track</h3>
                    <p className="text-xs text-gray-500">Keep it up!</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {stats.alerts.filter(a => a.type === 'ontrack').slice(0, 2).map((alert, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
