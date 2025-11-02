'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { Brain, CheckCircle, XCircle, Loader2, Trophy, Target, Zap } from 'lucide-react';
import { Memory } from '@/types';

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  memoryId: string;
  subject?: string;
  type?: string;
}

interface QuizResult {
  correct: number;
  total: number;
  score: number;
  timestamp: Date;
}

export default function QuizPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; question: QuizQuestion }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch('/api/memories?limit=100');
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (subject: string = 'all') => {
    setGenerating(true);
    setSelectedSubject(subject);
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, count: 5 }),
      });

      const data = await response.json();
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setResults([]);
      setQuizComplete(false);
      setShowAnswer(false);
      setUserAnswer('');
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    setResults([...results, { correct: isCorrect, question: currentQuestion }]);
    
    // Update memory with retention score
    updateMemoryScore(currentQuestion.memoryId, isCorrect);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      setQuizComplete(true);
    }
  };

  const updateMemoryScore = async (memoryId: string, correct: boolean) => {
    try {
      await fetch(`/api/quiz/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId, correct }),
      });
    } catch (error) {
      console.error('Error updating memory score:', error);
    }
  };

  const subjects = ['all', ...new Set(memories.map(m => m.metadata?.subject).filter(Boolean))];
  const currentQuestion = questions[currentQuestionIndex];
  const correctCount = results.filter(r => r.correct).length;
  const scorePercentage = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  if (loading) {
    return (
      <DarkBackground>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        </div>
      </DarkBackground>
    );
  }

  return (
    <DarkBackground>
      <Navigation />
      
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 font-syne">Quiz Mode</h1>
            <p className="text-xl text-gray-400">Test your knowledge and track retention</p>
          </div>

          {/* Quiz Setup */}
          {questions.length === 0 && !generating && (
            <div className="space-y-8">
              {/* Subject Selection */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 font-syne">Choose a Subject</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => generateQuiz(subject)}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500 rounded-2xl transition-all group"
                    >
                      <div className="text-center">
                        <Target className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white font-semibold capitalize">{subject}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {subject === 'all' 
                            ? `${memories.length} memories` 
                            : `${memories.filter(m => m.metadata?.subject === subject).length} memories`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                  <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">{memories.length}</div>
                  <div className="text-sm text-gray-400">Total Memories</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">
                    {memories.filter(m => !m.metadata?.reviewed).length}
                  </div>
                  <div className="text-sm text-gray-400">Unreviewed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                  <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">
                    {Math.round((memories.filter(m => m.metadata?.reviewed).length / memories.length) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-400">Retention</div>
                </div>
              </div>
            </div>
          )}

          {/* Generating State */}
          {generating && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-xl text-white">Generating quiz questions...</p>
              <p className="text-gray-400 mt-2">Using AI to create personalized questions</p>
            </div>
          )}

          {/* Quiz in Progress */}
          {questions.length > 0 && !quizComplete && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-400">
                    Score: {correctCount}/{results.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                {currentQuestion.subject && (
                  <div className="inline-block px-4 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
                    {currentQuestion.subject}
                  </div>
                )}
                <h2 className="text-3xl font-bold text-white mb-6 font-syne">
                  {currentQuestion.question}
                </h2>

                {!showAnswer ? (
                  <div className="space-y-4">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                      rows={4}
                    />
                    <button
                      onClick={() => setShowAnswer(true)}
                      disabled={!userAnswer.trim()}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Show Answer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                      <p className="text-sm text-green-400 font-semibold mb-2">CORRECT ANSWER</p>
                      <p className="text-white text-lg">{currentQuestion.answer}</p>
                    </div>

                    <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                      <p className="text-sm text-gray-400 font-semibold mb-2">YOUR ANSWER</p>
                      <p className="text-white">{userAnswer}</p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        I got it wrong
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        I got it right
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quiz Complete */}
          {quizComplete && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-4 font-syne">Quiz Complete!</h2>
                <div className="text-7xl font-bold text-white mb-2">{scorePercentage}%</div>
                <p className="text-2xl text-gray-300 mb-8">
                  {correctCount} out of {results.length} correct
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => generateQuiz(selectedSubject)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setQuestions([]);
                      setResults([]);
                      setQuizComplete(false);
                    }}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold transition-all"
                  >
                    New Subject
                  </button>
                </div>
              </div>

              {/* Results Breakdown */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 font-syne">Results Breakdown</h3>
                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border ${
                        result.correct
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-semibold">{result.question.question}</p>
                          <p className="text-sm text-gray-400 mt-1">{result.question.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DarkBackground>
  );
}
