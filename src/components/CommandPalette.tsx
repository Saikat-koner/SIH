import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Shield,
  Users,
  Database,
  Radio,
  FlaskConical,
  HelpCircle,
  FileText,
  Compass,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { LandParcel, PortalMode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: LandParcel[];
  onSelectParcel: (parcel: LandParcel) => void;
  portalMode: PortalMode;
  onTogglePortalMode: () => void;
  onOpenSupabaseSync: () => void;
  onOpenGeofenceModal: () => void;
  onOpenTestModal: () => void;
  onOpenLegal: (tab: 'privacy' | 'terms' | 'contact') => void;
  onOpenFaq: () => void;
  onToggleDataset: () => void;
  activeDataset: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  portalMode,
  onTogglePortalMode,
  onOpenSupabaseSync,
  onOpenGeofenceModal,
  onOpenTestModal,
  onOpenLegal,
  onOpenFaq,
  onToggleDataset,
  activeDataset,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or dispatch
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter parcels
  const q = query.trim().toLowerCase();
  const matchedParcels = q
    ? parcels.filter(
        (p) =>
          p.parcelNumber.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.villageName?.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      ).slice(0, 6)
    : parcels.slice(0, 4);

  // Quick Action items
  interface ActionItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    run: () => void;
  }

  const actions: ActionItem[] = [
    {
      id: 'toggle-portal',
      title: portalMode === 'admin' ? 'Switch to Citizen Land Services Portal' : 'Switch to Admin GIS & Revenue Portal',
      description: portalMode === 'admin' ? 'View Bhulekh records, E-Gharouni cards & grievances' : 'View CAD layers, shapefiles & telemetry',
      icon: portalMode === 'admin' ? <Users className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4 text-purple-500" />,
      category: 'Navigation',
      run: () => {
        onTogglePortalMode();
        onClose();
      },
    },
    {
      id: 'geofence-telemetry',
      title: 'Real-time Cadastral Geofence & GPS Telemetry',
      description: 'Open live surveyor browser boundary monitoring and audit logs',
      icon: <Radio className="w-4 h-4 text-cyan-500" />,
      category: 'Tools',
      run: () => {
        onOpenGeofenceModal();
        onClose();
      },
    },
    {
      id: 'supabase-cloud',
      title: 'Supabase Cloud Synchronization & Schema Audit',
      description: 'PostgreSQL dual-engine cloud persistence and sync status',
      icon: <Database className="w-4 h-4 text-emerald-600" />,
      category: 'Cloud',
      run: () => {
        onOpenSupabaseSync();
        onClose();
      },
    },
    {
      id: 'switch-dataset',
      title: `Switch Dataset (Current: ${activeDataset === 'indian_cadastre' ? 'Indian DILRMP/SVAMITVA' : 'Travis County GIS'})`,
      description: 'Toggle between Indian revenue cadastre and municipal land records',
      icon: <Compass className="w-4 h-4 text-amber-500" />,
      category: 'Data',
      run: () => {
        onToggleDataset();
        onClose();
      },
    },
    {
      id: 'run-unit-tests',
      title: 'Run Automated GIS & Cadastral Unit Test Suite',
      description: 'Verify polygon topological closures, RBAC permissions, and math integrity',
      icon: <FlaskConical className="w-4 h-4 text-blue-500" />,
      category: 'Verification',
      run: () => {
        onOpenTestModal();
        onClose();
      },
    },
    {
      id: 'open-faq',
      title: 'Frequently Asked Questions & Jury Documentation',
      description: 'SVAMITVA guidelines, dispute resolution rules, and architecture FAQs',
      icon: <HelpCircle className="w-4 h-4 text-indigo-500" />,
      category: 'Help',
      run: () => {
        onOpenFaq();
        onClose();
      },
    },
    {
      id: 'privacy-policy',
      title: 'Digital Data Protection (DPDP Act) & Privacy Policy',
      description: 'Review sovereign landowner data residency and encryption protocols',
      icon: <FileText className="w-4 h-4 text-slate-500" />,
      category: 'Legal',
      run: () => {
        onOpenLegal('privacy');
        onClose();
      },
    },
  ];

  const matchedActions = q
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      )
    : actions;

  const totalItems = matchedParcels.length + matchedActions.length;

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < matchedParcels.length) {
        const p = matchedParcels[selectedIndex];
        if (p) {
          onSelectParcel(p);
          onClose();
        }
      } else {
        const actionIdx = selectedIndex - matchedParcels.length;
        const act = matchedActions[actionIdx];
        if (act) act.run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownModal}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search parcels (e.g. 142/A, Ramesh), jump to actions or type commands..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-hidden"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
              <Command className="w-3 h-3" /> K
            </kbd>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Matched Land Parcels */}
          {matchedParcels.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Land Parcels & Cadastre ({matchedParcels.length})
              </div>
              <div className="space-y-1">
                {matchedParcels.map((parcel, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={parcel.id}
                      onClick={() => {
                        onSelectParcel(parcel);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition group ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              Parcel #{parcel.parcelNumber}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium shrink-0">
                              {parcel.villageName || 'Sector'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Owner: <span className="font-semibold text-slate-700 dark:text-slate-300">{parcel.ownerName}</span> • {parcel.areaHectares} ha ({parcel.bigha || ((parcel.areaHectares || 1) * 3.95).toFixed(1)} Bigha)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            parcel.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : parcel.status === 'disputed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {parcel.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions & Navigation */}
          {matchedActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                System Actions & Navigation ({matchedActions.length})
              </div>
              <div className="space-y-1">
                {matchedActions.map((action, idx) => {
                  const globalIdx = matchedParcels.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <button
                      key={action.id}
                      onClick={action.run}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition group ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {action.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {action.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {action.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 shrink-0 ml-2">
                        {action.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for a Khasra number, landowner name, or select an action above.
              </p>
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TerraGIS Enterprise Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
