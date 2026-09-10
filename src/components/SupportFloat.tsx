import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  X,
  Copy,
  Check,
  Send,
  Building2,
  BookOpen,
} from 'lucide-react';

interface SupportFloatProps {
  onOpenLegal: (tab: 'privacy' | 'terms' | 'contact') => void;
}

export const SupportFloat: React.FC<SupportFloatProps> = ({ onOpenLegal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'assistant' | 'contacts'>('faq');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick AI Chat simulation (cadastral rules)
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! I am the TerraGIS Cadastral AI assistant. Ask me anything about Khasra boundaries, E-Gharouni property cards, RFCTLARR compensation, or survey dispute resolution.',
    },
  ]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userQ = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user' as const, text: userQ }];
    setChatMessages(newMessages);
    setChatInput('');

    // Generate intelligent response based on cadastral keywords
    setTimeout(() => {
      let reply = 'For general inquiries, please contact your local Tehsil Revenue Inspector or call our toll-free helpline at 1800-180-1551.';
      const lower = userQ.toLowerCase();

      if (lower.includes('card') || lower.includes('gharouni') || lower.includes('svamitva') || lower.includes('property')) {
        reply = 'Digital Property Cards (E-Gharouni) are generated under the SVAMITVA scheme after drone orthorectified aerial mapping. They serve as legal proof of ownership for village household abadi lands and can be used directly for obtaining bank loans.';
      } else if (lower.includes('dispute') || lower.includes('encroach') || lower.includes('boundary') || lower.includes('grievance')) {
        reply = 'Boundary disputes can be lodged under the Citizen Portal "Grievances" section. A unique token is issued and a joint field inspection is scheduled by the Revenue Inspector within 14 statutory working days.';
      } else if (lower.includes('compensation') || lower.includes('payout') || lower.includes('highway') || lower.includes('rfctlarr')) {
        reply = 'Under the RFCTLARR Act 2013, acquired agricultural and residential land receives the Circle Rate/Market Value multiplied by a rural factor (1.5x - 2.0x), plus a mandatory 100% Solatium and 12% statutory annual interest.';
      } else if (lower.includes('offline') || lower.includes('sync') || lower.includes('internet')) {
        reply = 'TerraGIS supports full offline operability. Field inspections made without internet are buffered securely in browser IndexedDB storage and synced automatically once connectivity is restored.';
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 450);
  };

  const FAQS = [
    {
      q: 'How do I download my certified E-Gharouni Property Card?',
      a: 'Switch to the Citizen Portal using the top ribbon toggle, find your parcel by Khasra number or registered owner name, and click "View Official Property Card". You can print or download the verified PDF certificate containing your digital QR signature.',
    },
    {
      q: 'What is the accuracy of drone boundary mapping?',
      a: 'Survey of India CORS (Continuously Operating Reference Stations) provide RTK geodetic correction achieving ±5 cm sub-decimeter topological accuracy.',
    },
    {
      q: 'How does the Offline Sync queue handle data conflicts?',
      a: 'TerraGIS employs a server-authoritative timestamping engine with optimistic client-side buffering. Mutations made offline are cryptographically signed and resolved chronologically.',
    },
    {
      q: 'How can I trigger the live cadastral geofence simulation?',
      a: 'Click the "Geofence Telemetry" button in the top navigation bar. You can view real-time surveyor coordinates and test boundary breach audio-visual alerts.',
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white shadow-2xl border border-slate-700/50 transition-all active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          title="Open Land Help & Support Desk"
        >
          <div className="relative">
            <HelpCircle className="w-5 h-5 text-emerald-400 dark:text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-xs font-bold hidden sm:inline">Help & Support</span>
        </button>
      </div>

      {/* Floating Help Drawer / Card */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[520px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs">TerraGIS Help Desk</h3>
                <p className="text-[10px] text-slate-300">Official Cadastre & Jury Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 font-bold text-center border-b-2 transition ${
                activeTab === 'faq'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex-1 py-2 font-bold text-center border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === 'assistant'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-2 font-bold text-center border-b-2 transition ${
                activeTab === 'contacts'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Contacts
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 text-xs">
            {activeTab === 'faq' && (
              <div className="space-y-2">
                {FAQS.map((item, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full px-3 py-2.5 text-left font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <span className="pr-2">{item.q}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-2.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="flex flex-col h-[300px]">
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-2xs border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChat} className="flex gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about Khasra, survey, property card..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-slate-100 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Toll-Free Helpline
                    </span>
                    <button
                      onClick={() => copyToClipboard('1800-180-1551', 'phone')}
                      className="text-slate-400 hover:text-emerald-600 p-1 transition"
                      title="Copy helpline"
                    >
                      {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">1800-180-1551</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">08:00 AM - 08:00 PM IST (Mon-Sat)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Nodal Support Email
                    </span>
                    <button
                      onClick={() => copyToClipboard('support-cadastre@terragis.gov.in', 'email')}
                      className="text-slate-400 hover:text-emerald-600 p-1 transition"
                      title="Copy email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">support-cadastre@terragis.gov.in</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    Physical Headquarters
                  </span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                    Ministry of Rural Development & Panchayati Raj, Krishi Bhawan, Rafi Marg, New Delhi 110001
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenLegal('contact');
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition"
                >
                  View Full Ministry Directory
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
