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
      const response = await fetch('/api/memories?limit=500');
      const data = await response.json();
      
      if (data.memories) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        // Count memories created by day (active days)
        const activeDays = new Map<number, number>();
        
        data.memories.forEach((m: any) => {
          const createDate = new Date(m.createdAt);
          createDate.setHours(0, 0, 0, 0);
          const dayTime = createDate.getTime();
          activeDays.set(dayTime, (activeDays.get(dayTime) || 0) + 1);
        });
        
        // Count memories created today
        const todayCount = activeDays.get(todayTime) || 0;
        setTodayReviewed(todayCount);
        
        // Calculate consecutive streak
        // If today has activity, start from today. Otherwise, start from yesterday.
        let streak = 0;
        let checkDate = new Date(today);
        
        // If today is empty, start checking from yesterday to find the streak
        if (todayCount === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        while (true) {
          const checkTime = checkDate.getTime();
          if (activeDays.has(checkTime) && activeDays.get(checkTime)! > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        // If today has activity, include it in the streak
        if (todayCount > 0 && streak === 0) {
          streak = 1;
        }
        
        setStreakDays(Math.max(streak, 0));
        
        // Build week data (last 7 days)
        const weekActive = Array(7).fill(false);
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
        
        for (let i = 0; i < 7; i++) {
          const checkDay = new Date(today);
          checkDay.setDate(checkDay.getDate() - mondayOffset + i);
          checkDay.setHours(0, 0, 0, 0);
          weekActive[i] = activeDays.has(checkDay.getTime()) && activeDays.get(checkDay.getTime())! > 0;
        }
        
        setWeekData(weekActive);
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
          <h3 className="text-lg font-bold text-white">Activity Streak</h3>
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
            <span className="text-sm font-semibold text-white">{todayReviewed}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${Math.min((todayReviewed / 10) * 100, 100)}%` }}
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
