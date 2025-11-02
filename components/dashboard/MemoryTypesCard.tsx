'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Briefcase, Users, Heart } from 'lucide-react';

export function MemoryTypesCard() {
  const [types, setTypes] = useState([
    { name: 'Study', count: 0, icon: BookOpen, color: 'bg-blue-500', percent: 0 },
    { name: 'Interview', count: 0, icon: Briefcase, color: 'bg-purple-500', percent: 0 },
    { name: 'Meeting', count: 0, icon: Users, color: 'bg-green-500', percent: 0 },
    { name: 'Personal', count: 0, icon: Heart, color: 'bg-pink-500', percent: 0 },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMemoryTypes();
  }, []);

  const fetchMemoryTypes = async () => {
    try {
      const response = await fetch('/api/memories?limit=200');
      const data = await response.json();
      
      if (data.memories) {
        const counts = {
          study: 0,
          interview: 0,
          meeting: 0,
          personal: 0,
        };

        data.memories.forEach((m: any) => {
          const type = m.metadata?.type;
          if (type && counts.hasOwnProperty(type)) {
            counts[type as keyof typeof counts]++;
          }
        });

        const totalCount = data.memories.length;
        setTotal(totalCount);

        setTypes([
          { 
            name: 'Study', 
            count: counts.study, 
            icon: BookOpen, 
            color: 'bg-blue-500', 
            percent: totalCount > 0 ? Math.round((counts.study / totalCount) * 100) : 0 
          },
          { 
            name: 'Interview', 
            count: counts.interview, 
            icon: Briefcase, 
            color: 'bg-purple-500', 
            percent: totalCount > 0 ? Math.round((counts.interview / totalCount) * 100) : 0 
          },
          { 
            name: 'Meeting', 
            count: counts.meeting, 
            icon: Users, 
            color: 'bg-green-500', 
            percent: totalCount > 0 ? Math.round((counts.meeting / totalCount) * 100) : 0 
          },
          { 
            name: 'Personal', 
            count: counts.personal, 
            icon: Heart, 
            color: 'bg-pink-500', 
            percent: totalCount > 0 ? Math.round((counts.personal / totalCount) * 100) : 0 
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching memory types:', error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative">
        <h3 className="text-lg font-bold text-white mb-6">Memory Types</h3>

        <div className="space-y-4">
          {types.map((type, i) => {
            const Icon = type.icon;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{type.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{type.count}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${type.color} rounded-full transition-all`}
                    style={{ width: `${type.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Memories</span>
            <span className="text-xl font-bold text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
