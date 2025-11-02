'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { Memory, MemoryType } from '@/types';
import { Filter, Loader2, Plus } from 'lucide-react';
import { AddMemoryForm } from '@/components/dashboard/AddMemoryForm';
import { useFocusMode } from '@/contexts/FocusModeContext';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MemoryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'deadline' | 'priority'>('recent');
  const [refreshKey, setRefreshKey] = useState(0);
  const { focusMode } = useFocusMode();

  useEffect(() => {
    fetchMemories();
  }, [filter, focusMode]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/memories?limit=100'
        : `/api/memories?type=${filter}&limit=100`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch memories');
      const data = await response.json();
      
      // Apply focus mode filter
      let filteredMemories = data.memories || [];
      if (focusMode && focusMode !== 'browse') {
        filteredMemories = filteredMemories.filter((m: Memory) => {
          if (focusMode === 'study') return m.metadata?.type === 'study';
          if (focusMode === 'job') return m.metadata?.type === 'interview';
          if (focusMode === 'meeting') return m.metadata?.type === 'meeting';
          return true;
        });
      }
      console.groupCollapsed('[MemoriesPage] Fetched memories', filteredMemories.length);
      filteredMemories.slice(0, 5).forEach((memory: any, index: number) => {
        console.log(`#${index} id=${memory.id}`, {
          contentPreview: memory.content?.slice(0, 60) ?? null,
          hasContent: Boolean(memory.content),
          metadata: memory.metadata,
        });
      });
      console.groupEnd();
      setMemories(filteredMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      const response = await fetch(`/api/memories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMemories(memories.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory');
    }
  };

  const sortedMemories = [...memories].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'deadline':
        if (!a.metadata.deadline) return 1;
        if (!b.metadata.deadline) return -1;
        return new Date(a.metadata.deadline).getTime() - new Date(b.metadata.deadline).getTime();
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.metadata.priority] - priorityOrder[b.metadata.priority];
      default:
        return 0;
    }
  });

  const stats = {
    total: memories.length,
    study: memories.filter(m => m.metadata.type === 'study').length,
    interview: memories.filter(m => m.metadata.type === 'interview').length,
    meeting: memories.filter(m => m.metadata.type === 'meeting').length,
    unreviewed: memories.filter(m => !m.metadata.reviewed).length,
  };

  if (loading) {
    return <LoadingScreen message="Loading your memories..." />;
  }

  return (
    <DarkBackground>
      <Navigation />
      
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-syne">All Memories</h1>
                <p className="text-gray-400">Browse and manage your memory collection</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="bg-blue-500/10 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">{stats.study}</div>
                <div className="text-sm text-blue-300">Study</div>
              </div>
              <div className="bg-purple-500/10 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{stats.interview}</div>
                <div className="text-sm text-purple-300">Interview</div>
              </div>
              <div className="bg-green-500/10 backdrop-blur-xl rounded-xl p-4 border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">{stats.meeting}</div>
                <div className="text-sm text-green-300">Meeting</div>
              </div>
              <div className="bg-yellow-500/10 backdrop-blur-xl rounded-xl p-4 border border-yellow-500/30">
                <div className="text-2xl font-bold text-yellow-400">{stats.unreviewed}</div>
                <div className="text-sm text-yellow-300">Unreviewed</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-gray-300" />
                <span className="font-medium text-white">Filter:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'study', 'interview', 'meeting', 'personal'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filter === type
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-white">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 rounded-lg font-medium text-white border border-white/20 focus:ring-2 focus:ring-purple-500 focus:outline-none backdrop-blur-xl"
                >
                  <option value="recent" className="bg-gray-900">Most Recent</option>
                  <option value="deadline" className="bg-gray-900">Deadline</option>
                  <option value="priority" className="bg-gray-900">Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memories Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : sortedMemories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No memories yet</h3>
              <p className="text-gray-400 mb-6">Start adding memories to see them here</p>
              <p className="text-sm text-gray-500">Click the + button in the bottom right to add your first memory</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddMemoryForm onSuccess={() => {
        setRefreshKey(prev => prev + 1);
        fetchMemories();
      }} />
    </DarkBackground>
  );
}
