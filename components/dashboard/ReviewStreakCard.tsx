'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export function ReviewStreakCard() {
  const [streakDays, setStreakDays] = useState(1); // Start with 1 since you started today
  const [todayReviewed, setTodayReviewed] = useState(0);
  const [weekData, setWeekData] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const response = await fetch('/api/memories?limit=100');
      const data = await response.json();
      
      if (data.memories) {
        // Count reviewed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const reviewedToday = data.memories.filter((m: any) => {
          const createdDate = new Date(m.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          return m.metadata?.reviewed && createdDate.getTime() === today.getTime();
        }).length;
        
        setTodayReviewed(reviewedToday);
        
        // Calculate streak (simplified - just check if any reviewed today)
        if (reviewedToday > 0) {
          setStreakDays(1);
          setWeekData([false, false, false, false, true, false, false]); // Only today (Friday)
        }
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden h-full">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Review Streak</h3>
          <Flame className="w-6 h-6 text-orange-400" />
        </div>

        {/* Streak Display */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-white mb-2">{streakDays}</div>
          <div className="text-sm text-gray-400">Days in a row 🔥</div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Today</span>
            <span className="text-sm font-semibold text-white">{todayReviewed}/10</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${(todayReviewed / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="mt-4 flex items-center justify-between">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const completed = weekData[i];
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  completed ? 'bg-orange-500' : 'bg-white/10'
                }`}>
                  {completed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
