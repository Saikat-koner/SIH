import React, { useState, useEffect, useRef } from 'react';
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
  MapPin,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { UserRole, NetworkMode, PortalMode } from '../types';
import { USER_PROFILES } from '../data/mockData';
import { getTranslation } from '../lib/i18n';
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
  activeTab,
  onTabChange,
  pendingSyncCount,
  unreadNotifsCount,
  onToggleNotifications,
  onOpenAddParcel,
  currentLang,
  onLanguageChange,
  onPortalModeChange,
  onOpenCommandPalette,
  theme = 'light',
  onToggleTheme,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const profile = USER_PROFILES[currentRole];
  const t = (key: string) => getTranslation(currentLang, key);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onPortalModeChange('home')}
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            title="Return to BhuDrishti Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-emerald-800 transition">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  भू-दृष्टि · BhuDrishti
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden lg:inline-block">
                  Officer GIS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block">
                Cadastral Survey & Revenue Management
              </p>
            </div>
          </div>

          {/* Core Functional Tabs */}
          <nav className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <button
              id="nav-btn-map"
              onClick={() => onTabChange('map')}
              className={`px-2 sm:px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer ${
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
              className={`px-2 sm:px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer ${
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
              className={`px-2 sm:px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer hidden md:flex items-center gap-1 ${
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
              className={`px-2 sm:px-3 py-1.5 font-semibold rounded-md transition whitespace-nowrap cursor-pointer hidden lg:flex items-center gap-1 ${
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

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Switcher to Citizen Portal */}
            <button
              onClick={() => onPortalModeChange('citizen')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer shrink-0"
              title="Switch to Public Citizen Portal"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen Portal</span>
            </button>

            {/* Quick ⌘K Search */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 transition cursor-pointer shrink-0"
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
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                title="Survey New Land Parcel"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Add Parcel</span>
              </button>
            )}

            {/* Role Switcher (Admin v) */}
            <div className="relative shrink-0" ref={roleMenuRef}>
              <button
                type="button"
                id="btn-role-switcher"
                onClick={() => setShowRoleMenu((prev) => !prev)}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
                title={`Active Role: ${currentRole} (${profile.name}) - Click to switch`}
                aria-expanded={showRoleMenu}
                aria-haspopup="true"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="capitalize">{currentRole}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Switch Officer Role (RBAC)
                    </p>
                    <p className="text-[10px] text-slate-400">Select active permission tier</p>
                  </div>
                  {(['admin', 'surveyor', 'auditor', 'viewer'] as UserRole[]).map((r) => {
                    const p = USER_PROFILES[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          onRoleChange(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer ${
                          currentRole === r
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 font-bold text-emerald-900 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          {r === 'admin' && <Shield className="w-4 h-4 text-purple-600" />}
                          {r === 'surveyor' && <MapPin className="w-4 h-4 text-emerald-600" />}
                          {r === 'auditor' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          {r === 'viewer' && <UserCheck className="w-4 h-4 text-blue-600" />}
                          <div>
                            <p className="capitalize font-semibold text-xs text-slate-900 dark:text-white">{r}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.name}</p>
                          </div>
                        </div>
                        {currentRole === r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative shrink-0" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Change Language"
                aria-expanded={showLangMenu}
              >
                <Globe2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in duration-150">
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
                      type="button"
                      onClick={() => {
                        onLanguageChange(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                        currentLang === l.code ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
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
              type="button"
              onClick={onToggleNotifications}
              className="relative p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
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
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
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
