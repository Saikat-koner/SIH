import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns true if SUPABASE_URL and at least one API key are defined in the environment.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Lazy-initializes and returns the Supabase client.
 * Returns null safely if credentials have not been configured yet.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL!.trim();
    // Prefer service role key for backend operations if provided, else anon key
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!.trim();
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Converts a database row from the `parcels` table into the frontend `LandParcel` format.
 */
export function mapRowToParcel(row: any) {
  return {
    id: row.id,
    title: row.title || 'Untitled Parcel',
    parcelNumber: row.parcel_number || row.parcelNumber || '',
    coordinates: Array.isArray(row.coordinates) ? row.coordinates : [],
    center: Array.isArray(row.centroid) ? row.centroid : [0, 0],
    areaHectares: Number(row.area_hectares ?? row.areaHectares ?? 0),
    areaAcres: Number(row.area_acres ?? row.areaAcres ?? 0),
    status: row.status || 'active',
    zoning: row.zoning || 'Agricultural',
    owner: row.owner_name || row.owner || 'Unassigned',
    deedId: row.deed_id || row.deedId || 'DEED-PENDING',
    valuationUSD: Number(row.valuation_usd ?? row.valuationUSD ?? 0),
    soilType: row.soil_type || row.soilType || 'Loamy',
    surveyDate: row.last_survey_date || row.surveyDate || new Date().toISOString().split('T')[0],
    surveyor: row.surveyor || 'Cadastral Surveyor',
    notes: row.notes || '',
    attachmentsCount: Number(row.attachments_count ?? 0),
    complianceScore: Number(row.compliance_score ?? 95),
    disputeNotes: row.dispute_notes,
    syncStatus: 'synced' as const,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Converts frontend `LandParcel` into the database row format.
 */
export function mapParcelToRow(parcel: any) {
  return {
    id: parcel.id,
    title: parcel.title,
    parcel_number: parcel.parcelNumber,
    owner_name: parcel.owner,
    status: parcel.status,
    zoning: parcel.zoning,
    area_hectares: parcel.areaHectares,
    area_acres: parcel.areaAcres,
    valuation_usd: parcel.valuationUSD,
    coordinates: parcel.coordinates,
    centroid: parcel.center,
    last_survey_date: parcel.surveyDate,
    surveyor: parcel.surveyor,
    notes: parcel.notes,
    tax_compliance_status: parcel.taxComplianceStatus || 'Compliant',
    soil_type: parcel.soilType,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Attempts to load all parcels from Supabase.
 * Returns null if Supabase is unconfigured or table does not exist yet.
 */
export async function fetchParcelsFromSupabase(): Promise<{ data: any[] | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data, error } = await client
      .from('parcels')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data || []).map(mapRowToParcel), error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unknown Supabase connection error' };
  }
}

/**
 * Upserts an array of parcels into Supabase.
 */
export async function upsertParcelsToSupabase(parcels: any[]): Promise<{ count: number; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { count: 0, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const rows = parcels.map(mapParcelToRow);
    const { data, error } = await client
      .from('parcels')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: data ? data.length : rows.length, error: null };
  } catch (err: any) {
    return { count: 0, error: err.message || 'Error upserting parcels to Supabase' };
  }
}

/**
 * Deletes a parcel from Supabase by ID.
 */
export async function deleteParcelFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { error } = await client.from('parcels').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error deleting from Supabase' };
  }
}

/**
 * Logs a synchronization event into `sync_events` table (if table exists).
 */
export async function logSyncEvent(eventType: string, parcelId?: string, details?: any) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('sync_events').insert({
      event_type: eventType,
      parcel_id: parcelId,
      details: details || {},
      synced_by: 'GIS Backend Sync',
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-blocking telemetry
  }
}
