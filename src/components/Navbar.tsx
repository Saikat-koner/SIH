import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Wifi,
  WifiOff,
  Radio,
  Bell,
  Shield,
  UserCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  RefreshCw,
  Users,
  Globe2,
  ChevronDown,
  Sparkles,
  Activity,
  TrendingUp,
  Database,
  Search,
  Sun,
  Moon,
  Landmark,
} from 'lucide-react';
import { UserRole, NetworkMode, UserProfile, NotificationItem, OfflineSyncItem, PortalMode } from '../types';
import { USER_PROFILES } from '../data/mockData';
import { SUPPORTED_LANGUAGES, getTranslation } from '../lib/i18n';
import { CurrencySelector } from './CurrencySelector';
import { BackendStatus } from '../lib/supabaseSync';
import { useGeofence } from '../context/GeofenceContext';

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
  onOpenTestModal,
  onTriggerSync,
  isSyncing,
  currentLang,
  onLanguageChange,
  portalMode,
  onPortalModeChange,
  activeDataset,
  onDatasetChange,
  onOpenSupabaseSync,
  supabaseStatus,
  onOpenCommandPalette,
  onOpenAnalytics,
  theme = 'light',
  onToggleTheme,
  lastAutosavedText,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);
  const profile = USER_PROFILES[currentRole];

  const {
    assignedParcel,
    boundaryStatus,
    distanceToBoundary,
    isGeofenceActive,
    setIsMonitorModalOpen,
  } = useGeofence();

  const t = (key: string) => getTranslation(currentLang, key);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'surveyor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'auditor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getNetworkBadge = () => {
    switch (networkMode) {
      case 'online':
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
          label: t('online'),
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'low_bandwidth':
        return {
          icon: <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
          label: t('lowBandwidth'),
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-600" />,
          label: t('offline'),
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
        };
    }
  };

  const netInfo = getNetworkBadge();

  const filteredLangs = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onPortalModeChange('home')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
            title="Go to Sovereign Front Page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black text-base lg:text-lg tracking-tight text-slate-900 whitespace-nowrap group-hover:text-emerald-700 transition-colors">
                  {t('appName')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hidden lg:inline-block whitespace-nowrap">
                  SIH1648 / DILRMP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden 2xl:block truncate max-w-[240px] whitespace-nowrap">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg border border-slate-200 shrink-0">
            <button
              id="nav-btn-home"
              onClick={() => onPortalModeChange('home')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200/50"
              title="Return to Sovereign Cadastre Front Page"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Home</span>
            </button>
            <button
              id="nav-btn-map"
              onClick={() => onTabChange('map')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {t('mapView')}
            </button>
            <button
              id="nav-btn-table"
              onClick={() => onTabChange('table')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {t('parcelsRegistry')}
            </button>
            <button
              id="nav-btn-lifecycle"
              onClick={() => onTabChange('lifecycle')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'lifecycle'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Projects & Payouts</span>
            </button>
            <button
              id="nav-btn-sync"
              onClick={() => onTabChange('sync')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {t('offlineSync')}
              {pendingSyncCount > 0 && (
                <span className="w-4 h-4 text-[10px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </button>
            <button
              id="nav-btn-tests"
              onClick={() => onTabChange('tests')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('unitTests')}</span>
            </button>
          </nav>

          {/* Controls: Search ⌘K, Telemetry, Portal Switcher, Geofence, Cloud Sync, Theme, Language, Roles */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick ⌘K Search Command Palette Button */}
            {onOpenCommandPalette && (
              <button
                id="btn-nav-command-palette"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition active:scale-95 shrink-0"
                title="Search Parcels & Actions (⌘K / Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-2xs">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Real-time Telemetry & Analytics Button */}
            {onOpenAnalytics && (
              <button
                id="btn-nav-analytics"
                onClick={onOpenAnalytics}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition active:scale-95 shrink-0"
                title="Real-time NSDI Spatial Telemetry & Live GIS Analytics"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Telemetry</span>
              </button>
            )}

            {/* Autosave Indicator */}
            {lastAutosavedText && (
              <div
                className="hidden 2xl:flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono shrink-0 px-1"
                title="LocalDB & Cloud Sync Autosave state"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lastAutosavedText}</span>
              </div>
            )}

            {/* Jury Portal Mode Switcher (Admin vs Citizen) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 shadow-2xs">
              <button
                id="btn-nav-switch-admin"
                onClick={() => onPortalModeChange('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  portalMode === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Admin GIS & Revenue Officer Portal"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline">Admin Portal</span>
                <span className="xl:hidden">Admin</span>
              </button>
              <button
                id="btn-nav-switch-citizen"
                onClick={() => onPortalModeChange('citizen')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  portalMode === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Citizen & Landowner Services Portal"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Citizen Portal</span>
                <span className="xl:hidden">Citizen</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950 ml-0.5">
                  Jury
                </span>
              </button>
            </div>

            {/* Real-time Geofence Telemetry Button */}
            <button
              id="btn-geofence-hud"
              onClick={() => setIsMonitorModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition active:scale-95 shrink-0 ${
                !isGeofenceActive
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : boundaryStatus === 'inside'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
              title={`Geofence Telemetry: ${
                !isGeofenceActive
                  ? 'Inactive'
                  : boundaryStatus === 'inside'
                  ? `INSIDE ${assignedParcel?.parcelNumber || 'Parcel'}`
                  : `OUTSIDE (${distanceToBoundary}m)`
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isGeofenceActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="hidden lg:inline">Geofence</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  !isGeofenceActive
                    ? 'bg-slate-300'
                    : boundaryStatus === 'inside'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
            </button>

            {/* Supabase Cloud Sync Button */}
            {onOpenSupabaseSync && (
              <button
                id="btn-supabase-sync"
                onClick={onOpenSupabaseSync}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition active:scale-95 shrink-0 ${
                  supabaseStatus?.supabaseConnected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : supabaseStatus?.configured
                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={
                  supabaseStatus?.supabaseConnected
                    ? `Supabase Connected (${supabaseStatus.supabaseHost}) - Click to sync or view schema`
                    : 'Supabase Cloud Sync - Click to manage database sync'
                }
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Supabase</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseStatus?.supabaseConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : supabaseStatus?.configured
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                />
              </button>
            )}

            {/* Dataset Selector */}
            <div className="relative">
              <button
                id="btn-dataset-toggle"
                onClick={() => setShowDatasetMenu(!showDatasetMenu)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition"
                title="Switch Cadastral Dataset"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[130px]">
                  {activeDataset === 'indian_cadastre' ? 'DILRMP Haveli (MH)' : 'Travis Co (USA)'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDatasetMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Select Cadastral Territory
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onDatasetChange('indian_cadastre');
                      setShowDatasetMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start justify-between ${
                      activeDataset === 'indian_cadastre' ? 'bg-emerald-50 font-bold text-emerald-900' : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        Indian Cadastre (DILRMP / SVAMITVA)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Khasra 142/1, 142/2 Medh boundary dispute, Gaon Sabha & CORS GNSS
                      </p>
                    </div>
                    {activeDataset === 'indian_cadastre' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onDatasetChange('travis_county');
                      setShowDatasetMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start justify-between ${
                      activeDataset === 'travis_county' ? 'bg-emerald-50 font-bold text-emerald-900' : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Travis County Cadastre (US)</p>
                      <p className="text-[10px] text-slate-500">
                        Standard Western deeds, solar arrays, aquifer wetlands
                      </p>
                    </div>
                    {activeDataset === 'travis_county' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Real-time Multi-Currency & Indian Rupee (INR) Switcher */}
            <CurrencySelector variant="navbar" />

            {/* 100+ Languages Vernacular Switcher */}
            <div className="relative">
              <button
                id="btn-language-switcher"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                title="100+ Languages Multilingual Engine"
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[65px] sm:max-w-[100px]">
                  {currentLangObj?.nativeName || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="p-1 border-b border-slate-100 sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search 100+ languages..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="py-2">
                    <p className="px-2 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      भारतीय भाषाएं (Indian Vernaculars)
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {filteredLangs
                        .filter((l) => l.region === 'india')
                        .map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onLanguageChange(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition ${
                              currentLang === lang.code
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{lang.nativeName}</span>
                            <span className="text-[10px] opacity-70 uppercase">{lang.code}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="py-2 border-t border-slate-100">
                    <p className="px-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Global Languages (100+)
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {filteredLangs
                        .filter((l) => l.region === 'global')
                        .slice(0, 30)
                        .map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onLanguageChange(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition ${
                              currentLang === lang.code
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{lang.nativeName}</span>
                            <span className="text-[10px] opacity-70 uppercase">{lang.code}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Network Mode Simulator Switcher */}
            <div className="relative">
              <button
                id="btn-network-status"
                onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${netInfo.classes}`}
                title="Toggle simulated network connectivity"
              >
                {netInfo.icon}
                <span className="hidden xl:inline">{netInfo.label}</span>
              </button>

              {showNetworkMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Simulate Connectivity
                    </p>
                    <p className="text-xs text-slate-400">Test offline & low-bandwidth syncing</p>
                  </div>
                  <button
                    onClick={() => {
                      onNetworkModeChange('online');
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-medium text-slate-800">Online (Fast Fiber/4G)</p>
                        <p className="text-[11px] text-slate-500">Immediate cloud sync</p>
                      </div>
                    </div>
                    {networkMode === 'online' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onNetworkModeChange('low_bandwidth');
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-800">Low-Bandwidth (Field 2G)</p>
                        <p className="text-[11px] text-slate-500">Batched payload transmission</p>
                      </div>
                    </div>
                    {networkMode === 'low_bandwidth' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onNetworkModeChange('offline');
                      setShowNetworkMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="font-medium text-slate-800">Offline / Field Remote</p>
                        <p className="text-[11px] text-slate-500">Mutations queued locally</p>
                      </div>
                    </div>
                    {networkMode === 'offline' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${getRoleBadgeColor(
                  currentRole
                )}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">{currentRole}</span>
                <span className="hidden xl:inline text-slate-600 font-normal">({profile.name.split(',')[0]})</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Role-Based Access (RBAC)
                    </p>
                    <p className="text-xs text-slate-400">Switch user tier to test permissions</p>
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
                        className={`w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition ${
                          currentRole === r ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {r === 'admin' && <Shield className="w-4 h-4 text-purple-600" />}
                          {r === 'surveyor' && <MapPin className="w-4 h-4 text-emerald-600" />}
                          {r === 'auditor' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          {r === 'viewer' && <UserCheck className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold capitalize text-slate-800">{r}</span>
                            {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] font-medium text-slate-700">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.roleTitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onToggleNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="View Project Updates & Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Dark / Light Tactical Theme Toggle */}
            {onToggleTheme && (
              <button
                id="btn-nav-theme-toggle"
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                title={theme === 'dark' ? 'Switch to Standard Light Mode' : 'Switch to Tactical Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
            )}

            {/* Quick Sync Button */}
            {pendingSyncCount > 0 && (
              <button
                id="btn-quick-sync"
                onClick={onTriggerSync}
                disabled={isSyncing || networkMode === 'offline'}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition disabled:opacity-50"
                title={networkMode === 'offline' ? 'Connect to sync' : 'Sync pending changes now'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            )}

            {/* Add Parcel (RBAC: Admin or Surveyor only) */}
            {(currentRole === 'admin' || currentRole === 'surveyor') && (
              <button
                id="btn-add-parcel-nav"
                onClick={onOpenAddParcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-98 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('addParcel')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 items-center justify-around text-xs">
          <button
            onClick={() => onTabChange('map')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {t('mapView')}
          </button>
          <button
            onClick={() => onTabChange('table')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {t('parcelsRegistry')}
          </button>
          <button
            onClick={() => onTabChange('lifecycle')}
            className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
              activeTab === 'lifecycle' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Tracking</span>
          </button>
          <button
            onClick={() => onTabChange('sync')}
            className={`px-3 py-1 rounded font-medium flex items-center gap-1 ${
              activeTab === 'sync' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {t('offlineSync')}
            {pendingSyncCount > 0 && (
              <span className="w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {pendingSyncCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('tests')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'tests' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {t('unitTests')}
          </button>
          <button
            onClick={() => onPortalModeChange(portalMode === 'admin' ? 'citizen' : 'admin')}
            className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 ${
              portalMode === 'citizen' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {portalMode === 'admin' ? '🧑‍🌾 Citizen' : '🏛️ Admin'}
          </button>
        </div>
      </div>
    </header>
  );
};

