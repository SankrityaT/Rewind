'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

export function WeeklyProgressCard() {
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [totalThisWeek, setTotalThisWeek] = useState(0);

  useEffect(() => {
    fetchWeeklyProgress();
  }, []);

  const fetchWeeklyProgress = async () => {
    try {
      const response = await fetch('/api/memories?limit=200');
      const data = await response.json();
      
      if (data.memories) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const counts = [0, 0, 0, 0, 0, 0, 0];
        
        data.memories.forEach((m: any) => {
          const createdDate = new Date(m.createdAt);
          const diffTime = today.getTime() - createdDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Only count memories from this week
          if (diffDays >= 0 && diffDays < 7) {
            const memoryDay = (dayOfWeek - diffDays + 7) % 7;
            counts[memoryDay]++;
          }
        });
        
        setWeeklyData(counts);
        setTotalThisWeek(counts.reduce((a, b) => a + b, 0));
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
    }
  };

  const maxCount = Math.max(...weeklyData, 1);
  const todayIndex = new Date().getDay();

  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Weekly Activity</h3>
            <p className="text-sm text-gray-400">Memories added this week</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{totalThisWeek}</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end justify-between h-24 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
            const count = weeklyData[i];
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isToday = i === todayIndex;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative" style={{ height: '80px' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                      isToday ? 'bg-yellow-400' : count > 0 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{day}</span>
                <span className="text-xs text-white font-semibold">{count}</span>
              </div>
            );
          })}
        </div>

        {totalThisWeek > 0 && (
          <div className="mt-4 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            {totalThisWeek} memories added this week
          </div>
        )}
      </div>
    </div>
  );
}
