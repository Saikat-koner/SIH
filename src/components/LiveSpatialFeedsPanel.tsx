import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Layers,
  Database,
  CheckCircle,
  ExternalLink,
  Upload,
  AlertCircle,
  Clock,
  Compass,
  Zap,
  Globe,
  X,
  FileCode,
} from 'lucide-react';
import {
  OFFICIAL_SPATIAL_FEEDS,
  SpatialFeedMetadata,
  SpatialFeedResult,
  spatialDataService,
  GeoJSONFeatureCollection,
} from '../services/spatialDataService';

interface LiveSpatialFeedsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeedIds: string[];
  feedResults: Record<string, SpatialFeedResult>;
  isSyncing: boolean;
  onToggleFeed: (feedId: string) => void;
  onRefreshFeed: (feedId: string) => Promise<void>;
  onRefreshAll: () => Promise<void>;
  onFlyToFeed: (feedId: string) => void;
  onImportCustomGeoJson: (geoJson: GeoJSONFeatureCollection, title: string) => void;
}

export const LiveSpatialFeedsPanel: React.FC<LiveSpatialFeedsPanelProps> = ({
  isOpen,
  onClose,
  activeFeedIds,
  feedResults,
  isSyncing,
  onToggleFeed,
  onRefreshFeed,
  onRefreshAll,
  onFlyToFeed,
  onImportCustomGeoJson,
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [customTitle, setCustomTitle] = useState('');
  const [customInputType, setCustomInputType] = useState<'json' | 'url'>('json');
  const [customJsonText, setCustomJsonText] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [isParsingCustom, setIsParsingCustom] = useState(false);

  if (!isOpen) return null;

  const totalLoadedFeatures = (Object.values(feedResults) as SpatialFeedResult[])
    .filter((r) => r?.metadata && activeFeedIds.includes(r.metadata.id))
    .reduce((acc, r) => acc + (r.telemetry?.featureCount || 0), 0);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    setIsParsingCustom(true);

    try {
      let geoJsonData: GeoJSONFeatureCollection;
      const title = customTitle.trim() || 'Custom GeoJSON Feed';

      if (customInputType === 'json') {
        if (!customJsonText.trim()) {
          throw new Error('Please paste valid GeoJSON content.');
        }
        geoJsonData = spatialDataService.parseCustomGeoJSON(customJsonText);
      } else {
        if (!customUrl.trim()) {
          throw new Error('Please provide a valid data.gov.in or GeoJSON URL.');
        }
        const response = await fetch(customUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch from URL: HTTP ${response.status}`);
        }
        const json = await response.json();
        geoJsonData = spatialDataService.parseCustomGeoJSON(JSON.stringify(json));
      }

      onImportCustomGeoJson(geoJsonData, title);
      setCustomJsonText('');
      setCustomUrl('');
      setCustomTitle('');
      onClose();
    } catch (err: any) {
      setCustomError(err?.message || 'Invalid GeoJSON specification');
    } finally {
      setIsParsingCustom(false);
    }
  };

  const loadSampleCustomGeoJSON = () => {
    const sample = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Khavda Renewable Energy Park (Gujarat)',
            agency: 'SECI / GEDA',
            capacity_gw: 30,
            investment_cr: 150000,
            status: 'active_construction',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [69.60, 23.85],
                [69.85, 23.85],
                [69.85, 24.10],
                [69.60, 24.10],
                [69.60, 23.85],
              ],
            ],
          },
        },
      ],
    };
    setCustomJsonText(JSON.stringify(sample, null, 2));
    setCustomTitle('Khavda Mega Hybrid Renewable Park Feed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  National Spatial GeoJSON Feeds
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Feeds
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Real-time API integration with ISRO Bhuvan & Open Government Data (data.gov.in)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Telemetry Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Active Feeds: <strong className="text-slate-900">{activeFeedIds.length}</strong> / {OFFICIAL_SPATIAL_FEEDS.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Rendered Features: <strong className="text-emerald-700">{totalLoadedFeatures}</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 rounded-lg shadow-xs transition text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync All Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-5 pt-2">
          <button
            onClick={() => setActiveTab('official')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'official'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official Government Feeds ({OFFICIAL_SPATIAL_FEEDS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Custom GeoJSON / data.gov.in Ingest</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'official' ? (
            <div className="space-y-3">
              {OFFICIAL_SPATIAL_FEEDS.map((feed) => {
                const isActive = activeFeedIds.includes(feed.id);
                const result = feedResults[feed.id];
                const telemetry = result?.telemetry;

                return (
                  <div
                    key={feed.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left info */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => onToggleFeed(feed.id)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: feed.defaultColor }}
                            />
                            <h4 className="text-xs font-bold text-slate-900">
                              {feed.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                feed.source === 'bhuvan_isro'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {feed.sourceLabel}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 text-slate-700">
                              {feed.geometryType}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {feed.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 flex-wrap font-medium">
                            <span>Ministry: <strong className="text-slate-700">{feed.ministry}</strong></span>
                            <span>&bull;</span>
                            <span>Agency: <strong className="text-slate-700">{feed.agency}</strong></span>
                            {telemetry && (
                              <>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1 text-indigo-700">
                                  <Clock className="w-3 h-3" />
                                  Updated: {telemetry.lastUpdated}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  {telemetry.latencyMs}ms latency
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isActive && (
                          <button
                            onClick={() => onFlyToFeed(feed.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                            title="Fly to GeoJSON feature bounds on map"
                          >
                            <Compass className="w-3.5 h-3.5 text-indigo-600" />
                          </button>
                        )}
                        <button
                          onClick={() => onRefreshFeed(feed.id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                          title="Refresh this spatial feed from API"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Active Feed Stats Footer */}
                    {isActive && telemetry && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            {telemetry.featureCount} Features Loaded
                          </span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-500">
                            Source: {telemetry.dataSource === 'live_network' ? 'Live OGC Endpoint' : 'Verified OGD GeoJSON Mirror'}
                          </span>
                        </div>
                        <a
                          href={feed.endpointUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 text-[10px] font-semibold"
                        >
                          <span>Endpoint Spec</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
                <FileCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Import Any data.gov.in / Bhuvan Dataset:</strong>
                  <p className="mt-0.5 text-emerald-800">
                    Paste raw RFC 7946 GeoJSON or supply a direct open data resource URL. The engine validates geometries, applies adaptive styling, and overlays features directly onto your GIS cadastre.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Layer / Project Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Surat-Chennai Expressway Corridor or Khavda Solar Footprint"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center gap-4 mb-2">
                  <label className="text-xs font-bold text-slate-700">Input Mode:</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={customInputType === 'json'}
                      onChange={() => setCustomInputType('json')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Paste GeoJSON Content</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={customInputType === 'url'}
                      onChange={() => setCustomInputType('url')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Fetch from API URL</span>
                  </label>
                </div>

                {customInputType === 'json' ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-500">FeatureCollection or Feature JSON</span>
                      <button
                        type="button"
                        onClick={loadSampleCustomGeoJSON}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        Load Sample Mega Solar Park
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      value={customJsonText}
                      onChange={(e) => setCustomJsonText(e.target.value)}
                      placeholder='{ "type": "FeatureCollection", "features": [ ... ] }'
                      className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://api.data.gov.in/resource/... or Bhuvan WFS endpoint"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Note: External government domains must permit cross-origin requests (CORS).
                    </p>
                  </div>
                )}
              </div>

              {customError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{customError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCustomJsonText('');
                    setCustomError(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isParsingCustom}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isParsingCustom ? 'Validating...' : 'Overlay onto GIS Map'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Compliant with <strong>Survey of India WGS84 (EPSG:4326)</strong> and OGC Web Feature Service 2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition"
          >
            Apply & View on Map
          </button>
        </div>
      </div>
    </div>
  );
};
