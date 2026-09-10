import React, { useState } from 'react';
import { X, Plus, MapPin, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { LandParcel, ZoningCategory, ParcelStatus } from '../types';
import { calculatePolygonArea, calculateCentroid, formatHectares, formatAcres } from '../lib/geoUtils';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface AddParcelModalProps {
  onClose: () => void;
  onAddParcel: (newParcel: Omit<LandParcel, 'id' | 'updatedAt' | 'syncStatus' | 'attachmentsCount' | 'complianceScore'>) => void;
  surveyorName: string;
}

export const AddParcelModal: React.FC<AddParcelModalProps> = ({
  onClose,
  onAddParcel,
  surveyorName,
}) => {
  const { formatMoney, currency, currencyConfig } = useCurrency();
  const [title, setTitle] = useState('');
  const [parcelNumber, setParcelNumber] = useState(`TX-TRAV-2024-${Math.floor(1000 + Math.random() * 9000)}`);
  const [zoning, setZoning] = useState<ZoningCategory>('Agricultural');
  const [status, setStatus] = useState<ParcelStatus>('survey_pending');
  const [owner, setOwner] = useState('');
  const [deedId, setDeedId] = useState(`DEED-${Math.floor(10000 + Math.random() * 90000)}-T1`);
  const [valuationUSD, setValuationUSD] = useState<number>(3500000);
  const [soilType, setSoilType] = useState('Sandy Clay Loam / Alluvial');
  const [notes, setNotes] = useState('Ground boundary survey initiated. Benchmarks established.');

  // Coordinate geometry generator presets
  const [coordinatePreset, setCoordinatePreset] = useState<'preset1' | 'preset2' | 'custom'>('preset1');
  const [customCoordsText, setCustomCoordsText] = useState(
    '30.3450, -97.8650\n30.3510, -97.8600\n30.3490, -97.8500\n30.3420, -97.8550'
  );

  const getCoordinatesFromState = (): [number, number][] => {
    if (coordinatePreset === 'preset1') {
      // East Travis expansion parcel
      return [
        [30.345, -97.865],
        [30.351, -97.86],
        [30.349, -97.85],
        [30.342, -97.855],
        [30.341, -97.862],
      ];
    } else if (coordinatePreset === 'preset2') {
      // North corridor parcel
      return [
        [30.384, -97.838],
        [30.39, -97.832],
        [30.387, -97.82],
        [30.381, -97.825],
      ];
    } else {
      // Parse custom lines
      try {
        const lines = customCoordsText.trim().split('\n');
        const parsed: [number, number][] = lines
          .map((l) => {
            const parts = l.split(',').map((p) => parseFloat(p.trim()));
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              return [parts[0], parts[1]] as [number, number];
            }
            return null;
          })
          .filter((p): p is [number, number] => p !== null);

        return parsed.length >= 3 ? parsed : [[30.35, -97.86], [30.36, -97.86], [30.355, -97.85]];
      } catch {
        return [[30.35, -97.86], [30.36, -97.86], [30.355, -97.85]];
      }
    }
  };

  const coords = getCoordinatesFromState();
  const areaCalc = calculatePolygonArea(coords);
  const centroid = calculateCentroid(coords);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !owner.trim()) return;

    onAddParcel({
      title,
      parcelNumber,
      coordinates: coords,
      center: centroid,
      areaHectares: areaCalc.hectares,
      areaAcres: areaCalc.acres,
      status,
      zoning,
      owner,
      deedId,
      valuationUSD: Number(valuationUSD) || 1000000,
      soilType,
      surveyDate: new Date().toISOString().split('T')[0],
      surveyor: surveyorName,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Register New Land Parcel</h3>
            <p className="text-xs text-slate-500">Add spatial geometry & cadastre deed records</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parcel Title / Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Travis South Agro-Innovation Park"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cadastre Parcel #</label>
              <input
                type="text"
                required
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Zoning Category</label>
              <select
                value={zoning}
                onChange={(e) => setZoning(e.target.value as ZoningCategory)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Agricultural">Agricultural</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Residential">Residential</option>
                <option value="Conservation">Conservation</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ParcelStatus)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="survey_pending">Survey Pending</option>
                <option value="in_review">In Review</option>
                <option value="active">Active</option>
                <option value="acquired">Acquired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Owner *</label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Austin Valley Holdings Trust"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title Deed Identifier</label>
              <input
                type="text"
                required
                value={deedId}
                onChange={(e) => setDeedId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Assessed Valuation ({currencyConfig.symbol} {currencyConfig.code})
                </label>
                <CurrencySelector variant="pill" />
              </div>
              <input
                type="number"
                value={valuationUSD}
                onChange={(e) => setValuationUSD(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                <span>Display: <strong>{formatMoney(valuationUSD)}</strong></span>
                {currency !== 'INR' && (
                  <span className="text-slate-500 font-mono">
                    ≈ ₹{((valuationUSD * 83.5) / 10000000).toFixed(2)} Cr INR
                  </span>
                )}
                {currency === 'INR' && (
                  <span className="text-slate-500 font-mono">
                    ≈ ${(valuationUSD / 83.5).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Soil Classification</label>
              <input
                type="text"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Spatial Boundary Geometries */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Spatial Polygon Geometry
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                {formatHectares(areaCalc.hectares)} ({formatAcres(areaCalc.acres)})
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCoordinatePreset('preset1')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  coordinatePreset === 'preset1'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                South Basin (5 Vertices)
              </button>
              <button
                type="button"
                onClick={() => setCoordinatePreset('preset2')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  coordinatePreset === 'preset2'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                North Corridor (4 Vertices)
              </button>
              <button
                type="button"
                onClick={() => setCoordinatePreset('custom')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  coordinatePreset === 'custom'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Manual Lat/Lng
              </button>
            </div>

            {coordinatePreset === 'custom' && (
              <textarea
                rows={3}
                value={customCoordsText}
                onChange={(e) => setCustomCoordsText(e.target.value)}
                placeholder="Lat, Lng (one pair per line, min 3 points)"
                className="w-full text-[11px] font-mono p-2 rounded-lg border border-slate-300 bg-white"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Field Surveyor Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </form>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Register Parcel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
