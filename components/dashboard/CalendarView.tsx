'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  day: number;
  attendees?: number;
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange';
  location?: string;
}

export function CalendarView() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const today = new Date();
  const weekStart = startOfWeek(addWeeks(today, currentWeekOffset), { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const currentMonth = format(weekStart, 'MMMM yyyy');
  
  const goToPreviousWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const goToToday = () => setCurrentWeekOffset(0);

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Weekly Team Sync',
      description: 'Discuss progress and blockers',
      time: '9:00 am',
      day: 2,
      attendees: 5,
      color: 'purple',
      location: 'Zoom',
    },
    {
      id: '2',
      title: 'Interview Prep',
      description: 'System design practice',
      time: '9:00 am',
      day: 4,
      color: 'pink',
      location: 'Study Room',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review PRs from team',
      time: '10:00 am',
      day: 3,
      attendees: 3,
      color: 'blue',
      location: 'Office',
    },
    {
      id: '4',
      title: '1-on-1 with Manager',
      description: 'Career development discussion',
      time: '11:00 am',
      day: 2,
      attendees: 2,
      color: 'orange',
      location: 'Meeting Room B',
    },
  ];

  const timeSlots = ['9:00 am', '10:00 am', '11:00 am'];

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
      <div className="flex items-center justify-between mb-6">
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

      {/* Calendar Grid */}
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
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        className={`w-full border rounded-lg p-1.5 backdrop-blur-sm transition-all cursor-pointer group ${
                          getColorClasses(event.color)
                        } ${selectedEvent?.id === event.id ? 'ring-2 ring-white/50' : ''}`}
                      >
                        <div className="text-left">
                          <div className="text-xs font-semibold text-white truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {event.description}
                          </div>
                          {event.attendees && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">{event.attendees}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
