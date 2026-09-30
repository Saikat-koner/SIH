import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  FileText,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Download,
  Printer,
  Volume2,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Landmark,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  QrCode,
  Sparkles,
  Phone,
  RefreshCw,
  Eye,
  Check,
  Compass,
  Sun,
  Moon,
  Code2,
} from 'lucide-react';
import { LandParcel } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { getTranslation } from '../i18n/translations';
import { fetchGrievances, submitGrievanceToBackend } from '../services/cadastralApi';

interface CitizenPortalProps {
  parcels: LandParcel[];
  onSwitchToAdmin: () => void;
  onSwitchToHome?: () => void;
  onLocateOnMap: (parcel: LandParcel) => void;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

interface GrievanceItem {
  id: string;
  parcelNumber: string;
  ownerName: string;
  category: 'boundary_dispute' | 'record_correction' | 'resurvey_request' | 'inheritance';
  title: string;
  description: string;
  submittedAt: string;
  status: 'submitted' | 'under_inspection' | 'hearing_scheduled' | 'resolved';
  assignedOfficer: string;
  slaDaysRemaining: number;
}

const INITIAL_GRIEVANCES: GrievanceItem[] = [
  {
    id: 'GRV-2024-881',
    parcelNumber: 'MH-PUN-HAV-2024-142B',
    ownerName: 'Rameshwar K. Shinde',
    category: 'boundary_dispute',
    title: 'Medh (Mud Ridge) southern encroachment of 1.4m',
    description: 'Adjacent owner tilled the ancestral bund ridge. Drone CORS survey confirms 1.4m deviation from 1998 cadastre.',
    submittedAt: '2024-04-03',
    status: 'hearing_scheduled',
    assignedOfficer: 'Revenue Inspector (RI) Suresh Deshmukh',
    slaDaysRemaining: 4,
  },
  {
    id: 'GRV-2024-892',
    parcelNumber: 'MH-PUN-SVAM-8812',
    ownerName: 'Laxman V. Jadhav',
    category: 'record_correction',
    title: 'Correction of spouse co-tenancy spelling in 8A extract',
    description: 'Requesting amendment of spouse name to Sunita Laxman Jadhav in official village records.',
    submittedAt: '2024-04-08',
    status: 'under_inspection',
    assignedOfficer: 'Patwari Rajesh Shinde',
    slaDaysRemaining: 8,
  },
  {
    id: 'GRV-2024-905',
    parcelNumber: 'MH-PUN-HAV-2024-142A',
    ownerName: 'Dnyaneshwar Ramchandra Patil',
    category: 'resurvey_request',
    title: 'Drone ground control point resurvey for canal easement',
    description: 'Irrigation department canal expansion marked. Requesting resurvey of eastern boundary pegs.',
    submittedAt: '2024-04-10',
    status: 'submitted',
    assignedOfficer: 'Tehsildar Office Geomatics Unit',
    slaDaysRemaining: 14,
  },
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  parcels,
  onSwitchToAdmin,
  onSwitchToHome,
  onLocateOnMap,
  currentLang,
  onLanguageChange,
  theme = 'light',
  onToggleTheme,
}) => {
  const { formatMoney } = useCurrency();
  const t = useMemo(() => getTranslation(currentLang), [currentLang]);

  const [activeTab, setActiveTab] = useState<'records' | 'propertyCard' | 'grievance' | 'compensation'>(
    'records'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [grievances, setGrievances] = useState<GrievanceItem[]>(INITIAL_GRIEVANCES);

  // Sync grievances with backend on mount
  React.useEffect(() => {
    fetchGrievances()
      .then((data) => {
        if (data && data.length > 0) {
          setGrievances(data as any);
        }
      })
      .catch(() => {});
  }, []);

  // New Grievance Form State
  const [showNewGrievanceForm, setShowNewGrievanceForm] = useState<boolean>(false);
  const [formParcelId, setFormParcelId] = useState<string>(parcels[0]?.id || '');
  const [formCategory, setFormCategory] = useState<GrievanceItem['category']>('boundary_dispute');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Audio Read-aloud State & Accessibility Announcements
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const tabsList: Array<'records' | 'propertyCard' | 'grievance' | 'compensation'> = [
    'records',
    'propertyCard',
    'grievance',
    'compensation',
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabsList.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabsList.length) % tabsList.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabsList.length - 1;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      const nextTab = tabsList[nextIndex];
      setActiveTab(nextTab);
      document.getElementById(`tab-citizen-${nextTab}`)?.focus();
    }
  };

  const selectedParcel = useMemo(() => {
    return parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  }, [parcels, selectedParcelId]);

  // Filtered parcels for search
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.parcelNumber.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.deedId.toLowerCase().includes(q);

      const matchesFilter =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && p.status === 'active') ||
        (statusFilter === 'disputed' && p.status === 'disputed') ||
        (statusFilter === 'review' && (p.status === 'in_review' || p.status === 'survey_pending'));

      return matchesSearch && matchesFilter;
    });
  }, [parcels, searchQuery, statusFilter]);

  // Audio Readout Feature for Rural Accessibility
  const handleReadAloud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    if (currentLang === 'hi') utterance.lang = 'hi-IN';
    else if (currentLang === 'mr') utterance.lang = 'mr-IN';
    else if (currentLang === 'bn') utterance.lang = 'bn-IN';
    else if (currentLang === 'te') utterance.lang = 'te-IN';
    else if (currentLang === 'ta') utterance.lang = 'ta-IN';
    else if (currentLang === 'gu') utterance.lang = 'gu-IN';
    else if (currentLang === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Grievance
  const handleCreateGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    const targetParcel = parcels.find((p) => p.id === formParcelId) || parcels[0];
    const newGrievance: GrievanceItem = {
      id: `GRV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      parcelNumber: targetParcel.parcelNumber,
      ownerName: targetParcel.owner,
      category: formCategory,
      title: formTitle,
      description: formDescription,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted',
      assignedOfficer: 'Revenue Inspector (RI) Suresh Deshmukh',
      slaDaysRemaining: 14,
    };

    setGrievances([newGrievance, ...grievances]);
    setFormTitle('');
    setFormDescription('');
    setShowNewGrievanceForm(false);

    // Call real backend API
    submitGrievanceToBackend({
      parcelNumber: targetParcel.parcelNumber,
      ownerName: targetParcel.owner,
      category: formCategory,
      title: formTitle,
      description: formDescription,
    }).catch((err) => console.warn('Grievance backend sync:', err));

    setFormSuccessMessage(
      `Grievance ticket #${newGrievance.id} generated successfully. SMS acknowledgment dispatched to registered mobile.`
    );
    setTimeout(() => setFormSuccessMessage(null), 8000);
  };

  // Print Property Card
  const handlePrintCard = () => {
    window.print();
  };

  // Convert Hectare to Indian Village Bigha & Guntha
  const formatIndianUnits = (hectares: number) => {
    const bigha = (hectares * 3.95).toFixed(2);
    const guntha = (hectares * 98.84).toFixed(1);
    return `${hectares} Hectares (${bigha} Bigha / ${guntha} Guntha)`;
  };

  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative">
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#citizen-tablist"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-800 focus:text-white focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold text-xs"
      >
        Skip to Land Record Services (मुख्य सामग्री पर जाएं)
      </a>

      {/* Screen Reader Live Region for Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Header Banner */}
      <header role="banner" className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white border-b border-emerald-700/50 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0" aria-hidden="true">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  {t.portalTitle}
                </h1>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-400/30 uppercase">
                  DILRMP
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {t.portalSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Action Buttons (Home, Language, Admin GIS, Theme) */}
          <div className="flex items-center gap-2 flex-wrap" role="navigation" aria-label="Portal Navigation Actions">
            {/* Tactical Dark / Light Theme Toggle */}
            {onToggleTheme && (
              <button
                id="btn-citizen-theme-toggle"
                onClick={onToggleTheme}
                aria-label={theme === 'dark' ? 'Switch to Standard Light Mode' : 'Switch to Tactical Dark Mode'}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition active:scale-95"
                title={theme === 'dark' ? 'Switch to Standard Light Mode' : 'Switch to Tactical Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-300" aria-hidden="true" />
                )}
              </button>
            )}

            {onSwitchToHome && (
              <motion.button
                id="btn-citizen-back-home"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={onSwitchToHome}
                aria-label="Return to Sovereign Cadastre Homepage"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-hidden cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>{t.switchToHome}</span>
              </motion.button>
            )}

            {/* Accessible Language Selector */}
            <label htmlFor="citizen-lang-select" className="sr-only">
              Select vernacular language
            </label>
            <select
              id="citizen-lang-select"
              aria-label="Select vernacular language"
              value={currentLang}
              onChange={(e) => {
                onLanguageChange(e.target.value);
                setSrAnnouncement(`Language switched to ${e.target.value.toUpperCase()}`);
              }}
              className="bg-slate-900 text-white border border-emerald-600/50 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="bn">বাংলা (BN)</option>
              <option value="te">తెలుగు (TE)</option>
              <option value="ta">தமிழ் (TA)</option>
              <option value="gu">ગુજરાતી (GU)</option>
              <option value="kn">ಕನ್ನಡ (KN)</option>
            </select>

            <motion.button
              id="btn-citizen-switch-admin"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={onSwitchToAdmin}
              aria-label="Switch to Enterprise Admin GIS map and cadastre tools"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{t.switchToAdmin}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Citizen Content Area */}
      <main id="main-citizen-content" role="main" aria-label="Citizen Land Records and Services Portal" className="max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-5 flex-1 flex flex-col gap-5">
        {/* Quick Citizen Metrics Bar */}
        <section aria-label="Citizen land records quick summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0" aria-hidden="true">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.registeredHoldings}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{parcels.length} Parcels</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Survey Verified</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0" aria-hidden="true">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.propertyCards}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">Available (PDF)</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">QR Digitally Signed</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0" aria-hidden="true">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.activeDisputes}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{grievances.length} Active</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Tehsildar SLA Monitored</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0" aria-hidden="true">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.compensationDbt}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">Direct Bank Transfer</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">RFCTLARR 2013 Compliant</p>
            </div>
          </div>
        </section>

        {/* Citizen Navigation Tabs with WCAG 2.1 Tablist Semantics and Keyboard Navigation */}
        <nav aria-label="Citizen portal sections">
          <div
            id="citizen-tablist"
            role="tablist"
            aria-label="Citizen Land Record Services"
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-1.5 flex items-center gap-1.5 overflow-x-auto"
          >
            <button
              id="tab-citizen-records"
              role="tab"
              aria-selected={activeTab === 'records'}
              aria-controls="panel-citizen-records"
              tabIndex={activeTab === 'records' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 0)}
              onClick={() => {
                setActiveTab('records');
                setSrAnnouncement('Switched to My Land Records tab');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden ${
                activeTab === 'records'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>{t.recordsTab}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20" aria-label={`${parcels.length} parcels available`}>
                {parcels.length}
              </span>
            </button>

            <button
              id="tab-citizen-property-card"
              role="tab"
              aria-selected={activeTab === 'propertyCard'}
              aria-controls="panel-citizen-propertyCard"
              tabIndex={activeTab === 'propertyCard' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 1)}
              onClick={() => {
                setActiveTab('propertyCard');
                setSrAnnouncement('Switched to Official Digital Property Card tab');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden ${
                activeTab === 'propertyCard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>{t.propertyCardTab}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-slate-950 font-black">
                Official
              </span>
            </button>

            <button
              id="tab-citizen-grievance"
              role="tab"
              aria-selected={activeTab === 'grievance'}
              aria-controls="panel-citizen-grievance"
              tabIndex={activeTab === 'grievance' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 2)}
              onClick={() => {
                setActiveTab('grievance');
                setSrAnnouncement('Switched to Grievances and Boundary Disputes tab');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden ${
                activeTab === 'grievance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              <span>{t.grievanceTab}</span>
              {grievances.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold" aria-label={`${grievances.length} active grievances`}>
                  {grievances.length}
                </span>
              )}
            </button>

            <button
              id="tab-citizen-compensation"
              role="tab"
              aria-selected={activeTab === 'compensation'}
              aria-controls="panel-citizen-compensation"
              tabIndex={activeTab === 'compensation' ? 0 : -1}
              onKeyDown={(e) => handleTabKeyDown(e, 3)}
              onClick={() => {
                setActiveTab('compensation');
                setSrAnnouncement('Switched to Infrastructure Compensation & DBT Payouts tab');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden ${
                activeTab === 'compensation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-4 h-4" aria-hidden="true" />
              <span>{t.compensationTab}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                2013 Act
              </span>
            </button>
          </div>
        </nav>

        {formSuccessMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: MY LAND RECORDS (BHULEKH SEARCH) */}
        {activeTab === 'records' && (
          <section
            id="panel-citizen-records"
            role="tabpanel"
            aria-labelledby="tab-citizen-records"
            tabIndex={0}
            className="flex flex-col gap-4 focus-visible:outline-hidden"
          >
            {/* Search & Filter Controls */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <label htmlFor="citizen-search-input" className="sr-only">
                  Search Land Records by Khasra number, deed, or owner name
                </label>
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="citizen-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label="Search Land Records by Khasra number, deed, or owner name"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 focus-visible:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <label htmlFor="citizen-status-filter" className="sr-only">
                  Filter land records by verification status
                </label>
                <select
                  id="citizen-status-filter"
                  aria-label="Filter land records by verification status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="all">{t.allStatus}</option>
                  <option value="verified">{t.verifiedOnly}</option>
                  <option value="review">{t.underReview}</option>
                  <option value="disputed">{t.disputedOnly}</option>
                </select>

                <button
                  onClick={() => {
                    const speechText = `Showing ${filteredParcels.length} land records found in village cadastre records.`;
                    setSrAnnouncement(speechText);
                    handleReadAloud(speechText);
                  }}
                  aria-pressed={isSpeaking}
                  aria-label={isSpeaking ? "Stop voice audio readout" : "Read aloud parcel search results"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition border focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                    isSpeaking
                      ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Rural voice accessibility readout"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>{isSpeaking ? t.stopAudio : t.readAloud}</span>
                </button>
              </div>
            </div>

            {/* Results Live Count for Screen Readers */}
            <div className="sr-only" aria-live="polite">
              {filteredParcels.length} land records match your search criteria.
            </div>

            {/* Parcels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="region" aria-label="Land parcels list">
              {filteredParcels.map((parcel) => (
                <article
                  key={parcel.id}
                  aria-labelledby={`parcel-title-${parcel.id}`}
                  className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between ${
                    selectedParcelId === parcel.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header with Khasra & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[11px] border border-emerald-200">
                        {parcel.parcelNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          parcel.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : parcel.status === 'disputed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {parcel.status === 'active'
                          ? 'सत्यापित (Verified)'
                          : parcel.status === 'disputed'
                          ? 'विवाद (Disputed)'
                          : 'परीक्षण में'}
                      </span>
                    </div>

                    <h3 id={`parcel-title-${parcel.id}`} className="text-sm font-bold text-slate-900 line-clamp-1">
                      {parcel.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>खातेदार: <strong>{parcel.owner}</strong></span>
                    </p>

                    {/* Quick Specs */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">रकबा (Area):</span>
                        <span className="font-bold text-slate-800">{formatIndianUnits(parcel.areaHectares)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">सरकारी मूल्यांकन:</span>
                        <span className="font-bold text-slate-800">{formatMoney(parcel.valuationUSD)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">मिट्टी का प्रकार:</span>
                        <span className="font-medium text-slate-700 truncate block">{parcel.soilType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">डीड आईडी / 7/12:</span>
                        <span className="font-mono text-slate-700 truncate block">{parcel.deedId}</span>
                      </div>
                    </div>

                    {parcel.disputeNotes && (
                      <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-start gap-1.5" role="alert">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{parcel.disputeNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedParcelId(parcel.id);
                        setActiveTab('propertyCard');
                        setSrAnnouncement(`Generated property card for parcel ${parcel.parcelNumber}`);
                      }}
                      aria-label={`View and generate official property card for Khasra ${parcel.parcelNumber} owned by ${parcel.owner}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:outline-hidden"
                    >
                      <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>प्रमाण पत्र (Card)</span>
                    </button>

                    <button
                      onClick={() => onLocateOnMap(parcel)}
                      aria-label={`Locate parcel Khasra ${parcel.parcelNumber} on GIS map`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
                      title="View parcel boundary on GIS map"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    </button>

                    <button
                      onClick={() => {
                        const info = `Khasra number ${parcel.parcelNumber}, registered owner ${parcel.owner}, area ${parcel.areaHectares} hectares, status ${parcel.status}.`;
                        setSrAnnouncement(info);
                        handleReadAloud(info);
                      }}
                      aria-label={`Read aloud details for Khasra ${parcel.parcelNumber}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
                      title="Audio voice readout"
                    >
                      <Volume2 className="w-4 h-4 text-slate-600" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredParcels.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center" role="status">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-700">कोई भूलेख रिकॉर्ड नहीं मिला (No Records Found)</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting search keywords or clearing filters.
                </p>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: OFFICIAL DIGITAL PROPERTY CARD (E-GHAROUNI) */}
        {activeTab === 'propertyCard' && selectedParcel && (
          <section
            id="panel-citizen-propertyCard"
            role="tabpanel"
            aria-labelledby="tab-citizen-propertyCard"
            tabIndex={0}
            className="flex flex-col gap-4 focus-visible:outline-hidden"
          >
            {/* Parcel Selector & Print Bar */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="property-card-parcel-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  पार्सल चुनें (Select Parcel):
                </label>
                <select
                  id="property-card-parcel-select"
                  aria-label="Select land parcel for property card"
                  value={selectedParcelId}
                  onChange={(e) => {
                    setSelectedParcelId(e.target.value);
                    const p = parcels.find(item => item.id === e.target.value);
                    if (p) setSrAnnouncement(`Selected parcel Khasra ${p.parcelNumber} for property card`);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.parcelNumber} - {p.owner} ({p.areaHectares} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCard}
                  aria-label="Print official digital property card document"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:outline-hidden"
                >
                  <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Print Property Card (प्रिंट निकालें)</span>
                </button>
                <button
                  onClick={() => onLocateOnMap(selectedParcel)}
                  aria-label={`Locate parcel Khasra ${selectedParcel.parcelNumber} on GIS map`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Locate on Map</span>
                </button>
              </div>
            </div>

            {/* Authentic Government Property Card Document */}
            <div
              id="printable-property-card"
              role="region"
              aria-label="Official Digital Property Card - E-Gharouni Certificate"
              className="bg-white rounded-2xl border-4 border-double border-emerald-800 p-6 sm:p-8 shadow-xl max-w-4xl mx-auto w-full relative overflow-hidden"
            >
              {/* Official Seal Watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none" aria-hidden="true">
                <Landmark className="w-96 h-96 text-emerald-950" />
              </div>

              {/* Certificate Header */}
              <div className="text-center border-b-2 border-emerald-900 pb-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-xl font-bold shadow-md" aria-hidden="true">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-emerald-950 uppercase">
                      भारत सरकार | GOVERNMENT OF INDIA
                    </h2>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-700">
                      पंचायती राज मंत्रालय | MINISTRY OF PANCHAYATI RAJ
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-800">
                      योजना: स्वामित्व (SVAMITVA Scheme - Survey of Villages and Mapping with Improvised Technology in Village Areas)
                    </p>
                  </div>
                </div>

                <div className="inline-block bg-emerald-950 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase mt-2">
                  स्वामित्व संपत्ति पत्रक / DIGITAL PROPERTY CARD (ई-घरौनी)
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Statutory Record of Rights under State Land Revenue Code & DILRMP National Framework
                </p>
              </div>

              {/* Card Body Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: QR & Security Token */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  {/* High fidelity SVG QR representation with explicit role and accessible label */}
                  <div
                    role="img"
                    aria-label={`Cryptographic verification QR code for UPIN ${selectedParcel.parcelNumber} registered to owner ${selectedParcel.owner}`}
                    className="w-36 h-36 bg-white p-2 border-2 border-slate-800 rounded-lg shadow-sm flex flex-col items-center justify-center"
                  >
                    <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 p-1 bg-slate-900">
                      <div className="bg-white col-span-2 row-span-2"></div>
                      <div className="bg-white col-start-5 col-span-2 row-span-2"></div>
                      <div className="bg-white col-start-1 col-span-2 row-start-5 row-span-2"></div>
                      <div className="bg-white col-start-3 col-span-2 row-start-3 row-span-2 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-600 mt-2 font-bold">
                    UPIN: {selectedParcel.parcelNumber}
                  </p>
                  <p className="text-[9px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                    <span>Survey of India CORS Verified</span>
                  </p>
                  <div className="mt-3 text-[10px] text-slate-500">
                    Scan via e-GramSwaraj or DigiLocker to verify title authenticity
                  </div>
                </div>

                {/* Middle & Right Columns: Legal Details */}
                <div className="md:col-span-2 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">खातेदार का नाम (Owner Name):</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedParcel.owner}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">खसरा / पार्सल संख्या (Khasra No):</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedParcel.parcelNumber}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">कुल क्षेत्रफल (Total Area):</span>
                      <span className="font-bold text-slate-900">{formatIndianUnits(selectedParcel.areaHectares)}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">भूमि उपयोग श्रेणी (Land Zoning):</span>
                      <span className="font-bold text-slate-900">{selectedParcel.zoning}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">अभिलेख विलेख संख्या (Deed / Satbara):</span>
                      <span className="font-mono font-medium text-slate-800">{selectedParcel.deedId}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">भू-स्थानिक केंद्रक (Centroid Coordinates):</span>
                      <span className="font-mono text-slate-800">
                        {selectedParcel.center[0].toFixed(5)}° N, {selectedParcel.center[1].toFixed(5)}° E
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">अंतिम ड्रोन सर्वेक्षण तिथि:</span>
                      <span className="font-medium text-slate-800">{selectedParcel.surveyDate} ({selectedParcel.surveyor})</span>
                    </div>
                  </div>

                  {/* Legal Certification Note */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2" role="note">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <p>
                      यह संपत्ति पत्रक राजस्व विभाग एवं सर्वे ऑफ इंडिया द्वारा ड्रोन सर्वेक्षण तथा ग्राम सभा सत्यापन के उपरांत निर्गत किया गया वैध विधिक अधिकार पत्र है। यह बैंकों से ऋण प्राप्ति हेतु पूर्णतः मान्य है।
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Footer with Digital Signatures */}
              <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-serif italic text-slate-700 font-bold mb-1">Rajesh Shinde</div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    हस्ताक्षर पटवारी / लेखपाल
                    <span className="block text-[10px] text-slate-400">Village Revenue Officer</span>
                  </div>
                </div>

                <div>
                  <div className="font-serif italic text-emerald-800 font-bold mb-1">Digitally Certified ✓</div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    सर्वे ऑफ इंडिया नोडल अधिकारी
                    <span className="block text-[10px] text-slate-400">Survey of India GIS Unit</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <div className="font-serif italic text-slate-700 font-bold mb-1">Tehsildar & Sub-Divisional Officer</div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    तहसीलदार / उपजिलाधिकारी
                    <span className="block text-[10px] text-slate-400">Sub-Divisional Magistrate (SDM)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: CITIZEN GRIEVANCES & BOUNDARY RESURVEY */}
        {activeTab === 'grievance' && (
          <section
            id="panel-citizen-grievance"
            role="tabpanel"
            aria-labelledby="tab-citizen-grievance"
            tabIndex={0}
            className="flex flex-col gap-4 focus-visible:outline-hidden"
          >
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">जन शिकायत व सीमा विवाद निवारण (Grievance Portal)</h3>
                <p className="text-xs text-slate-500">
                  Lodge boundary disputes, survey error rectifications, or request drone resurveys with statutory SLA tracking.
                </p>
              </div>

              <button
                id="btn-lodge-grievance"
                onClick={() => {
                  setShowNewGrievanceForm(!showNewGrievanceForm);
                  setSrAnnouncement(showNewGrievanceForm ? 'Closed grievance form' : 'Opened new grievance form');
                }}
                aria-expanded={showNewGrievanceForm}
                aria-controls="citizen-grievance-form"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:outline-hidden"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showNewGrievanceForm ? 'Close Form' : 'नई शिकायत दर्ज करें (Lodge Grievance)'}</span>
              </button>
            </div>

            {/* Lodge Grievance Form */}
            {showNewGrievanceForm && (
              <form
                id="citizen-grievance-form"
                role="form"
                aria-label="Lodge land dispute or resurvey application"
                onSubmit={handleCreateGrievance}
                className="bg-white rounded-xl border border-slate-300 p-5 shadow-md flex flex-col gap-3 animate-fade-in"
              >
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Lodge New Dispute / Resurvey Application
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    The complaint will be automatically routed to the Tehsildar & Survey of India field unit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="form-parcel-select" className="text-[11px] font-bold text-slate-700 block mb-1">
                      संबंधित पार्सल (Land Parcel) <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="form-parcel-select"
                      aria-required="true"
                      value={formParcelId}
                      onChange={(e) => setFormParcelId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {parcels.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.parcelNumber} - {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="form-category-select" className="text-[11px] font-bold text-slate-700 block mb-1">
                      शिकायत श्रेणी (Category) <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="form-category-select"
                      aria-required="true"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as GrievanceItem['category'])}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="boundary_dispute">Boundary Dispute / Encroachment (सीमा/मेढ़ अतिक्रमण)</option>
                      <option value="record_correction">Name / Area Record Correction (अभिलेख सुधार)</option>
                      <option value="resurvey_request">Drone Resurvey Request (ड्रोन पुनः सर्वेक्षण)</option>
                      <option value="inheritance">Inheritance Mutation (वरासत/नामांतरण)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="form-title-input" className="text-[11px] font-bold text-slate-700 block mb-1">
                    विषय / शीर्षक (Title) <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="form-title-input"
                    aria-required="true"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="उदा. दक्षिणी मेढ़ पर पड़ोसी द्वारा 1.2 मीटर अतिक्रमण..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="form-description-textarea" className="text-[11px] font-bold text-slate-700 block mb-1">
                    विस्तृत विवरण (Description) <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="form-description-textarea"
                    aria-required="true"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide details about survey pillars, mutual agreement or ground discrepancies..."
                    rows={3}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewGrievanceForm(false)}
                    aria-label="Cancel lodging grievance"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-hidden"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    aria-label="Submit grievance petition to Tehsildar"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:outline-hidden"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Submit Grievance (दर्ज करें)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Grievances List */}
            <div className="space-y-3" role="list" aria-label="Citizen grievances list">
              {grievances.map((item) => (
                <div
                  key={item.id}
                  role="listitem"
                  aria-labelledby={`grievance-title-${item.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                        {item.id}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 font-mono">{item.parcelNumber}</span>
                      <span className="text-xs text-slate-500 font-medium">({item.ownerName})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'hearing_scheduled'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>SLA: {item.slaDaysRemaining} days</span>
                      </span>
                    </div>
                  </div>

                  <h4 id={`grievance-title-${item.id}`} className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div>
                      Assigned Officer: <strong className="text-slate-800">{item.assignedOfficer}</strong>
                    </div>
                    <div>
                      Lodged On: <span className="font-mono">{item.submittedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: INFRASTRUCTURE COMPENSATION & DBT PAYOUT STATUS */}
        {activeTab === 'compensation' && (
          <section
            id="panel-citizen-compensation"
            role="tabpanel"
            aria-labelledby="tab-citizen-compensation"
            tabIndex={0}
            className="flex flex-col gap-4 focus-visible:outline-hidden"
          >
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">
                भूमि अधिग्रहण व प्रत्यक्ष लाभ अंतरण (Infrastructure Compensation & DBT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent payout verification for National Highway corridors, railway projects, and irrigation canals under RFCTLARR Act 2013.
              </p>
            </div>

            {/* Compensation Details Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs" aria-labelledby="comp-title-nhai">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span id="comp-title-nhai" className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                      NHAI / NH-44 Corridor
                    </span>
                    <span className="text-xs font-bold text-slate-800">Khasra #142/1</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    DBT Credited
                  </span>
                </div>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <dt>Acquired Strip Area:</dt>
                    <dd className="font-bold text-slate-900">0.45 Hectares</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>Base Market Value (सर्कल रेट):</dt>
                    <dd className="font-bold text-slate-900">{formatMoney(45000)}</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>100% Solatium (सहानुभूति राशि):</dt>
                    <dd className="font-bold text-emerald-700">+{formatMoney(45000)}</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>12% Statutory Additional Interest:</dt>
                    <dd className="font-bold text-emerald-700">+{formatMoney(5400)}</dd>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                    <dt>Total Compensation Award:</dt>
                    <dd className="text-emerald-800">{formatMoney(95400)}</dd>
                  </div>
                </dl>

                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs" role="note">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Aadhaar-seeded Bank PFMS Payment Success</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-1 font-mono">
                    UTR: PUNB2024040989218 &bull; Bank of Maharashtra, Branch Haveli
                  </p>
                </div>
              </article>

              <article className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs" aria-labelledby="comp-title-canal">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span id="comp-title-canal" className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                      Narmada Canal Feeder
                    </span>
                    <span className="text-xs font-bold text-slate-800">Khasra #144 (Abadi)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Joint Survey Pending
                  </span>
                </div>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <dt>Proposed Acquisition:</dt>
                    <dd className="font-bold text-slate-900">0.28 Hectares</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>Section 11 Gazette Notification:</dt>
                    <dd className="font-mono text-slate-800">GAZ-MH-2024-089</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>Competent Authority (CALA):</dt>
                    <dd className="font-medium text-slate-800">Sub-Divisional Officer, Haveli</dd>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                    <dt>Estimated Valuation:</dt>
                    <dd className="text-slate-800">{formatMoney(62000)}</dd>
                  </div>
                </dl>

                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs" role="note">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>Joint Measurement Survey (JMS) in Progress</span>
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Surveyors scheduled for drone ground control calibration on 18th April 2024.
                  </p>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
