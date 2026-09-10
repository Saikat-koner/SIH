export type ParcelStatus = 'active' | 'in_review' | 'acquired' | 'disputed' | 'survey_pending';

export type ZoningCategory =
  | 'Agricultural'
  | 'Commercial'
  | 'Residential'
  | 'Industrial'
  | 'Conservation'
  | 'Mixed Use';

export interface LandParcel {
  id: string;
  title: string;
  parcelNumber: string;
  coordinates: [number, number][]; // [lat, lng] array forming polygon
  center: [number, number];
  areaHectares: number;
  areaAcres: number;
  status: ParcelStatus;
  zoning: ZoningCategory;
  owner: string;
  deedId: string;
  valuationUSD: number;
  soilType: string;
  surveyDate: string;
  surveyor: string;
  notes: string;
  attachmentsCount: number;
  complianceScore: number;
  disputeNotes?: string;
  syncStatus: 'synced' | 'pending_sync' | 'conflict';
  updatedAt: string;
}

export type MarkerType =
  | 'checkpoint'
  | 'borehole'
  | 'boundary_peg'
  | 'environmental'
  | 'site_office';

export interface FieldMarker {
  id: string;
  title: string;
  type: MarkerType;
  position: [number, number]; // [lat, lng]
  parcelId?: string;
  notes: string;
  status: 'verified' | 'flagged' | 'pending';
  elevationMeters: number;
  recordedAt: string;
  recordedBy: string;
}

export type UserRole = 'admin' | 'surveyor' | 'auditor' | 'viewer';
export type AuthRole = 'citizen' | 'admin' | 'surveyor' | 'auditor' | 'viewer';
export type PortalMode = 'home' | 'admin' | 'citizen';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AuthRole;
  roleTitle: string;
  organization: string;
  department?: string;
  state?: string;
  district?: string;
  village?: string;
  khasraNumber?: string;
  aadhaarMasked?: string;
  token?: string;
  avatar?: string;
}

export interface GrievanceRecord {
  id: string;
  parcelNumber: string;
  ownerName: string;
  category: 'boundary_dispute' | 'record_correction' | 'resurvey_request' | 'inheritance';
  title: string;
  description: string;
  citizenContact?: string | null;
  village?: string;
  submittedAt: string;
  status: 'submitted' | 'under_inspection' | 'hearing_scheduled' | 'resolved';
  assignedOfficer: string;
  slaDaysRemaining: number;
  resolutionNotes?: string | null;
}

export interface CompensationResult {
  areaHectares: number;
  areaSqm: number;
  circleRatePerSqm: number;
  baseLandValue: number;
  isRural: boolean;
  ruralMultiplyingFactor: number;
  adjustedLandValue: number;
  solatium100Percent: number;
  interest12Percent: number;
  assetsTotal: number;
  structureValue: number;
  treesAndCropsValue: number;
  rehabilitationGrant: number;
  totalStatutoryCompensation: number;
  currency: string;
  statutoryAct: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  organization: string;
  avatar: string;
}

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  parcelId?: string;
}

export interface OfflineSyncItem {
  id: string;
  action: 'create_parcel' | 'update_parcel' | 'add_marker' | 'field_survey' | 'resolve_dispute';
  entityType: 'parcel' | 'marker' | 'survey';
  entityId: string;
  summary: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'conflict';
  retryCount: number;
}

export type NetworkMode = 'online' | 'low_bandwidth' | 'offline';

export interface UnitTestResult {
  id: string;
  name: string;
  category: 'Spatial Geometry' | 'RBAC Permissions' | 'Offline Sync Engine' | 'GeoJSON Compliance' | 'Data Integrity';
  status: 'pass' | 'fail';
  durationMs: number;
  assertion: string;
  error?: string;
}

export interface MapLayerConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export type GeofenceBoundaryStatus = 'inside' | 'outside' | 'unknown';
export type GeofenceEventType = 'entered' | 'exited';

export interface GeofenceEvent {
  id: string;
  parcelId: string;
  parcelTitle: string;
  parcelNumber: string;
  type: GeofenceEventType;
  timestamp: string;
  coordinates: [number, number];
  accuracy: number;
  distanceMeters: number;
}

export interface GeofencePosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}
