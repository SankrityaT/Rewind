'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DarkBackground } from '@/components/DarkBackground';
import { Dialog } from '@/components/ui/Dialog';
import { Mail, Bell, Zap, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [dialog, setDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'email' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleGeneratePreview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency, sendEmail: true }),
      });

      const data = await response.json();
      setPreview(data.preview);
      
      // Show appropriate message based on email sending status
      if (data.emailSent) {
        setDialog({
          isOpen: true,
          title: '✅ Email Sent!',
          message: `Successfully sent to ${email}\n\nCheck your inbox for the digest!`,
          type: 'success',
        });
      } else if (data.emailError) {
        setDialog({
          isOpen: true,
          title: '⚠️ Sending Failed',
          message: `${data.message}\n\nYou can still see the preview below.`,
          type: 'error',
        });
      } else {
        setDialog({
          isOpen: true,
          title: '📧 Preview Generated',
          message: data.message,
          type: 'email',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setDialog({
        isOpen: true,
        title: '❌ Error',
        message: 'Failed to generate digest. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DarkBackground>
      <Navigation />
      
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
      
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-syne">Settings</h1>
            <p className="text-xl text-gray-400">Configure your proactive notifications</p>
          </div>

          {/* Email Digest Settings */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white font-syne">Email Digest</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFrequency('daily')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      frequency === 'daily'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <Bell className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-white font-semibold">Daily</div>
                      <div className="text-sm text-gray-400">Every morning at 9 AM</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFrequency('weekly')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      frequency === 'weekly'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <Mail className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                      <div className="text-white font-semibold">Weekly</div>
                      <div className="text-sm text-gray-400">Every Monday at 9 AM</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-semibold mb-1">What you'll get:</p>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• Urgent items with approaching deadlines</li>
                      <li>• Unreviewed memories that need attention</li>
                      <li>• Pattern insights and learning trends</li>
                      <li>• Personalized study recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGeneratePreview}
                disabled={!email || loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Test Email
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                This will send a real email to {email || 'your address'}.
              </p>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 font-syne">Email Preview</h3>
              <div className="bg-white rounded-xl p-6 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              </div>
            </div>
          )}

          {/* Future Connections */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2 font-syne">Future Connections</h3>
            <p className="text-gray-400 mb-6">Connect your tools to automatically capture context and enhance your memory.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">�</div>
                <div className="text-white font-semibold mb-1">Google Docs</div>
                <div className="text-sm text-gray-400">Auto-save notes and documents</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-white font-semibold mb-1">Notion</div>
                <div className="text-sm text-gray-400">Sync your knowledge base</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">🎥</div>
                <div className="text-white font-semibold mb-1">Google Meet</div>
                <div className="text-sm text-gray-400">Capture meeting transcripts</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">�</div>
                <div className="text-white font-semibold mb-1">Zoom</div>
                <div className="text-sm text-gray-400">Save meeting summaries</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">📧</div>
                <div className="text-white font-semibold mb-1">Gmail</div>
                <div className="text-sm text-gray-400">Important emails as memories</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-white font-semibold mb-1">Slack</div>
                <div className="text-sm text-gray-400">Key conversations & threads</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">🗓️</div>
                <div className="text-white font-semibold mb-1">Google Calendar</div>
                <div className="text-sm text-gray-400">Event context & notes</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">🔗</div>
                <div className="text-white font-semibold mb-1">Browser Extension</div>
                <div className="text-sm text-gray-400">Save from any webpage</div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-not-allowed opacity-75">
                <div className="text-2xl mb-2">💻</div>
                <div className="text-white font-semibold mb-1">GitHub</div>
                <div className="text-sm text-gray-400">Code snippets & PRs</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-300 font-semibold mb-1">Coming Soon</p>
                  <p className="text-sm text-purple-200">
                    These integrations will automatically capture context from your daily tools, making your memory even more powerful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DarkBackground>
  );
}
