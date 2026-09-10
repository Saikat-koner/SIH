import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  LandParcel,
  GeofenceBoundaryStatus,
  GeofenceEvent,
  GeofencePosition,
  NotificationItem,
} from '../types';
import {
  isPointInPolygon,
  distanceToPolygonPerimeter,
  getNotificationPermission,
  requestBrowserNotificationPermission,
  triggerGeofenceNotification,
  generateSimulationWalkPath,
} from '../lib/geofencing';

interface GeofenceContextType {
  assignedParcel: LandParcel | null;
  setAssignedParcel: (parcel: LandParcel | null) => void;
  isGeofenceActive: boolean;
  setIsGeofenceActive: (active: boolean) => void;
  trackingMode: 'gps' | 'simulation';
  setTrackingMode: (mode: 'gps' | 'simulation') => void;
  currentPosition: GeofencePosition | null;
  boundaryStatus: GeofenceBoundaryStatus;
  distanceToBoundary: number;
  nearestBoundaryPoint: [number, number] | null;
  eventsLog: GeofenceEvent[];
  clearEventsLog: () => void;
  simulatePosition: (coords: [number, number]) => void;
  simulateStepInside: () => void;
  simulateStepOutside: () => void;
  runSimulationWalk: () => void;
  isWalking: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isMonitorModalOpen: boolean;
  setIsMonitorModalOpen: (open: boolean) => void;
}

const GeofenceContext = createContext<GeofenceContextType | null>(null);

interface GeofenceProviderProps {
  children: React.ReactNode;
  parcels: LandParcel[];
  onAddNotification?: (notif: NotificationItem) => void;
}

export const GeofenceProvider: React.FC<GeofenceProviderProps> = ({
  children,
  parcels,
  onAddNotification,
}) => {
  // Assigned parcel
  const [assignedParcel, setAssignedParcelState] = useState<LandParcel | null>(() => {
    // Default to the first active parcel if available
    return parcels.length > 0 ? parcels[0] : null;
  });

  const [isGeofenceActive, setIsGeofenceActive] = useState<boolean>(true);
  const [trackingMode, setTrackingMode] = useState<'gps' | 'simulation'>('simulation');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMonitorModalOpen, setIsMonitorModalOpen] = useState<boolean>(false);
  const [isWalking, setIsWalking] = useState<boolean>(false);

  // Position & Telemetry
  const [currentPosition, setCurrentPosition] = useState<GeofencePosition | null>(() => {
    if (parcels.length > 0) {
      // Initialize near the first parcel
      const [lat, lng] = parcels[0].center;
      return {
        lat: Number((lat - 0.002).toFixed(6)),
        lng: Number((lng - 0.002).toFixed(6)),
        accuracy: 8,
        heading: null,
        speed: null,
        timestamp: Date.now(),
      };
    }
    return null;
  });

  const [boundaryStatus, setBoundaryStatus] = useState<GeofenceBoundaryStatus>('outside');
  const [distanceToBoundary, setDistanceToBoundary] = useState<number>(0);
  const [nearestBoundaryPoint, setNearestBoundaryPoint] = useState<[number, number] | null>(null);

  // Event Log
  const [eventsLog, setEventsLog] = useState<GeofenceEvent[]>(() => {
    try {
      const saved = localStorage.getItem('terragis_geofence_events_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => getNotificationPermission());

  // Ref to track previous status without stale closures
  const prevBoundaryStatusRef = useRef<GeofenceBoundaryStatus>('unknown');
  const watchIdRef = useRef<number | null>(null);
  const walkIntervalRef = useRef<any>(null);

  // Keep saved events updated
  useEffect(() => {
    try {
      localStorage.setItem('terragis_geofence_events_v1', JSON.stringify(eventsLog));
    } catch {}
  }, [eventsLog]);

  // If parcels change and no assigned parcel, assign first
  useEffect(() => {
    if (!assignedParcel && parcels.length > 0) {
      setAssignedParcelState(parcels[0]);
    }
  }, [parcels, assignedParcel]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    return perm;
  }, []);

  // Update assigned parcel
  const setAssignedParcel = useCallback((parcel: LandParcel | null) => {
    setAssignedParcelState(parcel);
    // Reset boundary status tracker for the new parcel
    prevBoundaryStatusRef.current = 'unknown';
  }, []);

  // Process a position against assigned parcel
  const evaluatePosition = useCallback(
    (pos: GeofencePosition, targetParcel: LandParcel | null) => {
      if (!targetParcel || !isGeofenceActive) {
        setBoundaryStatus('unknown');
        setDistanceToBoundary(0);
        return;
      }

      const point: [number, number] = [pos.lat, pos.lng];
      const result = distanceToPolygonPerimeter(point, targetParcel.coordinates);
      const newStatus: GeofenceBoundaryStatus = result.isInside ? 'inside' : 'outside';

      setBoundaryStatus(newStatus);
      setDistanceToBoundary(result.distanceMeters);
      setNearestBoundaryPoint(result.nearestPoint);

      const prevStatus = prevBoundaryStatusRef.current;

      // Detect status transition
      if (prevStatus !== 'unknown' && prevStatus !== newStatus) {
        const eventType = newStatus === 'inside' ? 'entered' : 'exited';

        // 1. Trigger browser notification & sound
        triggerGeofenceNotification(eventType, targetParcel, {
          accuracy: pos.accuracy,
          distanceMeters: result.distanceMeters,
          position: point,
        });

        // 2. Add to event history
        const newEvent: GeofenceEvent = {
          id: `geo_evt_${Date.now()}`,
          parcelId: targetParcel.id,
          parcelTitle: targetParcel.title,
          parcelNumber: targetParcel.parcelNumber,
          type: eventType,
          timestamp: new Date().toLocaleTimeString(),
          coordinates: point,
          accuracy: pos.accuracy,
          distanceMeters: result.distanceMeters,
        };
        setEventsLog((prev) => [newEvent, ...prev.slice(0, 49)]);

        // 3. Add to application notification drawer
        if (onAddNotification) {
          onAddNotification({
            id: `notif_geo_${Date.now()}`,
            title:
              eventType === 'entered'
                ? `📍 Entered Geofence: ${targetParcel.title}`
                : `⚠️ Exited Geofence: ${targetParcel.title}`,
            message:
              eventType === 'entered'
                ? `Mobile surveyor entered boundary of Parcel #${targetParcel.parcelNumber} (${targetParcel.owner}). Accuracy: ±${Math.round(
                    pos.accuracy
                  )}m.`
                : `Mobile surveyor exited boundary of Parcel #${targetParcel.parcelNumber}. Perimeter distance: ${result.distanceMeters}m.`,
            timestamp: 'Just now',
            read: false,
            type: eventType === 'entered' ? 'success' : 'warning',
            parcelId: targetParcel.id,
          });
        }
      }

      prevBoundaryStatusRef.current = newStatus;
    },
    [isGeofenceActive, onAddNotification]
  );

  // Evaluate whenever currentPosition or assignedParcel changes
  useEffect(() => {
    if (currentPosition) {
      evaluatePosition(currentPosition, assignedParcel);
    }
  }, [currentPosition, assignedParcel, evaluatePosition]);

  // Real GPS tracking via navigator.geolocation
  useEffect(() => {
    if (trackingMode !== 'gps' || !isGeofenceActive) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation API is not available on this device');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const newPos: GeofencePosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy || 5,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
      setCurrentPosition(newPos);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn('Geolocation watch error:', error.message);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingMode, isGeofenceActive]);

  // Manual Position Setter (Simulation)
  const simulatePosition = useCallback((coords: [number, number]) => {
    setCurrentPosition({
      lat: Number(coords[0].toFixed(6)),
      lng: Number(coords[1].toFixed(6)),
      accuracy: 3.5,
      heading: 45,
      speed: 1.2,
      timestamp: Date.now(),
    });
  }, []);

  // Simulate Step Inside: sets position to assigned parcel center
  const simulateStepInside = useCallback(() => {
    if (!assignedParcel) return;
    simulatePosition(assignedParcel.center);
  }, [assignedParcel, simulatePosition]);

  // Simulate Step Outside: sets position outside assigned parcel
  const simulateStepOutside = useCallback(() => {
    if (!assignedParcel) return;
    const [lat, lng] = assignedParcel.center;
    simulatePosition([lat - 0.0035, lng - 0.0035]);
  }, [assignedParcel, simulatePosition]);

  // Run continuous walk simulation across boundary
  const runSimulationWalk = useCallback(() => {
    if (!assignedParcel || isWalking) return;

    setIsWalking(true);
    const path = generateSimulationWalkPath(assignedParcel, 10);
    let stepIndex = 0;

    // Clear existing
    if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);

    walkIntervalRef.current = setInterval(() => {
      if (stepIndex >= path.length) {
        clearInterval(walkIntervalRef.current);
        setIsWalking(false);
        return;
      }

      simulatePosition(path[stepIndex]);
      stepIndex++;
    }, 1200);
  }, [assignedParcel, isWalking, simulatePosition]);

  const clearEventsLog = useCallback(() => {
    setEventsLog([]);
    try {
      localStorage.removeItem('terragis_geofence_events_v1');
    } catch {}
  }, []);

  return (
    <GeofenceContext.Provider
      value={{
        assignedParcel,
        setAssignedParcel,
        isGeofenceActive,
        setIsGeofenceActive,
        trackingMode,
        setTrackingMode,
        currentPosition,
        boundaryStatus,
        distanceToBoundary,
        nearestBoundaryPoint,
        eventsLog,
        clearEventsLog,
        simulatePosition,
        simulateStepInside,
        simulateStepOutside,
        runSimulationWalk,
        isWalking,
        notificationPermission,
        requestPermission,
        soundEnabled,
        setSoundEnabled,
        isMonitorModalOpen,
        setIsMonitorModalOpen,
      }}
    >
      {children}
    </GeofenceContext.Provider>
  );
};

export const useGeofence = (): GeofenceContextType => {
  const context = useContext(GeofenceContext);
  if (!context) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
};
