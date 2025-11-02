'use client';

import { Memory } from '@/types';
import { Calendar, CheckCircle, Clock, BookOpen, Briefcase, Users, Heart } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const getTypeConfig = () => {
    switch (memory.metadata.type) {
      case 'study': 
        return { 
          gradient: 'from-blue-500/30 to-blue-600/30', 
          border: 'border-blue-500/40',
          badge: 'bg-blue-500',
          icon: BookOpen,
          label: 'Study'
        };
      case 'interview': 
        return { 
          gradient: 'from-purple-500/30 to-purple-600/30', 
          border: 'border-purple-500/40',
          badge: 'bg-purple-500',
          icon: Briefcase,
          label: 'Interview'
        };
      case 'meeting': 
        return { 
          gradient: 'from-green-500/30 to-green-600/30', 
          border: 'border-green-500/40',
          badge: 'bg-green-500',
          icon: Users,
          label: 'Meeting'
        };
      default: 
        return { 
          gradient: 'from-pink-500/30 to-pink-600/30', 
          border: 'border-pink-500/40',
          badge: 'bg-pink-500',
          icon: Heart,
          label: 'Personal'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;
  const hasContent = memory.content && memory.content.trim().length > 0;
  
  // Handle undefined or invalid IDs
  const memoryId = memory.id || 'undefined';
  const isValidId = memory.id && memory.id !== 'undefined';

  const CardContent = (
      <div className={`relative bg-gradient-to-br ${typeConfig.gradient} backdrop-blur-xl rounded-3xl border ${typeConfig.border} p-8 hover:scale-[1.02] transition-all cursor-pointer group overflow-hidden min-h-[200px]`}>
        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`${typeConfig.badge} p-2.5 rounded-xl`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg block">
                  {typeConfig.label}
                </span>
                {(memory.metadata.subject || memory.metadata.company) && (
                  <span className="text-white/80 text-sm">
                    {memory.metadata.subject || memory.metadata.company}
                  </span>
                )}
              </div>
            </div>
            
            {memory.metadata.reviewed && (
              <div className="bg-green-500/20 p-2 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>

          {/* Content preview */}
          <div className="flex-1 mb-6">
            {hasContent ? (
              <p className="text-white text-base leading-relaxed line-clamp-4">
                {memory.content}
              </p>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/50 text-sm italic">Processing content...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/80 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(new Date(memory.createdAt), 'MMM d, yyyy')}</span>
            </div>
            
            {memory.metadata.deadline && (
              <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-orange-300" />
                <span className="font-medium text-orange-300">{format(new Date(memory.metadata.deadline), 'MMM d')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
  );
  
  // Only wrap in Link if we have a valid ID
  if (isValidId) {
    return <Link href={`/memories/${memoryId}`}>{CardContent}</Link>;
  }
  
  // If no valid ID, just return the card without link
  return CardContent;
}
