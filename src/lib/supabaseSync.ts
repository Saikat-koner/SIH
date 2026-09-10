import { LandParcel } from '../types';

export interface BackendStatus {
  configured: boolean;
  supabaseConnected: boolean;
  supabaseHost: string | null;
  statusMessage: string;
  lastSyncTimestamp: string | null;
  lastSyncError: string | null;
  cachedCount: number;
  remoteRowCount: number | null;
}

/**
 * Checks the status of the backend and Supabase cloud database connection.
 */
export async function getBackendStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      supabaseConnected: false,
      supabaseHost: null,
      statusMessage: `Backend unavailable: ${err.message || 'Offline'}`,
      lastSyncTimestamp: null,
      lastSyncError: err.message,
      cachedCount: 0,
      remoteRowCount: null,
    };
  }
}

/**
 * Fetches all parcels from the backend (which reads from Supabase when connected).
 */
export async function fetchParcelsFromBackend(): Promise<{ parcels: LandParcel[]; source: string }> {
  try {
    const res = await fetch('/api/parcels');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      parcels: data.parcels || [],
      source: data.source || 'cache',
    };
  } catch (err) {
    console.warn('[Sync] Failed to fetch from backend, utilizing local state:', err);
    throw err;
  }
}

/**
 * Creates or inserts a parcel in backend & Supabase.
 */
export async function saveParcelToBackend(parcel: LandParcel): Promise<boolean> {
  try {
    const res = await fetch('/api/parcels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parcel),
    });
    return res.ok;
  } catch (err) {
    console.error('[Sync] Error saving parcel to backend:', err);
    return false;
  }
}

/**
 * Updates a parcel in backend & Supabase.
 */
export async function updateParcelOnBackend(id: string, updates: Partial<LandParcel>): Promise<boolean> {
  try {
    const res = await fetch(`/api/parcels/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err) {
    console.error('[Sync] Error updating parcel on backend:', err);
    return false;
  }
}

/**
 * Deletes a parcel from backend & Supabase.
 */
export async function deleteParcelFromBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/parcels/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('[Sync] Error deleting parcel on backend:', err);
    return false;
  }
}

/**
 * Performs a two-way sync between frontend parcels and Supabase cloud backend.
 */
export async function syncParcelsWithBackend(parcels: LandParcel[], forcePush = false): Promise<{
  success: boolean;
  syncedCount: number;
  parcels: LandParcel[];
  mode: string;
  message?: string;
}> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parcels, forcePush }),
    });
    const data = await res.json();
    return {
      success: data.success ?? false,
      syncedCount: data.syncedCount ?? 0,
      parcels: data.parcels || parcels,
      mode: data.mode || 'local',
      message: data.message || data.error,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      parcels,
      mode: 'offline',
      message: err.message,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Cadastral Land Registry Schema for Supabase
CREATE TABLE IF NOT EXISTS public.parcels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    parcel_number TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    zoning TEXT NOT NULL DEFAULT 'Agricultural',
    area_hectares NUMERIC NOT NULL DEFAULT 0,
    area_acres NUMERIC NOT NULL DEFAULT 0,
    valuation_usd NUMERIC NOT NULL DEFAULT 0,
    coordinates JSONB NOT NULL DEFAULT '[]'::jsonb,
    centroid JSONB NOT NULL DEFAULT '[0, 0]'::jsonb,
    last_survey_date TEXT,
    surveyor TEXT,
    notes TEXT,
    tax_compliance_status TEXT DEFAULT 'Compliant',
    soil_type TEXT DEFAULT 'Loamy',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access" ON public.parcels FOR ALL USING (true);
`;
