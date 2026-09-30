import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  X,
  Copy,
  Check,
  Building2,
  BookOpen,
  GripVertical,
  RotateCcw,
  TicketCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { submitSupportTicket } from '../services/cadastralApi';

interface SupportFloatProps {
  onOpenLegal: (tab: 'privacy' | 'terms' | 'contact') => void;
  onWidgetRemoved?: () => void;
}

export const SupportFloat: React.FC<SupportFloatProps> = ({ onOpenLegal, onWidgetRemoved }) => {
  // Widget removal state (client can remove or restore widget anytime)
  const [isRemoved, setIsRemoved] = useState<boolean>(() => {
    try {
      return localStorage.getItem('terragis_support_widget_removed') === 'true';
    } catch {
      return false;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'faq' | 'ticket'>('contacts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Position reset counter
  const [dragKey, setDragKey] = useState(0);

  // Support Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'E-Gharouni Property Card',
    subject: '',
    message: '',
  });
  const [ticketStatus, setTicketStatus] = useState<{
    submitting: boolean;
    successTicket?: any;
    errorMessage?: string;
  }>({ submitting: false });

  // Listen for Alt+H keyboard shortcut to toggle or restore widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsRemoved((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('terragis_support_widget_removed', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRemoveWidget = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRemoved(true);
    setIsOpen(false);
    try {
      localStorage.setItem('terragis_support_widget_removed', 'true');
    } catch {}
    if (onWidgetRemoved) onWidgetRemoved();
  };

  const handleRestoreWidget = () => {
    setIsRemoved(false);
    setIsOpen(true);
    try {
      localStorage.setItem('terragis_support_widget_removed', 'false');
    } catch {}
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.message.trim() || !ticketForm.name.trim() || !ticketForm.phone.trim()) {
      setTicketStatus({
        submitting: false,
        errorMessage: 'Please enter your Name, Phone Number, and details of your request.',
      });
      return;
    }

    setTicketStatus({ submitting: true, errorMessage: undefined });

    try {
      const res = await submitSupportTicket(ticketForm);
      setTicketStatus({
        submitting: false,
        successTicket: res.ticket,
      });
      setTicketForm({
        name: '',
        email: '',
        phone: '',
        category: 'E-Gharouni Property Card',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setTicketStatus({
        submitting: false,
        errorMessage: err.message || 'Failed to submit ticket. Please check connection.',
      });
    }
  };

  const FAQS = [
    {
      q: 'How do I download my certified E-Gharouni (Property Card)?',
      a: 'Go to the Citizen Portal or use the search bar on the home page. Search by your Khasra/Plot number (e.g. MH-PUN-HAV-2024-142B) or owner name. Click "View Official Property Card" to view, print, or download the certified document with official QR stamp.',
    },
    {
      q: 'How do I lodge a boundary dispute or encroachment issue?',
      a: 'In the Citizen Portal, click on the "Grievances & Disputes" tab. Select your parcel, specify the nature of the dispute (such as bund encroachment or road boundary), and submit. A Revenue Inspector will be assigned within 3 working days.',
    },
    {
      q: 'Can I view village land maps on my phone?',
      a: 'Yes! The Interactive Cadastral Map (भू-नक्शा) is fully mobile-responsive. You can zoom in to see individual plot boundary lines, survey markers, village roads, and canal paths.',
    },
    {
      q: 'What is Khasra / Satbara 7/12?',
      a: 'Satbara (7/12) is the official record of rights in Maharashtra containing land ownership, survey number, area, type of cultivation, and any encumbrances. Khasra is the unique survey parcel number assigned to each piece of land.',
    },
    {
      q: 'Where can I visit in person for revenue help in Haveli, Pune?',
      a: 'You can visit the Tehsil Office, Haveli Division, Near Mahatma Phule Mandai, Pune, Maharashtra 411002 (Monday to Friday, 10:00 AM – 5:00 PM).',
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // If client removed widget, show subtle floating pill or allow keyboard recall
  if (isRemoved) {
    return (
      <div className="fixed bottom-3 right-4 z-30">
        <button
          onClick={handleRestoreWidget}
          id="btn-restore-support-widget"
          className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 shadow-md backdrop-blur-xs transition flex items-center gap-1.5 cursor-pointer"
          title="Restore Help & Support widget (or press Alt+H)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Need Help? (Alt+H)</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Draggable Trigger Button */}
      <motion.div
        key={dragKey}
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.05 }}
        className="fixed bottom-6 left-6 z-40 flex items-center"
      >
        <div className="relative flex items-center bg-slate-900 dark:bg-emerald-800 text-white rounded-full shadow-2xl border border-slate-700/60 dark:border-emerald-600/50 p-1 group">
          {/* Drag Handle Grip */}
          <div
            className="cursor-grab active:cursor-grabbing px-1.5 text-slate-400 hover:text-white flex items-center"
            title="Click and drag anywhere on screen"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Main Button to Open */}
          <button
            id="btn-open-helpdesk-float"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition hover:text-emerald-300 focus:outline-hidden cursor-pointer"
            title="Open Citizen Helpdesk & Contact Center"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Need Help? / सहायता केंद्र</span>
          </button>

          {/* Dedicated Remove / Dismiss Button */}
          <button
            onClick={handleRemoveWidget}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-white/10 transition ml-1 cursor-pointer"
            title="Hide Helpdesk (Press Alt+H anytime to restore)"
            aria-label="Remove Helpdesk"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Main Support Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 left-6 z-50 w-[94vw] sm:w-[380px] md:w-[420px] max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
          >
            {/* Header with Title & Action Controls */}
            <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white p-3.5 border-b border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Citizen Help & Grievance Desk
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Toll-Free Helpline: 1800-180-1551 (24x7)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reset position button */}
                <button
                  onClick={() => setDragKey((k) => k + 1)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Reset widget position to bottom-left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Close dialog */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                  title="Close helpdesk window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition cursor-pointer ${
                  activeTab === 'contacts'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Helplines & Offices
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition cursor-pointer ${
                  activeTab === 'faq'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'ticket'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <TicketCheck className="w-3.5 h-3.5 text-emerald-600" />
                Log Grievance
              </button>
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              {/* TAB 1: HELPLINES & CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">
                      National Kisan & Land Records Helpline
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                      Toll-free helpline for land title verification, Svamitva scheme, and digital records assistance.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                        <Phone className="w-4 h-4" />
                        <span>1800-180-1551</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('1800-180-1551', 'tollfree')}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'tollfree' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'tollfree' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Tehsil Office, Haveli Division</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Near Mahatma Phule Mandai, Pune, Maharashtra 411002
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          Phone: 020-24440123 • Email: tehsil.haveli@maharashtra.gov.in
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Survey of India (SOI) Pune Office</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Geodetic & Research Branch, Phadke Sankul, Pune 411005
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hours: 09:30 AM – 05:30 PM (Mon – Fri)
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: FAQS */}
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
                          className="w-full px-3 py-2.5 text-left font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
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

              {/* TAB 3: LOG TICKET */}
              {activeTab === 'ticket' && (
                <div>
                  {ticketStatus.successTicket ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        Request Registered Successfully
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-200">
                        Your reference token is{' '}
                        <span className="font-mono font-bold text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                          {ticketStatus.successTicket.ticketId}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        An SMS confirmation has been queued for {ticketStatus.successTicket.phone}. A Revenue Inspector will review within 3 working days.
                      </p>
                      <button
                        onClick={() =>
                          setTicketStatus({ submitting: false, successTicket: undefined })
                        }
                        className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-3">
                      {ticketStatus.errorMessage && (
                        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{ticketStatus.errorMessage}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name (पूरा नाम) *
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketForm.name}
                          onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                          placeholder="e.g. Rameshwar Shinde"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Phone / Mobile *
                          </label>
                          <input
                            type="tel"
                            required
                            value={ticketForm.phone}
                            onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                            placeholder="e.g. 9876543210"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Service Category
                          </label>
                          <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden cursor-pointer"
                          >
                            <option value="E-Gharouni Property Card">Property Card (ई-घरौनी)</option>
                            <option value="Boundary Dispute">Boundary Dispute (सीमा विवाद)</option>
                            <option value="Mutation Record">Mutation (दाखिल-खारिज)</option>
                            <option value="Map Correction">Map Correction (नक्शा दुरुस्ती)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Describe your issue or plot details *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                          placeholder="Include your Village name, Khasra number, or specific question..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={ticketStatus.submitting}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{ticketStatus.submitting ? 'Submitting...' : 'Submit Grievance Ticket'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Quiet Footer */}
            <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>National Cadastre Portal</span>
              <button
                onClick={() => onOpenLegal('contact')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                Revenue Directory &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
