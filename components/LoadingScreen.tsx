'use client';

import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading your dashboard...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center z-50">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        {/* Breathing logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 animate-ping" />
            
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-40 animate-pulse" />
            
            {/* Logo */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-syne bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
            Rewind
          </h1>
          <h2 className="text-xl font-medium text-white font-syne">
            {message}
          </h2>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Subtle message */}
          <p className="text-gray-400 text-sm mt-4 animate-pulse">
            Preparing your personalized experience
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
