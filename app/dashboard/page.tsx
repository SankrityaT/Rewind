'use client';

import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { PremiumDashboardV3 } from '@/components/dashboard/PremiumDashboardV3';
import { AddMemoryForm } from '@/components/dashboard/AddMemoryForm';
import { useState } from 'react';
import { Brain, BookOpen, Briefcase, Calendar, Sparkles } from 'lucide-react';
import { useFocusMode } from '@/contexts/FocusModeContext';

type FocusMode = 'study' | 'job' | 'meeting' | 'browse' | null;

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { focusMode, setFocusMode } = useFocusMode();

  const modes = [
    {
      id: 'study' as FocusMode,
      icon: BookOpen,
      emoji: '📚',
      title: 'Study Mode',
      description: 'Focus on learning and exam prep',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      id: 'job' as FocusMode,
      icon: Briefcase,
      emoji: '💼',
      title: 'Job Hunt',
      description: 'Interview prep and applications',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      id: 'meeting' as FocusMode,
      icon: Calendar,
      emoji: '📅',
      title: 'Meetings',
      description: 'Action items and follow-ups',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  if (focusMode === null) {
    return (
      <DarkBackground>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-syne">
                What are you focusing on?
              </h1>
              <p className="text-xl text-gray-400">
                Choose your mode to see relevant memories and insights
              </p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setFocusMode(mode.id)}
                    className={`group relative overflow-hidden bg-gradient-to-br ${mode.bgGradient} backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl text-left`}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative">
                      <div className="text-5xl mb-4">{mode.emoji}</div>
                      <h3 className="text-2xl font-bold text-white mb-2 font-syne">
                        {mode.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Browse Option */}
            <button
              onClick={() => setFocusMode('browse')}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors font-medium">
                  Just browsing - show me everything
                </span>
              </div>
            </button>
          </div>
        </div>
      </DarkBackground>
    );
  }

  return (
    <DarkBackground>
      <Navigation />
      <PremiumDashboardV3 key={refreshKey} focusMode={focusMode} />
      <AddMemoryForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
    </DarkBackground>
  );
}
