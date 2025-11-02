'use client';

import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TimelineEvent {
  title: string;
  date: Date;
  type: 'deadline' | 'review' | 'event';
  priority: 'high' | 'medium' | 'low';
}

export function UpcomingTimeline() {
  // Mock upcoming events - in real app, fetch from API
  const events: TimelineEvent[] = [
    { title: 'React Server Components Quiz', date: addDays(new Date(), 1), type: 'deadline' as const, priority: 'high' as const },
    { title: 'Review ML algorithms', date: addDays(new Date(), 2), type: 'review' as const, priority: 'medium' as const },
    { title: 'Google Interview', date: addDays(new Date(), 7), type: 'event' as const, priority: 'high' as const },
    { title: 'Database Systems Exam', date: addDays(new Date(), 4), type: 'deadline' as const, priority: 'high' as const },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
      case 'review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return AlertCircle;
      case 'review': return Clock;
      case 'event': return Calendar;
      default: return Calendar;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upcoming</h3>
          <p className="text-sm text-gray-500 mt-1">{events.length} events this week</p>
        </div>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {events.map((event, i) => {
          const Icon = getTypeIcon(event.type);
          const daysUntil = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(event.type)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {format(event.date, 'MMM d')}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={`text-xs font-medium ${
                    daysUntil <= 1 ? 'text-red-600' : 
                    daysUntil <= 3 ? 'text-orange-600' : 
                    'text-gray-600'
                  }`}>
                    {daysUntil === 0 ? 'Today' : 
                     daysUntil === 1 ? 'Tomorrow' : 
                     `In ${daysUntil} days`}
                  </span>
                </div>
              </div>
              {event.priority === 'high' && (
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
