import { AuthUser, GrievanceRecord, CompensationResult, LandParcel } from '../types';

export interface PlatformStats {
  totalParcels: number;
  totalHectares: number;
  verifiedTitles: number;
  activeDisputes: number;
  resolvedDisputes: number;
  activeSurveyorsOnline: number;
  villagesCoveredNational: number;
  propertyCardsGeneratedNational: number;
  corsStationsActive: number;
  dbtDisbursedCrores: number;
  systemUptime: string;
  lastUpdated: string;
}

export interface ParcelVerificationResult {
  verified: boolean;
  message?: string;
  parcel?: LandParcel;
  digitalSeal?: {
    sha256Hash: string;
    certifyingAuthority: string;
    verifiedAt: string;
    corsRtkAccuracy: string;
    statutoryScheme: string;
    tamperProofStatus: string;
    deedAuthenticity: string;
  };
}

/**
 * Calls backend to fetch available demo accounts.
 */
export async function fetchDemoUsers(): Promise<{ citizens: AuthUser[]; officers: AuthUser[] }> {
  try {
    const res = await fetch('/api/auth/demo-users');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Fallback demo users:', err);
    return {
      citizens: [
        {
          id: 'cit_001',
          name: 'Rameshwar K. Shinde',
          email: 'rameshwar.shinde@farmer.in',
          phone: '9876543210',
          role: 'citizen',
          roleTitle: 'Landowner & Agricultural Pattadar',
          organization: 'Gram Panchayat Haveli',
          state: 'Maharashtra',
          district: 'Pune',
          village: 'Haveli',
          khasraNumber: 'MH-PUN-HAV-2024-142B',
          aadhaarMasked: 'XXXX-XXXX-8921',
          token: 'tok_citizen_rameshwar',
        },
        {
          id: 'cit_002',
          name: 'Sunita Laxman Jadhav',
          email: 'sunita.jadhav@rural.in',
          phone: '9822012345',
          role: 'citizen',
          roleTitle: 'SVAMITVA Property Card Holder',
          organization: 'Gram Panchayat Haveli',
          state: 'Maharashtra',
          district: 'Pune',
          village: 'Haveli',
          khasraNumber: 'MH-PUN-SVAM-8812',
          aadhaarMasked: 'XXXX-XXXX-5510',
          token: 'tok_citizen_sunita',
        },
      ],
      officers: [
        {
          id: 'off_001',
          name: 'Suresh Deshmukh',
          email: 'suresh.deshmukh@rev.gov.in',
          phone: '9423001122',
          role: 'admin',
          roleTitle: 'Revenue Inspector (RI)',
          organization: 'Department of Revenue & Land Records',
          department: 'Tehsil Land Revenue Division',
          token: 'tok_admin_suresh',
        },
        {
          id: 'off_002',
          name: 'Dr. Ananya Sharma',
          email: 'ananya.sharma@soi.gov.in',
          phone: '9412004455',
          role: 'surveyor',
          roleTitle: 'Director of Geodetic Drone Operations',
          organization: 'Survey of India (SOI)',
          department: 'CORS Geodetic Control Wing',
          token: 'tok_surveyor_ananya',
        },
      ],
    };
  }
}

/**
 * Logs in a user (citizen or admin/officer).
 */
export async function loginUser(params: {
  identifier?: string;
  password?: string;
  role?: string;
  isDemo?: boolean;
  demoUserId?: string;
}): Promise<{ success: boolean; token: string; user: AuthUser; message: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  return data;
}

/**
 * Registers a new citizen or surveyor.
 */
export async function registerUser(params: {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  village?: string;
  district?: string;
  state?: string;
  khasraNumber?: string;
}): Promise<{ success: boolean; token: string; user: AuthUser; message: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
}

/**
 * Verifies the current session token with the backend.
 */
export async function getCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Fetches grievances from the backend.
 */
export async function fetchGrievances(filters?: { status?: string; parcelNumber?: string }): Promise<GrievanceRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.parcelNumber) params.append('parcelNumber', filters.parcelNumber);

    const res = await fetch(`/api/grievances?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.grievances || [];
  } catch (err) {
    console.warn('Failed to fetch grievances from backend:', err);
    return [];
  }
}

/**
 * Submits a new grievance.
 */
export async function submitGrievanceToBackend(payload: {
  parcelNumber: string;
  ownerName?: string;
  category: string;
  title: string;
  description: string;
  citizenContact?: string;
  village?: string;
}): Promise<{ success: boolean; grievance: GrievanceRecord; message: string }> {
  const res = await fetch('/api/grievances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to lodge grievance');
  }
  return data;
}

/**
 * Calculates statutory compensation under RFCTLARR Act 2013.
 */
export async function calculateCompensationOnBackend(params: {
  areaHectares: number;
  circleRatePerSqm: number;
  isRural: boolean;
  ruralMultiplier?: number;
  monthsElapsed?: number;
  structureValue?: number;
  treesAndCropsValue?: number;
  rehabilitationGrant?: number;
}): Promise<CompensationResult> {
  const res = await fetch('/api/compensation/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to compute compensation');
  }
  return data.breakdown;
}

/**
 * Cryptographically verifies parcel authenticity.
 */
export async function verifyParcelOnBackend(parcelNumber: string): Promise<ParcelVerificationResult> {
  const res = await fetch(`/api/parcels/verify/${encodeURIComponent(parcelNumber)}`);
  return await res.json();
}

/**
 * Submits an official citizen support / grievance inquiry ticket to the backend.
 */
export async function submitSupportTicket(payload: {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject?: string;
  message: string;
}): Promise<{ success: boolean; ticket: any; message: string }> {
  const res = await fetch('/api/support/ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to lodge support ticket');
  }
  return data;
}

/**
 * Queries the backend automated cadastral knowledge engine.
 */
export async function queryCadastralAssistant(query: string): Promise<{ reply: string; source?: string }> {
  try {
    const res = await fetch('/api/support/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      reply: 'For general inquiries, consult your local Tehsil Revenue Inspector or dial the National Land Governance Toll-Free Helpline at 1800-180-1551.',
    };
  }
}

/**
 * Searches parcels on backend by Khasra number, owner, village, or district.
 */
export async function searchKhasraOnBackend(query: string): Promise<LandParcel[]> {
  try {
    const res = await fetch(`/api/khasra/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

