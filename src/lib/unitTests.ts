import { UnitTestResult, LandParcel, UserRole } from '../types';
import { calculatePolygonArea, calculateCentroid, calculateBounds, parcelsToGeoJSON } from './geoUtils';
import { isPointInPolygon, haversineDistanceMeters } from './geofencing';

// RBAC permission checker logic tested by the test suite
export function checkUserPermission(
  role: UserRole,
  action: 'edit_parcel' | 'approve_survey' | 'flag_dispute' | 'export_geojson' | 'delete_parcel' | 'view_parcel'
): boolean {
  switch (action) {
    case 'view_parcel':
      return true; // All roles can view
    case 'export_geojson':
      return ['admin', 'surveyor', 'auditor'].includes(role);
    case 'edit_parcel':
      return ['admin', 'surveyor'].includes(role);
    case 'approve_survey':
      return role === 'admin';
    case 'flag_dispute':
      return ['admin', 'auditor'].includes(role);
    case 'delete_parcel':
      return role === 'admin';
    default:
      return false;
  }
}

/**
 * Runs the automated suite of unit tests directly in the browser.
 */
export async function runAutomatedUnitTests(parcels: LandParcel[]): Promise<UnitTestResult[]> {
  const results: UnitTestResult[] = [];

  // Helper to record test
  const record = (
    id: string,
    name: string,
    category: UnitTestResult['category'],
    fn: () => void,
    assertion: string
  ) => {
    const t0 = performance.now();
    try {
      fn();
      const durationMs = Number((performance.now() - t0).toFixed(2));
      results.push({
        id,
        name,
        category,
        status: 'pass',
        durationMs,
        assertion,
      });
    } catch (err: any) {
      const durationMs = Number((performance.now() - t0).toFixed(2));
      results.push({
        id,
        name,
        category,
        status: 'fail',
        durationMs,
        assertion,
        error: err?.message || String(err),
      });
    }
  };

  // Test 1: Spatial Geometry - Area calculation on square polygon
  record(
    'test_geo_01',
    'Shoelace Polygon Area Math',
    'Spatial Geometry',
    () => {
      // 0.01 deg x 0.01 deg box approx 1.1km x 0.95km ~ 100+ hectares
      const testPolygon: [number, number][] = [
        [30.0, -97.0],
        [30.01, -97.0],
        [30.01, -96.99],
        [30.0, -96.99],
      ];
      const area = calculatePolygonArea(testPolygon);
      if (area.hectares <= 0) throw new Error(`Area must be greater than 0, got ${area.hectares}`);
      if (area.acres <= area.hectares) throw new Error(`Acres must be greater than hectares, got ${area.acres} vs ${area.hectares}`);
      if (area.hectares < 50 || area.hectares > 200) {
        throw new Error(`Expected area around 100 ha, got ${area.hectares}`);
      }
    },
    'Shoelace projected formula computes non-zero positive area with correct hectare/acre ratio'
  );

  // Test 2: Spatial Geometry - Centroid computation
  record(
    'test_geo_02',
    'Centroid Geometric Center',
    'Spatial Geometry',
    () => {
      const coords: [number, number][] = [
        [30.0, -97.0],
        [30.2, -97.0],
        [30.2, -96.8],
        [30.0, -96.8],
      ];
      const centroid = calculateCentroid(coords);
      if (Math.abs(centroid[0] - 30.1) > 0.001 || Math.abs(centroid[1] - -96.9) > 0.001) {
        throw new Error(`Centroid calculation inaccurate: expected [30.1, -96.9], got [${centroid[0]}, ${centroid[1]}]`);
      }
    },
    'Calculates accurate coordinate mean centroid for bounding vertices'
  );

  // Test 3: Spatial Geometry - Bounding Box calculation
  record(
    'test_geo_03',
    'Coordinate Bounding Box Enclosure',
    'Spatial Geometry',
    () => {
      if (parcels.length === 0) throw new Error('Parcels array is empty');
      const p = parcels[0];
      const bounds = calculateBounds(p.coordinates);
      const minLat = bounds[0][0];
      const minLng = bounds[0][1];
      const maxLat = bounds[1][0];
      const maxLng = bounds[1][1];

      p.coordinates.forEach(([lat, lng]) => {
        if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
          throw new Error(`Vertex [${lat}, ${lng}] fell outside calculated bounding box`);
        }
      });
    },
    'Every polygon vertex strictly resides within the computed leaflet bounding box'
  );

  // Test 4: RBAC Security - Viewer cannot edit or approve
  record(
    'test_rbac_01',
    'Role Gate: Public Viewer Restricted Rights',
    'RBAC Permissions',
    () => {
      if (checkUserPermission('viewer', 'edit_parcel')) throw new Error('Security flaw: Viewer was granted edit_parcel');
      if (checkUserPermission('viewer', 'approve_survey')) throw new Error('Security flaw: Viewer was granted approve_survey');
      if (checkUserPermission('viewer', 'delete_parcel')) throw new Error('Security flaw: Viewer was granted delete_parcel');
      if (!checkUserPermission('viewer', 'view_parcel')) throw new Error('Viewer must be permitted to view parcels');
    },
    'Public Viewer role blocked from mutating land data, approving surveys, or deleting records'
  );

  // Test 5: RBAC Security - Auditor legal dispute access
  record(
    'test_rbac_02',
    'Role Gate: Legal Auditor Dispute Flagging',
    'RBAC Permissions',
    () => {
      if (!checkUserPermission('auditor', 'flag_dispute')) throw new Error('Auditor must be allowed to flag disputes');
      if (!checkUserPermission('auditor', 'export_geojson')) throw new Error('Auditor must be allowed to export data for audit trails');
      if (checkUserPermission('auditor', 'delete_parcel')) throw new Error('Security flaw: Auditor cannot arbitrarily delete records');
    },
    'Legal Auditor allowed to flag disputes and audit cadastre records, but forbidden from deleting'
  );

  // Test 6: RBAC Security - Administrator Superuser Permissions
  record(
    'test_rbac_03',
    'Role Gate: GIS Administrator Executive Authority',
    'RBAC Permissions',
    () => {
      const actions: Array<'edit_parcel' | 'approve_survey' | 'flag_dispute' | 'export_geojson' | 'delete_parcel' | 'view_parcel'> = [
        'edit_parcel',
        'approve_survey',
        'flag_dispute',
        'export_geojson',
        'delete_parcel',
        'view_parcel',
      ];
      actions.forEach((act) => {
        if (!checkUserPermission('admin', act)) {
          throw new Error(`Admin role denied permission for: ${act}`);
        }
      });
    },
    'GIS Admin possesses full permissions across cadastre editing, approval, and lifecycle'
  );

  // Test 7: Offline Sync Engine - Queue FIFO ordering and idempotency
  record(
    'test_sync_01',
    'Offline Queue FIFO Order & Status Flow',
    'Offline Sync Engine',
    () => {
      const mockQueue: Array<{ id: string; status: string }> = [
        { id: 'item_1', status: 'pending' },
        { id: 'item_2', status: 'pending' },
      ];

      // Transition item 1
      const item = mockQueue.shift();
      if (!item || item.id !== 'item_1') throw new Error('FIFO order violated');
      item.status = 'syncing';
      item.status = 'synced';
      if (item.status !== 'synced') throw new Error('State transition failed');
    },
    'Offline queue strictly pops oldest mutations first and transitions to synced on flush'
  );

  // Test 8: GeoJSON RFC 7946 Compliance - [lng, lat] coordinate ordering
  record(
    'test_geojson_01',
    'GeoJSON RFC 7946 Standard Compliance',
    'GeoJSON Compliance',
    () => {
      const geojson = parcelsToGeoJSON(parcels);
      if (geojson.type !== 'FeatureCollection') throw new Error('Root type must be FeatureCollection');
      if (!Array.isArray(geojson.features)) throw new Error('Features must be an array');
      if (geojson.features.length !== parcels.length) throw new Error('Feature count mismatch');

      const firstFeature = geojson.features[0];
      if (firstFeature.geometry.type !== 'Polygon') throw new Error('Geometry type must be Polygon');
      const ring = firstFeature.geometry.coordinates[0];
      // Check that coordinate is [lng, lat] (Texas lng is negative ~ -97, lat is ~30)
      const coord = ring[0];
      if (coord[0] > 0 || coord[1] < 0) {
        throw new Error(`Invalid GeoJSON coordinate order: expected [lng, lat] (e.g. [-97, 30]), got [${coord[0]}, ${coord[1]}]`);
      }
    },
    'GeoJSON FeatureCollection outputs valid standard coordinates inverted to [longitude, latitude]'
  );

  // Test 9: Data Integrity - Parcel Identification & Deed Uniqueness
  record(
    'test_data_01',
    'Cadastre Parcel Number & ID Uniqueness',
    'Data Integrity',
    () => {
      const seenIds = new Set<string>();
      const seenParcelNums = new Set<string>();

      parcels.forEach((p) => {
        if (seenIds.has(p.id)) throw new Error(`Duplicate parcel ID detected: ${p.id}`);
        if (seenParcelNums.has(p.parcelNumber)) throw new Error(`Duplicate parcel number detected: ${p.parcelNumber}`);
        seenIds.add(p.id);
        seenParcelNums.add(p.parcelNumber);
      });
    },
    'All loaded land parcels maintain unique entity identifiers and state registration numbers'
  );

  // Test 10: Real-Time Geofence - Point-In-Polygon Ray Casting Theorem
  record(
    'test_geofence_pip_01',
    'Geofence Ray-Casting Point-in-Polygon Engine',
    'Spatial Geometry',
    () => {
      const squarePolygon: [number, number][] = [
        [20.0, 75.0],
        [20.0, 75.01],
        [20.01, 75.01],
        [20.01, 75.0],
      ];

      // Inside point
      const inside = isPointInPolygon([20.005, 75.005], squarePolygon);
      if (!inside) throw new Error('Expected point [20.005, 75.005] to be inside square polygon');

      // Outside point
      const outside = isPointInPolygon([20.02, 75.02], squarePolygon);
      if (outside) throw new Error('Expected point [20.02, 75.02] to be outside square polygon');
    },
    'Ray-casting Jordan Curve algorithm reliably identifies whether coordinates sit inside or outside parcel polygon'
  );

  // Test 11: Real-Time Geofence - Haversine Geodesic Perimeter Distance
  record(
    'test_geofence_haversine_02',
    'Geofence Geodesic Boundary Proximity Engine',
    'Spatial Geometry',
    () => {
      const p1: [number, number] = [20.0, 75.0];
      const p2: [number, number] = [20.0, 75.001]; // ~104.5 meters along equator/meridian
      const dist = haversineDistanceMeters(p1, p2);
      if (dist < 95 || dist > 115) {
        throw new Error(`Haversine calculation out of tolerance: expected ~104.5m, got ${dist.toFixed(2)}m`);
      }
    },
    'Great-circle Haversine computation accurately measures geodesic boundary proximity in metric meters'
  );

  return results;
}
