'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  memoryIds?: string[];
  priority: number;
}

interface SmartAlertsProps {
  memories: any[];
}

export function SmartAlerts({ memories }: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memories.length > 0) {
      fetchAlerts();
    }
  }, [memories]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: AlertTriangle,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: Info,
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing your memories...</span>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 text-green-400">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-xl">✓</span>
          </div>
          <div>
            <h3 className="font-semibold">All caught up!</h3>
            <p className="text-sm text-gray-400">No urgent actions needed right now.</p>
          </div>
        </div>
      </div>
    );
  }

  const urgentCount = alerts.filter(a => a.type === 'urgent').length;

  return (
    <div className="space-y-2 max-h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {alerts.map((alert) => {
        const style = getAlertStyle(alert.type);
        const Icon = style.icon;

        return (
          <div
            key={alert.id}
            className={`${style.bg} ${style.border} border rounded-lg p-3 hover:bg-opacity-80 transition-all cursor-pointer`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-6 h-6 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3 h-3 ${style.text}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {alert.type === 'urgent' && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-bold uppercase">
                      Today
                    </span>
                  )}
                </div>
                <h4 className="text-white font-semibold mb-1 text-sm line-clamp-2">
                  {alert.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {alert.message}
                </p>
                
                {alert.memoryIds && alert.memoryIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {alert.memoryIds.slice(0, 5).map((memoryId, idx) => (
                      <Link
                        key={memoryId}
                        href={`/memories/${memoryId}`}
                        className={`inline-flex items-center gap-1 text-[10px] ${style.text} hover:underline font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors`}
                      >
                        Memory {idx + 1}
                        <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    ))}
                    {alert.memoryIds.length > 5 && (
                      <span className="text-[10px] text-gray-500 px-2 py-1">
                        +{alert.memoryIds.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
