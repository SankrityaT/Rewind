'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Mail } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'email';
  confirmText?: string;
}

export function Dialog({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK' }: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Always restore to visible/auto, never empty string
        document.body.style.overflow = 'visible';
        // Force reflow to ensure styles are applied
        document.body.offsetHeight;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-400" />;
      case 'email':
        return <Mail className="w-16 h-16 text-purple-400" />;
      default:
        return <Info className="w-16 h-16 text-blue-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-500/30';
      case 'email':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default:
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-[#1a1f2e] rounded-3xl shadow-2xl border border-white/10 max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon with gradient background */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradient()} border mb-6`}>
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3 font-syne">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
            {message}
          </p>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
