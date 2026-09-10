import { LandParcel, GeofenceBoundaryStatus, GeofenceEvent, GeofencePosition } from '../types';

/**
 * High-precision Ray-Casting (Jordan Curve Theorem) Point-in-Polygon Algorithm.
 * Returns true if [lat, lng] is strictly within the polygon boundary.
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const [lat, lng] = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // Check if the ray intersects with the polygon edge
    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}

/**
 * Calculates geodesic distance between two [lat, lng] points using Haversine formula (in meters).
 */
export function haversineDistanceMeters(
  point1: [number, number],
  point2: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((point2[0] - point1[0]) * Math.PI) / 180;
  const dLng = ((point2[1] - point1[1]) * Math.PI) / 180;

  const lat1 = (point1[0] * Math.PI) / 180;
  const lat2 = (point2[0] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Projects a point onto a line segment and calculates the closest point and distance in meters.
 */
function distanceToSegmentMeters(
  p: [number, number],
  v: [number, number],
  w: [number, number]
): { distance: number; nearest: [number, number] } {
  // Approximate projection in Cartesian coordinates using localized scale factor
  const cosLat = Math.cos((p[0] * Math.PI) / 180);
  const px = p[1] * cosLat;
  const py = p[0];
  const vx = v[1] * cosLat;
  const vy = v[0];
  const wx = w[1] * cosLat;
  const wy = w[0];

  const l2 = (wx - vx) * (wx - vx) + (wy - vy) * (wy - vy);
  if (l2 === 0) {
    return {
      distance: haversineDistanceMeters(p, v),
      nearest: v,
    };
  }

  let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
  t = Math.max(0, Math.min(1, t));

  const nearestLng = (vx + t * (wx - vx)) / cosLat;
  const nearestLat = vy + t * (wy - vy);
  const nearest: [number, number] = [nearestLat, nearestLng];

  return {
    distance: haversineDistanceMeters(p, nearest),
    nearest,
  };
}

/**
 * Calculates shortest distance from point to polygon perimeter in meters.
 */
export function distanceToPolygonPerimeter(
  point: [number, number],
  polygon: [number, number][]
): { distanceMeters: number; nearestPoint: [number, number]; isInside: boolean } {
  if (!polygon || polygon.length < 3) {
    return { distanceMeters: 0, nearestPoint: point, isInside: false };
  }

  const isInside = isPointInPolygon(point, polygon);
  let minDistance = Infinity;
  let nearestPoint: [number, number] = polygon[0];

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const seg = distanceToSegmentMeters(point, polygon[i], polygon[j]);
    if (seg.distance < minDistance) {
      minDistance = seg.distance;
      nearestPoint = seg.nearest;
    }
  }

  return {
    distanceMeters: Math.round(minDistance * 10) / 10,
    nearestPoint,
    isInside,
  };
}

/**
 * Plays a pleasant web-audio chime for entry (major chord arpeggio) or exit (descending alert)
 */
export function playGeofenceAudioAlert(type: 'entered' | 'exited'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'entered') {
      // Ascending triumphant dual chime (523.25Hz C5 -> 659.25Hz E5 -> 783.99Hz G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.38);
      });
    } else {
      // Descending warning alert (698.46Hz F5 -> 587.33Hz D5 -> 440.00Hz A4)
      const freqs = [698.46, 587.33, 440.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.45);
      });
    }
  } catch (err) {
    console.debug('Web Audio alert skipped:', err);
  }
}

/**
 * Checks current browser Notification API permission state safely.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

/**
 * Requests browser notification permissions from the user.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    // In modern browsers, requestPermission returns a Promise
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Notification permission request failed (may be inside restricted iframe):', err);
    return 'unsupported';
  }
}

/**
 * Triggers a real-time browser notification when entering or exiting a geofenced LandParcel.
 */
export function triggerGeofenceNotification(
  type: 'entered' | 'exited',
  parcel: LandParcel,
  telemetry: {
    accuracy: number;
    distanceMeters: number;
    position: [number, number];
  }
): boolean {
  // Always play audio feedback
  playGeofenceAudioAlert(type);

  const isEntered = type === 'entered';
  const title = isEntered
    ? `📍 ENTERED GEOFENCE: ${parcel.title}`
    : `⚠️ EXITED GEOFENCE: ${parcel.title}`;

  const accuracyText = telemetry.accuracy > 0 ? `(GPS Accuracy: ±${Math.round(telemetry.accuracy)}m)` : '';
  const body = isEntered
    ? `You have crossed INTO the boundary coordinates of Land Parcel ${parcel.parcelNumber} (${parcel.areaHectares} ha). Owner: ${parcel.owner}. ${accuracyText}`
    : `You have stepped OUTSIDE the boundary coordinates of Land Parcel ${parcel.parcelNumber}. Distance from perimeter: ${telemetry.distanceMeters}m.`;

  // Attempt Web Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `geofence-${parcel.id}-${type}`,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return true;
      }
    } catch (err) {
      console.warn('Browser Notification delivery failed:', err);
    }
  }

  return false;
}

/**
 * Generates an interpolated simulation path from an outside point into the parcel centroid
 */
export function generateSimulationWalkPath(
  parcel: LandParcel,
  steps = 8
): [number, number][] {
  const [centerLat, centerLng] = parcel.center;
  // Start outside to the South-West of the parcel
  const startLat = centerLat - 0.0035;
  const startLng = centerLng - 0.0035;

  const path: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Step towards and past the center
    const lat = startLat + fraction * (centerLat - startLat) * 1.3;
    const lng = startLng + fraction * (centerLng - startLng) * 1.3;
    path.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  return path;
}
