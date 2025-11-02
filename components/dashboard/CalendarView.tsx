'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, differenceInDays, differenceInHours, isPast, isFuture } from 'date-fns';
import { Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, AlertTriangle, CheckCircle, Timer } from 'lucide-react';
import { Memory } from '@/types';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  day: number;
  attendees?: number;
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange';
  location?: string;
  deadline?: string;
  reviewed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export function CalendarView() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch memories with deadlines
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/memories?limit=200');
        const data = await response.json();
        // Filter only memories with deadlines
        const withDeadlines = data.memories.filter((m: Memory) => m.metadata?.deadline);
        console.log('[Calendar] Fetched memories with deadlines:', withDeadlines.length);
        withDeadlines.forEach((m: Memory) => {
          console.log('[Calendar] Deadline:', m.metadata?.deadline, 'Subject:', m.metadata?.subject);
        });
        setMemories(withDeadlines);
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);
  
  const today = new Date();
  const weekStart = startOfWeek(addWeeks(today, currentWeekOffset), { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const currentMonth = format(weekStart, 'MMMM yyyy');
  
  const goToPreviousWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const goToToday = () => setCurrentWeekOffset(0);

  // Convert memories to calendar events - only for current week
  const weekEnd = addDays(weekStart, 6);
  console.log('[Calendar] Week range:', format(weekStart, 'MMM d'), '-', format(weekEnd, 'MMM d, yyyy'));
  console.log('[Calendar] Total memories with deadlines:', memories.length);
  
  const events: CalendarEvent[] = memories
    .map(memory => {
      const deadline = new Date(memory.metadata!.deadline!);
      console.log('[Calendar] Checking deadline:', format(deadline, 'MMM d, yyyy h:mm a'));
      
      // Check if deadline falls within this week's range
      const isInWeek = deadline >= weekStart && deadline <= addDays(weekEnd, 1);
      console.log('[Calendar] Is in week range?', isInWeek);
      
      if (!isInWeek) return null;
      
      // Find which day of the week (1-7) this deadline falls on
      const dayIndex = days.findIndex(day => isSameDay(day, deadline));
      console.log('[Calendar] Day index:', dayIndex);
      
      if (dayIndex === -1) return null; // Shouldn't happen but safety check
      const dayOfWeek = dayIndex + 1;
      
      const time = format(deadline, 'h:mm a');
      
      // Determine color based on type and urgency
      let color: CalendarEvent['color'] = 'purple';
      if (memory.metadata?.type === 'study') color = 'blue';
      else if (memory.metadata?.type === 'interview') color = 'pink';
      else if (memory.metadata?.type === 'meeting') color = 'green';
      else if (memory.metadata?.type === 'personal') color = 'orange';
      
      return {
        id: memory.id,
        title: memory.metadata?.subject || memory.metadata?.company || 'Task',
        description: memory.content?.substring(0, 50) || '',
        time,
        day: dayOfWeek,
        color,
        deadline: memory.metadata!.deadline!,
        reviewed: memory.metadata?.reviewed,
        priority: memory.metadata?.priority,
      } as CalendarEvent;
    })
    .filter((event): event is CalendarEvent => event !== null && event.deadline !== undefined);

  // Get deadline status
  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursUntil = differenceInHours(deadlineDate, now);
    const daysUntil = differenceInDays(deadlineDate, now);
    
    if (isPast(deadlineDate)) return { status: 'overdue', text: 'Overdue', color: 'text-red-400', icon: AlertTriangle };
    if (hoursUntil < 24) return { status: 'urgent', text: `${hoursUntil}h left`, color: 'text-orange-400', icon: Timer };
    if (daysUntil < 3) return { status: 'soon', text: `${daysUntil}d left`, color: 'text-yellow-400', icon: Clock };
    return { status: 'ok', text: `${daysUntil}d left`, color: 'text-green-400', icon: CheckCircle };
  };

  // Get unique time slots from events, or use default if no events
  const timeSlots = events.length > 0 
    ? [...new Set(events.map(e => e.time))].sort()
    : ['9:00 am', '10:00 am', '11:00 am'];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30';
      case 'blue': return 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30';
      case 'green': return 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30';
      case 'pink': return 'bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30';
      case 'orange': return 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30';
      default: return 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden h-full">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative h-full flex flex-col">
      {/* Header with Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">{currentMonth}</h3>
          </div>
          
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
          >
            Today
          </button>
        </div>

        {/* Deadline Summary */}
        {memories.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Timer className="w-3.5 h-3.5" />
            <span>{memories.length} {memories.length === 1 ? 'deadline' : 'deadlines'} this month</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {memories.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No deadlines yet</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add deadlines to your memories to see them here with countdown timers
            </p>
            <p className="text-xs text-gray-500">
              💡 Tip: When creating a memory, set a deadline to track it on the calendar
            </p>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {memories.length > 0 && (
      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="text-xs text-gray-500"></div> {/* Empty for time column */}
          {days.map((day, i) => {
            const isToday = isSameDay(day, today);
            const dayEvents = events.filter(e => e.day === (i + 1));
            
            return (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400 mb-1 font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-sm font-semibold transition-all ${
                  isToday
                    ? 'text-white bg-purple-500 w-8 h-8 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/50'
                    : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                  {dayEvents.length > 0 && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${
                          e.color === 'purple' ? 'bg-purple-400' :
                          e.color === 'blue' ? 'bg-blue-400' :
                          e.color === 'green' ? 'bg-green-400' :
                          e.color === 'pink' ? 'bg-pink-400' :
                          'bg-orange-400'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots with Events */}
        <div className="space-y-2">
          {timeSlots.map((time, i) => (
            <div key={i} className="grid grid-cols-8 gap-2 items-start min-h-[52px]">
              <div className="text-xs text-gray-500 font-medium pt-1">{time}</div>
              
              {/* Event slots for each day */}
              {days.map((day, dayIdx) => {
                const dayEvents = events.filter(
                  event => event.time === time && event.day === (dayIdx + 1)
                );
                
                return (
                  <div key={dayIdx} className="relative min-h-[48px]">
                    {dayEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/memories/${event.id}`}
                        className={`block w-full border rounded-lg p-1.5 backdrop-blur-sm transition-all cursor-pointer group ${
                          getColorClasses(event.color)
                        } hover:scale-105`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="text-xs font-semibold text-white truncate flex-1">
                              {event.title}
                            </div>
                            {event.reviewed && (
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {event.description}
                          </div>
                          {event.deadline && (
                            <div className="flex items-center gap-1 mt-1">
                              {(() => {
                                const status = getDeadlineStatus(event.deadline);
                                const Icon = status.icon;
                                return (
                                  <>
                                    <Icon className={`w-3 h-3 ${status.color}`} />
                                    <span className={`text-xs font-medium ${status.color}`}>
                                      {status.text}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      )}
      </div>
    </div>
  );
}
