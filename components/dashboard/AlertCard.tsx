'use client';

import { Alert } from '@/types';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'attention':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ontrack':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (alert.type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'attention':
        return 'bg-yellow-50 border-yellow-200';
      case 'ontrack':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          {alert.action && (
            <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              {alert.action} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
