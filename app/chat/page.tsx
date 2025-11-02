'use client';

import { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { Send, Sparkles, Loader2, ExternalLink, CheckCircle, Trash2, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Memory } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  memories?: Memory[];
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey! I'm your AI memory assistant. Ask me anything about your memories, and I'll help you find what you need.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleMemoryExpansion = (memoryId: string) => {
    setExpandedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
      } else {
        newSet.add(memoryId);
      }
      return newSet;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        memories: data.memories,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReviewed = async (memory: Memory) => {
    try {
      const response = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memory.id,
          content: memory.content,
          metadata: {
            ...memory.metadata,
            reviewed: !memory.metadata.reviewed,
            lastReviewed: !memory.metadata.reviewed ? new Date().toISOString() : memory.metadata.lastReviewed,
          },
        }),
      });

      if (response.ok) {
        // Update the memory in the messages
        setMessages(prev => prev.map(msg => ({
          ...msg,
          memories: msg.memories?.map(m => 
            m.id === memory.id 
              ? { ...m, metadata: { ...m.metadata, reviewed: !m.metadata.reviewed } }
              : m
          ),
        })));
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interview': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'meeting': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const suggestedQuestions = [
    "What did I study about databases?",
    "What should I focus on for my upcoming interview?",
    "Show me my high priority memories",
    "What have I learned about system design?",
  ];

  return (
    <DarkBackground>
      <Navigation />
      
      {/* Main Chat Container */}
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          {messages.length === 1 ? (
            /* Empty State */
            <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto pb-32">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Ask Recall</h1>
              <p className="text-gray-400 text-center mb-12 max-w-md">
                Your AI memory assistant. Ask questions about your memories and get instant, intelligent answers.
              </p>

              {/* Suggested Questions */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span>{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-8 pb-4">
              {messages.slice(1).map((message) => (
                <div key={message.id} className="space-y-4">
                  {/* User Message */}
                  {message.role === 'user' && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">You</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-white text-base leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Assistant Message */}
                  {message.role === 'assistant' && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="pt-1">
                          <p className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {/* Memory Cards - Horizontal Scroll */}
                        {message.memories && message.memories.length > 0 && (
                          <div className="mt-4">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                              {message.memories.map((memory) => {
                                const isExpanded = expandedMemories.has(memory.id);
                                const shouldShowExpand = memory.content && memory.content.length > 200;
                                
                                return (
                                  <div 
                                    key={memory.id} 
                                    className="flex-shrink-0 w-80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-2xl p-4 transition-all group"
                                  >
                                    {/* Header - Compact */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${getTypeColor(memory.metadata.type)}`}>
                                          {memory.metadata.type}
                                        </span>
                                        {memory.metadata.subject && (
                                          <span className="text-xs text-blue-400 font-medium">
                                            {memory.metadata.subject}
                                          </span>
                                        )}
                                        {memory.metadata.company && (
                                          <span className="text-xs text-purple-400 font-medium">
                                            {memory.metadata.company}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Quick Actions - Always visible */}
                                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => toggleReviewed(memory)}
                                          className={`p-1.5 rounded-lg transition-colors ${
                                            memory.metadata.reviewed
                                              ? 'text-green-400'
                                              : 'text-gray-500 hover:text-gray-400'
                                          }`}
                                          title={memory.metadata.reviewed ? 'Reviewed' : 'Mark as reviewed'}
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <Link
                                          href={`/memories/${memory.id}`}
                                          className="p-1.5 text-gray-500 hover:text-purple-400 rounded-lg transition-colors"
                                          title="View full"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                      </div>
                                    </div>

                                    {/* Content - Expandable */}
                                    <div className="mb-3">
                                      <p className={`text-[13px] text-gray-300 leading-relaxed ${!isExpanded && shouldShowExpand ? 'line-clamp-3' : ''}`}>
                                        {memory.content}
                                      </p>
                                      {shouldShowExpand && (
                                        <button
                                          onClick={() => toggleMemoryExpansion(memory.id)}
                                          className="text-[11px] text-purple-400 hover:text-purple-300 mt-1.5 font-medium"
                                        >
                                          {isExpanded ? '← Less' : 'More →'}
                                        </button>
                                      )}
                                    </div>

                                    {/* Footer - Minimal */}
                                    <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-2 border-t border-white/5">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(memory.createdAt), 'MMM d')}
                                      </span>
                                      {memory.metadata.lastReviewed && (
                                        <span className="flex items-center gap-1 text-green-500">
                                          <CheckCircle className="w-3 h-3" />
                                          Reviewed
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-gray-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-white/5 bg-gradient-to-b from-transparent to-[#0a0e1a]/50 backdrop-blur-sm px-4 pb-8 pt-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="flex items-end gap-2 bg-[#2a2f3c] border border-gray-600/50 rounded-3xl px-4 py-3 shadow-2xl hover:border-gray-500/50 focus-within:border-purple-500/60 focus-within:shadow-purple-500/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Recall..."
                  className="flex-1 bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none text-[15px] leading-6 py-1"
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2.5 text-center">
                Recall can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DarkBackground>
  );
}
