import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import {
  X,
  ExternalLink,
  MapPin,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Compass,
  Radio,
  Share2,
} from 'lucide-react';

interface SpatialFeatureDossierProps {
  feature: {
    id?: string | number;
    properties: Record<string, any>;
    geometry: {
      type: string;
      coordinates: any;
    };
  };
  feedSource?: string;
  onClose: () => void;
  onZoomToFeature?: () => void;
}

export const SpatialFeatureDossier: React.FC<SpatialFeatureDossierProps> = ({
  feature,
  feedSource,
  onClose,
  onZoomToFeature,
}) => {
  const { formatCrores } = useCurrency();
  const props = feature.properties || {};

  // Extract key property values flexibly across Bhuvan and data.gov.in schemas
  const title =
    props.name ||
    props.title ||
    props.village_name ||
    props.station_id ||
    props.project_id ||
    'Active Government Infrastructure Feature';

  const ministry = props.ministry || 'Government of India';
  const agency = props.implementing_agency || props.agency || 'Public Authority';
  const status = props.status || props.operational_status || props.drone_flying_status || 'Active';
  const lengthKm = props.length_km;
  const area = props.land_acquired_hectares || props.area_acres;
  const concessionaire = props.concessionaire || props.land_ownership;
  const gazette = props.gazette_notif || props.gazetteRef;
  const budget = props.budget_allocated_cr || props.investment_cr;
  const disbursement = props.disbursement_cr || props.disbursed_cr;
  const demarcated = props.parcels_demarcated || props.parcels_count || props.property_cards_distributed;
  const totalParcels = props.total_parcels || props.parcels_count;

  return (
    <div className="absolute bottom-16 right-4 z-20 pointer-events-auto max-w-md w-[calc(100%-2rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
            <Radio className="w-4 h-4 animate-pulse text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-900 uppercase tracking-wider">
                {feedSource || 'OGD Live GeoJSON'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                {feature.geometry?.type}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={title}>
              {title}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {agency} &bull; {ministry}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          title="Close feature dossier"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-bold text-emerald-700 capitalize">
            {String(status).replace(/_/g, ' ')}
          </span>
        </div>
        {props.updated_at && (
          <span className="text-[10px] text-slate-400">
            Synced: {new Date(props.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Key Property Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        {lengthKm !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Alignment Length</div>
            <div className="text-sm font-bold text-slate-900">{lengthKm} km</div>
          </div>
        )}

        {area !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Cadastral Footprint</div>
            <div className="text-sm font-bold text-slate-900">
              {area} {props.area_acres ? 'Acres' : 'Hectares'}
            </div>
          </div>
        )}

        {demarcated !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Demarcated Parcels</div>
            <div className="text-sm font-bold text-emerald-700">
              {demarcated} {totalParcels ? `/ ${totalParcels}` : ''}
            </div>
          </div>
        )}

        {budget !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Project Allocation</div>
            <div className="text-sm font-bold text-slate-900">{formatCrores(budget)}</div>
          </div>
        )}

        {disbursement !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">PFMS Disbursed</div>
            <div className="text-sm font-bold text-blue-700">{formatCrores(disbursement)}</div>
          </div>
        )}

        {props.elevation_m !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Elevation / Baseline</div>
            <div className="text-sm font-bold text-purple-700">{props.elevation_m}m AMSL</div>
          </div>
        )}

        {props.satellites_tracked !== undefined && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-medium">Satellites Tracked</div>
            <div className="text-sm font-bold text-emerald-700">{props.satellites_tracked} (NavIC+GNSS)</div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
        {concessionaire && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 shrink-0">Contractor/EPC:</span>
            <span className="font-semibold text-slate-900 text-right truncate">{concessionaire}</span>
          </div>
        )}
        {gazette && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 shrink-0">Gazette Notif:</span>
            <span className="font-semibold text-indigo-700 text-right">{gazette}</span>
          </div>
        )}
        {props.baseline_accuracy && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 shrink-0">RTK Accuracy:</span>
            <span className="font-semibold text-emerald-700 text-right">{props.baseline_accuracy}</span>
          </div>
        )}
        {props.ulpin_prefix && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 shrink-0">ULPIN Prefix:</span>
            <span className="font-mono font-bold text-slate-800">{props.ulpin_prefix}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {onZoomToFeature && (
          <button
            onClick={onZoomToFeature}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Focus Feature</span>
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(feature, null, 2));
            alert('GeoJSON copied to clipboard!');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition ml-auto"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Copy GeoJSON</span>
        </button>
      </div>
    </div>
  );
};
