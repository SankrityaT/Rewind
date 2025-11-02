'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export function AIInsight() {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-insight');
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      setInsight('🧠 Keep learning and reviewing regularly!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-2xl text-white h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Insight</h3>
          <p className="text-xs opacity-90">Powered by Groq + Supermemory</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <p className="text-white/95 leading-relaxed text-center">{insight}</p>
        )}
      </div>

      <button
        onClick={fetchInsight}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 w-full"
      >
        Refresh Insight
      </button>
    </div>
  );
}
