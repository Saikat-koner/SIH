import React from 'react';
import {
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Database,
  Coins,
  CheckCircle,
  Clock,
  Building,
} from 'lucide-react';
import { LandParcel, FieldMarker, UserRole } from '../types';
import { formatHectares, formatAcres } from '../lib/geoUtils';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface StatsBarProps {
  parcels: LandParcel[];
  markers: FieldMarker[];
  currentRole: UserRole;
  pendingSyncCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  parcels,
  markers,
  currentRole,
  pendingSyncCount,
}) => {
  const { formatMoney, currency, currencyConfig } = useCurrency();
  const totalHectares = parcels.reduce((sum, p) => sum + p.areaHectares, 0);
  const totalAcres = parcels.reduce((sum, p) => sum + p.areaAcres, 0);
  const totalValuation = parcels.reduce((sum, p) => sum + p.valuationUSD, 0);

  const activeCount = parcels.filter((p) => p.status === 'active').length;
  const acquiredCount = parcels.filter((p) => p.status === 'acquired').length;
  const inReviewCount = parcels.filter((p) => p.status === 'in_review').length;
  const disputedCount = parcels.filter((p) => p.status === 'disputed').length;
  const pendingCount = parcels.filter((p) => p.status === 'survey_pending').length;

  const getRolePrivilegeDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Executive Access: Cadastre editing, survey approval, boundary modification, and record deletion enabled.';
      case 'surveyor':
        return 'Field Crew Access: Polygon inspection, GPS peg additions, field note logging, and offline survey queuing enabled.';
      case 'auditor':
        return 'Audit Authority: Legal dispute flagging, compliance verification, title auditing, and GeoJSON data export enabled.';
      case 'viewer':
        return 'Stakeholder Read-Only: Public cadastre boundaries, zoning categories, and valuation transparency active.';
    }
  };

  return (
    <section className="bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Land Area */}
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Surveyed Land</span>
              <Building className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {formatHectares(Number(totalHectares.toFixed(1)))}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{formatAcres(Number(totalAcres.toFixed(0)))} total</p>
          </div>

          {/* Card 2: Total Valuation */}
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Cadastral Valuation</span>
              <div className="flex items-center gap-1">
                <CurrencySelector variant="pill" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-slate-900" title={`${currencyConfig.name} (${currencyConfig.symbol})`}>
                {formatMoney(totalValuation)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              {currency === 'INR' ? 'DILRMP Circle Rate' : `Assessed in ${currencyConfig.code}`}
            </p>
          </div>

          {/* Card 3: Status Breakdown */}
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Parcels ({parcels.length})</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span className="text-emerald-700">{activeCount} Active</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700">{acquiredCount} Acquired</span>
              {disputedCount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-600">{disputedCount} Disputed</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">{inReviewCount + pendingCount} pending survey/review</p>
          </div>

          {/* Card 4: Field Monuments & Markers */}
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Field Markers</span>
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-slate-900">{markers.length}</span>
              <span className="text-xs text-slate-500">Waypoints</span>
            </div>
            <p className="text-[11px] text-slate-500">Boreholes, pegs, test pits</p>
          </div>

          {/* Card 5: Sync Status */}
          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Cloud Cadastre Sync</span>
              <Database className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="flex items-center gap-1.5">
              {pendingSyncCount === 0 ? (
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Fully Synced</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-700 font-semibold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>{pendingSyncCount} Pending Sync</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500">PostgreSQL / Supabase Sync Engine</p>
          </div>
        </div>

        {/* Role privilege guidance banner */}
        <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Role Privilege:</span>
            <span className="text-slate-600">{getRolePrivilegeDescription(currentRole)}</span>
          </div>
          <span className="hidden md:inline-block text-[11px] font-semibold text-slate-400">
            Current Tier: <strong className="text-slate-700 uppercase">{currentRole}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
