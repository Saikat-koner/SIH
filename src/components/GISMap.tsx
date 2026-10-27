import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Filter,
  Navigation,
  Compass,
  MapPin,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Route,
  ChevronDown,
  X,
  ExternalLink,
  Activity,
  Sparkles,
  Radio,
  Database,
} from 'lucide-react';
import { LandParcel, FieldMarker, ParcelStatus, MapLayerConfig } from '../types';
import { MAP_LAYERS } from '../data/mockData';
import { calculateBounds } from '../lib/geoUtils';
import {
  NATIONAL_PROJECT_CORRIDORS,
  MapProjectCorridor,
  CorridorWaypoint,
} from '../data/projectCorridorsData';
import {
  spatialDataService,
  SpatialFeedResult,
  GeoJSONFeatureCollection,
  OFFICIAL_SPATIAL_FEEDS,
} from '../services/spatialDataService';
import { LiveSpatialFeedsPanel } from './LiveSpatialFeedsPanel';
import { SpatialFeatureDossier } from './SpatialFeatureDossier';
import { useGeofence } from '../context/GeofenceContext';

interface GISMapProps {
  parcels: LandParcel[];
  markers: FieldMarker[];
  selectedParcelId: string | null;
  onSelectParcel: (parcel: LandParcel) => void;
  onSelectMarker?: (marker: FieldMarker) => void;
  onOpenAddParcel?: () => void;
  canEdit: boolean;
  onNavigateToLifecycle?: (projectId?: string) => void;
}

export const GISMap: React.FC<GISMapProps> = ({
  parcels,
  markers,
  selectedParcelId,
  onSelectParcel,
  onSelectMarker,
  onOpenAddParcel,
  canEdit,
  onNavigateToLifecycle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const markerLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const projectLinesGroupRef = useRef<L.LayerGroup | null>(null);
  const projectWaypointsGroupRef = useRef<L.LayerGroup | null>(null);
  const geoJsonFeedsGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayersGroupRef = useRef<L.LayerGroup | null>(null);

  // Cadastral Geofencing Context
  const {
    assignedParcel,
    isGeofenceActive,
    trackingMode,
    currentPosition,
    boundaryStatus,
    distanceToBoundary,
    nearestBoundaryPoint,
    simulatePosition,
    setIsMonitorModalOpen,
  } = useGeofence();

  const trackingModeRef = useRef(trackingMode);
  trackingModeRef.current = trackingMode;
  const simulatePositionRef = useRef(simulatePosition);
  simulatePositionRef.current = simulatePosition;
  const isGeofenceActiveRef = useRef(isGeofenceActive);
  isGeofenceActiveRef.current = isGeofenceActive;

  const [activeLayerId, setActiveLayerId] = useState<string>('satellite');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoningFilter, setZoningFilter] = useState<string>('all');
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showProjects, setShowProjects] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<MapProjectCorridor | null>(null);
  const [activeCorridorFilter, setActiveCorridorFilter] = useState<string>('all');

  // Real-time Government Spatial Feeds State
  const [activeFeedIds, setActiveFeedIds] = useState<string[]>([
    'bhuvan_gatishakti_highways',
    'datagov_dfccil_freight_corridors',
    'bhuvan_cors_gnss_stations',
  ]);
  const [feedResults, setFeedResults] = useState<Record<string, SpatialFeedResult>>({});
  const [isFeedsPanelOpen, setIsFeedsPanelOpen] = useState<boolean>(false);
  const [isSyncingFeeds, setIsSyncingFeeds] = useState<boolean>(false);
  const [inspectedGeoJsonFeature, setInspectedGeoJsonFeature] = useState<{
    feature: any;
    feedSource?: string;
  } | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState<boolean>(false);
  const [mapAnnouncement, setMapAnnouncement] = useState<string>('');

  // Status color mappings
  const getStatusColor = (status: ParcelStatus) => {
    switch (status) {
      case 'active':
        return { fill: '#10b981', border: '#059669' }; // Emerald
      case 'acquired':
        return { fill: '#3b82f6', border: '#2563eb' }; // Blue
      case 'in_review':
        return { fill: '#f59e0b', border: '#d97706' }; // Amber
      case 'disputed':
        return { fill: '#ef4444', border: '#dc2626' }; // Rose
      case 'survey_pending':
        return { fill: '#a855f7', border: '#9333ea' }; // Purple
      default:
        return { fill: '#64748b', border: '#475569' };
    }
  };

  // Filter parcels based on state
  const filteredParcels = parcels.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (zoningFilter !== 'all' && p.zoning !== zoningFilter) return false;
    return true;
  });

  // Keyboard Escape Handler to close floating menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLayerMenuOpen || isFilterMenuOpen || isProjectMenuOpen) {
          setIsLayerMenuOpen(false);
          setIsFilterMenuOpen(false);
          setIsProjectMenuOpen(false);
          setMapAnnouncement('Closed map overlay menu');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLayerMenuOpen, isFilterMenuOpen, isProjectMenuOpen]);

  // Initialize Map (Bounded, non-continuous world-wrap)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Determine initial center based on parcels or default to central India
      const initialCenter: [number, number] =
        parcels.length > 0 && parcels[0].center
          ? parcels[0].center
          : [21.7679, 78.8718];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: parcels.length > 0 ? 14 : 5,
        zoomControl: false,
        attributionControl: false,
        // STRICT BOUNDS: Map does NOT loop continuously like an infinite globe
        maxBounds: [
          [-85, -180],
          [85, 180],
        ],
        maxBoundsViscosity: 1.0, // Strict lock preventing endless panning past world edges
        worldCopyJump: false,
        minZoom: 3,
      });

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-slate-500 font-medium">BhuDrishti &bull; Cadastre AI</span>',
        })
        .addTo(map);

      // Layer groups
      projectLinesGroupRef.current = L.layerGroup().addTo(map);
      projectWaypointsGroupRef.current = L.layerGroup().addTo(map);
      geoJsonFeedsGroupRef.current = L.layerGroup().addTo(map);
      polygonLayersGroupRef.current = L.layerGroup().addTo(map);
      markerLayersGroupRef.current = L.layerGroup().addTo(map);
      geofenceLayersGroupRef.current = L.layerGroup().addTo(map);

      // Mousemove coordinates listener
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        });
      });

      // Map Click: In simulation mode, clicking anywhere teleports surveyor to test boundary
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isGeofenceActiveRef.current && trackingModeRef.current === 'simulation') {
          simulatePositionRef.current([e.latlng.lat, e.latlng.lng]);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Ensure map tiles properly invalidate and redraw when animated in via Framer Motion
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);
    // Also trigger on slight delay to account for animation duration
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 320);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Initial fit to parcels when loaded
  useEffect(() => {
    if (!mapInstanceRef.current || parcels.length === 0) return;
    if (!selectedParcelId && !selectedProject) {
      const allCoords = parcels.flatMap((p) => p.coordinates);
      if (allCoords.length > 0) {
        const bounds = calculateBounds(allCoords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [parcels]);

  // Update Tile Layer with noWrap to stop continuous repeating globe
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layerConfig = MAP_LAYERS.find((l) => l.id === activeLayerId) || MAP_LAYERS[0];

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      // Prevents tile wrapping horizontally like a globe
      noWrap: true,
      bounds: [
        [-85, -180],
        [85, 180],
      ],
    }).addTo(mapInstanceRef.current);
  }, [activeLayerId]);

  // Render National Project Corridors & Waypoints
  useEffect(() => {
    if (!mapInstanceRef.current || !projectLinesGroupRef.current || !projectWaypointsGroupRef.current)
      return;

    projectLinesGroupRef.current.clearLayers();
    projectWaypointsGroupRef.current.clearLayers();

    if (!showProjects) return;

    const visibleCorridors =
      activeCorridorFilter === 'all'
        ? NATIONAL_PROJECT_CORRIDORS
        : NATIONAL_PROJECT_CORRIDORS.filter((c) => c.id === activeCorridorFilter);

    visibleCorridors.forEach((corridor) => {
      const isSelected = selectedProject?.id === corridor.id;

      // Outer casing line for high contrast over satellite imagery
      const casingLine = L.polyline(corridor.coordinates, {
        color: '#ffffff',
        weight: isSelected ? 8 : 5.5,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Core colored corridor polyline
      const mainLine = L.polyline(corridor.coordinates, {
        color: corridor.color,
        weight: isSelected ? 5 : 3.5,
        opacity: 0.95,
        dashArray: corridor.corridorType === 'rail_freight' ? '6, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Rich tooltip on hover
      const progressPercent = Math.round(
        (corridor.demarcatedParcels / corridor.totalParcels) * 100
      );
      const tooltipContent = `
        <div class="p-2 font-sans text-xs max-w-xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${corridor.color}"></span>
            <span class="font-bold text-slate-900">${corridor.name}</span>
          </div>
          <div class="text-[11px] text-slate-600 font-medium">${corridor.corridorType.replace('_', ' ').toUpperCase()} &bull; ${corridor.totalLengthKm ? `${corridor.totalLengthKm} km` : 'Multi-Cluster'}</div>
          <div class="mt-2 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Demarcation:</span>
              <span class="font-bold text-slate-800">${progressPercent}% (${corridor.demarcatedParcels}/${corridor.totalParcels})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Disbursed:</span>
              <span class="font-bold text-emerald-700">₹${corridor.disbursedBudgetCr} Cr</span>
            </div>
          </div>
          <div class="mt-1.5 text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
            <span>Click to inspect project & stations</span>
          </div>
        </div>
      `;

      mainLine.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'custom-leaflet-tooltip shadow-xl border border-slate-300 rounded-xl',
      });

      // Click to select & fly to corridor
      const handleCorridorClick = () => {
        setSelectedProject(corridor);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(mainLine.getBounds(), {
            padding: [60, 60],
            maxZoom: 12,
            animate: true,
          });
        }
      };

      casingLine.on('click', handleCorridorClick);
      mainLine.on('click', handleCorridorClick);

      projectLinesGroupRef.current?.addLayer(casingLine);
      projectLinesGroupRef.current?.addLayer(mainLine);

      // Render Waypoints / Terminals / Stations along the corridor
      corridor.waypoints.forEach((wp) => {
        const isTerminal = wp.type === 'terminal';
        const markerIcon = L.divIcon({
          className: 'custom-project-waypoint',
          html: `
            <div style="transform: translate(-50%, -50%); cursor: pointer;" class="group">
              <div class="px-1.5 py-0.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 font-bold text-[9px] text-white transition-transform group-hover:scale-110" style="background-color: ${corridor.color}">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span class="hidden sm:inline whitespace-nowrap">${wp.name.split(' (')[0].split(' ')[0]}</span>
              </div>
            </div>
          `,
          iconSize: [20, 20],
        });

        const waypointMarker = L.marker(wp.position, { icon: markerIcon });

        const wpTooltip = `
          <div class="p-1.5 font-sans text-xs">
            <div class="font-bold text-slate-900">${wp.name}</div>
            <div class="text-[10px] text-slate-500">${wp.state} &bull; ${wp.type.toUpperCase()}</div>
            ${wp.details ? `<div class="mt-1 text-[11px] text-slate-700">${wp.details}</div>` : ''}
          </div>
        `;

        waypointMarker.bindTooltip(wpTooltip, {
          className: 'custom-leaflet-tooltip shadow-md border border-slate-200 rounded-lg',
        });

        waypointMarker.on('click', () => {
          setSelectedProject(corridor);
        });

        projectWaypointsGroupRef.current?.addLayer(waypointMarker);
      });
    });
  }, [showProjects, activeCorridorFilter, selectedProject]);

  // Fetch active government spatial datasets from Bhuvan / data.gov.in
  useEffect(() => {
    let isMounted = true;

    activeFeedIds.forEach((feedId) => {
      if (!feedResults[feedId]) {
        spatialDataService.fetchSpatialDataset(feedId).then((result) => {
          if (isMounted) {
            setFeedResults((prev) => ({ ...prev, [feedId]: result }));
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeFeedIds]);

  // Render Real-Time GeoJSON Feeds onto Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonFeedsGroupRef.current) return;

    geoJsonFeedsGroupRef.current.clearLayers();

    activeFeedIds.forEach((feedId) => {
      const result = feedResults[feedId];
      if (!result || !result.geoJson || !result.geoJson.features) return;

      const feedColor = result.metadata.defaultColor || '#3b82f6';
      const isRail = result.metadata.category === 'railways';
      const isCanal = result.metadata.category === 'waterways';

      const geoLayer = L.geoJSON(result.geoJson as any, {
        style: (feature) => {
          const geomType = feature?.geometry?.type;
          if (geomType === 'LineString' || geomType === 'MultiLineString') {
            return {
              color: feedColor,
              weight: 4.5,
              opacity: 0.95,
              dashArray: isRail ? '6, 6' : isCanal ? '8, 4' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            };
          } else {
            return {
              color: feedColor,
              weight: 2,
              fillColor: feedColor,
              fillOpacity: 0.35,
              dashArray: '3, 3',
            };
          }
        },
        pointToLayer: (feature, latlng) => {
          const isCors = result.metadata.category === 'cors_network';
          const stnId = feature.properties?.station_id || 'CORS';
          const customHtml = `
            <div style="transform: translate(-50%, -50%); cursor: pointer;" class="group">
              <div class="relative flex items-center justify-center">
                <span class="absolute inline-flex h-5 w-5 rounded-full bg-purple-400 opacity-75 animate-ping"></span>
                <div class="relative px-2 py-0.5 rounded-full shadow-lg border-2 border-white bg-purple-600 text-white font-bold text-[9px] flex items-center gap-1 transition-transform group-hover:scale-110">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span class="whitespace-nowrap">${stnId}</span>
                </div>
              </div>
            </div>
          `;
          const icon = L.divIcon({
            className: 'custom-cors-marker',
            html: customHtml,
            iconSize: [24, 24],
          });
          return L.marker(latlng, { icon });
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties || {};
          const featTitle =
            props.name ||
            props.title ||
            props.village_name ||
            props.station_id ||
            props.project_id ||
            'Government Infrastructure Asset';

          const agency = props.implementing_agency || props.agency || result.metadata.agency;
          const status = props.status || props.operational_status || 'Active';
          const length = props.length_km ? `${props.length_km} km` : null;
          const area = props.land_acquired_hectares
            ? `${props.land_acquired_hectares} ha`
            : props.area_acres
              ? `${props.area_acres} acres`
              : null;

          const tooltipContent = `
            <div class="p-2 font-sans text-xs max-w-xs">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="w-2.5 h-2.5 rounded-full shadow-xs" style="background-color: ${feedColor}"></span>
                <span class="font-bold text-slate-900">${featTitle}</span>
              </div>
              <div class="text-[10px] text-slate-500 font-medium">${agency} &bull; <span class="capitalize">${String(status).replace(/_/g, ' ')}</span></div>
              ${
                length || area
                  ? `<div class="mt-1 text-[11px] font-semibold text-emerald-700">${length ? `Length: ${length}` : `Area: ${area}`}</div>`
                  : ''
              }
              <div class="mt-1.5 text-[9px] font-semibold text-indigo-700 flex items-center gap-1">
                <span>Click to inspect Gov GeoJSON dossier</span>
              </div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            sticky: true,
            className: 'custom-leaflet-tooltip shadow-xl border border-slate-300 rounded-xl',
          });

          layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setInspectedGeoJsonFeature({
              feature,
              feedSource: result.metadata.sourceLabel,
            });
          });
        },
      });

      geoJsonFeedsGroupRef.current?.addLayer(geoLayer);
    });
  }, [activeFeedIds, feedResults]);

  // Feed Management Handlers
  const handleToggleFeed = (feedId: string) => {
    setActiveFeedIds((prev) =>
      prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]
    );
  };

  const handleRefreshFeed = async (feedId: string) => {
    setIsSyncingFeeds(true);
    try {
      const updated = await spatialDataService.fetchSpatialDataset(feedId, { forceRefresh: true });
      setFeedResults((prev) => ({ ...prev, [feedId]: updated }));
    } finally {
      setIsSyncingFeeds(false);
    }
  };

  const handleRefreshAllFeeds = async () => {
    setIsSyncingFeeds(true);
    try {
      const promises = activeFeedIds.map((id) =>
        spatialDataService.fetchSpatialDataset(id, { forceRefresh: true })
      );
      const results = await Promise.all(promises);
      const updatedMap: Record<string, SpatialFeedResult> = {};
      results.forEach((r) => {
        updatedMap[r.metadata.id] = r;
      });
      setFeedResults((prev) => ({ ...prev, ...updatedMap }));
    } finally {
      setIsSyncingFeeds(false);
    }
  };

  const handleFlyToFeed = (feedId: string) => {
    const result = feedResults[feedId];
    if (!result || !mapInstanceRef.current) return;
    try {
      const tempLayer = L.geoJSON(result.geoJson as any);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 12,
          animate: true,
        });
      }
    } catch (e) {
      console.error('Failed to zoom to feed bounds:', e);
    }
  };

  const handleImportCustomGeoJson = (geoJson: GeoJSONFeatureCollection, title: string) => {
    const customId = `custom_${Date.now()}`;
    const customFeed: SpatialFeedResult = {
      metadata: {
        id: customId,
        title: title || 'Custom Spatial Dataset',
        shortTitle: title.slice(0, 18),
        source: 'custom_upload',
        sourceLabel: 'Imported GeoJSON',
        ministry: 'Custom Ingestion',
        agency: 'User Spatial Upload',
        endpointUrl: '',
        dataFormat: 'GeoJSON',
        category: 'highways',
        refreshIntervalSec: 0,
        description: 'Locally imported or streamed GeoJSON layer.',
        defaultColor: '#ec4899', // Pink
        geometryType: 'Polygon',
      },
      geoJson,
      telemetry: {
        feedId: customId,
        status: 'live',
        latencyMs: 5,
        featureCount: geoJson.features?.length || 0,
        lastUpdated: new Date().toLocaleTimeString(),
        dataSource: 'live_network',
      },
    };

    setFeedResults((prev) => ({ ...prev, [customId]: customFeed }));
    setActiveFeedIds((prev) => [...prev, customId]);

    if (mapInstanceRef.current) {
      try {
        const tempLayer = L.geoJSON(geoJson as any);
        const bounds = tempLayer.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], animate: true });
        }
      } catch {}
    }
  };

  const handleZoomToInspectedFeature = () => {
    if (!inspectedGeoJsonFeature || !mapInstanceRef.current) return;
    try {
      const tempLayer = L.geoJSON(inspectedGeoJsonFeature.feature);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 14,
          animate: true,
        });
      }
    } catch {}
  };

  // Update Polygon Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayersGroupRef.current) return;

    polygonLayersGroupRef.current.clearLayers();

    filteredParcels.forEach((parcel) => {
      const isSelected = parcel.id === selectedParcelId;
      const colors = getStatusColor(parcel.status);

      const polygon = L.polygon(parcel.coordinates, {
        color: isSelected ? '#ffffff' : colors.border,
        weight: isSelected ? 3.5 : 2,
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.65 : 0.4,
        dashArray: isSelected ? '4, 4' : undefined,
      });

      // Tooltip on hover
      const tooltipContent = `
        <div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-900">${parcel.title}</div>
          <div class="text-[11px] text-slate-500">${parcel.parcelNumber}</div>
          <div class="mt-1 flex items-center gap-2">
            <span class="font-semibold text-emerald-700">${parcel.areaHectares} ha</span>
            <span class="text-slate-400">|</span>
            <span class="capitalize text-slate-600">${parcel.status.replace('_', ' ')}</span>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'custom-leaflet-tooltip shadow-lg border border-slate-200 rounded-lg',
      });

      polygon.on('click', () => {
        onSelectParcel(parcel);
      });

      polygonLayersGroupRef.current?.addLayer(polygon);

      // Centroid label if enabled
      if (showLabels) {
        const labelIcon = L.divIcon({
          className: 'custom-map-label',
          html: `
            <div style="transform: translate(-50%, -50%);" class="pointer-events-none flex flex-col items-center">
              <span class="px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur text-white text-[10px] font-bold shadow-md tracking-tight whitespace-nowrap border border-white/20">
                ${parcel.parcelNumber}
              </span>
              <span class="text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                ${parcel.areaHectares} ha
              </span>
            </div>
          `,
          iconSize: [0, 0],
        });

        const labelMarker = L.marker(parcel.center, {
          icon: labelIcon,
          interactive: false,
        });

        polygonLayersGroupRef.current?.addLayer(labelMarker);
      }
    });
  }, [filteredParcels, selectedParcelId, showLabels]);

  // Update Field Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayersGroupRef.current) return;

    markerLayersGroupRef.current.clearLayers();

    if (!showMarkers) return;

    markers.forEach((marker) => {
      let iconHtml = '';
      let bgColor = 'bg-amber-500';

      switch (marker.type) {
        case 'borehole':
          bgColor = 'bg-blue-600';
          iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-500/30 text-[10px] font-bold">BH</div>`;
          break;
        case 'boundary_peg':
          bgColor = 'bg-amber-500';
          iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-500/30 text-[10px] font-bold">BP</div>`;
          break;
        case 'checkpoint':
          bgColor = 'bg-rose-600';
          iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-500/30 text-[10px] font-bold">CP</div>`;
          break;
        case 'environmental':
          bgColor = 'bg-emerald-600';
          iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-500/30 text-[10px] font-bold">ENV</div>`;
          break;
        case 'site_office':
          bgColor = 'bg-indigo-600';
          iconHtml = `<div class="w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-indigo-500/30 text-[10px] font-bold">HQ</div>`;
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-field-marker',
        html: `<div style="transform: translate(-50%, -50%); cursor: pointer;">${iconHtml}</div>`,
        iconSize: [24, 24],
      });

      const leafletMarker = L.marker(marker.position, { icon: customIcon });

      const markerTooltip = `
        <div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-900">${marker.title}</div>
          <div class="text-[10px] text-slate-500">Type: ${marker.type.toUpperCase()} | Elev: ${marker.elevationMeters}m</div>
          <p class="mt-1 text-[11px] text-slate-700">${marker.notes}</p>
          <div class="mt-1 text-[9px] text-slate-400">By ${marker.recordedBy}</div>
        </div>
      `;

      leafletMarker.bindTooltip(markerTooltip, {
        className: 'custom-leaflet-tooltip shadow-lg border border-slate-200 rounded-lg',
      });

      leafletMarker.on('click', () => {
        if (onSelectMarker) onSelectMarker(marker);
      });

      markerLayersGroupRef.current?.addLayer(leafletMarker);
    });
  }, [markers, showMarkers]);

  // Zoom to selected parcel if ID changes
  useEffect(() => {
    if (!selectedParcelId || !mapInstanceRef.current) return;
    const target = parcels.find((p) => p.id === selectedParcelId);
    if (target && target.coordinates.length > 0) {
      const bounds = calculateBounds(target.coordinates);
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [selectedParcelId]);

  // Render Real-Time Geofence Surveyor & Target Parcel Boundary
  useEffect(() => {
    if (!mapInstanceRef.current || !geofenceLayersGroupRef.current) return;

    geofenceLayersGroupRef.current.clearLayers();

    if (!isGeofenceActive) return;

    // 1. Highlight Assigned Parcel Boundary
    if (assignedParcel && assignedParcel.coordinates.length >= 3) {
      const isInside = boundaryStatus === 'inside';
      const geofencePolygon = L.polygon(assignedParcel.coordinates, {
        color: isInside ? '#10b981' : '#f59e0b',
        weight: 3.5,
        fillColor: isInside ? '#10b981' : '#f59e0b',
        fillOpacity: isInside ? 0.25 : 0.12,
        dashArray: '6, 6',
      });

      const geofenceTooltip = `
        <div class="p-1.5 font-sans text-xs">
          <div class="flex items-center gap-1.5 font-bold ${isInside ? 'text-emerald-700' : 'text-amber-700'}">
            <span class="w-2 h-2 rounded-full ${isInside ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}"></span>
            <span>ACTIVE GEOFENCE TARGET</span>
          </div>
          <div class="font-bold text-slate-900 mt-1">${assignedParcel.title} (${assignedParcel.parcelNumber})</div>
          <div class="text-[11px] text-slate-600 mt-0.5">Status: <strong class="uppercase">${boundaryStatus}</strong> &bull; Area: ${assignedParcel.areaHectares} ha</div>
          <div class="text-[10px] text-slate-500 mt-1">Click map anywhere in Simulator mode to test boundary crossings</div>
        </div>
      `;
      geofencePolygon.bindTooltip(geofenceTooltip, {
        sticky: true,
        className: 'custom-leaflet-tooltip shadow-xl border border-slate-300 rounded-xl',
      });

      geofenceLayersGroupRef.current.addLayer(geofencePolygon);

      // Connector line from surveyor to nearest boundary perimeter point
      if (currentPosition && nearestBoundaryPoint && !isInside) {
        const line = L.polyline([[currentPosition.lat, currentPosition.lng], nearestBoundaryPoint], {
          color: '#f59e0b',
          weight: 2,
          dashArray: '4, 4',
          opacity: 0.85,
        });

        line.bindTooltip(`${distanceToBoundary}m to perimeter`, {
          permanent: true,
          direction: 'center',
          className: 'bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 shadow-xs',
        });

        geofenceLayersGroupRef.current.addLayer(line);
      }
    }

    // 2. Render Surveyor Marker
    if (currentPosition) {
      const isInside = boundaryStatus === 'inside';

      // Accuracy circle
      if (currentPosition.accuracy && currentPosition.accuracy > 0) {
        const accuracyCircle = L.circle([currentPosition.lat, currentPosition.lng], {
          radius: currentPosition.accuracy,
          color: isInside ? '#10b981' : '#3b82f6',
          weight: 1.5,
          fillColor: isInside ? '#10b981' : '#3b82f6',
          fillOpacity: 0.15,
          dashArray: '2, 3',
        });
        geofenceLayersGroupRef.current.addLayer(accuracyCircle);
      }

      // Surveyor Pulse Marker Icon
      const surveyorIcon = L.divIcon({
        className: 'custom-surveyor-marker',
        html: `
          <div style="transform: translate(-50%, -50%); cursor: pointer;" class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full ${isInside ? 'bg-emerald-400' : 'bg-blue-400'} opacity-50 animate-ping"></span>
            <span class="absolute inline-flex h-5 w-5 rounded-full ${isInside ? 'bg-emerald-300' : 'bg-blue-300'} opacity-75"></span>
            <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-xl ${isInside ? 'bg-emerald-600' : 'bg-blue-600'} flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.2 rounded-full text-[9px] font-bold shadow-md whitespace-nowrap border border-white ${isInside ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}">
              ${isInside ? 'IN BOUNDARY' : 'SURVEYOR'}
            </div>
          </div>
        `,
        iconSize: [24, 24],
      });

      const surveyorMarker = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: surveyorIcon,
        zIndexOffset: 1000,
      });

      surveyorMarker.bindPopup(`
        <div class="p-2 font-sans text-xs max-w-xs">
          <div class="flex items-center gap-1.5 font-bold ${isInside ? 'text-emerald-700' : 'text-blue-700'}">
            <span class="w-2.5 h-2.5 rounded-full ${isInside ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
            <span>MOBILE SURVEYOR GEOFENCE</span>
          </div>
          <div class="mt-1 text-slate-700 space-y-0.5">
            <div>Boundary Status: <strong class="uppercase ${isInside ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}">${boundaryStatus}</strong></div>
            <div>Distance to perimeter: <strong>${distanceToBoundary}m</strong></div>
            <div>GPS Accuracy: <strong>±${Math.round(currentPosition.accuracy)}m</strong></div>
            <div class="font-mono text-[10px] text-slate-500 mt-1">Coords: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}</div>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
            Mode: <strong>${trackingMode === 'gps' ? 'Live Mobile GPS' : 'Field Simulator'}</strong>
          </div>
        </div>
      `);

      geofenceLayersGroupRef.current.addLayer(surveyorMarker);
    }
  }, [
    isGeofenceActive,
    assignedParcel,
    currentPosition,
    boundaryStatus,
    distanceToBoundary,
    nearestBoundaryPoint,
    trackingMode,
  ]);

  // Quick jump to a specific project corridor
  const handleSelectProjectCorridor = (corridor: MapProjectCorridor | null) => {
    setSelectedProject(corridor);
    setIsProjectMenuOpen(false);

    if (!mapInstanceRef.current) return;

    if (corridor) {
      setActiveCorridorFilter(corridor.id);
      const tempLine = L.polyline(corridor.coordinates);
      mapInstanceRef.current.fitBounds(tempLine.getBounds(), {
        padding: [60, 60],
        maxZoom: 12,
        animate: true,
      });
    } else {
      setActiveCorridorFilter('all');
      // Zoom out to cover all project corridors across India
      const allProjectCoords = NATIONAL_PROJECT_CORRIDORS.flatMap((c) => c.coordinates);
      const bounds = calculateBounds(allProjectCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  // Zoom to all parcels
  const handleZoomToFit = () => {
    if (!mapInstanceRef.current) return;
    if (parcels.length > 0) {
      const allCoords = parcels.flatMap((p) => p.coordinates);
      const bounds = calculateBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    } else {
      const allProjectCoords = NATIONAL_PROJECT_CORRIDORS.flatMap((c) => c.coordinates);
      const bounds = calculateBounds(allProjectCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-175px)] min-h-[520px] bg-slate-950 overflow-hidden flex flex-col" role="region" aria-label="Interactive GIS Cadastral Map View">
      {/* Screen reader live updates announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {mapAnnouncement}
      </div>

      {/* Map Leaflet Canvas */}
      <div
        id="leaflet-map-canvas"
        ref={mapContainerRef}
        className="w-full h-full z-0 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
        tabIndex={0}
        role="application"
        aria-label="Interactive Cadastral GIS Map displaying agricultural, commercial, industrial parcels, and national infrastructure corridors"
        aria-describedby="map-keyboard-instructions"
      />
      <div id="map-keyboard-instructions" className="sr-only">
        Interactive map canvas. Keyboard users can use the map controls in the toolbar to change base imagery, select national corridors, filter parcels by status or zoning, toggle parcel centroid labels, toggle survey markers, and zoom or fit the view.
      </div>

      {/* Top Floating Control Bar */}
      <div
        className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-3"
        role="toolbar"
        aria-label="Map Tools, Corridors and Spatial Layers"
      >
        {/* Left Side: Filter Chips, National Projects & Imagery Toggles */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl shadow-xl border border-slate-200">
          {/* Base Layer Imagery Selector */}
          <div className="relative">
            <button
              id="btn-map-layers"
              onClick={() => {
                setIsLayerMenuOpen(!isLayerMenuOpen);
                setIsFilterMenuOpen(false);
                setIsProjectMenuOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={isLayerMenuOpen}
              aria-controls="map-layers-menu"
              aria-label={`Base Map Imagery: currently ${MAP_LAYERS.find((l) => l.id === activeLayerId)?.name}. Click to change layer.`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Change Map Tile Imagery"
            >
              <Layers className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{MAP_LAYERS.find((l) => l.id === activeLayerId)?.name.split(' ')[0]}</span>
            </button>

            {isLayerMenuOpen && (
              <div
                id="map-layers-menu"
                role="menu"
                aria-label="Base Map Layers"
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30"
              >
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Base Map Layers
                </div>
                {MAP_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    role="menuitemradio"
                    aria-checked={activeLayerId === layer.id}
                    aria-label={`Select ${layer.name} base layer`}
                    onClick={() => {
                      setActiveLayerId(layer.id);
                      setIsLayerMenuOpen(false);
                      setMapAnnouncement(`Map base layer changed to ${layer.name}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition ${
                      activeLayerId === layer.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{layer.name}</span>
                    {activeLayerId === layer.id && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* National Infrastructure Projects Dropdown & Fly-To */}
          <div className="relative">
            <button
              id="btn-national-projects-menu"
              onClick={() => {
                setIsProjectMenuOpen(!isProjectMenuOpen);
                setIsLayerMenuOpen(false);
                setIsFilterMenuOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={isProjectMenuOpen}
              aria-controls="national-projects-menu"
              aria-label={`National Infrastructure Projects and Corridors: currently ${
                selectedProject
                  ? selectedProject.shortName
                  : `All National Projects (${NATIONAL_PROJECT_CORRIDORS.length})`
              }. Click to open menu.`}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                showProjects
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
              title="National Infrastructure Projects & Corridors"
            >
              <Route className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>
                {selectedProject
                  ? selectedProject.shortName
                  : `National Projects (${NATIONAL_PROJECT_CORRIDORS.length})`}
              </span>
              <ChevronDown className="w-3 h-3 text-indigo-500" aria-hidden="true" />
            </button>

            {isProjectMenuOpen && (
              <div
                id="national-projects-menu"
                role="menu"
                aria-label="National Infrastructure Corridors"
                className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-30 max-h-[420px] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-900">National Corridors GIS</span>
                  </div>
                  <button
                    onClick={() => {
                      const next = !showProjects;
                      setShowProjects(next);
                      setMapAnnouncement(next ? 'National corridors shown' : 'National corridors hidden');
                    }}
                    aria-label={showProjects ? 'Hide national corridors overlay' : 'Show national corridors overlay'}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    {showProjects ? 'Hide Corridors' : 'Show Corridors'}
                  </button>
                </div>

                <button
                  role="menuitem"
                  aria-label="View all 8 national projects across India"
                  onClick={() => {
                    handleSelectProjectCorridor(null);
                    setMapAnnouncement('Displaying all 8 national projects across India');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs text-left rounded-lg transition ${
                    activeCorridorFilter === 'all' && !selectedProject
                      ? 'bg-indigo-50 font-bold text-indigo-900'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">All National Projects (View Whole India)</div>
                    <div className="text-[10px] text-slate-500">Show all 8 mega corridors across India</div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
                    8
                  </span>
                </button>

                <div className="mt-1 space-y-1" role="group" aria-label="Individual Project Corridors">
                  {NATIONAL_PROJECT_CORRIDORS.map((corridor) => (
                    <button
                      key={corridor.id}
                      role="menuitem"
                      aria-label={`Select corridor: ${corridor.name}, budget ${corridor.allocatedBudgetCr} crore`}
                      onClick={() => {
                        handleSelectProjectCorridor(corridor);
                        setMapAnnouncement(`Selected corridor ${corridor.name}`);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left rounded-lg transition ${
                        selectedProject?.id === corridor.id
                          ? 'bg-indigo-100/70 border border-indigo-300 font-bold text-indigo-950'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: corridor.color }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate">{corridor.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{corridor.totalLengthKm ? `${corridor.totalLengthKm} km` : 'Rural Abadi'}</span>
                          <span>&bull;</span>
                          <span className="capitalize">{corridor.corridorType.replace('_', ' ')}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-semibold">₹{corridor.allocatedBudgetCr} Cr</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Government Spatial Feeds (ISRO Bhuvan & data.gov.in) */}
          <button
            id="btn-live-spatial-feeds"
            onClick={() => {
              setIsFeedsPanelOpen(true);
              setIsLayerMenuOpen(false);
              setIsProjectMenuOpen(false);
              setIsFilterMenuOpen(false);
              setMapAnnouncement('Opened Live Government Spatial Feeds panel');
            }}
            aria-haspopup="dialog"
            aria-expanded={isFeedsPanelOpen}
            aria-label={`Open Live Government Spatial Feeds panel. ${activeFeedIds.length} feeds active from ISRO Bhuvan and data.gov.in.`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            title="Real-time Spatial Datasets from ISRO Bhuvan & data.gov.in"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">Govt Feeds</span>
            <span className="sm:hidden">Feeds</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
              {activeFeedIds.length}
            </span>
          </button>

          {/* Cadastral Geofencing Monitor HUD Button */}
          <button
            id="btn-map-geofence"
            onClick={() => {
              setIsMonitorModalOpen(true);
              setMapAnnouncement('Opened Cadastral Geofence Telemetry Monitor HUD');
            }}
            aria-label={`Open Cadastral Geofence Monitor HUD. Current status: ${
              !isGeofenceActive
                ? 'Geofence paused'
                : boundaryStatus === 'inside'
                ? `Inside assigned parcel ${assignedParcel?.parcelNumber || ''}`
                : `${distanceToBoundary} meters outside boundary`
            }`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
              !isGeofenceActive
                ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                : boundaryStatus === 'inside'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
            }`}
            title={`Real-Time Cadastral Geofence: ${
              !isGeofenceActive
                ? 'Paused'
                : boundaryStatus === 'inside'
                ? `INSIDE ${assignedParcel?.parcelNumber || 'Parcel'}`
                : `OUTSIDE (${distanceToBoundary}m)`
            }`}
          >
            <Radio
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${
                isGeofenceActive
                  ? boundaryStatus === 'inside'
                    ? 'text-emerald-600 animate-pulse'
                    : 'text-amber-600 animate-pulse'
                  : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Geofence</span>
            <span className="sm:hidden">Fence</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                !isGeofenceActive
                  ? 'bg-slate-200 text-slate-600'
                  : boundaryStatus === 'inside'
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              {!isGeofenceActive
                ? 'Off'
                : boundaryStatus === 'inside'
                ? 'Inside'
                : `${distanceToBoundary}m`}
            </span>
          </button>

          {/* Spatial Filters */}
          <div className="relative">
            <button
              id="btn-map-filters"
              onClick={() => {
                setIsFilterMenuOpen(!isFilterMenuOpen);
                setIsLayerMenuOpen(false);
                setIsProjectMenuOpen(false);
              }}
              aria-haspopup="dialog"
              aria-expanded={isFilterMenuOpen}
              aria-controls="map-spatial-filters-menu"
              aria-label={`Spatial Filters: ${statusFilter !== 'all' || zoningFilter !== 'all' ? 'Active filters applied' : 'No filters applied'}. Click to configure.`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition focus:outline-hidden focus:ring-2 focus:ring-slate-400"
            >
              <Filter className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>Filters {statusFilter !== 'all' || zoningFilter !== 'all' ? '•' : ''}</span>
            </button>

            {isFilterMenuOpen && (
              <div
                id="map-spatial-filters-menu"
                role="dialog"
                aria-label="Spatial Filters Settings"
                className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Spatial Filters</span>
                  {(statusFilter !== 'all' || zoningFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setZoningFilter('all');
                        setMapAnnouncement('Reset all spatial filters to show all parcels');
                      }}
                      aria-label="Reset all spatial filters to default"
                      className="text-[11px] text-rose-600 hover:underline font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="map-cadastre-status-filter" className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Cadastre Status
                    </label>
                    <select
                      id="map-cadastre-status-filter"
                      aria-label="Filter parcels by cadastre status"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setMapAnnouncement(`Filtered parcels by status: ${e.target.value}`);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="all">All Statuses ({parcels.length})</option>
                      <option value="active">Active Parcels</option>
                      <option value="acquired">Acquired Parcels</option>
                      <option value="in_review">In Review</option>
                      <option value="disputed">Disputed Boundaries</option>
                      <option value="survey_pending">Survey Pending</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="map-zoning-category-filter" className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Zoning Category
                    </label>
                    <select
                      id="map-zoning-category-filter"
                      aria-label="Filter parcels by zoning category"
                      value={zoningFilter}
                      onChange={(e) => {
                        setZoningFilter(e.target.value);
                        setMapAnnouncement(`Filtered parcels by zoning: ${e.target.value}`);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="all">All Zoning Categories</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                      <option value="Conservation">Conservation</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => {
              const next = !showLabels;
              setShowLabels(next);
              setMapAnnouncement(next ? 'Parcel centroid labels enabled' : 'Parcel centroid labels hidden');
            }}
            aria-pressed={showLabels}
            aria-label={`Toggle parcel centroid labels on map. Currently ${showLabels ? 'enabled' : 'disabled'}`}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition focus:outline-hidden focus:ring-2 focus:ring-slate-600 ${
              showLabels ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle polygon centroid labels"
          >
            Labels
          </button>

          {/* Toggle Waypoint Markers */}
          <button
            onClick={() => {
              const next = !showMarkers;
              setShowMarkers(next);
              setMapAnnouncement(next ? 'Survey waypoint markers enabled' : 'Survey waypoint markers hidden');
            }}
            aria-pressed={showMarkers}
            aria-label={`Toggle field survey waypoints and CORS markers on map. Currently ${showMarkers ? 'enabled' : 'disabled'}`}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
              showMarkers ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle field survey waypoints & CORS markers"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Markers</span>
          </button>
        </div>

        {/* Right Side: Map Navigation Tools */}
        <div
          className="pointer-events-auto flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-xl border border-slate-200"
          role="group"
          aria-label="Map Zoom and View Controls"
        >
          <button
            onClick={() => {
              mapInstanceRef.current?.zoomIn();
              setMapAnnouncement('Zoomed in map');
            }}
            aria-label="Zoom in map"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              mapInstanceRef.current?.zoomOut();
              setMapAnnouncement('Zoomed out map');
            }}
            aria-label="Zoom out map"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="w-px h-4 bg-slate-200" aria-hidden="true" />
          <button
            onClick={() => {
              handleZoomToFit();
              setMapAnnouncement('Adjusted map view to fit all land parcels and national corridors');
            }}
            aria-label="Fit map view to all land parcels and national corridors"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-100 text-slate-700 transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            title="Fit view to all land parcels and corridors"
          >
            <Compass className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>
      </div>

      {/* Floating Project Dossier Inspector (Active when a project is selected) */}
      {selectedProject && (
        <div
          role="dialog"
          aria-label={`Project Dossier for ${selectedProject.name}`}
          className="absolute bottom-16 left-4 z-20 pointer-events-auto max-w-md w-[calc(100%-2rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                style={{ backgroundColor: selectedProject.color }}
                aria-hidden="true"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {selectedProject.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {selectedProject.code} &bull; {selectedProject.agency}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProject(null);
                setMapAnnouncement('Closed project dossier');
              }}
              aria-label={`Close project dossier for ${selectedProject.name}`}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              title="Close project dossier"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {selectedProject.description}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs" role="region" aria-label="Project Key Metrics">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Total Corridor Length</div>
              <div className="text-sm font-bold text-slate-900">
                {selectedProject.totalLengthKm ? `${selectedProject.totalLengthKm} km` : 'Multi-Cluster'}
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Demarcated Parcels</div>
              <div className="text-sm font-bold text-emerald-700">
                {selectedProject.demarcatedParcels} / {selectedProject.totalParcels}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  ({Math.round((selectedProject.demarcatedParcels / selectedProject.totalParcels) * 100)}%)
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Allocated Budget</div>
              <div className="text-sm font-bold text-slate-900">
                ₹{selectedProject.allocatedBudgetCr} Cr
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Disbursed (PFMS)</div>
              <div className="text-sm font-bold text-blue-700">
                ₹{selectedProject.disbursedBudgetCr} Cr
              </div>
            </div>
          </div>

          {/* Waypoint Chips */}
          <div className="mt-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" id="corridor-stations-label">
              Key Stations & Interchanges:
            </div>
            <div
              className="flex flex-wrap gap-1 max-h-20 overflow-y-auto"
              role="group"
              aria-labelledby="corridor-stations-label"
            >
              {selectedProject.waypoints.map((wp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo(wp.position, 12, { animate: true });
                      setMapAnnouncement(`Map centered on waypoint station: ${wp.name}`);
                    }
                  }}
                  aria-label={`Fly map to waypoint station ${wp.name}`}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                >
                  <MapPin className="w-2.5 h-2.5 text-slate-500" aria-hidden="true" />
                  <span>{wp.name.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action to Lifecycle Tracker */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-500 truncate">
              Gazette: <span className="font-semibold text-slate-700">{selectedProject.gazetteRef}</span>
            </div>
            {onNavigateToLifecycle && (
              <button
                onClick={() => onNavigateToLifecycle(selectedProject.id)}
                aria-label={`Track corridor ${selectedProject.name} in Acquisition Lifecycle Manager`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Track in Lifecycle</span>
                <ExternalLink className="w-3 h-3 ml-0.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Map Legend and Live Coordinate Readout */}
      <div
        className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex flex-wrap items-end justify-between gap-3"
        role="region"
        aria-label="Map Overlays Legend and Real-time Telemetry"
      >
        {/* Cadastre & Project Corridors Legend */}
        <div
          className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-xs flex flex-wrap items-center gap-3"
          role="region"
          aria-label="Symbology Legend"
        >
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            Map Overlays:
          </span>

          {/* Project Corridors mini-legend */}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
            <span className="text-[10px] font-bold text-indigo-800">Corridors:</span>
            <div className="flex items-center gap-1" title="Delhi-Mumbai Expressway">
              <span className="w-3 h-1.5 rounded-full bg-orange-500 inline-block" aria-hidden="true" />
              <span className="text-slate-600 text-[10px]">DME</span>
            </div>
            <div className="flex items-center gap-1" title="Western DFC Freight Rail">
              <span className="w-3 h-1.5 rounded-full bg-blue-600 inline-block" aria-hidden="true" />
              <span className="text-slate-600 text-[10px]">WDFC</span>
            </div>
            <div className="flex items-center gap-1" title="Mumbai-Ahmedabad Bullet Train">
              <span className="w-3 h-1.5 rounded-full bg-emerald-600 inline-block" aria-hidden="true" />
              <span className="text-slate-600 text-[10px]">Bullet Train</span>
            </div>
            <div className="flex items-center gap-1" title="Eastern DFC Freight Rail">
              <span className="w-3 h-1.5 rounded-full bg-sky-500 inline-block" aria-hidden="true" />
              <span className="text-slate-600 text-[10px]">EDFC</span>
            </div>
            <div className="flex items-center gap-1" title="Bengaluru-Chennai Expressway">
              <span className="w-3 h-1.5 rounded-full bg-purple-500 inline-block" aria-hidden="true" />
              <span className="text-slate-600 text-[10px]">NE-7</span>
            </div>
          </div>

          {/* Live Govt Spatial Feeds Indicator */}
          {activeFeedIds.length > 0 && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Live Govt Feeds:
              </span>
              <span className="text-slate-600 text-[10px]">
                {activeFeedIds.length} active (Bhuvan/OGD)
              </span>
            </div>
          )}

          {/* Cadastre Statuses */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Parcels:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-700 inline-block" aria-hidden="true" />
              <span className="text-slate-700 text-[10px]">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 border border-blue-700 inline-block" aria-hidden="true" />
              <span className="text-slate-700 text-[10px]">Acquired</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 border border-amber-700 inline-block" aria-hidden="true" />
              <span className="text-slate-700 text-[10px]">In Review</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 border border-rose-700 inline-block" aria-hidden="true" />
              <span className="text-slate-700 text-[10px]">Disputed</span>
            </div>
          </div>
        </div>

        {/* Real-Time Geofence Telemetry Mini Chip */}
        <button
          id="btn-map-geofence-mini-chip"
          onClick={() => {
            setIsMonitorModalOpen(true);
            setMapAnnouncement('Opened Cadastral Geofence Telemetry Monitor HUD');
          }}
          aria-label={`Cadastral Geofence Telemetry: ${
            !isGeofenceActive
              ? 'Paused'
              : boundaryStatus === 'inside'
              ? `Inside assigned parcel ${assignedParcel?.parcelNumber || ''}`
              : `${distanceToBoundary} meters outside boundary`
          }. Click to open full telemetry monitor.`}
          className={`pointer-events-auto px-3 py-1.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 ${
            !isGeofenceActive
              ? 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800/90'
              : boundaryStatus === 'inside'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-900/20 hover:bg-emerald-900/90'
              : 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-900/20 hover:bg-amber-900/90'
          }`}
          title="Click to open full Cadastral Geofence Telemetry HUD"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {isGeofenceActive && (
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  boundaryStatus === 'inside' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                !isGeofenceActive
                  ? 'bg-slate-400'
                  : boundaryStatus === 'inside'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-mono text-[11px]">
            {!isGeofenceActive
              ? 'GEOFENCE PAUSED'
              : boundaryStatus === 'inside'
              ? `INSIDE ${assignedParcel?.parcelNumber || 'PARCEL'}`
              : `${distanceToBoundary}m OUTSIDE`}
          </span>
          <span className="text-[10px] text-slate-400 font-sans hidden md:inline">
            ({trackingMode === 'gps' ? 'GPS' : 'Sim'})
          </span>
        </button>

        {/* Live Coordinate Cursor Readout with proper East/West notation */}
        <div
          role="status"
          aria-live="off"
          aria-label={`Current geospatial cursor coordinates: ${
            cursorCoords
              ? `${Math.abs(cursorCoords.lat).toFixed(4)} degrees ${cursorCoords.lat >= 0 ? 'North' : 'South'}, ${Math.abs(cursorCoords.lng).toFixed(4)} degrees ${cursorCoords.lng >= 0 ? 'East' : 'West'}`
              : '21.7679 degrees North, 78.8718 degrees East'
          }`}
          className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-white font-mono text-[11px] flex items-center gap-2"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
          <span>
            {cursorCoords
              ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(cursorCoords.lng).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
              : '21.7679° N, 78.8718° E'}
          </span>
          <span className="text-slate-400 font-sans text-[10px] hidden sm:inline">WGS84 EPSG:4326</span>
        </div>
      </div>

      {/* Floating Spatial Feature Dossier for Bhuvan & data.gov.in Features */}
      {inspectedGeoJsonFeature && (
        <SpatialFeatureDossier
          feature={inspectedGeoJsonFeature.feature}
          feedSource={inspectedGeoJsonFeature.feedSource}
          onClose={() => setInspectedGeoJsonFeature(null)}
          onZoomToFeature={handleZoomToInspectedFeature}
        />
      )}

      {/* Live Government Spatial Feeds Panel & Ingestion Modal */}
      <LiveSpatialFeedsPanel
        isOpen={isFeedsPanelOpen}
        onClose={() => setIsFeedsPanelOpen(false)}
        activeFeedIds={activeFeedIds}
        feedResults={feedResults}
        isSyncing={isSyncingFeeds}
        onToggleFeed={handleToggleFeed}
        onRefreshFeed={handleRefreshFeed}
        onRefreshAll={handleRefreshAllFeeds}
        onFlyToFeed={handleFlyToFeed}
        onImportCustomGeoJson={handleImportCustomGeoJson}
      />
    </div>
  );
};

