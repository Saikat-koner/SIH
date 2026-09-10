// Spatial and GIS Utility Functions
import { formatMoney, CurrencyCode } from './currency';

/**
 * Calculates polygon area in square meters and converts to hectares and acres
 * using the Shoelace formula projected with spherical latitude adjustments.
 */
export function calculatePolygonArea(coords: [number, number][]): { hectares: number; acres: number } {
  if (coords.length < 3) {
    return { hectares: 0, acres: 0 };
  }

  const radius = 6378137; // Earth's mean radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const p1 = coords[i];
    const p2 = coords[j];

    // Convert degrees to radians
    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lon1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[1] * Math.PI) / 180;

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * radius * radius) / 2.0);

  const hectares = Number((area / 10000).toFixed(2));
  const acres = Number((hectares * 2.47105).toFixed(2));

  return { hectares, acres };
}

/**
 * Calculates geometric center/centroid of polygon
 */
export function calculateCentroid(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];

  let sumLat = 0;
  let sumLng = 0;

  coords.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });

  return [
    Number((sumLat / coords.length).toFixed(6)),
    Number((sumLng / coords.length).toFixed(6)),
  ];
}

/**
 * Calculates bounding box [minLat, minLng, maxLat, maxLng]
 */
export function calculateBounds(coords: [number, number][]): [[number, number], [number, number]] {
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  coords.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return [
    [minLat - 0.001, minLng - 0.001],
    [maxLat + 0.001, maxLng + 0.001],
  ];
}

export function formatHectares(ha: number): string {
  return `${ha.toLocaleString()} ha`;
}

export function formatAcres(ac: number): string {
  return `${ac.toLocaleString()} ac`;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: { compact?: boolean; inrMode?: 'lakhs_crores' | 'full' }
): string {
  return formatMoney(amount, currency, options);
}

export function formatCoordinates(coords: [number, number]): string {
  return `${coords[0].toFixed(5)}° N, ${coords[1].toFixed(5)}° W`;
}

/**
 * Generates valid GeoJSON FeatureCollection from LandParcel list
 */
export function parcelsToGeoJSON(parcels: any[]): any {
  return {
    type: 'FeatureCollection',
    features: parcels.map((p) => ({
      type: 'Feature',
      id: p.id,
      properties: {
        parcelNumber: p.parcelNumber,
        title: p.title,
        status: p.status,
        zoning: p.zoning,
        owner: p.owner,
        valuationUSD: p.valuationUSD,
        areaHectares: p.areaHectares,
        soilType: p.soilType,
      },
      geometry: {
        type: 'Polygon',
        // GeoJSON uses [longitude, latitude] order
        coordinates: [p.coordinates.map(([lat, lng]: [number, number]) => [lng, lat])],
      },
    })),
  };
}
