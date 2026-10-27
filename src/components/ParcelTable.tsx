import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  MapPin,
  ArrowUpDown,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { LandParcel, UserRole, ParcelStatus, ZoningCategory } from '../types';
import { formatHectares, formatAcres, parcelsToGeoJSON } from '../lib/geoUtils';
import { checkUserPermission } from '../lib/unitTests';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface ParcelTableProps {
  parcels: LandParcel[];
  onSelectParcel: (parcel: LandParcel) => void;
  onLocateOnMap: (parcel: LandParcel) => void;
  currentRole: UserRole;
}

export const ParcelTable: React.FC<ParcelTableProps> = ({
  parcels,
  onSelectParcel,
  onLocateOnMap,
  currentRole,
}) => {
  const { formatMoney, currency, currencyConfig } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoningFilter, setZoningFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'area' | 'valuation' | 'compliance' | 'parcelNumber'>('parcelNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const canExport = checkUserPermission(currentRole, 'export_geojson');

  const filteredAndSortedParcels = useMemo(() => {
    let result = parcels.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.parcelNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.deedId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesZoning = zoningFilter === 'all' || p.zoning === zoningFilter;

      return matchesSearch && matchesStatus && matchesZoning;
    });

    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === 'area') {
        valA = a.areaHectares;
        valB = b.areaHectares;
      } else if (sortBy === 'valuation') {
        valA = a.valuationUSD;
        valB = b.valuationUSD;
      } else if (sortBy === 'compliance') {
        valA = a.complianceScore;
        valB = b.complianceScore;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [parcels, searchTerm, statusFilter, zoningFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'area' | 'valuation' | 'compliance' | 'parcelNumber') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportAllGeoJSON = () => {
    const geojson = parcelsToGeoJSON(filteredAndSortedParcels);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhudrishti_cadastre_export_${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Parcel Number',
      'Title',
      'Status',
      'Zoning',
      'Owner',
      'Deed ID',
      'Area (Hectares)',
      'Area (Acres)',
      'Valuation (USD)',
      'Compliance Score',
      'Surveyor',
      'Survey Date',
    ];

    const rows = filteredAndSortedParcels.map((p) => [
      `"${p.parcelNumber}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${p.zoning}"`,
      `"${p.owner.replace(/"/g, '""')}"`,
      `"${p.deedId}"`,
      p.areaHectares,
      p.areaAcres,
      p.valuationUSD,
      p.complianceScore,
      `"${p.surveyor}"`,
      `"${p.surveyDate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadastre_registry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'acquired':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'disputed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'survey_pending':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Controls & Search Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parcels, deed, owner..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/50"
          />
        </div>

        {/* Filter dropdowns & Export */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acquired">Acquired</option>
            <option value="in_review">In Review</option>
            <option value="disputed">Disputed</option>
            <option value="survey_pending">Survey Pending</option>
          </select>

          <select
            value={zoningFilter}
            onChange={(e) => setZoningFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Zoning</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Industrial">Industrial</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Conservation">Conservation</option>
            <option value="Mixed Use">Mixed Use</option>
          </select>

          {/* Inline Table Currency Switcher */}
          <CurrencySelector variant="compact" />

          {canExport && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportAllGeoJSON}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
                title="Export filtered records to GeoJSON format"
              >
                <Download className="w-3.5 h-3.5" />
                <span>GeoJSON</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
                title="Export filtered records to CSV table"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cadastre Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => toggleSort('parcelNumber')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Parcel Details</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Zoning & Owner</th>
                <th
                  onClick={() => toggleSort('area')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Spatial Area</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('valuation')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Valuation ({currencyConfig.symbol})</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Cadastre Status</th>
                <th
                  onClick={() => toggleSort('compliance')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Compliance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedParcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching land parcels found. Try resetting the filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedParcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                    onClick={() => onSelectParcel(parcel)}
                  >
                    {/* Parcel Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {parcel.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-500">{parcel.parcelNumber}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[10px] text-slate-400">{parcel.deedId}</span>
                      </div>
                    </td>

                    {/* Zoning & Owner */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{parcel.owner}</div>
                      <div className="mt-0.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {parcel.zoning}
                        </span>
                      </div>
                    </td>

                    {/* Spatial Area */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{formatHectares(parcel.areaHectares)}</div>
                      <div className="text-[11px] text-slate-500">{formatAcres(parcel.areaAcres)}</div>
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{formatMoney(parcel.valuationUSD)}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        {currency === 'INR'
                          ? `₹${Math.round(parcel.valuationUSD * 83.5).toLocaleString('en-IN')}`
                          : `≈ ₹${((parcel.valuationUSD * 83.5) / 10000000).toFixed(2)} Cr INR`}
                      </div>
                    </td>

                    {/* Cadastre Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                          parcel.status
                        )}`}
                      >
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Compliance */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{parcel.complianceScore}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              parcel.complianceScore > 90
                                ? 'bg-emerald-500'
                                : parcel.complianceScore > 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${parcel.complianceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onLocateOnMap(parcel)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition"
                          title="Locate Parcel on GIS Map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Map</span>
                        </button>
                        <button
                          onClick={() => onSelectParcel(parcel)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                          title="View Full Inspection Dossier"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredAndSortedParcels.length}</strong> of{' '}
            <strong className="text-slate-800">{parcels.length}</strong> registered parcels
          </span>
          <span className="font-mono text-[11px] text-slate-400">Database: Supabase PostgreSQL (Cadastre schema v2)</span>
        </div>
      </div>
    </div>
  );
};
