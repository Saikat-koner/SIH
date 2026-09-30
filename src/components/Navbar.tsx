import React, { useState } from 'react';
import {
  Layers,
  Bell,
  Shield,
  Plus,
  Users,
  Globe2,
  ChevronDown,
  Activity,
  Search,
  Sun,
  Moon,
  Landmark,
  CheckCircle2,
  Wifi,
  Radio,
  WifiOff,
  UserCheck,
  AlertTriangle,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { UserRole, NetworkMode, PortalMode } from '../types';
import { USER_PROFILES } from '../data/mockData';
import { SUPPORTED_LANGUAGES, getTranslation } from '../lib/i18n';
import { BackendStatus } from '../lib/supabaseSync';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  activeTab: 'map' | 'table' | 'lifecycle' | 'sync' | 'tests';
  onTabChange: (tab: 'map' | 'table' | 'lifecycle' | 'sync' | 'tests') => void;
  pendingSyncCount: number;
  unreadNotifsCount: number;
  onToggleNotifications: () => void;
  onOpenAddParcel: () => void;
  onOpenTestModal: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  currentLang: string;
  onLanguageChange: (langCode: string) => void;
  portalMode: PortalMode;
  onPortalModeChange: (mode: PortalMode) => void;
  activeDataset: 'indian_cadastre' | 'travis_county';
  onDatasetChange: (dataset: 'indian_cadastre' | 'travis_county') => void;
  onOpenSupabaseSync?: () => void;
  supabaseStatus?: BackendStatus | null;
  onOpenCommandPalette?: () => void;
  onOpenAnalytics?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  lastAutosavedText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  networkMode,
  onNetworkModeChange,
  activeTab,
  onTabChange,
  pendingSyncCount,
  unreadNotifsCount,
  onToggleNotifications,
  onOpenAddParcel,
  onTriggerSync,
  isSyncing,
  currentLang,
  onLanguageChange,
  portalMode,
  onPortalModeChange,
  onOpenCommandPalette,
  theme = 'light',
  onToggleTheme,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const profile = USER_PROFILES[currentRole];
  const t = (key: string) => getTranslation(currentLang, key);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onPortalModeChange('home')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
            title="Return to Home"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-emerald-800 transition">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base lg:text-lg tracking-tight text-slate-900 dark:text-white">
                  भू-सेवा · Admin GIS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                  Officer Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Tehsil Haveli & Survey of India CORS Network
              </p>
            </div>
          </div>

          {/* Core Functional Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 text-xs">
            <button
              id="nav-btn-map"
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('mapView')}
            </button>
            <button
              id="nav-btn-table"
              onClick={() => onTabChange('table')}
              className={`px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('parcelsRegistry')}
            </button>
            <button
              id="nav-btn-lifecycle"
              onClick={() => onTabChange('lifecycle')}
              className={`px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer hidden sm:flex items-center gap-1 ${
                activeTab === 'lifecycle'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Projects & Payouts</span>
            </button>
            <button
              id="nav-btn-sync"
              onClick={() => onTabChange('sync')}
              className={`px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer hidden md:flex items-center gap-1 ${
                activeTab === 'sync'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Sync</span>
              {pendingSyncCount > 0 && (
                <span className="w-4 h-4 text-[10px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Tools: Return to Citizen, Add Parcel, Role, Theme, Language */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Switcher to Citizen Portal */}
            <button
              onClick={() => onPortalModeChange('citizen')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
              title="Switch to Public Citizen Portal"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen Portal</span>
            </button>

            {/* Quick ⌘K Search */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 transition cursor-pointer"
                title="Search records (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Search</span>
              </button>
            )}

            {/* Add Parcel (Only for Admin / Surveyor) */}
            {(currentRole === 'admin' || currentRole === 'surveyor') && (
              <button
                onClick={onOpenAddParcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                title="Survey New Land Parcel"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Parcel</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer"
                title="Current Officer Role"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize">{currentRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Officer Hierarchy (RBAC)
                    </p>
                  </div>
                  {(['admin', 'surveyor', 'auditor', 'viewer'] as UserRole[]).map((r) => {
                    const p = USER_PROFILES[r];
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          onRoleChange(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                          currentRole === r ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <p className="capitalize font-semibold">{r}</p>
                          <p className="text-[10px] text-slate-400">{p.name.split(',')[0]}</p>
                        </div>
                        {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Change Language"
              >
                <Globe2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'mr', label: 'मराठी' },
                    { code: 'bn', label: 'বাংলা' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'ta', label: 'தமிழ்' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                        currentLang === l.code ? 'font-bold text-emerald-600' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={onToggleNotifications}
              className="relative p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
