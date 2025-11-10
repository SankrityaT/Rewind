'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, LayoutDashboard, List, Search, Settings, Sparkles, RefreshCw, Zap, Plug } from 'lucide-react';
import { useFocusMode } from '@/contexts/FocusModeContext';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { focusMode, setFocusMode } = useFocusMode();

  // Base links always visible
  const baseLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/memories', label: 'Memories', icon: List },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/chat', label: 'Ask Recall', icon: Sparkles },
    { href: '/integrations', label: 'Integrations', icon: Plug },
  ];

  // Add Quiz only in study mode
  const links = focusMode === 'study'
    ? [...baseLinks, { href: '/quiz', label: 'Quiz', icon: Zap }]
    : baseLinks;

  return (
    <nav className="py-4 sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-syne bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Rewind</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Switch Mode Button */}
              {focusMode && (
                <button
                  onClick={() => {
                    setFocusMode(null);
                    router.push('/dashboard');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                >
                  <span className="text-xl">
                    {focusMode === 'study' && '📚'}
                    {focusMode === 'job' && '💼'}
                    {focusMode === 'meeting' && '📅'}
                    {focusMode === 'browse' && '✨'}
                  </span>
                  <span className="text-sm text-gray-400 group-hover:text-white hidden md:inline">
                    {focusMode === 'study' && 'Study'}
                    {focusMode === 'job' && 'Job'}
                    {focusMode === 'meeting' && 'Meeting'}
                    {focusMode === 'browse' && 'Browse'}
                  </span>
                  <RefreshCw className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400" />
                </button>
              )}
              
              <Link href="/settings" className="p-2.5 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all hover:scale-110">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer ring-2 ring-white/20" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
