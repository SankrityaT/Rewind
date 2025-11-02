'use client';

import { Pattern } from '@/types';
import { TrendingUp, Clock, Target, BarChart } from 'lucide-react';

interface PatternCardProps {
  pattern: Pattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const getIcon = () => {
    switch (pattern.type) {
      case 'time':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'consistency':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <BarChart className="w-5 h-5 text-gray-500" />;
    }
  };

  const confidencePercentage = Math.round(pattern.confidence * 100);

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{confidencePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
