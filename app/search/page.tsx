'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MemoryCard } from '@/components/memories/MemoryCard';
import { Memory } from '@/types';
import { Search as SearchIcon, Loader2, Sparkles } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [threshold, setThreshold] = useState(0.0); // Changed to 0 - let Supermemory handle relevance
  const [totalFound, setTotalFound] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 20, threshold }),
      });

      const data = await response.json();
      
      console.log('🔍 [Search Page] Received', data.results?.length, 'results');
      
      // Results are already transformed by the API with proper IDs
      const memories: Memory[] = data.results?.map((r: any) => ({
        id: r.id || r.documentId, // API already sets id to documentId
        content: r.content || r.summary || '',
        metadata: r.metadata || {},
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
        similarity: r.similarity || r.score,
      })) || [];

      console.log(`✅ [Search Page] Processed ${memories.length} memories`);
      if (memories.length > 0) {
        console.log('  First memory ID:', memories[0].id);
      }
      
      setResults(memories);
      setTotalFound(data.totalFound || memories.length);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = [
    'clustering algorithms',
    'interview preparation',
    'database indexing',
    'React hooks',
    'system design',
  ];

  return (
    <DarkBackground>
      <Navigation />
      
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3 font-syne">Search Memories</h1>
            <p className="text-gray-400 text-lg">Find anything from your memory collection</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for topics, keywords, or questions..."
                  className="w-full pl-16 pr-6 py-5 text-lg text-gray-900 bg-white border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </form>



            {/* Quick Searches */}
            {!searched && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">Quick searches:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => {
                        setQuery(search);
                        handleSearch({ preventDefault: () => {} } as any);
                      }}
                      className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-sm text-gray-300 hover:border-purple-500 hover:text-purple-400 transition-all"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Searching your memories...</p>
            </div>
          ) : searched ? (
            results.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Found {results.length} relevant result{results.length !== 1 ? 's' : ''} for "{query}"
                    </h2>

                  </div>
                  <button
                    onClick={() => {
                      setSearched(false);
                      setQuery('');
                      setResults([]);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Clear search
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((memory, index) => (
                    <div key={memory.id ?? `memory-${index}`} className="relative">
                      <MemoryCard memory={memory} />
                      {memory.similarity && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                          {Math.round(memory.similarity * 100)}% match
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-6">
                  Try different keywords or check your spelling
                </p>
                <button
                  onClick={() => {
                    setSearched(false);
                    setQuery('');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Try another search
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-6 backdrop-blur-xl border border-white/20">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Semantic Search</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Search using natural language. Ask questions or describe what you're looking for,
                and we'll find the most relevant memories.
              </p>
            </div>
          )}
        </div>
      </div>
    </DarkBackground>
  );
}
