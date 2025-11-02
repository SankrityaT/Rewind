'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, Clock, Target, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated mesh gradient background - Deep dark with purple/pink accents */}
      <div className="fixed inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.25),transparent_50%)]" />
      </div>
      
      {/* Grid pattern overlay - Much more visible */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent)]" />
      
      {/* Moving mouse gradient - More prominent */}
      <div 
        className="fixed inset-0 opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(700px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.5), transparent 40%)`
        }}
      />
      
      {/* Animated particles - only render on client - More prominent */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/50 rounded-full animate-float shadow-lg shadow-purple-500/50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-syne bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Rewind</span>
        </div>
        <Link 
          href="/dashboard"
          className="group px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
        >
          <span className="flex items-center gap-2">
            Launch App 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-purple-300/20 rounded-full shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span className="text-sm font-medium text-purple-100">Powered by Supermemory AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold font-syne leading-none">
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">Rewind</span>
            <br />
            <span className="text-white drop-shadow-lg">
              Never Forgets
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-purple-100/80 max-w-3xl mx-auto font-space-grotesk leading-relaxed">
            Stop searching. Start remembering. Rewind proactively tells you what to do next
            based on everything you've learned, researched, and experienced.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/dashboard"
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/60"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 pt-16 text-sm flex-wrap">
            <div className="backdrop-blur-xl bg-white/5 px-6 py-4 rounded-2xl border border-purple-300/20">
              <div className="text-3xl font-bold font-syne bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">1M+</div>
              <div className="text-purple-200/70">Memories Stored</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 px-6 py-4 rounded-2xl border border-purple-300/20">
              <div className="text-3xl font-bold font-syne bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">10K+</div>
              <div className="text-purple-200/70">Smart Searches</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 px-6 py-4 rounded-2xl border border-purple-300/20">
              <div className="text-3xl font-bold font-syne bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">300ms</div>
              <div className="text-purple-200/70">Recall Speed</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview - Enhanced */}
        <div className="mt-24 relative">
          {/* Browser Frame */}
          <div className="relative bg-gradient-to-br from-slate-800/50 via-purple-900/30 to-slate-800/50 rounded-3xl border border-purple-300/20 shadow-2xl shadow-purple-500/20 overflow-hidden backdrop-blur-xl">
            {/* Browser Chrome */}
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-300/20 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-500/50" />
              </div>
              <div className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-sm text-purple-100 border border-purple-300/20">
                rewind.app/dashboard
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/20 p-8 backdrop-blur-xl">
              {/* Stats Pills */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 font-space-grotesk">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm whitespace-nowrap">
                  <span className="text-gray-400">Memories:</span> <span className="font-bold text-white ml-1">47</span>
                </div>
                <div className="bg-pink-500 px-4 py-2 rounded-full text-sm font-medium text-white whitespace-nowrap shadow-lg">
                  Reviewed: 32
                </div>
                <div className="bg-purple-500 px-4 py-2 rounded-full text-sm font-medium text-white whitespace-nowrap shadow-lg">
                  Urgent: 3
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-space-grotesk">
                {/* Alert Card */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-red-400 font-semibold text-sm tracking-wide">URGENT</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">React Quiz Tomorrow</h3>
                  <p className="text-gray-400 text-xs">Review Server Components & RSC</p>
                </div>

                {/* Pattern Card */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-purple-400 font-semibold text-sm tracking-wide">PATTERN</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">Peak Time: 9-11 PM</h3>
                  <p className="text-gray-400 text-xs">35% better retention at night</p>
                </div>

                {/* Success Card */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-green-400 font-semibold text-sm tracking-wide">ON TRACK</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">7-Day Streak! 🔥</h3>
                  <p className="text-gray-400 text-xs">Consistent daily progress</p>
                </div>

                {/* AI Insight Card */}
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-300" />
                    </div>
                    <span className="text-pink-300 font-semibold text-sm tracking-wide">AI INSIGHT</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">Focus on System Design</h3>
                  <p className="text-gray-400 text-xs">Strong in coding, light on architecture</p>
                </div>

                {/* Timeline Card */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-blue-400 font-semibold text-sm tracking-wide">UPCOMING</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">Google Interview</h3>
                  <p className="text-gray-400 text-xs">System design prep in 5 days</p>
                </div>

                {/* Progress Card */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-yellow-400 font-semibold text-sm tracking-wide">PROGRESS</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-white font-syne">87% Retention Rate</h3>
                  <p className="text-gray-400 text-xs">Up 12% from last week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating gradient orbs - Much larger and more vibrant */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/50 to-purple-500/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold font-syne mb-6">
            Proactive vs. Reactive
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Other tools wait for you to ask. Rewind tells you what you're forgetting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-4">Smart Alerts</h3>
            <p className="text-gray-400 leading-relaxed">
              "You have an interview in 3 days. Last time you prepped 5 days before. Start now?"
              Rewind learns your patterns and reminds you proactively.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-4">Pattern Detection</h3>
            <p className="text-gray-400 leading-relaxed">
              Automatically discovers when you study best, what you're forgetting, and where you have gaps
              in your knowledge—without you asking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-4">Context Switching</h3>
            <p className="text-gray-400 leading-relaxed">
              Separate modes for studying, job search, and meetings. Each with specialized dashboards
              that surface exactly what you need.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-4">Timeline Intelligence</h3>
            <p className="text-gray-400 leading-relaxed">
              Visual timeline showing when you learned something, when you last reviewed it,
              and when you should review it again.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl">
          <h2 className="text-4xl md:text-5xl font-bold font-syne text-center mb-16">
            Why Not Just Use Chat?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Regular Chat</h4>
                  <p className="text-gray-400 text-sm">You have to remember to ask "What should I study?" "What interview do I have?" "What did I commit to?"</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Rewind Dashboard</h4>
                  <p className="text-gray-400 text-sm">Already knows and shows you—ranked by urgency. No asking needed. Just open and act.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-bold font-syne">
            Ready to Never
            <br />
            Forget Again?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands using Rewind to supercharge their memory
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-xl hover:scale-105 transition-transform"
          >
            Start Free Today
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold font-syne">Rewind</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built with Supermemory API • © 2025 Rewind
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
