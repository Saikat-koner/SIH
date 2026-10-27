import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { GISMap } from './components/GISMap';
import { ParcelTable } from './components/ParcelTable';
import { OfflineSyncPanel } from './components/OfflineSyncPanel';
import { AutomatedTestModal } from './components/AutomatedTestModal';
import { ParcelDetailModal } from './components/ParcelDetailModal';
import { AddParcelModal } from './components/AddParcelModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CitizenPortal } from './components/CitizenPortal';
import { LifecycleMonitoringDashboard } from './components/LifecycleMonitoringDashboard';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { GeofenceProvider } from './context/GeofenceContext';
import { GeofenceMonitorModal } from './components/GeofenceMonitorModal';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { CookieBanner } from './components/CookieBanner';
import { LegalModal } from './components/LegalModal';
import { SupportFloat } from './components/SupportFloat';
import { ScrollTopAndProgress } from './components/ScrollTopAndProgress';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import {
  getBackendStatus,
  fetchParcelsFromBackend,
  saveParcelToBackend,
  updateParcelOnBackend,
  deleteParcelFromBackend,
  syncParcelsWithBackend,
  BackendStatus,
} from './lib/supabaseSync';
import { Users, Sparkles, MapPin, Globe2, ShieldCheck, ArrowRight, Activity, Database, Landmark, LogIn, LogOut, User } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { FileCode, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import {
  LandParcel,
  FieldMarker,
  UserRole,
  NetworkMode,
  NotificationItem,
  OfflineSyncItem,
  PortalMode,
  AuthUser,
} from './types';
import {
  INITIAL_PARCELS,
  INITIAL_MARKERS,
  INDIAN_VILLAGE_PARCELS,
  INDIAN_VILLAGE_MARKERS,
  INITIAL_NOTIFICATIONS,
  USER_PROFILES,
} from './data/mockData';
import { checkUserPermission } from './lib/unitTests';
import { getTranslation, SUPPORTED_LANGUAGES } from './lib/i18n';
import { CurrencyProvider } from './context/CurrencyContext';

export default function App() {
  // Multilingual State (100+ languages supported)
  const [currentLang, setCurrentLang] = useState<string>(() => {
    try {
      return localStorage.getItem('terragis_lang_v1') || 'en';
    } catch {
      return 'en';
    }
  });

  // Sovereign Cadastre Portal Mode ('home' | 'admin' | 'citizen')
  // Defaults to 'home' (the landing front page before login)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    try {
      const saved = localStorage.getItem('terragis_portal_mode_v2');
      if (saved === 'home' || saved === 'admin' || saved === 'citizen') return saved as PortalMode;
    } catch {}
    return 'home';
  });

  const handlePortalModeChange = (mode: PortalMode) => {
    setPortalMode(mode);
    try {
      localStorage.setItem('terragis_portal_mode_v2', mode);
    } catch {}
  };

  // User Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('terragis_auth_user_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<'citizen' | 'admin'>('citizen');
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (role: 'citizen' | 'admin', tab: 'login' | 'register') => {
    setAuthModalRole(role);
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('terragis_auth_user_v1', JSON.stringify(user));
    } catch {}
    if (user.role === 'citizen') {
      handlePortalModeChange('citizen');
    } else {
      handlePortalModeChange('admin');
      if (user.role === 'admin' || user.role === 'surveyor' || user.role === 'auditor') {
        setCurrentRole(user.role);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('terragis_auth_user_v1');
    } catch {}
    handlePortalModeChange('home');
  };

  // Cadastral Dataset (Defaults to Indian Cadastre DILRMP / SVAMITVA)
  const [activeDataset, setActiveDataset] = useState<'indian_cadastre' | 'travis_county'>(() => {
    try {
      const saved = localStorage.getItem('terragis_active_dataset_v1');
      if (saved === 'travis_county' || saved === 'indian_cadastre') return saved;
    } catch {}
    return 'indian_cadastre';
  });

  // Application State with LocalStorage resilience
  const [parcels, setParcels] = useState<LandParcel[]>(() => {
    try {
      const saved = localStorage.getItem('terragis_parcels_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INDIAN_VILLAGE_PARCELS;
  });

  const [markers, setMarkers] = useState<FieldMarker[]>(() => {
    try {
      const saved = localStorage.getItem('terragis_markers_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INDIAN_VILLAGE_MARKERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('terragis_notifs_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>(() => {
    try {
      const saved = localStorage.getItem('terragis_offline_queue_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sync_001',
        action: 'field_survey',
        entityType: 'marker',
        entityId: 'mkr_in_002',
        summary: 'Seemantak Buruj (Boundary Tri-Junction #TJ-12) Displacement Logged',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        payload: { elevation: 554.7, shift: '1.4m south', surveyor: 'RI Suresh Deshmukh' },
        status: 'pending',
        retryCount: 0,
      },
    ];
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('online');
  const [activeTab, setActiveTab] = useState<'map' | 'table' | 'lifecycle' | 'sync' | 'tests'>('map');

  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [isAddParcelOpen, setIsAddParcelOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<BackendStatus | null>(null);

  // Toast Notifications System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };
  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Command Palette & Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'contact'>('privacy');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'contact') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Theme Management (Light vs Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('terragis_theme_v1');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('terragis_theme_v1', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast({
        type: 'info',
        title: next === 'dark' ? 'Tactical Dark Mode Enabled' : 'Standard Light Mode Enabled',
        message: 'Spatial contrast updated.',
        duration: 3000,
      });
      return next;
    });
  };

  // Autosave status indicator
  const [lastAutosavedText, setLastAutosavedText] = useState<string>('Autosaved just now');
  useEffect(() => {
    setLastAutosavedText('Autosaved just now');
    const timer = setTimeout(() => {
      setLastAutosavedText('Autosaved 10s ago');
    }, 10000);
    return () => clearTimeout(timer);
  }, [parcels, markers]);

  // Global Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize and check Supabase & Backend connectivity on startup
  useEffect(() => {
    getBackendStatus()
      .then((status) => {
        setSupabaseStatus(status);
        if (status.supabaseConnected && status.remoteRowCount && status.remoteRowCount > 0) {
          fetchParcelsFromBackend()
            .then((res) => {
              if (res.parcels && res.parcels.length > 0) {
                setParcels(res.parcels);
              }
            })
            .catch((err) => console.warn('Could not hydrate parcels from Supabase:', err));
        }
      })
      .catch((err) => console.warn('Backend status check skipped:', err));
  }, []);

  // Sync dataset switch
  const handleDatasetChange = (dataset: 'indian_cadastre' | 'travis_county') => {
    setActiveDataset(dataset);
    localStorage.setItem('terragis_active_dataset_v1', dataset);
    if (dataset === 'indian_cadastre') {
      setParcels(INDIAN_VILLAGE_PARCELS);
      setMarkers(INDIAN_VILLAGE_MARKERS);
      setSelectedParcel(null);
    } else {
      setParcels(INITIAL_PARCELS);
      setMarkers(INITIAL_MARKERS);
      setSelectedParcel(null);
    }
  };

  const handleLanguageChange = (code: string) => {
    setCurrentLang(code);
    try {
      localStorage.setItem('terragis_lang_v1', code);
    } catch {}
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('terragis_parcels_v2', JSON.stringify(parcels));
    } catch {}
  }, [parcels]);

  useEffect(() => {
    try {
      localStorage.setItem('terragis_markers_v2', JSON.stringify(markers));
    } catch {}
  }, [markers]);

  useEffect(() => {
    try {
      localStorage.setItem('terragis_notifs_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('terragis_offline_queue_v1', JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingSyncCount = offlineQueue.filter((q) => q.status === 'pending').length;

  const t = (key: any) => getTranslation(currentLang, key);


  // Add a new parcel
  const handleAddParcel = (newParcelData: any) => {
    const isOffline = networkMode === 'offline';
    const newId = `pcl_${Date.now().toString().slice(-4)}`;

    const newParcel: LandParcel = {
      ...newParcelData,
      id: newId,
      attachmentsCount: 1,
      complianceScore: 92,
      syncStatus: isOffline ? 'pending_sync' : 'synced',
      updatedAt: new Date().toISOString(),
    };

    setParcels((prev) => [newParcel, ...prev]);

    // Enqueue if offline
    if (isOffline) {
      const syncItem: OfflineSyncItem = {
        id: `sync_${Date.now()}`,
        action: 'create_parcel',
        entityType: 'parcel',
        entityId: newId,
        summary: `Created Parcel: ${newParcel.title} (${newParcel.parcelNumber})`,
        timestamp: new Date().toISOString(),
        payload: newParcel,
        status: 'pending',
        retryCount: 0,
      };
      setOfflineQueue((prev) => [syncItem, ...prev]);
    }

    // Save to Express backend & Supabase
    saveParcelToBackend(newParcel).catch((err) => console.warn('Could not persist parcel to backend:', err));

    // Add Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: isOffline ? 'Parcel Created (Offline Queued)' : 'New Land Parcel Registered',
      message: `${newParcel.title} registered by ${newParcelData.surveyor}. Status: ${newParcel.status.replace(
        '_',
        ' '
      )}.`,
      timestamp: 'Just now',
      read: false,
      type: isOffline ? 'warning' : 'success',
      parcelId: newId,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Show Toast with Undo
    addToast({
      type: isOffline ? 'warning' : 'success',
      title: isOffline ? 'Parcel Saved to Offline Cache' : 'Land Parcel Registered',
      message: `${newParcel.parcelNumber} (${newParcel.owner}) added to cadastre.`,
      onUndo: () => {
        setParcels((prev) => prev.filter((p) => p.id !== newId));
        deleteParcelFromBackend(newId).catch(() => {});
        addToast({
          type: 'info',
          title: 'Action Undone',
          message: `Parcel ${newParcel.parcelNumber} was removed.`,
        });
      },
      undoLabel: 'Undo',
    });
  };

  // Update parcel status (e.g. approve or flag dispute)
  const handleUpdateParcelStatus = (parcelId: string, newStatus: LandParcel['status'], disputeNotes?: string) => {
    const isOffline = networkMode === 'offline';

    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === parcelId) {
          return {
            ...p,
            status: newStatus,
            disputeNotes: disputeNotes || p.disputeNotes,
            syncStatus: isOffline ? 'pending_sync' : 'synced',
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    if (selectedParcel && selectedParcel.id === parcelId) {
      setSelectedParcel((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              disputeNotes: disputeNotes || prev.disputeNotes,
              syncStatus: isOffline ? 'pending_sync' : 'synced',
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    // Queue mutation if offline
    if (isOffline) {
      const syncItem: OfflineSyncItem = {
        id: `sync_${Date.now()}`,
        action: newStatus === 'disputed' ? 'resolve_dispute' : 'update_parcel',
        entityType: 'parcel',
        entityId: parcelId,
        summary: `Status updated to ${newStatus.toUpperCase()} on parcel ${parcelId}`,
        timestamp: new Date().toISOString(),
        payload: { status: newStatus, disputeNotes },
        status: 'pending',
        retryCount: 0,
      };
      setOfflineQueue((prev) => [syncItem, ...prev]);
    }

    // Update on Express backend & Supabase
    updateParcelOnBackend(parcelId, { status: newStatus, disputeNotes }).catch((err) =>
      console.warn('Could not update parcel on backend:', err)
    );

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: newStatus === 'disputed' ? 'Boundary Dispute Lodged' : 'Cadastre Status Updated',
      message: `Parcel ${parcelId} transitioned to ${newStatus.replace('_', ' ')}. ${
        disputeNotes ? `Notes: ${disputeNotes}` : ''
      }`,
      timestamp: 'Just now',
      read: false,
      type: newStatus === 'disputed' ? 'critical' : 'success',
      parcelId,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Toast feedback
    addToast({
      type: newStatus === 'disputed' ? 'error' : 'success',
      title: newStatus === 'disputed' ? 'Dispute Lodged' : 'Status Updated',
      message: `Parcel ${parcelId} marked as ${newStatus.toUpperCase()}.`,
    });
  };

  // Delete parcel
  const handleDeleteParcel = (parcelId: string) => {
    const deletedParcel = parcels.find((p) => p.id === parcelId);
    setParcels((prev) => prev.filter((p) => p.id !== parcelId));
    if (selectedParcel?.id === parcelId) setSelectedParcel(null);

    // Delete from Express backend & Supabase
    deleteParcelFromBackend(parcelId).catch((err) =>
      console.warn('Could not delete parcel from backend:', err)
    );

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Land Parcel Deprecated / Deleted',
      message: `Cadastre record ${parcelId} archived from state cadastral inventory.`,
      timestamp: 'Just now',
      read: false,
      type: 'warning',
    };
    setNotifications((prev) => [notif, ...prev]);

    if (deletedParcel) {
      addToast({
        type: 'warning',
        title: 'Parcel Removed',
        message: `${deletedParcel.parcelNumber} (${deletedParcel.owner}) removed.`,
        onUndo: () => {
          setParcels((prev) => [deletedParcel, ...prev]);
          saveParcelToBackend(deletedParcel).catch(() => {});
          addToast({
            type: 'success',
            title: 'Parcel Restored',
            message: `${deletedParcel.parcelNumber} restored to inventory.`,
          });
        },
        undoLabel: 'Undo',
      });
    }
  };

  // Add observation to a parcel
  const handleAddObservation = (parcelId: string, noteText: string) => {
    const isOffline = networkMode === 'offline';

    setParcels((prev) =>
      prev.map((p) => {
        if (p.id === parcelId) {
          return {
            ...p,
            notes: `${p.notes} | [${new Date().toLocaleDateString()}] ${noteText}`,
            attachmentsCount: p.attachmentsCount + 1,
            syncStatus: isOffline ? 'pending_sync' : 'synced',
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    if (selectedParcel?.id === parcelId) {
      setSelectedParcel((prev) =>
        prev
          ? {
              ...prev,
              notes: `${prev.notes} | [${new Date().toLocaleDateString()}] ${noteText}`,
              attachmentsCount: prev.attachmentsCount + 1,
            }
          : null
      );
    }

    if (isOffline) {
      const syncItem: OfflineSyncItem = {
        id: `sync_${Date.now()}`,
        action: 'field_survey',
        entityType: 'survey',
        entityId: parcelId,
        summary: `Appended field inspection note to ${parcelId}`,
        timestamp: new Date().toISOString(),
        payload: { note: noteText },
        status: 'pending',
        retryCount: 0,
      };
      setOfflineQueue((prev) => [syncItem, ...prev]);
    }
  };

  // Trigger Cloud Sync Reconciliation
  const handleTriggerSync = async () => {
    if (networkMode === 'offline') return;
    setIsSyncing(true);

    try {
      const syncResult = await syncParcelsWithBackend(parcels);
      if (syncResult.parcels && syncResult.parcels.length > 0) {
        setParcels(syncResult.parcels);
      }
      const updatedStatus = await getBackendStatus();
      setSupabaseStatus(updatedStatus);
    } catch (err) {
      console.warn('Backend sync failed, falling back to local reconciliation:', err);
    }

    setOfflineQueue((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'synced',
      }))
    );

    setParcels((prev) =>
      prev.map((p) => ({
        ...p,
        syncStatus: 'synced',
      }))
    );

    setIsSyncing(false);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Cadastre Cloud Sync Completed',
      message: 'All pending field mutations successfully synchronized with PostgreSQL database.',
      timestamp: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Simulate field mutation
  const handleAddSimulatedOfflineMutation = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const syncItem: OfflineSyncItem = {
      id: `sync_${Date.now()}`,
      action: 'add_marker',
      entityType: 'marker',
      entityId: `mkr_${randomNum}`,
      summary: `Ground Boundary Peg #BP-${randomNum} Set (RTK GNSS)`,
      timestamp: new Date().toISOString(),
      payload: { coordinates: [30.365, -97.85], elevation: 279.4 },
      status: 'pending',
      retryCount: 0,
    };
    setOfflineQueue((prev) => [syncItem, ...prev]);
  };

  // Simulate real-time notification
  const handleSimulateNewNotification = () => {
    const events = [
      {
        title: 'RTK Base Station Satellite Lock',
        message: 'Mobile Geodetic Base Station acquired 18 Galileo/GPS satellites with 8mm precision.',
        type: 'info' as const,
      },
      {
        title: 'Aerial Orthophoto Map Processed',
        message: 'Highland Ridge corridor photogrammetric orthomosaic uploaded to tile server.',
        type: 'success' as const,
        parcelId: 'pcl_001',
      },
      {
        title: 'Cadastre Boundary Peg Displaced',
        message: 'Field surveyor reported monument shift near Barton Creek highway easement.',
        type: 'warning' as const,
        parcelId: 'pcl_004',
      },
      {
        title: 'Groundwater Sensor Calibration',
        message: 'Borehole #BH-04 automated telemetry reported 0.2m water level seasonal adjustment.',
        type: 'info' as const,
        parcelId: 'pcl_003',
      },
    ];

    const pick = events[Math.floor(Math.random() * events.length)];
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: pick.title,
      message: pick.message,
      timestamp: 'Just now',
      read: false,
      type: pick.type,
      parcelId: pick.parcelId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleAddNotification = (notif: NotificationItem) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleLocateOnMap = (parcel: LandParcel) => {
    setActiveTab('map');
    setSelectedParcel(parcel);
  };

  return (
    <CurrencyProvider>
      <GeofenceProvider parcels={parcels} onAddNotification={handleAddNotification}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-150">
          {/* Sticky Offline Field Mode Banner */}
          {networkMode === 'offline' && (
            <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-40 border-b border-amber-700 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>
                  Field Offline Mode Active — Cadastral changes are buffered in local IndexedDB cache ({pendingSyncCount} pending).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNetworkMode('online');
                    addToast({
                      type: 'info',
                      title: 'Online Mode Restored',
                      message: 'Network connectivity re-established.',
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-white text-amber-900 font-bold text-[11px] hover:bg-amber-50 transition active:scale-95 shadow-xs"
                >
                  Restore Online Mode
                </button>
              </div>
            </div>
          )}

          {/* Global Navigation Bar for Admin GIS with Smooth Motion Entrance */}
          <AnimatePresence>
            {portalMode === 'admin' && (
              <motion.div
                key="admin-navbar-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-40 overflow-visible"
              >
                <Navbar
                  currentRole={currentRole}
                  onRoleChange={setCurrentRole}
                  networkMode={networkMode}
                  onNetworkModeChange={setNetworkMode}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  pendingSyncCount={pendingSyncCount}
                  unreadNotifsCount={unreadNotifsCount}
                  onToggleNotifications={() => setIsNotificationsOpen(true)}
                  onOpenAddParcel={() => setIsAddParcelOpen(true)}
                  onOpenTestModal={() => setActiveTab('tests')}
                  onTriggerSync={handleTriggerSync}
                  isSyncing={isSyncing}
                  currentLang={currentLang}
                  onLanguageChange={handleLanguageChange}
                  portalMode={portalMode}
                  onPortalModeChange={handlePortalModeChange}
                  activeDataset={activeDataset}
                  onDatasetChange={handleDatasetChange}
                  onOpenSupabaseSync={() => setIsSupabaseModalOpen(true)}
                  supabaseStatus={supabaseStatus}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  onOpenAnalytics={() => setIsAnalyticsOpen(true)}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  lastAutosavedText={lastAutosavedText}
                />
              </motion.div>
            )}
          </AnimatePresence>

      {/* Conditional Portal Rendering with Smooth Framer Motion Entrance Animations */}
      <AnimatePresence mode="wait" initial={false}>
        {portalMode === 'home' && (
          <motion.div
            key="portal-home"
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col w-full min-h-0"
          >
            <HomePage
              onOpenCitizenPortal={() => handlePortalModeChange('citizen')}
              onOpenAdminPortal={() => handlePortalModeChange('admin')}
              onOpenAuth={handleOpenAuth}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
              currentUser={currentUser}
              onLogout={handleLogout}
              parcels={parcels}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </motion.div>
        )}

        {portalMode === 'citizen' && (
          <motion.div
            key="portal-citizen"
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col w-full min-h-0"
          >
            <CitizenPortal
              parcels={parcels}
              onSwitchToAdmin={() => handlePortalModeChange('admin')}
              onSwitchToHome={() => handlePortalModeChange('home')}
              onLocateOnMap={(parcel) => {
                handlePortalModeChange('admin');
                handleLocateOnMap(parcel);
              }}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </motion.div>
        )}

        {portalMode === 'admin' && (
          <motion.div
            key="portal-admin"
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col w-full min-h-0"
          >
            {/* Cadastre KPI Stats Bar */}
            <StatsBar
              parcels={parcels}
              markers={markers}
              currentRole={currentRole}
              pendingSyncCount={pendingSyncCount}
            />

            {/* Main View Display */}
            <main className="flex-1 flex flex-col">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'map' && (
                  <motion.div
                    key="tab-map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col w-full min-h-0"
                  >
                    <GISMap
                      parcels={parcels}
                      markers={markers}
                      selectedParcelId={selectedParcel?.id || null}
                      onSelectParcel={(parcel) => setSelectedParcel(parcel)}
                      onSelectMarker={(marker) => {
                        if (marker.parcelId) {
                          const matched = parcels.find((p) => p.id === marker.parcelId);
                          if (matched) setSelectedParcel(matched);
                        }
                      }}
                      onOpenAddParcel={() => setIsAddParcelOpen(true)}
                      canEdit={checkUserPermission(currentRole, 'edit_parcel')}
                      onNavigateToLifecycle={() => setActiveTab('lifecycle')}
                    />
                  </motion.div>
                )}

                {activeTab === 'table' && (
                  <motion.div
                    key="tab-table"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col w-full min-h-0"
                  >
                    <ParcelTable
                      parcels={parcels}
                      onSelectParcel={(parcel) => setSelectedParcel(parcel)}
                      onLocateOnMap={handleLocateOnMap}
                      currentRole={currentRole}
                    />
                  </motion.div>
                )}

                {activeTab === 'lifecycle' && (
                  <motion.div
                    key="tab-lifecycle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col w-full min-h-0"
                  >
                    <LifecycleMonitoringDashboard
                      currentRole={currentRole}
                      currentLang={currentLang}
                      onSelectParcelFromTracker={(parcelId) => {
                        const matched = parcels.find((p) => p.id === parcelId);
                        if (matched) {
                          setActiveTab('map');
                          setSelectedParcel(matched);
                        }
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === 'sync' && (
                  <motion.div
                    key="tab-sync"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col w-full min-h-0"
                  >
                    <OfflineSyncPanel
                      queue={offlineQueue}
                      networkMode={networkMode}
                      onNetworkModeChange={setNetworkMode}
                      onTriggerSync={handleTriggerSync}
                      isSyncing={isSyncing}
                      onClearQueue={() => setOfflineQueue([])}
                      onAddSimulatedOfflineMutation={handleAddSimulatedOfflineMutation}
                    />
                  </motion.div>
                )}

                {activeTab === 'tests' && (
                  <motion.div
                    key="tab-tests"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col w-full min-h-0"
                  >
                    <AutomatedTestModal parcels={parcels} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Drawers */}
      {selectedParcel && (
        <ParcelDetailModal
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          currentRole={currentRole}
          onUpdateParcelStatus={handleUpdateParcelStatus}
          onDeleteParcel={handleDeleteParcel}
          onAddObservation={handleAddObservation}
        />
      )}

      {isAddParcelOpen && (
        <AddParcelModal
          onClose={() => setIsAddParcelOpen(false)}
          onAddParcel={handleAddParcel}
          surveyorName={USER_PROFILES[currentRole].name}
        />
      )}

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onSelectParcelFromNotification={(parcelId) => {
          const target = parcels.find((p) => p.id === parcelId);
          if (target) {
            setActiveTab('map');
            setSelectedParcel(target);
          }
        }}
        onSimulateNewNotification={handleSimulateNewNotification}
      />


      {/* Supabase Cloud Sync Modal */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          getBackendStatus().then(setSupabaseStatus).catch(() => {});
        }}
        parcels={parcels}
        onParcelsUpdated={(updatedParcels) => {
          setParcels(updatedParcels);
          getBackendStatus().then(setSupabaseStatus).catch(() => {});
        }}
      />

      {/* Citizen & Revenue Officer Unified Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalRole}
        initialTab={authModalTab}
      />

        {/* Real-Time Cadastral Geofencing Monitor HUD & Field Telemetry */}
        <GeofenceMonitorModal parcels={parcels} onSelectParcelOnMap={handleLocateOnMap} />

        {/* Global ⌘K Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          parcels={parcels}
          onSelectParcel={(parcel) => {
            if (portalMode === 'citizen') {
              handlePortalModeChange('admin');
            }
            handleLocateOnMap(parcel);
          }}
          portalMode={portalMode}
          onTogglePortalMode={() =>
            handlePortalModeChange(portalMode === 'admin' ? 'citizen' : 'admin')
          }
          onOpenSupabaseSync={() => setIsSupabaseModalOpen(true)}
          onOpenGeofenceModal={() => {
            const geofenceBtn = document.getElementById('btn-geofence-hud');
            geofenceBtn?.click();
          }}
          onOpenTestModal={() => {
            if (portalMode === 'citizen') handlePortalModeChange('admin');
            setActiveTab('tests');
          }}
          onOpenLegal={handleOpenLegal}
          onOpenFaq={() => handleOpenLegal('privacy')}
          onToggleDataset={() =>
            handleDatasetChange(
              activeDataset === 'indian_cadastre' ? 'travis_county' : 'indian_cadastre'
            )
          }
          activeDataset={activeDataset}
        />

        {/* DPDP Act Compliant Privacy & Cookie Consent Banner */}
        <CookieBanner onOpenLegal={handleOpenLegal} />

        {/* Statutory Legal & Contact Directory Modal */}
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          defaultTab={legalModalTab}
        />

        {/* Floating Land Help, FAQ & AI Assistant Desk (Movable and Removable by Client) */}
        <SupportFloat
          onOpenLegal={handleOpenLegal}
          onWidgetRemoved={() =>
            addToast({
              type: 'info',
              title: 'Helpdesk Hidden',
              message: 'Help & Support widget removed from screen. Press Alt+H or click the restore button to show it again.',
            })
          }
        />

        {/* Scroll Reading Progress Bar & Back to Top Button */}
        <ScrollTopAndProgress />

        {/* Live Spatial Telemetry & Analytics Dashboard Modal */}
        <AnalyticsWidget
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          activeDataset={activeDataset}
          totalParcels={parcels.length}
        />

        {/* System & Activity Toast Notification Container */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </GeofenceProvider>
  </CurrencyProvider>
  );
}

