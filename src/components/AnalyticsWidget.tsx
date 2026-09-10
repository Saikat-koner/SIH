import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Database,
  Cpu,
  Zap,
  Globe2,
  CheckCircle2,
  X,
  Server,
} from 'lucide-react';

interface AnalyticsWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: string;
  totalParcels: number;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  isOpen,
  onClose,
  activeDataset,
  totalParcels,
}) => {
  const [metrics, setMetrics] = useState({
    activeSurveyors: 42,
    gpsPingsPerSec: 128,
    rtkAccuracyCm: 1.4,
    corsStationStatus: 'LOCK (Fixed)',
    supabaseLatencyMs: 24,
    cacheHitRate: '98.6%',
    uptime: '99.98%',
    lastUpdated: 'Just now',
  });

  // Simulated live telemetry stream
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        gpsPingsPerSec: Math.floor(120 + Math.random() * 20),
        rtkAccuracyCm: Number((1.2 + Math.random() * 0.5).toFixed(1)),
        supabaseLatencyMs: Math.floor(18 + Math.random() * 12),
        lastUpdated: '1s ago',
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 text-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Spatial Telemetry & Live GIS Analytics</h3>
              <p className="text-[11px] text-slate-400">
                National Spatial Data Infrastructure (NSDI) Node
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time stats grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>CORS RTK Accuracy</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ±{metrics.rtkAccuracyCm} cm
            </div>
            <span className="text-[10px] text-slate-400">Sub-decimeter Survey Grade</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>PostgreSQL Latency</span>
              <Database className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-400">
              {metrics.supabaseLatencyMs} ms
            </div>
            <span className="text-[10px] text-slate-400">Supabase Cloud Sync</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>GPS Geofence Telemetry</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {metrics.gpsPingsPerSec} pings/s
            </div>
            <span className="text-[10px] text-slate-400">{metrics.activeSurveyors} Mobile Field Surveyors</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>LocalDB Cache Hit Rate</span>
              <Server className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-400">
              {metrics.cacheHitRate}
            </div>
            <span className="text-[10px] text-slate-400">IndexedDB Zero-latency</span>
          </div>
        </div>

        {/* Dataset metadata & server heartbeat */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active Spatial Dataset:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {activeDataset === 'indian_cadastre' ? 'DILRMP / SVAMITVA (WGS 84)' : 'Travis County GIS (NAD83)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Loaded Cadastral Parcels:</span>
            <span className="font-semibold text-white font-mono">{totalParcels} polygons</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CORS Base Receiver:</span>
            <span className="font-semibold text-white font-mono">SOI-CORS-DEL-04 (Dual L1/L2)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Infrastructure SLA:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.98% High-Availability
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>Telemetry updated: {metrics.lastUpdated}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
