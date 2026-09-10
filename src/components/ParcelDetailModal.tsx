import React, { useState } from 'react';
import {
  X,
  MapPin,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  DollarSign,
  Download,
  Trash2,
  Edit3,
  Layers,
  Database,
  ExternalLink,
  Camera,
  Scale,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import { LandParcel, UserRole } from '../types';
import { checkUserPermission } from '../lib/unitTests';
import { formatHectares, formatAcres, parcelsToGeoJSON } from '../lib/geoUtils';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';
import { useGeofence } from '../context/GeofenceContext';

interface ParcelDetailModalProps {
  parcel: LandParcel;
  onClose: () => void;
  currentRole: UserRole;
  onUpdateParcelStatus: (parcelId: string, newStatus: LandParcel['status'], disputeNotes?: string) => void;
  onDeleteParcel?: (parcelId: string) => void;
  onAddObservation?: (parcelId: string, noteText: string) => void;
}

export const ParcelDetailModal: React.FC<ParcelDetailModalProps> = ({
  parcel,
  onClose,
  currentRole,
  onUpdateParcelStatus,
  onDeleteParcel,
  onAddObservation,
}) => {
  const { formatMoney, currency, currencyConfig } = useCurrency();
  const { assignedParcel, setAssignedParcel, setIsMonitorModalOpen } = useGeofence();
  const [activeTab, setActiveTab] = useState<'overview' | 'legal' | 'field' | 'coordinates'>('overview');
  const [disputeInput, setDisputeInput] = useState<string>('');
  const [showDisputeForm, setShowDisputeForm] = useState<boolean>(false);
  const [newObservation, setNewObservation] = useState<string>('');

  const canEdit = checkUserPermission(currentRole, 'edit_parcel');
  const canApprove = checkUserPermission(currentRole, 'approve_survey');
  const canFlagDispute = checkUserPermission(currentRole, 'flag_dispute');
  const canDelete = checkUserPermission(currentRole, 'delete_parcel');
  const canExport = checkUserPermission(currentRole, 'export_geojson');

  const getStatusBadge = (status: LandParcel['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'acquired':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'disputed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'survey_pending':
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const handleExportSingleGeoJSON = () => {
    const geojson = parcelsToGeoJSON([parcel]);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${parcel.parcelNumber}_cadastre.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInput.trim()) return;
    onUpdateParcelStatus(parcel.id, 'disputed', disputeInput);
    setShowDisputeForm(false);
    setDisputeInput('');
  };

  const handleObservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservation.trim() || !onAddObservation) return;
    onAddObservation(parcel.id, newObservation);
    setNewObservation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="parcel-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(
                    parcel.status
                  )}`}
                >
                  {parcel.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                  {parcel.zoning}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  Deed: {parcel.deedId}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{parcel.title}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Cadastre ID: {parcel.parcelNumber}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-parcel-set-geofence"
                onClick={() => {
                  setAssignedParcel(parcel);
                  setIsMonitorModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                  assignedParcel?.id === parcel.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Set this parcel as the active geofence target and open telemetry monitor"
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    assignedParcel?.id === parcel.id ? 'animate-pulse' : 'text-slate-500'
                  }`}
                />
                <span>{assignedParcel?.id === parcel.id ? 'Geofence Active' : 'Set as Geofence'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Spatial Area</span>
              <p className="text-sm font-bold text-slate-800">{formatHectares(parcel.areaHectares)}</p>
              <p className="text-[11px] text-slate-500">{formatAcres(parcel.areaAcres)}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cadastral Value</span>
                <CurrencySelector variant="pill" />
              </div>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatMoney(parcel.valuationUSD)}</p>
              <p className="text-[10px] text-emerald-600 font-medium">
                {currency === 'INR'
                  ? `₹${Math.round(parcel.valuationUSD * 83.5).toLocaleString('en-IN')}`
                  : `≈ ₹${((parcel.valuationUSD * 83.5) / 10000000).toFixed(2)} Cr INR`}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compliance Index</span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800">{parcel.complianceScore}%</p>
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
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
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Overview & Soil
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'legal'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Legal & Disputes
          </button>
          <button
            onClick={() => setActiveTab('field')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'field'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Field Notes ({parcel.attachmentsCount})
          </button>
          <button
            onClick={() => setActiveTab('coordinates')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'coordinates'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Vertices & GeoJSON
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Registered Owner</span>
                  <p className="font-semibold text-slate-900 mt-1">{parcel.owner}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded in County Land Cadastre</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Soil & Subsurface</span>
                  <p className="font-semibold text-slate-900 mt-1">{parcel.soilType}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Geodetic permeability validated</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Surveyor Field Remarks</span>
                <p className="mt-1.5 text-slate-800 leading-relaxed">{parcel.notes}</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Certified by: <strong className="text-slate-700">{parcel.surveyor}</strong></span>
                  <span>Date: {parcel.surveyDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold">Sync Status: {parcel.syncStatus.toUpperCase()}</span>
                    <p className="text-[11px] text-emerald-700">Persistent PostgreSQL / Supabase cluster replica</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-800">
                  {new Date(parcel.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Legal & Disputes */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Legal Title & Registration</span>
                  <span className="text-xs font-mono font-semibold text-slate-700">{parcel.deedId}</span>
                </div>
                <p className="mt-2 text-slate-700 leading-relaxed">
                  Clear title search recorded under Travis County Land Registry. Boundary pegs verified against geodetic
                  base benchmarks.
                </p>
              </div>

              {parcel.status === 'disputed' && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Active Boundary Dispute on Record</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-rose-800">
                    {parcel.disputeNotes || 'Dispute lodged regarding boundary monument displacement.'}
                  </p>
                  {canApprove && (
                    <button
                      onClick={() => onUpdateParcelStatus(parcel.id, 'active')}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold hover:bg-rose-100 transition shadow-xs text-xs"
                    >
                      Resolve & Re-Certify Boundary
                    </button>
                  )}
                </div>
              )}

              {canFlagDispute && parcel.status !== 'disputed' && (
                <div>
                  {!showDisputeForm ? (
                    <button
                      onClick={() => setShowDisputeForm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-semibold transition"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Flag Boundary Discrepancy / Dispute</span>
                    </button>
                  ) : (
                    <form onSubmit={handleDisputeSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-800">File Cadastre Dispute</h4>
                      <textarea
                        rows={3}
                        value={disputeInput}
                        onChange={(e) => setDisputeInput(e.target.value)}
                        placeholder="Detail the boundary peg shift, deed overlap, or zoning non-compliance..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                        required
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowDisputeForm(false)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                        >
                          Submit Dispute Flag
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Field Observations */}
          {activeTab === 'field' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Field survey assets ({parcel.attachmentsCount} documents & aerial photographs)</span>
                <span className="text-[11px] text-slate-400">Secured in Geodetic Vault</span>
              </div>

              {canEdit && (
                <form onSubmit={handleObservationSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Append Field Inspection Note</span>
                  <input
                    type="text"
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    placeholder="e.g. Ground monument BP-102 inspected with RTK rover; elevation 282.1m..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newObservation.trim()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs"
                    >
                      Save Field Note
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                  <Camera className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Drone Photogrammetry Orthomosaic</p>
                    <p className="text-[11px] text-slate-500">Resolution 2.5cm/px. Cloud point density 42 pts/m².</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                  <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Geodetic Benchmarking Traverse Log</p>
                    <p className="text-[11px] text-slate-500">Trimble R12 RTK GNSS calibration records attached.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Vertices & Coordinates */}
          {activeTab === 'coordinates' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Polygon Boundary Vertices ({parcel.coordinates.length} Points)
                </span>
                {canExport && (
                  <button
                    onClick={handleExportSingleGeoJSON}
                    className="flex items-center gap-1 text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export GeoJSON
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] space-y-1">
                {parcel.coordinates.map(([lat, lng], idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-800 pb-0.5">
                    <span className="text-slate-400">Vertex #{idx + 1}:</span>
                    <span>
                      {lat.toFixed(6)}° N, {lng.toFixed(6)}° W
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500">
                Centroid calculated at: {parcel.center[0].toFixed(5)}° N, {parcel.center[1].toFixed(5)}° W
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canExport && (
              <button
                onClick={handleExportSingleGeoJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export GeoJSON</span>
              </button>
            )}

            {canDelete && onDeleteParcel && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${parcel.parcelNumber}?`)) {
                    onDeleteParcel(parcel.id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                title="Delete Parcel (Admin Only)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canApprove && parcel.status === 'in_review' && (
              <button
                onClick={() => onUpdateParcelStatus(parcel.id, 'active')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Cadastre Survey</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
