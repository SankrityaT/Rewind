'use client';

import { useState, useEffect } from 'react';
import { MemoryType } from '@/types';
import { Plus, Loader2, BookOpen, Briefcase, Users, FileText, X, Calendar, Flag, Upload, CheckCircle } from 'lucide-react';

interface AddMemoryFormProps {
  onSuccess?: () => void;
}

export function AddMemoryForm({ onSuccess }: AddMemoryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [pastSubjects, setPastSubjects] = useState<string[]>([]);
  const [pastCompanies, setPastCompanies] = useState<string[]>([]);
  
  // Fetch past subjects/companies for auto-suggest
  useEffect(() => {
    const fetchPastData = async () => {
      try {
        const response = await fetch('/api/memories?limit=100');
        const data = await response.json();
        if (data.memories) {
          const subjects = [...new Set(data.memories.map((m: any) => m.metadata?.subject).filter(Boolean))] as string[];
          const companies = [...new Set(data.memories.map((m: any) => m.metadata?.company).filter(Boolean))] as string[];
          setPastSubjects(subjects);
          setPastCompanies(companies);
        }
      } catch (error) {
        console.error('Error fetching past data:', error);
      }
    };
    fetchPastData();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setStep('type');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    content: '',
    type: 'study' as MemoryType,
    subject: '',
    company: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
  });

  const memoryTypes = [
    {
      type: 'study' as MemoryType,
      icon: BookOpen,
      title: 'Study Notes',
      description: 'Class notes, concepts, exam prep',
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'e.g., Studied k-means clustering algorithm. Key points: iterative algorithm, minimizes variance...',
    },
    {
      type: 'interview' as MemoryType,
      icon: Briefcase,
      title: 'Interview Prep',
      description: 'Company research, prep notes',
      color: 'from-purple-500 to-pink-500',
      placeholder: 'e.g., Meta interview prep: System design - design Instagram feed. Discussed CDN, caching...',
    },
    {
      type: 'meeting' as MemoryType,
      icon: Users,
      title: 'Meeting Notes',
      description: 'Team syncs, action items',
      color: 'from-green-500 to-emerald-500',
      placeholder: 'e.g., Team sync with Sarah: Discussed MongoDB integration. Committed to finishing API docs...',
    },
    {
      type: 'personal' as MemoryType,
      icon: FileText,
      title: 'Personal Notes',
      description: 'Ideas, thoughts, reminders',
      color: 'from-orange-500 to-red-500',
      placeholder: 'e.g., Project idea: Build a memory management app using AI...',
    },
  ];

  const selectedType = memoryTypes.find(t => t.type === formData.type);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[File Upload] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const isTextFile = 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.markdown') ||
      file.type === 'text/plain' || 
      file.type === 'text/markdown' ||
      file.type === '';

    if (isTextFile) {
      try {
        const text = await file.text();
        console.log('[File Upload] File read successfully, length:', text.length);
        setFormData({ ...formData, content: text });
      } catch (error) {
        console.error('[File Upload] Error reading file:', error);
        alert('Failed to read file');
      }
    } else {
      alert(`Please upload a .txt or .md file (got: ${file.name}, type: ${file.type})`);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Drag & Drop] Drag over');
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Drag & Drop] Drag enter');
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Drag & Drop] Drag leave');
    // Only set to false if leaving the container itself, not child elements
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    console.log('[Drag & Drop] Drop event triggered');
    
    const files = Array.from(e.dataTransfer.files);
    console.log('[Drag & Drop] Files dropped:', files.length);
    
    if (files.length === 0) {
      console.log('[Drag & Drop] No files found');
      return;
    }
    
    const file = files[0];
    console.log('[Drag & Drop] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // Check if it's a text-based file by extension or MIME type
    const isTextFile = 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.markdown') ||
      file.type === 'text/plain' || 
      file.type === 'text/markdown' ||
      file.type === '';  // .md files often have empty MIME type
    
    console.log('[Drag & Drop] Is text file?', isTextFile);
    
    if (isTextFile) {
      try {
        console.log('[Drag & Drop] Reading file...');
        const text = await file.text();
        console.log('[Drag & Drop] File read successfully, length:', text.length);
        setFormData({ ...formData, content: text });
        console.log('[Drag & Drop] Content set in form');
      } catch (error) {
        console.error('[Drag & Drop] Error reading file:', error);
        alert('Failed to read file');
      }
    } else {
      console.log('[Drag & Drop] File rejected - wrong type');
      alert(`Please drop a .txt or .md file (got: ${file.name}, type: ${file.type})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const metadata: any = {
        type: formData.type,
        priority: formData.priority,
        date: new Date().toISOString(),
        reviewed: false,
      };

      if (formData.subject) metadata.subject = formData.subject;
      if (formData.company) metadata.company = formData.company;
      if (formData.deadline) metadata.deadline = new Date(formData.deadline).toISOString();

      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          metadata,
        }),
      });

      if (!response.ok) throw new Error('Failed to add memory');

      // Reset form
      // Reset form
      setFormData({
        content: '',
        type: 'study',
        subject: '',
        company: '',
        priority: 'medium',
        deadline: '',
      });
      setStep('type');
      setIsOpen(false);
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error adding memory:', error);
      alert('Failed to add memory');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-5 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => {
        setIsOpen(false);
        setStep('type');
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold font-syne">Add Memory</h2>
              <p className="text-purple-100 mt-1">
                {step === 'type' ? 'Choose what you want to remember' : `Adding ${selectedType?.title}`}
              </p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setStep('type');
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'type' ? (
            /* Step 1: Choose Type */
            <div className="space-y-4">
              <p className="text-gray-700 text-lg mb-6 font-medium">Select the type of memory you want to add:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memoryTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => {
                        setFormData({ ...formData, type: type.type });
                        setStep('details');
                      }}
                      className="group relative p-6 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:shadow-2xl transition-all text-left bg-white"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                      <div className="relative">
                        <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{type.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Step 2: Add Details */
            <div className="relative">
              {/* Drag & Drop Overlay - Only shows when dragging */}
              {isDragging && (
                <div className="fixed inset-0 bg-purple-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-[100]">
                  <div className="text-center bg-white p-8 rounded-2xl shadow-2xl border-4 border-purple-500 border-dashed">
                    <Upload className="w-16 h-16 text-purple-500 mx-auto mb-3" />
                    <p className="text-purple-600 font-bold text-xl">Drop file to add content</p>
                    <p className="text-gray-600 text-sm mt-2">Supports .txt and .md files</p>
                  </div>
                </div>
              )}

              <form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    What do you want to remember? *
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.md,.markdown"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </span>
                  </label>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                  rows={6}
                  required
                  placeholder={selectedType?.placeholder}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">💡 Tip: Upload a file or drag & drop anywhere on this form</p>
              </div>

              {/* Context Field (Subject or Company) */}
              {(formData.type === 'study' || formData.type === 'interview') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {formData.type === 'study' ? '📚 Subject' : '🏢 Company'}
                  </label>
                  <input
                    type="text"
                    list={formData.type === 'study' ? 'subjects-list' : 'companies-list'}
                    value={formData.type === 'study' ? formData.subject : formData.company}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [formData.type === 'study' ? 'subject' : 'company']: e.target.value 
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                    placeholder={formData.type === 'study' ? 'e.g., Machine Learning, Database Systems' : 'e.g., Google, Meta, Stripe'}
                  />
                  {/* Auto-suggest datalist */}
                  {formData.type === 'study' && pastSubjects.length > 0 && (
                    <datalist id="subjects-list">
                      {pastSubjects.map(subject => (
                        <option key={subject} value={subject} />
                      ))}
                    </datalist>
                  )}
                  {formData.type === 'interview' && pastCompanies.length > 0 && (
                    <datalist id="companies-list">
                      {pastCompanies.map(company => (
                        <option key={company} value={company} />
                      ))}
                    </datalist>
                  )}
                </div>
              )}

              {/* Priority & Deadline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          formData.priority === priority
                            ? priority === 'high' 
                              ? 'bg-red-500 text-white'
                              : priority === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Deadline (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Memory
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Memory saved!</p>
            <p className="text-sm text-green-100">Added to your Supermemory</p>
          </div>
        </div>
      )}
    </div>
  );
}
