import React from 'react';
import {
  Database,
  Wifi,
  WifiOff,
  Radio,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  HardDrive,
  Trash2,
  Layers,
  FileCode,
  Check,
} from 'lucide-react';
import { OfflineSyncItem, NetworkMode } from '../types';

interface OfflineSyncPanelProps {
  queue: OfflineSyncItem[];
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onClearQueue: () => void;
  onAddSimulatedOfflineMutation: () => void;
}

export const OfflineSyncPanel: React.FC<OfflineSyncPanelProps> = ({
  queue,
  networkMode,
  onNetworkModeChange,
  onTriggerSync,
  isSyncing,
  onClearQueue,
  onAddSimulatedOfflineMutation,
}) => {
  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const syncedCount = queue.filter((q) => q.status === 'synced').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Status Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Offline Field Synchronization Engine</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                PWA / IndexedDB Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Enables field geomatics surveyors to record boundary pegs, register land parcels, and file inspection notes
              in remote low-connectivity terrain. All changes queue locally and automatically reconcile with the Supabase
              PostgreSQL database upon reconnection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing || networkMode === 'offline' || pendingCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Reconciling Cadastre...' : `Sync Queue (${pendingCount})`}</span>
            </button>
          </div>
        </div>

        {/* Connectivity Simulation Selector */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Online */}
          <button
            onClick={() => onNetworkModeChange('online')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              networkMode === 'online'
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Online (Fast Fiber / 4G)</span>
                {networkMode === 'online' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Instant two-way streaming REST sync</p>
            </div>
          </button>

          {/* Option 2: Low-Bandwidth */}
          <button
            onClick={() => onNetworkModeChange('low_bandwidth')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              networkMode === 'low_bandwidth'
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Low-Bandwidth (Field 2G/3G)</span>
                {networkMode === 'low_bandwidth' && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Batched transmission & compressed payloads</p>
            </div>
          </button>

          {/* Option 3: Offline */}
          <button
            onClick={() => onNetworkModeChange('offline')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
              networkMode === 'offline'
                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Offline / Remote Canyon</span>
                {networkMode === 'offline' && <Check className="w-3.5 h-3.5 text-rose-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Mutations persist in local device storage</p>
            </div>
          </button>
        </div>
      </div>

      {/* Storage and Queue Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400">Local Cache Storage</span>
              <p className="text-sm font-bold text-slate-900">4.8 MB / 50 MB Allocated</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Healthy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400">Pending Outbox</span>
              <p className="text-sm font-bold text-slate-900">{pendingCount} Mutations Waiting</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">FIFO Queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400">Reconciliation Rate</span>
              <p className="text-sm font-bold text-slate-900">{syncedCount} Mutated & Synced</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">100% Conflict Free</span>
        </div>
      </div>

      {/* Sync Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Local Mutation Outbox ({queue.length} Total Events)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddSimulatedOfflineMutation}
              className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold transition"
            >
              + Simulate Field Survey Mutation
            </button>
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="text-xs px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition flex items-center gap-1"
                title="Clear local sync queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Action & Mutation</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No pending mutations in the offline outbox. All cadastral operations are synchronized with the cloud.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{item.summary}</div>
                      <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-slate-600">{item.entityId}</span>
                      <div className="text-[10px] text-slate-400 capitalize">{item.entityType}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.retryCount}</td>
                    <td className="py-3 px-4 text-right">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      )}
                      {item.status === 'syncing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                          Syncing
                        </span>
                      )}
                      {item.status === 'synced' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Synced
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
