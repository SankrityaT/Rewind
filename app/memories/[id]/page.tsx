'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { Memory, MemoryType } from '@/types';
import { ArrowLeft, Save, Trash2, Calendar, Tag, AlertCircle, CheckCircle, Loader2, Clock, Edit3, X } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    type: 'study' as MemoryType,
    subject: '',
    company: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
    reviewed: false,
  });

  useEffect(() => {
    // Check if ID is valid
    if (!params.id || params.id === 'undefined') {
      console.error('❌ [MemoryDetail] Invalid ID:', params.id);
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetchMemory();
  }, [params.id]);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      // Fetch all memories and find the one we need
      const response = await fetch('/api/memories?limit=200');
      const data = await response.json();
      console.groupCollapsed('[MemoryDetail] Fetch result for', params.id);
      console.log('Total memories fetched:', data.memories?.length ?? 0);
      data.memories?.slice(0, 5).forEach((m: any, idx: number) => {
        if (m.id === params.id) {
          console.log(`#${idx} <MATCH>`, {
            id: m.id,
            hasContent: Boolean(m.content),
            contentPreview: m.content?.slice(0, 80) ?? null,
            metadata: m.metadata,
            status: m.status,
          });
        } else {
          console.log(`#${idx}`, {
            id: m.id,
            hasContent: Boolean(m.content),
            status: m.status,
          });
        }
      });
      const foundMemory = data.memories?.find((m: Memory) => m.id === params.id);
      console.log('Resolved memory:', foundMemory ? {
        id: foundMemory.id,
        hasContent: Boolean(foundMemory.content),
        contentPreview: foundMemory.content?.slice(0, 120) ?? null,
        metadata: foundMemory.metadata,
        status: (foundMemory as any).status,
      } : null);
      console.groupEnd();
      
      if (foundMemory) {
        setMemory(foundMemory);
        setNotFound(false);
        setFormData({
          content: foundMemory.content || '',
          type: foundMemory.metadata?.type || 'personal',
          subject: foundMemory.metadata?.subject || '',
          company: foundMemory.metadata?.company || '',
          priority: foundMemory.metadata?.priority || 'medium',
          deadline: foundMemory.metadata?.deadline || '',
          reviewed: foundMemory.metadata?.reviewed || false,
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching memory:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!memory) return;
    
    try {
      setSaving(true);
      const metadata: any = {
        type: formData.type,
        priority: formData.priority,
        reviewed: formData.reviewed,
        date: memory.metadata.date,
      };

      if (formData.subject) metadata.subject = formData.subject;
      if (formData.company) metadata.company = formData.company;
      if (formData.deadline) metadata.deadline = formData.deadline;

      const response = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memory.id,
          content: formData.content,
          metadata,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchMemory();
      }
    } catch (error) {
      console.error('Error saving memory:', error);
      alert('Failed to save memory');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memory || !confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      const response = await fetch(`/api/memories?id=${memory.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/memories');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory');
    }
  };

  const toggleReviewed = async () => {
    if (!memory) {
      console.error('[toggleReviewed] No memory loaded');
      return;
    }
    
    const newReviewed = !formData.reviewed;
    console.log('[toggleReviewed] Toggling from', formData.reviewed, 'to', newReviewed);
    setFormData({ ...formData, reviewed: newReviewed });
    
    try {
      const payload = {
        id: memory.id,
        content: memory.content,
        metadata: {
          ...memory.metadata,
          reviewed: newReviewed,
          lastReviewed: newReviewed ? new Date().toISOString() : memory.metadata.lastReviewed,
        },
      };
      console.log('[toggleReviewed] Sending PUT request:', payload);
      
      const response = await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('[toggleReviewed] Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[toggleReviewed] API error:', errorText);
        alert('Failed to update review status');
        return;
      }
      
      console.log('[toggleReviewed] Success, refetching memory');
      fetchMemory();
    } catch (error) {
      console.error('[toggleReviewed] Error:', error);
      alert('Failed to update review status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!memory || notFound) {
    return (
      <DarkBackground>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/memories" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to memories
          </Link>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Memory Not Found</h2>
            <p className="text-gray-400 mb-2">
              {params.id === 'undefined' || !params.id 
                ? 'This memory has an invalid ID. Search results may have incomplete data.'
                : 'This memory might still be processing or the ID doesn\'t match.'
              }
            </p>
            <p className="text-sm text-gray-500 mb-6">
              ID: {params.id || 'undefined'}
            </p>
            <Link 
              href="/memories" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-transform font-semibold"
            >
              View All Memories
            </Link>
          </div>
        </div>
      </DarkBackground>
    );
  }

  const getTypeColor = () => {
    switch (memory.metadata.type) {
      case 'study': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'interview': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'meeting': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DarkBackground>
      <Navigation />
      
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/memories"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to memories</span>
          </Link>

          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 border-b border-gray-200/50">
              <div className="flex items-start justify-between gap-4 mb-6">
                {/* Tags & Metadata */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border-2 ${getTypeColor()}`}>
                      {memory.metadata.type}
                    </span>
                    
                    {memory.metadata.subject && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        {memory.metadata.subject}
                      </span>
                    )}
                    
                    {memory.metadata.company && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                        {memory.metadata.company}
                      </span>
                    )}
                  </div>

                  {/* Priority Badge */}
                  <div className="inline-flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      memory.metadata.priority === 'high' ? 'bg-red-500 animate-pulse' :
                      memory.metadata.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      memory.metadata.priority === 'high' ? 'text-red-700' :
                      memory.metadata.priority === 'medium' ? 'text-yellow-700' :
                      'text-gray-600'
                    }`}>
                      {memory.metadata.priority.charAt(0).toUpperCase() + memory.metadata.priority.slice(1)} Priority
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchMemory();
                        }}
                        className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(memory.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                {memory.metadata.deadline && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>Due {format(new Date(memory.metadata.deadline), 'MMM d')}</span>
                  </div>
                )}

                <button
                  onClick={toggleReviewed}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    formData.reviewed
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${formData.reviewed ? 'fill-green-600' : ''}`} />
                  <span className="text-sm">
                    {formData.reviewed ? 'Reviewed ✓' : 'Mark as reviewed'}
                  </span>
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white resize-none transition-all"
                      rows={12}
                      placeholder="Enter your memory content..."
                    />
                  </div>

                  {/* Metadata Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MemoryType })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      >
                        <option value="study">Study</option>
                        <option value="interview">Interview</option>
                        <option value="meeting">Meeting</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {formData.type === 'study' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                        placeholder="e.g., Mathematics, Physics"
                      />
                    </div>
                  )}

                  {formData.type === 'interview' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                        placeholder="e.g., Google, Microsoft"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {memory.content}
                    </p>
                  </div>

                  {/* Additional Info Footer */}
                  {memory.metadata.lastReviewed && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Last reviewed on {format(new Date(memory.metadata.lastReviewed), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DarkBackground>
  );
}
