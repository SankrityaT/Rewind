'use client';

import { useState, useRef, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { Send, Sparkles, Loader2, ExternalLink, CheckCircle, Trash2, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Memory } from '@/types';

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  memoryId: string;
  subject?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  memories?: Memory[];
  timestamp: Date;
  quiz?: {
    questions: QuizQuestion[];
    currentIndex: number;
    score: number;
    showAnswer: boolean;
    userAnswered?: boolean;
  };
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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
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
      // Send conversation history (last 10 messages, excluding the initial welcome)
      const conversationHistory = messages
        .slice(1) // Skip welcome message
        .slice(-10) // Last 10 messages
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: conversationHistory,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        memories: data.memories,
        timestamp: new Date(),
        quiz: data.isQuiz ? {
          questions: data.quiz,
          currentIndex: 0,
          score: 0,
          showAnswer: false,
        } : undefined,
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
      // Optimistic update - update UI immediately
      setMessages(prev => prev.map(msg => ({
        ...msg,
        memories: msg.memories?.map(m => 
          m.id === memory.id 
            ? { 
                ...m, 
                metadata: { 
                  ...m.metadata, 
                  reviewed: !m.metadata.reviewed,
                  lastReviewed: !m.metadata.reviewed ? new Date().toISOString() : m.metadata.lastReviewed,
                } 
              }
            : m
        ),
      })));

      // Then update backend
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviewed: !memory.metadata.reviewed 
        }),
      });

      if (!response.ok) {
        // Revert on error
        setMessages(prev => prev.map(msg => ({
          ...msg,
          memories: msg.memories?.map(m => 
            m.id === memory.id 
              ? { ...m, metadata: { ...m.metadata, reviewed: memory.metadata.reviewed } }
              : m
          ),
        })));
        console.error('Failed to update memory');
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      // Revert on error
      setMessages(prev => prev.map(msg => ({
        ...msg,
        memories: msg.memories?.map(m => 
          m.id === memory.id 
            ? { ...m, metadata: { ...m.metadata, reviewed: memory.metadata.reviewed } }
            : m
        ),
      })));
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

  const submitQuizAnswer = async (messageId: string) => {
    const userAnswer = quizAnswers[messageId] || '';
    if (!userAnswer.trim()) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quiz) {
        return {
          ...msg,
          quiz: {
            ...msg.quiz,
            showAnswer: true,
          },
        };
      }
      return msg;
    }));
  };

  const handleQuizAnswer = async (messageId: string, correct: boolean) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quiz) {
        const currentQ = msg.quiz.questions[msg.quiz.currentIndex];
        const newScore = correct ? msg.quiz.score + 1 : msg.quiz.score;
        
        // Update retention score in backend
        fetch('/api/quiz/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memoryId: currentQ.memoryId, correct }),
        });
        
        // Clear the answer input
        setQuizAnswers(prev => ({ ...prev, [messageId]: '' }));
        
        return {
          ...msg,
          quiz: {
            ...msg.quiz,
            score: newScore,
            showAnswer: false,
            currentIndex: msg.quiz.currentIndex + 1,
            userAnswered: true,
          },
        };
      }
      return msg;
    }));
  };

  const toggleQuizAnswer = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.quiz) {
        return {
          ...msg,
          quiz: { ...msg.quiz, showAnswer: !msg.quiz.showAnswer },
        };
      }
      return msg;
    }));
  };

  const suggestedQuestions = [
    "Quiz me on system design",
    "What should I focus on for my upcoming interview?",
    "Test me on my weak areas",
    "Quick review quiz",
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
                        <div className="pt-1 text-gray-200 text-base leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p className="mb-2" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              code: ({node, ...props}) => <code className="bg-white/10 px-1 py-0.5 rounded text-sm" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Quiz Component */}
                        {message.quiz && message.quiz.questions.length > 0 && (
                          <div className="mt-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                            {message.quiz.currentIndex < message.quiz.questions.length ? (
                              /* Active Quiz */
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-sm text-purple-300 font-medium">
                                    Question {message.quiz.currentIndex + 1} of {message.quiz.questions.length}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    Score: {message.quiz.score}/{message.quiz.currentIndex}
                                  </span>
                                </div>
                                
                                <div className="bg-white/5 rounded-xl p-4 mb-4">
                                  <p className="text-white text-lg font-medium mb-4">
                                    {message.quiz.questions[message.quiz.currentIndex].question}
                                  </p>
                                  
                                  {/* Answer Input */}
                                  {!message.quiz.showAnswer && (
                                    <div className="space-y-3">
                                      <textarea
                                        value={quizAnswers[message.id] || ''}
                                        onChange={(e) => setQuizAnswers(prev => ({ ...prev, [message.id]: e.target.value }))}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            submitQuizAnswer(message.id);
                                          }
                                        }}
                                        placeholder="Type your answer here..."
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                                        rows={3}
                                      />
                                      <button
                                        onClick={() => submitQuizAnswer(message.id)}
                                        disabled={!quizAnswers[message.id]?.trim()}
                                        className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:text-gray-500 rounded-xl text-white text-sm font-medium transition-all disabled:cursor-not-allowed"
                                      >
                                        Submit Answer
                                      </button>
                                    </div>
                                  )}
                                  
                                  {message.quiz.showAnswer && (
                                    <div className="space-y-3">
                                      {/* User's Answer */}
                                      {quizAnswers[message.id] && (
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                          <p className="text-sm text-blue-300 font-medium mb-1">Your answer:</p>
                                          <p className="text-gray-200">{quizAnswers[message.id]}</p>
                                        </div>
                                      )}
                                      
                                      {/* Correct Answer */}
                                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <p className="text-sm text-green-300 font-medium mb-1">Correct answer:</p>
                                        <p className="text-gray-200">{message.quiz.questions[message.quiz.currentIndex].answer}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-3">
                                  {message.quiz.showAnswer ? (
                                    <>
                                      <button
                                        onClick={() => handleQuizAnswer(message.id, true)}
                                        className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl text-green-300 text-sm font-medium transition-all"
                                      >
                                        ✓ I got it right
                                      </button>
                                      <button
                                        onClick={() => handleQuizAnswer(message.id, false)}
                                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-300 text-sm font-medium transition-all"
                                      >
                                        ✗ I got it wrong
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => toggleQuizAnswer(message.id)}
                                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all"
                                    >
                                      Skip / Show Answer
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              /* Quiz Complete */
                              <div className="text-center">
                                <div className="text-4xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                                <p className="text-gray-300 mb-4">
                                  You scored {message.quiz.score} out of {message.quiz.questions.length}
                                </p>
                                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                  {Math.round((message.quiz.score / message.quiz.questions.length) * 100)}%
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Attribution Badge */}
                        {message.memories && message.memories.length > 0 && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs text-purple-300 font-medium">
                              Based on {message.memories.length} {message.memories.length === 1 ? 'memory' : 'memories'}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {message.memories && message.memories.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={async () => {
                                // Mark all as reviewed
                                for (const memory of message.memories!) {
                                  await fetch(`/api/memories/${memory.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reviewed: true }),
                                  });
                                }
                                alert('All memories marked as reviewed!');
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-400 font-medium transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Review All
                            </button>
                            <Link
                              href="/memories"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-medium transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View All Memories
                            </Link>
                          </div>
                        )}

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
