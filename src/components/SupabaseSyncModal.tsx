import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Server,
  Cloud,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { LandParcel } from '../types';
import {
  getBackendStatus,
  syncParcelsWithBackend,
  BackendStatus,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabaseSync';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: LandParcel[];
  onParcelsUpdated: (parcels: LandParcel[]) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  parcels,
  onParcelsUpdated,
}) => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await getBackendStatus();
      setStatus(res);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerSync = async (forcePush = false) => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncParcelsWithBackend(parcels, forcePush);
      if (res.success) {
        onParcelsUpdated(res.parcels);
        setSyncResult({
          success: true,
          message: `Successfully synchronized ${res.syncedCount} parcels with the backend (${res.mode}).`,
        });
      } else {
        setSyncResult({
          success: false,
          message: res.message || 'Synchronization completed with warnings.',
        });
      }
      await refreshStatus();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Sync failed',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Supabase Cloud Database Synchronization</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    status?.supabaseConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : status?.configured
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status?.supabaseConnected
                        ? 'bg-emerald-500 animate-pulse'
                        : status?.configured
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {status?.supabaseConnected
                    ? 'Connected & Synced'
                    : status?.configured
                    ? 'Connecting to Supabase'
                    : 'Awaiting Settings Config'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-stack PostgreSQL backend with real-time cadastral records persistence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              status?.supabaseConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : status?.configured
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {status?.supabaseConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : status?.configured ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Server className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1 flex-1">
              <div className="font-bold flex items-center justify-between">
                <span>{status?.statusMessage || 'Checking connection status...'}</span>
                {status?.supabaseHost && (
                  <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {status.supabaseHost}
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                {status?.supabaseConnected
                  ? `Your Express backend is actively synced with Supabase. Changes to land parcels, boundary pegs, and surveyor field notes persist in PostgreSQL.`
                  : `Your full-stack Express backend is running. Configure SUPABASE_URL and SUPABASE_ANON_KEY via the Settings menu in AI Studio to sync your registered Supabase project.`}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Local Parcels</span>
              <p className="text-lg font-bold text-slate-900">{parcels.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Backend Cache</span>
              <p className="text-lg font-bold text-slate-900">{status?.cachedCount ?? 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Supabase DB Rows</span>
              <p className="text-lg font-bold text-emerald-700">{status?.remoteRowCount ?? (status?.supabaseConnected ? 0 : '—')}</p>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleTriggerSync(false)}
              disabled={syncing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronizing...' : 'Sync Parcels with Backend'}
            </button>
            <button
              onClick={() => handleTriggerSync(true)}
              disabled={syncing}
              className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              title="Force push all local parcels into the Supabase database"
            >
              Force Push to Cloud
            </button>
            <button
              onClick={refreshStatus}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
              title="Refresh Connection Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Sync Result Feedback */}
          {syncResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                syncResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {syncResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{syncResult.message}</span>
            </div>
          )}

          {/* SQL Schema Assistant for User's Registered Supabase Project */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Supabase SQL Table Schema (`parcels`)</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If your Supabase project does not have the <code className="font-mono text-emerald-700 bg-white px-1 py-0.5 rounded border border-slate-200">parcels</code> table yet, copy this SQL and run it in your <strong>Supabase Dashboard &rarr; SQL Editor</strong>:
            </p>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36 leading-tight border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Credentials Guide */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>How to connect your registered Supabase:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Open your project at <strong>supabase.com</strong> &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
              <li>In AI Studio, open the <strong>Settings (Secrets)</strong> panel and add:
                <div className="font-mono text-[10px] bg-white p-1.5 mt-1 rounded border border-blue-200 text-slate-800">
                  SUPABASE_URL=https://[your-project-ref].supabase.co<br />
                  SUPABASE_ANON_KEY=[your-anon-public-key]
                </div>
              </li>
              <li>Click <strong>Sync Parcels with Backend</strong> above to establish real-time two-way synchronization!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            API Route: <code className="text-slate-600">/api/parcels</code> & <code className="text-slate-600">/api/sync</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
